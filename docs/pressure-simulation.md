# Simulação deliberada da próxima tentativa

Em **Frentes → Capacidades**, escolha uma capacidade ativa e toque em **Preparar simulação**. O Compasso abre o editor existente e mostra o campo opcional **Que condição realista você quer acrescentar?**. Escreva uma condição concreta, como “em oito minutos, respondendo duas perguntas”, e toque em **Adicionar à próxima tentativa**. Confira o texto completo, ajuste-o livremente e só então use **Salvar alterações**.

Esse caminho ajuda a aproximar a prática da situação real. Você pode passar de uma explicação sozinho para uma tentativa cronometrada, depois com perguntas ou em uma simulação mais completa, mas não há níveis obrigatórios nem avanço automático. O Compasso não afirma que pressão melhora o resultado; a Evidence posterior é que permitirá avaliar o que aconteceu.

O botão **Adicionar** modifica somente o rascunho visível. Se você digitar uma condição e não a adicionar, o salvamento pedirá que a aplique ou limpe. Cancelar, usar Escape ou recarregar antes de salvar descarta o rascunho. Após o salvamento, a condição faz parte do `nextAttempt.text` existente e o uso pretendido pode ser `simulate`; nenhuma nova estrutura de dados é criada. A Session preserva um snapshot da tentativa como já fazia antes.

Rituals continuam opcionais na configuração da Session e não são escolhidos automaticamente. Backups JSON antigos, IndexedDB, fallback localStorage e a exportação Markdown seguem os contratos existentes. A geração offline passa a `compasso-pages-v87`; após exposição a um PWA instalado, um rollback precisa de uma geração posterior, sem limpar dados do aprendiz.
