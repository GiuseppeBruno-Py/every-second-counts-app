# Próximo Passo Executável — Define

**Delivery:** 1 — redução de fricção para iniciar
**Status:** Complete (Built)
**Prioridade:** P0
**Baseline:** `origin/main@e8c778d` / branch `codex/executable-next-attempt`
**Origem:** `.sdd/reports/anti-procrastination/DISCOVERY.md` e roadmap fornecido pelo usuário

## Problema e usuário

A pessoa que planeja uma Capability pode salvar uma próxima tentativa ampla, como “Estudar Spark”. A tentativa fica visível em Hoje, mas não diz qual movimento pequeno fazer nem em que contexto começar. O ensaio em Hoje pergunta pela primeira ação antes da Session, porém sua resposta é efêmera e não corrige a próxima tentativa planejada. O objetivo é ajudar a escrever a própria tentativa de forma executável, sem criar uma etapa obrigatória para quem já sabe o que fazer.

## Resultado e medidas de sucesso

1. A criação e edição normal de Capability mantém o mesmo caminho, sem exigência de usar a ajuda.
2. Uma ajuda secundária no editor existente permite descrever o menor começo útil e, opcionalmente, um evento anterior ao começo, em no máximo dois campos e uma ação de aplicação.
3. Aplicar a ajuda modifica somente o rascunho visível da próxima tentativa. A frase resultante é curta, editável e persiste apenas após o salvamento explícito da Capability.
4. Uma tentativa salva aparece no fluxo existente de Hoje, Session, Evidence, Weekly Review e backup/restore sem nova entidade ou campo.
5. Rascunho descartado, entrada inválida e falha de persistência não alteram o último estado durável. Mobile, teclado, foco e offline continuam utilizáveis.

O percurso da ajuda deve ser realizável em menos de 30 segundos com texto curto; a aplicação não mede nem promete um tempo de usuário. O critério verificável é uma única superfície com até duas perguntas e sem navegação em etapas.

## Escopo e regras

**Dentro:** criação/edição de Capability ativa no diálogo existente; ajuda opcional junto a `nextAttempt`; composição de texto com ou sem evento contextual; prévia no próprio campo editável; validação; coexistência com Simulação deliberada; persistência, PWA e acessibilidade regressivas.

**Fora:** botão novo em Hoje; mudança em Ensaiar tentativa, Rituals, Session, Evidence, Weekly Review ou Behavioral Experiments; inferência de procrastinação; sugestão por IA; score, streak, motivação genérica; novo timer, rota, wizard, coleção, campo persistido, store, dependência, backend ou integração remota.

Regras:

- O controle é opcional e secundário. Nada bloqueia a pessoa que salva a tentativa diretamente sem abrir a ajuda.
- O menor começo útil é obrigatório **somente ao aplicar a ajuda**; o evento anterior é opcional. Não há conteúdo sugerido que se torne dado sem revisão do usuário.
- A frase gerada deve ser mostrada no mesmo `nextAttempt.text` que a pessoa pode continuar editando. O texto anterior não é persistido como campo paralelo.
- Aplicação repetida com os mesmos campos não duplica prefixos. Campos auxiliares modificados após aplicar exigem nova aplicação ou limpeza antes do salvamento, para evitar descarte silencioso.
- Composição acima do limite existente de 1000 caracteres ou sem menor começo não altera o rascunho e informa o erro junto ao campo relevante.
- Se uma condição de simulação foi aplicada no mesmo rascunho, a ajuda preserva o sufixo enquanto ele estiver intacto; se não puder preservá-lo, o formulário exige reaplicar ou limpar a condição antes do salvamento.
- Cancelamento, Escape e refresh antes do salvamento não gravam a ajuda. Falha ao salvar mantém rascunho para correção e restaura o último estado durável.
- O resultado é texto do usuário, não conselho psicológico ou promessa de que iniciar ficará fácil.
- `nextAttempt.id`, `futureUse`, snapshots históricos, schemas, backups e comportamento offline permanecem compatíveis.

## Cenários de aceitação

| ID | Dado / Quando / Então |
|---|---|
| AC-01 | Dada uma nova Capability, quando a pessoa escreve e salva uma tentativa sem abrir a ajuda, então a criação ocorre pelo fluxo anterior, sem campo adicional obrigatório. |
| AC-02 | Dada a criação ou edição, quando a pessoa abre “Tornar mais fácil de começar”, então vê no máximo duas perguntas em uma superfície opcional, com foco e labels claros, sem gravação. |
| AC-03 | Dado “ler 5 páginas” e o evento “tomar café da manhã”, quando aplica, então o campo da tentativa mostra uma frase contextual como “Depois de tomar café da manhã, vou ler 5 páginas.”, que pode ser editada antes de salvar. |
| AC-04 | Dado um menor começo sem evento, quando aplica, então a tentativa passa a descrever somente a ação pequena, sem lacuna ou texto artificial de contexto. Aplicar novamente não duplica texto. |
| AC-05 | Dados menor começo vazio, texto composto maior que 1000 caracteres ou campos auxiliares não aplicados, quando aplica/salva, então aparece erro acessível, o rascunho durável não muda e o usuário pode corrigir ou limpar a ajuda. |
| AC-06 | Dado um rascunho preparado, quando cancela, pressiona Escape ou recarrega antes de salvar, então a Capability durável permanece igual e o foco retorna à origem quando possível. |
| AC-07 | Dada uma tentativa preparada e salva com sucesso, quando recarrega, abre Hoje e inicia Session, então a mesma tentativa é exibida e seu snapshot segue a proveniência existente; o ID da tentativa editada permanece estável. |
| AC-08 | Dada falha de escrita, quando salva, então não há mensagem de sucesso, o diálogo e o rascunho permanecem para retry e o último estado durável fica intacto. |
| AC-09 | Dado o painel de Simulação deliberada, quando aplica as duas ajudas no mesmo rascunho, então o resultado visível não duplica sufixos nem perde silenciosamente a condição de simulação, e respeita 1000 caracteres. |
| AC-10 | Dados backup antigo ou novo, IndexedDB ou fallback localStorage, quando restaura/exporta e recarrega offline, então a tentativa usa o formato atual e o app continua coerente. |
| AC-11 | Dado mobile 360–390 px, zoom 200% e teclado, quando abre, edita, aplica, salva ou descarta a ajuda, então não há overflow global, foco oculto nem controle inacessível; Escape e retorno de foco seguem o diálogo existente. |
| AC-12 | Dada uma PWA instalada em geração anterior, quando recebe a versão da Delivery 1, então o manifesto de assets e o cache convergem para uma composição completa, inclusive na próxima abertura offline. |

## Restrições, dependências e riscos

O estado pertence a `learningOutcomes[].nextAttempt.text`, validado por `learning-outcome-model.js`. O diálogo e seu rollback pertencem a `learning-outcome-feature.js`. `app-manifest.js` é a fonte de geração/cache. A ajuda não deve introduzir um segundo texto canônico nem mudar a semântica da pergunta efêmera do ensaio. A implementação deve respeitar o painel de pressão já existente. Não há migração planejada; eventual rollback após exposição de uma PWA instalada precisa de geração de cache posterior, sem limpar dados locais.

O commit `e8c778d` entrou após o Discovery e altera apenas persistência do plano semanal, seu teste e geração de cache v88. O Design deve partir dessa geração. A sincronização opcional com Google Drive é preexistente e não faz parte do escopo.

## Clareza

| Dimensão | Nota | Evidência |
|---|---:|---|
| Problema | 3/3 | Roadmap e Discovery mostram ambiguidade da tentativa e diferença em relação ao ensaio. |
| Usuários | 3/3 | A pessoa que cria/edita uma Capability no fluxo atual está definida. |
| Objetivos | 3/3 | Ação pequena, contexto opcional, aplicação ao rascunho e persistência explícita. |
| Sucesso | 3/3 | Doze cenários cobrem sucesso, erro, compatibilidade, acessibilidade e PWA. |
| Escopo | 3/3 | Proprietário do dado, fronteiras, exclusões e ausência de schema estão explícitos. |

**15/15 — Ready for Design.** Brainstorm adicional não é necessário; o problema, a pessoa, a abordagem e os limites já foram especificados e verificados no Discovery.
