# Fase 4.1 · RAG local

## Objetivo

Recuperar contexto relevante do acervo pessoal antes das futuras etapas de geração e avaliação por IA, mantendo dados e processamento no navegador.

## Fontes indexadas

- Leituras, estudos e metas.
- Notas Markdown do Atlas.
- Evidências registradas em sessões.
- Perguntas e respostas de Active Recall.
- Registros do caderno de erros.

## Fluxo

1. A visão **IA contextual** monta um índice transitório a partir do estado atual.
2. A consulta é normalizada e dividida em termos relevantes.
3. As fontes recebem pontuação por frase exata, termos no título, frequência e cobertura.
4. Os resultados exibem tipo, origem, trecho e ação para abrir a fonte.

Nenhuma consulta ou fonte é enviada para um serviço externo. O índice é reconstruído localmente e não duplica os dados persistidos.

## Próxima fase

A Fase 4.2 poderá usar os resultados recuperados para propor perguntas de Active Recall. Toda pergunta deverá ser revisada antes de entrar no banco.
