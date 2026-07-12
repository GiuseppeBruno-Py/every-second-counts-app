# Evidências de sessão

## Objetivo

Transformar tempo investido em registro verificável. Ao encerrar uma sessão de leitura ou estudo, o usuário registra uma evidência curta do que foi compreendido, produzido, praticado, decidido ou questionado.

## Campos

| Campo | Regra |
| --- | --- |
| Tipo | Insight, nota produzida, exercício/prática, decisão, pergunta aberta ou entrega concreta |
| Síntese | Obrigatória, curta e verificável |
| Detalhe | Opcional, usado para contexto, referência ou continuidade |

## Comportamento

- A evidência é criada apenas quando a sessão é concluída com sucesso.
- Cada evidência fica vinculada ao `sessionId`, `itemId` e domínio.
- O histórico da sessão mostra a evidência logo abaixo do registro de duração e progresso.
- O botão **Histórico** exibe um contador com o total de evidências do item.
- Excluir uma sessão também exclui suas evidências vinculadas.
- Evidências entram no backup JSON e permanecem disponíveis offline.

## Modelo de dados

```javascript
{
  id,
  schemaVersion,
  sessionId,
  itemId,
  domain,
  type,
  summary,
  details,
  createdAt
}
```

## Exemplos de boa evidência

- `Reconstruí a tese do capítulo em três premissas.`
- `Implementei e testei o exercício de particionamento.`
- `Decidi substituir a abordagem atual por uma fila idempotente.`
- `Ficou aberta a pergunta sobre o custo de shuffle em grande escala.`

## Critérios de aceite

1. Encerrar sessão exige uma síntese curta.
2. A evidência aparece imediatamente no histórico.
3. O contador do item é atualizado sem recarregar.
4. Evidências persistem após fechar e abrir o PWA.
5. Backup exportado contém o array `evidence`.
6. Excluir a sessão remove a evidência correspondente.
7. O recurso funciona offline.

## Fora do escopo

- anexar arquivos ou imagens;
- transformar evidência em nota automaticamente;
- editar evidências já salvas;
- busca global por evidências;
- relatórios agregados;
- revisão espaçada automática.
