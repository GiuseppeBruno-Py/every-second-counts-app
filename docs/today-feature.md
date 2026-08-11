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

## Continuidade e ação principal

Hoje deriva uma única ação principal, sem persistir ranking ou estado de jornada. A precedência é:

1. execução normal ou Deep Work ativa/pausada, com **Retomar sessão**;
2. primeira referência incompleta para uma tentativa atual de capacidade ativa, na ordem armazenada do plano;
3. primeira outra ação incompleta, também na ordem armazenada;
4. **Nova ação**, quando não existe ação executável.

A tentativa principal oferece **Iniciar agora** com os padrões existentes, **Ajustar sessão** para revelar a configuração opcional e acesso à capacidade. Ela é projetada uma vez no bloco principal e omitida da lista inferior. Referências concluídas, históricas, arquivadas ou ausentes continuam legíveis, nunca se tornam executáveis e não provocam inferência ou recriação.

O comando `today.executePrimary` aplica a mesma precedência ao controle global **Executar**. Em ações comuns e no plano vazio, ele abre ou mantém Hoje e move o foco para a ação/planejamento sem iniciar nada. `today.openPrimary` faz a continuação segura de volta para Hoje. A pendência semanal usa `weekly.openDecision`, que abre a revisão diretamente no primeiro contexto de decisão disponível.

Concluir, reabrir ou remover uma referência de capacidade altera somente `dailyPlans`; não altera a capacidade, sua tentativa atual ou seu ciclo de vida.

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
