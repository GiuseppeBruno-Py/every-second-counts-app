/* Compasso · Perguntas contextuais e avaliacao de explicacoes
 * Fases 4.2 e 4.3: rascunhos revisaveis e feedback local orientado por fontes.
 */

const CONTEXT_LEARNING_VERSION = 1;
const contextLearningRuntime = { evaluation: null };

function contextLearningSources() {
  const results = contextRagRuntime.results || [];
  return results.length ? results : buildContextRagIndex().slice(0, 20);
}

function contextLearningKeywords(text, limit = 10) {
  const frequency = new Map();
  contextRagTokens(text).forEach(token => frequency.set(token, (frequency.get(token) || 0) + 1));
  return [...frequency.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, limit).map(([token]) => token);
}

function contextLearningSource(id) {
  return contextLearningSources().find(source => `${source.type}:${source.id}` === id) || null;
}

function contextLearningQuestionDraft(source, mode) {
  const reference = source.text.slice(0, 1800);
  const concepts = contextLearningKeywords(`${source.title} ${reference}`, 5);
  const conceptList = concepts.slice(0, 3).join(', ');
  const prompts = {
    explain: `Sem consultar, explique a ideia central de “${source.title}” e relacione ${conceptList || 'os conceitos principais'}.`,
    apply: `Como você aplicaria o conteúdo de “${source.title}” em uma situação concreta? Dê um exemplo e justifique.`,
    contrast: `Quais distinções ou relações são essenciais para compreender “${source.title}”? Explique com suas palavras.`
  };
  return {
    sourceType: source.type,
    sourceId: source.id,
    domain: source.target?.domain || null,
    itemId: source.target?.id || null,
    prompt: prompts[mode] || prompts.explain,
    answer: reference
  };
}

function generateContextQuestion() {
  const source = contextLearningSource(document.getElementById('contextQuestionSource')?.value);
  if (!source) { showToast('Busque ou selecione uma fonte primeiro'); return; }
  openRecallDialog(contextLearningQuestionDraft(source, document.getElementById('contextQuestionMode')?.value || 'explain'));
}

function evaluateContextExplanation(source, explanation) {
  const referenceTokens = [...new Set(contextLearningKeywords(`${source.title} ${source.text}`, 14))];
  const answerTokens = new Set(contextRagTokens(explanation));
  const covered = referenceTokens.filter(token => answerTokens.has(token));
  const missing = referenceTokens.filter(token => !answerTokens.has(token));
  const coverage = referenceTokens.length ? Math.round((covered.length / referenceTokens.length) * 100) : 0;
  const lengthScore = Math.min(100, Math.round(contextRagTokens(explanation).length / 0.65));
  const structureSignals = [/[.!?]\s+[A-ZÀ-Ü]/.test(explanation), /porque|portanto|assim|logo|pois/i.test(explanation), /exemplo|por exemplo|caso/i.test(explanation)];
  const structure = Math.round((structureSignals.filter(Boolean).length / structureSignals.length) * 100);
  const score = Math.round(coverage * .65 + lengthScore * .2 + structure * .15);
  return {
    id: `eval${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    schemaVersion: CONTEXT_LEARNING_VERSION,
    sourceType: source.type,
    sourceId: source.id,
    sourceTitle: source.title,
    explanation,
    score,
    coverage,
    structure,
    covered,
    missing,
    createdAt: new Date().toISOString()
  };
}

function renderContextEvaluation() {
  const container = document.getElementById('contextEvaluationResult');
  if (!container) return;
  const evaluation = contextLearningRuntime.evaluation;
  if (!evaluation) {
    container.innerHTML = '<div class="context-learning-empty">Escreva uma explicacao com suas palavras para receber um diagnostico de cobertura.</div>';
    return;
  }
  const level = evaluation.score >= 75 ? 'Boa cobertura' : evaluation.score >= 45 ? 'Cobertura parcial' : 'Revisao recomendada';
  container.innerHTML = `<article class="context-evaluation-card">
    <div class="context-evaluation-score"><strong>${evaluation.score}</strong><span>/ 100</span></div>
    <div><div class="context-evaluation-title"><strong>${level}</strong><span>Apoio diagnostico, nao correcao definitiva.</span></div>
      <div class="context-evaluation-metrics"><span>Cobertura <b>${evaluation.coverage}%</b></span><span>Estrutura <b>${evaluation.structure}%</b></span></div>
      <p><b>Conceitos encontrados:</b> ${escapeHtml(evaluation.covered.join(', ') || 'nenhum termo-chave identificado')}</p>
      <p><b>Lacunas para revisar:</b> ${escapeHtml(evaluation.missing.slice(0, 8).join(', ') || 'nenhuma lacuna lexical relevante')}</p>
      ${evaluation.missing.length ? '<button class="quiet-btn" type="button" data-context-log-gap>Registrar lacuna</button>' : ''}
    </div>
  </article>`;
}

function runContextExplanationEvaluation() {
  const source = contextLearningSource(document.getElementById('contextEvaluationSource')?.value);
  const explanation = document.getElementById('contextExplanation')?.value.trim() || '';
  if (!source) { showToast('Selecione uma fonte de referencia'); return; }
  if (contextRagTokens(explanation).length < 8) { showToast('Escreva uma explicacao um pouco mais completa'); return; }
  const evaluation = evaluateContextExplanation(source, explanation);
  state.data.explanationEvaluations = Array.isArray(state.data.explanationEvaluations) ? state.data.explanationEvaluations : [];
  state.data.explanationEvaluations.unshift(evaluation);
  state.data.explanationEvaluations = state.data.explanationEvaluations.slice(0, 100);
  contextLearningRuntime.evaluation = evaluation;
  window.CompassoStorage.save(STORAGE_KEY, state.data);
  renderContextEvaluation();
  showToast('Avaliacao registrada localmente');
}

function logContextEvaluationGap() {
  const evaluation = contextLearningRuntime.evaluation;
  if (!evaluation?.missing.length) return;
  state.data.errorNotebook = Array.isArray(state.data.errorNotebook) ? state.data.errorNotebook : [];
  const now = new Date().toISOString();
  state.data.errorNotebook.unshift({
    id: `err${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    schemaVersion: 1,
    status: 'open',
    title: `Lacuna em ${evaluation.sourceTitle}`,
    context: `A explicacao cobriu ${evaluation.coverage}% dos conceitos-chave recuperados. Revisar: ${evaluation.missing.slice(0, 8).join(', ')}.`,
    correction: `Revisar a fonte “${evaluation.sourceTitle}” e reescrever a explicacao incluindo as relacoes entre os conceitos ausentes.`,
    nextAction: 'Revisar a fonte, criar um exemplo proprio e tentar explicar novamente.',
    domain: null,
    itemId: null,
    sourceCardId: null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null
  });
  saveData('Lacuna registrada no caderno de erros');
}

function contextLearningSourceOptions() {
  return contextLearningSources().map(source => `<option value="${escapeHtml(source.type)}:${escapeHtml(source.id)}">${escapeHtml(contextRagTypeLabel(source.type))} · ${escapeHtml(source.title)}</option>`).join('');
}

function renderContextLearningSources() {
  const options = contextLearningSourceOptions();
  ['contextQuestionSource', 'contextEvaluationSource'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = options || '<option value="">Nenhuma fonte disponivel</option>';
    if ([...select.options].some(option => option.value === current)) select.value = current;
  });
}

function installContextLearningStyles() {
  if (document.getElementById('contextLearningStyles')) return;
  const style = document.createElement('style');
  style.id = 'contextLearningStyles';
  style.textContent = `
    .context-learning-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.context-learning-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:var(--shadow)}.context-learning-head{margin-bottom:15px}.context-learning-head h3{margin:4px 0 5px;font:800 17px/1.3 Manrope,sans-serif}.context-learning-head p{margin:0;color:var(--muted);font-size:10px;line-height:1.55}.context-learning-fields{display:grid;gap:10px}.context-learning-fields label{display:block;font-size:9px;font-weight:800;margin-bottom:6px}.context-learning-fields select,.context-learning-fields textarea{width:100%;border:1px solid var(--line);border-radius:9px;background:#fff;padding:10px 11px;font-size:10px}.context-learning-fields textarea{min-height:150px;resize:vertical;line-height:1.55}.context-learning-fields .row{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:8px}.context-learning-fields>button{width:max-content}.context-learning-empty{border:1px dashed var(--line);border-radius:11px;padding:24px;color:var(--muted);font-size:10px;text-align:center}.context-evaluation-card{border-top:1px solid var(--line);margin-top:15px;padding-top:15px;display:grid;grid-template-columns:68px minmax(0,1fr);gap:15px}.context-evaluation-score{width:66px;height:66px;border-radius:12px;background:var(--green-soft);color:var(--green);display:grid;place-content:center;text-align:center}.context-evaluation-score strong{font:800 23px/1 Manrope,sans-serif}.context-evaluation-score span{font-size:8px}.context-evaluation-title strong,.context-evaluation-title span{display:block}.context-evaluation-title strong{font-size:12px}.context-evaluation-title span{color:var(--muted);font-size:8px;margin-top:3px}.context-evaluation-metrics{display:flex;gap:8px;margin:10px 0}.context-evaluation-metrics span{background:#f4f3ef;border-radius:7px;padding:6px 8px;font-size:8px}.context-evaluation-card p{margin:7px 0;color:var(--muted);font-size:9px;line-height:1.5}.context-evaluation-card p b{color:var(--ink)}.context-evaluation-card button{margin-top:7px}
    @media(max-width:900px){.context-learning-grid{grid-template-columns:1fr}}@media(max-width:600px){.context-learning-panel{padding:16px}.context-learning-fields .row{grid-template-columns:1fr}.context-learning-fields>button{width:100%;justify-content:center}.context-evaluation-card{grid-template-columns:1fr}.context-evaluation-score{width:100%;height:54px}}
  `;
  document.head.appendChild(style);
}

function installContextLearningUi() {
  const shell = document.querySelector('#contextView .context-rag-shell');
  if (!shell || document.getElementById('contextLearningGrid')) return;
  shell.insertAdjacentHTML('beforeend', `<div class="context-learning-grid" id="contextLearningGrid">
    <section class="context-learning-panel"><div class="context-learning-head"><div class="eyebrow">Fase 4.2</div><h3>Gerar pergunta contextual</h3><p>Use uma fonte recuperada para criar um rascunho e revise antes de salvar no Active Recall.</p></div><div class="context-learning-fields"><div><label for="contextQuestionSource">Fonte</label><select id="contextQuestionSource"></select></div><div class="row"><div><label for="contextQuestionMode">Tipo de raciocinio</label><select id="contextQuestionMode"><option value="explain">Explicar</option><option value="apply">Aplicar</option><option value="contrast">Relacionar e distinguir</option></select></div><button class="primary-btn" type="button" data-context-generate>${icon('brain')}Gerar rascunho</button></div></div></section>
    <section class="context-learning-panel"><div class="context-learning-head"><div class="eyebrow">Fase 4.3</div><h3>Avaliar minha explicacao</h3><p>Compare sua resposta com conceitos-chave da fonte e transforme lacunas em acao de revisao.</p></div><div class="context-learning-fields"><div><label for="contextEvaluationSource">Fonte de referencia</label><select id="contextEvaluationSource"></select></div><div><label for="contextExplanation">Explicacao com suas palavras</label><textarea id="contextExplanation" maxlength="3000" placeholder="Explique sem consultar a fonte..."></textarea></div><button class="primary-btn" type="button" data-context-evaluate>${icon('check')}Avaliar explicacao</button></div><div id="contextEvaluationResult"></div></section>
  </div>`);
}

installContextLearningStyles();
installContextLearningUi();
renderContextLearningSources();
renderContextEvaluation();
const runContextRagSearchWithoutLearning = runContextRagSearch;
runContextRagSearch = function() { runContextRagSearchWithoutLearning(); renderContextLearningSources(); };
const renderAllWithoutContextLearning = renderAll;
renderAll = function() { renderAllWithoutContextLearning(); renderContextLearningSources(); renderContextEvaluation(); };
document.addEventListener('click', event => {
  if (event.target.closest('[data-context-generate]')) generateContextQuestion();
  if (event.target.closest('[data-context-evaluate]')) runContextExplanationEvaluation();
  if (event.target.closest('[data-context-log-gap]')) logContextEvaluationGap();
});
