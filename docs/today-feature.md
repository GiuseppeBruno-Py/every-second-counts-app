# Hoje e próximas ações

## Objetivo

Unificar direção e execução em uma única central diária, conectada ao Journal, ao foco semanal, às sessões e às frentes do Compasso.

## Fluxo

1. A fila inteligente prioriza itens escolhidos na revisão semanal.
2. O usuário adiciona de uma a três ações ao dia.
3. O botão **Nova ação** aceita texto livre e vínculo opcional com uma frente existente.
4. Sugestões usam o campo **Próxima evidência** do item como descrição operacional.
5. Ações vinculadas a leituras e estudos podem iniciar uma sessão diretamente da visão **Hoje**.
6. Ao final, a sessão registra progresso e evidência; qualquer ação pode ser marcada como concluída.
7. Uma sessão ativa, normal ou Deep Work, aparece no topo e pode ser retomada sem procurar sua frente.
8. Intenção do Journal, até três focos semanais e pendências que exigem decisão ficam visíveis sem duplicar tarefas.
9. O progresso das frentes permanece recolhido por padrão.

Rotas antigas para `overview` são redirecionadas para `today`. A Visão geral legada não aparece como destino concorrente na navegação.

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
- Ações manuais podem ser independentes ou vinculadas a uma frente.
- Ações podem ser concluídas, reabertas e removidas.
- Leituras e estudos iniciam o fluxo de sessão existente.
- O contador da navegação mostra apenas ações pendentes.
- A rota inicial e a rota legada de Visão geral abrem Hoje.
- Estados sem plano, com sessão ativa e com dia encerrado permanecem utilizáveis.
- A central funciona em 360 px sem overflow horizontal.
