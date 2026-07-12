/* Compasso · Exportacao Anki e refinamento Obsidian
 * Fase 3.3: gera TSV importavel no Anki e melhora o vault Markdown
 * com frontmatter, tags, links internos e um indice para Obsidian.
 */

const ANKI_OBSIDIAN_VERSION = 1;

function ankiSafeField(value = '') {
  return String(value)
    .replace(/\r?\n/g, '<br>')
    .replace(/\t/g, ' ')
    .trim();
}

function ankiSlug(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'compasso';
}

function ankiCardTags(card) {
  const tags = ['compasso'];
  if (card.domain) tags.push(card.domain);
  if (card.sourceType) tags.push(card.sourceType);
  const linked = card.domain && card.itemId ? recallLinkedItem(card.domain, card.itemId) : null;
  if (linked?.title) tags.push(ankiSlug(linked.title));
  return [...new Set(tags)].join(' ');
}

function exportAnkiTsv() {
  const cards = recallItems();
  if (!cards.length) {
    showToast('Nenhuma pergunta para exportar');
    return;
  }
  const header = ['Front', 'Back', 'Tags', 'Source', 'Due'].join('\t');
  const rows = cards.map(card => [
    ankiSafeField(card.prompt),
    ankiSafeField(card.answer),
    ankiSafeField(ankiCardTags(card)),
    ankiSafeField(recallSourceLabel(card)),
    ankiSafeField(card.dueAt || '')
  ].join('\t'));
  const date = new Date().toISOString().slice(0, 10);
  vaultDownload(new Blob([[header, ...rows].join('\n')], { type: 'text/tab-separated-values;charset=utf-8' }), `compasso-anki-${date}.tsv`);
  showToast(`${cards.length} cards exportados para Anki`);
}

function obsidianYamlValue(value) {
  return JSON.stringify(String(value ?? ''));
}

function obsidianYamlList(values = []) {
  const unique = [...new Set(values.map(item => String(item || '').trim()).filter(Boolean))];
  return unique.length ? unique.map(item => `  - ${obsidianYamlValue(item)}`).join('\n') : '[]';
}

function obsidianNormalizeTag(value = '') {
  return ankiSlug(value).replace(/-/g, '_');
}

function obsidianHasFrontmatter(content = '') {
  return /^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(String(content || ''));
}

function obsidianBuildFrontmatter(note, path) {
  const linked = vaultLinkedItem(note);
  const tags = [
    ...(Array.isArray(note.tags) ? note.tags : []),
    'compasso',
    note.domain || 'inbox',
    linked?.title ? obsidianNormalizeTag(linked.title) : ''
  ].filter(Boolean);
  return [
    '---',
    `title: ${obsidianYamlValue(note.title)}`,
    `compasso_id: ${obsidianYamlValue(note.id)}`,
    `compasso_domain: ${obsidianYamlValue(note.domain || 'inbox')}`,
    `compasso_linked_item_id: ${obsidianYamlValue(note.linkedItemId || '')}`,
    `compasso_linked_item_title: ${obsidianYamlValue(linked?.title || '')}`,
    `updated: ${obsidianYamlValue(note.updated || '')}`,
    `path: ${obsidianYamlValue(path)}`,
    'tags:',
    obsidianYamlList(tags),
    'aliases:',
    obsidianYamlList([note.title, linked?.title].filter(Boolean)),
    '---'
  ].join('\n');
}

function obsidianEnhanceContent(note, path, content) {
  const body = String(content || '').trim();
  const linked = vaultLinkedItem(note);
  const bridge = linked ? [
    '',
    '## Contexto no Compasso',
    '',
    `- Frente vinculada: [[${linked.title}]]`,
    `- Dominio: ${domainLabels[note.domain] || note.domain || 'Inbox'}`,
    `- Progresso: ${clamp(linked.progress)}%`
  ].join('\n') : '';
  if (obsidianHasFrontmatter(body)) return body + bridge;
  return `${obsidianBuildFrontmatter(note, path)}\n\n${body || `# ${note.title}`}${bridge}\n`;
}

function obsidianBuildIndex(model) {
  const notes = model.manifest.notes || [];
  const byDomain = notes.reduce((groups, note) => {
    const key = note.domain || 'inbox';
    groups[key] = groups[key] || [];
    groups[key].push(note);
    return groups;
  }, {});
  const sections = Object.entries(byDomain).map(([domain, items]) => {
    const title = domainLabels[domain] || 'Inbox';
    const links = items
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
      .map(note => `- [[${note.title}]]${note.linkedItemTitle ? ` -> ${note.linkedItemTitle}` : ''}`)
      .join('\n');
    return `## ${title}\n\n${links}`;
  });
  return [
    '# Compasso - Indice do Vault',
    '',
    `Exportado em ${new Date().toLocaleString('pt-BR')}.`,
    '',
    'Use este arquivo como MOC inicial no Obsidian.',
    '',
    ...sections
  ].join('\n');
}

if (typeof vaultBuildExportModel === 'function') {
  const vaultBuildExportModelBase = vaultBuildExportModel;
  vaultBuildExportModel = function() {
    const model = vaultBuildExportModelBase();
    const notesById = new Map(state.data.notes.map(note => [note.id, note]));
    model.files = model.files.map(file => {
      const record = model.manifest.notes.find(note => note.path === file.path);
      const source = record ? notesById.get(record.id) : null;
      if (!source || !/\.md$/i.test(file.path)) return file;
      return { ...file, content: obsidianEnhanceContent(source, file.path, file.content) };
    });
    model.files.push({ path: 'Compasso - Indice.md', content: obsidianBuildIndex(model) });
    model.manifest.obsidian = {
      schemaVersion: ANKI_OBSIDIAN_VERSION,
      enhancedFrontmatter: true,
      indexPath: 'Compasso - Indice.md'
    };
    const manifest = model.files.find(file => file.path === '.compasso/manifest.json');
    if (manifest) manifest.content = JSON.stringify(model.manifest, null, 2);
    return model;
  };
}

function installAnkiObsidianUi() {
  const recallHead = document.querySelector('#recallList')?.closest('.recall-panel')?.querySelector('.recall-panel-head');
  if (recallHead && !document.getElementById('ankiExportBtn')) {
    recallHead.insertAdjacentHTML('beforeend', `<button class="secondary-btn" type="button" id="ankiExportBtn">${icon('export')}Exportar Anki</button>`);
  }
  const vaultButton = document.getElementById('vaultManagerBtn');
  if (vaultButton) vaultButton.title = 'Exporta ZIP Markdown com frontmatter, tags e indice para Obsidian';
}

installAnkiObsidianUi();
const renderAllWithoutAnkiObsidian = renderAll;
renderAll = function() {
  renderAllWithoutAnkiObsidian();
  installAnkiObsidianUi();
};

document.addEventListener('click', event => {
  if (event.target.closest('#ankiExportBtn')) exportAnkiTsv();
});
