# Próximo Passo Executável

Em **Capacidades**, abra a criação ou edição de uma Capability. Você pode escrever e salvar a **Próxima tentativa** diretamente. Se ela estiver vaga ou grande, abra **Tornar mais fácil de começar** no mesmo editor.

Descreva o menor começo útil, por exemplo “ler 5 páginas”. Se houver um evento claro antes dele, informe esse contexto, por exemplo “tomar café da manhã”. **Usar como próxima tentativa** coloca a frase no campo normal: “Depois de tomar café da manhã, vou ler 5 páginas.” Sem evento, só a ação pequena é usada. Revise e edite o texto livremente antes de **Criar capacidade** ou **Salvar alterações**. Aplicar a ajuda não salva nada por si só.

O caminho usa `learningOutcomes[].nextAttempt.text`; não cria `trigger`, `minimumDose`, outra entidade, score ou histórico de preparação. O ensaio em Hoje continua a preparar *como agir* imediatamente antes da Session; esta ajuda define *o que começar e em qual contexto* ao planejar a tentativa. Rituals preparam as condições do ambiente. A simulação deliberada continua opcional no mesmo editor; quando aplicada no rascunho atual, sua condição é preservada ao usar a ajuda enquanto o sufixo estiver intacto.

Campos auxiliares preenchidos e não aplicados pedem uma decisão antes de salvar: aplicar ou limpar. Cancelar, Escape e refresh antes do salvamento descartam o rascunho; falha de persistência preserva o texto visível para retry sem perder o último registro válido. Tentativas antigas continuam válidas. O texto salvo segue os caminhos existentes de Hoje, Session, Evidence, backup JSON, IndexedDB, fallback localStorage e sincronização opcional já configurada pelo usuário.

O cache offline é controlado por `app-manifest.js`. Esta Delivery avança a geração para `compasso-pages-v89`; a lista de assets já inclui o modelo, a interface e o CSS alterados. Depois de uma PWA instalada receber v89, qualquer rollback precisa publicar uma geração posterior que conserve os dados locais, sem limpar IndexedDB, localStorage ou backups.
