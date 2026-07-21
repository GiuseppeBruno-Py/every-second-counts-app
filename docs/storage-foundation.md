# Fundação de armazenamento do Compasso

## Objetivo

Migrar a persistência do estado principal para IndexedDB sem interromper o funcionamento local-first, offline ou os backups JSON existentes.

## Estratégia de migração

1. O documento carrega `storage.js` diretamente antes da inicialização; o funcionamento não depende da composição do service worker.
2. `CompassoStorage.ready()` abre o banco `compasso-db` e cria o schema versionado.
3. Quando ainda não existe estado no IndexedDB, o conteúdo atual de `compasso.app.v1` é copiado do `localStorage`.
4. Quando os dois armazenamentos divergem, o valor visível no aplicativo legado tem precedência e é migrado.
5. Toda gravação atualiza a memória e entra em uma fila serial de escrita no IndexedDB.
6. O `localStorage` recebe apenas estados pequenos (até 256 KiB) para compatibilidade; estados maiores permanecem exclusivamente no IndexedDB.
7. Falta de espaço no `localStorage` é capturada, o espelho é removido e nunca interrompe o bootstrap ou a gravação principal.
8. Se o IndexedDB estiver indisponível, o aplicativo tenta o espelho legado sem propagar erros de quota.

## Stores da versão 1

| Store | Finalidade |
| --- | --- |
| `appState` | Estado atual de leituras, estudos, metas, pastas e notas |
| `sessions` | Sessões futuras de leitura e estudo |
| `evidence` | Evidências produzidas em cada sessão |
| `reviewItems` | Perguntas e itens de revisão espaçada |
| `weeklyReviews` | Revisões semanais |
| `attachments` | Capas e anexos futuros |
| `settings` | Preferências do aplicativo |
| `meta` | Versão e diagnóstico da persistência |

## Compatibilidade e rollback

- O formato do backup JSON permanece inalterado.
- O `localStorage` continua como espelho temporário somente enquanto o estado for pequeno.
- Estados grandes exigem uma versão com suporte ao IndexedDB, evitando o limite reduzido do armazenamento legado.
- Nenhum dado pessoal é enviado ao GitHub ou a serviços externos.

## Diagnóstico

No console do navegador:

```javascript
await CompassoStorage.diagnostics();
```

O resultado deve indicar `mode: "indexeddb"` e listar as stores do schema.

## Critérios de aceite

- Dados existentes são preservados na primeira abertura.
- Alterações sobrevivem ao fechamento e à reabertura do PWA.
- O aplicativo continua operando offline.
- Importação e exportação JSON continuam compatíveis.
- Falhas do IndexedDB não impedem a abertura do aplicativo.
