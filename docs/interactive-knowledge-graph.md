# Grafo interativo de conhecimento

## Objetivo

Transformar as relações já existentes no Compasso em uma visualização espacial e navegável. O grafo permite perceber rapidamente quais notas, leituras, estudos e metas estão conectados, quais itens funcionam como centros do sistema e quais permanecem isolados.

## Modos de visualização

A área **Relações** oferece dois modos:

- **Grafo:** visualização principal, interativa e force-directed;
- **Dicionário:** leitura editorial das mesmas entradas e relações.

Os dois modos usam o mesmo modelo de dados. Nenhuma conexão é duplicada ou persistida separadamente.

## Nós

| Tipo | Cor | Origem |
| --- | --- | --- |
| Leitura | Laranja | `state.data.reading` |
| Estudo | Violeta | `state.data.study` |
| Meta | Verde | `state.data.goal` |
| Nota | Azul | `state.data.notes` |

O tamanho do nó cresce de acordo com a quantidade de conexões visíveis, dentro de limites para manter legibilidade.

## Arestas

As arestas são derivadas de:

1. notas vinculadas a leituras, estudos ou metas por `linkedItemId`;
2. links `[[wikilinks]]` resolvidos pelo título da nota ou item.

As relações são bidirecionais no modelo de visualização:

- `Vinculada a` / `Nota vinculada`;
- `Conecta a` / `Citada por`.

## Interações

### Navegação

- arrastar o fundo move o plano;
- roda do mouse altera o zoom;
- gesto de pinça altera o zoom no celular;
- botão de enquadramento centraliza todos os nós;
- rotação do dispositivo recalcula o enquadramento.

### Nós

- arrastar um nó muda temporariamente sua posição;
- clicar seleciona o nó;
- a seleção destaca vizinhos e arestas diretas;
- nós não relacionados ficam visualmente reduzidos;
- duplo clique abre a origem;
- teclado `Enter` ou `Espaço` seleciona o nó focado;
- o painel lateral oferece o botão **Abrir origem**.

### Busca

A busca considera:

- título;
- contexto;
- conteúdo da nota;
- tags;
- nomes de relações.

Os resultados aparecem em uma lista e os nós correspondentes recebem destaque. Pressionar `Enter` centraliza o primeiro resultado.

### Filtros

- tudo;
- leituras;
- estudos;
- metas;
- notas;
- somente itens conectados.

Quando um filtro muda, o grafo é recalculado e enquadrado novamente.

## Layout force-directed

O motor é implementado sem bibliotecas externas. A cada iteração são aplicadas:

- repulsão entre nós;
- prevenção de sobreposição;
- atração por arestas;
- atração suave por domínio;
- amortecimento de velocidade;
- força de recentralização.

A simulação reduz gradualmente sua energia e para automaticamente. Ao arrastar um nó ou mudar filtros, ela é reaquecida.

## Persistência

O grafo não cria uma segunda fonte de dados. As posições existem apenas durante a sessão da interface e são preservadas enquanto o aplicativo permanece aberto. Relações continuam derivadas das notas e itens do Compasso.

## Offline

Os arquivos abaixo fazem parte do app shell:

- `dictionary-relations-feature.js`;
- `knowledge-graph-feature.js`;
- `knowledge-graph-lifecycle.js`.

O cache foi atualizado para `compasso-pages-v11`.

## Acessibilidade e mobile

- nós SVG têm `role="button"`, foco por teclado e rótulo acessível;
- controles possuem rótulos explícitos;
- o painel contextual passa para baixo do grafo em telas menores;
- filtros ganham rolagem horizontal no celular;
- o grafo usa Pointer Events para mouse, caneta e toque;
- o modo Dicionário permanece disponível como alternativa linear.

## Critérios de aceite

1. A área abre em modo Grafo por padrão.
2. O usuário consegue alternar entre Grafo e Dicionário.
3. Nós e arestas correspondem às relações do modelo editorial.
4. Selecionar um nó destaca apenas sua vizinhança direta.
5. Busca e filtros funcionam sem alterar os dados.
6. Duplo clique e painel abrem a origem correta.
7. Pan, zoom, arraste e enquadramento funcionam no desktop.
8. Pan, pinça e seleção funcionam em dispositivos touch.
9. O grafo se reenquadra ao abrir a área e ao girar o dispositivo.
10. A funcionalidade permanece disponível offline.

## Validação manual recomendada

1. criar duas notas conectadas por `[[wikilink]]`;
2. vincular uma nota a uma leitura ou estudo;
3. abrir **Relações** e confirmar os nós e as arestas;
4. selecionar cada tipo de nó;
5. testar busca e todos os filtros;
6. arrastar nós e mover o plano;
7. testar zoom e enquadramento;
8. abrir a origem pelo painel e por duplo clique;
9. alternar para o modo Dicionário e voltar;
10. repetir no celular e sem conexão.
