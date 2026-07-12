# Revisão espaçada e autoavaliação

## Objetivo

Reapresentar perguntas quando a recuperação precisa ser reforçada, evitando revisar todos os cards todos os dias.

## Autoavaliação

| Resposta | Próximo intervalo |
| --- | --- |
| Errei | 10 minutos |
| Difícil | 1 dia na primeira vez; depois intervalo atual × 1,2 |
| Bom | 1 dia na primeira vez; depois intervalo atual × 2,5 |
| Fácil | 4 dias na primeira vez; depois intervalo atual × 3,5 |

Os valores são arredondados para dias inteiros. O algoritmo é deliberadamente simples, explicável e substituível no futuro.

## Dados adicionados ao card

- `dueAt`: próxima data de revisão.
- `intervalDays`: intervalo calculado.
- `lastRating`: última autoavaliação.
- `reviewHistory`: até 100 avaliações com data, nota e intervalo.

## Migração

Cards da versão anterior recebem intervalo zero e ficam disponíveis para revisão. Nenhum card ou histórico existente é removido.

## Critérios de aceite

- Apenas cards devidos aparecem na fila.
- A resposta permanece oculta antes da tentativa.
- As quatro avaliações atualizam a próxima revisão.
- Cards futuros continuam visíveis no banco com a próxima data.
- Backups preservam agendamento e histórico.
