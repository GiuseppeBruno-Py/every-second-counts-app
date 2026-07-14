const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.test-dist');
const manifest=require(path.join(root,'app-manifest.js'));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const code=manifest.modules.filter(module=>module.browserJourney).map(module=>{
  const source=fs.readFileSync(path.join(root,module.file),'utf8');
  return `globalThis.CompassoBootstrapDiagnostic?.start('${module.file}');\n${source}\nglobalThis.CompassoBootstrapDiagnostic?.done('${module.file}');`;
}).join('\n\n');
const point='    renderAll();\n    const requestedView';
if(!html.includes(point))throw Error('bootstrap point not found');
html=html.replace('</head>','  <link rel="stylesheet" href="./app-ui.css">\n  <link rel="stylesheet" href="./design-system.css">\n  <script src="./app-manifest.js"></script>\n  <script src="./bootstrap-diagnostics.js"></script>\n</head>');
html=html.replace(point,()=>`    ${code}\n\n    renderAll();\n    const requestedView`);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html);
const moduleCode=html.match(/<script(?: type="module")?>([\s\S]*?)<\/script>/)?.[1];if(moduleCode)fs.writeFileSync(path.join(out,'app.mjs'),moduleCode);
const journeyFiles=new Set(manifest.modules.filter(module=>module.browserJourney).map(module=>module.file));
const moduleFiles=new Set(manifest.modules.map(module=>module.file));
for(const asset of manifest.assets.map(value=>value.replace(/^\.\//,''))){
  if(moduleFiles.has(asset)&&!journeyFiles.has(asset))continue;
  const source=path.join(root,asset||'index.html');
  if(asset&&asset!=='index.html'&&fs.existsSync(source)&&fs.statSync(source).isFile())fs.copyFileSync(source,path.join(out,asset));
}
const journeyManifest={
  ...manifest,
  modules:manifest.modules.filter(module=>module.browserJourney),
  assets:manifest.assets.filter(value=>{const asset=value.replace(/^\.\//,'');return!moduleFiles.has(asset)||journeyFiles.has(asset)})
};
fs.writeFileSync(path.join(out,'app-manifest.js'),`${fs.readFileSync(path.join(root,'app-manifest.js'),'utf8')}\n;globalThis.CompassoAppManifest=Object.freeze(${JSON.stringify(journeyManifest)});\n`);
