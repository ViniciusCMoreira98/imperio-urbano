# Cartas de evento — versão vigente v5 (identidade brasileira)

## Aluguel Zero — uso automático (07/11/2026)

**Decisão vigente do usuário; substitui a proposta de uso manual abaixo.** A carta fica guardada e é consumida automaticamente quando o jogador cair na PRIMEIRA propriedade de adversário após recebê-la, isentando o aluguel daquela chegada. Não há botão Usar, confirmação, recusa ou escolha de quando gastar. Passar pela casa não ativa; casas livres/próprias não são o gatilho. Consumir só uma unidade por chegada, mesmo com várias guardadas. O critério é a primeira propriedade adversária; não acrescentar uma condição de saldo ou cobrança positiva por conta própria.

Texto vigente: “Na próxima propriedade adversária, você não paga aluguel. Uso automático e único.” `events.json` indica activation=automatic-on-opponent-property. O componente manual RentWaiverItemButton foi substituído por `event-art/RentWaiverItemIndicator.tsx`, somente quantity e role=status, sem callbacks/foco/ação de clique. Mostra “Automático · uso único”; desaparece com quantidade zero. A carta de revelação continua passiva e a arte foi preservada. Passe Livre do Descanso continua com a regra manual anterior; esta mudança é somente Aluguel Zero.

**Para Claude:** integrar gatilho e consumo no servidor durante a resolução da chegada adversária, ANTES de RentPaid/dívida, em operação atômica e idempotente. Não abrir a janela de decisão sugerida no histórico manual. Snapshot/eventos informam consumo/quantidade e isenção da cobrança; frontend apenas apresenta. Não emitir débito nem crédito ao proprietário por esse aluguel; não muda dono, construções ou aluguel futuro. Os comandos/serviços de inventário ainda precisam de implementação; o kit não executa cobrança/consumo real. Prévia `?event=aluguel-zero` e `?item=rent`, roteiro de QA atualizado para conferir ausência de controles e nenhuma ação ao clicar.


## Histórico substituído — Aluguel Zero manual (07/11/2026)

**Arte e apresentação entregues localmente na develop_arte_3d, base e02c2d5.** Pedido do usuário: carta de uso único que pode ser usada ao parar numa casa adversária para não pagar. Carta proposta: **Aluguel Zero**. Texto: “Guarde esta carta. Use ao cair em uma propriedade adversária para não pagar o aluguel. Uso único.” Cancelar só o aluguel daquela chegada, consumir uma unidade e manter o estado pertencendo ao dono; não é apagão nem isenção permanente. ID visual `aluguel-zero`, item proposto `rent-waiver-pass`, uma unidade ao receber a carta.

Ilustração original azul/dourada: vale com escudo, casa e moeda riscada. Sem referência externa ou pessoa real. Asset `apps/web/src/event-art/art/aluguel-zero-v1.webp` (1280×853, 292.842 bytes). Fonte PNG e prompt/manifesto em `assets/eventos/`. image_gen integrado; zero créditos Meshy. Componente de evento continua passivo e sem botões.

Ação do inventário: `event-art/RentWaiverItemButton.tsx`, props quantity/canUse/pending/onUse; usa o estilo compartilhado dos itens, azul neste passe. Some com quantity≤0 e bloqueia fora da elegibilidade ou durante resposta. Callback não altera quantidade, dinheiro ou aluguel. Prévia da carta: `/scripts/assets/event-modals-preview/?event=aluguel-zero`; item: `?item=rent`. Kit agora com nove cartas. QA: 36 combinações, texto e encaixe, ausência de controles na carta; ambos os itens com callback, bloqueio, quantidade zero e pendência conferidos. Build/TypeScript aprovados. Capturas/relatório em `assets/3d/reviews/event-modals/`.

**Para Claude — integrar regra e persistência:** cadastrar a nona carta e concessão do item por jogador no motor/snapshot. A cobrança hoje é automática (RentPaid/dívida); abrir janela de decisão ANTES do débito, tanto com saldo suficiente quanto insuficiente, para poder usar ou recusar o item. Validar turno/jogador, item e cobrança positiva da chegada atual a propriedade adversária. Uso e consumo devem ser atômicos/idempotentes; não debitar o visitante nem creditar o proprietário/banco quando isento. A isenção vale para o aluguel calculado daquela chegada, inclusive construções/bônus olímpico; não muda dono, construções ou aluguéis futuros. Não usar para taxa, eventos ou dívida antiga já resolvida; não consumir se não há aluguel devido (livre, própria, apagão). Não aplicar estorno de um RentPaid já confirmado nem inventário otimista. Timeout/recusa deve manter a cobrança normal conforme regra oficial. A carta de evento só concede o item; uso é decisão posterior do jogador. Nenhum backend/comando real foi implementado no kit. Sem commit/merge nesta entrega.


## Passe Livre — carta de item guardável (07/11/2026)

**Arte e apresentação entregues localmente na develop_arte_3d, base e02c2d5.** Pedido do usuário: carta de evento que vira item utilizável para sair do Descanso. Proposta adotada: Passe Livre de uso único; ao receber, guardar; no seu turno enquanto estiver no Descanso, usar para não perder a vez. Texto da carta: “Guarde esta carta. Use para sair do Descanso sem perder a vez.” O uso consome uma unidade. ID visual `passe-livre`, item proposto `rest-exit-pass`, concessão de uma unidade por carta.

Arte original sem imagem de referência: passe verde/dourado com cadeira de praia e seta de saída, rede/portão aberto ao fundo. Asset `apps/web/src/event-art/art/passe-livre-v1.webp` (1280×853, 311.828 bytes). Fonte PNG, prompt integral e manifesto em `assets/eventos/passe-livre-*` e `source/passe-livre-v1.png`. image_gen integrado; zero Meshy/créditos.

`EventNotificationCard` continua passivo, sem botão/timer/backdrop. A ação fica no componente separado `event-art/RestExitItemButton.tsx`: props quantity, canUse, pending, onUse. Não aparece com quantity≤0; bloqueado fora da elegibilidade ou aguardando resposta; onUse é apenas callback. Prévia da carta: `/scripts/assets/event-modals-preview/?event=passe-livre`; item: `?item=rest`. Oito cartas × quatro telas (32 combinações) aprovadas, além de callback, bloqueio, inventário vazio e espera do item; build/TypeScript aprovados. Capturas em `assets/3d/reviews/event-modals/`.

**Para Claude — funcionalidade de servidor pendente:** cadastrar a oitava carta no catálogo/motor; conceder e persistir o item por jogador, publicar quantidade e elegibilidade no snapshot e ligar a ação do HUD ao comando oficial. Validar dono, turno, fase, Descanso e quantidade. Consumir uma unidade e remover a penalidade do Descanso atomicamente, com comando idempotente; sem desconto otimista local, preservar quantidade se falhar. Garantir uma janela de uso ANTES de aplicar automaticamente RestTurnLost, para o jogador conseguir escolher o item. O passe não escolhe destino, não teleporta nem dá dinheiro: libera a jogada normal. Não acrescentar troca/venda/uso em oponente ou acionar automaticamente ao ganhar. As regras atuais de REST/skipTurns devem ser preservadas fora do comando. A prévia não é inventário real e não implementa o comando. Sem commit/merge nesta entrega.


## Descanso merecido — piso corrigido v2 (07/11/2026)

O usuário esclareceu que o desalinhamento era no piso da ilustração do Descanso. A edição corrigiu a base de concreto para um plano contínuo, com espessura/borda e junção com a parede coerentes. Personagem, pose, luvas, estilo e texto preservados. Asset vigente: `apps/web/src/event-art/art/descanso-merecido-v2.webp`, 1280×853, 285.136 bytes. Componente e registro da carta já usam v2. Fonte em `assets/eventos/source/descanso-merecido-v2.png`, prompt integral em `assets/eventos/descanso-merecido-v2-prompt.json`, manifesto vigente `descanso-merecido-manifest.json`. V1 e seu manifesto preservados como histórico. Edição pelo image_gen integrado, zero créditos Meshy. Nenhuma alteração no movimento/regras; integração da sétima carta permanece com a engenharia.


## Acréscimo de 07/11/2026: Descanso merecido

O kit possui agora sete cartas; as seis anteriores já foram integradas pela engenharia. A nova carta descanso-merecido ainda precisa de integração ao baralho/motor oficiais. Texto: Descansar né ? Que o cara não é de ferro ! Vá para o Descanso. Destino visual REST (índice 17); sem controles, temporizador ou regras locais. Asset WebP 1280×853, 309.064 bytes, fonte em source/descanso-merecido-v1.png; prompt e manifesto em descanso-merecido-prompt.json e descanso-merecido-manifest.json. Prévia com ?event=descanso-merecido. QA atualizado: sete cartas em quatro telas, 28 combinações. A ilustração é inspirada no print do usuário; origem registrada no inventário, sem confirmação de direitos da entrada.


O usuário esclareceu que a referência servia somente para as proporções verticais, não para copiar a arte. A versão vigente tem desenho próprio com identidade brasileira: verde-mata e azul-petróleo, filetes dourados, símbolo abstrato nas cores do Brasil, folhas tropicais, azulejos azul e branco e ondas inspiradas nos passeios de pedra brasileiros. O título é integrado à superfície da carta, sem faixa, e a imagem continua em destaque. A proporção 420:600 foi mantida. **Sem nenhum botão ou seletor. O tempo de exibição e a escolha no tabuleiro serão definidos e integrados pelo Claude.** Esta versão substitui visualmente v1/v2/v3/v4, preservando o fluxo passivo solicitado.

## Usar estes arquivos

- `apps/web/src/event-art/EventNotificationCard.tsx`: componente React passivo, recebe somente `eventId`. ID desconhecido não renderiza carta.
- `apps/web/src/event-art/event-brasil-v5.css`: carta e camada opcional `sc-event-layer`, sem captura de cliques, escurecimento ou bloqueio de foco.
- `apps/web/src/event-art/art/card-brasil-v5.svg`: moldura autoral editável. Não usa os assets de fundo claro e faixa azul da v3.
- `apps/web/src/event-art/events.json`: seis registros, com `cardTitle` e `cardText` próprios para a carta simplificada. Não há rótulos de ação.
- `apps/web/src/event-art/art/*-v1.webp`: as seis ilustrações já criadas. A dança mantém a imagem corrigida conforme a fotografia enviada pelo usuário.

Textos permanecem em HTML. As ilustrações são exibidas com proporção preservada, sem recortar ou esticar os personagens. O componente não possui botões, campos, seletor de estado, função de fechar, callbacks, cálculos financeiros ou temporizador. O host controla quando montá-lo e quando removê-lo. Não usar `showModal()`, fundo escuro, blur ou overlay que bloqueie o tabuleiro.

As seis ilustrações somam 2.148.714 bytes; a moldura brasileira v5 tem 2.603 bytes. O frame luxuoso v2 continua apenas como material histórico, não é usado pela versão atual. Os diretórios `assets/3d/reviews/event-modals/v1/` e `v2/` preservam exemplos anteriores. O guia anterior, a prévia interativa e a QA v2 ficam em `archive/` e **não são a especificação atual**.

## Fluxo para Claude

1. O jogador para na casa de evento e o servidor determina a carta.
2. O host mostra a carta por um tempo definido pela engenharia. Esta entrega não fixa uma duração nem adiciona timer ao componente visual.
3. O host retira a carta.
4. Quando necessário, o jogador escolhe o estado diretamente no tabuleiro, que deve estar visível e sem bloqueio de uma camada modal invisível. Não abrir lista ou botão dentro da carta.
5. O servidor valida a escolha e resolve o evento pendente. O desaparecimento da carta não pode confirmar, cancelar ou aplicar o efeito por si só, nem liberar outras ações indevidas enquanto a escolha está pendente.

O pedido atual substitui a antiga instrução de manter um modal aberto até a escolha: **não reaplicar esse comportamento**. As seis regras continuam sendo responsabilidade do servidor.

| ID visual proposto | Regra solicitada |
|---|---|
| `assalto` | Assalto noturno: pagar R$ 200,00 |
| `caramelo-viral` | Vídeo da dança viraliza: ganhar R$ 300,00 |
| `incendio` | Escolher estado de oponente; fica desocupado e disponível para nova compra |
| `visita-olimpica` | Ir até o estado-sede atual das Olimpíadas |
| `escolha-sede` | Escolher um estado para sediar as Olimpíadas |
| `apagao` | Escolher estado de um oponente; ninguém paga aluguel até o dono parar nele três vezes |

Continuam sem definição adicional neste pedido: destino do pagamento/fonte do prêmio; construções após incêndio; comportamento sem alvo/sede; efeitos de passar pelo início na viagem; reaplicação de apagão e troca de dono. Não inventar essas regras no componente de arte. O contador do apagão deve vir do servidor e pode ser mostrado na apresentação da propriedade ou do tabuleiro, não há controle interativo dele na carta.

## Prévia e validação

Abrir `/scripts/assets/event-modals-preview/?event=incendio` com Vite na raiz. `?gallery=1` mostra as seis cartas. A prévia usa o componente React real sobre uma **captura do tabuleiro**, apenas para demonstrar a composição. Não é uma partida conectada e não implementa seleção de estados. `window.eventSimpleQA.hide()` simula o host retirando a carta; `show(id)` a mostra. Não há timer, seletor ou botões de demonstração na tela.

`node scripts/assets/event-brazil-vectors.mjs` reproduz a moldura e o manifesto v5. `node scripts/assets/event-modals-qa.mjs` confere seis cartas em 1536×1024, 1280×720, 844×390 e 667×375 (24 combinações), texto e título, ausência total de controles/diálogo, camada transparente que permite passagem de clique, retirada da carta, tabuleiro visível depois dela e hashes dos SVG. Capturas e relatório em `assets/3d/reviews/event-modals/`. TypeScript e build também conferidos; sem nova partida conectada ou teste em celular físico.

## Procedência

Ilustrações: image_gen integrado, com fontes em `source/`, prompts em `prompts.json` e hashes em `manifest.json`. A ilustração da dança é uma estilização da fotografia fornecida pelo usuário; os direitos comerciais dessa entrada não foram confirmados no registro, preservando `commercialUse: null` no inventário. As outras cinco usaram arte própria do projeto como direção visual. A fotografia não é distribuída como asset.

SVG v5: arte original do projeto, manifesto `brasil-v5-manifest.json`. Os arquivos v3/v4 e as prévias anteriores são apenas históricos. Sem nova geração de imagem ou consumo de créditos Meshy nesta revisão simplificada. O pedido C10 foi entregue em revisão separada; ver o registro de entrega nas orientações. Não altera Saque, Taxa ou as regras de produção.
