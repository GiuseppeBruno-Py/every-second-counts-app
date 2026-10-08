# DESIGN: Identidade Compasso e aparência
Status: Shipped · revisão1.6 · 2026-10-07 · correção de evidência A5 validada em Chromium
Define: DEFINE.md, clareza14/15. Autorização: pedidos visuais e “suba essa pr”.

## Inspeção e base
Worktree limpo C:/Users/Giuse/.codex/worktrees/compasso-visual-identity/every-second-counts-app,
branch codex/compasso-visual-identity, HEAD f6fe73f. AGENTS.md raiz é aplicável;
não há .codegraph nesta cópia. Inspecionados README, docs/design-system.md,
index, design-system CSS/model/feature, manifesto/composição/SW, scripts de fixture,
package.json, Playwright config, CI e SDD core/full-visual-revamp.
Nenhum diff sobreposto: cópia inicialmente limpa; checkout original preservado.
Templates referidos pelas skills não existem na instalação; conteúdo obrigatório
dos contratos aplicado diretamente.

## Decisões e responsabilidades
Manter o design system atual e tamanho de leitura. Tokens de aparência em
design-system.css com especificidade superior aos tokens inline/legados;
piloto herda a mesma paleta. Jade é acento de ação, terracota/lavanda/azul
identificam domínios. Não portar interface.css antigo nem restaurar Overview.
theme.js aplica dataset antes da pintura e liga controles sem infraestrutura de
feature paralela. Única preferência local compasso.theme.v1, light/dark/system.
Sistema é padrão (ausência/valor inválido); exceções de storage não impedem uso.
Meta theme-color e nome acessível acompanham tema; storage events sincronizam abas.
Novo script e padrão entram nos assets/prerequisites do manifesto; cache avança
v96 para v97. SW e composição não são reescritos.
Ícone livro/bússola e fundo mascarado estático usam assets locais, sem rede.
Na navegação atual preservar Hoje/Frentes/Journal/Revisão e todos os destinos.
Cor de nós do grafo usa variáveis CSS para acompanhar os dois temas.

## Fluxos e contratos
Inicialização: ler preferência com try/catch -> resolver sistema -> aplicar
data-theme, color-scheme, meta -> DOMContentLoaded liga botão e select.
Toggle escolhe explicitamente tema oposto; select permite voltar ao sistema.
Evento de sistema só afeta preferência system; storage faz reconciliação.
Nenhum schema, backup, coleção ou persistência de conteúdo muda.
Em falha de storage permanece em memória. Não logar conteúdo.

## Manifesto de arquivos (ordem, ação, dependência e cobertura)
1. theme.js (criar): bootstrap/controles; index; A2-A4,A6.
2. compasso-icon.svg, compasso-icon-192.png, compasso-icon-512.png, compasso.ico
   (modificar) e compasso-pattern.svg (criar): marca/assets; nenhum; A1,A6.
3. design-system.css (modificar): tokens/fundo/superfícies nos temas;2; A1,A5.
   design-system-feature.js (modificar): posicionar menu sob topbar/acionador
   com geometria real, via custom properties;3; A2,A5.
4. index.html (modificar): script precoce, marca, controles e título;1-3; A1-A4.
   information-architecture-model.js (modificar): nomes de quatro símbolos
   exclusivos de navegação, sem alterar rotas/níveis/ordem;4; A1,A4.
5. knowledge-graph-feature.js (modificar): quatro cores semânticas CSS;3; A5.
   session-companion-feature.js (modificar): copiar tema à janela PiP existente;
   1,3; A5. Atualização usa o tick atual, sem nova infraestrutura ou observador.
6. manifest.webmanifest, app-manifest.js (modificar): identidade/PWA/cache/prerequisites;1-5; A6.
7. docs/visual-identity.md (criar), docs/design-system.md e README.md (modificar):
   contratos atuais e direção visual;1-6; A1-A6.
8. tests/app-manifest.test.js (modificar): cache e prerequisite de aparência;6; A6.
   tests/browser/visual-identity-flows.spec.js (criar): preferência, teclado, abas,
   sistema, bloqueio, contraste, rotas, geometria e offline;1-6; A1-A6.
9. tests/browser/design-system-flows.spec.js-snapshots/design-system-*-chromium-{win32,linux}.png
   (modificar só renderizados/revisados): aparência intencional;3-4; A1,A5.
10. .sdd/features/compasso-visual-identity/{DEFINE,DESIGN}.md,
    .sdd/reports/compasso-visual-identity/BUILD_REPORT.md,
    .sdd/archive/compasso-visual-identity/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md
    (criar/atualizar): gate/evidência/fechamento; todos; A1-A6.

## Verificação e gate
Revisão1.6: Chromium local revelou race no mock PiP: URL sob controle do SW
carregou o aplicativo na janela de teste e substituiu o documento PiP.
A simulação deve retornar about:blank de mesma origem, como um documento vazio,
sem navegação de shell. Manter asserções de tema,controle de retorno e sessão.
Somente visual-identity-flows.spec.js; módulo PiP/SW e teste histórico intactos.

Revisão1.5 (Iterate, correção de evidência): CI37697016850 terminou com
492 pass,25 skip,1 fail na expectativa de outline após focus() programático.
Classificação: modifying, somente procedimento do teste A5; requisitos e
apresentação permanecem. Testar navegação real Shift+Tab de Opções para Tema,
confirmar elemento focado, :focus-visible e outline3px. Não tornar foco por mouse
equivalente a teclado nem reduzir a expectativa. Reproduzir com Chromium nativo,
validar visual-identity local e CI Linux canônica. Nenhum novo arquivo de runtime.
Evidência local histórica preservada; A5 foi reaberto até a prova do procedimento
corrigido. Reprodução antes/depois no Chromium nativo: antes1 fail (outline0px),
depois11 pass/1 skip/0 retry no arquivo completo. A5 restabelecido por teclado
real; confirmação Linux da CI canônica será acompanhada na PR, sem antecipar
seu resultado. A1–A4,A6 não mudam; DEFINE permanece histórico.

npm test: contratos/modelos; npm run build:test: composição/cache de fixtures.
Playwright visual-identity, design-system, core/full-visual e pwa-lifecycle:
comportamento e contraste nos temas, menus/foco/layout e offline.
npm run test:all: regressões proporcionais de UI/PWA.
Screenshots locais em ambos temas e mobile revisadas; Linux via workflow_dispatch
existente quando necessário, revisar artefatos antes de atualizar baseline.
A1 screenshots + leitura opaca; A2-A4 testes de preferência; A5 matriz de rotas
e tokens de contraste; A6 offline/bootstrap/cache.
Sem lint/format/typecheck separado configurado.

## Compatibilidade, rollout, rollback e impactos

Revisão1.3 (Iterate): novo feedback explícito “achei genérico os ícones”.
Refinar símbolo e criar família vetorial própria para quatro áreas e domínios.
Utilitários preservam convenções de ação; dimensões, labels e rotas permanecem.
Assets finais exigem novo render/revisão de snapshots e checks visuais; evidência
anterior de aparência não fecha A1. Contratos funcionais inalterados continuam
válidos, complementados por verificação de símbolos sem referências ausentes.
Revisão1.4: revisão das capturas nativas Linux identificou labels da navegação
móvel quebrando em duas linhas. Ajustar padding horizontal e impedir quebra
dos quatro labels, preservando fonte14px e targets44px. Re-render em Linux.

Revisão1.1 (Iterate): inspeção encontrou que o documento PiP possui raiz própria;
incluído espelhamento de aparência inicial e no update existente, mais teste
de popup simulado. Sem alteração de sessão, notificações ou comportamento PiP.
Revisão1.2 (Iterate): durante validação móvel, a topbar com controles adicionais
podia quebrar em duas linhas e o menu fixo interceptava seu acionador.
A topbar passa a ter altura automática no celular; o aprimorador existente
posiciona o menu abaixo da geometria real do header e limita sua altura.
Inclui ancoragem fixa do menu abaixo da topbar e limite
de altura rolável; nenhum item, ação ou significado de navegação foi alterado.
Mesma identidade PWA, start_url/scope/shortcuts. Nenhuma migração de conteúdo.
CSS e svg pequenos; padrão estático pointer-events:none, sem animação.
Sem telemetria, rede nova ou permissões. Gravação de aparência só no dispositivo.
Rollback deve restaurar CSS/assets/script e avançar geração para clientes
controlados, sem apagar dados. PR apenas; merge/deploy seguem autorização separada.
