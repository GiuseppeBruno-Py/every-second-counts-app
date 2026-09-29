# Start Small — Começar por 5 min

Quando a próxima tentativa de uma Capability é a ação principal em **Hoje**, **Começar por 5 min** inicia uma Session normal com um compromisso inicial curto. **Iniciar agora** continua disponível para uma Session sem esse marco. A versão mínima continua a representar o escopo de uma ação, não sua duração.

O cronômetro conta tempo efetivo e desconta pausas. Ao chegar a cinco minutos, o tempo fica nesse marco até a pessoa escolher no companheiro: **Continuar sessão** retoma o mesmo relógio; **Encerrar e registrar** usa o formulário normal e permite Evidence; **Ajustar tentativa** pausa a Session e abre o editor da Capability. A frase ajustada só muda após salvar. O snapshot da Session já iniciada continua descrevendo a tentativa com que ela começou.

O marco também aparece depois de recarregar ou reabrir o aplicativo offline. Espera além de cinco minutos não é contabilizada quando a pessoa decide continuar. Cancelar o encerramento devolve a escolha. Se a Capability atual não estiver mais disponível, o ajuste informa isso e as opções de continuar e encerrar seguem disponíveis.

O marcador opcional `startSmall` pertence à fonte `sessions[]` v2. A projeção canônica usa `plannedMinutes: 5`, campo já existente, e não cria outra Session. Fontes v1 e Sessions v2 iniciadas normalmente permanecem ilimitadas. Backup JSON e fallback localStorage transportam o marcador pela coleção existente; não há mudança na versão global de estado, nova coleção, sincronização, score ou telemetria.

`app-manifest.js` controla o cache e foi avançado para `compasso-pages-v90`. Os assets alterados já pertencem à composição atual. Após uma PWA instalada receber v90, rollback requer uma geração posterior sem limpar armazenamento ou backups do usuário. A atualização em uma instalação física deve ser verificada separadamente; testes automatizados cobrem o ciclo de Service Worker e a reabertura offline.
