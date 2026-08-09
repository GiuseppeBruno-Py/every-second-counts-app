const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
const inlineApplicationScriptPattern = /<script type="module">\r?\n([\s\S]*?)<\/script>\r?\n<\/body>/;
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

function extractInlineApplicationScript(source) {
  return source.match(inlineApplicationScriptPattern)?.[1] ?? null;
}

const inlineScript = extractInlineApplicationScript(html);

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

test('all supported values and compact badges are available', () => {
  for (const value of ['deep', 'shallow', 'recovery', 'low', 'medium', 'high']) {
    assert.match(html, new RegExp(`value="${value}"`));
  }
  assert.match(html, /class="cognitive-badge/);
  assert.match(html, /item\.estimatedMinutes/);
  assert.match(html, /item\.expectedOutcome/);
});

test('legacy normalization never infers low demand or energy', () => {
  assert.match(html, /item\.requiredEnergy = cognitiveOptions\.requiredEnergy/);
  assert.doesNotMatch(html, /item\.(?:cognitiveDemand|requiredEnergy)\s*=\s*['"]low['"]/);
});

test('inline application script locator accepts LF and CRLF while preserving structure', () => {
  const validLf = '<script type="module">\nconst value = 1;</script>\n</body>';
  const validCrlf = validLf.replace(/\n/g, '\r\n');
  const lfScript = extractInlineApplicationScript(validLf);
  const crlfScript = extractInlineApplicationScript(validCrlf);

  assert.equal(lfScript, 'const value = 1;');
  assert.equal(crlfScript, lfScript);
  assert.doesNotThrow(() => new AsyncFunction(lfScript));
  assert.doesNotThrow(() => new AsyncFunction(crlfScript));

  const malformedSources = [
    '<script type="module">const value = 1;</script>\n</body>',
    '<script type="module">\nconst value = 1;</script></body>',
    '<script type="module">\nconst value = 1;</script>\n<div></div>\n</body>',
    '<body>\n</body>',
    '<script type="module">\nconst value = 1;</script> \n</body>',
  ];
  for (const malformed of malformedSources) {
    assert.equal(extractInlineApplicationScript(malformed), null);
  }

  const invalidScript = extractInlineApplicationScript('<script type="module">\nconst = ;</script>\n</body>');
  assert.ok(invalidScript);
  assert.throws(() => new AsyncFunction(invalidScript), SyntaxError);
});

test('inline application script is valid JavaScript', () => {
  assert.ok(inlineScript);
  assert.doesNotThrow(() => new AsyncFunction(inlineScript));
});
