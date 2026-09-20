# Hoje e próximas ações

## Uso pretendido da tentativa

Quando a tentativa atual de uma capacidade possui `futureUse`, Hoje mostra **Uso pretendido: {rótulo}** como contexto secundário. O valor é resolvido da capacidade atual e não é persistido no item do plano diário. Referências legadas, históricas, arquivadas ou indisponíveis não recebem classificação inferida.

A presença do contexto não altera a precedência: execução ativa/pausada, tentativa atual válida, outra ação incompleta e planejamento/fallback. O controle global **Executar** não escolhe Active Recall, Deep Work, recursos ou qualquer rota a partir de `futureUse`; ele conserva o comportamento e o foco determinísticos existentes.

## Recall contextual de evidências

Quando a ação principal é a tentativa atual de uma capacidade ativa, Hoje pode mostrar uma única **Uma evidência relacionada** abaixo das ações. A projeção usa somente o vínculo verificável `Evidence.sessionId → executionSessions.id → learningContext.outcomeId`; texto, recurso, domínio ou item parecido nunca criam associação.

São elegíveis apenas Evidence com síntese útil, data válida não futura e execução canônica concluída ou interrompida. Entre as elegíveis da mesma capacidade, vence `createdAt` mais recente; empates usam o menor `id`. `updatedAt` e `editedAt` não mudam o ranking. Sem Evidence elegível, o card é omitido por completo.

**Ver evidência** revalida o estado no clique e abre a Evidence exata no contexto da Capacidade, expandindo o resumo e movendo o foco para o registro. Se o registro deixou de ser elegível, Hoje permanece estável e informa a indisponibilidade. A projeção não cria estado de leitura, não grava analytics e não altera Capability, nextAttempt, Session, Evidence ou plano diário.

## Ensaio opcional da próxima tentativa

Quando a ação principal é a tentativa atual de uma capacidade, **Ensaiar tentativa** abre uma preparação breve antes da Session. Em um único diálogo, o usuário pode pensar no resultado desejado, na primeira ação concreta, na dificuldade provável e em como responderá a ela. Todas as perguntas são opcionais; **Pular ensaio e começar** e **Iniciar agora** mantêm o caminho imediato disponível.

As respostas existem somente nos campos do diálogo. Elas não entram em `state.data`, Session, Evidence, backup, Markdown, logs ou analytics. Cancelar, usar Escape, navegar, recarregar ou detectar que a tentativa mudou descarta o rascunho. Depois de uma persistência bem-sucedida, o diálogo também é limpo. Se a escrita falhar, o diálogo permanece aberto com as respostas locais para uma nova tentativa, enquanto o estado anterior é restaurado.

Antes de começar, Hoje revalida a `Capability`, o `attemptId` e a referência exata do plano. O início confirmado usa a Session rápida canônica e o mesmo `learningContext`; ele não altera a `nextAttempt` nem cria um modelo persistido de ensaio.

Sair de Hoje fecha o diálogo e limpa as respostas, inclusive pela navegação de histórico. Se o início já estiver aguardando gravação, a transação continua normalmente, mas o preflight abandonado não reaparece nem recebe foco/erro. Voltar a Hoje não recupera o rascunho e não libera um segundo início durante a gravação. Pular descarta o texto imediatamente, mesmo se a escrita seguinte falhar.

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

A tentativa principal oferece **Iniciar agora** com os padrões existentes, **Ensaiar tentativa** como preparação opcional, **Ajustar sessão** para revelar a configuração opcional e acesso à capacidade. Ela é projetada uma vez no bloco principal e omitida da lista inferior. Referências concluídas, históricas, arquivadas ou ausentes continuam legíveis, nunca se tornam executáveis e não provocam inferência ou recriação.

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
- O recall, quando existe, fica depois das ações principais, abre o registro exato e funciona offline.
- O ensaio é opcional, descartável, acessível por teclado e inicia a mesma Session rápida online ou offline.
