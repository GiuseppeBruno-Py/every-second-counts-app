/* Compasso · Aparência local, aplicada antes da primeira pintura. */
(() => {
  'use strict';
  const storageKey = 'compasso.theme.v1';
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const normalize = value => ['light', 'dark'].includes(value) ? value : 'system';
  let preference = 'system';
  let storage = null;
  try { storage = window.localStorage; preference = normalize(storage.getItem(storageKey)); }
  catch { /* Aparência disponível mesmo com armazenamento bloqueado. */ }
  function applyTheme() {
    const theme = preference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : preference;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#131c18' : '#f6f7f4';
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    }
    const select = document.getElementById('themePreference');
    if (select) select.value = preference;
  }
  function chooseTheme(value) {
    preference = normalize(value);
    try {
      if (preference === 'system') storage?.removeItem(storageKey);
      else storage?.setItem(storageKey, preference);
    } catch { /* A escolha permanece válida nesta sessão. */ }
    applyTheme();
  }
  applyTheme();
  systemTheme.addEventListener('change', () => { if (preference === 'system') applyTheme(); });
  window.addEventListener('storage', event => {
    if (storage && event.storageArea === storage && (event.key === storageKey || event.key === null)) {
      preference = normalize(event.newValue);
      applyTheme();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    document.getElementById('themeToggle')?.addEventListener('click', () =>
      chooseTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
    document.getElementById('themePreference')?.addEventListener('change', event => chooseTheme(event.target.value));
  }, { once: true });
})();
