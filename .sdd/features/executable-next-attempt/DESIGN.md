# Próximo Passo Executável — Design

**Delivery:** 1
**Status:** Complete (Built)
**DEFINE:** `.sdd/features/executable-next-attempt/DEFINE.md` — 15/15
**Baseline:** `origin/main@e8c778d`, branch `codex/executable-next-attempt`, cache `compasso-pages-v88`

## Inspeção e estado atual

O worktree começou com apenas o Discovery não rastreado. `.codegraph/` está ausente no worktree; a fonte, `AGENTS.md`, `README.md`, documentação, `package.json`, Playwright, CI e SDD existentes foram inspecionados diretamente. O commit mais recente do plano semanal não alterou Capability ou seu modelo. Os templates citados pelas skills SDD não existem na instalação; este documento segue o contrato da skill e o formato de artefatos anteriores do repositório.

`learning-outcome-feature.js` possui o diálogo nativo, `nextAttempt` de até 1000 caracteres, confirmação de descarte, `outcomeDraftSignature()`, salvamento em estado candidato com rollback, e o painel opcional de simulação. `learning-outcome-model.js` normaliza `nextAttempt` e conserva seu ID na edição. Hoje, Session e Evidence consomem esse texto existente. O problema é não haver ajuda curta para transformá-lo em uma ação de início pequena e contextual.

## Estado alvo e decisões

O diálogo de criar/editar Capability ganha um `<details>` opcional e fechado por padrão, imediatamente após a textarea de próxima tentativa e **separado** do painel de simulação. Ele é oculto ao editar Capability arquivada. O summary é “Tornar mais fácil de começar”; o conteúdo tem dois campos com labels persistentes: “Qual é o menor começo que ainda conta?” e “Depois de qual evento você vai começar? (opcional)”. Exemplos são apenas placeholders/ajuda. Um botão secundário “Usar como próxima tentativa” aplica a frase ao campo canônico, que permanece editável. A ação de salvar existente continua primária; não há botão em Hoje.

Composição pura no modelo atual:

```js
learningOutcomeModel.composeExecutableAttempt({ start, cue }) -> string
```

`start` é obrigatório e ambos os campos são aparados. Pontuação terminal redundante é removida. Com `cue`, a saída é `Depois de ${cue}, vou ${start}.`; sem `cue`, `${start}.`. Texto vazio ou resultado acima de 1000 caracteres gera `TypeError` com `code` estável. A função não persiste, não lê estado e não cria nova forma de `nextAttempt`.

`outcomeExecutableApply()` lê os controles, calcula o resultado e só então substitui o valor visível de `form.elements.nextAttempt`. Reaplicar com os mesmos campos produz a mesma frase. O runtime guarda somente a assinatura dos dois campos aplicados durante a abertura atual. `outcomeDraftSignature()` inclui os campos auxiliares, de modo que Cancel/Escape oferece o mesmo descarte de rascunho que já existe. `outcomeSubmit()` recusa um helper preenchido cuja assinatura não foi aplicada; o erro abre o disclosure, foca o campo e não grava nada. Limpar ambos os campos permite salvar o texto atual. Editar livremente a textarea após aplicar é permitido; a prévia final é sempre o texto que será salvo.

Se a simulação de pressão já foi aplicada **nesta abertura**, `outcomeExecutableApply()` preserva o sufixo exato conhecido por `pressureAppliedCondition` quando ainda está ao fim da textarea. O limite de 1000 caracteres vale para a soma. Quando o sufixo conhecido deixou de estar intacto, a ajuda limpa o marcador de aplicação da pressão; o campo de pressão permanece visível e a validação existente requer reaplicar ou limpar a condição antes de salvar. A simulação aplicada **depois** da ajuda usa o comportamento atual de acrescentar o sufixo. Uma condição persistida em abertura anterior é somente texto canônico: a aplicação explícita mostra a substituição no mesmo campo, para revisão do usuário.

Nenhum texto auxiliar entra em Session, Evidence, backup, export, learning signal ou analytics. O fluxo normal não passa pela ajuda. O salvamento continua `outcomeSubmit() → learningOutcomeModel.createOutcome()/updateOutcome() → outcomePersist() → saveData()` com rollback. Arquivo de dados, versão lógica v3, chave, object stores, sync e normalização não mudam.

## Interfaces, estados e falhas

| Estado | Evento | Próximo estado / efeito |
|---|---|---|
| Fechado | Abrir summary | Ajuda visível; nenhum save. |
| Editando campos | Aplicar válido | Textarea canônica recebe frase, assinatura efêmera atualizada e foco volta para a tentativa. |
| Editando campos | Aplicar vazio ou longo | Erro existente (`role=alert`), foco no campo relevante, textarea e estado durável intactos. |
| Aplicado | Alterar campos auxiliares e salvar | Erro de “aplique ou limpe”, disclosure aberto e foco no campo; sem save. |
| Aplicado | Editar textarea e salvar | Texto final manual do usuário é salvo pelo caminho existente. |
| Qualquer rascunho | Cancelar/Escape/refresh | Nenhuma gravação; confirmação de descarte e retorno de foco existentes. |
| Salvando | Persistência falha | `outcomePersist()` restaura estado anterior, deixa diálogo/rascunho disponível e anuncia erro. |
| Salvando | Persistência sucede | Fecha diálogo; Today e Sessions recebem o texto pelo contrato atual. |

## Alternativas rejeitadas

- Novos campos `minimumDose`, `trigger` ou entidade: não há decisão posterior que precise consultá-los separadamente; exigiriam migração e sync.
- Botão em Hoje: duplicaria o ensaio e aumentaria ações da tela principal.
- Reusar o painel de simulação para a ajuda: as intenções são distintas e isso confundiria redução de escopo com aumento de pressão.
- Autossalvar ao aplicar: contornaria revisão e rollback do editor.
- Gerar frase por IA ou modelo de linguagem: desnecessário para dois campos e incompatível com o contrato offline.

## Manifesto de arquivos fechado

| Caminho | Ação | Propósito / dependência | AC |
|---|---|---|---|
| `.sdd/reports/anti-procrastination/DISCOVERY.md` | modificar | Registrar o avanço de baseline para `e8c778d` após a Discovery | 12 |
| `.sdd/features/executable-next-attempt/DEFINE.md` | criar/atualizar status | Requisitos e gate | todos |
| `.sdd/features/executable-next-attempt/DESIGN.md` | criar/atualizar status | Plano e gate | todos |
| `learning-outcome-model.js` | modificar | Composição pura e erros estáveis; dono de `nextAttempt` | 03–05, 09 |
| `learning-outcome-feature.js` | modificar | Disclosure, controles, apply, draft, interação com pressão e foco | 01–09, 11 |
| `design-system.css` | modificar | Layout responsivo, foco e targets do disclosure | 02, 11 |
| `app-manifest.js` | modificar | Geração de cache v88→v89; lista existente de módulos/assets permanece | 10, 12 |
| `tests/learning-outcome-model.test.js` | modificar | Regras puras de composição, erro e limite | 03–05, 09 |
| `tests/browser/executable-next-attempt-flows.spec.js` | criar | Criação/edição, cancelamento, pressão, persistência, backup, offline, mobile/foco | 01–12 |
| `docs/executable-next-attempt.md` | criar | Uso, limites, compatibilidade e rollback | 01–12 |
| `.sdd/reports/executable-next-attempt/BUILD_REPORT.md` | criar | Evidências, decisões e limites do Build | todos |
| `.sdd/archive/executable-next-attempt/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md` | criar | Cópia legível e fechamento SDD, se o gate Ship passar | todos |

Não há moves/deletes. Se outro arquivo se tornar necessário, rever o Design com Iterate antes de editá-lo. O relatório de Discovery é documentação; não altera código de produto.

## Ordem de implementação e testes

1. Adicionar compositor puro e testes Node.
2. Adicionar disclosure/estado efêmero/validação, respeitando o painel de pressão.
3. Acrescentar CSS estático, documentação e testes Playwright direcionados.
4. Avançar uma vez o cache do manifesto para v89 após revisar os assets e `manifest.webmanifest`; compor fixture e testar update/offline.
5. Rodar `npm test`, Playwright direcionado, `npm run test:browser`, `git diff --check` e revisar o diff completo. `package.json` fornece os comandos; Playwright usa Chromium desktop e mobile. Lint/typecheck não estão configurados.

| Critérios | Evidência planejada |
|---|---|
| 01–05 | Teste puro do compositor e browser create/edit/apply/reapply/inválido/não aplicado. |
| 06–08 | Browser Cancel/Escape/refresh, snapshot Today/Session, falha de save e retry. |
| 09 | Browser ambas as ordens com pressão, sufixo intacto/editado, limite e preview. |
| 10 | Browser JSON antigo/novo, IndexedDB/fallback e offline; Node estado/manifesto existentes. |
| 11 | Browser desktop/mobile em 360 px e 200%, foco, teclado, labels, touch e scrolling. |
| 12 | Testes existentes de manifesto/composição e Playwright PWA update/offline, com geração v89. |

## Migração, rollback e impactos

**Migração: não aplicável.** Só `nextAttempt.text` existente é modificado quando o usuário salva. Backups anteriores continuam legíveis, e o estado novo usa o mesmo formato. A sincronização existente continua por registro `learningOutcomes`; nenhuma coleção/tombstone muda. A exportação Markdown/vault não ganha campo. Os novos controles não fazem rede nem telemetria e têm custo constante de renderização. `app-manifest.js` deriva os assets do módulo/CSS já presentes; `manifest.webmanifest` não precisa mudar. Após exposição de v89 a uma PWA instalada, rollback exige uma geração futura, preservando armazenamento do usuário.

## Gate

DEFINE 15/15; repositório e convenções inspecionados; estado atual/alvo, interfaces, erros, decisões, manifesto, ordem, AC/testes e compatibilidade definidos. **Ready for Build.**
