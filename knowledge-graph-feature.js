/* Compasso · Grafo interativo de conhecimento
 * Usa o modelo de relações do dicionário para criar uma visualização
 * force-directed local, offline e sem dependências externas.
 */

labels.dictionary = { title: 'Relações', kicker: 'Grafo do conhecimento' };

const graphRuntime = {
  mode: 'graph',
  filter: 'all',
  query: '',
  selectedKey: null,
  nodes: [],
  edges: [],
  nodeByKey: new Map(),
  positions: new Map(),
  signature: '',
  transform: { x: 0, y: 0, k: 1 },
  animationFrame: null,
  alpha: 0,
  initialized: false,
  pointers: new Map(),
  gesture: null,
  drag: null,
  suppressClickUntil: 0,
  resizeObserver: null
};

const graphDomainMeta = {
  reading: { label: 'Leitura', glyph: 'L', color: '#d8783d', soft: '#f6e5d8' },
  study: { label: 'Estudo', glyph: 'E', color: '#6b5fd1', soft: '#e9e6fb' },
  goal: { label: 'Meta', glyph: 'M', color: '#2e816a', soft: '#dff1eb' },
  note: { label: 'Nota', glyph: 'N', color: '#467f9c', soft: '#e0eef5' }
};

function graphHash(value = '') {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function graphClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function graphSectionAnchor(section) {
  const anchors = {
    reading: { x: -250, y: -160 },
    study: { x: 250, y: -150 },
    goal: { x: 0, y: 245 },
    note: { x: 0, y: 0 }
  };
  return anchors[section] || anchors.note;
}

function graphColor(entry) {
  return graphDomainMeta[entry.section]?.color || graphDomainMeta.note.color;
}

function graphOpenValue(entry) {
  return entry.kind === 'note' ? `note:${entry.id}` : `${entry.domain}:${entry.id}`;
}

function graphBuildData() {
  const model = dictionaryBuildModel();
  const visibleEntries = model.entries.filter(entry => {
    if (graphRuntime.filter === 'all') return true;
    if (graphRuntime.filter === 'connected') return entry.relations.size > 0;
    return entry.section === graphRuntime.filter;
  });
  const visibleKeys = new Set(visibleEntries.map(entry => entry.key));
  const edges = [];
  const seen = new Set();

  visibleEntries.forEach(entry => {
    entry.relations.forEach((labelsSet, targetKey) => {
      if (!visibleKeys.has(targetKey)) return;
      const edgeKey = [entry.key, targetKey].sort().join('|');
      if (seen.has(edgeKey)) return;
      seen.add(edgeKey);
      edges.push({ key: edgeKey, sourceKey: entry.key, targetKey, labels: [...labelsSet] });
    });
  });

  const nodes = visibleEntries.map((entry, index) => {
    const degree = [...entry.relations.keys()].filter(key => visibleKeys.has(key)).length;
    const previous = graphRuntime.positions.get(entry.key);
    const anchor = graphSectionAnchor(entry.section);
    const hash = graphHash(entry.key);
    const angle = ((hash % 360) / 180) * Math.PI;
    const distance = 45 + (hash % 130);
    return {
      key: entry.key,
      entry,
      degree,
      radius: graphClamp(10 + degree * 1.45, 11, 24),
      x: previous?.x ?? anchor.x + Math.cos(angle) * distance,
      y: previous?.y ?? anchor.y + Math.sin(angle) * distance,
      vx: 0,
      vy: 0,
      fixed: false,
      index
    };
  });

  const nodeByKey = new Map(nodes.map(node => [node.key, node]));
  edges.forEach(edge => {
    edge.source = nodeByKey.get(edge.sourceKey);
    edge.target = nodeByKey.get(edge.targetKey);
  });

  const signature = JSON.stringify({
    filter: graphRuntime.filter,
    nodes: nodes.map(node => [node.key, node.entry.title, node.degree]),
    edges: edges.map(edge => edge.key)
  });

  return { model, nodes, edges, nodeByKey, signature };
}

function installGraphStyles() {
  if (document.getElementById('compassoKnowledgeGraphStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoKnowledgeGraphStyles';
  style.textContent = `
    .knowledge-mode-switch{display:inline-flex;align-items:center;gap:3px;margin-top:22px;padding:3px;border:1px solid var(--line);border-radius:10px;background:var(--surface-strong)}
    .knowledge-mode-switch button{border:0;background:transparent;color:var(--muted);padding:8px 13px;border-radius:7px;font-size:10px;font-weight:800;cursor:pointer}
    .knowledge-mode-switch button.active{background:var(--ink);color:#fff}
    .knowledge-graph-shell{display:grid;gap:12px;padding-top:18px}.knowledge-graph-shell[hidden]{display:none}
    .graph-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .graph-filter-group,.graph-tool-group{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
    .graph-filter,.graph-tool{border:1px solid var(--line);background:var(--surface-strong);color:var(--muted);border-radius:8px;min-height:35px;padding:0 10px;font-size:9px;font-weight:800;cursor:pointer}
    .graph-filter.active{background:var(--ink);border-color:var(--ink);color:#fff}
    .graph-tool{width:35px;padding:0;display:grid;place-items:center;color:var(--ink)}.graph-tool svg{width:14px;height:14px}
    .graph-search-wrap{position:relative;min-width:min(330px,100%);flex:1;max-width:430px}
    .graph-search{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:0 11px;min-height:38px}
    .graph-search svg{width:14px;height:14px;color:var(--muted)}.graph-search input{width:100%;border:0;outline:0;background:transparent;font-size:10px;color:var(--ink)}
    .graph-search-results{position:absolute;z-index:30;left:0;right:0;top:calc(100% + 5px);background:var(--surface-strong);border:1px solid var(--line);border-radius:11px;box-shadow:var(--shadow);padding:5px;max-height:290px;overflow:auto}
    .graph-search-results[hidden]{display:none}
    .graph-search-result{width:100%;border:0;background:transparent;text-align:left;padding:10px;border-radius:8px;cursor:pointer;display:grid;grid-template-columns:28px minmax(0,1fr);gap:9px;align-items:center}
    .graph-search-result:hover,.graph-search-result:focus{background:var(--violet-soft);outline:0}
    .graph-search-result i{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:9px;font-weight:900}
    .graph-search-result strong{display:block;font-size:10px}.graph-search-result span{display:block;color:var(--muted);font-size:8px;margin-top:3px}
    .graph-stage{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 310px;min-height:680px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#f9f8f4;box-shadow:var(--shadow)}
    .graph-canvas{position:relative;min-width:0;overflow:hidden;background:radial-gradient(circle at 20% 20%,rgba(216,120,61,.07),transparent 32%),radial-gradient(circle at 80% 18%,rgba(107,95,209,.07),transparent 30%),radial-gradient(circle at 50% 84%,rgba(46,129,106,.06),transparent 30%),#f9f8f4}
    .graph-canvas::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(37,37,33,.13) .65px,transparent .65px);background-size:18px 18px;pointer-events:none}
    .graph-svg{position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;user-select:none}.graph-svg.is-panning{cursor:grabbing}
    .graph-edge{stroke:#a9a69d;stroke-opacity:.42;stroke-width:1.1;vector-effect:non-scaling-stroke;transition:stroke-opacity .18s ease,stroke-width .18s ease}
    .graph-edge.is-neighbor{stroke:#6156c9;stroke-opacity:.82;stroke-width:1.8}.graph-edge.is-dimmed{stroke-opacity:.08}
    .graph-node{cursor:pointer;outline:none}.graph-node-halo{fill:none;stroke:#6156c9;stroke-width:3;stroke-opacity:0;vector-effect:non-scaling-stroke}
    .graph-node-circle{stroke:#fff;stroke-width:2.2;vector-effect:non-scaling-stroke;filter:drop-shadow(0 3px 5px rgba(28,27,23,.12));transition:opacity .18s ease}
    .graph-node-glyph{font:900 8px Manrope,sans-serif;fill:#fff;pointer-events:none;text-anchor:middle;dominant-baseline:central}
    .graph-node-label{font:800 9px Manrope,sans-serif;fill:#302f2a;text-anchor:middle;paint-order:stroke;stroke:#f9f8f4;stroke-width:4px;stroke-linejoin:round;pointer-events:none}
    .graph-node.is-selected .graph-node-halo{stroke-opacity:1}.graph-node.is-selected .graph-node-circle{stroke:#6156c9;stroke-width:3}
    .graph-node.is-neighbor .graph-node-circle{stroke:#6156c9}.graph-node.is-dimmed{opacity:.14}.graph-node.is-match .graph-node-halo{stroke:#d8783d;stroke-opacity:1;stroke-dasharray:4 3}
    .graph-empty{position:absolute;inset:0;display:grid;place-items:center;text-align:center;color:var(--muted);font-size:11px;padding:30px}.graph-empty strong{display:block;color:var(--ink);font:800 17px Manrope,sans-serif;margin-bottom:6px}
    .graph-legend{position:absolute;left:14px;bottom:13px;display:flex;gap:10px;flex-wrap:wrap;padding:8px 10px;border:1px solid rgba(205,202,193,.75);border-radius:10px;background:rgba(249,248,244,.88);backdrop-filter:blur(8px);font-size:8px;color:var(--muted);pointer-events:none}
    .graph-legend span{display:flex;align-items:center;gap:5px}.graph-legend i{width:8px;height:8px;border-radius:50%}
    .graph-help{position:absolute;right:14px;bottom:13px;padding:8px 10px;border-radius:9px;background:rgba(37,37,33,.86);color:#fff;font-size:8px;pointer-events:none}
    .graph-inspector{border-left:1px solid var(--line);background:var(--surface-strong);padding:20px;overflow:auto}
    .graph-inspector-empty{height:100%;display:grid;place-items:center;text-align:center;color:var(--muted);font-size:10px;line-height:1.55}.graph-inspector-empty strong{display:block;color:var(--ink);font:800 15px Manrope,sans-serif;margin-bottom:6px}
    .graph-inspector-type{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}
    .graph-inspector h3{margin:13px 0 8px;font:800 22px/1.15 Manrope,sans-serif;letter-spacing:-.04em}.graph-inspector-definition{margin:0;color:#4e4c46;font-size:10px;line-height:1.65}.graph-inspector-supporting{margin:9px 0 0;color:var(--muted);font-size:9px;line-height:1.55}
    .graph-inspector-meta{display:grid;gap:7px;margin:16px 0;padding:12px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);font-size:9px;color:var(--muted)}
    .graph-inspector-meta div{display:flex;justify-content:space-between;gap:12px}.graph-inspector-meta strong{color:var(--ink);text-align:right}
    .graph-inspector-relations{display:grid;gap:7px}.graph-inspector-relations>strong{font-size:9px;text-transform:uppercase;letter-spacing:.1em}
    .graph-relation-button{width:100%;border:1px solid var(--line);background:#fff;border-radius:9px;padding:9px;text-align:left;cursor:pointer}.graph-relation-button:hover{border-color:#6156c9}.graph-relation-button b{display:block;font-size:9px}.graph-relation-button span{display:block;color:var(--muted);font-size:8px;margin-top:3px}
    .graph-open-button{width:100%;margin-top:16px;justify-content:center}
    @media(max-width:980px){.graph-stage{grid-template-columns:1fr;min-height:760px}.graph-canvas{min-height:520px}.graph-inspector{border-left:0;border-top:1px solid var(--line);max-height:280px}.graph-inspector-empty{min-height:150px}}
    @media(max-width:680px){.dictionary-page{max-width:none}.graph-toolbar{align-items:stretch}.graph-search-wrap{min-width:100%;max-width:none;order:-1}.graph-filter-group{overflow-x:auto;flex-wrap:nowrap;padding-bottom:3px}.graph-filter{white-space:nowrap}.graph-stage{min-height:690px;border-radius:14px}.graph-canvas{min-height:470px}.graph-help{display:none}.graph-legend{right:12px}.knowledge-mode-switch{margin-top:17px}}
  `;
  document.head.appendChild(style);
}

function installGraphUi() {
  const page = document.querySelector('#dictionaryView .dictionary-page');
  const intro = page?.querySelector('.dictionary-intro');
  if (!page || !intro || document.getElementById('knowledgeGraphShell')) return;

  intro.insertAdjacentHTML('beforeend', `<div class="knowledge-mode-switch" role="group" aria-label="Modo de visualização"><button type="button" class="active" data-knowledge-mode="graph">Grafo</button><button type="button" data-knowledge-mode="dictionary">Dicionário</button></div>`);
  intro.insertAdjacentHTML('afterend', `
    <section class="knowledge-graph-shell" id="knowledgeGraphShell">
      <div class="graph-toolbar">
        <div class="graph-filter-group" id="graphFilters"></div>
        <div class="graph-search-wrap"><label class="graph-search">${icon('search')}<input id="graphSearch" type="search" placeholder="Localizar nota, leitura, estudo ou meta…" autocomplete="off"></label><div class="graph-search-results" id="graphSearchResults" hidden></div></div>
        <div class="graph-tool-group"><button type="button" class="graph-tool" data-graph-zoom="-1" aria-label="Diminuir zoom">−</button><button type="button" class="graph-tool" data-graph-zoom="1" aria-label="Aumentar zoom">+</button><button type="button" class="graph-tool" data-graph-fit aria-label="Enquadrar grafo">${icon('target')}</button></div>
      </div>
      <div class="graph-stage">
        <div class="graph-canvas" id="graphCanvas">
          <svg class="graph-svg" id="knowledgeGraphSvg" aria-label="Grafo interativo das relações do Compasso"><g id="graphViewport"><g id="graphEdges"></g><g id="graphNodes"></g></g></svg>
          <div class="graph-empty" id="graphEmpty" hidden></div>
          <div class="graph-legend">${Object.entries(graphDomainMeta).map(([key, meta]) => `<span><i style="background:${meta.color}"></i>${meta.label}</span>`).join('')}</div>
          <div class="graph-help">Arraste para mover · role ou pince para zoom</div>
        </div>
        <aside class="graph-inspector" id="graphInspector"></aside>
      </div>
    </section>`);

  const navLabel = document.querySelector('[data-view="dictionary"] span:not(.nav-badge)');
  if (navLabel) navLabel.textContent = 'Relações';
}

function graphApplyMode() {
  const isGraph = graphRuntime.mode === 'graph';
  const graphShell = document.getElementById('knowledgeGraphShell');
  const dictionaryToolbar = document.querySelector('#dictionaryView .dictionary-toolbar');
  const dictionaryIndex = document.getElementById('dictionaryIndex');
  const dictionaryContent = document.getElementById('dictionaryContent');
  const introTitle = document.querySelector('#dictionaryView .dictionary-intro h2');
  const introText = document.querySelector('#dictionaryView .dictionary-intro p');

  if (graphShell) graphShell.hidden = !isGraph;
  if (dictionaryToolbar) dictionaryToolbar.hidden = isGraph;
  if (dictionaryIndex) dictionaryIndex.hidden = isGraph;
  if (dictionaryContent) dictionaryContent.hidden = isGraph;
  document.querySelectorAll('[data-knowledge-mode]').forEach(button => button.classList.toggle('active', button.dataset.knowledgeMode === graphRuntime.mode));

  if (introTitle) introTitle.textContent = isGraph ? 'O mapa vivo do seu sistema.' : 'O vocabulário do seu sistema.';
  if (introText) introText.textContent = isGraph ? 'Explore visualmente como leituras, estudos, metas e notas se conectam. Selecione um nó para revelar seu contexto e as relações que sustentam o seu conhecimento.' : 'Leituras, estudos, metas e notas explicados em linguagem clara — com cada ligação explícita entre aquilo que você aprende, registra e pretende realizar.';

  if (isGraph) {
    graphRender();
    requestAnimationFrame(() => { graphResize(); if (!graphRuntime.initialized) graphFit(); });
  } else renderDictionary();
}

function graphRenderFilters() {
  const options = [['all','Tudo'],['reading','Leituras'],['study','Estudos'],['goal','Metas'],['note','Notas'],['connected','Só conectados']];
  document.getElementById('graphFilters').innerHTML = options.map(([value,label]) => `<button type="button" class="graph-filter ${graphRuntime.filter === value ? 'active' : ''}" data-graph-filter="${value}">${label}</button>`).join('');
}

function graphInitialInspector() {
  document.getElementById('graphInspector').innerHTML = `<div class="graph-inspector-empty"><div><strong>Selecione um nó</strong>Veja a definição, o estado e todas as relações diretas. Dê dois cliques para abrir a origem.</div></div>`;
}

function graphRenderInspector() {
  const inspector = document.getElementById('graphInspector');
  const node = graphRuntime.nodeByKey.get(graphRuntime.selectedKey);
  if (!node) { graphInitialInspector(); return; }
  const entry = node.entry;
  const meta = graphDomainMeta[entry.section] || graphDomainMeta.note;
  const relationButtons = [...entry.relations.entries()].filter(([targetKey]) => graphRuntime.nodeByKey.has(targetKey)).map(([targetKey,labels]) => {
    const target = graphRuntime.nodeByKey.get(targetKey)?.entry;
    if (!target) return '';
    return `<button type="button" class="graph-relation-button" data-graph-focus="${escapeHtml(targetKey)}"><b>${escapeHtml(target.title)}</b><span>${escapeHtml([...labels].join(' · '))}</span></button>`;
  }).join('');

  inspector.innerHTML = `<span class="graph-inspector-type" style="color:${meta.color};background:${meta.soft}">${escapeHtml(meta.label)}</span><h3>${escapeHtml(entry.title)}</h3><p class="graph-inspector-definition">${escapeHtml(entry.definition)}</p>${entry.supporting ? `<p class="graph-inspector-supporting">${escapeHtml(entry.supporting)}</p>` : ''}<div class="graph-inspector-meta"><div><span>Contexto</span><strong>${escapeHtml(entry.detail)}</strong></div><div><span>Estado</span><strong>${escapeHtml(entry.status)}</strong></div><div><span>Conexões visíveis</span><strong>${node.degree}</strong></div></div><div class="graph-inspector-relations"><strong>Relações diretas</strong>${relationButtons || '<span class="dictionary-isolated">Nenhuma relação visível com o filtro atual.</span>'}</div><button type="button" class="primary-btn graph-open-button" data-graph-open="${escapeHtml(graphOpenValue(entry))}">Abrir origem</button>`;
}

function graphCreateSvgNode(node) {
  const ns = 'http://www.w3.org/2000/svg';
  const group = document.createElementNS(ns,'g');
  group.setAttribute('class','graph-node'); group.setAttribute('data-graph-node',node.key); group.setAttribute('tabindex','0'); group.setAttribute('role','button'); group.setAttribute('aria-label',`${graphDomainMeta[node.entry.section]?.label || 'Item'}: ${node.entry.title}`);
  const halo = document.createElementNS(ns,'circle'); halo.setAttribute('class','graph-node-halo'); halo.setAttribute('r',String(node.radius + 5));
  const circle = document.createElementNS(ns,'circle'); circle.setAttribute('class','graph-node-circle'); circle.setAttribute('r',String(node.radius)); circle.setAttribute('fill',graphColor(node.entry));
  const glyph = document.createElementNS(ns,'text'); glyph.setAttribute('class','graph-node-glyph'); glyph.textContent = graphDomainMeta[node.entry.section]?.glyph || 'N';
  const label = document.createElementNS(ns,'text'); label.setAttribute('class','graph-node-label'); label.setAttribute('y',String(node.radius + 15)); label.textContent = node.entry.title.length > 28 ? `${node.entry.title.slice(0,27)}…` : node.entry.title;
  group.append(halo,circle,glyph,label); return group;
}

function graphBuildDom() {
  const edgeContainer = document.getElementById('graphEdges');
  const nodeContainer = document.getElementById('graphNodes');
  const empty = document.getElementById('graphEmpty');
  edgeContainer.innerHTML = ''; nodeContainer.innerHTML = '';
  graphRuntime.edges.forEach(edge => { const line = document.createElementNS('http://www.w3.org/2000/svg','line'); line.setAttribute('class','graph-edge'); line.setAttribute('data-graph-edge',edge.key); edge.element = line; edgeContainer.appendChild(line); });
  graphRuntime.nodes.forEach(node => { node.element = graphCreateSvgNode(node); nodeContainer.appendChild(node.element); });
  empty.hidden = graphRuntime.nodes.length > 0;
  if (!graphRuntime.nodes.length) empty.innerHTML = '<div><strong>Nenhum nó visível</strong>Ajuste o filtro para ampliar o mapa.</div>';
  graphRenderInspector(); graphUpdateDom();
}

function graphUpdateDom() {
  graphRuntime.edges.forEach(edge => { if (!edge.source || !edge.target || !edge.element) return; edge.element.setAttribute('x1',edge.source.x.toFixed(2)); edge.element.setAttribute('y1',edge.source.y.toFixed(2)); edge.element.setAttribute('x2',edge.target.x.toFixed(2)); edge.element.setAttribute('y2',edge.target.y.toFixed(2)); });
  graphRuntime.nodes.forEach(node => { node.element?.setAttribute('transform',`translate(${node.x.toFixed(2)} ${node.y.toFixed(2)})`); graphRuntime.positions.set(node.key,{x:node.x,y:node.y}); });
  graphUpdateTransform(); graphUpdateHighlights();
}

function graphUpdateTransform() { const viewport = document.getElementById('graphViewport'); if (!viewport) return; const {x,y,k} = graphRuntime.transform; viewport.setAttribute('transform',`translate(${x} ${y}) scale(${k})`); }
function graphNeighborKeys(key) { const node = graphRuntime.nodeByKey.get(key); return new Set(node ? [...node.entry.relations.keys()].filter(target => graphRuntime.nodeByKey.has(target)) : []); }
function graphMatchingKeys() { const query = dictionaryNormalize(graphRuntime.query); if (!query) return new Set(); return new Set(graphRuntime.nodes.filter(node => { const relationTitles = [...node.entry.relations.keys()].map(key => graphRuntime.nodeByKey.get(key)?.entry.title || '').join(' '); return dictionaryNormalize(`${node.entry.searchText} ${relationTitles}`).includes(query); }).map(node => node.key)); }

function graphUpdateHighlights() {
  const selected = graphRuntime.selectedKey; const neighbors = graphNeighborKeys(selected); const matches = graphMatchingKeys();
  graphRuntime.nodes.forEach(node => { const isSelected = node.key === selected; const isNeighbor = neighbors.has(node.key); const shouldDim = Boolean(selected) && !isSelected && !isNeighbor; node.element?.classList.toggle('is-selected',isSelected); node.element?.classList.toggle('is-neighbor',isNeighbor); node.element?.classList.toggle('is-dimmed',shouldDim); node.element?.classList.toggle('is-match',matches.has(node.key)); });
  graphRuntime.edges.forEach(edge => { const isNeighbor = Boolean(selected) && (edge.sourceKey === selected || edge.targetKey === selected); edge.element?.classList.toggle('is-neighbor',isNeighbor); edge.element?.classList.toggle('is-dimmed',Boolean(selected) && !isNeighbor); });
}

function graphSimulateStep() {
  const nodes = graphRuntime.nodes; const edges = graphRuntime.edges; const alpha = graphRuntime.alpha;
  if (!nodes.length || alpha < 0.008) { graphRuntime.animationFrame = null; graphUpdateDom(); return; }
  for (let i = 0; i < nodes.length; i += 1) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j += 1) {
      const b = nodes[j]; let dx = b.x-a.x; let dy = b.y-a.y; let distanceSquared = dx*dx+dy*dy;
      if (distanceSquared < .01) { dx = ((graphHash(`${a.key}:${b.key}`)%20)-10)/10; dy = ((graphHash(`${b.key}:${a.key}`)%20)-10)/10; distanceSquared = dx*dx+dy*dy; }
      const distance = Math.sqrt(distanceSquared); const minDistance = a.radius+b.radius+12; const repulsion = (1250*alpha)/Math.max(distanceSquared,120); const collision = distance < minDistance ? (minDistance-distance)*.08*alpha : 0; const force = repulsion+collision; const fx = (dx/distance)*force; const fy = (dy/distance)*force;
      if (!a.fixed) { a.vx -= fx; a.vy -= fy; } if (!b.fixed) { b.vx += fx; b.vy += fy; }
    }
  }
  edges.forEach(edge => { const source = edge.source; const target = edge.target; if (!source || !target) return; const dx = target.x-source.x; const dy = target.y-source.y; const distance = Math.max(1,Math.sqrt(dx*dx+dy*dy)); const desired = 95+source.radius+target.radius; const spring = (distance-desired)*.0065*alpha; const fx = (dx/distance)*spring; const fy = (dy/distance)*spring; if (!source.fixed) { source.vx += fx; source.vy += fy; } if (!target.fixed) { target.vx -= fx; target.vy -= fy; } });
  nodes.forEach(node => { const anchor = graphSectionAnchor(node.entry.section); const anchorStrength = node.entry.section === 'note' ? .0014 : .0021; if (!node.fixed) { node.vx += (anchor.x-node.x)*anchorStrength*alpha; node.vy += (anchor.y-node.y)*anchorStrength*alpha; node.vx += -node.x*.0007*alpha; node.vy += -node.y*.0007*alpha; node.vx *= .82; node.vy *= .82; node.x += node.vx; node.y += node.vy; } });
  graphRuntime.alpha *= .972; graphUpdateDom(); graphRuntime.animationFrame = requestAnimationFrame(graphSimulateStep);
}

function graphReheat(alpha = .9) { graphRuntime.alpha = Math.max(graphRuntime.alpha,alpha); if (!graphRuntime.animationFrame) graphRuntime.animationFrame = requestAnimationFrame(graphSimulateStep); }
function graphResize() { const canvas = document.getElementById('graphCanvas'); const svg = document.getElementById('knowledgeGraphSvg'); if (!canvas || !svg) return; const width = Math.max(320,canvas.clientWidth); const height = Math.max(420,canvas.clientHeight); svg.setAttribute('viewBox',`0 0 ${width} ${height}`); svg.dataset.width = String(width); svg.dataset.height = String(height); if (!graphRuntime.initialized) { graphRuntime.transform = {x:width/2,y:height/2,k:1}; graphUpdateTransform(); } }

function graphFit() {
  const svg = document.getElementById('knowledgeGraphSvg'); if (!svg || !graphRuntime.nodes.length) return;
  const width = positiveNumber(svg.dataset.width)||700; const height = positiveNumber(svg.dataset.height)||600;
  const minX = Math.min(...graphRuntime.nodes.map(node => node.x-node.radius-45)); const maxX = Math.max(...graphRuntime.nodes.map(node => node.x+node.radius+45)); const minY = Math.min(...graphRuntime.nodes.map(node => node.y-node.radius-35)); const maxY = Math.max(...graphRuntime.nodes.map(node => node.y+node.radius+35));
  const graphWidth = Math.max(120,maxX-minX); const graphHeight = Math.max(120,maxY-minY); const scale = graphClamp(Math.min((width-70)/graphWidth,(height-70)/graphHeight),.25,1.65);
  graphRuntime.transform = {x:width/2-((minX+maxX)/2)*scale,y:height/2-((minY+maxY)/2)*scale,k:scale}; graphRuntime.initialized = true; graphUpdateTransform();
}

function graphZoomAt(clientX,clientY,multiplier) { const svg = document.getElementById('knowledgeGraphSvg'); if (!svg) return; const rect = svg.getBoundingClientRect(); const px = clientX-rect.left; const py = clientY-rect.top; const current = graphRuntime.transform; const nextK = graphClamp(current.k*multiplier,.22,3.8); const worldX = (px-current.x)/current.k; const worldY = (py-current.y)/current.k; graphRuntime.transform = {x:px-worldX*nextK,y:py-worldY*nextK,k:nextK}; graphUpdateTransform(); }
function graphScreenToWorld(clientX,clientY) { const svg = document.getElementById('knowledgeGraphSvg'); const rect = svg.getBoundingClientRect(); return {x:(clientX-rect.left-graphRuntime.transform.x)/graphRuntime.transform.k,y:(clientY-rect.top-graphRuntime.transform.y)/graphRuntime.transform.k}; }

function graphFocus(key,center=true) { const node = graphRuntime.nodeByKey.get(key); if (!node) return; graphRuntime.selectedKey = key; graphRenderInspector(); graphUpdateHighlights(); if (center) { const svg = document.getElementById('knowledgeGraphSvg'); const width = positiveNumber(svg?.dataset.width)||700; const height = positiveNumber(svg?.dataset.height)||600; const k = Math.max(graphRuntime.transform.k,1); graphRuntime.transform = {x:width/2-node.x*k,y:height/2-node.y*k,k}; graphUpdateTransform(); } }

function graphSearchResults() {
  const container = document.getElementById('graphSearchResults'); const query = dictionaryNormalize(graphRuntime.query);
  if (!query) { container.hidden = true; container.innerHTML = ''; graphUpdateHighlights(); return; }
  const matches = graphRuntime.nodes.filter(node => dictionaryNormalize(`${node.entry.title} ${node.entry.searchText}`).includes(query)).sort((a,b) => { const aStarts = dictionaryNormalize(a.entry.title).startsWith(query)?0:1; const bStarts = dictionaryNormalize(b.entry.title).startsWith(query)?0:1; return aStarts-bStarts || a.entry.title.localeCompare(b.entry.title,'pt-BR'); }).slice(0,8);
  container.innerHTML = matches.map(node => { const meta = graphDomainMeta[node.entry.section] || graphDomainMeta.note; return `<button type="button" class="graph-search-result" data-graph-focus="${escapeHtml(node.key)}"><i style="color:${meta.color};background:${meta.soft}">${meta.glyph}</i><span><strong>${escapeHtml(node.entry.title)}</strong><span>${escapeHtml(meta.label)} · ${node.degree} conexões</span></span></button>`; }).join('') || '<div class="graph-inspector-empty" style="min-height:90px"><div><strong>Nenhum resultado</strong>Tente outro termo.</div></div>';
  container.hidden = false; graphUpdateHighlights();
}

function graphRender(forceFit=false) {
  if (graphRuntime.mode !== 'graph' || !document.getElementById('knowledgeGraphShell')) return;
  graphRenderFilters(); const data = graphBuildData(); const changed = data.signature !== graphRuntime.signature;
  graphRuntime.nodes = data.nodes; graphRuntime.edges = data.edges; graphRuntime.nodeByKey = data.nodeByKey; graphRuntime.signature = data.signature;
  if (graphRuntime.selectedKey && !graphRuntime.nodeByKey.has(graphRuntime.selectedKey)) graphRuntime.selectedKey = null;
  if (changed) { if (graphRuntime.animationFrame) cancelAnimationFrame(graphRuntime.animationFrame); graphRuntime.animationFrame = null; graphBuildDom(); graphReheat(1); requestAnimationFrame(() => { graphResize(); if (forceFit || !graphRuntime.initialized) setTimeout(graphFit,80); }); } else { graphRenderInspector(); graphUpdateHighlights(); }
  const summary = document.getElementById('dictionarySummary'); if (summary) summary.textContent = `${graphRuntime.nodes.length} nós visíveis · ${graphRuntime.edges.length} conexões · ${data.model.isolatedCount} itens isolados no sistema.`;
  const badge = document.getElementById('dictionaryBadge'); if (badge) badge.textContent = data.model.relationCount || '—';
}

function graphPointerDown(event) {
  const svg = document.getElementById('knowledgeGraphSvg'); if (!svg) return; svg.setPointerCapture?.(event.pointerId); graphRuntime.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  const nodeElement = event.target.closest?.('[data-graph-node]'); const nodeKey = nodeElement?.dataset.graphNode;
  if (graphRuntime.pointers.size === 2) { const points = [...graphRuntime.pointers.values()]; const distance = Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y); graphRuntime.gesture = {type:'pinch',distance,transform:{...graphRuntime.transform},midpoint:{x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}}; graphRuntime.drag = null; return; }
  if (nodeKey) { const node = graphRuntime.nodeByKey.get(nodeKey); if (!node) return; node.fixed = true; graphRuntime.drag = {key:nodeKey,startX:event.clientX,startY:event.clientY,moved:false}; graphReheat(.45); }
  else { graphRuntime.gesture = {type:'pan',startX:event.clientX,startY:event.clientY,transform:{...graphRuntime.transform}}; svg.classList.add('is-panning'); }
}

function graphPointerMove(event) {
  if (!graphRuntime.pointers.has(event.pointerId)) return; graphRuntime.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if (graphRuntime.pointers.size >= 2) { const points = [...graphRuntime.pointers.values()].slice(0,2); const distance = Math.max(1,Math.hypot(points[1].x-points[0].x,points[1].y-points[0].y)); const midpoint = {x:(points[0].x+points[1].x)/2,y:(points[0].y+points[1].y)/2}; if (!graphRuntime.gesture || graphRuntime.gesture.type !== 'pinch') graphRuntime.gesture = {type:'pinch',distance,transform:{...graphRuntime.transform},midpoint}; const svg = document.getElementById('knowledgeGraphSvg'); const rect = svg.getBoundingClientRect(); const start = graphRuntime.gesture; const nextK = graphClamp(start.transform.k*(distance/start.distance),.22,3.8); const startPx = start.midpoint.x-rect.left; const startPy = start.midpoint.y-rect.top; const worldX = (startPx-start.transform.x)/start.transform.k; const worldY = (startPy-start.transform.y)/start.transform.k; const currentPx = midpoint.x-rect.left; const currentPy = midpoint.y-rect.top; graphRuntime.transform = {x:currentPx-worldX*nextK,y:currentPy-worldY*nextK,k:nextK}; graphUpdateTransform(); return; }
  if (graphRuntime.drag) { const node = graphRuntime.nodeByKey.get(graphRuntime.drag.key); if (!node) return; const point = graphScreenToWorld(event.clientX,event.clientY); node.x = point.x; node.y = point.y; node.vx = 0; node.vy = 0; if (Math.hypot(event.clientX-graphRuntime.drag.startX,event.clientY-graphRuntime.drag.startY)>4) graphRuntime.drag.moved = true; graphUpdateDom(); return; }
  if (graphRuntime.gesture?.type === 'pan') { const dx = event.clientX-graphRuntime.gesture.startX; const dy = event.clientY-graphRuntime.gesture.startY; graphRuntime.transform = {...graphRuntime.gesture.transform,x:graphRuntime.gesture.transform.x+dx,y:graphRuntime.gesture.transform.y+dy}; graphUpdateTransform(); }
}

function graphPointerUp(event) {
  const svg = document.getElementById('knowledgeGraphSvg'); graphRuntime.pointers.delete(event.pointerId);
  if (graphRuntime.drag) { const node = graphRuntime.nodeByKey.get(graphRuntime.drag.key); if (node) node.fixed = false; if (graphRuntime.drag.moved) graphRuntime.suppressClickUntil = Date.now()+250; graphRuntime.drag = null; graphReheat(.3); }
  if (graphRuntime.pointers.size < 2 && graphRuntime.gesture?.type === 'pinch') graphRuntime.gesture = null;
  if (graphRuntime.pointers.size === 0) { graphRuntime.gesture = null; svg?.classList.remove('is-panning'); }
  try { svg?.releasePointerCapture?.(event.pointerId); } catch {}
}

function installGraphInteractions() {
  const svg = document.getElementById('knowledgeGraphSvg'); if (!svg || svg.dataset.bound === 'true') return; svg.dataset.bound = 'true';
  svg.addEventListener('wheel',event => { event.preventDefault(); graphZoomAt(event.clientX,event.clientY,event.deltaY<0?1.12:.89); },{passive:false});
  svg.addEventListener('pointerdown',graphPointerDown); svg.addEventListener('pointermove',graphPointerMove); svg.addEventListener('pointerup',graphPointerUp); svg.addEventListener('pointercancel',graphPointerUp);
  svg.addEventListener('click',event => { if (Date.now()<graphRuntime.suppressClickUntil) return; const node = event.target.closest?.('[data-graph-node]'); if (node) graphFocus(node.dataset.graphNode,false); else { graphRuntime.selectedKey = null; graphRenderInspector(); graphUpdateHighlights(); } });
  svg.addEventListener('dblclick',event => { const nodeElement = event.target.closest?.('[data-graph-node]'); const node = graphRuntime.nodeByKey.get(nodeElement?.dataset.graphNode); if (node) dictionaryOpen(graphOpenValue(node.entry)); });
  svg.addEventListener('keydown',event => { const nodeElement = event.target.closest?.('[data-graph-node]'); if (!nodeElement) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); graphFocus(nodeElement.dataset.graphNode,true); } });
  if ('ResizeObserver' in window) { graphRuntime.resizeObserver = new ResizeObserver(() => graphResize()); graphRuntime.resizeObserver.observe(document.getElementById('graphCanvas')); }
}

installGraphStyles(); installGraphUi(); installGraphInteractions(); graphInitialInspector();

const renderAllWithoutKnowledgeGraph = renderAll;
renderAll = function() { renderAllWithoutKnowledgeGraph(); if (graphRuntime.mode === 'graph') graphRender(); graphApplyMode(); };

document.addEventListener('click',event => {
  const mode = event.target.closest('[data-knowledge-mode]'); if (mode) { graphRuntime.mode = mode.dataset.knowledgeMode; graphApplyMode(); }
  const filter = event.target.closest('[data-graph-filter]'); if (filter) { graphRuntime.filter = filter.dataset.graphFilter; graphRuntime.selectedKey = null; graphRuntime.initialized = false; graphRender(true); }
  const focus = event.target.closest('[data-graph-focus]'); if (focus) { graphFocus(focus.dataset.graphFocus,true); document.getElementById('graphSearchResults').hidden = true; }
  const open = event.target.closest('[data-graph-open]'); if (open) dictionaryOpen(open.dataset.graphOpen);
  const zoom = event.target.closest('[data-graph-zoom]'); if (zoom) { const svg = document.getElementById('knowledgeGraphSvg'); const rect = svg.getBoundingClientRect(); graphZoomAt(rect.left+rect.width/2,rect.top+rect.height/2,zoom.dataset.graphZoom === '1'?1.2:.83); }
  if (event.target.closest('[data-graph-fit]')) graphFit();
  if (event.target.closest('[data-view="dictionary"]')) setTimeout(() => { graphApplyMode(); graphResize(); if (graphRuntime.mode === 'graph' && !graphRuntime.initialized) graphFit(); },30);
  if (!event.target.closest('.graph-search-wrap')) { const results = document.getElementById('graphSearchResults'); if (results) results.hidden = true; }
});

document.getElementById('graphSearch').addEventListener('input',event => { graphRuntime.query = event.target.value; graphSearchResults(); });
document.getElementById('graphSearch').addEventListener('keydown',event => { if (event.key === 'Escape') { event.target.value = ''; graphRuntime.query = ''; graphSearchResults(); event.target.blur(); } if (event.key === 'Enter') { const first = document.querySelector('#graphSearchResults [data-graph-focus]'); if (first) { event.preventDefault(); graphFocus(first.dataset.graphFocus,true); document.getElementById('graphSearchResults').hidden = true; } } });

graphApplyMode();
