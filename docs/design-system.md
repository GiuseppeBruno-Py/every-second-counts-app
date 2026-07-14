# Design system do Compasso

O design system é a camada comum de aparência, responsividade e acessibilidade do aplicativo. Ele não altera dados locais, backups ou integrações: transforma os controles já renderizados em uma experiência coerente.

## Arquitetura

- `design-system-model.js` declara breakpoints, componentes, tokens e papéis.
- `design-system.css` concentra tokens e estilos. Features não devem criar tags `style` em tempo de execução.
- `design-system-feature.js` aprimora componentes existentes e dinâmicos com semântica ARIA, foco, teclado e estados.
- Nenhum framework ou pacote de interface foi adicionado; a solução usa a arquitetura nativa do Compasso e funciona offline.

## Tokens

Os tokens CSS começam com `--ds-`. Use o significado do token, não um valor visual isolado.

| Grupo  | Exemplos                                                    | Uso                                  |
| ------ | ----------------------------------------------------------- | ------------------------------------ |
| Cor    | `--ds-color-surface`, `--ds-color-text`, `--ds-color-focus` | superfícies, texto, bordas e estados |
| Espaço | `--ds-space-1` a `--ds-space-10`                            | margens, preenchimentos e gaps       |
| Tipo   | `--ds-type-caption` a `--ds-type-display`                   | hierarquia tipográfica               |
| Raio   | `--ds-radius-sm` a `--ds-radius-pill`                       | campos, cards, diálogos e badges     |

## Componentes e papéis

O catálogo inclui Button, IconButton, Card, EmptyState, Field, Select, Tabs, Dialog, Drawer, Menu, Badge, Toast e Skeleton. Os controles recebem `data-ds-component` automaticamente, inclusive quando são criados depois do carregamento inicial.

Botões usam `primary`, `secondary`, `neutral`, `destructive` e `link`. Há suporte comum a hover, foco, disabled e loading; sucesso, aviso e erro são tons disponíveis para notificações e validação.

```html
<button data-ds-component="button" data-ds-role="primary">Executar</button>
```

```js
CompassoDesignSystem.setLoading(button, true, "Iniciando sessão");
CompassoDesignSystem.setLoading(button, false);
CompassoDesignSystem.toast("Sessão salva", "success");
```

## Responsividade

- 360 px: uma coluna, alvos de toque de pelo menos 44 px e diálogos longos como sheets.
- 768 px: composição intermediária para tablet.
- 1280 px: grid responsivo e largura de leitura controlada.

Menus respeitam a viewport, grids aceitam conteúdo longo e a página não deve produzir rolagem horizontal global.

## Acessibilidade

- foco visível com contraste reforçado;
- navegação por setas, `Home` e `End` em tabs e menus;
- foco preso em diálogos modais e devolvido ao acionador ao fechar;
- nomes e relações acessíveis em botões de ícone, diálogos e estados;
- `prefers-reduced-motion` reduz animações e `prefers-contrast` reforça bordas e foco.

Ao criar uma feature, prefira HTML semântico e deixe o aprimoramento central adicionar o contrato. Se o controle tiver somente ícone, forneça um `aria-label` específico; o fallback existe apenas como proteção.

## Verificação

Execute `npm test` para validar o contrato declarativo e `npm run test:browser` para os fluxos de teclado, estados, ausência de overflow e snapshots de 360, 768 e 1280 px.
