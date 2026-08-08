const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const out = path.join(root, '.test-dist');
const manifest = require(path.join(root, 'app-manifest.js'));
const composition = require(path.join(root, 'app-composition.js'));
const rawHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const manifestSource = fs.readFileSync(path.join(root, 'app-manifest.js'), 'utf8');

function moduleSources(selectedManifest) {
  return selectedManifest.modules.map((module) => ({
    file: module.file,
    source: fs.readFileSync(path.join(root, module.file), 'utf8'),
  }));
}

function manifestOverride(generation, browserOnly) {
  return `${manifestSource}\n;(function(root){\n` +
    `  const base=root.CompassoAppManifest;\n` +
    `  const modules=${browserOnly ? 'base.modules.filter(module=>module.browserJourney)' : '[...base.modules]'};\n` +
    `  const moduleFiles=new Set(base.modules.map(module=>module.file));\n` +
    `  const selectedFiles=new Set(modules.map(module=>module.file));\n` +
    `  const assets=base.assets.filter(value=>{const file=value.replace(/^\\.\\//,'');return !moduleFiles.has(file)||selectedFiles.has(file)});\n` +
    `  const api=Object.freeze({...base,cacheName:${JSON.stringify(generation)},modules:Object.freeze(modules),assets:Object.freeze(assets)});\n` +
    `  root.CompassoAppManifest=api;\n` +
    `  if(typeof module==='object'&&module.exports)module.exports=api;\n` +
    `})(typeof self!=='undefined'?self:globalThis);\n`;
}

function selectedManifest(browserOnly, generation) {
  const modules = browserOnly ? manifest.modules.filter((module) => module.browserJourney) : [...manifest.modules];
  const moduleFiles = new Set(manifest.modules.map((module) => module.file));
  const selectedFiles = new Set(modules.map((module) => module.file));
  return {
    ...manifest,
    cacheName: generation,
    modules,
    assets: manifest.assets.filter((value) => {
      const file = value.replace(/^\.\//, '');
      return !moduleFiles.has(file) || selectedFiles.has(file);
    }),
  };
}

function copyAssets(target, selected) {
  fs.mkdirSync(target, { recursive: true });
  for (const asset of selected.assets) {
    const relative = asset.replace(/^\.\//, '');
    if (!relative || relative === 'index.html' || relative === 'app-manifest.js') continue;
    const source = path.join(root, relative);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) continue;
    const destination = path.join(target, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

function assertInlineScript(html, target) {
  const scripts = [...html.matchAll(/<script\s+type="module">([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 1) throw new Error(`expected one inline module script in ${target}`);
  const output = path.join(target, 'app.mjs');
  fs.writeFileSync(output, scripts[0][1]);
  execFileSync(process.execPath, ['--check', output], { stdio: 'pipe' });
}

function writeJourneyFixture() {
  const selected = selectedManifest(true, manifest.cacheName);
  const result = composition.composeDocument({ html: rawHtml, manifest: selected, modules: moduleSources(selected) });
  if (!result.ok) throw new Error(`journey composition failed: ${result.code}`);
  copyAssets(out, selected);
  fs.writeFileSync(path.join(out, 'index.html'), result.html);
  fs.writeFileSync(path.join(out, 'app-manifest.js'), manifestOverride(selected.cacheName, true));
  assertInlineScript(result.html, out);
}

function writeLifecycleFixture(name, generation) {
  const target = path.join(out, `pwa-${name}`);
  const selected = selectedManifest(false, generation);
  copyAssets(target, selected);
  fs.writeFileSync(path.join(target, 'index.html'), rawHtml);
  fs.writeFileSync(path.join(target, 'app-manifest.js'), manifestOverride(generation, false));
  fs.appendFileSync(path.join(target, 'service-worker.js'), `\n/* lifecycle fixture ${generation} */\n`);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
writeJourneyFixture();
writeLifecycleFixture('previous', 'compasso-pages-v900001');
writeLifecycleFixture('current', 'compasso-pages-v900002');
