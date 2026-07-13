/* Compasso · Estados de navegação do Mundo do Compasso */
(function(root, factory) {
  const api = Object.freeze(factory());
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoWorldNavigation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const states = Object.freeze(['village','moving','entering-room','room','session-starting','session-active','session-paused','session-finishing','returning-to-village']);
  const allowed = Object.freeze({
    village:['moving','entering-room'],
    moving:['entering-room','room','returning-to-village','village'],
    'entering-room':['room','returning-to-village','village'],
    room:['moving','session-starting','session-active','returning-to-village'],
    'session-starting':['session-active','session-finishing','room'],
    'session-active':['session-paused','session-finishing','room'],
    'session-paused':['session-active','session-finishing','room'],
    'session-finishing':['room','returning-to-village','village'],
    'returning-to-village':['village']
  });

  function create(overrides = {}) {
    return Object.freeze({ status:'village', locationId:'plaza', previousLocationId:null, updatedAt:null, ...overrides });
  }
  function canTransition(from, to) { return Boolean(allowed[from]?.includes(to)); }
  function transition(current, status, details = {}, now = () => new Date().toISOString()) {
    if (!states.includes(status)) throw new TypeError(`Estado de navegação inválido: ${status}`);
    if (!canTransition(current.status, status)) throw new Error(`Transição inválida: ${current.status} → ${status}`);
    return Object.freeze({ ...current, ...details, status, updatedAt:now() });
  }
  function syncSession(current, session) {
    const wanted = session?.paused ? 'session-paused' : session?.active ? 'session-active' : null;
    if (!wanted || current.status === wanted) return current;
    if (canTransition(current.status, wanted)) return transition(current, wanted);
    if (current.status === 'village') {
      const room = transition(current, 'entering-room', { locationId:session.locationId || 'study' });
      return transition(transition(room, 'room'), wanted);
    }
    return Object.freeze({ ...current, status:wanted, updatedAt:new Date().toISOString() });
  }

  return { states, allowed, create, canTransition, transition, syncSession };
});
