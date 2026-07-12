/* Compasso · Ciclo de vida do grafo interativo
 * Reenquadra a visualização quando a área oculta se torna visível.
 */

document.addEventListener('click', event => {
  if (!event.target.closest('[data-view="dictionary"]')) return;
  setTimeout(() => {
    if (typeof graphRuntime === 'undefined' || graphRuntime.mode !== 'graph') return;
    graphResize();
    graphFit();
  }, 90);
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (typeof graphRuntime === 'undefined' || graphRuntime.mode !== 'graph') return;
    graphResize();
    graphFit();
  }, 180);
});
