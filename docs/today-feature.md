# Hoje e próximas ações

## Objetivo

Transformar as prioridades semanais e frentes ativas em uma lista diária curta, executável e conectada ao ciclo de evidências do Compasso.

## Fluxo

1. A fila inteligente prioriza itens escolhidos na revisão semanal.
2. O usuário adiciona de uma a três ações ao dia.
3. A ação usa o campo **Próxima evidência** do item como descrição operacional.
4. Leituras e estudos podem iniciar uma sessão diretamente da visão **Hoje**.
5. Ao final, a sessão registra progresso e evidência; a ação diária pode ser marcada como concluída.

## Persistência

Os planos são salvos em `state.data.dailyPlans`:

```json
{
  "id": "day-2026-07-12",
  "date": "2026-07-12",
  "items": [
    {
      "domain": "study",
      "itemId": "example-study",
      "completedAt": null
    }
  ],
  "updatedAt": "2026-07-12T12:00:00.000Z"
}
```

## Critérios de aceite

- O plano do dia é preservado ao fechar e reabrir o PWA.
- Itens removidos do sistema não quebram a visão Hoje.
- A fila evita duplicar itens já planejados.
- Ações podem ser concluídas, reabertas e removidas.
- Leituras e estudos iniciam o fluxo de sessão existente.
- O contador da navegação mostra apenas ações pendentes.
