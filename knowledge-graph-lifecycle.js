/* Compasso · Ciclo de vida do grafo interativo
 * Reenquadra a visualização e limpa estados residuais de gestos touch.
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

const graphLifecycleSvg = document.getElementById('knowledgeGraphSvg');
if (graphLifecycleSvg) {
  graphLifecycleSvg.addEventListener('pointerdown', () => {
    setTimeout(() => {
      if (typeof graphRuntime === 'undefined' || graphRuntime.pointers.size < 2) return;
      graphRuntime.nodes.forEach(node => { node.fixed = false; });
    }, 0);
  }, true);

  graphLifecycleSvg.addEventListener('pointercancel', () => {
    if (typeof graphRuntime === 'undefined') return;
    graphRuntime.nodes.forEach(node => { node.fixed = false; });
  });
}
