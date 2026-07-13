/* Compasso · Importação e exportação do vault em Markdown
 * Exporta Markdown interoperável em ZIP ou diretório e importa ZIPs,
 * pastas e arquivos Markdown sem dependências externas.
 */

const VAULT_IO_VERSION = 1;
const VAULT_MAX_FILES = 2500;
const VAULT_MAX_BYTES = 80 * 1024 * 1024;

const vaultRuntime = {
  pending: null,
  busy: false
};

function vaultNormalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function vaultSafeSegment(value = 'Sem título') {
  const cleaned = String(value)
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .replace(/[. ]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || 'Sem título').slice(0, 120);
}

function vaultUniqueName(base, used) {
  let candidate = base;
  let index = 2;
  while (used.has(vaultNormalize(candidate))) candidate = `${base} (${index++})`;
  used.add(vaultNormalize(candidate));
  return candidate;
}

function vaultLinkedItem(note) {
  if (!note?.linkedItemId || !['reading', 'study', 'goal'].includes(note.domain)) return null;
  return state.data[note.domain]?.find(item => item.id === note.linkedItemId) || null;
}

function vaultBuildExportModel() {
  const folderPathById = new Map();
  const childrenByParent = new Map();
  state.data.folders.forEach(folder => {
    const key = folder.parent || '__root__';
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(folder);
  });

  const folderRecords = [];
  function walk(parentId = null, parentPath = '') {
    const siblings = (childrenByParent.get(parentId || '__root__') || [])
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const used = new Set();
    siblings.forEach(folder => {
      const segment = vaultUniqueName(vaultSafeSegment(folder.name), used);
      const path = parentPath ? `${parentPath}/${segment}` : segment;
      folderPathById.set(folder.id, path);
      folderRecords.push({
        id: folder.id,
        path,
        name: folder.name,
        parentId: folder.parent || null,
        parentPath: parentPath || null,
        domain: folder.domain || 'inbox'
      });
      walk(folder.id, path);
    });
  }
  walk();

  const usedByFolder = new Map();
  const files = [];
  const noteRecords = [];
  state.data.notes
    .slice().sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
    .forEach(note => {
      const folderPath = folderPathById.get(note.folder) || '00 · Inbox';
      if (!usedByFolder.has(folderPath)) usedByFolder.set(folderPath, new Set());
      const filename = `${vaultUniqueName(vaultSafeSegment(note.title), usedByFolder.get(folderPath))}.md`;
      const path = `${folderPath}/${filename}`;
      const linked = vaultLinkedItem(note);
      const content = globalThis.CompassoCaptureFeature?.noteMarkdown?.(note) || String(note.content || '');
      files.push({ path, content, modified: note.updated || null });
      noteRecords.push({
        path,
        id: note.id,
        title: note.title,
        folderId: note.folder,
        domain: note.domain || 'inbox',
        linkedItemId: note.linkedItemId || null,
        linkedItemTitle: linked?.title || null,
        tags: Array.isArray(note.tags) ? note.tags : [],
        updated: note.updated || null
      });
    });

  const manifest = {
    schemaVersion: VAULT_IO_VERSION,
    app: 'Compasso',
    exportedAt: new Date().toISOString(),
    folders: folderRecords,
    notes: noteRecords
  };
  files.push({ path: '.compasso/manifest.json', content: JSON.stringify(manifest, null, 2) });
  files.push({
    path: '.compasso/README.md',
    content: '# Compasso Vault\n\nOs arquivos `.md` são Markdown comum e podem ser abertos em qualquer editor ou no Obsidian.\n\nA pasta `.compasso` preserva metadados para uma importação exata de volta ao aplicativo. Não é necessário editar esses arquivos.\n'
  });
  return { files, manifest };
}

function vaultEncoder() { return new TextEncoder(); }
function vaultBytes(value) { return value instanceof Uint8Array ? value : vaultEncoder().encode(String(value)); }
function vaultConcat(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach(part => { output.set(part, offset); offset += part.length; });
  return output;
}
function vaultU16(value) { const bytes = new Uint8Array(2); new DataView(bytes.buffer).setUint16(0, value, true); return bytes; }
function vaultU32(value) { const bytes = new Uint8Array(4); new DataView(bytes.buffer).setUint32(0, value >>> 0, true); return bytes; }

const vaultCrcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();
function vaultCrc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) crc = vaultCrcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function vaultDosDateTime(value) {
  const date = value ? new Date(value) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  const year = Math.max(1980, safe.getFullYear());
  const time = (safe.getHours() << 11) | (safe.getMinutes() << 5) | Math.floor(safe.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((safe.getMonth() + 1) << 5) | safe.getDate();
  return { time, day };
}

function vaultBuildZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach(file => {
    const name = vaultBytes(file.path.replace(/^\/+/, ''));
    const data = vaultBytes(file.content);
    const crc = vaultCrc32(data);
    const dos = vaultDosDateTime(file.modified);
    const local = vaultConcat([
      vaultU32(0x04034b50), vaultU16(20), vaultU16(0x0800), vaultU16(0), vaultU16(dos.time), vaultU16(dos.day),
      vaultU32(crc), vaultU32(data.length), vaultU32(data.length), vaultU16(name.length), vaultU16(0), name, data
    ]);
    localParts.push(local);
    centralParts.push(vaultConcat([
      vaultU32(0x02014b50), vaultU16(20), vaultU16(20), vaultU16(0x0800), vaultU16(0), vaultU16(dos.time), vaultU16(dos.day),
      vaultU32(crc), vaultU32(data.length), vaultU32(data.length), vaultU16(name.length), vaultU16(0), vaultU16(0),
      vaultU16(0), vaultU16(0), vaultU32(0), vaultU32(offset), name
    ]));
    offset += local.length;
  });
  const central = vaultConcat(centralParts);
  const end = vaultConcat([
    vaultU32(0x06054b50), vaultU16(0), vaultU16(0), vaultU16(files.length), vaultU16(files.length),
    vaultU32(central.length), vaultU32(offset), vaultU16(0)
  ]);
  return vaultConcat([...localParts, central, end]);
}

function vaultDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function vaultExportZip() {
  if (vaultRuntime.busy) return;
  vaultSetBusy(true, 'Preparando o ZIP do vault…');
  try {
    const model = vaultBuildExportModel();
    const bytes = vaultBuildZip(model.files);
    const date = new Date().toISOString().slice(0, 10);
    vaultDownload(new Blob([bytes], { type: 'application/zip' }), `compasso-vault-${date}.zip`);
    vaultSetStatus(`${model.manifest.notes.length} notas exportadas em Markdown.`, 'success');
    showToast('Vault Markdown exportado');
  } catch (error) {
    console.error(error);
    vaultSetStatus('Não foi possível criar o ZIP do vault.', 'error');
  } finally {
    vaultSetBusy(false);
  }
}

async function vaultWriteDirectory(root, path, content) {
  const segments = path.split('/').filter(Boolean);
  const filename = segments.pop();
  let directory = root;
  for (const segment of segments) directory = await directory.getDirectoryHandle(segment, { create: true });
  const handle = await directory.getFileHandle(filename, { create: true });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function vaultExportDirectory() {
  if (!window.showDirectoryPicker) {
    vaultSetStatus('A exportação para pasta não está disponível neste navegador. Use o ZIP.', 'error');
    return;
  }
  if (vaultRuntime.busy) return;
  try {
    const root = await window.showDirectoryPicker({ mode: 'readwrite' });
    vaultSetBusy(true, 'Gravando arquivos Markdown…');
    const model = vaultBuildExportModel();
    for (const file of model.files) await vaultWriteDirectory(root, file.path, file.content);
    vaultSetStatus(`${model.manifest.notes.length} notas gravadas na pasta escolhida.`, 'success');
    showToast('Vault exportado para a pasta');
  } catch (error) {
    if (error?.name !== 'AbortError') {
      console.error(error);
      vaultSetStatus('Não foi possível gravar o vault na pasta.', 'error');
    }
  } finally {
    vaultSetBusy(false);
  }
}

async function vaultInflateRaw(bytes) {
  if (!('DecompressionStream' in window)) throw new Error('Este navegador não descompacta ZIPs comprimidos. Importe a pasta ou um ZIP criado pelo Compasso.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function vaultFindEocd(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }
  return -1;
}

async function vaultReadZip(file) {
  if (file.size > VAULT_MAX_BYTES) throw new Error('O ZIP excede o limite de 80 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const eocd = vaultFindEocd(bytes);
  if (eocd < 0) throw new Error('O arquivo não parece ser um ZIP válido.');
  const totalEntries = view.getUint16(eocd + 10, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  if (totalEntries > VAULT_MAX_FILES) throw new Error(`O vault excede o limite de ${VAULT_MAX_FILES} arquivos.`);
  const decoder = new TextDecoder('utf-8');
  const output = [];
  let cursor = centralOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < totalEntries; index += 1) {
    if (view.getUint32(cursor, true) !== 0x02014b50) throw new Error('Diretório central do ZIP inválido.');
    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const path = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + nameLength)).replace(/\\/g, '/');
    cursor += 46 + nameLength + extraLength + commentLength;
    if (!path || path.endsWith('/')) continue;
    totalUncompressed += uncompressedSize;
    if (totalUncompressed > VAULT_MAX_BYTES) throw new Error('O conteúdo descompactado excede o limite de 80 MB.');
    if (view.getUint32(localOffset, true) !== 0x04034b50) throw new Error('Entrada local do ZIP inválida.');
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = compressed;
    else if (method === 8) data = await vaultInflateRaw(compressed);
    else throw new Error(`Método de compressão ZIP não suportado: ${method}.`);
    output.push({ path, content: decoder.decode(data), modified: file.lastModified });
  }
  return output;
}

function vaultCommonRoot(paths) {
  const parts = paths.map(path => path.split('/').filter(Boolean));
  if (!parts.length || parts.some(items => items.length < 2)) return '';
  const first = parts[0][0];
  return parts.every(items => items[0] === first) ? first : '';
}

function vaultParseFrontmatter(content) {
  const value = String(content || '');
  if (!value.startsWith('---\n') && !value.startsWith('---\r\n')) return {};
  const normalized = value.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) return {};
  const lines = normalized.slice(4, end).split('\n');
  const metadata = {};
  let listKey = null;
  lines.forEach(line => {
    const list = line.match(/^\s*-\s+(.+)$/);
    if (list && listKey) {
      if (!Array.isArray(metadata[listKey])) metadata[listKey] = [];
      metadata[listKey].push(list[1].replace(/^['"]|['"]$/g, ''));
      return;
    }
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) return;
    const key = match[1];
    const raw = match[2].trim();
    listKey = key;
    if (!raw) { metadata[key] = []; return; }
    try { metadata[key] = JSON.parse(raw); }
    catch {
      if (raw.startsWith('[') && raw.endsWith(']')) metadata[key] = raw.slice(1, -1).split(',').map(item => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      else metadata[key] = raw.replace(/^['"]|['"]$/g, '');
    }
  });
  return metadata;
}

function vaultCleanInputFiles(files) {
  const normalized = files
    .map(file => ({ ...file, path: String(file.path || '').replace(/^\/+/, '').replace(/\\/g, '/') }))
    .filter(file => file.path && !file.path.endsWith('/') && !file.path.includes('/__MACOSX/') && !file.path.startsWith('__MACOSX/'));
  const markdown = normalized.filter(file => /\.md$/i.test(file.path));
  const root = vaultCommonRoot(markdown.map(file => file.path));
  if (!root) return normalized;
  return normalized.map(file => ({ ...file, path: file.path.startsWith(`${root}/`) ? file.path.slice(root.length + 1) : file.path }));
}

function vaultDomainFromPath(path = '') {
  const value = vaultNormalize(path);
  if (value.includes('leitura') || value.includes('livro')) return 'reading';
  if (value.includes('estudo') || value.includes('curso')) return 'study';
  if (value.includes('meta') || value.includes('objetivo')) return 'goal';
  return 'inbox';
}

function vaultBuildImportModel(inputFiles, sourceName) {
  const files = vaultCleanInputFiles(inputFiles);
  const manifestFile = files.find(file => file.path === '.compasso/manifest.json');
  let manifest = null;
  if (manifestFile) {
    try { manifest = JSON.parse(manifestFile.content); }
    catch { throw new Error('O manifesto .compasso/manifest.json está inválido.'); }
  }
  const markdownFiles = files.filter(file => /\.md$/i.test(file.path) && !file.path.startsWith('.compasso/'));
  if (!markdownFiles.length) throw new Error('Nenhum arquivo Markdown foi encontrado.');
  if (markdownFiles.length > VAULT_MAX_FILES) throw new Error(`O vault excede o limite de ${VAULT_MAX_FILES} notas.`);

  const manifestNotes = new Map((manifest?.notes || []).map(note => [note.path, note]));
  const manifestFolders = new Map((manifest?.folders || []).map(folder => [folder.path, folder]));
  const folderPaths = new Set();
  const notes = markdownFiles.map(file => {
    const pathParts = file.path.split('/').filter(Boolean);
    const filename = pathParts.pop();
    const folderPath = pathParts.join('/');
    if (folderPath) folderPaths.add(folderPath);
    for (let i = 1; i < pathParts.length; i += 1) folderPaths.add(pathParts.slice(0, i).join('/'));
    const record = manifestNotes.get(file.path) || {};
    const frontmatter = vaultParseFrontmatter(file.content);
    const title = record.title || frontmatter.title || filename.replace(/\.md$/i, '');
    const tags = record.tags || frontmatter.tags || frontmatter.tag || [];
    return {
      sourcePath: file.path,
      folderPath,
      id: record.id || frontmatter.compasso_id || null,
      title: String(title).trim() || 'Sem título',
      content: String(file.content || ''),
      domain: record.domain || frontmatter.compasso_domain || frontmatter.domain || vaultDomainFromPath(folderPath),
      linkedItemId: record.linkedItemId || frontmatter.compasso_linked_item_id || null,
      linkedItemTitle: record.linkedItemTitle || frontmatter.compasso_linked_item_title || null,
      tags: Array.isArray(tags) ? tags.map(String) : String(tags || '').split(',').map(item => item.trim()).filter(Boolean),
      updated: record.updated || frontmatter.updated || new Date(file.modified || Date.now()).toISOString().slice(0, 10)
    };
  });

  const folders = [...folderPaths].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b, 'pt-BR')).map(path => {
    const record = manifestFolders.get(path);
    const segments = path.split('/');
    return {
      path,
      name: record?.name || segments.at(-1),
      parentPath: record?.parentPath || segments.slice(0, -1).join('/') || null,
      domain: record?.domain || vaultDomainFromPath(path)
    };
  });
  return { sourceName, manifest, folders, notes, warnings: manifest ? [] : ['Vault sem manifesto Compasso: IDs e vínculos serão inferidos quando possível.'] };
}

function vaultCurrentFolderPaths() {
  const byPath = new Map();
  state.data.folders.forEach(folder => {
    const path = folderPath(folder.id).map(item => item.name).join('/');
    byPath.set(vaultNormalize(path), folder);
  });
  return byPath;
}

function vaultResolveLinkedItem(note) {
  const domain = ['reading', 'study', 'goal'].includes(note.domain) ? note.domain : null;
  if (!domain) return { domain: note.domain || 'inbox', linkedItemId: null };
  const items = state.data[domain] || [];
  const byId = note.linkedItemId ? items.find(item => item.id === note.linkedItemId) : null;
  const byTitle = !byId && note.linkedItemTitle ? items.find(item => vaultNormalize(item.title) === vaultNormalize(note.linkedItemTitle)) : null;
  return { domain, linkedItemId: (byId || byTitle)?.id || null };
}

function vaultEnsureFolder(path, modelFolderMap, currentByPath, createdByPath, rootFolder = null) {
  const importFolder = modelFolderMap.get(path);
  if (!rootFolder && importFolder?.id) {
    const existingById = state.data.folders.find(folder => folder.id === importFolder.id);
    if (existingById) return existingById;
  }
  const fullPath = rootFolder ? `${rootFolder.name}/${path}` : path;
  const key = vaultNormalize(fullPath);
  if (createdByPath.has(key)) return createdByPath.get(key);
  if (!rootFolder && currentByPath.has(key)) return currentByPath.get(key);
  const segments = path.split('/').filter(Boolean);
  const parentPath = segments.slice(0, -1).join('/');
  let parent = rootFolder;
  if (parentPath) parent = vaultEnsureFolder(parentPath, modelFolderMap, currentByPath, createdByPath, rootFolder);
  const folder = {
    id: !rootFolder && importFolder?.id && !state.data.folders.some(item => item.id === importFolder.id) ? importFolder.id : `f${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
    name: importFolder?.name || segments.at(-1) || 'Importado',
    parent: parent?.id || null,
    domain: importFolder?.domain || parent?.domain || 'inbox'
  };
  state.data.folders.push(folder);
  createdByPath.set(key, folder);
  return folder;
}

function vaultApplyImport(strategy) {
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
      if (existing) { Object.assign(existing, payload); updated += 1; }
      else {
        state.data.notes.push({ id: strategy !== 'copies' && imported.id && !state.data.notes.some(note => note.id === imported.id) ? imported.id : `n${Date.now()}${Math.random().toString(36).slice(2, 8)}`, ...payload });
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
}

async function vaultReadFolderFiles(fileList) {
  const files = [...fileList];
  if (files.length > VAULT_MAX_FILES) throw new Error(`O vault excede o limite de ${VAULT_MAX_FILES} arquivos.`);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > VAULT_MAX_BYTES) throw new Error('O vault excede o limite de 80 MB.');
  const output = [];
  for (const file of files) {
    const path = file.webkitRelativePath || file.name;
    if (!/\.(md|json)$/i.test(path)) continue;
    output.push({ path, content: await file.text(), modified: file.lastModified });
  }
  return output;
}

async function vaultSelectSource(event, type) {
  const selected = [...event.target.files];
  event.target.value = '';
  if (!selected.length || vaultRuntime.busy) return;
  vaultSetBusy(true, 'Analisando o vault…');
  try {
    const inputFiles = type === 'zip' ? await vaultReadZip(selected[0]) : await vaultReadFolderFiles(selected);
    vaultRuntime.pending = vaultBuildImportModel(inputFiles, type === 'zip' ? selected[0].name : selected[0].webkitRelativePath?.split('/')[0] || 'Pasta selecionada');
    vaultRenderPreview();
    vaultSetStatus('Vault analisado. Escolha como importar.', 'success');
  } catch (error) {
    console.error(error);
    vaultRuntime.pending = null;
    vaultRenderPreview();
    vaultSetStatus(error.message || 'Não foi possível ler o vault.', 'error');
  } finally {
    vaultSetBusy(false);
  }
}

function vaultSetBusy(busy, message = '') {
  vaultRuntime.busy = busy;
  document.querySelectorAll('[data-vault-action], #vaultZipInput, #vaultFolderInput').forEach(element => { element.disabled = busy; });
  if (message) vaultSetStatus(message, 'loading');
}

function vaultSetStatus(message, kind = '') {
  const status = document.getElementById('vaultStatus');
  if (!status) return;
  status.className = `vault-status ${kind}`;
  status.textContent = message || '';
}

function vaultRenderPreview() {
  const preview = document.getElementById('vaultPreview');
  const apply = document.getElementById('vaultApplyBtn');
  if (!preview || !apply) return;
  const model = vaultRuntime.pending;
  apply.disabled = !model;
  if (!model) {
    preview.innerHTML = '<div class="vault-preview-empty"><strong>Nenhum vault selecionado</strong>Escolha um ZIP ou uma pasta contendo arquivos Markdown.</div>';
    return;
  }
  const tags = new Set(model.notes.flatMap(note => note.tags));
  const links = model.notes.reduce((sum, note) => sum + [...note.content.matchAll(/\[\[[^\]]+\]\]/g)].length, 0);
  preview.innerHTML = `
    <div class="vault-preview-head"><div><span>Fonte</span><strong>${escapeHtml(model.sourceName)}</strong></div><span class="vault-manifest ${model.manifest ? 'found' : ''}">${model.manifest ? 'Manifesto Compasso' : 'Markdown externo'}</span></div>
    <div class="vault-preview-grid"><div><strong>${model.notes.length}</strong><span>notas</span></div><div><strong>${model.folders.length}</strong><span>pastas</span></div><div><strong>${tags.size}</strong><span>tags</span></div><div><strong>${links}</strong><span>wikilinks</span></div></div>
    ${model.warnings.length ? `<div class="vault-warning">${model.warnings.map(escapeHtml).join('<br>')}</div>` : ''}`;
}

function installVaultStyles() {
  if (document.getElementById('compassoVaultStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoVaultStyles';
  style.textContent = `
    #vaultDialog{width:min(820px,calc(100vw - 28px));border:0;border-radius:21px;padding:0;background:var(--surface-strong);color:var(--ink);box-shadow:0 28px 90px rgba(24,23,19,.28)}#vaultDialog::backdrop{background:rgba(31,30,27,.58);backdrop-filter:blur(5px)}
    .vault-dialog-head{padding:22px 24px 17px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.vault-dialog-head h2{margin:4px 0 0;font:800 21px/1.2 Manrope,sans-serif;letter-spacing:-.04em}.vault-dialog-head p{margin:7px 0 0;max-width:580px;color:var(--muted);font-size:11px;line-height:1.55}
    .vault-dialog-body{padding:22px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px}.vault-panel{border:1px solid var(--line);border-radius:15px;padding:17px;background:#fbfaf7}.vault-panel h3{margin:4px 0 7px;font:800 15px Manrope,sans-serif}.vault-panel>p{margin:0 0 15px;color:var(--muted);font-size:10px;line-height:1.55}.vault-actions{display:grid;gap:8px}.vault-actions button,.vault-actions label{min-height:41px;border:1px solid var(--line);border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;gap:8px;padding:0 12px;font-size:11px;font-weight:700;cursor:pointer}.vault-actions button.primary{background:#262622;border-color:#262622;color:#fff}.vault-actions svg{width:15px;height:15px}.vault-actions input{display:none}.vault-actions button:disabled,.vault-actions label:has(input:disabled){opacity:.45;cursor:not-allowed}
    .vault-preview{grid-column:1/-1;border:1px solid var(--line);border-radius:15px;padding:17px}.vault-preview-empty{min-height:116px;display:grid;place-items:center;text-align:center;color:var(--muted);font-size:11px}.vault-preview-empty strong{display:block;color:var(--ink);font:800 14px Manrope,sans-serif;margin-bottom:5px}.vault-preview-head{display:flex;align-items:center;justify-content:space-between;gap:15px}.vault-preview-head span{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.vault-preview-head strong{display:block;margin-top:4px;font-size:12px}.vault-manifest{padding:5px 8px;border-radius:999px;background:var(--orange-soft);color:var(--orange)!important;font-weight:800;letter-spacing:0!important;text-transform:none!important}.vault-manifest.found{background:var(--green-soft);color:var(--green)!important}.vault-preview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:14px}.vault-preview-grid div{background:var(--canvas);border-radius:10px;padding:11px}.vault-preview-grid strong{display:block;font:800 17px Manrope,sans-serif}.vault-preview-grid span{color:var(--muted);font-size:9px}.vault-warning{margin-top:12px;padding:10px 12px;border-radius:10px;background:var(--orange-soft);color:#8a4d24;font-size:10px;line-height:1.5}
    .vault-import-options{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.vault-option{border:1px solid var(--line);border-radius:12px;padding:12px;cursor:pointer}.vault-option:has(input:checked){border-color:var(--violet);background:var(--violet-soft)}.vault-option input{margin:0 6px 0 0}.vault-option strong{font-size:11px}.vault-option span{display:block;margin:6px 0 0 21px;color:var(--muted);font-size:9px;line-height:1.45}.vault-option.danger:has(input:checked){border-color:var(--red);background:var(--red-soft)}
    .vault-dialog-foot{padding:15px 24px;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:12px}.vault-status{font-size:10px;color:var(--muted)}.vault-status.success{color:var(--green)}.vault-status.error{color:var(--red)}.vault-status.loading{color:var(--violet)}.vault-dialog-foot .right{display:flex;gap:8px}
    @media(max-width:700px){.vault-dialog-body{grid-template-columns:1fr;padding:17px}.vault-preview,.vault-import-options{grid-column:auto}.vault-import-options{grid-template-columns:1fr}.vault-preview-grid{grid-template-columns:repeat(2,1fr)}.vault-dialog-head,.vault-dialog-foot{padding-left:17px;padding-right:17px}.vault-dialog-foot{align-items:stretch;flex-direction:column}.vault-dialog-foot .right{display:grid;grid-template-columns:1fr 1fr}.vault-dialog-foot button{justify-content:center}}
  `;
  document.head.appendChild(style);
}

function installVaultUi() {
  const tools = document.querySelector('#notesView .tabs-tools');
  if (tools && !document.getElementById('vaultManagerBtn')) tools.insertAdjacentHTML('afterbegin', `<button class="secondary-btn" id="vaultManagerBtn">${icon('folder')}<span>Vault</span></button>`);
  if (document.getElementById('vaultDialog')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="vaultDialog">
      <div class="vault-dialog-head"><div><div class="eyebrow">Atlas portátil</div><h2>Vault Markdown</h2><p>Leve suas notas para o Obsidian ou qualquer editor Markdown e traga um vault de volta sem perder pastas, links e metadados do Compasso.</p></div><button class="close-btn" type="button" data-vault-close>${icon('x')}</button></div>
      <div class="vault-dialog-body">
        <section class="vault-panel"><div class="eyebrow">Exportar</div><h3>Baixar seu Atlas</h3><p>O ZIP funciona em qualquer dispositivo. Em navegadores compatíveis, também é possível gravar diretamente em uma pasta.</p><div class="vault-actions"><button type="button" class="primary" data-vault-action="export-zip">${icon('export')}Exportar ZIP Markdown</button><button type="button" data-vault-action="export-folder">${icon('folder')}Exportar para pasta</button></div></section>
        <section class="vault-panel"><div class="eyebrow">Importar</div><h3>Trazer um vault</h3><p>Selecione um ZIP ou uma pasta. A análise acontece localmente antes de qualquer alteração nos seus dados.</p><div class="vault-actions"><label>${icon('import')}Selecionar ZIP<input id="vaultZipInput" type="file" accept=".zip,application/zip"></label><label>${icon('folder')}Selecionar pasta<input id="vaultFolderInput" type="file" webkitdirectory multiple accept=".md,.json,text/markdown,application/json"></label></div></section>
        <section class="vault-preview" id="vaultPreview"></section>
        <div class="vault-import-options">
          <label class="vault-option"><input type="radio" name="vaultStrategy" value="merge" checked><strong>Mesclar</strong><span>Atualiza correspondências e adiciona o que for novo. É a opção mais segura.</span></label>
          <label class="vault-option"><input type="radio" name="vaultStrategy" value="copies"><strong>Importar como cópias</strong><span>Cria uma pasta de importação separada e não altera notas existentes.</span></label>
          <label class="vault-option danger"><input type="radio" name="vaultStrategy" value="replace"><strong>Substituir o Atlas</strong><span>Remove somente notas e pastas atuais antes da importação.</span></label>
        </div>
      </div>
      <div class="vault-dialog-foot"><div class="vault-status" id="vaultStatus"></div><div class="right"><button class="quiet-btn" type="button" data-vault-close>Cancelar</button><button class="primary-btn" type="button" id="vaultApplyBtn" disabled>${icon('check')}Aplicar importação</button></div></div>
    </dialog>`);
  vaultRenderPreview();
  if (!window.showDirectoryPicker) {
    const folderButton = document.querySelector('[data-vault-action="export-folder"]');
    if (folderButton) { folderButton.disabled = true; folderButton.title = 'Disponível em navegadores Chromium compatíveis'; }
  }
}

installVaultStyles();
installVaultUi();

document.addEventListener('click', event => {
  if (event.target.closest('#vaultManagerBtn')) {
    vaultRuntime.pending = null;
    vaultRenderPreview();
    vaultSetStatus('');
    document.getElementById('vaultDialog').showModal();
  }
  if (event.target.closest('[data-vault-close]')) document.getElementById('vaultDialog')?.close();
  const action = event.target.closest('[data-vault-action]')?.dataset.vaultAction;
  if (action === 'export-zip') vaultExportZip();
  if (action === 'export-folder') vaultExportDirectory();
  if (event.target.closest('#vaultApplyBtn')) {
    const strategy = document.querySelector('input[name="vaultStrategy"]:checked')?.value || 'merge';
    vaultApplyImport(strategy);
  }
});

document.getElementById('vaultZipInput').addEventListener('change', event => vaultSelectSource(event, 'zip'));
document.getElementById('vaultFolderInput').addEventListener('change', event => vaultSelectSource(event, 'folder'));
document.getElementById('vaultDialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
