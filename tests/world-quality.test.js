const test = require('node:test');
const assert = require('node:assert/strict');
const quality = require('../world-quality.js');

test('qualidade automática respeita capacidade e movimento reduzido', () => {
  assert.equal(quality.resolve('auto', { webgl:false }).id, '2d');
  assert.equal(quality.resolve('auto', { webgl:true, deviceMemory:2 }).id, 'economy');
  assert.equal(quality.resolve('auto', { webgl:true, reducedMotion:true }).id, 'economy');
  assert.equal(quality.resolve('auto', { webgl:true, mobile:true, deviceMemory:8 }).id, 'balanced');
  assert.equal(quality.resolve('auto', { webgl:true, deviceMemory:8, devicePixelRatio:1 }).id, 'high');
});

test('preferência inválida volta ao automático e modo 2D é explícito', () => {
  const values = new Map();
  const storage = { getItem:key => values.get(key) || null, setItem:(key,value) => values.set(key,value) };
  assert.equal(quality.write('ultra', storage), 'auto');
  assert.equal(quality.read(storage), 'auto');
  assert.equal(quality.write('2d', storage), '2d');
  assert.equal(quality.resolve(quality.read(storage), { webgl:true }).id, '2d');
});

test('detecção WebGL falha de modo seguro', () => {
  assert.equal(quality.supportsWebGL(() => ({ getContext:() => null })), false);
  assert.equal(quality.supportsWebGL(() => { throw Error('contexto indisponível'); }), false);
  assert.equal(quality.supportsWebGL(() => ({ getContext:type => type === 'webgl' ? {} : null })), true);
});
