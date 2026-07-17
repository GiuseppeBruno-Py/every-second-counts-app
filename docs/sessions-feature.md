# Sessões de leitura e estudo

## Domínio unificado

Todos os modos começam pela ação **Executar**. O usuário escolhe sessão rápida, Deep Work, versão mínima ou Plano B no mesmo fluxo. Apenas uma execução pode permanecer ativa por vez, inclusive quando ela foi iniciada em outro modo.

`executionSessions` é a projeção canônica e sincronizável. Ela preserva referências para `sessions` e `deepWorkSessions`, que continuam no estado para compatibilidade com backups antigos. A migração é idempotente, deduplica pela coleção e pelo ID de origem e não apaga os registros legados.

Ritual, versão mínima e contingência são snapshots da execução. Alterar ou excluir o template depois não modifica o histórico concluído. Companion, Revisão semanal e Consistência consomem o mesmo estado ou histórico canônico.

## Objetivo

Registrar execução real no Compasso, preservando duração, ponto inicial, ponto final e contexto da sessão. A funcionalidade atende leituras físicas, leituras digitais/Kindle e estudos por horas.

## Fluxo principal

1. O usuário abre um cartão de leitura ou estudo.
2. Toca em **Iniciar sessão**.
3. Confirma o ponto inicial e registra opcionalmente o objetivo da sessão.
4. O cronômetro permanece ativo mesmo com o PWA fechado.
5. A sessão pode ser pausada e retomada.
6. Ao tocar em **Concluir**, o instante e a duração são congelados antes de abrir o formulário.
7. O usuário informa o ponto final e uma observação opcional.
8. Se cancelar, a sessão ativa retoma sem contar o tempo do formulário; uma sessão que já estava pausada continua pausada.
9. O progresso do item é atualizado automaticamente.
10. A sessão fica disponível no histórico do item.

## Métricas

| Tipo | Início e encerramento |
| --- | --- |
| Livro físico | página inicial e página final |
| Kindle/digital | percentual inicial e percentual final |
| Estudo | horas acumuladas; o tempo da sessão é sugerido automaticamente |

## Regras

- Existe no máximo uma sessão ativa, pausada ou em encerramento por vez.
- Pausar interrompe a contagem efetiva, mas preserva a sessão.
- O estado intermediário `finishing` persiste `finishingStartedAt`, `frozenDurationMs` e `statusBeforeFinishing` para recuperação após reload.
- Confirmar usa a duração congelada e é idempotente; o tempo preenchendo o formulário nunca aumenta a sessão.
- Cancelar uma conclusão ativa registra o intervalo do formulário como pausa técnica; cancelar uma conclusão previamente pausada não retoma automaticamente.
- Fechar ou recarregar o aplicativo não encerra a sessão.
- O valor final não pode ser menor que o valor inicial.
- Chegar a 100% conclui automaticamente o item.
- Excluir uma sessão do histórico não reverte o progresso atual do item.
- Sessões concluídas podem ser corrigidas pelo histórico global ou pelo histórico do item.
- A correção permite ajustar vínculo, domínio, início, fim, duração, progresso registrado, observação, próxima ação e variante; em Deep Work, ajusta os campos compatíveis no registro original.
- Uma correção preserva o `id`, atualiza `updatedAt`/`editedAt`, emite `session:history-updated` e mostra o selo **Editado**.
- Métricas são recalculadas a partir do registro corrigido; o progresso atual do item nunca é aplicado novamente.
- A edição de Deep Work atualiza o registro existente, sem criar uma segunda sessão ou uma segunda evidência.
- Sessões entram no backup JSON porque ficam vinculadas ao estado do Compasso.

## Persistência

As sessões são salvas em `state.data.sessions`, persistidas pela camada `CompassoStorage` no IndexedDB e mantidas no espelho de contingência do `localStorage`.

## Validação manual

### Livro físico

1. Iniciar em uma página conhecida.
2. Pausar e retomar.
3. Encerrar em uma página maior.
4. Confirmar o progresso e o histórico.

### Kindle

1. Iniciar em um percentual conhecido.
2. Encerrar em percentual maior.
3. Confirmar atualização do percentual e conclusão em 100%.

### Estudo

1. Iniciar a sessão.
2. Encerrar após alguns minutos.
3. Confirmar que as horas sugeridas consideram a duração efetiva.
4. Editar o valor final antes de salvar, quando necessário.

### PWA e recuperação

1. Iniciar uma sessão.
2. Fechar o PWA.
3. Abrir novamente.
4. Confirmar que o cronômetro e o estado ativo foram recuperados.
5. Repetir o teste durante uma pausa.
6. Tocar em **Concluir**, aguardar e confirmar que o relógio permanece congelado.
7. Recarregar durante o encerramento e confirmar que o formulário e a duração são recuperados.
8. Cancelar a conclusão a partir de uma sessão ativa e de uma sessão pausada.

### Correção do histórico

1. Concluir uma sessão comum e uma sessão Deep Work.
2. Abrir **Consistência** e usar **Editar** no histórico.
3. Corrigir a duração e a observação, salvar e confirmar o selo **Editado**.
4. Confirmar que tempo focado, dias ativos e revisão semanal refletem os registros corrigidos.
5. Confirmar que o progresso atual do item não mudou e que Deep Work continua com um único registro.

## Fora do escopo desta versão

- lançamento retroativo/manual de sessões;
- evidência estruturada vinculada à sessão;
- relatórios e gráficos agregados;
- sincronização automática entre dispositivos.
