# Start Small — Define

**Delivery:** 2 — compromisso inicial de cinco minutos
**Status:** Shipped
**Prioridade:** P0
**Baseline:** `origin/main@da02a7a` / branch `codex/start-small`
**Origem:** roadmap do usuário, Discovery de redução de fricção e Delivery 1 mesclada na PR #90

## Problema e pessoa

Uma pessoa pode ter uma próxima tentativa concreta em Hoje e ainda evitar iniciá-la por imaginar uma sessão longa. O aplicativo já tem Session normal recuperável, pausa, encerramento e Evidence, mas a duração curta não é uma escolha direta na tentativa principal. A “versão mínima” existente reduz o escopo de uma ação; não representa um compromisso inicial de tempo.

## Resultado e sucesso observável

1. A tentativa principal atual em Hoje oferece **Começar por 5 min** como ação secundária; **Iniciar agora**, ensaio e configuração permanecem disponíveis.
2. Um clique inicia a mesma Session normal, com o mesmo contexto da Capability e um compromisso de cinco minutos. Não há segundo motor de timer nem modalidade de execução.
3. Tempo efetivo, descontadas pausas, chega a cinco minutos e para nesse marco até decisão explícita, inclusive após refresh ou reabertura offline. O restante da Session não começa a contar sozinho.
4. A pessoa escolhe **Continuar sessão**, **Encerrar e registrar** ou **Ajustar tentativa**. Continuar preserva a identidade da Session e retoma o mesmo cronômetro; encerrar usa o fluxo normal de Evidence; ajustar pausa a Session e abre o editor existente da Capability.
5. A Session direta/longa mantém os padrões atuais. Uma Session curta concluída não recebe status inferior, perda de Evidence, ponto, streak ou inferência psicológica.

## Escopo e regras

**Dentro:** tentativa principal válida de Capability em Hoje; início rápido normal; marco de cinco minutos na Session; decisão no companheiro atual; persistência, refresh, offline, backup, rollback, mobile e acessibilidade.

**Fora:** Deep Work, versão mínima, Ritual, Attempt Rehearsal, ações comuns e recursos iniciados fora da tentativa principal; outro timer, rota, alerta remoto, notificação nova, gamificação, classificação de procrastinação ou mudança automática da tentativa.

- A ação curta é opcional. O início direto existente não muda.
- Somente uma Session ativa continua permitida. Um clique concorrente ou referência obsoleta não cria outra Session.
- O marco usa tempo efetivo da Session, não relógio de parede. Pausar antes dos cinco minutos adia o marco.
- Ao atingir o marco, o cronômetro visível permanece em cinco minutos até uma decisão; a escolha pode ser feita depois de fechar/reabrir o aplicativo.
- A decisão é explícita e durável. Falha de escrita restaura o estado anterior e permite retry.
- **Continuar sessão** não troca ID nem cria Session nova. **Encerrar e registrar** usa o encerramento/Evidence atual. **Ajustar tentativa** pausa a Session, preserva seu snapshot e abre a Capability atual para edição.
- Se a Capability da Session não estiver mais ativa/disponível para edição, **Ajustar tentativa** informa a indisponibilidade; continuar e encerrar permanecem possíveis.
- Estado legado sem compromisso curto mantém o comportamento atual. Nenhuma migração destrutiva ou alteração da versão global de estado é permitida.

## Cenários de aceitação

| ID | Dado / Quando / Então |
|---|---|
| AC-01 | Dada uma tentativa principal atual em Hoje, quando a pessoa vê suas ações, então encontra Começar por 5 min como escolha secundária, mantendo Iniciar agora, Ensaiar tentativa e Ajustar sessão; outras ações e estados indisponíveis não recebem o atalho. |
| AC-02 | Dada a escolha curta, quando inicia, então há uma única Session normal e projeção canônica com o mesmo vínculo de Capability/tentativa, identificador estável e compromisso de cinco minutos; a criação só é anunciada após persistência. |
| AC-03 | Dada uma Session curta ativa, quando o tempo efetivo é menor que cinco minutos, então o cronômetro avança normalmente e nenhuma decisão aparece; pausa interrompe o avanço. |
| AC-04 | Dada uma Session curta cujo tempo efetivo alcançou cinco minutos, quando o app está aberto ou reabre após refresh/fechamento, então o tempo fica limitado a cinco minutos e aparecem três decisões explícitas, sem continuação automática. |
| AC-05 | Dada a decisão pendente, quando escolhe Continuar sessão, então a escolha persiste, o mesmo cronômetro segue a partir dos cinco minutos e não reaparece após refresh. |
| AC-06 | Dada a decisão pendente, quando escolhe Encerrar e registrar, então o encerramento existente congela a duração curta, aceita Evidence verificável e usa a mesma Session; cancelar o encerramento mantém a decisão disponível. |
| AC-07 | Dada a decisão pendente e a Capability atual, quando escolhe Ajustar tentativa, então a Session fica pausada de forma durável, o editor atual abre, a alteração exige salvar explicitamente e o snapshot da Session permanece estável. |
| AC-08 | Dada falha ao iniciar ou decidir, quando a gravação falha, então não há sucesso anunciado nem duplicação, o estado durável anterior permanece e a pessoa pode tentar novamente. |
| AC-09 | Dada uma Session normal/longa ou um registro v1, quando passa de cinco minutos, então não há limite nem painel de decisão; pausa, encerramento e histórico preservam os contratos anteriores. |
| AC-10 | Dados backup antigo/novo, IndexedDB/fallback localStorage e modo offline, quando recarrega/restaura a Session curta ou legada, então o marco e a decisão são coerentes e nenhum dado antigo é perdido. |
| AC-11 | Dados desktop, mobile 360–390 px, zoom 200% e teclado, quando o marco aparece e a pessoa decide, então controles, labels, status, foco e alvos de toque permanecem utilizáveis sem overflow global. |
| AC-12 | Dada uma PWA em geração anterior, quando atualiza, então os assets alterados são servidos por uma geração de cache completa e a reabertura offline conserva a Session. |

## Restrições, dependências e riscos

`session-timer-model.js` já calcula tempo efetivo e congela o encerramento; `sessions-feature.js` é dono da Session fonte e do salvamento; `execution-session-model.js` projeta o estado canônico; `session-companion-feature.js` é a superfície visível de execução. Hoje só origina o atalho. A Session fonte precisará distinguir a escolha curta após reload, por isso um marcador opcional e versionado nela é justificado. O modelo global `compasso.state.v3`, coleções, storage e backup permanecem os atuais.

A decisão é uma orientação local do usuário, não uma promessa de que começar se tornará fácil. PWA instalada fisicamente não foi observada pelo Codex; o ciclo automatizado precisa ser verificado e a limitação registrada.

## Clareza

| Dimensão | Nota | Evidência |
|---|---:|---|
| Problema | 3/3 | Roadmap diferencia tarefa concreta de aversão a uma sessão longa. |
| Usuário | 3/3 | Pessoa com tentativa principal atual em Hoje. |
| Objetivos | 3/3 | Atalho, marco efetivo e três decisões explícitas. |
| Sucesso | 3/3 | Doze cenários cobrem fluxo, erro, legado, backup, offline, PWA e acesso. |
| Escopo | 3/3 | Fronteiras com versão mínima, ensaio, Ritual e Deep Work são explícitas. |

**15/15 — Ready for Design.**
