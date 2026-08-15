# Evidências de sessão

## Projeção histórica de uso

Quando a execução canônica contém `learningContext.futureUse`, a Evidence pode apresentar **Uso na execução: {rótulo}** como projeção histórica. A leitura segue exclusivamente `Evidence.sessionId → executionSession.learningContext`; ela não consulta o valor atual da capacidade e não adiciona `futureUse` ou `learningContext` ao registro de Evidence. Contexto canônico ausente, inválido ou legado apenas omite essa linha.

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
- Evidências já salvas podem ter tipo, síntese, detalhes, data e sessão vinculada corrigidos diretamente no histórico ou na Revisão semanal.
- Uma correção preserva o `id`, registra `updatedAt`/`editedAt` e recebe o selo **Editado**.
- Excluir apenas a evidência exige confirmação, preserva a sessão e cria um tombstone para impedir que uma cópia antiga do Drive reapareça.
- Excluir uma sessão também exclui suas evidências vinculadas.
- Evidências entram no backup JSON e permanecem disponíveis offline.

## Continuação após a sessão

Depois que Session/Deep Work e Evidence são persistidos, `execution:recorded` abre um painel efêmero e não modal. O foco vai para o título somente após o sucesso. O painel oferece **Voltar para Hoje**, **Registrar sinal** apenas quando existe capacidade ativa e **Abrir capacidade** quando a referência continua disponível. Ele não sobrevive ao refresh e não representa um novo registro de jornada.

**Registrar sinal** reutiliza o diálogo e a persistência existentes de `learningSignals`. Uma síntese útil de Evidence pode aparecer como sugestão editável, com proveniência visível; sem texto útil, o formulário abre vazio. Cancelar não cria registro nem tombstone. Somente **Salvar sinal** cria o sinal com origem `learner` ou `confirmed-suggestion`. Falha de sinal mantém Session/Evidence já salvas, conserva o texto para nova tentativa e não anuncia sucesso.

Evidence continua sem `learningContext`: o contexto é resolvido exclusivamente pelo `sessionId` canônico. Sessões/Evidence legadas sem vínculo continuam válidas, sem ação de sinal de capacidade e sem associação inferida. Nenhuma continuação conclui Hoje, altera a capacidade ou muda a próxima tentativa.

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
  createdAt,
  updatedAt,
  editedAt
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

## Correções e sincronização

As correções são aplicadas ao registro-fonte e os painéis de Consistência, Revisão semanal e Resultados refazem os agregados no render seguinte. A exclusão independente usa `_sync.tombstones['evidence:<id>']`, portanto um merge com uma versão remota anterior não ressuscita a evidência removida.

## Fora do escopo

- anexar arquivos ou imagens;
- transformar evidência em nota automaticamente;
- busca global por evidências;
- relatórios agregados;
- revisão espaçada automática.
