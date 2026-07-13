const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('salva vínculos na meta editada mesmo depois de o formulário limpar editingId', () => {
  const listeners = [];
  const form = {
    addEventListener(type, handler, options = {}) {
      if (type === 'submit') listeners.push({ handler, capture: Boolean(options.capture) });
    },
    submit() {
      listeners.filter(item => item.capture).forEach(item => item.handler({ type:'submit' }));
      listeners.filter(item => !item.capture).forEach(item => item.handler({ type:'submit' }));
    }
  };
  const state = {
    editingId: 'goal:g2',
    data: {
      reading: [{ id:'r1', title:'Leitura', progress:60 }],
      study: [{ id:'s1', title:'Estudo', progress:40 }],
      goal: [{ id:'g1', title:'Primeira meta', progress:0 }, { id:'g2', title:'Meta editada', progress:0 }]
    }
  };
  let persisted = null;
  const context = {
    state,
    document: {
      getElementById(id) {
        if (id === 'itemForm') return form;
        if (id === 'domainField') return { value:'goal', addEventListener() {} };
        if (id === 'titleField') return { value:'Meta editada' };
        return null;
      },
      querySelectorAll() {
        return [
          { dataset:{ goalLink:'reading:r1' } },
          { dataset:{ goalLink:'study:s1' } }
        ];
      }
    },
    saveData() { persisted = structuredClone(state.data); },
    openDialog() {},
    clamp(value) { return Math.max(0, Math.min(100, Number(value) || 0)); },
    CompassoFeatures: { register() {} },
    queueMicrotask,
    structuredClone
  };

  // Reproduz a ordem real: o formulário principal é registrado antes da feature.
  form.addEventListener('submit', () => {
    state.editingId = null;
    context.saveData();
  });
  const source = fs.readFileSync(path.join(__dirname, '..', 'goal-links-feature.js'), 'utf8');
  vm.runInNewContext(source, context);
  form.submit();

  const edited = persisted.goal.find(goal => goal.id === 'g2');
  assert.deepEqual(Array.from(edited.linkedItems, link => `${link.domain}:${link.itemId}`), ['reading:r1', 'study:s1']);
  assert.equal(edited.progress, 50);
  assert.equal(persisted.goal.find(goal => goal.id === 'g1').linkedItems.length, 0);
});
