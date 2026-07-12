const test=require('node:test');const assert=require('node:assert/strict');const m=require('../ux-consolidation-model.js');
test('modo inválido volta ao essencial',()=>assert.equal(m.mode('x'),'essential'));
test('classifica áreas sem esconder o núcleo',()=>{assert.equal(m.navLevel('Hoje'),'essential');assert.equal(m.navLevel('Active Recall'),'knowledge');assert.equal(m.navLevel('Analytics'),'advanced')});
test('conhecimento inclui núcleo e conhecimento',()=>{assert.equal(m.visible('essential','knowledge'),true);assert.equal(m.visible('knowledge','knowledge'),true);assert.equal(m.visible('advanced','knowledge'),false)});
test('papéis visuais dos botões são determinísticos',()=>{assert.equal(m.actionRole({note:'x'}),'note');assert.equal(m.actionRole({deep:'x'}),'execute');assert.equal(m.actionRole({ritual:'x'}),'more')});
