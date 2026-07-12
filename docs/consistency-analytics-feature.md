# Métricas de consistência e histórico global de sessões

## Objetivo

Transformar o histórico de sessões do Compasso em uma visão operacional do ritmo de leitura e estudo. A funcionalidade diferencia volume acumulado de consistência real e permite investigar onde o tempo foi investido.

## Área Consistência

A nova área é adicionada à navegação principal e apresenta:

- filtros de 7, 30 e 90 dias ou todo o histórico;
- filtro por leituras, estudos ou todos os domínios;
- KPIs do período;
- tendência das últimas oito semanas;
- ranking dos itens com maior investimento;
- distribuição por domínio;
- interpretação automática do ritmo;
- histórico global pesquisável;
- exportação CSV do histórico filtrado.

## Métricas

### Sessões

Quantidade de sessões concluídas no período selecionado.

### Tempo focado

Soma de `durationMs` das sessões concluídas. O tempo pausado já foi retirado no encerramento da sessão.

### Dias ativos

Quantidade de datas diferentes que possuem pelo menos uma sessão concluída.

### Consistência

```text
Dias ativos ÷ dias do período × 100
```

Para o filtro **Tudo**, o período começa na data da primeira sessão concluída e termina no dia atual.

### Sequência atual

Quantidade de dias consecutivos com sessão concluída, terminando hoje ou ontem. O uso de ontem evita zerar a sequência enquanto o dia atual ainda está em andamento.

### Melhor sequência

Maior quantidade histórica de dias consecutivos com pelo menos uma sessão concluída.

### Duração média

```text
Tempo focado ÷ número de sessões concluídas
```

## Tendência semanal

O gráfico considera as últimas oito semanas, de segunda-feira a domingo, e exibe:

- tempo focado por semana;
- quantidade de sessões;
- quantidade de dias ativos.

Semanas sem atividade permanecem com preenchimento zero.

## Ranking por item

Sessões são agrupadas por `domain:itemId`. O ranking considera:

1. maior tempo focado;
2. maior quantidade de sessões em caso de empate.

Cada item também mostra a quantidade de evidências produzidas.

## Histórico global

O histórico reúne sessões de todos os livros e estudos e exibe:

- data e horário;
- item e domínio;
- duração efetiva;
- avanço registrado;
- objetivo da sessão;
- observação final;
- evidências vinculadas.

A busca consulta título, contexto do item, objetivo, observação e conteúdo das evidências. Ela filtra somente o histórico, sem alterar os KPIs.

## Exportação CSV

A exportação respeita período, domínio e busca atuais. O arquivo contém:

- data;
- domínio;
- item;
- duração em minutos;
- valor inicial e final;
- objetivo;
- observação;
- evidências.

## Regras

- somente sessões com `status: completed` entram nas métricas;
- sessões ativas ou pausadas não entram até serem concluídas;
- itens removidos continuam aparecendo como `Item removido`;
- evidências são recuperadas pelo `sessionId`;
- os dados são derivados localmente e não exigem nova persistência;
- a funcionalidade permanece disponível offline.

## Critérios de aceite

1. A área Consistência aparece na navegação.
2. Os filtros de período e domínio atualizam KPIs e painéis.
3. A sequência atual considera hoje ou ontem como ponto final.
4. Semanas sem sessões não exibem atividade falsa.
5. A busca filtra o histórico sem mudar os KPIs.
6. Evidências aparecem na sessão correspondente.
7. O botão Mostrar mais pagina o histórico em blocos de 40.
8. O CSV respeita os filtros ativos.
9. A área funciona após fechar e abrir o PWA.
10. A área funciona sem conexão após atualização do cache.

## Fora do escopo

- metas de frequência configuráveis;
- notificações de quebra de sequência;
- comparações mensais avançadas;
- gráficos interativos com zoom;
- sincronização entre dispositivos;
- edição de sessões pelo histórico global.
