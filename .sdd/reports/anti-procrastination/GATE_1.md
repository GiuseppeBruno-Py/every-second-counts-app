# Gate 1 — complexidade das Deliveries 1–3

**Data:** 2026-10-02
**Status:** análise técnica registrada; parar antes da Delivery 4
**Base:** PRs #90 e #91 mescladas; Delivery 3 em `codex/environment-ritual`, base `58512ff`
**Evidência:** fonte atual, arquivos SDD das três entregas, 22 cenários browser da Delivery 3 e inspeção visual de seu checklist. Isso comprova comportamento implementado, não redução de adiamento ou uso real.

## 1. As mudanças reduziram ou aumentaram as ações em Hoje?

A tentativa principal tinha seis botões antes deste bloco e agora tem sete. Delivery 1 colocou a ajuda no editor da Capability, sem ação nova em Hoje. Delivery 2 acrescentou **Começar por 5 min**. Delivery 3 usa **Ajustar sessão**, o seletor de Ritual e uma preparação recolhida no diálogo atual; acrescenta zero botões a Hoje. O teste da Delivery 3 verifica a lista exata: Iniciar agora, Começar por 5 min, Ensaiar tentativa, Ajustar sessão, Abrir capacidade, Concluir no plano e Remover do plano.

O início direto continua com um clique. Quem escolhe preparar o ambiente tem mais interações opcionais: abrir configuração, escolher Ritual, abrir preparação, marcar apenas o que ajudar e iniciar ou pular. Não foi demonstrada redução da quantidade total de interações. A simplificação adotada foi usar a configuração existente e não adicionar **Preparar ambiente** como oitavo botão em Hoje.

## 2. Existe duplicação entre Ritual e Attempt Rehearsal?

As responsabilidades permanecem distinguíveis: a ajuda de Delivery 1 define o texto da tentativa; Ritual prepara condições; ensaio contém resultado, primeira ação, dificuldade e resposta. O Ritual de ambiente não abre perguntas nem copia respostas do ensaio. Suas marcas rápidas não viram Evidence, sinais ou outro plano. **Confirmar o primeiro movimento** pode lembrar o primeiro passo do ensaio, mas apenas como condição opcional, sem pedi-lo novamente por escrito.

Há sobreposição semântica com os três controles de preparação já existentes em Deep Work (notificações, material, ambiente). Delivery 3 reaproveita o checklist de Ritual que essa tela já tinha e não cria outra seção, mas os textos ainda podem lembrar as mesmas condições. Recomendação: usar o preset quando suas instruções concretas forem úteis; não tornar obrigatórios os dois grupos nem ampliar a preparação de Deep Work. Nenhuma evidência de uso justifica uma fusão maior neste momento.

## 3. Existe sobreposição entre Start Small e configuração de Session?

Session rápida não possuía duração planejada configurável; mede tempo efetivo até encerramento. Start Small acrescentou um marco de cinco minutos e decisão explícita no mesmo timer. O seletor de modo continua sendo a configuração; Deep Work conserva sua duração planejada. Versão mínima continua representando escopo. Não há um segundo campo de duração curta, cronômetro ou Session para continuar.

Risco de linguagem: uma pessoa pode interpretar cinco minutos como duração total ou sessão inferior. A interface mantém os cinco minutos até a escolha explícita e permite Evidence normal. Não expandir para presets de várias durações antes de observar necessidade.

## 4. Next Attempt ficou mais claro ou mais verboso?

Delivery 1 compõe a ação mínima e, opcionalmente, **Depois de X** no mesmo `nextAttempt.text`, editável antes de salvar, com limite existente de 1000 caracteres. Delivery 2 e 3 não acrescentam texto ao campo. O resultado pode ser mais concreto e também mais longo; o usuário decide a frase final. Os testes mostram composição e propagação corretas, mas não medem clareza percebida. Não preencher condição, intenção, ambiente ou propósito automaticamente no texto.

## 5. Alguma mudança exigiu schema novo?

| Entrega | Impacto persistido |
|---|---|
| 1 — Próximo Passo Executável | Nenhum campo novo; usa `nextAttempt.text`. |
| 2 — Start Small | Session fonte v2 com marcador opcional `startSmall`; projeção usa `plannedMinutes` existente. |
| 3 — Ambiente | Nenhum campo/schema novo; preset no catálogo de apresentação, snapshot atual e checklist rápido vazio. |

Estado global v3, coleções, chaves, stores, sincronização e backup permanecem nos contratos atuais. O `dismissed` da Delivery 3 existe somente no runtime para carregar a dispensa até Deep Work; não entra em Session ou backup. O preset não é semeado na coleção e não recria registros excluídos.

## 6. O que deve ser simplificado antes de prosseguir?

Nesta entrega, o checklist foi colocado como irmão de Ajustar sessão, evitando disclosure aninhado e permanecendo acessível ao recolher configurações. Não foi criado um novo preflight/modal nem um botão adicional em Hoje. Preset e marcas rápidas não acrescentaram persistência.

O próximo aumento de opções precisa de evidência. Se a preparação não for usada ou for percebida como repetição, simplificar o catálogo/texto de Ritual e aproveitar a preparação existente de Deep Work será preferível a ampliar a tela. Os sete botões da tentativa principal já merecem observação de uso antes de outro CTA.

## Decisão de continuidade

1. **O problema ainda existe?** A hipótese de fricção continua plausível; não há observação de uso após as três entregas para medir sua frequência atual.
2. **Há evidência de uso?** Não foi fornecida. Não há analytics remoto, e a automação valida comportamento, não uso pessoal.
3. **A próxima feature resolve um problema observado?** Delivery 4 propõe valor percebido; ainda não há exemplos reais de tentativas concretas/curtas cujo benefício permaneça insuficiente.
4. **É possível resolver por simplificação?** Sim: texto da tentativa, preparação atual e contexto de uso pretendido devem ser avaliados antes de acrescentar campos.
5. **Uma feature existente pode assumir a responsabilidade?** `futureUse` já expressa uso pretendido da tentativa, enquanto `proofCriterion` representa prova da Capability. Isso exige revisão com exemplos reais antes de criar outro campo de benefício.
6. **A próxima mudança aumenta decisões por tela?** Pode aumentar. Qualquer proposta deve preservar a ação principal e usar o contexto existente quando suficiente.

**Recomendação: não iniciar Delivery 4 automaticamente.** Concluir a PR da Delivery 3 e colher observações pessoais sobre início direto, cinco minutos e preparação. Só avançar se persistir uma lacuna concreta que não possa ser resolvida por simplificação ou pelos campos atuais. O relatório não altera produto, não autoriza outra entrega e não atribui eficácia comportamental às mudanças.

## Fontes locais

- `.sdd/archive/executable-next-attempt/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md`
- `.sdd/archive/start-small/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md`
- `.sdd/features/environment-ritual/{DEFINE,DESIGN}.md` e `.sdd/reports/environment-ritual/BUILD_REPORT.md` (evidência final da Delivery 3)
- `today-feature.js`, `learning-outcome-model.js`, `learning-outcome-feature.js`, `sessions-feature.js`, `ritual-model.js`, `ritual-feature.js` e `deep-work-feature.js`
- `tests/browser/environment-ritual-flows.spec.js`, `attempt-rehearsal-flows.spec.js`, `start-small-flows.spec.js` e `encoding-e1-flows.spec.js`
