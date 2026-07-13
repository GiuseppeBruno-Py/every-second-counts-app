const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, '.test-dist');
const files = [
  'feature-runtime.js',
  'today-feature.js',
  'sessions-feature.js',
  'goal-links-feature.js',
  'contingency-model.js',
  'contingency-feature.js',
  'deep-work-model.js',
  'deep-work-feature.js',
  'session-companion-feature.js',
  'ritual-model.js',
  'ritual-feature.js',
  'evidence-feature.js',
  'recall-feature.js',
  'weakness-feature.js',
  'outcomes-feature.js',
  'weekly-review-feature.js',
  'analytics-feature.js',
  'capture-model.js',
  'capture-feature.js',
  'world-locations.js',
  'world-quality.js',
  'world-navigation.js',
  'world-accessibility.js',
  'world-character.js',
  'world-scene.js',
  'world-3d-feature.js',
  'ux-consolidation-model.js',
  'ux-consolidation-feature.js'
];

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = files.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n\n');
const point = '    renderAll();\n    const requestedView';
if (!html.includes(point)) throw Error('bootstrap point not found');
html = html.replace(point, () => `    ${code}\n\n    renderAll();\n    const requestedView`);
fs.mkdirSync(out, { recursive:true });
fs.writeFileSync(path.join(out, 'index.html'), html);
const moduleCode = html.match(/<script(?: type="module")?>([\s\S]*?)<\/script>/)?.[1];
if (moduleCode) fs.writeFileSync(path.join(out, 'app.mjs'), moduleCode);
for (const asset of ['compasso-icon.svg']) {
  if (fs.existsSync(path.join(root, asset))) fs.copyFileSync(path.join(root, asset), path.join(out, asset));
}
fs.cpSync(path.join(root, 'vendor'), path.join(out, 'vendor'), { recursive:true });
