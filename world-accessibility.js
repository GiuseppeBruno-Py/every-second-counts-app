/* Compasso · Acessibilidade do Mundo do Compasso */
(function(root, factory) {
  const api = Object.freeze(factory());
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoWorldAccessibility = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  function reducedMotion() { return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function announce(region, message) { if (region) region.textContent = String(message || ''); }
  function nextIndex(current, key, total, columns = 3) {
    if (!total) return -1;
    const offsets = { ArrowRight:1, ArrowLeft:-1, ArrowDown:columns, ArrowUp:-columns, d:1, D:1, a:-1, A:-1, s:columns, S:columns, w:-columns, W:-columns };
    const offset = offsets[key];
    if (!offset) return current;
    return Math.max(0, Math.min(total - 1, current + offset));
  }
  function focusLocation(container, index) {
    const items = Array.from(container?.querySelectorAll?.('[data-world-location]') || []);
    const item = items[Math.max(0, Math.min(items.length - 1, index))];
    item?.focus();
    return item || null;
  }

  return { reducedMotion, announce, nextIndex, focusLocation };
});
