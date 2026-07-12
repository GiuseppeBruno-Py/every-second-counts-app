/* Compasso · OAuth Google Drive e base de sincronização */
const COMPASSO_GOOGLE_CLIENT_ID = '705631729283-jsrs842bhuc4rgbdnhe9mbaicg6g4ubo.apps.googleusercontent.com';
const COMPASSO_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

const driveSyncState = {
  tokenClient: null,
  accessToken: '',
  expiresAt: 0,
  profile: null,
  loading: false,
  lastError: ''
};

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
    ? 'Pronto para a próxima etapa: criar/ler compasso-sync.json no Drive.'
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
      <button type="button" id="driveDisconnectBtn" ${connected ? '' : 'disabled'}>Desconectar</button>
    </div>
  `;

  document.getElementById('driveConnectBtn')?.addEventListener('click', connectGoogleDrive);
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
    .drive-sync-actions { display: flex; gap: 7px; }
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
};

installDriveSyncStyles();
installDriveSyncPanel();
