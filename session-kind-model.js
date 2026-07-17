(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoSessionKindModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  function kind(session) {
    return session?.source === 'deep-work' || String(session?.id || '').startsWith('deep:') ? 'deep' : 'normal';
  }

  function label(session) {
    return kind(session) === 'deep' ? 'Deep Work' : 'Normal';
  }

  function breakdown(sessions = []) {
    return sessions.reduce((totals, session) => {
      totals[kind(session)] += 1;
      return totals;
    }, { deep: 0, normal: 0 });
  }

  return Object.freeze({ kind, label, breakdown });
});
