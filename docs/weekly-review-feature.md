# Revisão semanal guiada por evidências

## Uso histórico e decisão atual

Quando existe contexto de uso futuro, a revisão separa **Uso nas execuções**, derivado dos snapshots canônicos históricos da semana, de **Uso da tentativa atual**, derivado da capacidade atual antes da decisão. Evidence expandida também mostra o valor histórico por `sessionId`. Assim, uma execução antiga nunca é rotulada com uma escolha atual diferente.

**Manter tentativa atual** preserva texto, `futureUse`, identidade e timestamps. **Revisar tentativa** permite editar o texto e escolher ou limpar o uso futuro no mesmo save atômico. `capabilityReflections` continua sem proprietário de `futureUse`, e falha de validação/persistência mantém o estado anterior e o rascunho disponível para nova tentativa.

## Funcionou → KEEP

O fechamento também oferece duas perguntas opcionais:

- **O que funcionou esta semana e merece ser repetido?**
- **Alguma evidência mudou sua percepção sobre o que você consegue fazer?**

As respostas são texto do aprendiz. Elas não selecionam `keep` ou `revise`, não alteram uma capacidade, não criam `learningSignals` e não produzem score, traço de identidade ou mensagem motivacional. As decisões por capacidade continuam exclusivamente nos controles explícitos acima do fechamento.

Revisões anteriores continuam com `wins` e `lessons` em seus significados originais. A aplicação não os reutiliza nem os apresenta como resposta às novas perguntas. Uma revisão v1 abre os dois campos novos vazios e só passa a registrar `repeatablePractice` ou `evidenceReflection` quando o aprendiz salva explicitamente.

## Objetivo

Transformar sessões e evidências registradas durante a semana em interpretação, decisão e foco para a semana seguinte.

A revisão não depende apenas da percepção do usuário. Ela consolida automaticamente o que foi executado e produzido no período.

## Composição orientada à decisão

A ordem da tela é fixa: contexto compacto da semana, reflexão por capacidade com decisão explícita, fechamento geral e detalhes de apoio. Para cada capacidade ativa cuja tentativa ainda é atual, o usuário escolhe **Manter tentativa atual** ou **Revisar tentativa** antes de salvar. Manter preserva a tentativa; revisar revela e exige uma nova tentativa. Somente um save bem-sucedido atualiza a capacidade e `capabilityReflections` no mesmo candidato.

Ausência de escolha ou nova tentativa vazia bloqueia o save, anuncia o problema e focaliza o primeiro campo inválido. Falha de persistência restaura o último estado válido, repõe o rascunho e focaliza a mensagem de nova tentativa. Contextos históricos, arquivados ou ausentes permanecem somente leitura e não bloqueiam a revisão.

Resumo de atividade, Evidence, itens/atividade sem capacidade e Journal/atenção usam `<details>` nativos, fechados por padrão e com rótulo mais contagem/estado. Todo conteúdo e todas as ações existentes continuam alcançáveis. O estado aberto é efêmero e volta a fechado quando a semana muda.

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

- uma prática ou resposta que funcionou e merece repetição, opcional;
- uma reflexão baseada em Evidence sobre o que já consegue fazer, opcional;
- principal avanço;
- aprendizado mais importante;
- bloqueios e dispersões;
- decisão para a próxima semana;
- avaliação da qualidade da semana, de 1 a 5;
- até três prioridades para a semana seguinte.

## Integração com Hoje

Ao salvar uma revisão, as prioridades selecionadas atualizam o bloco **Foco da semana** da central Hoje.

Uma pendência de revisão em Hoje chama `weekly.openDecision`: abre a semana atual e focaliza a primeira decisão de capacidade ainda não resolvida; se não existir, focaliza o primeiro campo do fechamento geral e, por último, o título da revisão. Nenhuma rota ou posição de foco é persistida.

## Persistência

As revisões são salvas em `state.data.weeklyReviews` com a seguinte estrutura:

```javascript
{
  id,
  schemaVersion: 2,
  weekStart,
  weekEnd,
  repeatablePractice,
  evidenceReflection,
  wins,
  lessons,
  blockers,
  decision,
  quality,
  priorities,
  reviewedAt
}
```

`repeatablePractice` e `evidenceReflection` são strings opcionais. Valores ausentes ou malformados degradam para campos vazios apenas na apresentação; não existe migração ou escrita durante renderização. Um save v2 grava strings explícitas, inclusive vazias.

As revisões são persistidas no IndexedDB, mantidas no fallback local e incluídas no backup JSON. A falha de gravação restaura o último estado durável e recompõe o rascunho completo, incluindo as duas novas respostas. Backups v1 continuam válidos, e backups v2 preservam os campos no round-trip.

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
3. Registre opcionalmente o que funcionou e uma reflexão baseada em Evidence.
4. Confirme que nenhum texto selecionou `keep` ou `revise`; faça a decisão explicitamente quando houver capacidade elegível.
5. Preencha as demais reflexões e selecione prioridades.
6. Salve e confirme o status **Revisão concluída**.
7. Abra a visão geral e confira o novo foco.
8. Volte à revisão e atualize o conteúdo.
9. Abra uma revisão v1 e confirme os novos campos vazios sem perder o conteúdo antigo.
10. Feche e abra o PWA, exporte/restaure o backup e repita o acesso sem conexão.

## Fora do escopo desta versão

- gráficos históricos de consistência;
- comparação automática entre semanas;
- lembretes e notificações;
- criação automática de nota Markdown;
- revisão espaçada das evidências;
- sincronização entre dispositivos.
