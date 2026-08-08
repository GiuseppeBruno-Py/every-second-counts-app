# Fundação modular do Compasso

> A camada visual e os contratos responsivos estão documentados em [Design system do Compasso](./design-system.md).

Esta fundação mantém o aplicativo estático e local-first, mas remove a necessidade de novas features conhecerem detalhes internos umas das outras.

## Contratos

- `CompassoFeatures.register(nome, hooks)`: registra hooks ordenados. Erros ficam isolados e aparecem em `health()`.
- `command(nome, handler)` e `execute(nome, payload)`: ações mutáveis com um único responsável.
- `selector(nome, reader)`: consultas de estado sem expor a estrutura da coleção.
- `on/emit`: eventos entre features sem chamada direta.
- `service(nome, objeto)`: serviços de domínio estáveis. Os nomes iniciais são `register`, `execute`, `review`, `knowledge` e `learning`.
- `route(nome, handler)`: navegação registrada, sem acoplamento a botões específicos.

Uma feature nova não deve substituir `renderAll`, `renderGrid`, `saveData` nem outra função global. Deve registrar hook, comando, evento ou serviço.

## Estado e sincronização

`app-manifest.js` é a fonte única da ordem de composição, cache e catálogo de coleções. `CompassoStateFoundation.migrate` normaliza o schema de forma idempotente. `merge` aplica estratégia por coleção, considera tombstones e preserva conflitos no histórico `_sync.conflicts`, inclusive nos mapas indexados por data.

Coleções novas devem ser declaradas no catálogo antes de serem sincronizadas.

## Diagnóstico

Cada módulo informa início e fim ao `CompassoBootstrapDiagnostic`. Exceções e rejeições ficam associadas ao último módulo ativo; se o runtime não terminar de instalar, o usuário vê uma mensagem recuperável em vez de uma tela silenciosa. O relatório não inclui conteúdo do usuário.

## Renderização

`CompassoFeatures.health().renders` expõe quantidade, média, máximo e renders acima de 50 ms. Features devem preferir hooks direcionados e evitar chamar uma renderização completa em sequência.

## Arquitetura de informação

`information-architecture-model.js` é a fonte única das cinco áreas primárias: Hoje, Frentes, Journal, Revisão e Mais. Cada área e subvisão declara `id`, `label`, `icon`, `level`, `order` e `route`; nenhuma decisão de visibilidade depende do texto exibido.

- Frentes contém Visão geral, Leituras, Estudos e Metas.
- Revisão contém Revisão semanal, Resultados, Consistência, Active Recall e Caderno de erros.
- Mais contém Atlas, grafo/relações, IA contextual, integrações, importação, exportação e configurações.
- Registrar e Executar são ações globais da barra superior, não destinos.

Deep links continuam usando `?view=<rota>`. Rotas antigas válidas abrem a subvisão e anunciam sua área-pai; rotas ou preferências inválidas voltam para Hoje. Novas features devem registrar sua rota no modelo central em vez de inserir um botão na sidebar.

## Geração e composição do PWA

`CompassoAppManifest.cacheName` é a identidade canônica da geração do aplicativo. O campo `version` continua sendo a versão da API do manifesto e não deve ser usado como número de release. Documento, controlador e pacote em cache só são considerados coerentes quando usam o mesmo `cacheName`.

`app-composition.js` implementa a composição determinística compartilhada pelo Service Worker e pelos testes. O HTML cru contém slots sem dependência de quebra de linha; cada módulo recebe sentinelas exatas derivadas de seu caminho no manifesto. Uma composição completa exige todos os módulos declarados exatamente uma vez e na ordem do manifesto, além dos suportes estáticos e do carregamento direto de `storage.js`. O marcador `<meta name="compasso-application-generation">` e os cabeçalhos de sucesso só são adicionados após essa validação. LF e CRLF têm o mesmo resultado semântico.

Durante a instalação, o Service Worker preenche o cache e executa uma composição completa em memória antes de `skipWaiting()`. Uma falha rejeita a instalação e não ativa um pacote parcial. Navegações controladas são compostas somente com arquivos do cache da própria geração; não há mistura de módulos obtidos individualmente da rede.

## Bootstrap e convergência

O `index.html` cru é infraestrutura de bootstrap e recuperação. A aplicação legada permanece `hidden`, `inert` e fora da árvore acessível até a convergência. A superfície neutra informa progresso ou falha e oferece uma tentativa não destrutiva.

`bootstrap-diagnostics.js` preserva `CompassoBootstrapDiagnostic` e também expõe `CompassoPwaLifecycle`. Esse coordenador é o único proprietário de recargas automáticas de convergência. Botão de atualização, bootstrap cru e `controllerchange` apenas produzem sinais para ele.

A coerência usa uma verificação híbrida: o documento traz o marcador de composição completa e consulta o controlador por `MessageChannel` com `compasso:generation:query`. A resposta contém somente o identificador técnico da geração. O caminho controlado coerente abre sem recarga adicional; primeira visita, recuperação de HTML cru e atualização real usam no máximo uma recarga automática.

O limite é guardado em `sessionStorage['compasso.pwa.reload-budget.v1']` por geração, motivo permitido e `location.pathname`. Ao esgotar o limite, o aplicativo permanece em um estado legível com tentativa manual; não inicia um loop nem limpa automaticamente o shell.

## Atualização, cache e recuperação

“Verificar atualização” observa `updatefound`, estados do worker e transição do controlador. Ausência de nova geração informa que o Compasso está atualizado e causa zero recargas. Falha mantém a geração coerente já aberta. Não existe timer de sucesso.

Caches pertencem inequivocamente ao Compasso somente quando o nome corresponde a `^compasso-pages-v\d+$`. Ativação remove apenas gerações antigas que satisfazem esse predicado, preservando o cache atual, nomes ambíguos e caches de outras aplicações na mesma origem.

“Tentar novamente” é não destrutivo. A redefinição do shell é uma ação distinta, de último recurso, com confirmação explícita. Ela limita a remoção ao registro no escopo exato do aplicativo e aos caches inequivocamente pertencentes ao Compasso. IndexedDB, localStorage de produto, estado, backups JSON, vault Markdown e dados do Drive não são apagados.

O startup offline controlado usa o pacote completo em cache. Um documento cru em execução com worker/cache utilizável recebe uma tentativa normal limitada. A ausência simultânea de documento, worker, cache e rede continua sendo uma falha pertencente ao navegador.

## Rollback e validação

Antes de publicação, manifesto, compositor, Service Worker, HTML e coordenador devem ser revertidos como uma unidade. Depois que uma geração de Service Worker foi ativada, a correção é publicada sob uma nova geração futura; reutilizar um nome antigo não recupera caches já removidos e pode deixar clientes divergentes. A estratégia de avanço preserva todos os dados locais.

Os comandos de validação do repositório são `npm test`, `npm run build:test`, `npm run test:browser` e `npm run test:all`. Evidência de PWA instalado deve ser registrada separadamente como validação manual, sem ser atribuída ao Playwright.
