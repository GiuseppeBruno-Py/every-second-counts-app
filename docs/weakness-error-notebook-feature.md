# Assuntos fracos e caderno de erros

## Objetivo

Transformar o histórico da revisão espaçada em feedback acionável: separar o acontecimento da interpretação, formular uma hipótese testável, registrar a correção e definir a próxima tentativa.

## Índice de dificuldade

O painel agrupa cards pela leitura, estudo, meta ou fonte de origem. Cada avaliação recebe um peso:

- Errei: 1,00;
- Difícil: 0,65;
- Bom: 0,15;
- Fácil: 0,00.

O índice é a média ponderada das tentativas. Grupos com índice a partir de 25% aparecem como pontos fracos. Quando a última tentativa é Bom ou Fácil após uma falha anterior, o painel sinaliza recuperação recente.

## Caderno de erros

Um registro manual salvo na versão 2 pode conter cinco estágios distintos:

- fato observado (`context`): o que aconteceu objetivamente;
- interpretação (`interpretation`, opcional): a conclusão que a pessoa percebe estar tirando;
- hipótese (`hypothesis`, opcional): uma explicação específica que pode ser testada;
- correção (`correction`): o que deveria acontecer diferente;
- próxima tentativa (`nextAction`): a ação concreta que será executada;
- vínculo opcional com leitura, estudo ou meta;
- estado aberto ou resolvido;
- card de origem, quando criado por captura rápida.

O Compasso não infere interpretação, hipótese, característica pessoal, score ou mudança de Capability. Os dois novos campos são gravados somente quando a pessoa salva explicitamente o formulário. Registros da versão 1 e registros criados pelo fluxo contextual continuam válidos, aparecem com os campos novos vazios e não são reescritos em segundo plano.

O salvamento usa um estado candidato e fecha o diálogo apenas depois da confirmação da persistência local. Se IndexedDB e o fallback não confirmarem a escrita, o estado anterior é restaurado, o draft permanece no formulário e a tentativa pode ser repetida. Os campos aditivos seguem o backup/restore JSON e o cache completo da PWA sem novo store, chave ou migração global.

## Critérios de aceite

- O diagnóstico usa somente avaliações realmente registradas.
- Cards sem prática não são classificados como fracos.
- Um ponto fraco pode originar um registro preenchido automaticamente.
- Registros podem ser criados, editados, resolvidos, reabertos e excluídos.
- Interpretação e hipótese são opcionais e nunca são produzidas automaticamente.
- Uma falha de escrita não cria registro em memória nem descarta o draft.
- Backups antigos sem `errorNotebook` continuam funcionando.
- Backups com registros v1 continuam válidos; um round-trip v2 preserva os novos campos.
- Todos os dados permanecem locais e fazem parte do backup JSON.
