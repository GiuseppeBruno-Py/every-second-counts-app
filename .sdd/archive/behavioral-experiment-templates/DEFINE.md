# Templates de Experimentos Comportamentais — Define

**Status:** Shipped
**Data:** 2026-10-04
**Base:** origin/main@db3fd07; PR95 mesclada
**Entrega:** 7 do roadmap; usuário pediu continuar até próxima PR em04/10, autorizando avanço após Gate2. Não há nova evidência de uso pessoal nem eficácia demonstrada. Delivery8 fora do escopo.

## Problema, usuário e escopo

O aprendiz precisa formular quatro textos para iniciar um experimento. Oferecer exemplos opcionais de Ambiente, Redução de escopo e Gatilho contextual do roadmap no formulário atual de novo experimento. Textos editáveis; preencher não salva, não altera capacidade/tentativa, não cria Session/Evidence nem diagnostica. Reutilizar coleção/schema/engine atual. Sem templateId persistido, subclasses, telemetria, lembretes ou templates na revisão de resultados. Brainstorm dispensado: demanda/abordagem/usuário explícitos.

Preservar textos preenchidos por padrão; substituí-los somente por escolha explícita. Capacidade e datas nunca são alteradas por template. Períodos mantêm o significado atual, sem promessa científica. Texto de gatilho deve explicar que X/Y precisam ser adaptados. O campo obrigatório de resultado esperado recebe o resultado correspondente à hipótese, como proposta editável.

## Aceite Given/When/Then

| AC | Cenário |
| --- | --- |
|01|Dado novo experimento, ao abrir, ajuda recolhida/opcional; fluxo manual continua funcionando.|
|02|Dado um dos3 templates, ao selecionar e aplicar, quatro textos editáveis recebem exemplo, sem mudar datas/capacidade.|
|03|Dado texto manual, ao aplicar, preservá-lo por padrão; substituir os quatro textos somente com opção explícita, sem alterar outros campos. ID inválido anuncia erro e não altera rascunho.|
|04|Dado template aplicado, somente Salvar cria registro normal schema1; nenhum metadado/subclasse de template e nenhuma alteração em Capability, nextAttempt, Session/Evidence.|
|05|Dado cancelamento/Escape/reload/reabertura, não promover rascunho nem reter escolha; edição/revisão histórica mantêm ajuda oculta e textos existentes.|
|06|Dada falha de save, preservar draft para retry sem duplicar; gravação em voo bloqueia aplicar template/cancelar/reentrada.|
|07|Dado registro criado pelo template, sobreviver reload/backup/restore/offline em IndexedDB/fallback; registros antigos continuam válidos.|
|08|Dado teclado/mobile360px/zoom200%/reduced-motion, disclosure Enter/Space, labels/foco/contraste/alvos44px e palavras legíveis; capturas inspecionadas.|
|09|Dado manifesto atualizado, cache avança e módulos existentes continuam offline; manter Gate2 sem alegar utilidade e encerrar nesta PR antes de8.|

## Clareza e restrições

15/15: problema3 (formulação inicial), usuário3 (aprendiz), objetivo3 (três exemplos opcionais), sucesso3 (AC observáveis), escopo3 (só preencher formulário existente). Sem novos dados/dependências/migração. Defaults reversíveis: ajuda só em criação, preservar campos, checkbox explícito para substituir quatro textos. Templates das skills ausentes no host; convenção e contratos SDD utilizados. Autorização até commit/push/PR/CI; sem merge/deploy.
