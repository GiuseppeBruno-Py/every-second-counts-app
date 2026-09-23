# Experimentos comportamentais

Na área **Capacidades**, use **Novo experimento** para planejar uma prática repetida associada a uma capacidade ativa. Descreva:

1. a hipótese (“se eu fizer X…”);
2. o que será repetido;
3. o resultado observável esperado;
4. como reconhecer a evidência;
5. início e data de revisão.

Os períodos de 7, 14, 21 e 30 dias apenas preenchem a data de revisão. **21 dias não são uma duração cientificamente necessária.** Escolha **Personalizado** para definir outra data.

Ao revisar, registre o que de fato aconteceu e decida **Manter**, **Ajustar** ou **Abandonar**. A decisão não altera automaticamente a Capability, a próxima tentativa, Evidence ou a Weekly Review. Para ajustar um experimento já revisado, crie um novo plano; a revisão anterior permanece como histórico. O Compasso não inicia sessões, registra evidências ou envia lembretes em nome do experimento.

## Dados e compatibilidade

`behavioralExperiments` é uma coleção local aditiva de registros `schemaVersion: 1`, vinculados ao snapshot de `capabilityRef`. Registros históricos continuam legíveis se a capacidade for arquivada, editada ou removida. Somente capacidades ativas podem iniciar novos planos. A coleção usa a persistência existente (IndexedDB ou fallback localStorage), o backup/restauração JSON completo e o merge por timestamp/tombstone do estado v3. Backups antigos sem a coleção carregam `[]`. Não há nova object store ou versão de banco.

O Service Worker usa os módulos e assets declarados em `app-manifest.js`, geração `compasso-pages-v86`; não há dependência de rede para criar ou revisar depois que o app foi carregado/cacheado. Em rollback após exposição, publique uma geração posterior que preserve a coleção no estado e nos backups, mesmo que a interface seja desabilitada. Não limpe armazenamento local ou backups.
