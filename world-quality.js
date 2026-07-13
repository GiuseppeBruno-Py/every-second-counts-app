/* Compasso · Qualidade progressiva do Mundo do Compasso */
(function(root, factory) {
  const api = Object.freeze(factory());
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoWorldQuality = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const QUALITY_KEY = 'compasso.world.quality.v1';
  const MOTION_KEY = 'compasso.world.motion.v1';
  const modes = Object.freeze(['auto', 'high', 'balanced', 'economy', '2d']);
  const profiles = Object.freeze({
    high: Object.freeze({ id:'high', pixelRatio:2, shadows:true, particles:24, foliage:1, antialias:true }),
    balanced: Object.freeze({ id:'balanced', pixelRatio:1.5, shadows:true, particles:10, foliage:.72, antialias:true }),
    economy: Object.freeze({ id:'economy', pixelRatio:1, shadows:false, particles:0, foliage:.4, antialias:false }),
    '2d': Object.freeze({ id:'2d', pixelRatio:1, shadows:false, particles:0, foliage:0, antialias:false })
  });

  function normalize(mode) { return modes.includes(mode) ? mode : 'auto'; }
  function supportsWebGL(createCanvas) {
    try {
      const canvas = createCanvas ? createCanvas() : document.createElement('canvas');
      return Boolean(canvas?.getContext?.('webgl2') || canvas?.getContext?.('webgl'));
    } catch { return false; }
  }
  function resolve(mode = 'auto', environment = {}) {
    const normalized = normalize(mode);
    if (normalized === '2d' || environment.webgl === false) return profiles['2d'];
    if (normalized !== 'auto') return profiles[normalized];
    const memory = Number(environment.deviceMemory || 0);
    const mobile = Boolean(environment.mobile);
    const reducedMotion = Boolean(environment.reducedMotion);
    if (reducedMotion || (memory > 0 && memory <= 2)) return profiles.economy;
    if (mobile || (memory > 0 && memory <= 4) || Number(environment.devicePixelRatio || 1) > 2) return profiles.balanced;
    return profiles.high;
  }
  function environment() {
    return {
      // Não force a criação de um contexto durante o bootstrap: alguns drivers
      // bloqueiam a thread principal. O renderer confirma o suporte e cai para 2D.
      webgl: typeof WebGLRenderingContext !== 'undefined' || typeof WebGL2RenderingContext !== 'undefined',
      deviceMemory: typeof navigator !== 'undefined' ? navigator.deviceMemory : 0,
      devicePixelRatio: typeof devicePixelRatio === 'number' ? devicePixelRatio : 1,
      mobile: typeof matchMedia === 'function' && matchMedia('(max-width: 760px)').matches,
      reducedMotion: typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }
  function read(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    try { return normalize(storage?.getItem(QUALITY_KEY)); } catch { return 'auto'; }
  }
  function write(mode, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    const value = normalize(mode);
    try { storage?.setItem(QUALITY_KEY, value); } catch { /* preferência visual não bloqueia o app */ }
    return value;
  }
  function motion(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    try { return storage?.getItem(MOTION_KEY) !== 'off'; } catch { return true; }
  }
  function writeMotion(enabled, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
    try { storage?.setItem(MOTION_KEY, enabled ? 'on' : 'off'); } catch { /* opcional */ }
    return Boolean(enabled);
  }

  return { QUALITY_KEY, MOTION_KEY, modes, profiles, normalize, supportsWebGL, resolve, environment, read, write, motion, writeMotion };
});
