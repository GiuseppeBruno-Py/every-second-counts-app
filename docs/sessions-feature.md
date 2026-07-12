# Sessões de leitura e estudo

## Objetivo

Registrar execução real no Compasso, preservando duração, ponto inicial, ponto final e contexto da sessão. A funcionalidade atende leituras físicas, leituras digitais/Kindle e estudos por horas.

## Fluxo principal

1. O usuário abre um cartão de leitura ou estudo.
2. Toca em **Iniciar sessão**.
3. Confirma o ponto inicial e registra opcionalmente o objetivo da sessão.
4. O cronômetro permanece ativo mesmo com o PWA fechado.
5. A sessão pode ser pausada e retomada.
6. Ao encerrar, o usuário informa o ponto final e uma observação opcional.
7. O progresso do item é atualizado automaticamente.
8. A sessão fica disponível no histórico do item.

## Métricas

| Tipo | Início e encerramento |
| --- | --- |
| Livro físico | página inicial e página final |
| Kindle/digital | percentual inicial e percentual final |
| Estudo | horas acumuladas; o tempo da sessão é sugerido automaticamente |

## Regras

- Existe no máximo uma sessão ativa ou pausada por vez.
- Pausar interrompe a contagem efetiva, mas preserva a sessão.
- Fechar ou recarregar o aplicativo não encerra a sessão.
- O valor final não pode ser menor que o valor inicial.
- Chegar a 100% conclui automaticamente o item.
- Excluir uma sessão do histórico não reverte o progresso atual do item.
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

## Fora do escopo desta versão

- lançamento retroativo/manual de sessões;
- edição de uma sessão concluída;
- evidência estruturada vinculada à sessão;
- relatórios e gráficos agregados;
- sincronização automática entre dispositivos.
