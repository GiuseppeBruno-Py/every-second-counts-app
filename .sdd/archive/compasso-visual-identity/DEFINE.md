# DEFINE: Identidade Compasso e aparência
Status: Shipped · 2026-10-07 · clareza 14/15 · verificação no BUILD_REPORT e SHIPPED arquivados

## Problema e autorização
O usuário pediu uma interface clean, identidade coerente com estudo, carreira,
leitura e concentração, temas claro/escuro e depois “suba essa pr”.
A implementação visual anterior está numa base 193 commits atrasada; esta
adaptação parte de origin/main f6fe73f, na branch codex/compasso-visual-identity,
sem copiar a arquitetura antiga ou alterar o checkout do usuário.
Brainstorm dispensado: público, finalidade e direção já foram explicitados.

## Relação com trabalho existente
Extensão aditiva da apresentação Caderno de trabalho, descrita em
.sdd/features/full-visual-revamp/DEFINE.md e docs/design-system.md.
Não reinicia nem altera evidências históricas. O pedido atual autoriza a nova
preferência de aparência antes excluída daquele revamp.

## Requisitos e critérios
- R1: Identidade jade, livro e bússola; fundo sutil estático e superfícies de leitura opacas.
  Revisão1.1: usuário considerou os ícones genéricos; marca e ícones de navegação/
  domínios devem usar desenhos próprios, mantendo reconhecimento e significado.
- R2: Alternar claro/escuro por controle acessível; seguir sistema como padrão e opção.
- R3: Preferência local persiste, sincroniza abas e funciona na sessão com armazenamento bloqueado.
- R4: Todas as áreas atuais continuam acessíveis, com mesmos dados, ações e navegação.
- R5: Texto normal >=4.5:1; foco >=3:1; alvos >=44px; sem overflow a 360px ou escala 200%;
  respeitar reduced-motion e forced-colors; manter texto principal 17px, auxiliares14px e campos16px.
- R6: Identidade e temas disponíveis no shell offline e após reload, com geração no manifesto.

## Aceitação Given/When/Then
A1: Dada a interface atual, quando abre, então a marca e o fundo comunicam direção
e conhecimento sem textura nos editores ou novas tarefas/CTAs.
A2: Dado tema claro, quando ativa o botão por teclado, então tema escuro e nome
acessível mudam; reload mantém a escolha e outra aba recebe a preferência.
A3: Dada opção Sistema, quando o sistema muda, então aparência acompanha; escolha
explícita permanece independente. Valor inválido volta ao sistema.
A4: Dado armazenamento bloqueado, quando alterna, então aparência funciona sem
interromper o bootstrap. Nenhum conteúdo do usuário é apagado.
A5: Dadas rotas e diálogos atuais, quando usados nos dois temas e tamanhos
360/768/1280, então leitura, foco e controles permanecem utilizáveis.
A6: Dado shell cacheado, quando offline e recarrega, então abre e tema permanece.

## Escopo e limites
Inclui tokens estáticos, marca, ícones PWA, fundo vetorial, controles de aparência,
bootstrap precoce, assets offline e testes/documentação correspondentes.
Exclui alteração de modelo, schema, navegação, histórico, armazenamento de conteúdo,
sincronização, novas funções, merge ou deploy. A preferência local não integra backup.
Sem dependências de produção, fonte externa nova ou serviço remoto.
Instalação física de PWA não é critério desta adaptação; não será alegada por automação.

## Erros, suposições e riscos
Storage pode lançar exceção: escolha funciona na sessão. Valor desconhecido usa
sistema. Geometria e tipografia do revamp atual são contratos preservados.
Paleta escolhida pelo agente dentro da direção solicitada; contraste medido.
Snapshots variam por plataforma: revisar cada baseline renderizada antes de aceitar.

## Clareza
Problema3: interface/identidade expressamente pedidos.
Usuários2: uso pessoal de estudo e carreira inferido do produto.
Metas3: foco, coerência, vida e tema explicitados.
Sucesso3: critérios de leitura e navegação do repositório complementam o pedido.
Escopo3: identidade/aparência e PR autorizadas; funções atuais preservadas.
Total14/15.
