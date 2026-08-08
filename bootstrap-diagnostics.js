/* Compasso · Diagnóstico e coordenação resiliente do ciclo PWA */
(function (root) {
  const manifest = root.CompassoAppManifest;
  const entries = [];
  const started = new Map();
  const BUDGET_KEY = 'compasso.pwa.reload-budget.v1';
  const QUERY_TIMEOUT_MS = 5000;
  const allowedReasons = new Set(['first-visit', 'raw-recovery', 'controller-change', 'update', 'shell-reset']);
  let current = 'document';
  let state = 'booting';
  let coherent = false;
  let startPromise = null;
  let reloadInFlight = false;
  let controllerListenerInstalled = false;
  let updateAttempt = null;
  let resetInProgress = false;
  let lastReason = 'raw-recovery';
  let resetOpener = null;
  let sequence = 0;
  const memoryBudget = {};

  const now = () => new Date().toISOString();
  const clean = (value) => String(value || '').replace(/[<>&]/g, '').slice(0, 240);
  const expectedGeneration = () => String(manifest?.cacheName || '');
  const documentGeneration = () => root.document?.querySelector?.('meta[name="compasso-application-generation"][data-composition="complete"]')?.content || '';

  function record(type, details = {}) {
    const entry = {
      type,
      module: details.module || current,
      message: String(details.message || '').slice(0, 240),
      at: now(),
    };
    entries.push(entry);
    if (entries.length > 50) entries.shift();
    return entry;
  }

  function elements() {
    const document = root.document;
    return {
      shell: document?.querySelector?.('.app-shell'),
      bootstrap: document?.getElementById?.('compassoBootstrap'),
      title: document?.getElementById?.('compassoBootstrapTitle'),
      status: document?.getElementById?.('compassoBootstrapStatus'),
      detail: document?.getElementById?.('compassoBootstrapDetail'),
      retry: document?.getElementById?.('compassoBootstrapRetry'),
      reset: document?.getElementById?.('compassoBootstrapReset'),
      updateStatus: document?.getElementById?.('compassoUpdateStatus'),
      resetDialog: document?.getElementById?.('compassoShellResetDialog'),
      resetStatus: document?.getElementById?.('compassoShellResetStatus'),
      resetCancel: document?.getElementById?.('compassoShellResetCancel'),
      resetConfirm: document?.getElementById?.('compassoShellResetConfirm'),
    };
  }

  function publishState(next, message, detail = '', options = {}) {
    state = next;
    if (root.document?.documentElement) root.document.documentElement.dataset.pwaState = next;
    const ui = elements();
    if (coherent && options.update !== false) {
      if (ui.updateStatus) ui.updateStatus.textContent = message || '';
      if (message) root.CompassoDesignSystem?.toast?.(message, options.failure ? 'error' : 'neutral') || root.showToast?.(message);
    } else if (ui.bootstrap) {
      ui.bootstrap.hidden = false;
      ui.bootstrap.setAttribute('role', options.failure ? 'alert' : 'status');
      if (ui.status) ui.status.textContent = message || '';
      if (ui.detail) ui.detail.textContent = detail || '';
      if (ui.retry) ui.retry.hidden = !options.retry;
      if (ui.reset) ui.reset.hidden = !options.reset;
    }
    record(`lifecycle:${next}`, { message: detail || message });
  }

  function revealApplication(generation) {
    const ui = elements();
    coherent = true;
    state = 'coherent';
    if (root.document?.documentElement) root.document.documentElement.dataset.pwaState = state;
    clearBudgetForGeneration(generation);
    if (ui.shell) {
      ui.shell.hidden = false;
      ui.shell.inert = false;
      ui.shell.removeAttribute('inert');
      ui.shell.removeAttribute('aria-hidden');
    }
    if (ui.bootstrap) ui.bootstrap.hidden = true;
    record('lifecycle:coherent', { message: generation });
  }

  function readBudget() {
    try {
      const value = JSON.parse(root.sessionStorage?.getItem?.(BUDGET_KEY) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
      return { ...memoryBudget };
    }
  }

  function writeBudget(value) {
    Object.keys(memoryBudget).forEach((key) => delete memoryBudget[key]);
    Object.assign(memoryBudget, value);
    try {
      if (!root.sessionStorage?.setItem || !root.sessionStorage?.getItem) return false;
      root.sessionStorage.setItem(BUDGET_KEY, JSON.stringify(value));
      return root.sessionStorage.getItem(BUDGET_KEY) === JSON.stringify(value);
    } catch {
      return false;
    }
  }

  function attemptKey(generation, reason) {
    const safeReason = allowedReasons.has(reason) ? reason : 'raw-recovery';
    return `${generation}|${safeReason}|${root.location?.pathname || '/'}`;
  }

  function clearBudget(generation, reason) {
    const budget = readBudget();
    delete budget[attemptKey(generation, reason)];
    writeBudget(budget);
  }

  function clearBudgetForGeneration(generation) {
    const budget = readBudget();
    const pathSuffix = `|${root.location?.pathname || '/'}`;
    for (const key of Object.keys(budget)) {
      if (key.startsWith(`${generation}|`) && key.endsWith(pathSuffix)) delete budget[key];
    }
    writeBudget(budget);
  }

  function requestReload(reason, generation = expectedGeneration()) {
    lastReason = allowedReasons.has(reason) ? reason : 'raw-recovery';
    const key = attemptKey(generation, lastReason);
    const budget = readBudget();
    if (reloadInFlight) return false;
    if (budget[key]) {
      publishState(
        'budget-exhausted',
        'Não foi possível concluir a atualização automaticamente.',
        'Tente novamente quando estiver pronto. Seus dados permanecem preservados.',
        { failure: true, retry: true, reset: true },
      );
      return false;
    }
    budget[key] = 1;
    if (!writeBudget(budget)) {
      publishState(
        'budget-exhausted',
        'A atualização automática foi interrompida com segurança.',
        'O navegador não permitiu registrar o limite de recarga. Use Tentar novamente.',
        { failure: true, retry: true, reset: false },
      );
      return false;
    }
    reloadInFlight = true;
    publishState('reload-requested', 'Concluindo a preparação do Compasso.', 'A página será aberta novamente uma única vez.');
    root.location?.reload?.();
    return true;
  }

  function queryGeneration(worker, timeout = QUERY_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      if (!worker?.postMessage || typeof root.MessageChannel !== 'function') {
        reject(new Error('controller-unavailable'));
        return;
      }
      const requestId = root.crypto?.randomUUID?.() || `compasso-${Date.now()}-${++sequence}`;
      const channel = new root.MessageChannel();
      let settled = false;
      const timer = root.setTimeout?.(() => {
        if (settled) return;
        settled = true;
        channel.port1?.close?.();
        reject(new Error('controller-query-timeout'));
      }, timeout);
      channel.port1.onmessage = (event) => {
        const response = event.data;
        if (
          settled ||
          response?.type !== 'compasso:generation:response' ||
          response.requestId !== requestId ||
          !response.generation
        ) return;
        settled = true;
        root.clearTimeout?.(timer);
        channel.port1?.close?.();
        resolve(String(response.generation));
      };
      try {
        worker.postMessage({ type: 'compasso:generation:query', requestId }, [channel.port2]);
      } catch (error) {
        settled = true;
        root.clearTimeout?.(timer);
        reject(error);
      }
    });
  }

  function waitForState(worker, registration) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        root.clearTimeout?.(timer);
        worker?.removeEventListener?.('statechange', inspect);
        callback(value);
      };
      const inspect = () => {
        publishState(`update-${worker.state || 'installing'}`, `Atualização: ${worker.state || 'preparando'}.`, '', { update: true });
        if (worker.state === 'redundant') finish(reject, new Error('install-failed'));
        else if (worker.state === 'activated') finish(resolve, registration.active || worker);
      };
      const timer = root.setTimeout?.(() => finish(reject, new Error('activation-timeout')), QUERY_TIMEOUT_MS);
      worker?.addEventListener?.('statechange', inspect);
      inspect();
    });
  }

  function waitForController(worker) {
    if (root.navigator?.serviceWorker?.controller === worker) return Promise.resolve(worker);
    return new Promise((resolve, reject) => {
      const serviceWorker = root.navigator?.serviceWorker;
      const finish = (callback, value) => {
        root.clearTimeout?.(timer);
        serviceWorker?.removeEventListener?.('controllerchange', inspect);
        callback(value);
      };
      const inspect = () => {
        if (serviceWorker?.controller === worker) finish(resolve, worker);
      };
      const timer = root.setTimeout?.(() => finish(reject, new Error('controller-claim-timeout')), QUERY_TIMEOUT_MS);
      serviceWorker?.addEventListener?.('controllerchange', inspect);
      inspect();
    });
  }

  async function registrationForCurrentGeneration(forceFresh = false) {
    if (!root.navigator?.serviceWorker || !/^https?:$/.test(root.location?.protocol || '')) {
      throw new Error('service-worker-unavailable');
    }
    const recoveryQuery = forceFresh ? `&recovery=${Date.now()}` : '';
    const workerUrl = `./service-worker.js?version=${encodeURIComponent(expectedGeneration())}${recoveryQuery}`;
    return root.navigator.serviceWorker.register(workerUrl);
  }

  async function handleControllerGeneration(generation, reason) {
    const documentValue = documentGeneration();
    if (documentValue && documentValue === generation && generation === expectedGeneration()) {
      revealApplication(generation);
      if (updateAttempt) {
        updateAttempt.resolve?.({ updated: generation !== updateAttempt.before, generation, reloads: 0 });
        updateAttempt = null;
      }
      return true;
    }
    const selectedReason = reason || (updateAttempt ? 'update' : documentValue ? 'controller-change' : 'first-visit');
    const navigated = requestReload(selectedReason, generation);
    if (updateAttempt) {
      updateAttempt.resolve?.({ updated: navigated, generation, reloads: navigated ? 1 : 0, exhausted: !navigated });
      updateAttempt = null;
    }
    return false;
  }

  async function onControllerChange() {
    try {
      const controller = root.navigator?.serviceWorker?.controller;
      const generation = await queryGeneration(controller);
      await handleControllerGeneration(generation, resetInProgress ? 'shell-reset' : updateAttempt ? 'update' : undefined);
    } catch (error) {
      const entry = record('controller-query-failed', { message: error.message });
      if (coherent) publishState('failure', 'A atualização não pôde ser concluída.', 'O Compasso atual continua disponível. Tente novamente.', { failure: true, update: true });
      else show(entry, { retry: true, reset: true });
      updateAttempt?.resolve?.({ updated: false, error: error.message, reloads: 0 });
      updateAttempt = null;
    }
  }

  function installControllerListener() {
    if (controllerListenerInstalled || !root.navigator?.serviceWorker?.addEventListener) return;
    controllerListenerInstalled = true;
    root.navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  }

  async function converge() {
    installControllerListener();
    const marker = documentGeneration();
    const controller = root.navigator?.serviceWorker?.controller;
    if (marker && controller) {
      publishState('checking', 'Confirmando a versão atual do Compasso.');
      const generation = await queryGeneration(controller);
      if (marker === generation && generation === expectedGeneration()) {
        revealApplication(generation);
        return { coherent: true, generation, reloads: 0 };
      }
      handleControllerGeneration(generation, 'controller-change');
      return { coherent: false, generation, reloads: 1 };
    }

    publishState('registering', 'Preparando o aplicativo offline.', 'A primeira abertura pode atualizar a página uma vez.');
    const existing = await root.navigator?.serviceWorker?.getRegistration?.();
    const reason = existing ? 'raw-recovery' : 'first-visit';
    lastReason = reason;
    const registration = existing || await registrationForCurrentGeneration();
    let worker = registration.installing || registration.waiting || registration.active;
    if (!worker) {
      registration.addEventListener?.('updatefound', () => {
        if (registration.installing) publishState('installing', 'Instalando a versão atual do Compasso.');
      }, { once: true });
      worker = (await registrationForCurrentGeneration()).installing || registration.waiting || registration.active;
    }
    if (worker && worker.state && worker.state !== 'activated') {
      publishState('installing', 'Instalando a versão atual do Compasso.');
      worker = await waitForState(worker, registration);
    }
    const active = registration.active || worker || root.navigator.serviceWorker.controller;
    if (!active) throw new Error('active-worker-unavailable');
    publishState('awaiting-controller', 'Ativando a versão atual do Compasso.');
    let generation = await queryGeneration(active);
    if (generation !== expectedGeneration()) {
      if (root.navigator?.onLine === false) throw new Error('stale-worker-offline');
      const currentRegistration = await registrationForCurrentGeneration();
      let replacement = currentRegistration.installing || currentRegistration.waiting;
      if (replacement?.state && replacement.state !== 'activated') replacement = await waitForState(replacement, currentRegistration);
      const currentWorker = currentRegistration.active || replacement || root.navigator.serviceWorker.controller;
      if (!currentWorker) throw new Error('current-worker-unavailable');
      generation = await queryGeneration(currentWorker);
      if (generation !== expectedGeneration()) throw new Error('stale-controller');
    }
    if (root.navigator.serviceWorker.controller) {
      await handleControllerGeneration(generation, reason);
    } else {
      requestReload(reason, generation);
    }
    return { coherent: false, generation, reloads: 1 };
  }

  async function start() {
    if (startPromise) return startPromise;
    startPromise = converge().catch((error) => {
      const entry = record('bootstrap-failed', { message: error.message });
      show(entry, { retry: true, reset: true });
      return { coherent: false, error: error.message, reloads: 0 };
    });
    return startPromise;
  }

  async function retry() {
    clearBudget(expectedGeneration(), lastReason);
    reloadInFlight = false;
    startPromise = null;
    publishState('retrying', 'Tentando preparar o Compasso novamente.', 'Nenhum dado local será apagado.');
    return start();
  }

  async function checkForUpdate(button) {
    if (updateAttempt) return updateAttempt.promise;
    if (!root.navigator?.serviceWorker) throw new Error('service-worker-unavailable');
    if (button) {
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
    }
    publishState('checking-update', 'Verificando atualização do Compasso.', '', { update: true });
    let resolveAttempt;
    let rejectAttempt;
    const promise = new Promise((resolve, reject) => { resolveAttempt = resolve; rejectAttempt = reject; });
    updateAttempt = { promise, resolve: resolveAttempt, reject: rejectAttempt, before: '', candidate: null };
    try {
      const registration = await root.navigator.serviceWorker.getRegistration() || await registrationForCurrentGeneration();
      updateAttempt.before = await queryGeneration(root.navigator.serviceWorker.controller || registration.active);
      const onUpdateFound = () => { updateAttempt && (updateAttempt.candidate = registration.installing); };
      registration.addEventListener?.('updatefound', onUpdateFound);
      await registration.update();
      const candidate = updateAttempt?.candidate || registration.installing;
      registration.removeEventListener?.('updatefound', onUpdateFound);
      if (!candidate) {
        const currentGeneration = await queryGeneration(root.navigator.serviceWorker.controller || registration.active);
        publishState('coherent', 'O Compasso está atualizado.', currentGeneration, { update: true });
        const result = { updated: false, generation: currentGeneration, reloads: 0 };
        updateAttempt.resolve(result);
        updateAttempt = null;
        return result;
      }
      updateAttempt.candidate = candidate;
      publishState('update-installing', 'Instalando a atualização do Compasso.', '', { update: true });
      const active = await waitForState(candidate, registration);
      const generation = await queryGeneration(root.navigator.serviceWorker.controller || active);
      await handleControllerGeneration(generation, 'update');
      return promise;
    } catch (error) {
      publishState('update-failed', 'Não foi possível atualizar agora.', 'O Compasso atual continua disponível. Tente novamente.', { failure: true, update: true });
      const result = { updated: false, error: error.message, reloads: 0 };
      updateAttempt?.resolve?.(result);
      updateAttempt = null;
      return result;
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute('aria-busy');
      }
    }
  }

  function openResetDialog(opener) {
    const ui = elements();
    if (!ui.resetDialog?.showModal) return;
    resetOpener = opener || root.document?.activeElement;
    if (ui.resetStatus) ui.resetStatus.textContent = '';
    ui.resetDialog.showModal();
    root.requestAnimationFrame?.(() => ui.resetCancel?.focus());
  }

  async function resetShell() {
    const ui = elements();
    if (root.navigator?.onLine === false) {
      if (ui.resetStatus) ui.resetStatus.textContent = 'Conecte-se à internet para substituir o aplicativo offline.';
      return { ok: false, code: 'offline' };
    }
    resetInProgress = true;
    if (ui.resetConfirm) ui.resetConfirm.disabled = true;
    if (ui.resetStatus) ui.resetStatus.textContent = 'Redefinindo somente o aplicativo offline…';
    try {
      const scope = new URL('.', root.location.href).href;
      const registrations = await root.navigator.serviceWorker.getRegistrations();
      const registrationResults = await Promise.allSettled(
        registrations.filter((registration) => registration.scope === scope).map((registration) => registration.unregister()),
      );
      const keys = await root.caches.keys();
      const cacheResults = await Promise.allSettled(
        keys.filter((key) => manifest.isOwnedCacheName(key)).map((key) => root.caches.delete(key)),
      );
      if ([...registrationResults, ...cacheResults].some((result) => result.status === 'rejected' || result.value === false)) {
        throw new Error('reset-partial-failure');
      }
      const registration = await registrationForCurrentGeneration(true);
      let worker = registration.installing || registration.waiting || registration.active;
      if (worker?.state && worker.state !== 'activated') worker = await waitForState(worker, registration);
      const activeWorker = registration.active || worker;
      const generation = await queryGeneration(activeWorker);
      await waitForController(activeWorker);
      ui.resetDialog?.close?.('confirmed');
      requestReload('shell-reset', generation);
      return { ok: true, generation };
    } catch (error) {
      resetInProgress = false;
      if (ui.resetStatus) ui.resetStatus.textContent = 'A redefinição não foi concluída. Seus dados locais permanecem preservados.';
      record('reset-partial-failure', { message: error.message });
      return { ok: false, code: 'reset-partial-failure' };
    } finally {
      if (ui.resetConfirm) ui.resetConfirm.disabled = false;
    }
  }

  function bindUi() {
    const ui = elements();
    ui.retry?.addEventListener('click', () => retry());
    ui.reset?.addEventListener('click', (event) => openResetDialog(event.currentTarget));
    ui.resetConfirm?.addEventListener('click', () => resetShell());
    ui.resetDialog?.addEventListener('close', () => {
      const opener = resetOpener;
      resetOpener = null;
      opener?.focus?.();
    });
  }

  function show(entry, options = {}) {
    const message = entry?.message || 'Falha desconhecida';
    if (!root.document?.body) return;
    if (!coherent) {
      publishState(
        'failure',
        'O Compasso encontrou uma falha ao iniciar.',
        `Detalhe: ${clean(message)}`,
        { failure: true, retry: options.retry !== false, reset: options.reset !== false },
      );
      elements().title?.focus?.();
      return;
    }
    if (root.document.getElementById('compassoBootstrapAlert')) return;
    const box = root.document.createElement('aside');
    box.id = 'compassoBootstrapAlert';
    box.className = 'compasso-bootstrap-alert';
    box.setAttribute('role', 'alert');
    const title = root.document.createElement('strong');
    const detail = root.document.createElement('span');
    const button = root.document.createElement('button');
    title.textContent = 'O Compasso encontrou uma falha.';
    detail.textContent = `Detalhe: ${clean(message)}`;
    button.type = 'button';
    button.textContent = 'Tentar novamente';
    button.addEventListener('click', () => retry());
    box.append(title, detail, button);
    root.document.body.prepend(box);
  }

  function diagnosticStart(module) {
    current = module;
    started.set(module, Date.now());
  }

  function done(module) {
    record('module:ready', { module, message: `${Math.max(0, Date.now() - (started.get(module) || Date.now()))}ms` });
    current = 'bootstrap';
  }

  function fail(module, error) {
    const entry = record('error', { module, message: error?.message || error });
    show(entry, { retry: true, reset: false });
    return entry;
  }

  root.addEventListener?.('error', (event) => show(record('error', { message: event.message }), { retry: true, reset: false }));
  root.addEventListener?.('unhandledrejection', (event) => show(record('rejection', { message: event.reason?.message || event.reason }), { retry: true, reset: false }));

  root.CompassoBootstrapDiagnostic = Object.freeze({
    start: diagnosticStart,
    done,
    fail,
    recover: retry,
    record,
    report: () => entries.map((item) => ({ ...item })),
    get currentModule() { return current; },
  });
  root.CompassoPwaLifecycle = Object.freeze({
    start,
    retry,
    checkForUpdate,
    queryGeneration,
    requestReload,
    openResetDialog,
    resetShell,
    snapshot: () => ({ state, coherent, generation: documentGeneration(), reloadInFlight, updateActive: Boolean(updateAttempt), resetInProgress }),
  });

  const initialize = () => {
    bindUi();
    start();
    root.setTimeout?.(() => {
      if (documentGeneration() && !root.CompassoFeatures?.installed) {
        show(record('bootstrap:timeout', { message: 'runtime não instalado' }), { retry: true, reset: false });
      }
    }, QUERY_TIMEOUT_MS);
  };
  if (root.document?.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else if (root.queueMicrotask) root.queueMicrotask(initialize);
  else initialize();
})(globalThis);
