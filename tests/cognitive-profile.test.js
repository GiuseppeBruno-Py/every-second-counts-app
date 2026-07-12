const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
const inlineScript = html.match(/<script>\n([\s\S]*?)<\/script>\n<\/body>/)?.[1];

test('legacy fields stay undefined', () => {
  assert.match(html, /<option value="">Não definido<\/option>/);
  assert.match(html, /item\.workType = cognitiveOptions\.workType/);
  assert.match(html, /item\.cognitiveDemand = cognitiveOptions\.cognitiveDemand/);
});

test('profile fields are persisted', () => {
  for (const field of ['workType', 'cognitiveDemand', 'requiredEnergy', 'estimatedMinutes', 'expectedOutcome']) {
    assert.match(html, new RegExp(`${field}:`));
  }
});

test('profile filters are wired', () => {
  assert.match(html, /data-cognitive-filter="workType"/);
  assert.match(html, /data-cognitive-filter="cognitiveDemand"/);
  assert.match(html, /item\.workType === cognitiveFilter\.workType/);
  assert.match(html, /item\.cognitiveDemand === cognitiveFilter\.cognitiveDemand/);
});

test('inline application script is valid JavaScript', () => {
  assert.ok(inlineScript);
  assert.doesNotThrow(() => new Function(inlineScript));
});
