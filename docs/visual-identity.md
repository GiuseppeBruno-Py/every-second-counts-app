# Compasso · Conhecimento com direção

Um espaço pessoal para estudar com concentração, aprofundar leituras e transformar
conhecimento em desenvolvimento de carreira. A identidade combina a calma de um
caderno com a orientação de um atlas.

## Símbolo e fundo

O C aberto do Compasso desenha um percurso de bússola e termina nas páginas de
um livro. A agulha terracota indica o próximo passo. A marca aparece no aplicativo, favicon
e ícones PWA, mantendo a identidade de instalação existente.

O fundo vetorial contém curvas de atlas, livro, bússola e percurso com marcos.
É estático, de baixa opacidade e não captura cliques. Editores e cartões de leitura
permanecem opacos. Não há nova animação ou informação competindo com o estudo.

## Paleta

Os ícones de Hoje, Frentes, Journal e Revisão são desenhos próprios: folha com
direção, atlas de frentes, caderno com margem e ciclo de evidências. Livro aberto,
folha de estudo e degraus de progresso estendem a mesma linguagem aos domínios.
Traços de 1,7px no grid24px, margens de caderno e pequenos marcos dão unidade.
Rótulos permanecem explícitos; os controles de ação mantêm convenções familiares.

| Papel | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| Jade | #156c52 | #96d8b4 | Marca, ações e navegação selecionada |
| Papel | #f6f7f4 | #131c18 | Ambiente de concentração |
| Terracota | #a9502c | #f1b28e | Leitura e marcos |
| Lavanda | #595eb2 | #b6b4f2 | Estudo e foco visível |
| Verde | #246d52 | #90d4ac | Metas e carreira |
| Azul | #336f8b | #9ccadd | Notas e conexões |

Cores são acompanhadas de rótulos e ícones. Texto normal mantém contraste mínimo
4,5:1; foco e limites significativos, 3:1. Os papéis permanecem nos dois temas.
O token legado --violet continua representando o acento de ação; --study define
a lavanda do domínio de estudo.

## Tipografia e composição

Georgia mantém a voz editorial de títulos e marca; fonte do sistema organiza
informações e ações, sem novos downloads. Texto principal 17px equivalentes,
auxiliares 14px, campos16px; escala e composição do Caderno de trabalho preservadas.
A navegação atual Hoje, Frentes, Journal e Revisão permanece.

## Aparência

O botão lua/sol alterna claro/escuro. Em Opções → Aparência, Seguir o sistema
acompanha o dispositivo. A preferência compasso.theme.v1 é local e separada do
conteúdo e dos backups. Falha de armazenamento mantém a escolha na sessão.
A aparência é aplicada antes da pintura e sincronizada entre abas.

## Arquivos e tom

design-system.css concentra tokens, contraste e identidade; theme.js aplica a
preferência; compasso-pattern.svg é o fundo; compasso-icon.svg origina PNG e ICO.
app-manifest.js define geração e assets offline. Nenhum schema de conteúdo muda.

Assinatura: **Conhecimento com direção**. Tom tranquilo e orientado à ação:
**Aprenda com foco. Avance com direção.** Evitar urgência artificial e ruído visual.
