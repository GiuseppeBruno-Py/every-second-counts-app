# Preparação do ambiente — Define

**Delivery:** 3 — Ritual de preparação do ambiente
**Status:** Shipped
**Base:** `origin/main@58512ff`, branch `codex/environment-ritual`
**Origem:** roadmap do usuário; PR #91 mesclada e CI aprovado

## Problema, pessoa e resultado

A pessoa com uma tentativa concreta pode começar com distrações evitáveis ao alcance. Rituals já representam preparação de condições; Attempt Rehearsal ensaia como agir. O resultado desejado é uma preparação curta e dispensável no fluxo existente de início, com um template de ambiente disponível também para quem já tem dados salvos, sem criar outro ponto de decisão em Hoje.

## Objetivos e escopo

- Oferecer o template **Começar sem fuga** usando Rituals: celular fora do alcance, fechar abas sem uso, silenciar notificações, abrir o material necessário, preparar água/caderno/ferramenta e confirmar o primeiro movimento.
- Permitir marcar itens opcionalmente antes da Session normal e usar **Pular e começar**, sem exigir checklist ou declaração de prontidão.
- Manter início direto, Start Small, ensaio, rituais personalizados e Deep Work nos contratos atuais.
- Preservar coleções existentes, snapshots, backup/restore, offline e foco. Não salvar as marcações transitórias da preparação rápida.
- Após Delivery 3, produzir a análise Gate 1 das Deliveries 1–3 e parar antes da Delivery 4.

Dentro: template opcional, seleção no início já existente, checklist de preparação rápida, dispensa explícita, snapshot atual de Ritual, testes/documentação e Gate 1.

Fora: novo botão em Hoje, rota, modal, wizard, timer, motor de Ritual, perguntas do ensaio, permissões de dispositivo, bloqueio/monitoramento externo, telemetria, score, novas entidades ou migração de dados.

## Regras e restrições

1. O template não é aplicado automaticamente nem inserido/reinserido na coleção de templates do usuário. Coleção vazia, customização, arquivamento e exclusão continuam respeitados.
2. Escolher o template e iniciar reutiliza o snapshot existente. Nenhuma marcação é obrigatória; iniciar com zero, parte ou todos os itens marcados tem a mesma validade.
3. Pular descarta a preparação e dispensa o Ritual nesta execução; não altera vínculo persistido. Se o modo for Deep Work, a dispensa deve atravessar a transferência de modo.
4. Marcações rápidas ficam somente na interface da abertura atual. Cancelar, Escape, reabrir, trocar Ritual ou refresh não recupera esse rascunho. Falha de criação conserva a abertura e permite retry, sem criar Session duplicada.
5. A seleção explícita de um Ritual personalizado com E1 mantém o contrato anterior. O template de ambiente não habilita E1.
6. O checklist existente de Deep Work pode usar o mesmo template; não recebe outra preparação concorrente. Seu registro histórico existente permanece compatível.
7. Nenhum novo campo persistido, versão de schema global, chave ou coleção. Alteração no shell exige geração de cache posterior a v90.

## Aceitação

| ID | Dado / Quando / Então |
|---|---|
| AC-01 | Dada a tentativa principal em Hoje, quando abre Ajustar sessão e escolhe Começar sem fuga, então encontra os seis itens de ambiente em preparação recolhida, usando o seletor existente e sem nova ação em Hoje. |
| AC-02 | Dada preparação aberta, quando marca zero, parte ou todos os itens e inicia, então cria uma única Session normal com snapshot do Ritual e o mesmo contexto da tentativa; marcações rápidas não são persistidas. |
| AC-03 | Dada preparação aberta com itens marcados, quando usa Pular e começar, então inicia pelo fluxo atual sem Ritual/checklist, preservando vínculo persistido e sem validação de prontidão. |
| AC-04 | Dada preparação transitória, quando cancela, usa Escape, troca Ritual, reabre ou recarrega, então as marcações são descartadas e cancelar/Escape retornam foco ao acionador. |
| AC-05 | Dada falha de gravação ao iniciar, quando falha, então mantém a preparação utilizável, mostra erro/foco, não anuncia sucesso e permite retry sem duplicação. |
| AC-06 | Dados rituais existentes, E1, início direto, ensaio e Start Small, quando usa seus fluxos, então os contratos anteriores permanecem; a preparação de ambiente não duplica perguntas do ensaio. |
| AC-07 | Dada escolha do template ou dispensa no início rápido, quando transfere para Deep Work, então o mesmo Ritual ou a dispensa é respeitado no checklist já existente. |
| AC-08 | Dados coleção vazia/customizada e backup antigo/novo, quando abre, exporta/restaura ou recarrega, então nenhum template do usuário é sobrescrito/recriado e snapshots existentes continuam válidos. |
| AC-09 | Dados IndexedDB, fallback localStorage e modo offline, quando inicia e recarrega, então recupera a Session e o snapshot corretos sem persistir rascunho de preparação. |
| AC-10 | Dados desktop, mobile 360–390 px, zoom 200% e teclado, quando seleciona, marca, pula ou cancela, então labels, foco, controles e alvos de toque são utilizáveis sem overflow global. |
| AC-11 | Dada geração PWA anterior, quando atualiza/reabre offline, então o shell completo usa a geração atual sem limpar dados locais. |
| AC-12 | Dadas as Deliveries 1–3 concluídas, quando fecha a entrega, então Gate 1 registra ações em Hoje, duplicações, duração, clareza, schema e simplificações; Delivery 4 não é implementada. |

## Contexto e riscos

Rituals já possuem `preparation`, `resources`, `cues`, `distractions`, snapshot por Session e checklist em Deep Work. Session rápida tem seletor opcional e criação transacional. A preparação será uma orientação local; marcar itens não prova redução de distração ou uso real. A automação pode verificar a PWA offline e o ciclo de Service Worker, mas não uma instalação física do usuário. O Gate 1 deve distinguir evidência de implementação de evidência de uso.

## Clareza

| Dimensão | Nota | Evidência |
|---|---:|---|
| Problema | 3/3 | Roadmap descreve distrações de baixo esforço e condições antes de iniciar. |
| Pessoa | 3/3 | Pessoa iniciando tentativa/Session no fluxo atual. |
| Objetivos | 3/3 | Template de seis itens, opcional, reutilização e dispensa explícita. |
| Sucesso | 3/3 | Doze cenários verificáveis cobrem fluxo, falha, compatibilidade, PWA e Gate 1. |
| Escopo | 3/3 | Fronteiras explícitas com ensaio, timer, dispositivo e Delivery 4. |

**15/15 — Ready for Design.**
