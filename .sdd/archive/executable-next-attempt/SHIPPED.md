# Próximo Passo Executável — Shipped record

**Delivery:** 1 — redução de fricção para iniciar
**Data:** 2026-09-29
**Status:** PASS, arquivado por cópia
**Base:** `origin/main@e8c778d`

## Escopo aceito

Os 12 critérios do DEFINE foram verificados. A pessoa pode usar uma ajuda opcional no editor de Capability para compor uma tentativa pequena com evento contextual opcional, revisar o resultado no campo existente e salvar explicitamente. A criação direta continua disponível. O texto salvo segue Hoje e Session pelo contrato atual. Não foram adicionados campos persistidos, rota, coleção, score, dependência ou integração.

O conjunto real de arquivos corresponde ao manifesto do DESIGN: modelo, interface, CSS estático, geração de cache, testes, documentação e artefatos SDD. Não houve desvio funcional que exija Iterate. O Discovery registra a mudança de baseline após a entrega inicial.

## Evidência de aceitação

| Critérios | Evidência |
|---|---|
| AC-01–05 | Criação direta e assistida, composição pura, campo editável, reaplicação, entrada inválida e campos não aplicados nos testes Node e Playwright. |
| AC-06–08 | Cancelar, Escape, refresh, rollback, retry, Today e snapshot de Session nos testes de navegador. |
| AC-09 | Simulação antes/depois da ajuda, sufixo preservado sem duplicação e limite do compositor. |
| AC-10 | Backup JSON antigo/novo, fallback localStorage e reload offline. |
| AC-11 | Chromium desktop/mobile, labels, foco, teclado, 360 px, zoom 200% e controles tocáveis. |
| AC-12 | Geração do cache v89, manifesto existente e testes de update, cache completo e reabertura offline. |

`npm test`: 234/234. `npm run build:test` e sintaxe: PASS. Spec direcionado: 14/14. Projeto Playwright desktop: 178 aprovados, 7 skips; mobile: 167 aprovados, 17 skips e um caso intermitente preexistente de PiP aprovado no retry. O comando combinado foi interrompido depois do caso 298 sem resumo nem falha reportada; os dois projetos foram repetidos por inteiro separadamente e terminaram com saída 0. `git diff --check`: PASS. Ver BUILD_REPORT para detalhes por critério.

## Riscos residuais e acompanhamento

- A atualização de uma PWA instalada em dispositivo físico não foi observada. Os testes automatizados verificaram ciclo de Service Worker, composição e reabertura offline.
- O caso mobile de PiP apresentou um retry na execução integral. Ele passou e não toca os arquivos desta Delivery; uma causa não foi estabelecida.
- Após a exposição do cache v89, rollback exige geração de cache posterior que preserve IndexedDB, localStorage e backup do usuário.
- Os avisos de duas vulnerabilidades altas em dependências de teste, já vistos no Discovery, não foram alterados nesta Delivery.

## Lições

1. Compor a ajuda diretamente em `nextAttempt.text` manteve ID, snapshot de Session, backup e sincronização sob um único proprietário sem migração.
2. Guardar a assinatura dos campos apenas enquanto o diálogo está aberto permitiu detectar ajuda não aplicada sem criar metadados duráveis ou impedir edição livre da frase final.
3. O painel de simulação já compunha um sufixo no mesmo texto; preservar somente o sufixo conhecido da abertura atual evitou duplicação e deixou alterações manuais sujeitas à validação existente.

DEFINE, DESIGN e BUILD_REPORT foram mantidos em seus caminhos de trabalho. O arquivo usa cópia, sem remoção dos originais. Este fechamento documenta a entrega para revisão; merge e deploy não foram realizados.
