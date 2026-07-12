# Importação e exportação do vault em Markdown

## Objetivo

Permitir que o Atlas pessoal do Compasso seja portátil e interoperável. As notas podem ser abertas em ferramentas como Obsidian, VS Code ou qualquer editor Markdown e depois importadas de volta, preservando a estrutura e os relacionamentos sempre que possível.

## Formas de exportação

### ZIP Markdown

Disponível em todos os navegadores suportados.

O arquivo usa o nome:

```text
compasso-vault-AAAA-MM-DD.zip
```

O ZIP contém:

- uma pasta para cada pasta do Atlas;
- um arquivo `.md` para cada nota;
- `.compasso/manifest.json`;
- `.compasso/README.md`.

O ZIP é criado localmente, sem biblioteca externa e sem envio para servidor.

### Exportação direta para pasta

Quando o navegador fornece a File System Access API, o usuário pode escolher uma pasta e gravar o vault diretamente nela.

Essa opção:

- cria pastas ausentes;
- cria ou substitui arquivos com o mesmo caminho;
- não remove arquivos antigos que já existam na pasta escolhida;
- pode não estar disponível em todos os navegadores ou dispositivos móveis.

## Markdown interoperável

O conteúdo das notas é exportado sem transformação. Isso preserva:

- títulos e seções Markdown;
- listas e checklists;
- blocos de código;
- `[[wikilinks]]`;
- frontmatter já escrito pelo usuário;
- qualquer sintaxe Markdown desconhecida pelo Compasso.

Os nomes incompatíveis com sistemas de arquivos são normalizados apenas no caminho exportado. O título original continua preservado no manifesto.

## Manifesto Compasso

O arquivo `.compasso/manifest.json` é opcional para ferramentas externas, mas permite um round-trip mais preciso ao retornar ao Compasso.

Estrutura resumida:

```json
{
  "schemaVersion": 1,
  "app": "Compasso",
  "exportedAt": "2026-07-12T00:00:00.000Z",
  "folders": [
    {
      "id": "f-study",
      "path": "02 · Estudos",
      "name": "02 · Estudos",
      "parentId": null,
      "parentPath": null,
      "domain": "study"
    }
  ],
  "notes": [
    {
      "path": "02 · Estudos/Spark.md",
      "id": "n-example",
      "title": "Spark",
      "folderId": "f-study",
      "domain": "study",
      "linkedItemId": "s-example",
      "linkedItemTitle": "Curso Spark",
      "tags": ["spark"],
      "updated": "2026-07-12"
    }
  ]
}
```

O manifesto preserva:

- IDs de notas e pastas;
- nomes originais;
- hierarquia de pastas, incluindo pastas vazias;
- domínio da nota;
- tags;
- datas;
- vínculo com leitura, estudo ou meta.

## Formas de importação

### ZIP

O importador aceita:

- ZIPs criados pelo Compasso;
- ZIPs comuns contendo arquivos Markdown;
- entradas ZIP sem compressão;
- entradas ZIP Deflate quando o navegador fornece `DecompressionStream`.

ZIP64, arquivos criptografados e outros métodos de compressão não fazem parte desta versão.

### Pasta

O usuário pode selecionar uma pasta completa usando um input de diretório. A hierarquia relativa dos arquivos é usada para reconstruir o Atlas.

### Frontmatter externo

Quando não existe manifesto, o Compasso tenta reconhecer frontmatter YAML básico:

- `title`;
- `tags` ou `tag`;
- `updated`;
- `domain`;
- `compasso_id`;
- `compasso_domain`;
- `compasso_linked_item_id`;
- `compasso_linked_item_title`.

O frontmatter continua dentro do conteúdo da nota; ele é apenas lido para inferir metadados.

## Análise prévia

Selecionar um ZIP ou uma pasta não altera os dados imediatamente.

A tela de prévia mostra:

- fonte selecionada;
- quantidade de notas;
- quantidade de pastas;
- quantidade de tags;
- quantidade de wikilinks;
- presença ou ausência do manifesto Compasso;
- avisos de compatibilidade.

A importação só acontece quando o usuário toca em **Aplicar importação**.

## Estratégias

### Mesclar

Estratégia padrão e mais segura.

1. Procura correspondência pelo ID do manifesto.
2. Se não encontrar, procura pelo título dentro da mesma pasta.
3. Atualiza correspondências.
4. Adiciona novas notas e pastas.
5. Não remove conteúdo que não esteja no vault importado.

### Importar como cópias

- cria uma pasta raiz `Importado · DD/MM/AAAA`;
- reproduz toda a hierarquia dentro dela;
- gera novos IDs;
- não altera notas existentes.

### Substituir o Atlas

- exige confirmação adicional;
- remove somente notas e pastas atuais;
- mantém leituras, estudos, metas, sessões, evidências e revisões;
- reconstrói o Atlas usando o vault selecionado.

## Resolução de vínculos

Uma nota vinculada a uma leitura, estudo ou meta é reconectada:

1. pelo `linkedItemId`, quando ainda existe;
2. pelo título do item dentro do mesmo domínio;
3. caso nenhum item seja encontrado, a nota é importada sem vínculo.

Os `[[wikilinks]]` não precisam de tratamento especial porque permanecem no conteúdo Markdown.

## Limites de segurança

- no máximo 2.500 arquivos;
- no máximo 80 MB no ZIP recebido;
- no máximo 80 MB de conteúdo descompactado;
- arquivos fora de Markdown e do manifesto são ignorados;
- diretórios `__MACOSX` são ignorados;
- nenhuma informação é enviada para servidor.

## Validação realizada

- validação sintática do módulo com `node --check`;
- criação de ZIP sem dependências externas;
- validação da estrutura do ZIP por ferramenta independente;
- validação de CRC;
- validação de nomes UTF-8;
- validação de conteúdo Markdown e manifesto;
- revisão de merge, cópia e substituição;
- preservação de pastas vazias presentes no manifesto;
- integração ao app shell offline.

## Validação manual recomendada

1. criar pastas, subpastas e notas com tags e wikilinks;
2. deixar uma pasta vazia;
3. exportar o ZIP;
4. abrir o ZIP em um gerenciador de arquivos;
5. abrir a pasta como vault no Obsidian;
6. editar uma nota externamente;
7. importar o ZIP ou a pasta usando **Mesclar**;
8. confirmar atualização e preservação das relações;
9. repetir usando **Importar como cópias**;
10. testar **Substituir o Atlas** somente após gerar backup;
11. fechar o PWA, reabrir e repetir o fluxo offline.
