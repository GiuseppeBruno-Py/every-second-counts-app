# O que isso destrava? — Shipped

**Status:** Shipped
**Data:** 2026-10-02
**Delivery:** 4
**Branch:** codex/capability-benefit
**Base:** origin/main@3b86fe5
**Design:** revisão 2
**Arquivo:** copy-only; Define, Design e Build report de trabalho conservados.

## Resultado

Uma frase opcional de benefício em Capability, editável e removível, recolhida na criação e mostrada como contexto secundário na tentativa principal atual em Hoje. Limite de 240 caracteres no comando; import válido longo preservado sem corte. Sem ação adicional em Hoje ou benefício copiado para execuções.

O registro Capability passa do formato legado não versionado para schemaVersion 1, via normalização idempotente. Estado global v3, coleções, IndexedDB/fallback, merge, tombstones e contratos históricos permanecem. Manifesto usa geração v92.

## Verificação de Ship

- AC-01–10: PASS individual na matriz do BUILD_REPORT.md arquivado, com cenários, comandos e evidência de modelo/browser.
- npm run test:all: exit 0; 244 Node PASS; 402 browser PASS e 24 skips configurados entre 426 cenários, 16.3 min. Sem falhas/flaky na execução final.
- Rodada focada de Capability: 37 PASS e 1 skip configurado. Verificação adicional de simulação/contraste: 4 PASS, desktop/mobile.
- Sintaxe dos módulos/teste novo e git diff --check aprovados. Lint/typecheck não configurados.
- Quatro capturas editor/Hoje em desktop/mobile inspecionadas por Codex; texto, ajuda, foco e hierarquia legíveis. Sem atualização de baselines.
- Comparação com Design: cinco arquivos de runtime, cinco de testes, dois de documentação e sete SDD; 19 arquivos no manifesto R2. Única extensão foi expectativa v1 do backup de simulação, registrada antes da mudança.
- Não há bloqueador de aceitação. Rodadas interrompidas/falhas intermediárias não contaram como evidência de aprovação; execução completa repetida após a correção.

## Compatibilidade e riscos residuais

Backup antigo migra sem benefício inferido; novo exporta/restaura/recarrega com texto e identidade. Merge conserva a frase na versão vencedora, remoção explícita e versões conflitantes; tombstone não ressuscita Capability. Offline foi observado em automação com IndexedDB e fallback, incluindo lifecycle do Service Worker.

Instalação física PWA não foi executada por Codex. A hipótese de aumentar valor percebido não tem evidência de uso pessoal. Um cliente antigo pode descartar o campo ao editar; atualizar clientes e conservar backup. Após exposição, rollback exige geração posterior e leitor compatível com benefit/schemaVersion. Import longo continua legível, mas salvar edição explícita do benefício exige encurtá-lo.

## Lições

1. Prova, categoria de uso e benefício têm significados diferentes: a inspeção de contratos evitou substituir um enum histórico por texto livre ou criar vários donos.
2. Versão explícita de registro afeta expectativas de formato em fluxos distintos. Uma busca de todas as assertions estruturais deve preceder a execução ampla; o backup de simulação revelou esse ponto e motivou Iterate R2.
3. Limites no comando e preservação na leitura/importação podem coexistir: dados não precisam ser truncados para manter a frase curta na interface.

## Git e próximo passo

Este Ship encerra a documentação e verificação SDD. No fechamento, somente fetch/criação de branch foram realizados. A solicitação do usuário autoriza commit, push da branch e criação de PR como etapa seguinte. Revisão/merge/publicação ficam no fluxo da PR; nenhuma implantação foi realizada neste fechamento.
