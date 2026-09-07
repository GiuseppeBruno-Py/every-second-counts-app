# Archive status: Shipped

Closed 2026-09-07. Copy-only archive; original phase record follows unchanged. See SHIPPED.md for final verification and release boundaries.

---

# BRAINSTORM: Core Visual Revamp

Status: Complete (Defined)
Date: 2026-09-05
Continuation: the user requested the next step after the recommendation of Direction A. Define adopts A as an explicit working assumption; the historical report below remains unchanged and does not claim an explicit A/B vote.
Next artifact: DEFINE.md in this directory.
Provenance: COMPASSO-VISUAL-DISCOVERY.md from Prompt 1A, retained verbatim below.

---
# Compasso — descoberta da direção visual

Prompt 1A · 5 de setembro de 2026 · proposta para decisão, sem implementação de produção.

**Recomendação: Direção A — Caderno de trabalho.** Ela dá mais espaço à tentativa e à evidência, reduz o peso dos contêineres e aproxima a aparência do uso reflexivo do Compasso. A Direção B — Estúdio de execução — é a alternativa de maior densidade e menor mudança tipográfica.

As duas propostas usam o mesmo conteúdo, os mesmos estados e os mesmos controles de negócio. A recomendação não equivale à escolha do usuário nem autoriza o Prompt 1B.

## 1. Referência técnica e limites

| Item | Evidência desta sessão |
|---|---|
| Checkout inicialmente aberto | `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app` |
| Branch e HEAD desse checkout | `main` · `a8db92647282d560ed31d5b6286fbe52764c44d9` |
| Trabalho local preexistente | somente `.codegraph/.gitignore` não rastreado; preservado |
| CodeGraph | consultado nesse checkout; declarou índice atualizado, com 16 arquivos e 358 nós; não é evidência da outra árvore |
| Referência da interface entregue | `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-local-data-safety-brainstorm` |
| Branch de referência | `codex/local-data-safety-brainstorm` |
| HEAD de referência | `5c7fb210ac5c240f46f0987913fb488bbd3108db` |
| Estado inicial dessa árvore | limpo; `.codegraph/` ausente, portanto inspeção direta |
| Contratos | `compasso-pages-v78`, `compasso.state.v3` |
| Ambiente visual | servidor local dedicado em `127.0.0.1:4188`, com os arquivos reais e a composição pelo Service Worker |
| Dados da inspeção | exemplos locais; uma capacidade e uma sessão demonstrativa criadas nessa origem, separada da PWA publicada |
| Produto alterado | nenhum arquivo; nenhum commit, push, merge ou deploy nesta descoberta |

O checkout inicial não contém o commit do checkpoint como ancestral. Por isso a referência desta proposta é explicitamente o worktree do PR #78, e não o `main` local antigo. Nenhuma branch foi movida ou reconciliada.

O [PR #78](https://github.com/GiuseppeBruno-Py/every-second-counts-app/pull/78) continua Draft. O [Browser tests 33925018081](https://github.com/GiuseppeBruno-Py/every-second-counts-app/actions/runs/33925018081) terminou com sucesso para o head acima. Isso é evidência da entrega anterior, não validação de um redesign. O smoke humano da PWA instalada v77 → v78 não foi realizado nesta sessão.

## 2. Diagnóstico da interface real

Foram observados Hoje sem plano, Hoje com uma tentativa de capacidade, configuração de início aberta e recolhida, sessão ativa, encerramento com Evidence e continuação após salvar. A inspeção incluiu desktop e o encerramento em 360 px.

### Achados observados

1. **Os botões comprimem o conteúdo principal.** No desktop observado, `.today-primary-copy` ficou com aproximadamente **171 px**, enquanto `.today-primary-actions` ocupou **654 px**. O título “Comparar EXPLAIN antes e depois de criar um índice” quebrou em quatro linhas. O problema central é a distribuição de espaço, não simplesmente aumentar a fonte.
2. **O Journal compete visualmente com a tentativa.** `#journalTodayPanel` apareceu como um banner escuro de aproximadamente **151 px de altura**, com um segundo título “Hoje” e o contador `0/1`. Esse peso aproxima informação contextual da importância da sessão ativa.
3. **Há muitas fronteiras simultâneas.** Hoje combina bloco principal, banner, painéis, linhas internas e estados vazios com bordas próprias. Nos diálogos, resumo, intenção, opções e Evidence voltam a aparecer como caixas dentro de caixas.
4. **Metadados e formulários precisam de uma escala legível.** No encerramento a 360 px, os labels computados tinham **11 px** e os campos **12 px**. Não houve overflow horizontal nessa amostra; caber na tela, entretanto, não garante conforto de leitura.
5. **A sessão ativa tem duas superfícies com finalidades existentes.** Hoje aponta para a execução; o Companion mantém cronômetro e controles globais. O redesign deve melhorar ambos sem criar outro motor de sessão, duplicar comandos ou eliminar a recuperação entre telas.
6. **Há uma disputa entre notificações na conclusão.** No celular observado, o painel “Evidence salva” coexistiu com toast e navegação inferior. É necessário verificar espaço reservado e empilhamento, sem mudar o momento em que o sucesso é emitido.

Esses achados são inspeção da interface e medidas do DOM. Não foram feitas entrevistas ou testes de usabilidade com participantes; a preferência estética e o ganho de velocidade ainda precisam ser confirmados pelo usuário.

### Donos do comportamento e da aparência

Os caminhos abaixo são relativos ao worktree de referência declarado acima.

| Arquivo / entrada | Papel e evidência |
|---|---|
| `index.html` | documento, shell, estilos legados, classes gerais `.primary-btn`, `.secondary-btn`, `.quiet-btn`, `.eyebrow`; não é o único dono da aparência final |
| `app-manifest.js` | ordem de composição e assets; Today, Sessions, Companion, Evidence, Journal e aprimoramentos posteriores contribuem para a mesma tela |
| `today-feature.js:167` · `renderTodayPrimary()` | estado vazio, próxima tentativa, ação comum e execução; cinco controles da tentativa principal |
| `today-feature.js:198` · `renderToday()` | plano e blocos secundários; precedência derivada, sem ranking novo |
| `sessions-feature.js:73` · `installSessionStyles()` | CSS legado de banner, formulário e histórico; labels de 11 px e resumos de 12 px |
| `sessions-feature.js:88` · `installSessionUi()` | diálogos reais de início e encerramento, IDs e campos |
| `sessions-feature.js:165` · `openSessionStartCore()` | configuração opcional, origem, foco e padrões existentes |
| `sessions-feature.js:326` · `openSessionFinish()` | estado `finishing` e duração congelada |
| `session-companion-feature.js:136` · `installUi()` | Companion real, Pausar, Concluir, janela flutuante e encaixe do checkpoint E1 |
| `evidence-feature.js:52` · `installEvidenceFields()` | Tipo, resumo obrigatório e detalhe; wrapper `.evidence-box` |
| `evidence-feature.js:68` · `installEvidenceCompletion()` | painel posterior ao save, sem decisão automática sobre a próxima tentativa |
| `journal-feature.js:213` · `renderJournalIntegrations()` | insere e reposiciona o painel de Hoje; adiciona contexto ao início da sessão |
| `design-system.css` | tokens `--ds-*`, componentes, `.today-primary-*`, `.session-options`, `.execution-completion` e Companion |
| `design-system-model.js:7` | marcos declarados de 360, 768 e 1280 px |
| `design-system-feature.js` | aprimoramento semântico, estados, teclado e foco de componentes dinâmicos |

Documentação reconciliada: `docs/today-feature.md`, `docs/sessions-feature.md`, `docs/design-system.md`, além de `AGENTS.md` e do manifesto.

### Cascata e responsividade

Existem tokens centrais, mas também valores diretos no documento e CSS legado criado por módulos. Não basta modificar `--ds-type-body`: várias regras de sessão, Companion e Today usam tamanhos próprios. Os papéis `[data-ds-role]` ainda usam `!important`, o que exige conferir o estilo computado depois da composição completa.

Os breakpoints relevantes encontrados incluem 1023/767 px no sistema, 920/620 px em Today, 720 px em Sessions, 520 px no Companion e 390 px para empilhamento das ações. Não proponho consolidar todos os breakpoints do aplicativo nesta entrega. O piloto deve funcionar nos pontos intermediários e respeitar o shell existente.

## 3. Conteúdo e estados iguais para a comparação

| Elemento | Conteúdo demonstrativo |
|---|---|
| Capacidade | Diagnosticar uma consulta SQL lenta |
| Critério de prova | Comparar o plano de execução antes e depois de um índice e justificar a escolha |
| Próxima tentativa | Comparar EXPLAIN antes e depois de criar um índice |
| Outra ação no plano | Registrar a hipótese sobre índices compostos |
| Sugestão de apoio | Revisar uma nota sobre índices compostos |
| Tempo mostrado no estudo visual | 24:32; valor ilustrativo, sem contagem ou avaliação de competência |
| Evidence | O índice reduziu a leitura de linhas; comparei os dois planos e registrei o custo. |

O estado vazio representa um dia sem ações planejadas, não necessariamente uma conta sem capacidades ou material. Os dados de apoio são exemplos genéricos e não foram extraídos de backups pessoais.

| Estado | Tratamento compartilhado pelas duas direções |
|---|---|
| Hoje vazio | “Escolha a próxima ação”, Nova ação e estado sem plano; os contextos existentes continuam abaixo |
| Hoje planejado | tentativa em largura de leitura, Iniciar agora e Ajustar sessão; Abrir capacidade, Concluir no plano e Remover do plano continuam visíveis |
| Hoje ativo | execução conserva precedência; Retomar sessão e Companion mantêm suas finalidades; a referência do plano não é concluída automaticamente |
| Início | título e resumo, intenção do Journal, disclosure opcional existente, energia opcional, Cancelar e Iniciar sessão |
| Encerramento | observação, Tipo, resumo obrigatório, detalhe, check-in opcional, Cancelar e Salvar sessão |
| Após salvar | Evidence salva, texto registrado, regra de preservação do plano e ações existentes de continuação |

Os campos condicionais de recurso, métricas de Leitura/Estudo, Ritual e E1 continuam condicionais. O exemplo usa capacidade sem recurso, por isso não mostra um valor final de páginas/horas que não se aplica a esse caso.

## 4. Direção A — Caderno de trabalho

### Filosofia

Um espaço pessoal de trabalho e reflexão: papel quente, tinta escura, verde discreto e títulos com serifa. A personalidade vem da tipografia e do ritmo de leitura. Evita transformar o plano em um painel de indicadores.

A tentativa ocupa uma seção aberta, com os botões abaixo do texto. O restante do plano usa linhas e separadores, sem um cartão para cada nível de agrupamento. O contexto fica legível, mas não recebe um grande banner.

### Tipografia

| Papel | Proposta A |
|---|---|
| Corpo | `system-ui`, 17 px, entrelinha 1,55 |
| Texto secundário e labels | 14 px, entrelinha 1,5; nunca reduzir para acomodar botões |
| Hoje | Georgia ou serifa de sistema equivalente, 30 px, entrelinha 1,2 |
| Tentativa | Georgia, 28 px desktop / 25 px estreito, entrelinha 1,27 |
| Título do diálogo | Georgia, 26 px, entrelinha 1,2 |
| Seções | sans-serif 20 px / peso 600; contexto 18 px |
| Campos | sans-serif 16 px, entrelinha 1,5 |
| Botões | sans-serif 14 px / peso 600; altura mínima 44 px |
| Cronômetro | sans-serif 32 px com algarismos tabulares |
| Largura de leitura | textos longos até 65 caracteres; tentativa até 32 caracteres por linha quando houver espaço; diálogo até 640 px |

Não precisa baixar uma nova fonte. Antes de consolidar a escolha, verificar Georgia e o fallback de sistema em Android, Windows e iOS: o nome da família não garante desenho idêntico.

### Espaço, forma e controles

Escala de 4, 8, 12, 16, 24, 32 e 48 px. Usar 24 px como respiro de seção, 32 px entre regiões e 16–18 px nas bordas do celular. Raio de 12 px em controles/superfícies, 8 px em elementos pequenos; nenhuma necessidade de pills nos grupos principais.

O botão primário tem fundo verde e texto claro no tema claro. O secundário tem superfície sólida e borda; o terciário tem fundo transparente e texto legível. A ação destrutiva continua explicitamente rotulada e vermelha. Campos e selects compartilham borda, raio, altura e foco. Menus existentes recebem esses mesmos tokens, sem introduzir um novo menu para esconder os três controles secundários da tentativa.

Sombra fica reservada ao diálogo ou superfície flutuante, com baixa opacidade. Seções do plano não recebem sombra. Sucesso, aviso e erro usam texto e relação semântica; cor sozinha não comunica o estado. Disabled conserva label e geometria, com fundo discreto e estado nativo; loading mantém a largura do botão e uma mensagem compreensível.

### Layout e celular

Ordem de leitura: ação principal → restante do plano → intenção/foco/sugestões/decisões. Mudar a posição visual de um bloco exige manter a mesma ordem no DOM; não usar `order` para deixar teclado e leitura em outra sequência.

No celular, o texto vem antes dos botões. As ações quebram em linhas próprias; não se forma uma coluna de texto estreita ao lado delas. Alvos efetivos de 44 × 44 px, campos de 16 px e footer do diálogo em uma ou duas linhas conforme o espaço.

Preservar a navegação móvel existente. O Companion continua acima dela, com área segura e suporte de reposicionamento existente. Nos estudos visuais ele aparece em fluxo para permitir comparação completa: isso não propõe substituir seu comportamento global por uma segunda sessão inline.

Diálogo em sheet na tela estreita, com rolagem única e largura total útil. Footer pode ficar sticky dentro do diálogo somente se não esconder o campo focado quando o teclado abre. Não fixar a seção principal de Hoje nem criar outro cabeçalho grudado na tela.

### Integração e risco

Impacto CSS moderado: a mudança de fonte é limitada a títulos do piloto, enquanto controles continuam sans-serif. O risco principal é a serifa quebrar títulos longos de modo diferente em cada plataforma. Espaço flexível e comparação com texto longo têm precedência sobre alturas fixas.

## 5. Direção B — Estúdio de execução

### Filosofia

Uma ferramenta clara e precisa, com canvas frio, azul, superfícies brancas e tipografia sem serifa. A ação atual é uma superfície única com borda lateral; os demais blocos continuam abertos. A ideia é oferecer maior densidade sem retornar a pequenos textos ou grades de indicadores.

### Tipografia

| Papel | Proposta B |
|---|---|
| Corpo | `system-ui`, 16 px, entrelinha 1,55 |
| Texto secundário e labels | 14 px, entrelinha 1,5 |
| Hoje | sans-serif 30 px / peso 600 |
| Tentativa | sans-serif 28 px / peso 600; 25 px no estreito |
| Diálogo | sans-serif 26 px / peso 600 |
| Seções | 20 px; contexto 18 px |
| Campos | 16 px / entrelinha 1,5 |
| Botões | 14 px / peso 600; altura mínima 44 px |
| Cronômetro | 32 px, algarismos tabulares |
| Largura de leitura | até 65 caracteres; diálogo até 640 px; nunca reduzir o título a uma faixa lateral |

### Espaço, forma e controles

Escala de 4, 8, 12, 16, 20, 24 e 32 px. Padding de referência de 20 px, 16–18 px no celular, raio de 6 px. A densidade vem principalmente do espaçamento menor e da fonte única, não da redução dos alvos de toque.

Botão primário azul, secundário com borda, terciário transparente e destrutivo vermelho. Inputs, selects e menus seguem a mesma geometria. O foco roxo é distinto do azul da ação e tem contorno sólido de 3 px. Hover sublinha ou altera levemente a superfície; não levanta cartões. Disabled/loading seguem o mesmo contrato da A.

Um cartão é permitido para a ação atual por ter um estado operacional próprio; isso não autoriza cartões dentro de cartões no formulário de Evidence. Bordas de seção são discretas e não precisam ter a mesma intensidade da borda de um campo interativo.

### Layout e celular

Mesma ordem e mesmos controles da A, com menos espaço vertical. O cartão principal fica em largura total e mantém texto acima das ações. Formulários usam uma coluna para o resumo de Evidence mesmo no desktop, evitando que o campo mais importante dispute espaço com Tipo.

Preservar navegação, sheet e Companion da mesma forma descrita para A. Um usuário deve conseguir tocar em Salvar ou Cancelar sem depender de hover. Não adicionar barras de progresso, métricas ou status novos para ocupar a área disponível.

### Integração e risco

Menor mudança tipográfica e boa compatibilidade com controles existentes. O principal risco é o destaque azul e as bordas evoluírem para uma aparência de dashboard. Restringir a superfície destacada à ação atual e manter contexto sem cartões repetidos.

## 6. Sistema de cores concreto

Cada célula mostra **claro / escuro**. Os papéis são equivalentes entre as direções; os valores não devem ser misturados arbitrariamente.

| Papel | A · Caderno | B · Estúdio |
|---|---|---|
| Canvas | `#f5f3ed` / `#181e1b` | `#f1f4f6` / `#151c24` |
| Superfície | `#fffef9` / `#232c26` | `#ffffff` / `#202b36` |
| Texto principal | `#252b27` / `#f1f2ec` | `#192735` / `#edf3f9` |
| Texto secundário | `#596259` / `#b8c1b8` | `#506174` / `#b2c3d5` |
| Borda de controle | `#868e80` / `#7d8b7f` | `#788b9d` / `#8296ab` |
| Acento / CTA | `#315a46` / `#b3d6bc` | `#235da0` / `#a7cdfb` |
| Texto sobre CTA | `#ffffff` / `#142a1c` | `#ffffff` / `#142b46` |
| Sucesso | `#26613d` / `#9bd4aa` | `#226046` / `#9bd8b7` |
| Aviso | `#76520b` / `#efd28b` | `#77510a` / `#f4d28d` |
| Erro / perigo | `#a32630` / `#ffadb2` | `#ad2838` / `#ffb0b9` |
| Foco | `#6b3eb5` / `#dcc4ff` | `#773ea7` / `#e6bdff` |
| Fundo discreto | `#e7ecdf` / `#2b3b30` | `#e3edf7` / `#293e52` |

Foram calculados **68 pares**: texto, secundário, acento, sucesso, perigo e aviso sobre canvas e superfície; texto do CTA sobre o acento; borda e foco sobre canvas/superfície. Todos passaram nos limites usados: 4,5:1 para texto e 3:1 para foco/borda. Os pares de estados disabled não são uma declaração de conformidade global.

Exemplos no tema claro: secundário/canvas **5,71:1** em A e **5,76:1** em B; texto/CTA **7,83:1** em A e **6,68:1** em B. A borda clara de B foi ajustada para **3,18:1** contra o canvas. Esses cálculos não substituem a verificação dos estilos computados do produto após a integração.

O protótipo acompanha a aparência do host para permitir a comparação. Uma nova preferência persistida de tema no Compasso não faz parte do piloto; a escolha de como disponibilizar um tema escuro de produção deve respeitar o mecanismo que já existir na base escolhida.

## 7. Comparação lado a lado

| Dimensão | A · Caderno de trabalho | B · Estúdio de execução |
|---|---|---|
| Legibilidade | corpo de 17 px, leitura mais espaçada; serifa distingue tentativa do restante | corpo de 16 px e uma só família; boa continuidade entre texto e campos |
| Hierarquia | espaço e tipografia orientam; menos grandes superfícies | cartão operacional e azul orientam; mais contraste estrutural |
| Mobile | confortável, com mais rolagem vertical | ligeiramente mais compacto; bordas exigem cuidado em áreas estreitas |
| Acessibilidade | mesmos alvos, semântica e contraste; conferir fallback da serifa | mesmos critérios; menor variação de fonte |
| Complexidade | moderada, por fonte de título e ritmo mais aberto | moderada, próxima da linguagem atual de controles |
| Compatibilidade com código | usa IDs/comandos atuais; exige resolver largura e CSS legado | mesma exigência de cascata; não é apenas mudar a cor do tema |
| Manutenção | dois papéis de fonte claramente delimitados | uma família facilita consistência |
| Personalidade | pessoal, reflexiva, ligada a leitura e escrita | precisa, operacional, ligada a execução |
| Risco | excesso de espaço ou quebra de títulos em certas plataformas | voltar a cartões e a uma aparência de painel corporativo |

**Escolha recomendada: A.** O principal problema observado é a dificuldade de ler o trabalho em meio aos controles. A responde a isso com uma área de texto aberta e hierarquia editorial. A B é preferível se a prioridade do usuário for uma aparência mais técnica e compacta. Não há necessidade de combinar as duas para produzir uma terceira direção antes dessa escolha.

## 8. Tokens iniciais para o piloto

Proposta de escopo: variáveis locais para a experiência visual, com pontes explícitas para o design system existente. Não trocar globalmente `--ink`, `--muted`, `.field` ou `.primary-btn` na primeira etapa.

```css
/* Proposta de A; não aplicada ao repositório. */
:is(#todayView, #sessionStartDialog, #sessionFinishDialog,
    #executionCompletionPanel, #sessionCompanion) {
  --pilot-canvas: #f5f3ed;
  --pilot-surface: #fffef9;
  --pilot-text: #252b27;
  --pilot-muted: #596259;
  --pilot-border: #868e80;
  --pilot-accent: #315a46;
  --pilot-on-accent: #fff;
  --pilot-success: #26613d;
  --pilot-warning: #76520b;
  --pilot-danger: #a32630;
  --pilot-focus: #6b3eb5;
  --pilot-font: system-ui, sans-serif;
  --pilot-heading-font: Georgia, serif;
  --pilot-body: 1.0625rem;
  --pilot-secondary: .875rem;
  --pilot-input: 1rem;
  --pilot-line: 1.55;
  --pilot-space-1: .25rem;
  --pilot-space-2: .5rem;
  --pilot-space-3: .75rem;
  --pilot-space-4: 1rem;
  --pilot-space-6: 1.5rem;
  --pilot-space-8: 2rem;
  --pilot-space-12: 3rem;
  --pilot-radius-control: .75rem;
  --pilot-border-width: 1px;
  --pilot-control-min: 2.75rem;
  --pilot-input-min: 3rem;
  --pilot-focus-width: 3px;
  --pilot-reading-width: 65ch;
  --pilot-dialog-width: 40rem;
  --pilot-overlay-shadow: 0 8px 24px rgb(25 35 29 / 12%);
  --ds-color-accent: var(--pilot-accent);
  --ds-color-text: var(--pilot-text);
  --ds-color-focus: var(--pilot-focus);
}
```

Para B, mudar a família de títulos para `system-ui`, corpo para `1rem`, raio para `.375rem`, espaçamento principal para `1.25rem` e os papéis de cor conforme a tabela. Os diálogos continuam usando os componentes e controles nativos.

A implementação deve conferir cada regra `!important` e cada cor fixa do sistema antes de mapear os papéis. Um alias não muda automaticamente uma regra que ainda contém um hexadecimal ou tamanho direto.

## 9. Fronteira exata proposta para implementação piloto

Esta lista é uma fronteira de descoberta, não um DESIGN SDD aprovado. Deve ser reconciliada com a base efetiva antes de iniciar produção.

| Arquivo | Seletores / componentes candidatos | Alteração permitida |
|---|---|---|
| `design-system.css` | `#todayView .today-primary-*`, `.today-row-*`, `.today-actions`, `.today-panel`, `.today-grid`, `#todayView #journalTodayPanel` | tokens locais, largura do texto, ações em linhas próprias, remover fundos/bordas redundantes, ritmo de leitura |
| `design-system.css` | `#sessionStartDialog`, `#sessionFinishDialog`, `.session-dialog-head/body/foot`, `.session-summary`, `.session-options`, `.session-options-body` | campos e helpers legíveis, reflow, foco, sheet, footer sem sobreposição |
| `design-system.css` | `#sessionFinishDialog .evidence-box`, `.evidence-grid`, `.evidence-help`, `#executionCompletionPanel`, `.execution-completion-actions` | remover caixa interna redundante, resumo com largura total, texto e ações após salvar |
| `design-system.css` | `#sessionCompanion`, `.session-companion-copy`, `.session-companion-time`, `.session-companion-actions` | aumentar leitura útil, permitir títulos longos, preservar controles e zona acima da navegação |
| `today-feature.js` | template de `.today-shell` e markup em `renderTodayPrimary()` | apenas wrappers/ordem estrutural necessários à leitura; IDs, `data-today-*`, handlers e precedência preservados |
| `journal-feature.js` | `renderJournalIntegrations()` apenas para o posicionamento de `#journalTodayPanel` dentro de Hoje | ajustar uma inserção de DOM se necessária para que a ordem de leitura coincida com a nova apresentação; não editar Journal fora desse encaixe |
| `sessions-feature.js` | `installSessionStyles()` e `installSessionUi()` | mover somente CSS do piloto para a camada estática, se necessário; preservar histórico, validação e lógica transacional |
| `evidence-feature.js` | `installEvidenceFields()` / `installEvidenceCompletion()` | wrappers de apresentação se CSS não bastar; manter required, limites, IDs e sequência do save |
| `session-companion-feature.js` | `installUi()` | markup acessível de apresentação somente se necessário para texto/controles; preservar drag, timers, E1 e janela flutuante |
| `docs/design-system.md` | seção do piloto | registrar tokens, responsabilidades e restrições de migração |

`energy-feature.js`, `ritual-feature.js` e `contingency-feature.js` precisam ser lidos na fase de Design porque acrescentam campos aos diálogos; a proposta inicial estiliza seus encaixes sob o diálogo, sem editar suas regras. `flow-feature.js` conserva formulário, sugestões e filtros; a descoberta não o transforma em um disclosure novo.

`index.html`, `design-system-model.js` e `design-system-feature.js` são superfícies de auditoria da cascata e da acessibilidade. Não estão automaticamente autorizados para uma limpeza global. Se for necessário alterar semântica central ou shell fora do piloto, documentar a necessidade no Design.

Quando o Build mudar assets cacheados, `app-manifest.js` e os testes correspondentes precisarão de uma geração **posterior à base então vigente**. Não reservar “v79” agora nem mudar a geração neste estudo. `service-worker.js` e sua arquitetura permanecem fora do escopo.

### Sequência sugerida

1. Confirmar a direção e a base atual, incluindo a situação do PR #78.
2. Fechar os requisitos visuais e o Design do piloto com contratos e seletores acima.
3. Implementar primeiro a largura da tentativa e a escala dos campos com tokens locais.
4. Migrar apenas as regras legadas que conflitam com esses componentes; não criar mais uma camada de CSS injetado.
5. Aplicar o mesmo sistema aos diálogos e ao Companion, inclusive os encaixes condicionais.
6. Verificar teclado, foco, mensagens, texto longo e persistência antes de atualizar snapshots.

## 10. Evidência de verificação e critérios do próximo Build

### Executado nesta descoberta

- Leitura do estado Git nos dois worktrees; referência entregue limpa.
- Inspeção real pela UI: Hoje vazio, capacidade planejada, início aberto/recolhido, execução ativa, encerramento e Evidence salva.
- Medidas da área principal no desktop e de campos/overflow do encerramento em 360 px.
- Checagem sintática do JavaScript do fragmento com `node --check`: passou.
- Renderização pelo helper da skill de visualização: passou; o fragmento tem aproximadamente 23 KB e não usa rede, armazenamento ou dependências externas.
- **36 combinações de layout do protótipo**: 6 estados × 3 viewports (360, 736, 1024 px) × 2 aparências, com ambas as direções renderizadas. Sem overflow horizontal do contêiner ou dos textos/controles medidos.
- Inspeção visual da comparação clara/escura e do formulário e continuação em tela estreita.
- Erro demonstrativo de Evidence vazia: mensagem visível, `aria-invalid` e foco no campo; preenchimento e ação Salvar levam ao estudo do estado posterior.
- **68 verificações de contraste de pares de tokens**, sem falhas após o ajuste da borda clara de B.

O ambiente de preview tem margens próprias; o conteúdo disponível pode ser menor que a viewport nominal. O protótipo é uma exploração de apresentação: não testa persistência, não executa um save real e não reproduz integralmente o comportamento modal, de foco ou de janela flutuante do aplicativo.

### Não alegado

Não foi executada novamente a suíte de produção, pois nenhum arquivo de produto ou teste foi alterado. Não houve teste físico de PWA instalada, VoiceOver/TalkBack, teclado móvel real, nem teste completo do redesign a 200% de zoom. As verificações de reflow do protótipo não substituem esses gates.

### Proteção já disponível para o futuro piloto

| Suíte existente | O que protege |
|---|---|
| `tests/browser/design-system-flows.spec.js` | componentes dinâmicos, teclado/foco, loading, reduced motion, snapshots, Companion móvel e fluxo a 360–390 px/zoom |
| `tests/browser/capability-context-flows.spec.js` | Today, início, Evidence, falhas transacionais, preservação da tentativa, backup e canários |
| `tests/browser/critical-flows.spec.js` | entradas de execução e comportamento integrado |
| `tests/browser/journal-flows.spec.js` | integrações e fluxo do Journal que alimentam Hoje e início |
| `tests/browser/encoding-e1-flows.spec.js` | checkpoint opcional que não pode ser quebrado pelo Companion |
| `tests/browser/pwa-lifecycle-flows.spec.js` | composição, atualização e funcionamento offline |
| `tests/browser/local-data-safety-flows.spec.js` | Notes e restore como canários fora do piloto |

No Build, usar os comandos reais de `package.json`: `npm test`, `npm run build:test`, `npm run test:browser` e, no fechamento proporcional, `npm run test:all`. O host pode precisar da instalação de Playwright já existente; não adicionar dependências só para este redesign.

Validar Hoje vazio/planejado/ativo, início padrão/configurado, pausa/retomada, `finishing`, salvar/repetir após falha, confirmação da Evidence e refresh. Usar 360, 390, 768 e 1280 px; zoom real de 200%; foco visível e retorno; campos longos; controles condicionais; navegação inferior e Companion sem colisões. Comparar snapshots deliberadamente, nunca recriá-los para silenciar uma falha.

## 11. Explicitamente fora de escopo

- Prompts 1B a 6: nenhuma implementação ou avanço automático.
- Alterar rotas, a lista Hoje/Frentes/Journal/Revisão ou criar acesso novo a Notes/review.
- Mudar rótulos de negócio como Registrar sinal ou Evidence como parte de uma limpeza de terminologia.
- Ocultar ações em menus novos, transformar sugestões de energia em interação sob demanda ou remover recursos existentes; pertencem à discussão de UX posterior.
- Mudar `todayPrimaryState()`, `session.startDefault`, `session.resume`, regras de sessão, critérios de prova, sinais, Evidence ou ordenação persistida.
- Inferir competência a partir do tempo, criar porcentagem de domínio ou concluir automaticamente uma tentativa ao salvar a sessão.
- Alterar IndexedDB/localStorage, `compasso.state.v3`, schema, JSON, Notes, wikilinks, Markdown/vault e suas relações.
- Modificar a arquitetura do Service Worker ou usar este estudo como evidência de smoke instalado.
- Redesign completo de Deep Work, Journal, Frentes, Notes, Revisão semanal ou telas legadas. Seus encaixes visuais no piloto precisam de compatibilidade, não de uma nova jornada.
- Introduzir framework, biblioteca de UI, backend, build de produção, nova fonte remota obrigatória, gráficos decorativos, telemetria ou integração externa.
- Merge, deploy, publicação, remoção de dados pessoais ou alteração da PWA publicada.

## 12. Entrega desta sessão

Produzidos este relatório e uma comparação interativa independente com as direções A/B e os seis estados. Arquivos de preview e verificação também ficam no diretório de saída da tarefa, fora dos repositórios do Compasso.

**Git diff de produção: zero.** O arquivo não rastreado preexistente no checkout inicial permanece preservado. O próximo passo é a escolha visual do usuário e a definição do piloto na base correta; não iniciar implementação automaticamente.
