/* Compasso · Compatibilidade do vault Markdown
 * Preserva pastas vazias descritas no manifesto e mantém o estado visual
 * dos controles coerente durante operações assíncronas.
 */

const vaultBuildImportModelBase = vaultBuildImportModel;
vaultBuildImportModel = function(inputFiles, sourceName) {
  const model = vaultBuildImportModelBase(inputFiles, sourceName);
  const knownPaths = new Set(model.folders.map(folder => folder.path));
  (model.manifest?.folders || [])
    .slice()
    .sort((a, b) => a.path.split('/').length - b.path.split('/').length || a.path.localeCompare(b.path, 'pt-BR'))
    .forEach(folder => {
      if (!folder.path || knownPaths.has(folder.path)) return;
      knownPaths.add(folder.path);
      model.folders.push({
        path: folder.path,
        name: folder.name || folder.path.split('/').at(-1),
        parentPath: folder.parentPath || folder.path.split('/').slice(0, -1).join('/') || null,
        domain: folder.domain || vaultDomainFromPath(folder.path)
      });
    });
  model.folders.sort((a, b) => a.path.split('/').length - b.path.split('/').length || a.path.localeCompare(b.path, 'pt-BR'));
  return model;
};

const vaultSetBusyBase = vaultSetBusy;
vaultSetBusy = function(busy, message = '') {
  vaultSetBusyBase(busy, message);
  const apply = document.getElementById('vaultApplyBtn');
  if (apply) apply.disabled = busy || !vaultRuntime.pending;
};
