# Revisão mínima de importância — Define

**Status:** Complete (Built)
**Data:** 2026-10-04
**Base:** origin/main@386072d40970980c7d85f259cf8be4734d64a03e, PR96 mesclada
**Entrega:**8, última do roadmap original. Usuário autorizou iterar até próxima PR após apresentação concreta da entrega8. Gate2 preservado; sem nova evidência pessoal de uso/eficácia.

## Problema, usuário e escopo

Aprendiz precisa reconsiderar se uma capacidade continua importante e escolher continuar, ajustar ou arquivar usando os fluxos existentes. Pergunta opcional na revisão da capacidade, respostas Sim/Parcialmente/Não. Ajuda recolhida apenas ao editar capacidade ativa. Resposta transitória, sem schema/campo persistido, ranking/score, módulo de valores, revisão paralela ou automação. Brainstorm dispensado: demanda, usuário e abordagem claros. Não alterar semanal, Session/Evidence/benefit nem inferir importância a partir de uso.

## Aceite Given/When/Then

| AC | Cenário |
| --- | --- |
|01|Dada edição de capacidade ativa, pergunta opcional recolhida; criação/arquivada ocultam ajuda; edição convencional intacta.|
|02|Dada resposta Sim/Parcialmente/Não, apresentar orientação e ação explícita continuar/ajustar/arquivar; responder/abrir não muda dados/textos/decisões. Vazio sem ação e valor inválido não causa mutação.|
|03|Dado continuar, fechar pelo cancelamento existente; preservar registro/timestamps. Rascunho alterado exige confirmação de descarte existente e pode ser mantido.|
|04|Dado ajustar, focalizar próxima tentativa, sem escrever/salvar; só Save atual aplica alteração e conserva snapshot histórico.|
|05|Dado arquivar, exigir confirmação explícita; informar descarte de alterações pendentes. Cancelar confirma nada; sucesso usa arquivamento atual, preserva tentativa/histórico e permite reativar.|
|06|Dada falha durável de save/arquivar, preservar estado/draft/resposta para retry; em voo bloquear reentrada/cancelar/ações; alvo removido/arquivado não reativa nem cria.|
|07|Dado Escape/reopen/reload, limpar resposta sem nova persistência; alteração legítima sobreviver reload/backup/restore/offline IDB e fallback; registros antigos mantêm significado.|
|08|Dado teclado/360px/200%/reduced motion, Enter/Space nativos, labels/status/foco/retorno/contraste/alvos44 e palavras/geometria legíveis; capturas inspecionadas.|
|09|Dado manifesto, avançar geração96 sem novos módulos/assets/coleções; manter roadmap limitado à entrega8 e documentar limites de evidência.|

## Clareza e autorização

15/15: problema3 (reconsiderar prioridade), usuários3 (aprendiz), metas3 (decisões existentes), sucesso3 (AC observáveis), escopo3 (ajuda opcional transitória). Sem migração/dependências. Defaults reversíveis: editor atual, três respostas sem histórico persistido, confirmação de arquivamento, sem ajuste automático. Templates das skills ausentes no host; convenção existente mantida. Pedido autoriza Define→Design→Build→Ship→commit/push/PR/CI; não merge/deploy. Uso pessoal e instalação física PWA não comprovados.
