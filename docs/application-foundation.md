# Fundação modular do Compasso

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
