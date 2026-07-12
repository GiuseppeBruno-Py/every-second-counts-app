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

## Fase 4.2 · Perguntas contextuais

Os resultados recuperados podem originar perguntas de explicação, aplicação ou relação entre conceitos. A pergunta e a resposta de referência são abertas no editor existente do Active Recall e só entram no banco depois da confirmação do usuário.

## Fase 4.3 · Avaliação de explicações

A explicação do usuário é comparada localmente aos conceitos-chave da fonte. O diagnóstico combina cobertura lexical, desenvolvimento e sinais básicos de estrutura. O resultado é orientativo, mantém histórico local e pode gerar uma entrada no caderno de erros.

A pontuação não afirma correção factual e não substitui revisão humana da fonte.
