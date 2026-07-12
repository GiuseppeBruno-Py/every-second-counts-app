# Active Recall a partir de evidências e notas

## Objetivo

Transformar registros passivos do Compasso em perguntas que exigem recuperação ativa. A funcionalidade evita tratar releitura como evidência de aprendizagem.

## Fontes

- Evidências produzidas ao concluir sessões.
- Notas Markdown do Atlas.
- Perguntas manuais.

O Compasso cria um rascunho. A pergunta e a resposta precisam ser revisadas pelo usuário antes de serem salvas.

## Fluxo

1. Escolher uma evidência ou nota recente.
2. Revisar a pergunta e a resposta de referência sugeridas.
3. Salvar no banco de perguntas.
4. Tentar responder sem consultar.
5. Revelar a resposta somente depois da tentativa.
6. Registrar a prática ou avançar para outra pergunta.

## Modelo de dados

Os cards ficam em `state.data.reviewItems`:

```json
{
  "id": "r123",
  "sourceType": "evidence",
  "sourceId": "e123",
  "domain": "study",
  "itemId": "s123",
  "prompt": "Explique o conceito sem consultar.",
  "answer": "Resposta de referência.",
  "reviewCount": 0,
  "lastReviewedAt": null,
  "createdAt": "2026-07-12T12:00:00.000Z"
}
```

## Evolução da fase 2.2

Cada prática agora exige uma autoavaliação: **Errei**, **Difícil**, **Bom** ou **Fácil**. A resposta atualiza o intervalo, a próxima data e o histórico do card. Somente perguntas devidas entram na fila principal.

## Critérios de aceite

- Evidências e notas podem originar perguntas.
- O rascunho pode ser corrigido antes de salvar.
- Perguntas manuais também são aceitas.
- A resposta permanece oculta até a tentativa.
- A prática atualiza `reviewCount` e `lastReviewedAt`.
- A autoavaliação calcula `intervalDays` e `dueAt`.
- O histórico preserva as últimas 100 avaliações por card.
- Cards podem ser editados e excluídos.
- Backups antigos sem `reviewItems` continuam funcionando.
