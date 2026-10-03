# Retornos da tentativa ao plano — Shipped

**Status:** R5 locally verified; remote closure tracked in PR #94
**Data:** 2026-10-02
**Branch/base:** codex/attempt-return-context / origin/main@9bb97c3
**Escopo:** Delivery 5 do roadmap; Design R5; 16 arquivos do manifesto.

## Fechamento R4 local (histórico)

AC-01–08: PASS, conforme matriz e resultados do BUILD_REPORT.md preservado neste diretório. npm run test:all exit 0: 255 testes Node PASS, 422 browser PASS, 24 skips existentes, 0 falhas. Browser 16.1m, desktop Chromium e Pixel 7. Checks sintaxe/diff PASS. As capturas desktop/mobile e zoom200% final foram inspecionadas por Codex, incluindo legibilidade dos rótulos e foco. Instalação física PWA e eficácia pessoal não foram verificadas nem alegadas.

Planos explicitamente registrados sustentam observação factual recolhida. Mesmo ID sem versão textual não basta. Três dias anteriores nos últimos 14 dias, hoje planejado, criação posterior à edição e IDs próprios são critérios conservadores. Conclusão, execução (mesmo antiga/interrompida), conflito e ambiguidade suprimem. Nenhum diagnóstico psicológico ou score. Seis atalhos opcionais; nenhuma alteração até confirmação no fluxo existente. Manter como está ignora durante a visita.

Não há schema, coleção, contador ou snapshot novo. Backup/restore e offline passaram em IndexedDB e fallback. Contratos globais de storage/merge/tombstones preservados. Fontes Define/Design/Build mantidas e copiadas com status Shipped; nenhum cleanup destrutivo. Fechamento SDD registra código validado; publicação segue como PR autorizada, sem merge/deploy automático. Próxima etapa é revisar a PR; Delivery 6 fica para outra iteração.

## Riscos e rollback

Execuções/conclusões antigas da mesma identidade e conflitos históricos podem impedir indicação indefinidamente; isso é uma escolha deliberada de falsos negativos. Tentativas editadas podem perder elegibilidade até reunir registros novos. Mudança de relógio/fuso pode tornar datas incoerentes. O trabalho fora do app é desconhecido. Limiar 3/14 não é prova comportamental; observar uso pessoal antes de atribuir benefício ou ampliar escopo. Gate 1 intacto.

Rollback antes de exposição reverte a unidade; depois usar geração futura do cache preservando dados/normalizadores existentes. Sem migração irreversível ou limpeza de storage/caches alheios.

## Lições

- IDs de nextAttempt são estáveis nas edições: cruzar snapshot textual e updatedAt para distinguir versões.
- Não fabricar evidência pelos defaults de normalizeTodayItem; validar campos originais, dias e IDs.
- Ausência de Session sozinha não demonstra adiamento. Execução interrompida é início registrado.
- Session agenda foco no frame; o atalho precisa respeitar o proprietário. Escape do design system recolhe details em background: restaurar apenas origem ainda elegível.
- Navegação pode mostrar vista sem rerender: reavaliar ao voltar para cumprir dismissal por visita.
- scrollWidth com overflow-x:clip não prova legibilidade. Inspecionar capturas e medir palavra/rótulo em zoom; ajustar apenas o contexto que está sendo entregue.
- Registrar runs falhos/interrompidos, corrigir causas e obter exit 0 da suite canônica antes do Ship.

## Reabertura R5 — 2026-10-02

PR #94 permanece aberta. Run remoto 37051428940 revelou duas falhas de legibilidade em zoom no Ubuntu (420 PASS/2 FAIL/24 SKIP). A conclusão R4 acima documenta validação local, não aprovação do CI. AC-07/08 reabertos até correção e revalidação; DEFINE sem mudança. Nenhum dado perdido ou schema alterado. Correção e verificação seguirão Design R5 dentro do manifesto original.

## Checkpoint R5 antes do push

O seletor mobile foi corrigido para prevalecer sobre o padding global do piloto. Teste reforçado para todos os seis rótulos e fonte mais larga reproduziu o defeito antes da correção e passou depois. Node255 PASS e browser focado20 PASS (1.0m), sem novos skips; capturas ampliadas inspecionadas por Codex. Fonte, foco, alvos de toque e dados preservados. A evidência local R5 e os runs falhos estão no BUILD_REPORT.md; artefatos copiados, fontes mantidas.

O fechamento remoto depende de npm run test:all verde no head corrigido em Ubuntu/Node22. A [PR #94](https://github.com/GiuseppeBruno-Py/every-second-counts-app/pull/94) registrará run/SHA/resultado e a conclusão desse gate após execução. Este checkpoint não alega aprovação antecipada. Nenhuma migração, merge ou deploy.

Lições adicionais: seletores :is contendo IDs participam da prioridade do CSS; conferir estilos efetivos, além de posição no arquivo. Um PASS com fonte do Windows não cobre métricas Ubuntu; verificar largura de cada palavra e incluir uma fonte genérica mais larga para reproduzir a regressão localmente.
