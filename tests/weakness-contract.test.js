const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Caderno de erros expõe cinco estágios distintos no registro v2', () => {
  const source = read('weakness-feature.js');
  assert.match(source, /WEAKNESS_FEATURE_VERSION\s*=\s*2/);
  for (const label of [
    'Fato observado — O que aconteceu objetivamente?',
    'Interpretação — Que conclusão você está tirando disso?',
    'Hipótese — Qual explicação específica pode ser testada?',
    'Correção — O que deveria acontecer diferente?',
    'Próxima tentativa — O que você fará?'
  ]) assert.ok(source.includes(label), `missing label: ${label}`);
  assert.ok(source.indexOf('errorContext') < source.indexOf('errorInterpretation'));
  assert.ok(source.indexOf('errorInterpretation') < source.indexOf('errorHypothesis'));
  assert.ok(source.indexOf('errorHypothesis') < source.indexOf('errorCorrection'));
  assert.ok(source.indexOf('errorCorrection') < source.indexOf('errorNextAction'));
  assert.match(source, /interpretation:/);
  assert.match(source, /hypothesis:/);
  assert.match(source, /function weaknessOptionalText/);
});

test('save estruturado aguarda durabilidade, reverte e impede duplicação', () => {
  const source = read('weakness-feature.js');
  assert.match(source, /async function saveWeaknessError/);
  assert.match(source, /weaknessRuntime\.saving/);
  assert.match(source, /structuredClone/);
  assert.match(source, /await saveData/);
  assert.match(source, /state\.data\s*=\s*previous/);
  assert.match(source, /id="weaknessError"/);
  assert.match(source, /role="alert"/);
});

test('estrutura não cria domínio psicológico nem mutação de capacidade', () => {
  const source = read('weakness-feature.js');
  assert.doesNotMatch(source, /state\.data\.(?:errorInterpretations|errorHypotheses|confidence|selfEsteem|personality|psychologicalProfile)/);
  assert.doesNotMatch(source, /createSignal|learningOutcomes|nextAttempt\s*:/);
});

test('writer contextual permanece v1 e não fabrica interpretação ou hipótese', () => {
  const source = read('context-learning-feature.js');
  const start = source.indexOf('function logContextEvaluationGap');
  const end = source.indexOf('function contextLearningSourceOptions', start);
  const writer = source.slice(start, end);
  assert.match(writer, /schemaVersion:\s*1/);
  assert.doesNotMatch(writer, /interpretation\s*:|hypothesis\s*:/);
});
