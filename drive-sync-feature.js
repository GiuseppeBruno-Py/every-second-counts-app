/* Compasso · OAuth Google Drive e base de sincronização */
const COMPASSO_GOOGLE_CLIENT_ID = '705631729283-jsrs842bhuc4rgbdnhe9mbaicg6g4ubo.apps.googleusercontent.com';
const COMPASSO_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

const driveSyncState = {
  tokenClient: null,
  accessToken: '',
  expiresAt: 0,
  profile: null,
  loading: false,
  lastError: '',
  syncing: false,
  lastSyncAt: '',
  baseline: new Map(),
  intervalId: null
};

const COMPASSO_DRIVE_API = 'https://www.googleapis.com/drive/v3';
const COMPASSO_DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const COMPASSO_SYNC_INTERVAL_MS = 5 * 60 * 1000;

function syncNowIso() { return new Date().toISOString(); }
function syncRecordKey(collection, id) { return `${collection}:${id}`; }
function syncClone(value) { return JSON.parse(JSON.stringify(value)); }
function syncFingerprint(record) {
  const copy = { ...record };
  delete copy.updatedAt;
  return JSON.stringify(copy);
}

function ensureSyncMetadata(data, touchChanged = false) {
  const now = syncNowIso();
  data._sync = data._sync && typeof data._sync === 'object' ? data._sync : {};
  data._sync.schemaVersion = 1;
  data._sync.deviceId ||= crypto.randomUUID();
  data._sync.tombstones = data._sync.tombstones && typeof data._sync.tombstones === 'object' ? data._sync.tombstones : {};

  Object.entries(data).forEach(([collection, records]) => {
    if (collection === '_sync' || !Array.isArray(records)) return;
    const currentIds = new Set();
    records.forEach(record => {
      if (!record || typeof record !== 'object') return;
      record.id ||= crypto.randomUUID();
      currentIds.add(record.id);
      const key = syncRecordKey(collection, record.id);
      const fingerprint = syncFingerprint(record);
      if (!record.updatedAt) record.updatedAt = now;
      if (touchChanged && driveSyncState.baseline.has(key) && driveSyncState.baseline.get(key) !== fingerprint) record.updatedAt = now;
    });
    if (touchChanged) {
      driveSyncState.baseline.forEach((_, key) => {
        const prefix = `${collection}:`;
        if (key.startsWith(prefix) && !currentIds.has(key.slice(prefix.length))) data._sync.tombstones[key] ||= now;
      });
    }
  });
  data._sync.updatedAt = touchChanged ? now : (data._sync.updatedAt || now);
  captureSyncBaseline(data);
  return data;
}

function captureSyncBaseline(data) {
  const next = new Map();
  Object.entries(data || {}).forEach(([collection, records]) => {
    if (!Array.isArray(records)) return;
    records.forEach(record => {
      if (record?.id) next.set(syncRecordKey(collection, record.id), syncFingerprint(record));
    });
  });
  driveSyncState.baseline = next;
}

function installSyncAwareSave() {
  ensureSyncMetadata(state.data);
  const baseSaveData = saveData;
  saveData = function syncAwareSaveData(message) {
    ensureSyncMetadata(state.data, true);
    return baseSaveData(message);
  };
}

function mergeSyncData(localData, remoteData) {
  const local = ensureSyncMetadata(syncClone(localData));
  const remote = ensureSyncMetadata(syncClone(remoteData));
  const merged = { ...local };
  const tombstones = { ...local._sync.tombstones, ...remote._sync.tombstones };
  Object.entries(local._sync.tombstones).forEach(([key, timestamp]) => {
    if (!tombstones[key] || timestamp > tombstones[key]) tombstones[key] = timestamp;
  });

  const collections = new Set([
    ...Object.keys(local).filter(key => Array.isArray(local[key])),
    ...Object.keys(remote).filter(key => Array.isArray(remote[key]))
  ]);
  collections.forEach(collection => {
    const byId = new Map();
    [...(remote[collection] || []), ...(local[collection] || [])].forEach(record => {
      if (!record?.id) return;
      const current = byId.get(record.id);
      if (!current || String(record.updatedAt || '') >= String(current.updatedAt || '')) byId.set(record.id, record);
    });
    merged[collection] = [...byId.values()].filter(record => {
      const deletedAt = tombstones[syncRecordKey(collection, record.id)];
      return !deletedAt || String(record.updatedAt || '') > deletedAt;
    });
  });
  const localUpdated = String(local._sync.updatedAt || '');
  const remoteUpdated = String(remote._sync.updatedAt || '');
  const newest = remoteUpdated > localUpdated ? remote : local;
  Object.entries(newest).forEach(([key, value]) => {
    if (!Array.isArray(value) && key !== '_sync') merged[key] = value;
  });
  merged._sync = { ...local._sync, ...remote._sync, tombstones, updatedAt: syncNowIso(), schemaVersion: 1 };
  return ensureSyncMetadata(merged);
}

async function driveRequest(path, options = {}) {
  const token = isDriveConnected() ? driveSyncState.accessToken : '';
  if (!token) throw new Error('Conecte o Google Drive antes de sincronizar.');
  const response = await fetch(path.startsWith('http') ? path : `${COMPASSO_DRIVE_API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(details?.error?.message || `Google Drive respondeu ${response.status}`);
  }
  return response;
}

async function findDriveSyncFile() {
  const query = encodeURIComponent(`name='compasso-sync.json' and 'appDataFolder' in parents and trashed=false`);
  const response = await driveRequest(`/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)&pageSize=1`);
  return (await response.json()).files?.[0] || null;
}

async function downloadDriveSyncFile(fileId) {
  const response = await driveRequest(`/files/${encodeURIComponent(fileId)}?alt=media`);
  return response.json();
}

async function uploadDriveSyncFile(data, fileId = '') {
  const boundary = `compasso_${crypto.randomUUID()}`;
  const metadata = fileId ? { name: 'compasso-sync.json' } : { name: 'compasso-sync.json', parents: ['appDataFolder'] };
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}\r\n--${boundary}--`;
  const endpoint = fileId
    ? `${COMPASSO_DRIVE_UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,modifiedTime`
    : `${COMPASSO_DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,modifiedTime`;
  const response = await driveRequest(endpoint, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body
  });
  return response.json();
}

async function syncGoogleDrive({ silent = false } = {}) {
  if (driveSyncState.syncing) return;
  driveSyncState.syncing = true;
  driveSyncState.lastError = '';
  renderDriveSyncPanel();
  try {
    ensureSyncMetadata(state.data, true);
    const file = await findDriveSyncFile();
    let merged = syncClone(state.data);
    if (file) merged = mergeSyncData(merged, await downloadDriveSyncFile(file.id));
    state.data = normalizeData(merged);
    ensureSyncMetadata(state.data);
    await uploadDriveSyncFile(state.data, file?.id || '');
    window.CompassoStorage.save(STORAGE_KEY, state.data);
    driveSyncState.lastSyncAt = syncNowIso();
    renderAll();
    if (!silent) showToast(file ? 'Dados conciliados com o Google Drive' : 'Backup criado no Google Drive');
  } catch (error) {
    driveSyncState.lastError = error?.message || 'Falha ao sincronizar';
    if (!silent) showToast('Não foi possível sincronizar com o Drive');
  } finally {
    driveSyncState.syncing = false;
    renderDriveSyncPanel();
  }
}

function startDriveSyncInterval() {
  clearInterval(driveSyncState.intervalId);
  driveSyncState.intervalId = setInterval(() => {
    if (isDriveConnected() && !document.hidden) syncGoogleDrive({ silent: true });
  }, COMPASSO_SYNC_INTERVAL_MS);
}

function getDriveSyncConfig() {
  return {
    clientId: COMPASSO_GOOGLE_CLIENT_ID,
    scope: COMPASSO_DRIVE_SCOPE,
    fileName: 'compasso-sync.json',
    storage: 'Google Drive appDataFolder',
    merge: 'por registro com id permanente e updatedAt'
  };
}

function isDriveConnected() {
  return Boolean(driveSyncState.accessToken) && Date.now() < driveSyncState.expiresAt;
}

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (loadGoogleIdentityServices.promise) return loadGoogleIdentityServices.promise;

  loadGoogleIdentityServices.promise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-compasso-google-identity]');
    if (existing) {
      existing.addEventListener('load', resolve, { once:true });
      existing.addEventListener('error', reject, { once:true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.compassoGoogleIdentity = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('google-identity-load-failed'));
    document.head.appendChild(script);
  });

  return loadGoogleIdentityServices.promise;
}

async function ensureDriveTokenClient() {
  await loadGoogleIdentityServices();
  if (driveSyncState.tokenClient) return driveSyncState.tokenClient;

  driveSyncState.tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: COMPASSO_GOOGLE_CLIENT_ID,
    scope: COMPASSO_DRIVE_SCOPE,
    prompt: '',
    callback: response => {
      driveSyncState.loading = false;
      if (response?.error) {
        driveSyncState.lastError = response.error;
        renderDriveSyncPanel();
        showToast('Conexão com Google Drive cancelada');
        return;
      }

      driveSyncState.accessToken = response.access_token || '';
      driveSyncState.expiresAt = Date.now() + Math.max(0, Number(response.expires_in || 0) - 60) * 1000;
      driveSyncState.lastError = '';
      renderDriveSyncPanel();
      showToast('Google Drive conectado');
      startDriveSyncInterval();
      syncGoogleDrive({ silent: true });
    }
  });

  return driveSyncState.tokenClient;
}

async function connectGoogleDrive() {
  try {
    driveSyncState.loading = true;
    driveSyncState.lastError = '';
    renderDriveSyncPanel();
    const client = await ensureDriveTokenClient();
    client.requestAccessToken({ prompt: isDriveConnected() ? '' : 'consent' });
  } catch (error) {
    driveSyncState.loading = false;
    driveSyncState.lastError = error?.message || 'Falha ao carregar OAuth';
    renderDriveSyncPanel();
    showToast('Não foi possível abrir o login Google');
  }
}

function disconnectGoogleDrive() {
  if (driveSyncState.accessToken && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(driveSyncState.accessToken);
  }
  driveSyncState.accessToken = '';
  driveSyncState.expiresAt = 0;
  driveSyncState.profile = null;
  driveSyncState.lastError = '';
  clearInterval(driveSyncState.intervalId);
  renderDriveSyncPanel();
  showToast('Google Drive desconectado');
}

function renderDriveSyncPanel() {
  const panel = document.getElementById('driveSyncPanel');
  if (!panel) return;

  const config = getDriveSyncConfig();
  const connected = isDriveConnected();
  const status = driveSyncState.loading ? 'Abrindo login…' : connected ? 'Conectado nesta sessão' : 'Desconectado';
  const statusClass = connected ? 'done' : driveSyncState.loading ? 'active' : 'planned';
  const nextAction = connected
    ? (driveSyncState.lastSyncAt ? `Última sincronização: ${new Date(driveSyncState.lastSyncAt).toLocaleString('pt-BR')}.` : 'Sincronize para criar ou conciliar compasso-sync.json.')
    : 'Conecte sua Conta Google para liberar a sincronização pelo Drive.';

  panel.innerHTML = `
    <div class="drive-sync-head">
      <div>
        <strong>Google Drive</strong>
        <span>OAuth configurado</span>
      </div>
      <span class="status ${statusClass}">${status}</span>
    </div>
    <div class="drive-sync-meta">
      <span>Arquivo: <b>${escapeHtml(config.fileName)}</b></span>
      <span>Escopo: <b>appDataFolder</b></span>
    </div>
    <p>${nextAction}</p>
    ${driveSyncState.lastError ? `<p class="drive-sync-error">${escapeHtml(driveSyncState.lastError)}</p>` : ''}
    <div class="drive-sync-actions">
      <button type="button" id="driveConnectBtn">${connected ? 'Renovar acesso' : 'Conectar Drive'}</button>
      <button type="button" id="driveSyncBtn" ${connected && !driveSyncState.syncing ? '' : 'disabled'}>${driveSyncState.syncing ? 'Sincronizando…' : 'Sincronizar agora'}</button>
      <button type="button" id="driveDisconnectBtn" ${connected ? '' : 'disabled'}>Desconectar</button>
    </div>
  `;

  document.getElementById('driveConnectBtn')?.addEventListener('click', connectGoogleDrive);
  document.getElementById('driveSyncBtn')?.addEventListener('click', () => syncGoogleDrive());
  document.getElementById('driveDisconnectBtn')?.addEventListener('click', disconnectGoogleDrive);
}

function installDriveSyncPanel() {
  if (document.getElementById('driveSyncPanel')) return;
  const menu = document.getElementById('settingsMenu');
  const exportButton = document.getElementById('exportBtn');
  if (!menu || !exportButton) return;

  const panel = document.createElement('section');
  panel.id = 'driveSyncPanel';
  panel.className = 'drive-sync-panel';
  exportButton.before(panel);
  renderDriveSyncPanel();
}

function installDriveSyncStyles() {
  if (document.getElementById('driveSyncStyles')) return;
  const style = document.createElement('style');
  style.id = 'driveSyncStyles';
  style.textContent = `
    .drive-sync-panel { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 10px 12px; display: grid; gap: 8px; min-width: 260px; background: #f7f6f1; }
    .drive-sync-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .drive-sync-head strong { display: block; font-size: 12px; }
    .drive-sync-head span:not(.status) { color: var(--muted); font-size: 10px; }
    .drive-sync-panel .status { font-size: 9px; white-space: nowrap; }
    .drive-sync-meta { display: grid; gap: 3px; color: var(--muted); font-size: 10px; }
    .drive-sync-panel p { margin: 0; color: var(--muted); font-size: 10px; line-height: 1.45; }
    .drive-sync-panel .drive-sync-error { color: var(--red); }
    .drive-sync-actions { display: flex; flex-wrap: wrap; gap: 7px; }
    .drive-sync-actions button { min-height: 30px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface-strong); cursor: pointer; font-size: 10px; font-weight: 700; padding: 0 9px; }
    .drive-sync-actions button:first-child { border-color: #262622; background: #262622; color: #fff; }
    .drive-sync-actions button:disabled { cursor: not-allowed; opacity: .5; }
  `;
  document.head.appendChild(style);
}

window.CompassoDriveSync = {
  config: getDriveSyncConfig(),
  connect: connectGoogleDrive,
  disconnect: disconnectGoogleDrive,
  isConnected: isDriveConnected,
  getAccessToken: () => isDriveConnected() ? driveSyncState.accessToken : ''
  ,sync: syncGoogleDrive
};

installSyncAwareSave();
installDriveSyncStyles();
installDriveSyncPanel();
