# Fundação de armazenamento do Compasso

## Objetivo

Migrar a persistência do estado principal para IndexedDB sem interromper o funcionamento local-first, offline ou os backups JSON existentes.

## Estratégia de migração

1. O documento carrega `storage.js` diretamente antes da inicialização; o funcionamento não depende da composição do service worker.
2. `CompassoStorage.ready()` abre o banco `compasso-db` e cria o schema versionado.
3. Quando ainda não existe estado no IndexedDB, o conteúdo atual de `compasso.app.v1` é copiado do `localStorage`.
4. Quando os dois armazenamentos divergem, o valor visível no aplicativo legado tem precedência e é migrado.
5. Toda gravação serializável atualiza a memória e entra em uma fila por chave. Cada entrada conclui toda a tentativa IndexedDB → espelho/fallback antes de liberar a seguinte.
6. `CompassoStorage.save()` continua retornando `Promise<boolean>`: `true` confirma o candidato exato no IndexedDB ou no fallback `localStorage`; retenção somente em memória retorna `false`.
7. Com IndexedDB confirmado, o `localStorage` recebe apenas estados pequenos (até 256 KiB) como espelho opcional. Falha ou quota do espelho não transforma o commit principal em falha.
8. Se o IndexedDB estiver indisponível ou rejeitar o candidato, o mesmo item da fila tenta o estado exato no `localStorage`, inclusive quando ele excede o limite normal do espelho. Falha dos dois backends preserva a edição em memória para retry, mas não é anunciada como salva.

## Substituição segura durante restore

O restore JSON usa `CompassoStorage.replace()` somente para a chave existente do estado principal. A operação:

1. reserva uma barreira exclusiva e fica atrás das gravações já enfileiradas;
2. captura presença e valor anteriores na memória, no IndexedDB e no `localStorage`;
3. persiste o candidato sem promovê-lo para `state.data`;
4. libera a ativação somente depois de um backend durável confirmar o candidato;
5. se a ativação falhar, restaura e verifica o checkpoint anterior antes de retornar uma falha recuperável.

Se a compensação não puder ser confirmada, a operação lança `storage-rollback-failed` e mantém a barreira. A interface não afirma que os dados anteriores foram recuperados até essa confirmação.

Antes da barreira, o arquivo é analisado, validado e normalizado como candidato isolado. O formato aceito continua sendo o objeto raiz atual/legado com `reading`, `study` e `goal` como arrays. Coleções opcionais e campos compatíveis desconhecidos continuam sob os normalizadores atuais; o restore não adiciona envelope `{ data: ... }`, versão de estado ou efeito remoto automático.

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
- Quando o IndexedDB falha, o `localStorage` também é um backend de contingência durável e seu sucesso é suficiente para o resultado booleano.
- Estados grandes tentam o fallback quando necessário, mas o IndexedDB continua sendo o caminho primário confiável diante da quota reduzida do armazenamento legado.
- `compasso.state.v3`, a versão do banco, as stores, as coleções e a chave do estado permanecem inalterados.
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
- Notes só apresenta `Salvo` depois da confirmação de um backend durável; falha mantém o texto atual editável e permite retry.
- Restore cancelado, inválido ou sem persistência deixa o estado anterior ativo e recuperável.
