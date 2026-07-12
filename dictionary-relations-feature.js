/* Compasso · Dicionário visual de relações
 * Inspirado na estrutura editorial de um dicionário: seções, termos,
 * definições e referências cruzadas. Injetado após as demais features.
 */

labels.dictionary = { title: 'Dicionário', kicker: 'Relações do seu sistema' };

const dictionaryRuntime = {
  filter: 'all',
  query: ''
};

const dictionarySectionOrder = ['reading', 'study', 'goal', 'note'];
const dictionarySectionMeta = {
  reading: { title: 'Leituras', description: 'Livros físicos e digitais que alimentam o sistema.' },
  study: { title: 'Estudos', description: 'Cursos, trilhas e práticas em desenvolvimento.' },
  goal: { title: 'Metas', description: 'Resultados que dão direção ao conhecimento e à execução.' },
  note: { title: 'Notas', description: 'Ideias, sínteses e perguntas conectadas no Atlas pessoal.' }
};

function dictionaryNormalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function dictionaryDomId(key) {
  return `dictionary-${String(key).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

function dictionaryPlainText(markdown = '') {
  const text = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*>]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 'Esta nota ainda não possui uma definição em texto corrido.';
  return text.length > 260 ? `${text.slice(0, 257).trim()}…` : text;
}

function dictionaryWikiLinks(markdown = '') {
  return [...String(markdown).matchAll(/\[\[([^\]]+)\]\]/g)]
    .map(match => match[1].trim())
    .filter(Boolean);
}

function dictionaryItemEntry(domain, item) {
  const metric = metricInfo(item, domain);
  const context = item.meta?.trim() || 'Sem contexto definido.';
  const evidence = item.note?.trim() || '';
  return {
    key: `item:${domain}:${item.id}`,
    kind: 'item',
    section: domain,
    domain,
    id: item.id,
    title: item.title,
    definition: context,
    supporting: evidence ? `Próxima evidência: ${evidence}` : '',
    detail: metricDescription(item, domain),
    status: statusLabels[item.status] || item.status,
    statusKey: item.status,
    searchText: `${item.title} ${context} ${evidence} ${metricDescription(item, domain)}`,
    relations: new Map()
  };
}

function dictionaryNoteEntry(note) {
  const folder = state.data.folders.find(item => item.id === note.folder);
  const tags = Array.isArray(note.tags) ? note.tags : [];
  const definition = dictionaryPlainText(note.content);
  return {
    key: `note:${note.id}`,
    kind: 'note',
    section: 'note',
    domain: note.domain || 'inbox',
    id: note.id,
    title: note.title,
    definition,
    supporting: tags.length ? `Tags: ${tags.join(', ')}` : '',
    detail: folder ? folderPath(folder.id).map(item => item.name).join(' / ') : 'Atlas pessoal',
    status: note.updated ? `Atualizada em ${note.updated}` : 'Nota do Atlas',
    statusKey: 'note',
    searchText: `${note.title} ${definition} ${tags.join(' ')} ${note.content || ''}`,
    relations: new Map()
  };
}

function dictionaryAddRelation(entriesByKey, fromKey, toKey, forwardLabel, reverseLabel) {
  if (!fromKey || !toKey || fromKey === toKey) return;
  const from = entriesByKey.get(fromKey);
  const to = entriesByKey.get(toKey);
  if (!from || !to) return;

  if (!from.relations.has(toKey)) from.relations.set(toKey, new Set());
  from.relations.get(toKey).add(forwardLabel);

  if (!to.relations.has(fromKey)) to.relations.set(fromKey, new Set());
  to.relations.get(fromKey).add(reverseLabel);
}

function dictionaryBuildModel() {
  const entries = [
    ...state.data.reading.map(item => dictionaryItemEntry('reading', item)),
    ...state.data.study.map(item => dictionaryItemEntry('study', item)),
    ...state.data.goal.map(item => dictionaryItemEntry('goal', item)),
    ...state.data.notes.map(dictionaryNoteEntry)
  ];

  const entriesByKey = new Map(entries.map(entry => [entry.key, entry]));
  const notesByTitle = new Map();
  const itemsByTitle = new Map();

  entries.forEach(entry => {
    const normalized = dictionaryNormalize(entry.title);
    if (!normalized) return;
    if (entry.kind === 'note' && !notesByTitle.has(normalized)) notesByTitle.set(normalized, entry.key);
    if (entry.kind === 'item' && !itemsByTitle.has(normalized)) itemsByTitle.set(normalized, entry.key);
  });

  state.data.notes.forEach(note => {
    const noteKey = `note:${note.id}`;

    if (note.linkedItemId) {
      let linkedKey = note.domain && ['reading', 'study', 'goal'].includes(note.domain)
        ? `item:${note.domain}:${note.linkedItemId}`
        : null;
      if (!linkedKey || !entriesByKey.has(linkedKey)) {
        const linkedEntry = entries.find(entry => entry.kind === 'item' && entry.id === note.linkedItemId);
        linkedKey = linkedEntry?.key || null;
      }
      dictionaryAddRelation(entriesByKey, noteKey, linkedKey, 'Vinculada a', 'Nota vinculada');
    }

    dictionaryWikiLinks(note.content).forEach(title => {
      const normalized = dictionaryNormalize(title);
      const targetKey = notesByTitle.get(normalized) || itemsByTitle.get(normalized);
      dictionaryAddRelation(entriesByKey, noteKey, targetKey, 'Conecta a', 'Citada por');
    });
  });

  const undirectedEdges = new Set();
  entries.forEach(entry => {
    entry.relations.forEach((labelsSet, targetKey) => {
      undirectedEdges.add([entry.key, targetKey].sort().join('|'));
    });
  });

  return {
    entries,
    entriesByKey,
    relationCount: undirectedEdges.size,
    isolatedCount: entries.filter(entry => entry.relations.size === 0).length
  };
}

function dictionaryFilteredEntries(model) {
  const query = dictionaryNormalize(dictionaryRuntime.query);
  return model.entries.filter(entry => {
    const relationTitles = [...entry.relations.keys()]
      .map(key => model.entriesByKey.get(key)?.title || '')
      .join(' ');
    const matchesQuery = !query || dictionaryNormalize(`${entry.searchText} ${relationTitles}`).includes(query);
    const matchesFilter = dictionaryRuntime.filter === 'all'
      || dictionaryRuntime.filter === entry.section
      || (dictionaryRuntime.filter === 'connected' && entry.relations.size > 0);
    return matchesQuery && matchesFilter;
  });
}

function dictionaryRelationHtml(entry, model) {
  if (!entry.relations.size) {
    return '<span class="dictionary-isolated">Ainda sem conexões explícitas.</span>';
  }
  return [...entry.relations.entries()]
    .map(([targetKey, labels]) => {
      const target = model.entriesByKey.get(targetKey);
      if (!target) return '';
      const relationLabel = [...labels].join(' · ');
      return `<button type="button" class="dictionary-link" data-dictionary-jump="${escapeHtml(targetKey)}"><span>${escapeHtml(relationLabel)}</span>${escapeHtml(target.title)}</button>`;
    })
    .filter(Boolean)
    .join('');
}

function dictionaryEntryHtml(entry, model) {
  const openValue = entry.kind === 'note' ? `note:${entry.id}` : `${entry.domain}:${entry.id}`;
  return `
    <article class="dictionary-entry" id="${dictionaryDomId(entry.key)}" data-dictionary-key="${escapeHtml(entry.key)}">
      <div class="dictionary-term">
        <button type="button" data-dictionary-open="${escapeHtml(openValue)}">${escapeHtml(entry.title)}</button>
        <span>${escapeHtml(entry.detail)}</span>
      </div>
      <div class="dictionary-definition">
        <p>${escapeHtml(entry.definition)}</p>
        ${entry.supporting ? `<p class="dictionary-supporting">${escapeHtml(entry.supporting)}</p>` : ''}
        <div class="dictionary-meta"><span class="dictionary-state ${escapeHtml(entry.statusKey)}">${escapeHtml(entry.status)}</span><span>${entry.relations.size} ${entry.relations.size === 1 ? 'conexão' : 'conexões'}</span></div>
        <div class="dictionary-relations"><strong>Relaciona-se com</strong>${dictionaryRelationHtml(entry, model)}</div>
      </div>
    </article>`;
}

function dictionarySectionHtml(section, entries, model) {
  const meta = dictionarySectionMeta[section];
  return `
    <section class="dictionary-section" id="dictionary-section-${section}">
      <header><div><div class="eyebrow">${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}</div><h3>${escapeHtml(meta.title)}</h3></div><p>${escapeHtml(meta.description)}</p></header>
      <div class="dictionary-list">${entries.map(entry => dictionaryEntryHtml(entry, model)).join('')}</div>
    </section>`;
}

function installDictionaryStyles() {
  if (document.getElementById('compassoDictionaryStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoDictionaryStyles';
  style.textContent = `
    .dictionary-page{max-width:980px;margin:0 auto;padding:18px 0 70px}.dictionary-intro{padding:28px 0 36px;border-bottom:1px solid var(--ink)}.dictionary-intro h2{max-width:820px;margin:0;font:800 clamp(38px,7vw,76px)/.98 Manrope,sans-serif;letter-spacing:-.075em}.dictionary-intro p{max-width:650px;margin:22px 0 0;color:#55534e;font-size:14px;line-height:1.72}.dictionary-intro-summary{margin-top:18px;font-size:11px;color:var(--muted)}
    .dictionary-toolbar{position:sticky;top:91px;z-index:12;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;background:rgba(243,242,238,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.dictionary-filters{display:flex;align-items:center;gap:5px;flex-wrap:wrap}.dictionary-filter{border:0;background:transparent;padding:7px 8px;cursor:pointer;color:var(--muted);font-size:10px;font-weight:700}.dictionary-filter.active{color:var(--ink);text-decoration:underline;text-underline-offset:4px}.dictionary-search{min-width:260px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--ink);padding:7px 2px}.dictionary-search svg{width:14px;height:14px}.dictionary-search input{width:100%;border:0;outline:0;background:transparent;font-size:11px;color:var(--ink)}
    .dictionary-index{display:flex;gap:17px;flex-wrap:wrap;padding:18px 0 10px}.dictionary-index button{border:0;background:transparent;padding:0;color:var(--muted);font-size:10px;cursor:pointer}.dictionary-index button:hover{color:var(--ink);text-decoration:underline;text-underline-offset:4px}
    .dictionary-section{padding-top:44px;scroll-margin-top:145px}.dictionary-section>header{display:grid;grid-template-columns:minmax(180px,.42fr) minmax(0,1fr);gap:38px;align-items:end;padding-bottom:13px;border-bottom:2px solid var(--ink)}.dictionary-section h3{margin:5px 0 0;font:800 24px/1.1 Manrope,sans-serif;letter-spacing:-.04em}.dictionary-section>header p{margin:0;color:var(--muted);font-size:11px;line-height:1.55;max-width:500px}
    .dictionary-entry{display:grid;grid-template-columns:minmax(180px,.42fr) minmax(0,1fr);gap:38px;padding:19px 0 21px;border-bottom:1px solid var(--line);scroll-margin-top:155px;transition:background .2s ease,padding .2s ease}.dictionary-entry.is-targeted{background:var(--violet-soft);padding-left:12px;padding-right:12px}.dictionary-term button{display:block;border:0;background:transparent;padding:0;text-align:left;font:800 15px/1.3 Manrope,sans-serif;letter-spacing:-.025em;cursor:pointer}.dictionary-term button:hover{text-decoration:underline;text-underline-offset:4px}.dictionary-term>span{display:block;margin-top:7px;color:var(--muted);font-size:9px;line-height:1.45}.dictionary-definition>p{margin:0;color:#373631;font-size:12px;line-height:1.66}.dictionary-definition .dictionary-supporting{margin-top:7px;color:var(--muted);font-size:10px}.dictionary-meta{display:flex;align-items:center;gap:10px;margin-top:10px;color:var(--muted);font-size:9px}.dictionary-state{font-weight:800;color:var(--ink)}.dictionary-state.done{color:var(--green)}.dictionary-state.paused{color:var(--orange)}
    .dictionary-relations{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:12px}.dictionary-relations>strong{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-right:2px}.dictionary-link{border:0;background:transparent;padding:0;color:var(--violet);font-size:9px;cursor:pointer;text-decoration:underline;text-decoration-color:rgba(97,86,201,.28);text-underline-offset:3px}.dictionary-link span{color:var(--muted);text-decoration:none;margin-right:4px}.dictionary-isolated{color:#aaa79f;font-size:9px;font-style:italic}.dictionary-empty{padding:65px 0;text-align:center;color:var(--muted);border-bottom:1px solid var(--line)}.dictionary-empty strong{display:block;color:var(--ink);font:800 18px Manrope,sans-serif;margin-bottom:7px}
    @media(max-width:780px){.dictionary-page{padding-top:0}.dictionary-intro{padding-top:12px}.dictionary-toolbar{top:73px;align-items:stretch;flex-direction:column}.dictionary-search{min-width:0;width:100%}.dictionary-section>header,.dictionary-entry{grid-template-columns:1fr;gap:12px}.dictionary-section>header{align-items:start}.dictionary-section>header p{max-width:none}.dictionary-entry{padding:17px 0}.dictionary-term>span{margin-top:4px}.dictionary-index{gap:12px}.dictionary-intro h2{font-size:42px}}
  `;
  document.head.appendChild(style);
}

function installDictionaryUi() {
  if (!document.querySelector('[data-view="dictionary"]')) {
    const notesNav = document.querySelector('[data-view="notes"]');
    notesNav?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="dictionary">${icon('link')}<span>Dicionário</span><span class="nav-badge" id="dictionaryBadge"></span></button>`);
  }
  if (document.getElementById('dictionaryView')) return;
  document.querySelector('.content')?.insertAdjacentHTML('beforeend', `
    <section class="view" id="dictionaryView">
      <div class="dictionary-page">
        <header class="dictionary-intro">
          <h2>O vocabulário do seu sistema.</h2>
          <p>Leituras, estudos, metas e notas explicados em linguagem clara — com cada ligação explícita entre aquilo que você aprende, registra e pretende realizar.</p>
          <div class="dictionary-intro-summary" id="dictionarySummary"></div>
        </header>
        <div class="dictionary-toolbar">
          <div class="dictionary-filters" id="dictionaryFilters"></div>
          <label class="dictionary-search">${icon('search')}<input id="dictionarySearch" type="search" placeholder="Buscar termo, contexto ou conexão…" autocomplete="off"></label>
        </div>
        <nav class="dictionary-index" id="dictionaryIndex" aria-label="Seções do dicionário"></nav>
        <div id="dictionaryContent"></div>
      </div>
    </section>`);
}

function renderDictionary() {
  const content = document.getElementById('dictionaryContent');
  if (!content) return;
  const model = dictionaryBuildModel();
  const filtered = dictionaryFilteredEntries(model);

  const filterOptions = [
    ['all', 'Tudo'],
    ['reading', 'Leituras'],
    ['study', 'Estudos'],
    ['goal', 'Metas'],
    ['note', 'Notas'],
    ['connected', 'Só conectados']
  ];
  document.getElementById('dictionaryFilters').innerHTML = filterOptions
    .map(([value, label]) => `<button type="button" class="dictionary-filter ${dictionaryRuntime.filter === value ? 'active' : ''}" data-dictionary-filter="${value}">${label}</button>`)
    .join('');
  document.getElementById('dictionarySearch').value = dictionaryRuntime.query;
  document.getElementById('dictionarySummary').textContent = `${model.entries.length} entradas em 4 seções · ${model.relationCount} relações explícitas · ${model.isolatedCount} itens ainda isolados.`;
  const badge = document.getElementById('dictionaryBadge');
  if (badge) badge.textContent = model.relationCount || '—';

  const grouped = Object.fromEntries(dictionarySectionOrder.map(section => [section, filtered
    .filter(entry => entry.section === section)
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))]));
  const visibleSections = dictionarySectionOrder.filter(section => grouped[section].length);

  document.getElementById('dictionaryIndex').innerHTML = visibleSections
    .map(section => `<button type="button" data-dictionary-section="${section}">${dictionarySectionMeta[section].title} · ${grouped[section].length}</button>`)
    .join('');

  if (!filtered.length) {
    content.innerHTML = '<div class="dictionary-empty"><strong>Nenhuma entrada encontrada</strong>Ajuste a busca ou o filtro para ampliar o vocabulário visível.</div>';
    return;
  }

  content.innerHTML = visibleSections
    .map(section => dictionarySectionHtml(section, grouped[section], model))
    .join('');
}

function dictionaryOpen(value) {
  const [type, id] = value.split(':');
  if (type === 'note') {
    openNote(id);
    return;
  }
  openDialog(type, id);
}

function dictionaryJump(key) {
  dictionaryRuntime.filter = 'all';
  dictionaryRuntime.query = '';
  renderDictionary();
  requestAnimationFrame(() => {
    const target = document.getElementById(dictionaryDomId(key));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('is-targeted');
    setTimeout(() => target.classList.remove('is-targeted'), 1800);
  });
}

installDictionaryStyles();
installDictionaryUi();

const renderAllWithoutDictionary = renderAll;
renderAll = function() {
  renderAllWithoutDictionary();
  renderDictionary();
};

document.addEventListener('click', event => {
  const filter = event.target.closest('[data-dictionary-filter]');
  if (filter) {
    dictionaryRuntime.filter = filter.dataset.dictionaryFilter;
    renderDictionary();
  }

  const section = event.target.closest('[data-dictionary-section]');
  if (section) {
    document.getElementById(`dictionary-section-${section.dataset.dictionarySection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const open = event.target.closest('[data-dictionary-open]');
  if (open) dictionaryOpen(open.dataset.dictionaryOpen);

  const jump = event.target.closest('[data-dictionary-jump]');
  if (jump) dictionaryJump(jump.dataset.dictionaryJump);
});

document.getElementById('dictionarySearch').addEventListener('input', event => {
  dictionaryRuntime.query = event.target.value;
  renderDictionary();
});
