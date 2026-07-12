/* Compasso · Métricas de consistência e histórico global de sessões
 * Injetado após sessões, evidências e revisão semanal no módulo principal.
 */

labels.analytics = { title: 'Consistência', kicker: 'Ritmo e histórico' };

const analyticsRuntime = {
  period: '30',
  domain: 'all',
  query: '',
  limit: 40
};

function analyticsSessionDate(session) {
  return new Date(session.endedAt || session.startedAt);
}

function analyticsDayStart(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function analyticsDayKey(value) {
  const date = analyticsDayStart(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function analyticsAddDays(value, days) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function analyticsCompletedSessions(domain = analyticsRuntime.domain) {
  return state.data.sessions
    .filter(session => session.status === 'completed')
    .filter(session => domain === 'all' || session.domain === domain)
    .sort((a, b) => analyticsSessionDate(b) - analyticsSessionDate(a));
}

function analyticsPeriodStart(period = analyticsRuntime.period) {
  if (period === 'all') return null;
  const days = positiveNumber(period) || 30;
  return analyticsAddDays(analyticsDayStart(new Date()), -(days - 1));
}

function analyticsEvidenceForSession(sessionId) {
  return state.data.evidence.filter(item => item.sessionId === sessionId);
}

function analyticsItemForSession(session) {
  return state.data[session.domain]?.find(item => item.id === session.itemId) || null;
}

function analyticsSearchText(session) {
  const item = analyticsItemForSession(session);
  const evidence = analyticsEvidenceForSession(session.id);
  return [
    item?.title,
    item?.meta,
    session.intent,
    session.reflection,
    ...evidence.flatMap(entry => [entry.summary, entry.details])
  ].filter(Boolean).join(' ').toLowerCase();
}

function analyticsPeriodSessions() {
  const start = analyticsPeriodStart();
  return analyticsCompletedSessions()
    .filter(session => !start || analyticsSessionDate(session) >= start);
}

function analyticsHistorySessions() {
  const query = analyticsRuntime.query.trim().toLowerCase();
  return analyticsPeriodSessions()
    .filter(session => !query || analyticsSearchText(session).includes(query));
}

function analyticsDurationLabel(ms) {
  const minutes = Math.max(0, Math.round(positiveNumber(ms) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return `${hours}h ${String(rest).padStart(2, '0')}min`;
}

function analyticsAverageDuration(sessions) {
  if (!sessions.length) return 0;
  return sessions.reduce((sum, session) => sum + positiveNumber(session.durationMs), 0) / sessions.length;
}

function analyticsActiveDayKeys(sessions) {
  return [...new Set(sessions.map(session => analyticsDayKey(analyticsSessionDate(session))))].sort();
}

function analyticsCurrentStreak(sessions) {
  const keys = new Set(analyticsActiveDayKeys(sessions));
  if (!keys.size) return 0;
  const today = analyticsDayStart(new Date());
  let cursor = keys.has(analyticsDayKey(today)) ? today : analyticsAddDays(today, -1);
  let streak = 0;
  while (keys.has(analyticsDayKey(cursor))) {
    streak += 1;
    cursor = analyticsAddDays(cursor, -1);
  }
  return streak;
}

function analyticsBestStreak(sessions) {
  const keys = analyticsActiveDayKeys(sessions);
  if (!keys.length) return 0;
  let best = 1;
  let current = 1;
  for (let index = 1; index < keys.length; index += 1) {
    const previous = analyticsDayStart(`${keys[index - 1]}T12:00:00`);
    const expected = analyticsDayKey(analyticsAddDays(previous, 1));
    if (keys[index] === expected) current += 1;
    else current = 1;
    best = Math.max(best, current);
  }
  return best;
}

function analyticsPeriodDays(sessions) {
  if (analyticsRuntime.period !== 'all') return positiveNumber(analyticsRuntime.period) || 30;
  if (!sessions.length) return 0;
  const oldest = analyticsDayStart(analyticsSessionDate(sessions[sessions.length - 1]));
  const today = analyticsDayStart(new Date());
  return Math.max(1, Math.round((today - oldest) / 86400000) + 1);
}

function analyticsConsistencyRate(sessions) {
  const days = analyticsPeriodDays(sessions);
  if (!days) return 0;
  return Math.min(100, Math.round((analyticsActiveDayKeys(sessions).length / days) * 100));
}

function analyticsStartOfWeek(value = new Date()) {
  const date = analyticsDayStart(value);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day));
  return date;
}

function analyticsWeeklyTrend(sessions, weeks = 8) {
  const currentStart = analyticsStartOfWeek(new Date());
  const buckets = [];
  for (let offset = weeks - 1; offset >= 0; offset -= 1) {
    const start = analyticsAddDays(currentStart, -(offset * 7));
    const end = analyticsAddDays(start, 7);
    const bucketSessions = sessions.filter(session => {
      const date = analyticsSessionDate(session);
      return date >= start && date < end;
    });
    buckets.push({
      key: analyticsDayKey(start),
      start,
      sessions: bucketSessions.length,
      durationMs: bucketSessions.reduce((sum, session) => sum + positiveNumber(session.durationMs), 0),
      activeDays: analyticsActiveDayKeys(bucketSessions).length
    });
  }
  return buckets;
}

function analyticsItemRanking(sessions) {
  const groups = new Map();
  sessions.forEach(session => {
    const key = `${session.domain}:${session.itemId}`;
    if (!groups.has(key)) groups.set(key, { domain: session.domain, itemId: session.itemId, sessions: 0, durationMs: 0, evidence: 0 });
    const group = groups.get(key);
    group.sessions += 1;
    group.durationMs += positiveNumber(session.durationMs);
    group.evidence += analyticsEvidenceForSession(session.id).length;
  });
  return [...groups.values()]
    .map(group => ({ ...group, item: state.data[group.domain]?.find(item => item.id === group.itemId) || null }))
    .sort((a, b) => b.durationMs - a.durationMs || b.sessions - a.sessions)
    .slice(0, 6);
}

function analyticsDomainStats(sessions) {
  const domains = analyticsRuntime.domain === 'all' ? ['reading', 'study'] : [analyticsRuntime.domain];
  return domains.map(domain => {
    const domainSessions = sessions.filter(session => session.domain === domain);
    return {
      domain,
      sessions: domainSessions.length,
      durationMs: domainSessions.reduce((sum, session) => sum + positiveNumber(session.durationMs), 0),
      evidence: domainSessions.reduce((sum, session) => sum + analyticsEvidenceForSession(session.id).length, 0)
    };
  });
}

function installAnalyticsStyles() {
  if (document.getElementById('compassoAnalyticsStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoAnalyticsStyles';
  style.textContent = `
    .analytics-shell{display:grid;gap:18px}.analytics-hero{background:#302f2a;color:#fff;border-radius:22px;padding:27px 29px;display:flex;align-items:flex-end;justify-content:space-between;gap:22px;box-shadow:var(--shadow);position:relative;overflow:hidden}.analytics-hero::after{content:"";position:absolute;width:235px;height:235px;border:44px solid rgba(126,183,209,.11);border-radius:50%;right:-70px;top:-115px}.analytics-hero>*{position:relative;z-index:1}.analytics-hero .eyebrow{color:#aaa79f}.analytics-hero h2{margin:8px 0 7px;font:800 clamp(24px,3vw,36px)/1.15 Manrope,sans-serif;letter-spacing:-.05em}.analytics-hero p{margin:0;color:#bbb8b0;font-size:12px;line-height:1.6;max-width:610px}.analytics-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}.analytics-controls button,.analytics-controls select{min-height:37px;border:1px solid #4b4a44;background:#3a3934;color:#fff;border-radius:9px;padding:0 11px;font-size:10px;font-weight:700}.analytics-controls button{cursor:pointer}.analytics-controls button.active{background:#f8f6f0;color:#252521;border-color:#f8f6f0}
    .analytics-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.analytics-kpi{background:var(--surface-strong);border:1px solid var(--line);border-radius:16px;padding:17px;box-shadow:var(--shadow)}.analytics-kpi span{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:800}.analytics-kpi strong{display:block;margin-top:8px;font:800 23px/1 Manrope,sans-serif;letter-spacing:-.04em}.analytics-kpi small{display:block;color:var(--muted);font-size:9px;margin-top:7px;line-height:1.4}
    .analytics-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:18px}.analytics-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:18px;padding:21px;box-shadow:var(--shadow)}.analytics-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}.analytics-panel-head h3{margin:4px 0 0;font:800 17px/1.25 Manrope,sans-serif;letter-spacing:-.025em}.analytics-panel-head p{margin:5px 0 0;color:var(--muted);font-size:10px}.analytics-panel-badge{padding:5px 8px;border-radius:999px;background:var(--blue-soft);color:var(--blue);font-size:9px;font-weight:800}
    .analytics-trend{height:220px;display:grid;grid-template-columns:repeat(8,1fr);gap:9px;align-items:end;padding-top:15px}.analytics-week{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:7px;min-width:0}.analytics-week-bar{width:100%;max-width:42px;min-height:5px;border-radius:8px 8px 3px 3px;background:var(--blue-soft);position:relative;overflow:hidden}.analytics-week-bar span{position:absolute;inset:auto 0 0;background:var(--blue);border-radius:inherit}.analytics-week b{font-size:9px}.analytics-week small{font-size:8px;color:var(--muted);white-space:nowrap}
    .analytics-rank-list,.analytics-domain-list{display:grid;gap:10px}.analytics-rank-row{display:grid;grid-template-columns:35px minmax(0,1fr) auto;gap:10px;align-items:center;border-top:1px solid var(--line);padding-top:11px}.analytics-rank-row:first-child{border-top:0;padding-top:0}.analytics-rank-icon{width:35px;height:35px;border-radius:10px;display:grid;place-items:center}.analytics-rank-icon svg{width:16px;height:16px}.analytics-rank-row strong{display:block;font-size:11px}.analytics-rank-row span{display:block;color:var(--muted);font-size:9px;margin-top:4px}.analytics-rank-row em{font-style:normal;font-size:10px;font-weight:800;text-align:right}.analytics-domain-row{border:1px solid var(--line);border-radius:12px;padding:13px}.analytics-domain-row header{display:flex;justify-content:space-between;gap:12px}.analytics-domain-row strong{font-size:11px}.analytics-domain-row span{color:var(--muted);font-size:9px}.analytics-domain-row .progress{margin-top:10px}
    .analytics-history-tools{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.analytics-search{display:flex;align-items:center;gap:7px;border:1px solid var(--line);background:#fff;border-radius:9px;padding:0 10px;min-height:37px}.analytics-search svg{width:14px;height:14px;color:var(--muted)}.analytics-search input{border:0;outline:0;width:min(250px,45vw);font-size:10px}.analytics-history-list{display:grid;gap:10px}.analytics-history-row{border:1px solid var(--line);border-radius:14px;padding:14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px}.analytics-history-row header{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.analytics-history-row header b{font-size:11px}.analytics-history-row header span{padding:3px 7px;border-radius:999px;background:var(--violet-soft);color:var(--violet);font-size:8px;font-weight:800}.analytics-history-row p{margin:7px 0 0;color:var(--muted);font-size:9px;line-height:1.5}.analytics-history-row time{display:block;color:var(--muted);font-size:9px;text-align:right}.analytics-history-row>aside strong{display:block;margin-top:5px;font-size:11px;text-align:right}.analytics-history-evidence{margin-top:9px;padding:9px 10px;border-radius:10px;background:var(--green-soft);color:#2e6f5d;font-size:9px;line-height:1.45}.analytics-empty{border:1px dashed var(--line);border-radius:12px;padding:27px;text-align:center;color:var(--muted);font-size:11px;line-height:1.55}.analytics-load{display:flex;justify-content:center;margin-top:13px}
    @media(max-width:1100px){.analytics-kpis{grid-template-columns:repeat(3,1fr)}.analytics-grid{grid-template-columns:1fr}.analytics-hero{align-items:flex-start;flex-direction:column}.analytics-controls{justify-content:flex-start}}
    @media(max-width:720px){.analytics-kpis{grid-template-columns:1fr 1fr}.analytics-hero{padding:22px 20px}.analytics-panel{padding:17px}.analytics-trend{gap:5px}.analytics-history-row{grid-template-columns:1fr}.analytics-history-row time,.analytics-history-row>aside strong{text-align:left}.analytics-search{flex:1}.analytics-search input{width:100%}}
  `;
  document.head.appendChild(style);
}

function installAnalyticsUi() {
  if (!document.querySelector('[data-view="analytics"]')) {
    const weeklyNav = document.querySelector('[data-view="weekly"]');
    weeklyNav?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="analytics">${icon('spark')}<span>Consistência</span><span class="nav-badge" id="analyticsBadge"></span></button>`);
  }
  if (document.getElementById('analyticsView')) return;
  document.querySelector('.content')?.insertAdjacentHTML('beforeend', `
    <section class="view" id="analyticsView">
      <div class="analytics-shell">
        <section class="analytics-hero">
          <div><div class="eyebrow">Métricas de consistência</div><h2>Ritmo sustentável, não apenas volume</h2><p>Use sessões concluídas para entender frequência, sequência, tempo focado e onde sua energia realmente foi investida.</p></div>
          <div class="analytics-controls"><button data-analytics-period="7">7 dias</button><button data-analytics-period="30" class="active">30 dias</button><button data-analytics-period="90">90 dias</button><button data-analytics-period="all">Tudo</button><select id="analyticsDomain"><option value="all">Todos os domínios</option><option value="reading">Leituras</option><option value="study">Estudos</option></select></div>
        </section>
        <div class="analytics-kpis" id="analyticsKpis"></div>
        <div class="analytics-grid">
          <section class="analytics-panel"><div class="analytics-panel-head"><div><div class="eyebrow">Últimas oito semanas</div><h3>Ritmo semanal</h3><p>Tempo focado e dias ativos por semana.</p></div><span class="analytics-panel-badge" id="analyticsTrendBadge"></span></div><div class="analytics-trend" id="analyticsTrend"></div></section>
          <section class="analytics-panel"><div class="analytics-panel-head"><div><div class="eyebrow">Concentração</div><h3>Itens com mais investimento</h3><p>Ranking pelo tempo efetivo de sessão.</p></div></div><div class="analytics-rank-list" id="analyticsRanking"></div></section>
        </div>
        <div class="analytics-grid">
          <section class="analytics-panel"><div class="analytics-panel-head"><div><div class="eyebrow">Distribuição</div><h3>Atividade por domínio</h3><p>Compare sessões, tempo e evidências no período.</p></div></div><div class="analytics-domain-list" id="analyticsDomains"></div></section>
          <section class="analytics-panel"><div class="analytics-panel-head"><div><div class="eyebrow">Interpretação</div><h3>Leitura do seu ritmo</h3><p>Um diagnóstico simples baseado no período filtrado.</p></div></div><div class="insight" id="analyticsInsight" style="margin-top:0"></div></section>
        </div>
        <section class="analytics-panel"><div class="analytics-panel-head"><div><div class="eyebrow">Histórico global</div><h3>Todas as sessões em um só lugar</h3><p>Pesquise por item, objetivo, reflexão ou evidência.</p></div><div class="analytics-history-tools"><div class="analytics-search">${icon('search')}<input id="analyticsSearch" placeholder="Buscar no histórico..."></div><button class="secondary-btn" type="button" id="analyticsExport">${icon('export')}Exportar CSV</button></div></div><div class="analytics-history-list" id="analyticsHistory"></div><div class="analytics-load" id="analyticsLoadWrap"><button class="quiet-btn" type="button" id="analyticsLoadMore">Mostrar mais</button></div></section>
      </div>
    </section>
  `);
}

function renderAnalyticsKpis(periodSessions, allDomainSessions) {
  const totalDuration = periodSessions.reduce((sum, session) => sum + positiveNumber(session.durationMs), 0);
  const activeDays = analyticsActiveDayKeys(periodSessions).length;
  const currentStreak = analyticsCurrentStreak(allDomainSessions);
  const bestStreak = analyticsBestStreak(allDomainSessions);
  const consistency = analyticsConsistencyRate(periodSessions);
  const average = analyticsAverageDuration(periodSessions);
  const kpis = [
    { label: 'Sessões', value: periodSessions.length, note: `média de ${analyticsDurationLabel(average)}` },
    { label: 'Tempo focado', value: analyticsDurationLabel(totalDuration), note: 'tempo efetivo sem pausas' },
    { label: 'Dias ativos', value: activeDays, note: `${consistency}% dos dias do período` },
    { label: 'Sequência atual', value: `${currentStreak}d`, note: `melhor sequência: ${bestStreak} dias` },
    { label: 'Consistência', value: `${consistency}%`, note: 'dias com pelo menos uma sessão' }
  ];
  document.getElementById('analyticsKpis').innerHTML = kpis.map(kpi => `<article class="analytics-kpi"><span>${kpi.label}</span><strong>${kpi.value}</strong><small>${kpi.note}</small></article>`).join('');
  const badge = document.getElementById('analyticsBadge');
  if (badge) badge.textContent = currentStreak ? `${currentStreak}d` : '—';
}

function renderAnalyticsTrend(allDomainSessions) {
  const buckets = analyticsWeeklyTrend(allDomainSessions);
  const maxDuration = Math.max(...buckets.map(bucket => bucket.durationMs), 1);
  const total = buckets.reduce((sum, bucket) => sum + bucket.durationMs, 0);
  document.getElementById('analyticsTrendBadge').textContent = analyticsDurationLabel(total);
  document.getElementById('analyticsTrend').innerHTML = buckets.map(bucket => {
    const height = bucket.durationMs > 0 ? Math.max(5, Math.round((bucket.durationMs / maxDuration) * 100)) : 0;
    const label = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(bucket.start);
    return `<div class="analytics-week" title="${bucket.sessions} sessões · ${analyticsDurationLabel(bucket.durationMs)} · ${bucket.activeDays} dias ativos"><b>${analyticsDurationLabel(bucket.durationMs)}</b><div class="analytics-week-bar"><span style="height:${height}%"></span></div><small>${escapeHtml(label)}</small></div>`;
  }).join('');
}

function renderAnalyticsRanking(periodSessions) {
  const ranking = analyticsItemRanking(periodSessions);
  const container = document.getElementById('analyticsRanking');
  if (!ranking.length) {
    container.innerHTML = '<div class="analytics-empty">Ainda não há sessões no período selecionado.</div>';
    return;
  }
  container.innerHTML = ranking.map(entry => `<article class="analytics-rank-row"><div class="analytics-rank-icon ${domainColors[entry.domain] || 'violet'}">${icon(domainIcons[entry.domain] || 'target')}</div><div><strong>${escapeHtml(entry.item?.title || 'Item removido')}</strong><span>${entry.sessions} ${entry.sessions === 1 ? 'sessão' : 'sessões'} · ${entry.evidence} ${entry.evidence === 1 ? 'evidência' : 'evidências'}</span></div><em>${analyticsDurationLabel(entry.durationMs)}</em></article>`).join('');
}

function renderAnalyticsDomains(periodSessions) {
  const stats = analyticsDomainStats(periodSessions);
  const maxDuration = Math.max(...stats.map(stat => stat.durationMs), 1);
  document.getElementById('analyticsDomains').innerHTML = stats.map(stat => {
    const width = stat.durationMs > 0 ? Math.round((stat.durationMs / maxDuration) * 100) : 0;
    const color = stat.domain === 'reading' ? 'var(--orange)' : 'var(--violet)';
    return `<article class="analytics-domain-row"><header><div><strong>${escapeHtml(domainLabels[stat.domain])}</strong><span>${stat.sessions} sessões · ${stat.evidence} evidências</span></div><strong>${analyticsDurationLabel(stat.durationMs)}</strong></header><div class="progress"><span style="width:${width}%;background:${color}"></span></div></article>`;
  }).join('');
}

function renderAnalyticsInsight(periodSessions, allDomainSessions) {
  const consistency = analyticsConsistencyRate(periodSessions);
  const average = analyticsAverageDuration(periodSessions);
  const currentStreak = analyticsCurrentStreak(allDomainSessions);
  const evidenceCount = periodSessions.reduce((sum, session) => sum + analyticsEvidenceForSession(session.id).length, 0);
  let message;
  if (!periodSessions.length) message = '<strong>Sem base suficiente:</strong> conclua sessões para que o Compasso consiga interpretar seu ritmo.';
  else if (consistency >= 60) message = `<strong>Ritmo forte:</strong> você esteve ativo em ${consistency}% dos dias do período. Proteja esse padrão sem aumentar volume de forma automática.`;
  else if (consistency >= 30) message = `<strong>Ritmo funcional:</strong> há execução recorrente, mas ainda existem lacunas. Sessões menores e mais frequentes podem ser mais sustentáveis que blocos esporádicos.`;
  else message = `<strong>Ritmo concentrado:</strong> o avanço ocorreu em poucos dias. Verifique se isso é uma escolha consciente ou efeito de falta de espaço protegido na rotina.`;
  message += `<br><br>A sessão média durou <strong>${analyticsDurationLabel(average)}</strong>, a sequência atual é de <strong>${currentStreak} dias</strong> e o período gerou <strong>${evidenceCount} evidências</strong>.`;
  document.getElementById('analyticsInsight').innerHTML = message;
}

function analyticsProgressLabel(session) {
  const item = analyticsItemForSession(session);
  const config = metricConfig(session.domain, item?.readingFormat || session.readingFormat || 'physical');
  const delta = Math.max(0, positiveNumber(session.endValue) - positiveNumber(session.startValue));
  return delta > 0 ? `+${formatNumber(delta)} ${config.unit}` : 'sem avanço informado';
}

function renderAnalyticsHistory(historySessions) {
  const container = document.getElementById('analyticsHistory');
  const visible = historySessions.slice(0, analyticsRuntime.limit);
  if (!visible.length) {
    container.innerHTML = '<div class="analytics-empty">Nenhuma sessão corresponde aos filtros atuais.</div>';
    document.getElementById('analyticsLoadWrap').hidden = true;
    return;
  }
  container.innerHTML = visible.map(session => {
    const item = analyticsItemForSession(session);
    const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(analyticsSessionDate(session));
    const evidence = analyticsEvidenceForSession(session.id);
    const evidenceHtml = evidence.map(entry => `<div class="analytics-history-evidence"><strong>${escapeHtml((typeof evidenceTypeLabels === 'object' && evidenceTypeLabels[entry.type]) || 'Evidência')}:</strong> ${escapeHtml(entry.summary)}${entry.details ? `<br>${escapeHtml(entry.details)}` : ''}</div>`).join('');
    return `<article class="analytics-history-row"><div><header><b>${escapeHtml(item?.title || 'Item removido')}</b><span>${escapeHtml(domainLabels[session.domain] || session.domain)}</span></header>${session.intent ? `<p><strong>Objetivo:</strong> ${escapeHtml(session.intent)}</p>` : ''}${session.reflection ? `<p><strong>Observação:</strong> ${escapeHtml(session.reflection)}</p>` : ''}${evidenceHtml}</div><aside><time>${escapeHtml(date)}</time><strong>${analyticsDurationLabel(session.durationMs)}</strong><p>${escapeHtml(analyticsProgressLabel(session))}</p></aside></article>`;
  }).join('');
  const wrap = document.getElementById('analyticsLoadWrap');
  wrap.hidden = visible.length >= historySessions.length;
  document.getElementById('analyticsLoadMore').textContent = `Mostrar mais (${historySessions.length - visible.length})`;
}

function renderAnalytics() {
  if (!document.getElementById('analyticsView')) return;
  const periodSessions = analyticsPeriodSessions();
  const historySessions = analyticsHistorySessions();
  const allDomainSessions = analyticsCompletedSessions();
  renderAnalyticsKpis(periodSessions, allDomainSessions);
  renderAnalyticsTrend(allDomainSessions);
  renderAnalyticsRanking(periodSessions);
  renderAnalyticsDomains(periodSessions);
  renderAnalyticsInsight(periodSessions, allDomainSessions);
  renderAnalyticsHistory(historySessions);
  document.querySelectorAll('[data-analytics-period]').forEach(button => button.classList.toggle('active', button.dataset.analyticsPeriod === analyticsRuntime.period));
  document.getElementById('analyticsDomain').value = analyticsRuntime.domain;
  document.getElementById('analyticsSearch').value = analyticsRuntime.query;
}

function exportAnalyticsCsv() {
  const sessions = analyticsHistorySessions();
  if (!sessions.length) {
    showToast('Não há sessões para exportar');
    return;
  }
  const quote = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const header = ['data', 'dominio', 'item', 'duracao_minutos', 'inicio', 'fim', 'objetivo', 'observacao', 'evidencias'];
  const rows = sessions.map(session => {
    const item = analyticsItemForSession(session);
    const evidence = analyticsEvidenceForSession(session.id).map(entry => `${entry.summary}${entry.details ? ` — ${entry.details}` : ''}`).join(' | ');
    return [
      analyticsSessionDate(session).toISOString(),
      domainLabels[session.domain] || session.domain,
      item?.title || 'Item removido',
      Math.round(positiveNumber(session.durationMs) / 60000),
      session.startValue,
      session.endValue,
      session.intent,
      session.reflection,
      evidence
    ].map(quote).join(',');
  });
  const blob = new Blob([`\ufeff${header.join(',')}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `compasso-sessoes-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Histórico exportado em CSV');
}

installAnalyticsStyles();
installAnalyticsUi();

const renderAllWithoutAnalytics = renderAll;
renderAll = function() {
  renderAllWithoutAnalytics();
  renderAnalytics();
};

document.addEventListener('click', event => {
  const period = event.target.closest('[data-analytics-period]');
  if (period) {
    analyticsRuntime.period = period.dataset.analyticsPeriod;
    analyticsRuntime.limit = 40;
    renderAnalytics();
  }
  if (event.target.closest('#analyticsLoadMore')) {
    analyticsRuntime.limit += 40;
    renderAnalyticsHistory(analyticsHistorySessions());
  }
  if (event.target.closest('#analyticsExport')) exportAnalyticsCsv();
});

document.getElementById('analyticsDomain').addEventListener('change', event => {
  analyticsRuntime.domain = event.target.value;
  analyticsRuntime.limit = 40;
  renderAnalytics();
});

document.getElementById('analyticsSearch').addEventListener('input', event => {
  analyticsRuntime.query = event.target.value;
  analyticsRuntime.limit = 40;
  renderAnalyticsHistory(analyticsHistorySessions());
});
