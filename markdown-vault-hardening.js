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

vaultApplyImport = function(strategy) {
  const model = vaultRuntime.pending;
  if (!model || vaultRuntime.busy) return;
  if (strategy === 'replace' && !confirm('Substituir todas as notas e pastas atuais por este vault? Leituras, estudos, metas e sessões não serão removidos.')) return;
  vaultSetBusy(true, 'Importando o vault…');
  try {
    if (strategy === 'replace') {
      state.data.notes = [];
      state.data.folders = [];
    }
    const currentByPath = vaultCurrentFolderPaths();
    const createdByPath = new Map();
    const modelFolderMap = new Map(model.folders.map(folder => [folder.path, folder]));
    let rootFolder = null;
    if (strategy === 'copies') {
      rootFolder = {
        id: `f${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
        name: `Importado · ${new Date().toLocaleDateString('pt-BR')}`,
        parent: null,
        domain: 'inbox'
      };
      state.data.folders.push(rootFolder);
    }
    if (!model.folders.length && !state.data.folders.length) {
      state.data.folders.push({ id: `f${Date.now()}`, name: '00 · Inbox', parent: null, domain: 'inbox' });
    }

    model.folders.forEach(folder => {
      if (folder.path) vaultEnsureFolder(folder.path, modelFolderMap, currentByPath, createdByPath, rootFolder);
    });

    let added = 0;
    let updated = 0;
    model.notes.forEach(imported => {
      let folder;
      if (imported.folderPath) folder = vaultEnsureFolder(imported.folderPath, modelFolderMap, currentByPath, createdByPath, rootFolder);
      else if (rootFolder) folder = rootFolder;
      else folder = state.data.folders.find(item => !item.parent && item.domain === 'inbox') || state.data.folders[0];
      const link = vaultResolveLinkedItem(imported);
      let existing = null;
      if (strategy === 'merge') {
        if (imported.id) existing = state.data.notes.find(note => note.id === imported.id) || null;
        if (!existing) existing = state.data.notes.find(note => note.folder === folder.id && vaultNormalize(note.title) === vaultNormalize(imported.title)) || null;
      }
      const payload = {
        title: imported.title,
        folder: folder.id,
        domain: link.domain,
        linkedItemId: link.linkedItemId,
        tags: imported.tags,
        updated: imported.updated,
        content: imported.content
      };
      if (existing) {
        Object.assign(existing, payload);
        updated += 1;
      } else {
        state.data.notes.push({
          id: strategy !== 'copies' && imported.id && !state.data.notes.some(note => note.id === imported.id)
            ? imported.id
            : `n${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
          ...payload
        });
        added += 1;
      }
    });
    state.selectedNoteId = state.data.notes[0]?.id || null;
    state.selectedFolderId = state.data.notes[0]?.folder || state.data.folders[0]?.id || null;
    saveData(`Vault importado · ${added} novas · ${updated} atualizadas`);
    vaultSetStatus(`${added} notas adicionadas e ${updated} atualizadas.`, 'success');
    document.getElementById('vaultDialog')?.close();
    switchView('notes');
  } catch (error) {
    console.error(error);
    vaultSetStatus(error.message || 'Não foi possível importar o vault.', 'error');
  } finally {
    vaultSetBusy(false);
  }
};

const vaultSetBusyBase = vaultSetBusy;
vaultSetBusy = function(busy, message = '') {
  vaultSetBusyBase(busy, message);
  const apply = document.getElementById('vaultApplyBtn');
  if (apply) apply.disabled = busy || !vaultRuntime.pending;
};
