<div align="center">
  <img src="./compasso-icon.svg" width="112" alt="Ícone do Compasso" />

  # Compasso

  **Every Second Counts**

  Um sistema pessoal, local-first, para transformar leitura, estudo e metas em progresso visível.

  [![PWA](https://img.shields.io/badge/PWA-instalável-6156c9?style=flat-square)](https://developer.mozilla.org/docs/Web/Progressive_web_apps)
  [![Local First](https://img.shields.io/badge/dados-local--first-33816b?style=flat-square)](#privacidade)
  [![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-252521?style=flat-square)](https://pages.github.com/)

  [Abrir aplicativo](https://giuseppebruno-py.github.io/every-second-counts-app/) · [Funcionalidades](#funcionalidades) · [Executar localmente](#executar-localmente)
</div>

---

## Sobre

O **Compasso** reúne acompanhamento de progresso e gestão de conhecimento em uma única interface inspirada em ferramentas como o Obsidian, mas orientada à execução.

Cada área utiliza uma unidade concreta:

| Área | Unidade de progresso | Exemplo |
| --- | --- | --- |
| Leituras | Páginas | 120 de 300 páginas |
| Estudos | Horas | 4 de 10 horas |
| Metas | Dias | 7 de 30 dias |

O percentual e o restante são calculados automaticamente.

## Funcionalidades

- Dashboard com visão consolidada das frentes ativas.
- Leituras acompanhadas por página atual e total da edição.
- Estudos acompanhados por horas concluídas e planejadas.
- Metas acompanhadas por dias executados e planejados.
- Atlas de notas com pastas e arquivos Markdown.
- Editor dividido entre escrita e visualização.
- Tags, links `[[wikilinks]]` e notas vinculadas a itens de progresso.
- Filtros, busca e estados de andamento.
- Backup e restauração em JSON.
- Instalação como aplicativo PWA.
- Funcionamento offline após o primeiro carregamento.

## Privacidade

O Compasso segue uma abordagem **local-first**:

- O repositório contém somente dados de demonstração genéricos.
- Leituras, notas, estudos e metas ficam no armazenamento local do navegador.
- Nenhum dado pessoal é enviado ao GitHub ou a um servidor externo.
- Backups JSON são exportados apenas quando o usuário solicita.

> Limpar os dados do navegador pode remover o conteúdo local. Exporte backups periodicamente.

## Instalação

1. Abra o [Compasso publicado](https://giuseppebruno-py.github.io/every-second-counts-app/) no Chrome ou Edge.
2. Clique no ícone de instalação exibido na barra de endereço.
3. Confirme **Instalar**.
4. O aplicativo ficará disponível no menu Iniciar e poderá funcionar offline.

Ao migrar de uma instalação local, exporte o backup JSON antigo e importe-o uma única vez no endereço publicado.

## Arquitetura

```text
index.html
├── interface e estilos
├── modelo de progresso
├── editor Markdown
└── persistência local

manifest.webmanifest
└── identidade e instalação PWA

service-worker.js
└── cache e funcionamento offline
```

O projeto não exige framework, banco de dados ou processo de build. A aplicação é entregue como arquivos estáticos pelo GitHub Pages.

## Executar localmente

Clone o repositório e sirva a pasta com qualquer servidor HTTP estático:

```bash
git clone https://github.com/GiuseppeBruno-Py/every-second-counts-app.git
cd every-second-counts-app
python -m http.server 4173
```

Depois acesse:

```text
http://localhost:4173
```

## Atualizações

Novos commits na branch `main` são publicados pelo GitHub Pages. O service worker detecta a nova versão e substitui o cache anterior.

## Roadmap

- Revisão semanal guiada por evidências.
- Métricas de consistência e histórico de sessões.
- Relações visuais entre notas e objetivos.
- Importação e exportação do vault em Markdown.
- Melhorias de acessibilidade e experiência mobile.

---

<div align="center">
  <strong>Compasso</strong><br />
  Direção para o que importa. Consistência em cada segundo.
</div>
