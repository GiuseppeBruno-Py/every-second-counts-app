/* Compasso · Navegação central por áreas */
(function(root){
  const model=root.CompassoInformationArchitectureModel,runtime=root.CompassoFeatures;if(!model||!runtime)return;
  const MODE_KEY='compasso.ux.mode.v1';
  const hubs={fronts:{title:'Frentes',kicker:'Direção e execução',lead:'Organize aquilo que está lendo, estudando e construindo.'},review:{title:'Revisão',kicker:'Evidências e decisões',lead:'Feche ciclos, identifique padrões e escolha o próximo ajuste.'}};
  const state={area:'today',view:'today',started:false,suppressHistory:false,opening:false};
  const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const currentMode=()=>model.migratePreference(localStorage.getItem(MODE_KEY));
  function primaryMarkup(){return model.areas.map(area=>`<button type="button" class="nav-item" data-ia-area="${area.id}" data-ux-level="${area.level}" aria-label="${area.label}">${icon(area.icon)}<span>${area.label}</span></button>`).join('')}
  function cardMarkup(item){return`<button type="button" class="ia-card" data-ia-view="${item.route}" data-ia-level="${item.level}">${icon(item.icon)}<span><strong>${item.label}</strong><small>${item.description}</small></span><b aria-hidden="true">→</b></button>`}
  function ensureHubs(){
    const content=document.querySelector('.content');if(!content)return;
    for(const [id,meta] of Object.entries(hubs)){
      labels[id]={title:meta.title,kicker:meta.kicker};
      if(!document.getElementById(`${id}View`))content.insertAdjacentHTML('beforeend',`<section class="view ia-hub" id="${id}View"><div class="ia-shell"><header class="ia-hero"><div class="eyebrow">${meta.kicker}</div><h2>${meta.title}</h2><p>${meta.lead}</p></header><div class="ia-grid" data-ia-grid="${id}"></div>${id==='fronts'?'<button type="button" class="ia-new-item" data-ia-command="new">+ Nova frente</button>':''}</div></section>`);
    }
  }
  function renderHub(areaId){
    const grid=document.querySelector(`[data-ia-grid="${areaId}"]`);if(!grid)return;
    grid.innerHTML=model.viewsFor(areaId,currentMode()).map(cardMarkup).join('')||'<p class="ia-empty">Nenhum recurso disponível neste nível.</p>';
  }
  function setActive(view){
    const area=model.areaFor(view);state.area=area;state.view=view;
    document.querySelectorAll('[data-ia-area]').forEach(button=>{const active=button.dataset.iaArea===area;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current')});
  }
  function updateUrl(view,replace=false){
    if(state.suppressHistory)return;const url=new URL(location.href);url.searchParams.set('view',view);history[replace?'replaceState':'pushState']({compassoView:view},'',url);
  }
  function open(route,{replace=false,history=true}={}){
    const target=model.resolve(route),area=model.area(target),view=model.view(target);
    const destination=area?(hubs[area.id]?area.id:area.route):view.route;
    if(hubs[destination])renderHub(destination);
    state.opening=true;
    try{switchView(destination)}finally{state.opening=false}
    setActive(target);
    if(history)updateUrl(target,replace);
    return target;
  }
  function applyMode(){
    const mode=currentMode();localStorage.setItem(MODE_KEY,mode);
    Object.keys(hubs).forEach(renderHub);
    const item=model.view(state.view);if(item&&!model.visible(item.level,mode))open(item.area,{replace:true});
  }
  function command(name){
    if(name==='new'){document.getElementById('quickAdd')?.click()}
  }
  function install(){
    document.body.classList.add('ia-installed');
    localStorage.setItem(MODE_KEY,currentMode());
    const nav=document.querySelector('.sidebar .nav');if(nav){
      const legacyBadges=[...nav.querySelectorAll('[id$="Badge"]')];
      nav.classList.add('ia-primary-nav');nav.innerHTML=primaryMarkup();
      if(legacyBadges.length){const compatibility=document.createElement('span');compatibility.className='ia-legacy-badges';compatibility.hidden=true;legacyBadges.forEach(badge=>compatibility.appendChild(badge));nav.appendChild(compatibility)}
    }
    ensureHubs();Object.keys(hubs).forEach(renderHub);
    const register=document.getElementById('captureGlobalBtn');if(register){register.setAttribute('aria-label','Registrar');const label=register.querySelector('span');if(label)label.textContent='Registrar'}
    const quick=document.getElementById('quickAdd');if(quick&&!document.getElementById('iaExecuteBtn'))quick.insertAdjacentHTML('beforebegin',`<button type="button" class="secondary-btn ia-execute-global" id="iaExecuteBtn" aria-label="Executar">${icon('spark')}<span>Executar</span></button>`);
    runtime.route('information.open',open);runtime.command('information.open',payload=>open(typeof payload==='string'?payload:payload?.route));
    runtime.on('view:changed',payload=>{if(!payload?.view)return;setActive(payload.view);if(state.started&&!state.opening)updateUrl(payload.view,true)});
    runtime.action('[data-ia-area]',({target})=>open(target.dataset.iaArea));
    runtime.action('[data-ia-view]',({target})=>open(target.dataset.iaView));
    runtime.action('[data-ia-command]',({target})=>command(target.dataset.iaCommand));
    runtime.action('#iaExecuteBtn',({target})=>runtime.execute('today.executePrimary',{trigger:target}));
    runtime.action('[data-ux-mode]',()=>queueMicrotask(applyMode),{order:1100});
    root.addEventListener('popstate',()=>{state.suppressHistory=true;open(new URLSearchParams(location.search).get('view')||'today',{history:false});state.suppressHistory=false});
    const requested=new URLSearchParams(location.search).get('view');
    state.started=true;queueMicrotask(()=>open(model.resolve(requested||'today'),{replace:true}));
  }
  install();
  runtime.register('information-architecture',{order:1200,afterRender(){setActive(state.view);if(hubs[state.view])renderHub(state.view)}});
  root.CompassoInformationArchitecture=Object.freeze({open,areas:()=>model.areas.map(item=>({...item})),views:()=>model.views.map(item=>({...item})),current:()=>({...state,mode:currentMode()})});
})(globalThis);
