# Revisão semanal de fricção — Define

**Status:** Shipped
**Data:** 2026-10-03
**Delivery:** 6 do roadmap de redução de fricção
**Base:** origin/main@e842fe2; PR #94 mesclada com CI aprovado

## Problema, usuário e objetivo

O aprendiz já registra bloqueios e uma decisão semanal, mas não tem uma ajuda curta que conecte uma dificuldade de início declarada a um ajuste concreto. Tentativas sem execução podem nem aparecer nas decisões por capacidade. A entrega deve apoiar uma decisão opcional dentro da revisão atual, sem inferir motivos a partir de ausência de Session.

## Escopo e regras

P1: oferecer, recolhidas, as perguntas “Qual tarefa ou tentativa você mais evitou ou adiou esta semana?”, “O que tornou difícil começar?” e “Qual ajuste você quer testar?”. As duas últimas aparecem após uma resposta à primeira. As sete opções de dificuldade vêm do roadmap; selecionar uma é opcional. O texto é autorrelato, sem diagnóstico, score, sinal automático ou comprovação de uso.

Usar os campos atuais de bloqueios/decisão. O aprendiz pode preparar uma revisão da tentativa de uma capacidade ativa, inclusive sem execução semanal, e conferir o texto antes de salvar. Aplicar a ajuda altera só rascunhos; concluir a revisão é a confirmação durável existente. Nenhum novo campo, entidade, coleção ou schema. Não implementar templates de experimentos (Delivery 7), valores (8), detecção automática adicional ou outro formulário de revisão.

Texto existente deve ser preservado. Não truncar silenciosamente ao exceder limites. Sem resposta, a revisão funciona como antes. Rascunho respondido e ainda não aplicado deve poder ser descartado e não pode parecer salvo. Semana diferente/reload limpa o auxiliar transitório; os textos explicitamente salvos permanecem na revisão. Capacidade alterada, removida, arquivada ou ambígua deve ser revalidada antes de aplicar/salvar.

## Aceitação Given / When / Then

| AC | Cenário |
|---|---|
| 01 | Dada revisão vazia/legada, quando abrir, então ajuda recolhida, campos antigos intactos e nenhuma escrita; salvar sem usar ajuda continua válido. |
| 02 | Dado autorrelato preenchido, quando responder dificuldade/ajuste e aplicar, então preencher rascunhos existentes sem persistir, inferir keep/revise ou criar dados; sem resposta esconder próximos campos. |
| 03 | Dados textos antigos, quando aplicar, então acrescentar relato/ajuste sem apagar ou duplicar o mesmo trecho; excesso/ajuste vazio anuncia erro e mantém tudo. |
| 04 | Dada capacidade ativa sem atividade semanal, quando selecionar e preparar revisão, então decisão revise e nova tentativa recebem o ajuste nos controles atuais; só Concluir revisão altera capacidade e reflexão juntas. |
| 05 | Dadas outras decisões/rascunhos da semana, quando preparar uma tentativa, então preservá-los; alvo stale/arquivado/removido/ambíguo bloqueia alteração sem sobrescrever dados. |
| 06 | Dada resposta ainda não aplicada, quando salvar revisão, então pedir aplicar ou descartar com foco; descarte/semana diferente/reload não persistem o auxiliar. |
| 07 | Dado save falho, quando persistência rejeitar, então preservar estado durável e rascunhos, anunciar e permitir retry; sucesso sobrevive reload/backup/restore/IndexedDB/fallback/offline. |
| 08 | Dados desktop/mobile360px/zoom200%/reduced motion, quando usar teclado, então disclosure Enter/Space, labels, foco visível, alvos44px, contraste e textos legíveis sem overflow; capturas inspecionadas. |
| 09 | Dado app atualizado, quando cache instalar/atualizar e abrir offline, então novo módulo compõe pelo manifesto; geração futura e rollback preservam dados. |
| 10 | Dada entrega verificada, então registrar Gate 2 com evidência técnica e ausência/limites de evidência pessoal; parar antes de Delivery 7. |

## Restrições, premissas e clareza

Vanilla JS/CSS, local-first/offline, sem dependências novas. weeklyReviews v2, estado v3, identidade de nextAttempt e save existente preservados. Suposição reversível: saída preferencial será revisão de nextAttempt; experimento continua disponível no módulo proprietário, fora desta unidade. A autorização atual cobre esta entrega até nova PR; não inclui merge/deploy. Brainstorm dispensado: problema, público, abordagem restrita e critérios estão explícitos no roadmap e no código.

Clareza15/15: problema3 (fricção na revisão), usuários3 (aprendiz pessoal), objetivos3 (decisão concreta), sucesso3 (critérios mensuráveis), escopo3 (Delivery6 e Gate2). Nenhuma eficácia comportamental alegada. Templates citados nas skills não existem no host; usados contratos SDD e convenção do repositório.
