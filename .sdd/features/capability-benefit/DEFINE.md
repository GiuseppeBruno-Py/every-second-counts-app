# O que isso destrava? — Define

**Delivery:** 4
**Status:** Complete (Built)
**Data:** 2026-10-02
**Base:** origin/main@3b86fe5; branch codex/capability-benefit
**Origem:** roadmap do usuário, Gate 1 registrado na PR #92 e pedido subsequente “itere até a próxima PR”.

## Problema, pessoa e objetivos

A pessoa que planeja uma tentativa concreta pode não ter expresso o benefício pessoal ou profissional de conseguir realizar a capacidade. O roadmap pede uma frase opcional que conecte a capacidade a esse resultado. A hipótese de aumentar valor percebido permanece sem evidência de uso: esta entrega comprova o funcionamento da opção, não sua eficácia comportamental.

Gate 1 já foi registrado antes desta continuação. Ele recomenda examinar equivalentes. A inspeção encontrou `proofCriterion` (prova observável) e `nextAttempt.futureUse` (categoria de uso: lembrar, explicar, resolver etc.). Nenhum recebe a frase de benefício do exemplo do roadmap. Uma única abstração adicional é justificada por esse significado distinto.

## Requisitos priorizados e sucesso

- P1: permitir criar, editar e remover uma frase opcional de até 240 caracteres no editor de Capability.
- P1: mostrar o texto escrito pela pessoa como contexto secundário da capacidade e da tentativa principal atual em Hoje, sem novos botões nem mudança de ordem/prioridade.
- P1: preservar IDs, próxima tentativa, prova, categoria de uso, recursos, lifecycle, conteúdo histórico e dados de outros domínios.
- P1: carregar dados antigos, conservar o benefício em armazenamento, backup/restore e merge, com migração idempotente e versionamento explícito.
- P1: manter teclado, mobile, foco, offline e geração PWA futura.

Sucesso verificável: todos os cenários abaixo passam, sem ações adicionais em Hoje, sem preenchimento obrigatório e sem mudança nos registros de execução.

## Escopo e regras

Dentro: uma frase em Capability; edição no diálogo existente por divulgação progressiva; projeção somente na tentativa principal atual de Hoje; compatibilidade e documentação.

Fora: novas rotas, botões de Hoje, slogans gerados, finalidade/motivação/recompensa paralelas, score, analytics, recomendações, inferência de procrastinação, Delivery 5, AI, backend, nova entidade, mudanças no timer ou sessões.

1. Ausência, vazio e espaços significam benefício não definido; não gerar texto padrão.
2. A frase é conteúdo da pessoa, exibido como texto seguro. Não valida significado ou promete motivação.
3. Atualizações explícitas acima do limite falham antes de persistir e conservam o rascunho. Imports com texto maior preservam o conteúdo, sem corte silencioso; a próxima edição explícita do benefício precisa respeitar o limite.
4. Benefício pertence à capacidade, não à tentativa ou snapshot histórico. Não copiar para Today, Session, Evidence ou signals.
5. Dados antigos não recebem benefício inferido de prova, uso ou título. IDs e timestamps não mudam pela normalização.
6. Salvamento falho conserva estado anterior, modal e rascunho para retry. Cancel/Escape usa a confirmação e retorno de foco existentes.
7. Não alterar schema global v3, coleções, chaves, stores, política de merge ou tombstones.

## Aceitação

| ID | Dado / Quando / Então |
|---|---|
| AC-01 | Dada capacidade nova, quando salva sem abrir a opção, então cria a forma mínima sem benefício e o começo direto permanece disponível. |
| AC-02 | Dada capacidade, quando preenche, edita ou limpa a frase, então mostra somente o texto explícito, preservando identidade da capacidade/tentativa, prova, uso e recursos. |
| AC-03 | Dada tentativa principal atual, quando a capacidade tem benefício, então Hoje mostra “Isso ajuda a:” secundário, com a tentativa como título e os mesmos sete botões; sem benefício, omite o trecho. |
| AC-04 | Dado benefício salvo, quando inicia Session, arquiva/reativa, revisa tentativa ou desvincula recurso, então mantém benefício no proprietário Capability e não cria snapshot em execução. Referências ausentes/arquivadas/históricas e ações comuns não exibem benefício como contexto atual. |
| AC-05 | Dado texto vazio, inválido ou acima de 240 caracteres, quando normaliza/importa ou salva explicitamente, então trata ausência/malformação sem eliminar a capacidade e rejeita excesso no comando sem perda, truncamento ou gravação parcial. |
| AC-06 | Dado rascunho alterado, quando cancela/Escape ou falha o save, então respeita confirmação/foco existentes; falha mantém rascunho e estado anterior, permitindo retry sem duplicação. |
| AC-07 | Dados backups antigos e novos, quando restaura/exporta/restaura/recarrega, então migra o registro para versão explícita idempotentemente, preserva benefício quando existente e conserva outros domínios. |
| AC-08 | Dados dois registros em merge ou tombstone, quando concilia, então benefício segue a versão inteira vencedora, conflitos conservam ambos os textos e exclusão não ressuscita a capacidade. |
| AC-09 | Dados IndexedDB e fallback localStorage, quando salva e reabre offline após cache completo, então benefício continua editável e legível e o shell usa geração futura sem limpar dados. |
| AC-10 | Dados teclado, 360–390 px e zoom 200%, quando abre a opção, edita e navega por Hoje, então labels, foco visível, alvos e texto longo funcionam sem overflow global. |

## Contexto, hipóteses e riscos

Vanilla JS PWA local-first. Model normaliza learningOutcomes no bootstrap, restore e foundation. Editor persiste candidate state. Hoje deriva ação principal de referências. Backup genérico exporta state; merge é por registro/timestamp e tombstones.

Assumimos 240 caracteres como limite coerente com “frase curta”; não há observação que prove maior clareza ou frequência de uso. A opção começa recolhida em criação. Conteúdo antigo/importado acima do limite é preservado e continua legível. Instalação física PWA não será alegada como observação de Codex.

## Clareza

| Dimensão | Nota | Evidência |
|---|---:|---|
| Problema | 3 | Roadmap diferencia ação concreta de benefício abstrato. |
| Pessoa | 3 | Pessoa usando Capability e sua tentativa em Hoje. |
| Objetivos | 3 | Campo opcional, curto, editável e secundário explícitos. |
| Sucesso | 3 | Dez cenários mensuráveis, incluindo falha e compatibilidade. |
| Escopo | 3 | Delivery 4 isolada; Gate 1 e inspeção de equivalentes registrados. |

**15/15 — Ready for Design.**
