# Revisão semanal guiada por evidências

## Jornada unificada

A rota **Revisão** reúne quatro etapas retomáveis: **Observar**, **Decidir**, **Planejar** e **Histórico**. As superfícies existentes são incorporadas sem copiar registros: `weeklyReviews`, `weeklyPlans`, `bookSyntheses`, evidências e execuções mantêm seus IDs e continuam no backup e no Google Drive.

O cabeçalho indica a primeira etapa incompleta. Sem sessões ou evidências, as métricas exibem **Amostra insuficiente**, nunca um zero que pareça desempenho real. Resultados são deduplicados por identidade antes de aparecerem no resumo.

## Objetivo

Transformar sessões e evidências registradas durante a semana em interpretação, decisão e foco para a semana seguinte.

A revisão não depende apenas da percepção do usuário. Ela consolida automaticamente o que foi executado e produzido no período.

## Período

- A semana começa na segunda-feira e termina no domingo.
- A tela abre inicialmente na semana atual.
- É possível navegar para semanas anteriores e retornar à semana atual.
- Semanas futuras não podem ser abertas.

## Indicadores automáticos

| Indicador | Cálculo |
| --- | --- |
| Sessões concluídas | Sessões encerradas dentro da semana, separadas entre Deep Work e Normal |
| Tempo focado | Soma da duração efetiva, sem períodos pausados |
| Evidências | Evidências vinculadas às sessões da semana |
| Itens trabalhados | Leituras e estudos distintos com sessão concluída |

## Evidências da semana

A revisão apresenta uma linha do tempo com:

- tipo da evidência;
- síntese;
- detalhe opcional;
- data;
- livro ou estudo relacionado.

## Resumo por item

Cada leitura ou estudo trabalhado mostra:

- quantidade de sessões;
- tempo focado;
- avanço registrado em páginas, percentual ou horas;
- progresso atual do item.
- quantidade de sessões Deep Work e Normal.

## Fechamento reflexivo

A revisão permite registrar:

- principal avanço;
- aprendizado mais importante;
- bloqueios e dispersões;
- decisão para a próxima semana;
- avaliação da qualidade da semana, de 1 a 5;
- até três prioridades para a semana seguinte.

## Integração com Hoje

Ao salvar uma revisão, as prioridades selecionadas atualizam o bloco **Foco da semana** da central Hoje.

## Persistência

As revisões são salvas em `state.data.weeklyReviews` com a seguinte estrutura:

```javascript
{
  id,
  schemaVersion,
  weekStart,
  weekEnd,
  wins,
  lessons,
  blockers,
  decision,
  quality,
  priorities,
  reviewedAt
}
```

Elas são persistidas no IndexedDB, mantidas no fallback local e incluídas no backup JSON.

## Critérios de aceite

1. A área **Revisão semanal** aparece na navegação.
2. O cartão lateral existente abre a mesma área.
3. A semana atual é calculada de segunda a domingo.
4. Sessões e evidências corretas aparecem no período correspondente.
5. O tempo pausado não entra no total focado.
6. É possível navegar por semanas anteriores.
7. A revisão pode ser salva e atualizada.
8. As prioridades atualizam o foco de Hoje.
9. A revisão persiste após fechar e abrir o PWA.
10. O recurso funciona offline e entra no backup JSON.

## Validação manual

1. Abra a revisão da semana atual.
2. Confira sessões, tempo, evidências e itens trabalhados.
3. Preencha a reflexão e selecione prioridades.
4. Salve e confirme o status **Revisão concluída**.
5. Abra a visão geral e confira o novo foco.
6. Volte à revisão e atualize o conteúdo.
7. Navegue para a semana anterior.
8. Feche e abra o PWA.
9. Exporte e importe um backup.
10. Repita o acesso sem conexão.

## Fora do escopo desta versão

- gráficos históricos de consistência;
- comparação automática entre semanas;
- lembretes e notificações;
- criação automática de nota Markdown;
- revisão espaçada das evidências;
- sincronização entre dispositivos.
