# Dicionário visual de relações

## Objetivo

Transformar o Atlas e os itens de progresso em uma visão editorial única, organizada como um dicionário. Em vez de um grafo com nós difíceis de ler, cada leitura, estudo, meta e nota aparece como uma entrada composta por:

- termo;
- definição;
- contexto;
- estado atual;
- relações explícitas;
- navegação para a origem.

A estrutura visual segue o padrão de um dicionário editorial: título forte, introdução curta, seções temáticas, termos à esquerda e definições à direita.

## Seções

A área **Dicionário** possui quatro seções:

1. Leituras;
2. Estudos;
3. Metas;
4. Notas.

As entradas são ordenadas alfabeticamente dentro de cada seção.

## Como as definições são formadas

### Leituras, estudos e metas

- **Termo:** título do item.
- **Definição:** contexto ou fonte registrada no item.
- **Informação complementar:** próxima evidência.
- **Detalhe:** páginas, percentual, horas ou dias.
- **Estado:** planejado, em andamento, pausado ou concluído.

### Notas

- **Termo:** título da nota.
- **Definição:** primeiro trecho útil do conteúdo convertido para texto simples.
- **Informação complementar:** tags.
- **Detalhe:** caminho da pasta no Atlas.
- **Estado:** data da última atualização.

## Relações derivadas

### Nota vinculada a um item

Quando uma nota possui `linkedItemId`, o sistema cria duas referências:

- na nota: **Vinculada a**;
- no item: **Nota vinculada**.

### Wikilinks

Links no formato `[[Nome da nota]]` geram relações bidirecionais:

- na nota de origem: **Conecta a**;
- na entrada de destino: **Citada por**.

O destino é resolvido nesta ordem:

1. nota com o mesmo título;
2. leitura, estudo ou meta com o mesmo título.

A comparação ignora diferenças de maiúsculas, minúsculas e acentos.

## Interação

- Clicar no nome de uma nota abre o editor da nota.
- Clicar no nome de uma leitura, estudo ou meta abre o item correspondente.
- Clicar em uma relação limpa filtros temporariamente, localiza a entrada relacionada e destaca o destino.
- O índice superior permite navegar diretamente para uma seção.

## Filtros

- Tudo;
- Leituras;
- Estudos;
- Metas;
- Notas;
- Só conectados.

A busca considera:

- título;
- contexto;
- próxima evidência;
- conteúdo da nota;
- tags;
- nomes das entradas relacionadas.

## Indicadores

O cabeçalho mostra:

- total de entradas;
- total de relações explícitas;
- quantidade de entradas isoladas.

O menu lateral mostra o total de relações.

## Privacidade e persistência

A funcionalidade não cria um banco novo e não envia dados externamente. As relações são calculadas localmente a partir dos dados já armazenados:

- itens de leitura, estudo e meta;
- notas;
- `linkedItemId`;
- `[[wikilinks]]`.

Como não há dados derivados persistidos, o backup existente continua suficiente.

## Funcionamento offline

O arquivo `dictionary-relations-feature.js` faz parte do app shell. A versão de cache foi atualizada para `compasso-pages-v9`.

## Critérios de aceite

1. A área Dicionário aparece na navegação.
2. As quatro seções exibem suas entradas em ordem alfabética.
3. Itens mostram contexto, progresso, evidência e estado.
4. Notas mostram trecho, tags, pasta e data.
5. Notas vinculadas geram relações bidirecionais.
6. Wikilinks geram conexões e backlinks.
7. Busca e filtros funcionam sem alterar os dados.
8. Clicar no termo abre a origem correta.
9. Clicar em uma relação localiza e destaca o destino.
10. A área continua disponível offline.

## Validação manual recomendada

1. Criar duas notas com títulos diferentes.
2. Adicionar `[[Título da outra nota]]` no conteúdo de uma delas.
3. Abrir o Dicionário e conferir **Conecta a** e **Citada por**.
4. Abrir uma nota vinculada a uma leitura e conferir a relação nos dois lados.
5. Clicar nos nomes das entradas e validar a origem.
6. Usar busca e todos os filtros.
7. Clicar em uma relação enquanto há filtro ativo.
8. Fechar, reabrir e testar sem conexão.

## Fora do escopo

- criação manual de relações independentes de wikilinks;
- edição de relações diretamente no Dicionário;
- layout de grafo com física e posicionamento livre;
- relações semânticas inferidas por IA;
- sincronização das relações entre dispositivos.
