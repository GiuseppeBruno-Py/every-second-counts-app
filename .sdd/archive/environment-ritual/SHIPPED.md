# Preparação do ambiente — Shipped record

**Delivery:** 3
**Data:** 2026-10-02
**Status:** PASS, arquivado por cópia
**Base:** `origin/main@58512ff`

## Escopo aceito e Design

Os 12 critérios possuem evidência. **Começar sem fuga** está no catálogo de Rituals por escolha explícita; a Session rápida oferece preparação opcional no diálogo existente, aceita qualquer quantidade de marcas e permite **Pular e começar**. O snapshot atual registra o Ritual escolhido; as marcas rápidas ficam transitórias. A dispensa atravessa a transferência para Deep Work sem alterar vínculos salvos.

O diff segue o manifesto fechado do DESIGN revisão 2. A revisão moveu o disclosure para depois de Ajustar sessão, evitando aninhamento. Não há schema novo, coleção, engine de checklist/timer, botão de preparação em Hoje, dependência ou permissão. O Gate 1 foi registrado em `.sdd/reports/anti-procrastination/GATE_1.md`, com recomendação de observar uso antes da Delivery 4.

## Evidência

| Critérios | Evidência |
|---|---|
| AC-01–03 | Hoje usa as sete ações atuais; Session com zero/dois/seis itens marcados preserva contexto e snapshot, sem marcas persistidas; skip preserva vínculo de Estudo e inicia sem Ritual. |
| AC-04–05 | Cancelar, Escape, troca/reopen/refresh descartam rascunho; falha de gravação preserva abertura e foco para retry sem duplicação. |
| AC-06–07 | E1, ensaio e Start Small passam na regressão; template e dispensa usam o checklist existente de Deep Work. |
| AC-08–09 | Catálogo não muta/semeia coleção; backup antigo/novo, coleção vazia, fallback, offline e reload preservam dados/snapshot. |
| AC-10–11 | Browser desktop/mobile, teclado, labels, foco, 44 px, 360 px e zoom 200%; imagens inspecionadas; manifesto v91, atualização de Service Worker e reabertura offline. |
| AC-12 | Gate 1 responde às seis questões e registra limites da evidência; Delivery 4 não foi implementada. |

`npm run test:all`: 240 testes Node passaram; 384 browser passaram e 24 foram ignorados pela configuração dos projetos, sem falhas. Spec dirigida: 22/22. Sintaxe, fixture e diff: PASS. BUILD_REPORT detalha os comandos, correções de fixture/posição e mapeamento por critério.

## Riscos e lições

- A PWA fisicamente instalada não foi observada; automação verificou Service Worker e offline. Depois de distribuir v91, rollback exige uma geração posterior com armazenamento preservado.
- Não há evidência de uso que demonstre redução de adiamento. Há sobreposição semântica com a preparação de Deep Work; Gate 1 recomenda evitar ampliar opções antes de observar necessidade.
- Catálogo de apresentação torna o preset disponível a instalações antigas sem seeding que reintroduza conteúdo excluído pelo usuário.
- A dispensa explícita precisa ser distinguida do `none` inicial do seletor global; uma flag transitória preserva ambos os contratos sem dado novo.
- Disclosure irmão da configuração evita seletores ambíguos e mantém preparo utilizável ao recolher os ajustes. Os dois disclosures continuam nativos e dispensáveis.

DEFINE, DESIGN e BUILD_REPORT foram mantidos nos caminhos de trabalho e copiados para este arquivo. Os originais não foram removidos. Ship registra o aceite técnico; esta execução segue até a PR, sem merge ou deploy.
