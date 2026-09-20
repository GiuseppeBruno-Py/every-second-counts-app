# Ensaio da Próxima Tentativa — Define

**Delivery:** 3 — Ensaio da Próxima Tentativa
**Status:** Complete (Built)
**Build gate:** PASS — local corrective Build 2026-09-16; repeated Ship pending. Requirements and clarity remain unchanged.
**Roadmap:** Psicocibernética → Compasso
**Priority:** P0
**Date:** 2026-09-14
**Baseline:** `origin/main@b7246f48ba8177860041892bbdebd97ac15df7c9`
**Predecessor:** Delivery 2 — Evidence Recall em Hoje, merged by PR #83

## 1. Propósito da definição

Definir a menor entrega funcional que permita ao usuário ensaiar, de forma breve e opcional, a próxima tentativa de uma Capability antes de iniciar a Session.

O ensaio é preparação comportamental: explicitar resultado, primeira ação, dificuldade provável e resposta planejada. Ele não é uma promessa de sucesso, não produz análise psicológica e não cria um novo dado durável.

Este documento especifica comportamento observável, regras e limites. Ele não autoriza implementação de produção nem escolhe funções privadas.

## 2. Problema e usuário

O usuário-alvo é a pessoa que usa Hoje para executar a `nextAttempt` atual de uma Capability.

Hoje, o Compasso permite iniciar imediatamente a tentativa ou ajustar a configuração da Session. Esse fluxo preserva velocidade, mas ainda não oferece um momento curto para transformar uma intenção genérica em uma resposta comportamental preparada para a dificuldade mais provável.

O problema não é falta de motivação. É a ausência de um preflight opcional entre a decisão e a execução. O usuário deve poder antecipar o que pretende fazer sem transformar essas respostas em analytics, diário, score ou atributo permanente.

## 3. Resultado desejado

Na `Próxima tentativa` principal de Hoje, o usuário continua podendo iniciar imediatamente e passa a ter uma ação secundária `Ensaiar tentativa`.

O ensaio apresenta, em uma única superfície compacta, no máximo quatro perguntas:

1. Qual resultado você quer produzir nesta tentativa?
2. Qual é a primeira ação concreta?
3. Qual dificuldade provavelmente aparecerá?
4. Como você pretende responder quando ela aparecer?

O usuário pode responder total ou parcialmente, pular o ensaio ou cancelá-lo. Ao escolher `Começar sessão`, o Compasso inicia a mesma Session rápida que seria criada por `Iniciar agora`. As respostas do ensaio são descartadas quando a Session começa e não são copiadas para nenhum registro.

O ciclo recebe um novo passo, sem mudar os conceitos persistidos:

```text
CAPACIDADE
→ PRÓXIMA TENTATIVA
→ ENSAIO OPCIONAL
→ EXECUÇÃO
```

## 4. Objetivos priorizados

### Objetivos P0

1. Oferecer um ensaio opcional apenas para a próxima tentativa principal de uma Capability em Hoje.
2. Preservar `Iniciar agora` como caminho direto, primário e sem etapa adicional.
3. Apresentar as quatro perguntas em uma única superfície simples, utilizável em cerca de 30–90 segundos.
4. Manter todo o rascunho exclusivamente em memória durante o preflight.
5. Descartar o rascunho após início bem-sucedido, cancelamento, saída do preflight ou recarregamento da página.
6. Iniciar a Session pelo contrato existente, sem alterar `nextAttempt`, Capability, Session ou qualquer outro dado com o texto ensaiado.
7. Preservar funcionamento offline, compatibilidade de dados, mobile, teclado e foco.

### Medidas de sucesso

- `Iniciar agora` continua criando a Session como no baseline, sem abrir o ensaio.
- Abrir o ensaio não executa nenhuma escrita em IndexedDB ou localStorage.
- Responder às quatro perguntas não executa nenhuma escrita e não altera o estado serializado do app.
- `Começar sessão` cria a mesma modalidade e o mesmo contexto canônico da Session rápida existente.
- Nenhuma resposta do ensaio aparece em Session, execução, Evidence, learningSignal, `nextAttempt`, backup JSON ou exportação Markdown.
- Cancelar, pressionar Escape ou recarregar descarta o rascunho sem mutação persistida.
- O fluxo permanece completo offline e utilizável em viewport de 360–390 px, zoom de 200% e teclado.

## 5. Escopo

### Dentro do escopo

- A `nextAttempt` atual da Capability exibida como tentativa principal em Hoje.
- Uma ação secundária `Ensaiar tentativa`, subordinada à ação primária de início.
- Uma única superfície de preflight com as quatro perguntas definidas neste documento.
- Respostas livres, opcionais e mantidas apenas no estado efêmero da interface.
- Ações claras para cancelar, pular o ensaio e começar a Session.
- Revalidação do contexto atual antes de iniciar a Session.
- Recuperação segura quando a tentativa fica obsoleta, a Capability deixa de estar disponível, já existe uma execução ativa ou a persistência da Session falha.
- Compatibilidade com o card discreto de Evidence Recall já existente em Hoje.
- Regressão de Session, Today, Evidence, backup/restore, IndexedDB, fallback localStorage, offline/PWA, mobile e acessibilidade crítica.

### Fora do escopo

- Persistir, restaurar, sincronizar, exportar ou analisar respostas do ensaio.
- Copiar respostas para intenção da Session, Evidence, learningSignal, Caderno de Erros, Weekly Review, Notes, Journal ou `nextAttempt`.
- Ensaio para ações comuns, Study, Reading, Goals, Notes, Rituals, Deep Work, Session já ativa, itens secundários de Hoje ou tentativas históricas.
- Alterar, reescrever, concluir ou avançar automaticamente a `nextAttempt`.
- Tornar qualquer pergunta obrigatória.
- Wizard, carousel, rota nova, tela dedicada ou sequência de quatro modais.
- Histórico de ensaios, templates, presets, sugestões geradas ou analytics.
- IA, embeddings, inferência de personalidade, classificação psicológica, score, percentual, diagnóstico, gamificação ou mensagem motivacional.
- Behavioral Experiments, Pressure Simulation, mudanças na Weekly Review ou evolução do Caderno de Erros.
- Novo campo, coleção, store, chave localStorage, versão de schema ou formato de backup.
- Backend, conta, login, cloud sync, integração, serviço externo, framework ou dependência.
- Redesign amplo de Hoje, Sessions, navegação ou Service Worker.

## 6. Requisitos

| ID | Prioridade | Requisito | Resultado mensurável |
| --- | --- | --- | --- |
| R-001 | MUST | O ensaio SHALL estar disponível somente para o `capability-attempt` primário e executável em Hoje, cuja Capability está ativa e cuja tentativa referenciada ainda é a atual. | Nenhuma ação de ensaio aparece para Session ativa, fallback de planejamento, item comum, item secundário, tentativa concluída/histórica ou Capability ausente/arquivada. |
| R-002 | MUST | `Iniciar agora` SHALL continuar sendo a ação primária e iniciar a Session diretamente, sem abrir nem criar rascunho de ensaio. | O caminho direto preserva cliques, contexto, defaults e comportamento do baseline. |
| R-003 | MUST | `Ensaiar tentativa` SHALL ser uma ação secundária, sem competir visualmente com `Iniciar agora`, `Ajustar sessão` ou o Evidence Recall. | A hierarquia de execução de Hoje permanece reconhecível em mobile e desktop. |
| R-004 | MUST | O preflight SHALL apresentar as quatro perguntas definidas neste documento em uma única superfície simples, com labels persistentes e sem etapas sequenciais. | Existem exatamente quatro campos identificáveis; não há carousel, wizard ou modal por pergunta. |
| R-005 | MUST | Todas as respostas SHALL ser opcionais; o usuário SHALL poder começar a Session com respostas completas, parciais ou vazias, além de pular o ensaio explicitamente. | Nenhuma validação de conteúdo bloqueia a execução. |
| R-006 | MUST | O rascunho SHALL existir somente em memória e ficar vinculado ao ID exato da Capability e da tentativa capturados na abertura. | Digitação não altera estado persistido, backup, Markdown nem outros objetos de runtime. |
| R-007 | MUST | O conteúdo do ensaio SHALL servir apenas como preparação visual durante o preflight e SHALL NOT ser copiado, resumido ou inferido em qualquer registro persistido. | Uma comparação profunda antes/depois contém apenas as mudanças normais da criação da Session, sem os quatro textos. |
| R-008 | MUST | `Começar sessão` e `Pular ensaio e começar` SHALL usar o contrato existente da Session rápida para a tentativa atual. | Modalidade, learning context, intent/defaults, resources e snapshot são equivalentes ao início direto no mesmo estado. |
| R-009 | MUST | O rascunho SHALL ser descartado somente após início bem-sucedido da Session, cancelamento, Escape/fechamento equivalente, saída do contexto ou reload. | Reabrir depois de qualquer descarte mostra quatro respostas vazias. |
| R-010 | MUST | Se a criação/persistência da Session falhar, o fluxo SHALL manter o rollback já existente e preservar o rascunho apenas em memória para correção ou nova tentativa. | Nenhuma Session parcial fica ativa; o usuário não perde silenciosamente o preflight antes de sucesso/cancelamento/reload. |
| R-011 | MUST | Antes de iniciar, o fluxo SHALL revalidar Capability, tentativa e ausência de execução concorrente, sem substituir silenciosamente o alvo. | Contexto obsoleto ou conflito não cria Session para outra tentativa e apresenta recuperação neutra. |
| R-012 | MUST | Cancelar, pressionar Escape, fechar a superfície ou navegar para fora SHALL descartar o rascunho, não criar Session e devolver foco de modo previsível quando o gatilho ainda existir. | Estado persistido permanece profundamente igual e o foco retorna ao controle de origem ou a fallback seguro. |
| R-013 | MUST | Reload antes do início SHALL eliminar o preflight sem criar/corromper Session; reload após início SHALL continuar usando a recuperação durável existente. | Pré-início não reaparece; Session confirmada continua retomável. |
| R-014 | MUST | O fluxo SHALL funcionar sem rede depois que o shell atual estiver cacheado e SHALL NOT fazer chamada externa. | Abrir, digitar, cancelar, iniciar, recarregar e retomar funcionam offline. |
| R-015 | MUST | A superfície SHALL oferecer teclado completo, foco visível, ordem de foco coerente, labels não dependentes de placeholder, semântica adequada, Escape/cancelamento, alvos de toque atuais e reflow sem overflow global em 360–390 px e 200% de zoom. | Os contratos existentes de acessibilidade e browser direcionados passam. |
| R-016 | MUST | A entrega SHALL preservar os schemas, stores, chaves, normalização, backup/restore JSON, exportação Markdown e dados legados atuais. | Nenhuma migration é criada; backup antigo e round-trip atual continuam válidos. |
| R-017 | MUST | A cópia SHALL descrever preparação concreta e SHALL NOT prometer resultado, atribuir identidade, gerar encorajamento artificial ou apresentar score. | Não existem frases como `Você consegue!`, percentuais ou conclusões psicológicas. |
| R-018 | MUST | Qualquer mudança futura em JavaScript de produção SHALL avançar uma única vez a geração de cache controlada pelo manifesto, preservando arquitetura e ownership atuais do Service Worker. | Composição, manifesto, update e ciclo offline permanecem coerentes. |

## 7. Regras de negócio

1. O ensaio pertence ao contexto atual da tentativa, não à identidade do usuário e não à Capability como atributo permanente.
2. A presença do ensaio nunca remove nem atrasa o caminho `Iniciar agora`.
3. Os quatro campos podem ser usados total ou parcialmente; conteúdo vazio é válido.
4. `Pular ensaio e começar` é semanticamente equivalente a abandonar o rascunho e usar o início rápido existente.
5. `Começar sessão` não injeta as respostas nos campos configuráveis da Session. A Session recebe apenas os defaults e o contexto que o início rápido já receberia.
6. O rascunho não é um evento, Evidence, learningSignal, analytics, histórico, telemetria ou dado de backup.
7. Apenas um rascunho pode existir por vez na página. Abrir outro contexto encerra e descarta o anterior.
8. A tentativa ensaiada é identificada pelo par exato de Capability e tentativa atual. Texto semelhante não autoriza substituição.
9. Uma Session só é considerada iniciada depois que a gravação canônica existente confirma sucesso.
10. Falhas antes dessa confirmação não autorizam descarte automático do rascunho, criação parcial nem mensagem de sucesso.
11. O card de Evidence Recall continua factual e independente; o ensaio não lê nem copia sua Evidence.
12. O tempo de 30–90 segundos é uma meta de usabilidade sustentada por uma única superfície, quatro perguntas no máximo e ausência de validações obrigatórias, não uma contagem regressiva.

## 8. Restrições

- Arquitetura local-first e funcionamento offline após cache inicial.
- Nenhum dado do ensaio deve atravessar reload ou ser serializado.
- Nenhuma mudança de schema, IndexedDB, localStorage, backup, restore ou Markdown.
- Nenhuma dependência, framework, rota, backend, conta, sync ou integração externa.
- Reutilizar os contratos atuais de Today, Session, Capability, foco, persistência, composição e PWA quando eles satisfizerem os requisitos.
- Preservar Notes, folders, tags, wikilinks, vault metadata, Relations/graph, Journal, Active Recall, Caderno de Erros, Contextual AI, Sessions, Evidence e learningSignals.
- Não modificar a semântica de `Ajustar sessão`, Deep Work, retomada, finalização ou criação de Evidence.
- Não alterar a arquitetura do Service Worker; assets de produção continuam sob geração do manifesto.
- Não introduzir afirmação pseudocientífica de que imaginar ou visualizar garante um resultado.

## 9. Dependências

- Capability e `nextAttempt` persistidas em `learningOutcomes`.
- Referência atual `dailyPlans[].items[].type === 'capability-attempt'`.
- Resolução de estado primário e ações existentes em Hoje.
- Comandos existentes `session.startDefault` e `session.openConfiguration`.
- Criação transacional da Session e execução canônica, com rollback em falha.
- Recuperação de Session ativa após reload.
- Evidence Recall entregue pela Delivery 2, sem acoplamento de conteúdo.
- Contratos atuais de IndexedDB/localStorage, JSON backup/restore, Markdown, composição, manifesto e PWA lifecycle.

## 10. Premissas

1. `origin/main@b7246f48ba8177860041892bbdebd97ac15df7c9` é o baseline da Delivery 3 e contém a árvore funcional aceita da Delivery 2.
2. O resolvedor atual do item primário em Hoje continua sendo a autoridade para a tentativa executável.
3. O caminho `session.startDefault` representa a Session rápida que deve ser preservada pelo início a partir do ensaio.
4. A persistência da Session já diferencia sucesso confirmado de falha com rollback; o Design deve integrar-se a esse limite, não duplicá-lo.
5. Um único painel/dialog compacto comporta as quatro perguntas sem criar navegação interna complexa.
6. Não existe necessidade de consultar ou modificar Evidence para realizar o ensaio.

## 11. Questões abertas

Nenhuma decisão de produto bloqueia o Design.

O Design deve escolher a menor composição compatível com as superfícies e o gerenciamento de foco existentes. Ele não pode reduzir `Pular ensaio` à ausência de um caminho explícito, persistir o rascunho para conveniência ou alterar o comportamento de `session.startDefault`.

## 12. Cenários de aceitação

### AC-01 — Início imediato preservado

**Dado** um `capability-attempt` primário válido em Hoje, **quando** o usuário aciona `Iniciar agora`, **então** a Session rápida começa sem abrir o ensaio e com o mesmo contexto/defaults do baseline.

### AC-02 — Preflight vazio

**Dado** o mesmo contexto válido, **quando** o usuário aciona `Ensaiar tentativa`, **então** uma única superfície mostra as quatro perguntas, ações de cancelar, pular e começar, e nenhum dado é gravado.

### AC-03 — Respostas completas

**Dado** o preflight aberto, **quando** o usuário responde às quatro perguntas, **então** os textos permanecem visíveis durante o preflight e o estado persistido continua profundamente inalterado.

### AC-04 — Respostas parciais ou vazias

**Dado** o preflight aberto com zero a três respostas, **quando** o usuário aciona `Começar sessão`, **então** nenhuma validação de conteúdo bloqueia o início.

### AC-05 — Pular ensaio

**Dado** um preflight com ou sem texto, **quando** o usuário aciona `Pular ensaio e começar`, **então** o rascunho é abandonado e a mesma Session rápida do início direto começa.

### AC-06 — Session não recebe respostas

**Dado** um ensaio com quatro textos distintos, **quando** a Session começa com sucesso, **então** nenhum desses textos aparece em Session, execução, intent, Capability, `nextAttempt`, Evidence, learningSignal, backup ou Markdown.

### AC-07 — Cancelamento por ação

**Dado** um preflight preenchido, **quando** o usuário aciona `Cancelar`, **então** a superfície fecha, o rascunho é descartado, nenhuma Session é criada, o estado persistido não muda e o foco volta ao gatilho quando disponível.

### AC-08 — Escape e fechamento equivalente

**Dado** um preflight aberto, **quando** o usuário pressiona Escape ou usa o fechamento suportado, **então** o resultado é equivalente ao cancelamento explícito.

### AC-09 — Reload antes do início

**Dado** um preflight parcialmente preenchido e nenhuma Session iniciada, **quando** a página recarrega, **então** o preflight e o rascunho desaparecem, nenhuma Session é criada e Hoje volta ao estado persistido anterior.

### AC-10 — Reload depois do início

**Dado** que a criação canônica da Session foi confirmada, **quando** a página recarrega, **então** a Session é retomável pelo comportamento existente e o rascunho não reaparece.

### AC-11 — Falha de persistência

**Dado** um ensaio preenchido, **quando** a escrita da Session falha, **então** não existe Session parcial, o erro existente permanece acionável, o rascunho continua apenas em memória para retry e nenhum texto é persistido.

### AC-12 — Tentativa alterada durante o preflight

**Dado** um ensaio vinculado à tentativa A, **quando** a Capability avança ou a tentativa atual passa a ser B antes do início, **então** a aplicação não inicia silenciosamente B nem usa o rascunho de A; ela bloqueia a ação e oferece recuperação neutra.

### AC-13 — Capability indisponível

**Dado** um preflight aberto, **quando** a Capability é arquivada, excluída ou deixa de resolver como ativa antes do início, **então** nenhuma Session é criada, nenhum alvo substituto é inferido e o usuário retorna a um estado estável.

### AC-14 — Execução concorrente

**Dado** um preflight aberto, **quando** outra Session ou Deep Work torna-se ativa antes do início, **então** a nova Session não é criada e a execução existente mantém precedência.

### AC-15 — Reabertura limpa

**Dado** um ensaio anteriormente descartado por sucesso, cancelamento, saída ou reload, **quando** o usuário abre um novo ensaio, **então** os quatro campos começam vazios.

### AC-16 — Hierarquia de Hoje e Evidence Recall

**Dado** que a próxima tentativa também possui Evidence relacionada, **quando** Hoje renderiza, **então** `Iniciar agora` permanece primário, `Ensaiar tentativa` é secundário, `Ajustar sessão` e `Ver evidência` continuam disponíveis e nenhum deles muda de semântica.

### AC-17 — Dados legados e backup

**Dado** um backup antigo válido ou um round-trip do estado atual, **quando** o app restaura e renderiza Hoje, **então** a restauração permanece válida, o ensaio começa vazio e nenhuma migração ou campo novo é exigido.

### AC-18 — Offline e PWA

**Dado** que o shell completo já está cacheado e o navegador está offline, **quando** o usuário abre, preenche, cancela ou inicia pelo ensaio e depois recarrega, **então** o fluxo funciona sem rede e a Session confirmada continua retomável.

### AC-19 — Mobile, zoom e toque

**Dado** viewport de 360–390 px, ponteiro grosso ou zoom de 200%, **quando** o preflight é usado, **então** as quatro perguntas e ações permanecem alcançáveis, sem overflow global, scroll preso, sobreposição com navegação ou alvo de toque abaixo do contrato atual.

### AC-20 — Teclado e foco

**Dado** uso exclusivo por teclado, **quando** o usuário abre e percorre o preflight, **então** o foco inicial é previsível, a ordem segue perguntas e ações, o foco é visível, labels são anunciáveis, Escape cancela e o foco retorna com segurança.

### AC-21 — Demais domínios sem ensaio

**Dado** Study, Reading, ação comum, item secundário, Deep Work ou Session ativa, **quando** suas superfícies renderizam, **então** nenhuma ação de ensaio é adicionada e seus fluxos permanecem inalterados.

## 13. Erros e recuperação

- Se a resolução da Capability ou da tentativa falhar na abertura, não abrir um preflight órfão.
- Se o alvo ficar obsoleto enquanto o preflight está aberto, revalidar no início e nunca trocar silenciosamente para outro alvo.
- Se outra execução assumir precedência, preservar essa execução e impedir criação concorrente.
- Se a persistência da Session falhar, usar o rollback existente, manter o rascunho apenas na memória corrente e não anunciar sucesso.
- Se a superfície fechar por cancelamento, Escape, navegação ou desmontagem, limpar todas as quatro respostas.
- Se a página recarregar antes do sucesso, aceitar a perda intencional do rascunho e não tentar recuperá-lo.
- Se o gatilho de origem não existir mais ao fechar, mover foco para um destino seguro e existente em Hoje.
- Se o app estiver offline, não degradar para armazenamento remoto, fila de sync ou captura posterior.

## 14. Evidência de baseline e discovery

- Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-attempt-rehearsal`.
- Branch: `codex/attempt-rehearsal`, rastreando `origin/main`.
- HEAD e baseline: `b7246f48ba8177860041892bbdebd97ac15df7c9`.
- Delivery 2: PR #83; feature head `429f4c9d6afe6523950ef51abbd5c315f297d841`; árvore igual ao merge commit: PASS.
- `.codegraph/`: ausente; fontes, testes, documentação e artefatos SDD existentes foram autoritativos.
- `npm ci`: PASS; três pacotes instalados, quatro auditados; duas vulnerabilidades high já reportadas ficaram fora deste slice sem dependências e nenhum `audit fix` foi executado.
- Baseline Node (`npm test`): **216 passed, 0 failed, 0 skipped**.
- Baseline browser focado (`capability-context-flows`, `design-system-flows`, `pwa-lifecycle-flows`, Chromium e mobile): **50 passed, 0 failed, 14 conditional skips**.
- CI remoto da árvore aceita da Delivery 2: Browser workflow `34870748454` PASS; Pages deployment `34871157663` PASS.
- Manifesto atual: `compasso-pages-v82`.
- Fluxo atual confirmado: `Iniciar agora → session.startDefault`; `Ajustar sessão → session.openConfiguration`; criação só anuncia sucesso após persistência canônica; Session ativa é durável e retomável.
- Modelo atual confirmado: o ensaio não necessita novo campo, coleção, schema, migration, backup ou exportação.

## 15. Riscos

| Risco | Impacto | Limite exigido nesta definição |
| --- | --- | --- |
| Respostas vazarem para Session ou analytics | Viola privacidade e escopo do MVP | Estado exclusivamente efêmero e proibição de serialização/cópia. |
| Ensaiar virar etapa obrigatória | Aumenta fricção no ciclo diário | Início direto continua primário; respostas e ensaio são opcionais. |
| Sessão iniciar para tentativa diferente | Quebra confiança e contexto canônico | Vincular rascunho ao alvo exato e revalidar antes da criação. |
| Falha de escrita perder preflight ou criar estado parcial | Prejudica recuperação e durabilidade | Reutilizar rollback existente e descartar somente após sucesso. |
| Modal/painel longo em mobile | Scroll preso e competição com ação principal | Uma superfície compacta, quatro campos no máximo e testes 360–390 px/zoom. |
| Linguagem sugerir efeito psicológico garantido | Contraria posicionamento do produto | Copy concreta, sem motivação, score, diagnóstico ou promessa. |
| Asset novo ficar fora do cache | Quebra fluxo offline | Ownership pelo manifesto e avanço único da geração quando houver código. |

## 16. Necessidade de migration

**Não há necessidade de schema migration.**

O comportamento inteiro é um preflight efêmero. A Delivery 3 não precisa de novo modelo persistido e não deve alterar o estado v3, IndexedDB, localStorage, JSON backup/restore ou Markdown. Se o Design concluir que persistência é necessária, isso invalida esta definição e exige retorno explícito à fase Define, não uma expansão silenciosa.

## 17. Estratégia de verificação esperada

O Design deverá mapear testes proporcionais para:

- unidade/Node: elegibilidade do alvo, vínculo efêmero, descarte, revalidação, equivalência com início rápido e ausência de mutação;
- browser: início direto, quatro perguntas, parcial/vazio, skip, cancel/Escape, erro de escrita, alvo obsoleto, concorrência, refresh e reabertura limpa;
- persistência: IndexedDB, fallback localStorage, deep comparison, backup antigo e round-trip atual;
- Session: start → refresh → resume → finish → Evidence → próxima ação, com e sem ensaio;
- offline/PWA: shell cacheado, abertura, cancelamento, início, refresh offline e lifecycle do Service Worker;
- acessibilidade: teclado, foco, labels, semântica da superfície, Escape, toque, 360–390 px e 200% zoom;
- regressão: Today, Evidence Recall, ajuste de Session, Deep Work, Evidence, Weekly Review, Notes/vault/Relations e exportação Markdown.

## 18. Pontuação de clareza

| Dimensão | Nota | Evidência |
| --- | ---: | --- |
| Problema | 3/3 | O preflight comportamental ausente entre tentativa e execução está explícito. |
| Usuário | 3/3 | O usuário existente de Capability, nextAttempt, Hoje e Session está delimitado. |
| Objetivos | 3/3 | Sete objetivos P0 cobrem opcionalidade, efemeridade, início e compatibilidade. |
| Sucesso | 3/3 | Medidas verificáveis e 21 cenários cobrem happy path, limites, erros, recovery, offline e acessibilidade. |
| Escopo | 3/3 | Superfícies, dados, domínios, exclusões e fronteira de migration estão explícitos. |
| **Total** | **15/15** | **Ready for Design.** |

## 19. Resultado do gate

- Requisitos mensuráveis: PASS.
- Escopo e fora de escopo: PASS.
- Regras, privacidade e fronteira de persistência: PASS.
- Cenários felizes, limites, erros e recuperação: PASS.
- Compatibilidade local-first, offline, mobile e acessibilidade: PASS.
- Clareza: 15/15.
- Código de produção alterado: não.

**Define readiness: PASS — 15/15, requisitos preservados. Build corretiva: PASS local conforme `BUILD_REPORT.md`; Ship deve ser repetido e Delivery 4 não está liberada.**

## 20. Histórico de revisão

| Revisão | Data | Mudança |
| --- | --- | --- |
| 1.0 | 2026-09-14 | Definição inicial da Delivery 3, baseada no `main` após a Delivery 2 e nos contratos atuais de Hoje, Session e persistência. |
| 1.1 | 2026-09-15 | Gate de Design concluído; manifesto fechado, interfaces, rollback e rastreabilidade 21/21 aprovados. |
| 1.2 | 2026-09-15 | Build concluída com 21/21 cenários aceitos; evidência registrada em `BUILD_REPORT.md`. |
| 1.3 | 2026-09-16 | Revisão de Ship invalida a aceitação completa da Build: descarte em navegação, conformidade mobile e cobertura específica precisam de correção. Requisitos, escopo e clareza não mudaram. |
| 1.4 | 2026-09-16 | Build corretiva concluída: 21/21 cenários locais, 218 Node + 272 browser passed, 24 skips condicionais; Ship/publicação permanecem separados. |
