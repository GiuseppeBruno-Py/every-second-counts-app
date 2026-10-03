# Retornos da tentativa ao plano — Define

**Status:** Shipped
**Revisão:** 1
**Data:** 2026-10-02
**Clareza:** 15/15 (problema, usuário, escopo, restrições e critérios: 3/3 cada)
**Fonte:** roadmap anexado, Delivery 5; continuação explícita até a próxima PR após #93 mesclada.

## Objetivo e evidência disponível

Para o aprendiz que recoloca a mesma tentativa em Hoje, oferecer um ajuste opcional quando há retornos explícitos em dias anteriores sem conclusão marcada. Ausência de Session não prova adiamento, ausência de trabalho ou procrastinação. O produto descreve apenas registros locais, sem classificação psicológica.

Inspeção: dailyPlans contém date, itens identificados, createdAt, completedAt e snapshots outcomeId/attemptId/attemptText. nextAttempt.id permanece em edições: exigir texto e marco updatedAt da tentativa. executionSessions, sessions e deepWorkSessions permitem excluir execução vinculada. Isso sustenta uma observação de retorno registrado, sem medir intenção ou execução fora do app. Registros incompletos e conflitos não são evidência positiva.

## Escopo e regras

P1: contexto recolhido na tentativa principal ativa de Hoje; seis escolhas do roadmap, reaproveitando editor e configuração de sessão. P1: ignorar sem gravação e confirmação pelos fluxos existentes. P1: acessibilidade, offline e compatibilidade.

Critério inicial reversível: tentativa atual no plano de hoje e pelo menos três dias anteriores distintos entre os últimos 14 dias, com referências explícitas da mesma versão textual, não concluídas. Cada ocasião deve ter ID próprio, criação naquele dia e posterior à última edição da tentativa. Hoje não conta para o limiar. Nenhuma conclusão ou execução vinculada da tentativa pode estar registrada. Datas, cópias ou campos ambíguos suprimem a observação. Limiar não representa validade psicológica ou eficácia comprovada.

Sem entidade, score, contagem pública, alerta vermelho, telemetria ou inferência de procrastinação. Sem Delivery 6/7, migração de schema, redesign, merge ou deployment. Gate 1 permanece avaliação técnica, sem evidência de benefício pessoal.

## Aceitação (Given / When / Then)

- AC-01: Dada tentativa ativa com referência atual e três ocasiões válidas anteriores, quando Hoje renderiza, então aparece contexto factual recolhido; leitura não grava dados.
- AC-02: Dada ausência de planos suficientes, mesmo sem sessões, quando avaliada, então nada aparece. Mesmo dia, cópia de ID, data inválida/futura/antiga, timestamps ausentes e conflitos não sustentam indicação.
- AC-03: Dada conclusão, execução vinculada (inclusive interrompida ou em curso), referência diferente, texto editado ou capacidade arquivada/ausente, quando avaliada, então indicação é suprimida. Nenhuma associação por título/recurso ou diagnóstico.
- AC-04: Dado contexto aberto, quando escolhida Tornar menor, Esclarecer primeiro passo, Mudar contexto ou Rever por que importa, então abre editor existente no campo pertinente, sem modificar dados até aplicar/salvar. Cancelar/Escape e falha conservam contratos atuais.
- AC-05: Dada escolha Preparar ambiente, quando acionada, então abre configuração opcional de sessão no seletor de Ritual; usuário escolhe preparação e confirma início. Abrir/cancelar não cria execução ou altera tentativa.
- AC-06: Dada escolha Manter como está, quando acionada, então contexto desaparece nessa visita sem persistir; tentativa e plano permanecem iguais. Trocar de vista/recarregar permite nova avaliação. Ações revalidam a evidência antes de abrir.
- AC-07: Dados teclado, mobile 360px, zoom 200% e movimento reduzido, quando usado contexto, então disclosure, botões e foco são acessíveis; sete ações principais preservadas, texto/foco legíveis, alvos >=44px e sem overflow.
- AC-08: Dado storage IndexedDB ou fallback e app offline/reload/backup, quando reavaliado, então contexto deriva exclusivamente dos mesmos registros, sem novos campos ou snapshots; suites do repositório passam.

## Suposições e riscos

Usuário pode trabalhar fora do app; copy diz sem conclusão marcada, nunca sem trabalho. Falsos negativos conservadores são aceitos. Datas do plano são dias locais; relógio/fuso alterado pode suprimir contexto. Sem observação pessoal de eficácia. Não atribuir causalidade aos atalhos.
