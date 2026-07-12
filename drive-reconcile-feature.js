/* Compasso · Conciliacao visual do Google Drive
 * Fase 3.4: compara local/remoto, evidencia conflitos e permite
 * escolher local, remoto ou mescla automatica.
 */

const DRIVE_RECONCILE_VERSION = 1;
const reconcileRuntime = { remoteFile: null, remoteData: null, analysis: null, loading: false };

function reconcileCollections(localData, remoteData) {
  return [...new Set([
    ...Object.keys(localData || {}).filter(key => Array.isArray(localData[key])),
    ...Object.keys(remoteData || {}).filter(key => Array.isArray(remoteData[key]))
  ])].sort();
}

function reconcileTitle(collection, record) {
  if (!record) return 'Registro removido';
  return record.title || record.summary || record.prompt || record.name || record.id || collection;
}

function reconcileUpdated(record) {
  return String(record?.updatedAt || record?.updated || record?.lastReviewedAt || record?.createdAt || '');
}

function reconcileRecordStatus(collection, id, localRecord, remoteRecord, localData, remoteData) {
  const localDeleted = localData._sync?.tombstones?.[syncRecordKey(collection, id)] || '';
  const remoteDeleted = remoteData._sync?.tombstones?.[syncRecordKey(collection, id)] || '';
  if (localDeleted && !remoteRecord) return 'local-delete';
  if (remoteDeleted && !localRecord) return 'remote-delete';
  if (localRecord && !remoteRecord) return 'local-only';
  if (!localRecord && remoteRecord) return 'remote-only';
  if (!localRecord || !remoteRecord) return 'unknown';
  if (syncFingerprint(localRecord) === syncFingerprint(remoteRecord)) return 'same';
  const localAt = reconcileUpdated(localRecord);
  const remoteAt = reconcileUpdated(remoteRecord);
  if (localAt && remoteAt && localAt !== remoteAt) return localAt > remoteAt ? 'local-newer' : 'remote-newer';
  return 'conflict';
}

function analyzeDriveReconciliation(localData, remoteData) {
  const local = ensureSyncMetadata(syncClone(localData));
  const remote = ensureSyncMetadata(syncClone(remoteData));
  const rows = [];
  const counts = { same: 0, localOnly: 0, remoteOnly: 0, localNewer: 0, remoteNewer: 0, conflicts: 0, deletes: 0 };
  reconcileCollections(local, remote).forEach(collection => {
    const localById = new Map((local[collection] || []).map(record => [record.id, record]));
    const remoteById = new Map((remote[collection] || []).map(record => [record.id, record]));
    const ids = new Set([
      ...localById.keys(),
      ...remoteById.keys(),
      ...Object.keys(local._sync?.tombstones || {}).filter(key => key.startsWith(`${collection}:`)).map(key => key.slice(collection.length + 1)),
      ...Object.keys(remote._sync?.tombstones || {}).filter(key => key.startsWith(`${collection}:`)).map(key => key.slice(collection.length + 1))
    ]);
    ids.forEach(id => {
      const localRecord = localById.get(id);
      const remoteRecord = remoteById.get(id);
      const status = reconcileRecordStatus(collection, id, localRecord, remoteRecord, local, remote);
      if (status === 'same' || status === 'unknown') {
        counts.same += status === 'same' ? 1 : 0;
        return;
      }
      if (status === 'local-only') counts.localOnly += 1;
      if (status === 'remote-only') counts.remoteOnly += 1;
      if (status === 'local-newer') counts.localNewer += 1;
      if (status === 'remote-newer') counts.remoteNewer += 1;
      if (status === 'conflict') counts.conflicts += 1;
      if (status.endsWith('delete')) counts.deletes += 1;
      rows.push({
        collection,
        id,
        status,
        title: reconcileTitle(collection, localRecord || remoteRecord),
        localAt: reconcileUpdated(localRecord),
        remoteAt: reconcileUpdated(remoteRecord)
      });
    });
  });
  const totalChanges = rows.length;
  return {
    local,
    remote,
    rows: rows.sort((a, b) => a.collection.localeCompare(b.collection) || a.title.localeCompare(b.title, 'pt-BR')),
    counts,
    totalChanges,
    hasConflicts: counts.conflicts > 0 || counts.localNewer + counts.remoteNewer > 0
  };
}

function reconcileStatusLabel(status) {
  return {
    'local-only': 'Somente local',
    'remote-only': 'Somente Drive',
    'local-newer': 'Local mais recente',
    'remote-newer': 'Drive mais recente',
    conflict: 'Conflito',
    'local-delete': 'Excluido localmente',
    'remote-delete': 'Excluido no Drive'
  }[status] || status;
}

function renderDriveReconcileDialog() {
  const dialog = document.getElementById('driveReconcileDialog');
  const body = document.getElementById('driveReconcileBody');
  if (!dialog || !body) return;
  const analysis = reconcileRuntime.analysis;
  if (reconcileRuntime.loading) {
    body.innerHTML = '<div class="drive-reconcile-empty">Comparando dados locais e Google Drive...</div>';
    return;
  }
  if (!analysis) {
    body.innerHTML = '<div class="drive-reconcile-empty">Clique em analisar para buscar o arquivo remoto e comparar antes de sincronizar.</div>';
    return;
  }
  const c = analysis.counts;
  body.innerHTML = `
    <div class="drive-reconcile-summary">
      <div><strong>${analysis.totalChanges}</strong><span>diferenças</span></div>
      <div><strong>${c.localOnly}</strong><span>só local</span></div>
      <div><strong>${c.remoteOnly}</strong><span>só Drive</span></div>
      <div><strong>${c.localNewer + c.remoteNewer + c.conflicts}</strong><span>conflitos</span></div>
    </div>
    ${analysis.rows.length ? `<div class="drive-reconcile-list">${analysis.rows.slice(0, 80).map(row => `
      <article class="drive-reconcile-row ${row.status}">
        <div><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.collection)} · ${escapeHtml(row.id)}</span></div>
        <div><b>${escapeHtml(reconcileStatusLabel(row.status))}</b><small>Local: ${escapeHtml(row.localAt || '-')}<br>Drive: ${escapeHtml(row.remoteAt || '-')}</small></div>
      </article>`).join('')}</div>` : '<div class="drive-reconcile-empty">Local e Drive já estão equivalentes.</div>'}
  `;
}

async function openDriveReconciliation() {
  if (!isDriveConnected()) {
    showToast('Conecte o Google Drive antes de conciliar');
    return;
  }
  reconcileRuntime.loading = true;
  reconcileRuntime.analysis = null;
  document.getElementById('driveReconcileDialog')?.showModal();
  renderDriveReconcileDialog();
  try {
    ensureSyncMetadata(state.data, true);
    const file = await findDriveSyncFile();
    reconcileRuntime.remoteFile = file || null;
    reconcileRuntime.remoteData = file ? await downloadDriveSyncFile(file.id) : null;
    reconcileRuntime.analysis = analyzeDriveReconciliation(state.data, reconcileRuntime.remoteData || { ...syncClone(state.data), _sync: { schemaVersion: 1, tombstones: {}, updatedAt: '' } });
    if (!file) {
      reconcileRuntime.analysis.rows.unshift({ collection: 'drive', id: 'compasso-sync.json', status: 'local-only', title: 'Arquivo ainda nao existe no Drive', localAt: state.data._sync?.updatedAt || '', remoteAt: '' });
      reconcileRuntime.analysis.counts.localOnly += 1;
      reconcileRuntime.analysis.totalChanges = reconcileRuntime.analysis.rows.length;
    }
  } catch (error) {
    driveSyncState.lastError = friendlyDriveError(error);
    showToast('Não foi possível comparar com o Drive');
  } finally {
    reconcileRuntime.loading = false;
    renderDriveReconcileDialog();
    renderDriveSyncPanel();
  }
}

async function applyDriveReconciliation(strategy) {
  if (!isDriveConnected() || !reconcileRuntime.analysis) return;
  reconcileRuntime.loading = true;
  renderDriveReconcileDialog();
  try {
    let next;
    if (strategy === 'local') next = ensureSyncMetadata(syncClone(state.data), true);
    if (strategy === 'remote') next = ensureSyncMetadata(syncClone(reconcileRuntime.remoteData || state.data));
    if (strategy === 'merge') next = mergeSyncData(state.data, reconcileRuntime.remoteData || state.data);
    state.data = normalizeData(next);
    ensureSyncMetadata(state.data);
    await uploadDriveSyncFile(state.data, reconcileRuntime.remoteFile?.id || '');
    window.CompassoStorage.save(STORAGE_KEY, state.data);
    driveSyncState.lastSyncAt = syncNowIso();
    reconcileRuntime.analysis = null;
    document.getElementById('driveReconcileDialog')?.close();
    renderAll();
    showToast(strategy === 'remote' ? 'Versão do Drive aplicada' : strategy === 'local' ? 'Versão local enviada ao Drive' : 'Mescla aplicada e enviada ao Drive');
  } catch (error) {
    driveSyncState.lastError = friendlyDriveError(error);
    showToast('Não foi possível aplicar a conciliação');
  } finally {
    reconcileRuntime.loading = false;
    renderDriveSyncPanel();
  }
}

function installDriveReconcileStyles() {
  if (document.getElementById('driveReconcileStyles')) return;
  const style = document.createElement('style');
  style.id = 'driveReconcileStyles';
  style.textContent = `
    #driveReconcileDialog{width:min(860px,calc(100vw - 28px));border:0;border-radius:20px;padding:0;background:var(--surface-strong);color:var(--ink);box-shadow:0 28px 90px rgba(24,23,19,.28)}#driveReconcileDialog::backdrop{background:rgba(31,30,27,.58);backdrop-filter:blur(5px)}
    .drive-reconcile-head{padding:21px 23px 15px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:16px}.drive-reconcile-head h2{margin:4px 0 0;font:800 20px/1.2 Manrope,sans-serif}.drive-reconcile-head p{margin:7px 0 0;color:var(--muted);font-size:11px;line-height:1.55;max-width:620px}
    .drive-reconcile-body{padding:20px 23px;display:grid;gap:14px}.drive-reconcile-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.drive-reconcile-summary div{background:#f5f4ef;border:1px solid var(--line);border-radius:12px;padding:12px}.drive-reconcile-summary strong{display:block;font:800 20px Manrope,sans-serif}.drive-reconcile-summary span{color:var(--muted);font-size:9px}
    .drive-reconcile-list{display:grid;gap:8px;max-height:min(420px,48vh);overflow:auto;padding-right:3px}.drive-reconcile-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(150px,.42fr);gap:12px;border:1px solid var(--line);border-radius:12px;padding:12px;background:#fff}.drive-reconcile-row strong{display:block;font-size:12px;line-height:1.35}.drive-reconcile-row span,.drive-reconcile-row small{display:block;color:var(--muted);font-size:9px;margin-top:4px;overflow-wrap:anywhere}.drive-reconcile-row b{display:block;font-size:10px;color:var(--violet)}.drive-reconcile-row.conflict b,.drive-reconcile-row.local-newer b,.drive-reconcile-row.remote-newer b{color:var(--orange)}.drive-reconcile-row.local-delete b,.drive-reconcile-row.remote-delete b{color:var(--red)}
    .drive-reconcile-empty{border:1px dashed var(--line);border-radius:13px;padding:32px;text-align:center;color:var(--muted);font-size:11px}.drive-reconcile-foot{padding:15px 23px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px}.drive-reconcile-foot .right{display:flex;gap:8px;flex-wrap:wrap}.drive-reconcile-foot button{justify-content:center}
    @media(max-width:680px){.drive-reconcile-head,.drive-reconcile-body,.drive-reconcile-foot{padding-left:16px;padding-right:16px}.drive-reconcile-summary{grid-template-columns:repeat(2,1fr)}.drive-reconcile-row{grid-template-columns:1fr}.drive-reconcile-foot{align-items:stretch;flex-direction:column}.drive-reconcile-foot .right{display:grid;grid-template-columns:1fr}.drive-reconcile-foot button{width:100%}}
  `;
  document.head.appendChild(style);
}

function installDriveReconcileUi() {
  const syncBtn = document.getElementById('driveSyncBtn');
  if (syncBtn && !document.getElementById('driveReconcileBtn')) {
    syncBtn.insertAdjacentHTML('afterend', `<button type="button" id="driveReconcileBtn" ${isDriveConnected() ? '' : 'disabled'}>Conciliar dados</button>`);
    document.getElementById('driveReconcileBtn')?.addEventListener('click', openDriveReconciliation);
  }
  const btn = document.getElementById('driveReconcileBtn');
  if (btn) btn.disabled = !isDriveConnected() || driveSyncState.syncing || reconcileRuntime.loading;
  if (!document.getElementById('driveReconcileDialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="driveReconcileDialog">
        <div class="drive-reconcile-head"><div><div class="eyebrow">Google Drive</div><h2>Conciliar dados</h2><p>Compare o que existe neste dispositivo com o arquivo do Drive antes de decidir qual versão aplicar.</p></div><button class="close-btn" type="button" data-drive-reconcile-close>${icon('x')}</button></div>
        <div class="drive-reconcile-body" id="driveReconcileBody"></div>
        <div class="drive-reconcile-foot"><button class="quiet-btn" type="button" data-drive-reconcile-refresh>Analisar novamente</button><div class="right"><button class="secondary-btn" type="button" data-drive-resolve="remote">Usar Drive</button><button class="secondary-btn" type="button" data-drive-resolve="local">Usar local</button><button class="primary-btn" type="button" data-drive-resolve="merge">${icon('check')}Mesclar</button></div></div>
      </dialog>`);
    renderDriveReconcileDialog();
  }
}

const renderDriveSyncPanelWithoutReconcile = renderDriveSyncPanel;
renderDriveSyncPanel = function() {
  renderDriveSyncPanelWithoutReconcile();
  installDriveReconcileUi();
};

installDriveReconcileStyles();
installDriveReconcileUi();
renderDriveSyncPanel();

document.addEventListener('click', event => {
  if (event.target.closest('[data-drive-reconcile-close]')) document.getElementById('driveReconcileDialog')?.close();
  if (event.target.closest('[data-drive-reconcile-refresh]')) openDriveReconciliation();
  const resolve = event.target.closest('[data-drive-resolve]')?.dataset.driveResolve;
  if (resolve) applyDriveReconciliation(resolve);
});

document.getElementById('driveReconcileDialog')?.addEventListener('click', event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
