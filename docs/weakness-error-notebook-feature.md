# Assuntos fracos e caderno de erros

## Objetivo

Transformar o histórico da revisão espaçada em diagnóstico acionável: identificar onde a recuperação falha, registrar a correção e definir uma próxima ação.

## Índice de dificuldade

O painel agrupa cards pela leitura, estudo, meta ou fonte de origem. Cada avaliação recebe um peso:

- Errei: 1,00;
- Difícil: 0,65;
- Bom: 0,15;
- Fácil: 0,00.

O índice é a média ponderada das tentativas. Grupos com índice a partir de 25% aparecem como pontos fracos. Quando a última tentativa é Bom ou Fácil após uma falha anterior, o painel sinaliza recuperação recente.

## Caderno de erros

Cada registro contém:

- erro ou dificuldade;
- diagnóstico do que aconteceu;
- correção de referência;
- próxima ação concreta;
- vínculo opcional com leitura, estudo ou meta;
- estado aberto ou resolvido;
- card de origem, quando criado por captura rápida.

## Critérios de aceite

- O diagnóstico usa somente avaliações realmente registradas.
- Cards sem prática não são classificados como fracos.
- Um ponto fraco pode originar um registro preenchido automaticamente.
- Registros podem ser criados, editados, resolvidos, reabertos e excluídos.
- Backups antigos sem `errorNotebook` continuam funcionando.
- Todos os dados permanecem locais e fazem parte do backup JSON.
