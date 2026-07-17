# Journal integrado

## Objetivo

O Journal oferece um ponto único e rápido para registrar o que precisa ser feito, o que aconteceu e o que foi aprendido. A implementação é conceitualmente inspirada em práticas de registro rápido e reflexão, com linguagem, interface e modelo próprios do Compasso.

Ele pertence ao nível **Essencial** e funciona inteiramente no navegador, inclusive offline depois do primeiro carregamento.

## Estrutura

### Diário

- define uma intenção curta para o dia;
- registra tarefas, eventos e notas por captura rápida;
- aceita os atalhos `/tarefa`, `/evento` e `/nota`;
- permite concluir, cancelar, migrar, editar e comentar entradas;
- oferece busca e filtros por tipo, estado, marcador e vínculo;
- encerra o dia com uma decisão explícita para cada tarefa aberta.

### Mês

- registra prioridades mensais;
- apresenta entradas agrupadas no período;
- permite revisar e migrar tarefas abertas para uma data futura;
- preserva a entrada de origem e seu histórico.

### Futuro

- agenda itens para uma data posterior;
- mantém agenda e conteúdo desacoplados da tela diária;
- permite levar o item ao Diário quando chegar o momento apropriado.

### Coleções

- agrupa entradas relacionadas sem duplicar o conteúdo;
- serve para assuntos, projetos, listas de referência e acompanhamentos;
- mantém os vínculos por IDs estáveis.

## Modelo de dados

O schema atual é `journalSchemaVersion: 1`. Cada entrada possui um ID permanente, tipo, conteúdo, data do Journal, estado, marcadores, referências opcionais, histórico e timestamps `createdAt`/`updatedAt`.

`entryType` é uma decisão explícita. Editar texto, data, vínculos, coleções ou marcadores não reaplica o valor do seletor nem um default; valores ausentes ou inválidos em atualizações parciais preservam a categoria válida já armazenada. O default `note` existe apenas para criação sem escolha e para legado realmente sem categoria válida. Mover uma entrada para outro dia cria um destino rastreável, preservando categoria, vínculos, histórico e referência de origem. Uma troca de categoria só ocorre por seleção manual no formulário ou por atalho explícito durante a criação.

Tarefas usam estados explícitos:

- `open`: ainda requer decisão;
- `completed`: concluída;
- `cancelled`: deliberadamente descartada;
- `migrated`: encerrada na origem e recriada no destino;
- `archived`: preservada, mas fora do fluxo ativo.

Uma migração nunca sobrescreve silenciosamente a origem. A tarefa original recebe estado `migrated`, guarda o ID do destino e a nova entrada aponta para o ID de origem. Migrações repetidas continuam formando uma cadeia auditável.

## Integrações

- **Hoje:** entradas podem virar ações executáveis e o painel resume o Journal do dia.
- **Sessões e Deep Work:** a intenção da sessão pode ser ligada a uma entrada; durante a sessão é possível registrar algo sem abandonar o cronômetro; o encerramento aceita um resumo.
- **Atlas:** notas do Journal podem virar notas Markdown preservando uma referência à entrada original.
- **Active Recall:** uma nota ou aprendizado pode virar pergunta revisável.
- **Evidências:** uma entrada pode ser convertida em evidência e vinculada a uma frente ou sessão.
- **Capturas:** conteúdo ainda não classificado pode seguir para a Caixa de entrada.
- **Revisão semanal:** exibe volume, conclusões, migrações, itens abertos e decisões pendentes.
- **RAG local:** as entradas não arquivadas são pesquisáveis e abrem diretamente no dia de origem.
- **Backup e Drive:** as coleções do Journal participam do JSON e da sincronização. Divergências equivalentes no Drive são preservadas como conflito, em vez de uma versão substituir a outra.

## Privacidade

Os registros ficam localmente no armazenamento do navegador. A interface permite ocultar prévias para reduzir exposição casual na tela. Antes do backup JSON, o aplicativo avisa que o arquivo pode conter registros privados e oferece a opção de excluir o Journal da exportação.

Ocultar uma prévia não é criptografia. Quem tiver acesso ao perfil do navegador ou a um backup completo ainda poderá acessar os dados.

## Recuperação e compatibilidade

O carregamento executa uma migração idempotente: rodá-la novamente não duplica nem altera entradas já normalizadas. Registros desconhecidos são preservados sempre que possível e campos ausentes recebem valores compatíveis.

Exclusões sincronizáveis continuam usando os tombstones do aplicativo. IDs, `updatedAt` e histórico não devem ser recriados manualmente por integrações externas.

## Validação

Os testes unitários cobrem criação, edição, estados, migração simples e repetida, fechamento diário, coleções, agenda futura, migração do schema, serialização, filtros, métricas e comentários.

Os testes de navegador cobrem:

1. captura rápida e persistência após recarregar;
2. conclusão e métricas;
3. migração com origem e histórico;
4. transformação em nota;
5. fechamento do dia com decisões pendentes;
6. navegação em tela pequena sem estouro horizontal;
7. recarregamento offline pela PWA.

## Limites atuais

- o conteúdo é texto simples; Markdown completo continua sendo responsabilidade do Atlas;
- conflitos do Drive são preservados para evitar perda, mas não possuem ainda uma tela dedicada de comparação linha a linha;
- recorrência automática de tarefas e lembretes do sistema operacional não fazem parte desta versão;
- o Journal não substitui a fila de Active Recall nem o planejamento semanal: ele registra e encaminha conteúdo para esses fluxos.
