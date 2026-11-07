# Orientações e pendências para o Codex

## Publicação da C10 (06/11/2026)

Commit e merge/publicação na develop solicitados pelo usuário. Inclui o relevo da sede, o selo e comparação de aluguéis no modal, integração visual, prévias, testes e documentação. Os identificadores ficam no histórico Git. As alterações da engenharia posteriores à base 3b21774 são preservadas na integração.

## C10 — sede olímpica: entrega concluída (06/11/2026)

**Estado: implementado e validado localmente na develop_arte_3d, sobre 3b21774.** Destaque em louros dourados de baixo-relevo com incrustação verde, acompanhando o contorno arredondado real do estado. Sem tocha alta, painel opaco ou selo de multiplicador no tabuleiro. Altura máxima de 0,031 unidade; geometria confinada à faixa de borda até 0,054 para dentro, sem entrar nas áreas de apoio das construções/personagens. O filete dourado ajusta a largura entre 0,55 e 1,4 px pela altura da tela, para manter a placa de aluguel livre no celular. Dois meshes reunidos e uma linha; sem textura/luz nova; pulso suave respeita alterações de prefers-reduced-motion.

**Contrato para Claude — já integrado:** `OlympicHost({placement, contour?})` preserva placement e recebe opcionalmente o contorno local. `Pieces.tsx` já fornece `olympicLocalContour(anchor)`; não voltar à aproximação retangular quando há polygon. O dono continua marcado no contorno externo. A geometria não captura raycast de seleção. Câmera, manifesto, âncoras, personagens e GLBs das construções foram preservados.

O modal ganhou o selo `Sede das Olimpíadas ×N` e edição, com chama SVG autoral. `PropertyEvolutionPanel` aceita `olympics?: {multiplier:number; edition:number; label:string}`; `PropertyEvolutionStage.baseRentLabel?: string` contém o aluguel sem bônus. `game/propertyDecision.ts` já fornece as bases do catálogo e mantém rentLabel pela regra existente; `PropertyDecisionDialog.tsx` já passa as props e remove a frase redundante. Nos seis níveis aparece o valor original riscado e o aluguel com bônus destacado, inclusive no nível atual. Compra, construção e consulta contempladas. Nenhum cálculo financeiro foi transferido para a arte, e nenhuma regra do servidor foi alterada.

**Validação:** **141 testes, TypeScript e build aprovados**. Geometria dos 26 estados testada com margem para vizinhos/áreas de apoio. Prévia real 3D: RN/AC/PB/MA, hotel e quatro personagens, em 1280×720 e 844×390; auditoria de 18 pontos de nome/aluguel em cada combinação usando as geometrias reais, incluindo o filete, sem interseção; movimento reduzido/retomada conferidos. Modal: três modos × quatro telas, ×2/×10, hotel, nome longo e estado sem sede. Partida conectada com API/banco locais, dado de desenvolvedor, compra e sede via comandos oficiais: seis pares de aluguel conferidos após clique no estado em 1280×720 e 844×390. O ajuste final da espessura do filete foi novamente conferido na prévia 3D.

Guia, capturas e relatórios em `assets/3d/reviews/c10/`. Roteiros `scripts/assets/c10-board-qa.mjs`, `c10-modal-qa.mjs`, `c10-connected-qa.mjs`. Credenciais de QA apenas no staging ignorado pelo Git. Procedural 3D e SVG originais do projeto, sem Meshy ou consumo de créditos. Sem medição de GPU em celular físico. Os serviços locais de QA são encerrados ao concluir. Commit e merge/publicação desta entrega solicitados posteriormente pelo usuário. Integração das regras das seis cartas de evento permanece separada com a engenharia.

## Publicação das cartas de evento (06/11/2026)

Commit e merge/publicação na develop solicitados pelo usuário. A versão vigente é a **v5 brasileira**, com seis cartas passivas: sem botões, seletores ou temporizador; Claude controla o tempo e a escolha no tabuleiro. Inclui componente visual, assets, fontes, histórico de refinamentos, guias e prévias. Os registros anteriores de “sem commit/merge” são históricos. As regras dos seis eventos e a integração à partida continuam pendentes da engenharia. Identificadores finais da publicação no histórico Git.

## Cartas de evento — identidade brasileira v5 (06/11/2026)

**Versão visual vigente.** O usuário pediu cartas mais brasileiras. A moldura autoral recebeu verde-mata/azul-petróleo, filetes dourados, símbolo nas cores do Brasil, folhas tropicais, azulejaria azul/branca e ondas inspiradas nos passeios de pedra brasileiros. Proporção 420:600, cenas, texto e simplicidade preservados; sem copiar a arte da referência e sem restaurar faixa/fundo creme.

**Para Claude:** `EventNotificationCard.tsx` importa `event-brasil-v5.css`. Asset ativo: `art/card-brasil-v5.svg`, 2.603 bytes; gerador `scripts/assets/event-brazil-vectors.mjs`, manifesto `assets/eventos/brasil-v5-manifest.json`, guia vigente em `assets/eventos/README.md`. Inventário atualizado. Exemplo v4 arquivado em `assets/3d/reviews/event-modals/v4/`.

**Fluxo inalterado:** carta passiva, sem botões, seletores, fechar, timer, backdrop ou bloqueio de foco/cliques. Claude controla o tempo e retira a carta; a escolha de estado acontece no tabuleiro visível. A duração da carta não resolve o evento no servidor. Seis cartas em quatro telas (24 combinações) aprovadas novamente, sem erros de página, sem controles e sem texto cortado. Capturas atuais em `assets/3d/reviews/event-modals/`. Sem nova geração de imagem ou créditos Meshy, commit ou merge nesta etapa vetorial.

## Histórico visual substituído pela v5 — identidade autoral v4 (06/11/2026)

**Decisão vigente:** o usuário esclareceu que a referência é apenas de proporções, não de arte. A carta v3 (fundo claro/faixa azul) foi substituída por identidade própria: azul profundo/petróleo, filetes em cobre, cantos chanfrados, motivos geométricos discretos, título integrado e maior área para a ilustração. Proporção **420:600** mantida. Não copiar o fundo creme, a borda amarela ou a faixa da referência.

**Para Claude:** usar `EventNotificationCard.tsx` com `event-original-v4.css` e `art/card-original-v4.svg`. O componente já importa a versão nova. Frame original do projeto com 1.872 bytes, reproduzível por `scripts/assets/event-original-vectors.mjs`; hashes em `assets/eventos/original-v4-manifest.json`, inventário atualizado. Guia vigente em `assets/eventos/README.md`; galeria v3 arquivada em `assets/3d/reviews/event-modals/v3/`.

**O fluxo da v3 continua vigente:** carta passiva, sem botões, seletores, fechar, temporizador, diálogo, backdrop ou captura de cliques. Claude define a duração e remove a carta; alvos são escolhidos diretamente no tabuleiro visível. Remover a carta não resolve o evento pendente. As seis cenas e os textos foram preservados, incluindo a dança baseada na referência do usuário.

**Validação:** seis cartas em quatro telas, 24 combinações aprovadas, incluindo 844×390 e 667×375; textos e títulos cabem, nenhum controle ou erro de página, camada transparente não captura cliques e tabuleiro fica visível após retirar a carta. Capturas atuais em `assets/3d/reviews/event-modals/`. Sem nova geração de imagem, uso/créditos Meshy, commit ou merge nesta revisão vetorial.

## Histórico visual substituído pela v4; fluxo preservado — v3: carta simples e passiva (06/11/2026)

**Esta decisão do usuário substitui as versões v1/v2 e suas instruções de botões, seletores e espera dentro do modal.** O usuário forneceu uma nova referência: carta vertical simples, borda dourada, fundo claro, faixa azul, imagem e um único texto. **Sem botão de confirmar, fechar, receber, pagar ou selecionar; sem dropdown; sem fundo escuro, diálogo modal ou bloqueio de foco.**

**Entrega:** `apps/web/src/event-art/EventNotificationCard.tsx` é um componente visual controlado apenas por `eventId`, sem callbacks, temporizador, estado de decisão ou comandos. A camada opcional `sc-event-layer` não captura cliques (pointer-events none), não escurece o tabuleiro e não assume o foco. O host monta/desmonta a carta. CSS ativo: `event-simple-v3.css`. Os textos curtos ficam em `cardTitle/cardText` de `events.json`; os rótulos de ação foram removidos. As seis ilustrações, incluindo a dança corrigida pelo usuário, foram preservadas. Moldura/faixa são SVG originais, reproduzíveis por `scripts/assets/event-simple-vectors.mjs`; manifesto em `assets/eventos/simple-v3-manifest.json`.

**Para Claude — fluxo autorizado:** você define o tempo de exibição. Primeiro mostrar a carta; depois retirá-la da tela. Se o evento exigir alvo (incêndio, Comitê ou apagão), o jogador seleciona um estado **diretamente no tabuleiro visível**. A carta não recebe a escolha. O evento pendente e sua validação continuam no servidor; sumir a carta não confirma, cancela ou resolve o efeito. Manter o tabuleiro disponível para essa seleção, sem backdrop/modal invisível sobre ele. Não reaplicar a antiga orientação de manter a carta aberta até escolher, nem restaurar os botões/seletores da v2. Nenhuma duração foi definida pelo Codex nesta entrega. As pendências de regra do guia continuam com a engenharia.

**Validação:** componente React real na prévia, seis cartas em quatro telas (24 combinações), incluindo 844×390 e 667×375. Zero botões/campos/diálogos; texto dentro da carta, passagem de clique pela camada e tabuleiro visível após desmontagem conferidos, sem erros de página ou requisições. A imagem do tabuleiro na prévia é apenas captura de composição, sem seleção real de partida. Capturas e galeria atuais em `assets/3d/reviews/event-modals/`; v1/v2 preservadas nos subdiretórios históricos. TypeScript e build conferidos. Sem Meshy/créditos Meshy, commit ou merge nesta revisão.

## Histórico substituído pela v3 — refinamento de arte v2 (06/11/2026)

**Estado: entregue localmente na develop_arte_3d.** O usuário pediu cartas mais bonitas. Foi criada uma moldura ilustrada exclusiva pelo image_gen: metal dourado com relevos, cantos decorados, louros e textura azul profunda. Novo asset `apps/web/src/event-art/art/event-frame-v2.webp` (1600×900, 219.504 bytes). A composição dá mais espaço às ilustrações, fortalece títulos/categorias, organiza regras e seleção em um bloco próprio e coloca efeito/contador e ação no rodapé, dentro da moldura. As seis cenas, incluindo a dança da referência do usuário, foram preservadas.

**Para Claude:** a prévia passa a usar `event-modals-v2.css`, que importa a base `event-modals.css`. O markup usa `ev-summary` no rodapé para efeito e contador de recuperação. Não restaurar a composição v1 ao integrar. Guia e prompt em `assets/eventos/README.md` e `frame-v2-prompt.json`; fonte e hashes em `frame-v2-manifest.json`; reprodução por `scripts/assets/prepare-event-frame.mjs`. O inventário comercial inclui a nova moldura. Permanecem os contratos e pendências de regras do guia dos seis eventos; esta revisão não altera efeitos ou implementa backend.

**Validação:** as seis cartas foram novamente aprovadas em quatro telas, **24 combinações**, incluindo 844×390 e 667×375. QA verifica arte, texto, rodapé, estados de escolha, valores, contador e hashes, sem erros de página ou requisições. Capturas atualizadas em `assets/3d/reviews/event-modals/`; galeria e exemplo anteriores em `v1/`. Total das seis ilustrações e da nova moldura: 2.368.218 bytes. Sem Meshy, créditos Meshy, nova partida conectada, commit ou merge nesta etapa.

## Seis eventos — ilustrações e modais (06/11/2026)

**Estado: kit de arte entregue localmente na develop_arte_3d; regras e sorteio ainda precisam de integração.** Pedido do usuário: seis eventos independentes ao parar na casa de evento, cada um com descrição e imagem. Foram criadas seis ilustrações pelo image_gen integrado: assalto (−R$ 200,00), dança viral (+R$ 300,00), incêndio em estado de oponente, visita à sede olímpica, escolha da sede pelo Comitê e apagão por roubo de fios. A dança foi refeita conforme a fotografia enviada depois pelo usuário: rapaz de bermuda verde, cachorro pequeno e muro com a bandeira; não usar a primeira proposta genérica.

Arquivos de uso em `apps/web/src/event-art/art/`: seis WebP 1280×853, total **2.148.714 bytes** (fontes PNG: 17.488.203 bytes). Textos, regras e IDs visuais propostos em `events.json`; composição em `event-modals.css`, reutilizando molduras/botões próprios do kit de configurações. Fontes, prompts exatos, manifesto e guia em `assets/eventos/`. Sem Meshy/créditos Meshy. O inventário distingue a dança baseada em foto do usuário (direitos de entrada não confirmados no registro; commercialUse null) das cinco outras artes com direção visual própria.

**Para Claude:** ler `assets/eventos/README.md` antes de integrar. Cada carta precisa de ID oficial e resolução no servidor. O cliente não decide dinheiro, propriedade, movimento ou contador. Incêndio libera estado de oponente para compra; apagão zera a cobrança de aluguel até três chegadas do dono ao estado. Sede e estados elegíveis vêm do snapshot, não das amostras da prévia. Há casos de regra ainda não especificados (sem sede/alvo, construções após incêndio, pagamento por passagem no início e troca de dono durante apagão), registrados no guia. O CardReveal atual fecha em 4,5s: não aplicar esse fechamento às escolhas obrigatórias. A prévia apenas mostra ações locais, sem comandos de jogo. C10 continua pendente e separado deste kit.

**Validação:** `scripts/assets/event-modals-qa.mjs`, seis cartas em quatro telas (1536×1024, 1280×720, 844×390 e 667×375), **24 combinações aprovadas**, sem erro de página ou requisição. Valores −200/+300, seletor obrigatório, estado sem alvo, visita sem sede, contador visual 2/3, fechamento, hashes, proporção e encaixe da arte/textos conferidos. Prévia em `scripts/assets/event-modals-preview/`; capturas/relatório em `assets/3d/reviews/event-modals/`. Sem nova partida conectada, commit ou merge nesta etapa.

## Publicação das entregas de interface (06/11/2026)

Validação após incorporar a develop: **135 testes, TypeScript, build e auditoria dos 35 WebP no pacote aprovados**. Commit de entrega: `df14e45`.

Integração com a engenharia `0dda111`: preservados os sons de abertura e o resumo calculado de aluguel olímpico nos três modos, além do preço de compra na consulta de estado livre. A identidade/nível do proprietário usa a nova apresentação nativa. O novo pedido C10 permanece aberto, fora desta entrega.

Commit e integração/publicação na `develop` solicitados pelo usuário. Inclui C6.1/C6.2, pacote do menu inicial e kit das três abas de configurações. Os registros anteriores de “sem commit/merge” descrevem o estado antes desta solicitação. Assets de menu e configurações continuam como kits com prévias isoladas; somente o modal de propriedade foi integrado à interface de produção. Identificadores da publicação ficam no histórico Git.

## Configurações — assets das três abas (06/11/2026)

**Estado: kit de arte entregue localmente na develop_arte_3d, sem substituir a tela de produção.** O usuário aprovou os mockups Geral/Som/Conta e pediu a criação dos assets. Entrega: **32 SVG originais editáveis** em `apps/web/src/settings-art/art/`, incluindo moldura externa, título, cartões, skyline, botões comuns/principais/destrutivos, abas, fechar, alternâncias, volume, seletor e 15 ícones. Estilos de composição e estados em `settings-assets.css`. Retrato, coroa e engrenagem reutilizam assets próprios existentes; não houve nova geração ou consumo de créditos Meshy.

**Para Claude:** guia e manifesto com hashes em `assets/settings/`. Gerador reproduzível: `scripts/assets/settings-vectors.mjs`. Prévia navegável em `scripts/assets/settings-preview/`, com HTML/JS isolados, sem store ou comandos do jogo. Textos/valores são HTML, não imagens. Conectar ações e preferências reais apenas na integração; campos e botões da prévia não implementam os serviços que representam. Excluir conta abre somente uma confirmação visual cancelável; nenhuma conta é alterada. O host deve manter foco, confirmação, persistência e restrição do jogo para paisagem. Modo disabled, foco, hover e pressionado são CSS; checkbox/range/select são nativos. Todos os 32 assets constam do inventário comercial como arte vetorial original do projeto.

**Validação:** `scripts/assets/settings-qa.mjs`: 15 combinações de aba/tela, em 1672×941, 1280×720, 1024×768, 844×390 e 667×375, além de foco e desabilitado. Imagens decodificadas, sem estouro dos cartões ou controles fora da tela; alternâncias, FPS, volume, salvar/restaurar em memória, teclado e fechar/reabrir conferidos. Capturas/relatório em `assets/3d/reviews/settings/`. Sem nova partida conectada, testes de servidor, commit ou merge nesta entrega isolada de assets.

## Menu inicial — pacote de assets (06/11/2026)

**Estado: artes e prévia entregues localmente na `develop_arte_3d`; integração à tela inicial ainda não realizada.** Referência enviada pelo usuário: menu tropical de Império Urbano. 16 assets em `apps/web/src/main-menu/art/`: cenário de praia/deque, logotipo, cachorro e dados em WebP (três com transparência); três molduras SVG vazias para botões e nove ícones/decorações SVG. Textos, valores, avatar, medidor e molduras dos indicadores ficam em HTML/CSS, separados das imagens. As quatro ilustrações somam 878.814 bytes. PNG originais, prompts exatos, hashes e guia em `assets/menu-inicial/`. Geração pelo image_gen integrado; sem Meshy/créditos Meshy. Retrato reutilizado da família própria C8, sem recortar o avatar da referência.

**Para Claude:** composição de exemplo em `scripts/assets/main-menu-preview/index.html`; estilo reutilizável em `apps/web/src/main-menu/menu-assets.css`. Preservar proporção das artes e a restrição do celular para paisagem. Nome, nível, experiência, moedas e diamantes da prévia são amostras; integrar dados e comandos oficiais separadamente. A opção “Partida Clássica (IA)” é apenas o rótulo da referência e não implementa IA. Os seis controles da prévia só mostram uma mensagem local; não executam jogo ou compra. Não substituir a tela de produção automaticamente com este protótipo.

**Validação:** `scripts/assets/main-menu-qa.mjs` aprovado em 1672×941, 1280×720, 844×390 e 667×375; imagens decodificadas, controles dentro da tela, sem estouro horizontal, requisições falhas ou erros de página. Capturas/relatório em `assets/3d/reviews/main-menu/`. Fontes e derivados registrados no manifesto; inventário comercial inclui os 16 assets para uso na interface. Entrega isolada de arte, sem nova partida conectada, commit ou merge.

## C6.2 — imagens do modal otimizadas (06/11/2026)

**Estado: concluído localmente na `develop_arte_3d`, sobre `fdbc93d`, junto da entrega C6.1 ainda sem commit.** Os componentes `StateHeaderArtwork.tsx` e `PropertyArtwork.tsx` agora importam 35 derivados WebP de `art/optimized/`. Cabeçalhos: 1600 px de largura; terreno, casas e hotel: 1024 px; ícones: 512 px. Proporção preservada, sem ampliação, redimensionamento de alta qualidade e WebP com qualidade 92. Transparência conferida pixel a pixel contra a imagem redimensionada, sem alteração do canal alfa pela compressão.

| Grupo | Antes | Depois | Redução |
|---|---:|---:|---:|
| 26 cabeçalhos | 78,74 MB | 8,68 MB | 88,97% |
| 6 construções/terreno | 11,60 MB | 1,60 MB | 86,20% |
| 3 ícones | 3,91 MB | 0,16 MB | 95,92% |
| Total | 94,25 MB | 10,44 MB | 88,92% |

Valores em MB decimais. Fontes PNG e seus registros de procedência preservados sem alteração; não são mais copiadas para o pacote do modal. `art/optimized/manifest.json` registra origem, hashes, tamanho e configuração de cada derivado. Inventário comercial e gerador atualizados com os 35 derivados. Nenhuma nova geração de arte, upload externo ou consumo de créditos.

**Reprodução e validação:** `node scripts/assets/compress-property-art.mjs` gera os derivados usando o codificador WebP do Chromium instalado pelo Playwright. Depois de `npm run build`, `node scripts/assets/property-compression-qa.mjs` confere hashes das fontes e derivados, inventário, transparência registrada, presença dos 35 WebP no build e ausência dos PNG originais no pacote. Comparações antes/depois e relatório em `assets/3d/reviews/property-compression/`. Conferência visual de desktop e celular paisagem aprovada; regressão de compra/construção, 52 trocas de cabeçalho, consulta nas cinco telas, 126 testes, TypeScript e build aprovados. A validação visual desta rodada foi feita na prévia controlada, sem medição de velocidade numa rede móvel real.

**Para Claude:** integração já realizada nos imports do modal; não restaurar os imports PNG. As fontes continuam disponíveis para edição ou novas conversões. C6.1 e C6.2 concluídos; nenhum commit, publicação ou merge executado nesta rodada.

## C6.1 — arte do modal de consulta (06/11/2026)

**Estado: implementado e validado localmente na `develop_arte_3d`, sobre `fdbc93d`.** O pedido do usuário foi criar a arte deste modal seguindo o padrão do projeto. Moldura azul e dourada, panoramas próprios dos estados e seis ilustrações originais foram preservados. A consulta ganhou identificação do proprietário (retrato, nome e cor do peão), nível e aluguel atuais, destaque verde do nível atual e aluguel legível nas seis etapas. Sem dono, mostra “Disponível para compra”. Etapas futuras ficam coloridas e neutras.

**Contrato para engenharia:** `PropertyEvolutionPanel` aceita `mode: 'view'` e `owner?: { name: string; color: string; portrait?: ReactNode } | null`. As propriedades de ações são opcionais nesse modo. As etapas são conteúdo estático: não selecionam nem confirmam, não exibem cadeados, resumo de custo ou botão de construção. O host `hud/PropertyDecisionDialog.tsx` já passa o modo nativo, os dados do dono e o retrato original; a adaptação `.pe-host-view` foi removida de `index.css`. Fechamento, foco e comandos de compra/construção permanecem sob controle do host. Aluguéis continuam vindo das regras existentes, incluindo o bônus olímpico.

**Validação:** 126 testes, TypeScript e build aprovados. Prévia controlada em `scripts/assets/property-view-preview/`, QA em `scripts/assets/property-view-qa.mjs` e capturas/relatório em `assets/3d/reviews/property-view/`: proprietário, imóvel livre, hotel, nome longo, seis aluguéis, nenhuma ação financeira disparada, fechamento e cinco tamanhos (1280×720, 1024×768, 844×390, 667×375 e 390×844). As duas telas pequenas em paisagem cabem integralmente. Retrato foi apenas uma verificação de robustez; a restrição do jogo para paisagem permanece. Regressão visual de compra/construção e dos 26 cabeçalhos aprovada pelo roteiro existente. Esta rodada usou prévia controlada, sem nova partida conectada.

Sem geração de imagens, uso do Meshy ou consumo de créditos: composição feita com as artes próprias já aprovadas. **C6.2 concluído na revisão de otimização registrada acima.** Nenhum commit ou merge desta entrega foi executado.

## C10 — Estado-sede das Olimpíadas: arte no tabuleiro e no modal (06/11/2026)

**Estado: concluído — ver entrega C10 no topo.** A especificação original abaixo foi atendida.

### O que já está decidido (não refazer)

- **Sem selo de multiplicador no tabuleiro.** O usuário pediu explicitamente que o “🔥×N” não apareça sobre o tabuleiro, porque tapava outras partes. A placa de aluguel da sede já mostra o valor **multiplicado** (`GameBoard → rentLabels`, via `currentRent`). O multiplicador só aparece quando o jogador toca na casa.
- Hoje o destaque é provisório, da engenharia: `apps/web/src/board/OlympicHost.tsx` desenha uma moldura dourada pulsante e uma tocha cilíndrica no canto. Ele é montado por `Pieces.tsx` (`isHost`) dentro do grupo da casa (`anchor.x/z/rotationY`). **Este arquivo passa para você:** pode substituir tudo.

### Pedido 1 — destaque 3D da sede no tabuleiro

1. Criar um destaque de sede olímpica claramente festivo e com cara de Brasil, no estilo da arte v3. Exemplos que o usuário aceitaria: pira/tocha estilizada, anéis ou louros dourados, brilho ou confete sutil no contorno da casa. Você decide.
2. **Não cobrir:** o nome do estado, a placa de aluguel (`panel.rent`), a faixa das construções (`anchor.buildingArea`/`buildingPanelBox`), os personagens (`anchor.pawnArea`) nem as casas vizinhas. O contorno real da casa está em `anchor.polygon`. As funções `panelBoxCorners`/`pixelToWorld` de `board34/buildingZone.ts` convertem um retângulo do painel para o sistema da casa.
3. Legível em 1280×720 e 844×390, sem nada flutuando alto na frente do tabuleiro: a câmera é fixa e um objeto alto tampa as casas de trás.
4. Animação leve é bem-vinda, mas deve respeitar movimento reduzido (`prefers-reduced-motion`: deixar estático). Sem custo alto de GPU.
5. Contrato: manter a assinatura `OlympicHost({ placement })` (o `placement` traz `width`/`depth` da casa), ou propor outra em `ORIENTACOES-CLAUDE.md` se precisar de `anchor.polygon`/`panel`. A engenharia só decide **qual** estado é sede (snapshot `olympics.hostStateId`).
6. Sem créditos Meshy nem geração paga sem autorização do usuário. Geometria procedural ou assets já licenciados resolvem.

### Pedido 2 — sede olímpica no modal do estado (`PropertyEvolutionPanel`)

Hoje a engenharia explica a sede só pelo texto `message` (rodapé do painel), por exemplo: “🔥 Sede das Olimpíadas: aluguel ×2. Com terreno, R$ 20 vira R$ 40. Seu estado · sem construção…”. Os `rentLabel` de cada etapa e o `newRentLabel` **já vêm multiplicados**. Falta a arte deixar isso evidente:

1. Um selo ou faixa “Sede das Olimpíadas ×N” no cabeçalho do modal quando o estado for sede.
2. Em cada etapa, mostrar o aluguel multiplicado em destaque e o valor sem Olimpíadas riscado ou menor (“~~R$ 20~~ R$ 40”), para o jogador entender de onde vem o número.
3. Contrato proposto (props **opcionais**, a serem acrescentadas por você em `PropertyEvolutionPanel.tsx`):
   - `olympics?: { multiplier: number; edition: number; label: string }`, em que `label` é um texto pronto, ex. “Sede das Olimpíadas ×2”.
   - `PropertyEvolutionStage.baseRentLabel?: string`: o aluguel da etapa sem o multiplicador; ausente fora da sede.

   A engenharia já calcula esses valores em `game/propertyDecision.ts` (`olympicRent`, `rentAt`). Assim que as props existirem na `develop`, eu preencho no `PropertyDecisionDialog` e enxugo o texto do `message`. Se preferir outro formato, registre em `ORIENTACOES-CLAUDE.md`.
4. Valer nos três modos: consulta, compra (não ocorre na sede, mas não deve quebrar) e construção.

### Validação

- Use o **dado de desenvolvedor** para chegar à sede: na partida em modo dev há o botão “🎲 dev” no topo, com a API iniciada com `--app.dev-tools.enabled=true`. Escolha a casa 8 (Olimpíadas) tendo um estado, depois toque no estado e em “Sediar”.
- Conferir os quatro lados do tabuleiro (casas em pé e deitadas) em 1280×720 e 844×390, com o hotel e quatro personagens na casa-sede.
- Registrar a entrega em `ORIENTACOES-CLAUDE.md`.

## C9 — dados 3D no miolo: entrega de arte (06/11/2026)

**Estado: implementado e validado na `develop_arte_3d`, sobre `6aa9d62`; commit e integração à `develop` solicitados e autorizados pelo usuário. Identificadores no histórico Git.** Os dados foram retirados da região atrás da barra e colocados no primeiro plano do miolo, flanqueando a faixa inferior do logotipo. Em repouso, o título e “EDIÇÃO BRASIL” continuam legíveis. Tamanho dobrado de 0,34 para **0,68**; as mesmas faces, materiais e GLB foram preservados.

### Contrato para Claude — manifesto ativo como única fonte

`apps/web/src/board/board34/layout.json` conserva o formato existente de `dice` e `diceRoll`. Câmera, casas, âncoras, ordem de 34 e `reference33` preservados. Os campos `face/pixel` servem à prévia/calibração; a partida continua desenhando somente o resultado recebido do servidor.

| Campo | Dado 0 | Dado 1 |
|---|---|---|
| `position` de repouso | `[-2.45, 0.375, 2.4]` | `[2.3, 0.375, 2.4]` |
| `yaw` | `0.25` | `-0.22` |
| `size` | `0.68` | `0.68` |
| `centerBounds.min` | `[-2.85, 0.6438972746, 2.0]` | `[1.9, 0.6438972746, 2.0]` |
| `centerBounds.max` | `[-2.05, 1.1438972746, 2.8]` | `[2.7, 1.1438972746, 2.8]` |

Valores completos no JSON são autoritativos. `supportY = 0.035`, igual à superfície do miolo, e não à mesa (`-0.505`). O centro parado fica em `supportY + size/2 = 0.375`. `horizontalTravel = 0.40` por eixo (antes 0,03); `bounceHeight = 0.50` acima do mínimo de giro (antes 0,03). A subida total do centro até o ponto mais alto é cerca de 0,769 unidade a partir do repouso.

**Segurança do giro:** esfera conservadora de raio `sqrt(3) × size/2 = 0.5888972746`. O mínimo de giro deixa 0,02 unidade entre essa esfera e o piso. A esfera inteira permanece dentro do polígono do miolo nos extremos X/Z; as faixas dos dois dados são separadas, sem colisão entre eles, com casas ou moldura. Repouso fica abaixo do mínimo do giro: manter a subida inicial sem rotação extra e o pouso vertical já existentes no `rollPlan/RollingDice`.

**Sombras: sim, permanecem ativas.** Como o miolo usa um shader de arte projetada, foi acrescentado o receptor transparente `CENTER_CONTACT_SHADOW`, 0,001 acima da superfície, com opacidade 0,30 e recuo de 0,06 nas bordas. Ele recebe sombras reais sem pintar o atlas nem modificar a ilustração. Os dados continuam lançando sombra. Nenhuma casa, peão ou construção ocupa fisicamente a área de giro.

**Integração:** a animação atual já consome este manifesto. Não foram alterados `DiceVisual`, `diceOrientation`, `RollingDice`, tempos, sorteio, eventos, sincronização do peão, reconexão ou movimento reduzido. A barra conserva o resultado 2D e a regra de ocultá-lo durante o lance. A responsabilidade de animação continua com a engenharia. A garantia referente aos peões considera suas posições nas casas; preservar a espera do lance antes do movimento. Travessias aéreas de viagens e comemorações continuam sob a coordenação da engenharia, sem introduzir simultaneidade com o giro na área reservada.

### Reprodução e evidências

- Definição de arte em `scripts/assets/board34-dice.mjs`, usada também pelo gerador completo de layout. `node scripts/assets/update-board34-dice.mjs` atualiza somente `dice/diceRoll`, preservando todos os outros campos.
- A prévia de peças agora usa `tileAnchor/pawnSpots` da partida, incluindo as faixas de construção da revisão `6aa9d62`, em vez das antigas áreas brutas.
- **126 testes, TypeScript e build aprovados.** Testes geométricos verificam apoio, projeção calibrada, esfera de giro, separação dos dados, enquadramento e planos extremos da animação existente. Em repouso, a projeção dos dados fica livre das caixas conservadoras dos quatro peões por casa (até 1,05 de altura) e de todos os seis níveis de propriedade.
- QA controlado com modelos reais em **1280×720, 1536×1024, 1280×800, 2560×1080, 2560×1440, 3840×2160, 2000×740 e 844×390**. Largura medida de cerca de **30 e 29 px no celular em paisagem**; 58 e 56 px em 1280×720. A matriz de mundo da câmera permanece igual.
- Nas **34 casas**, quatro personagens e hotel onde aplicável: repouso e oito extremos inclinados do envelope, com raios de visibilidade atingindo os meshes dos próprios dados. Sem erros de página ou requisições falhas. Isto amostra a visibilidade no ar; não é uma nova simulação física nem medição em celular físico.
- Capturas `assets/3d/reviews/c9/rest-1536x1024.png`, `rest-844x390.png` e `flight-limit-stress.png`; relatório completo em `report.json`. Executar `node scripts/assets/c9-qa.mjs`. A validação desta etapa é uma prévia controlada de arte; não foi criada uma partida conectada nova.
- **Zero créditos Meshy adicionais e nenhuma geração de arte raster nesta etapa.**

## C8 — entrega local de tela inteira, HUD e nitidez (05/11/2026)

Implementação na `develop_arte_3d`, sobre `afbfbed`; commit e integração à `develop` solicitados e autorizados pelo usuário. Identificadores registrados no histórico Git. **A arte v3, os estados, o miolo, a moldura e o percurso de 34 casas foram preservados.** A referência de tela serve somente ao enquadramento e à posição dos controles.

- **Aluguéis após a compra:** as plaquinhas foram retiradas dos dois atlas. `paintRentalPlaque` e o texto são desenhados no overlay apenas para as propriedades recebidas em `rentLabels`; `GameBoard` exige `ownerId` preenchido. A Taxa conserva sua placa e saldo próprios. Fontes dos estados sem dono ficam livres de faixas vazias.
- **Mesa contínua:** `FixedBoardViewport expanded` usa a janela inteira. `tabletopViewport.ts` ajusta apenas a janela de projeção, com escala uniforme e espaço para o HUD; não altera pose, geometria, âncoras, matriz de mundo da câmera nem a calibração usada para projetar a arte. Mostra o tabuleiro completo e continua a madeira nas áreas excedentes de cada proporção. Planta, moedas e caneca existentes se distribuem horizontalmente sobre o plano da mesa para aproveitar as laterais extras, sem deslocar o tabuleiro. A projeção de exibição agora varia com o tamanho da janela; testes antigos que exigem projeção idêntica ao redimensionar são históricos. A matriz de mundo permanece idêntica.
- **HUD C8:** jogadores centralizados no topo, Menu à direita, Histórico independente no terço inferior direito e barra inferior única com retrato/vez, dados, prazo, ações e selo de rodada. `TurnBadge` foi incorporado à `ActionBar`; o rótulo acessível `Turno de: Você/nome` foi preservado. `GameScreen` não reserva coluna para painéis; `PropertyPanel` só aparece quando solicitado, flutuando. Modais, comandos e condições de ação seguem da engenharia. O aviso de celular em pé continua ativo.
- **Perfis de textura:** atlas normal 3072×2048, 1.357.692 bytes; atlas 6K 6144×4096, 3.716.762 bytes. O maior é solicitado quando o tamanho físico projetado supera 3072 px e a GPU suporta 6144. O anterior permanece visível durante a troca assíncrona. `paintPanel` rasteriza na resolução de cada perfil, mantendo tipografia e contornos maiores. Não foram inventados detalhes além da resolução das ilustrações-fonte.
- **Orçamento:** atlas sem mipmaps; normal 24 MiB, 6K 96 MiB, overlay 24 MiB. Até **144 MiB de texturas GPU do tabuleiro** se os dois perfis estiverem no cache, além da madeira, modelos, avatares e buffers. Desenho limitado a 8.388.608 pixels: 4K/DPR 1 usa 8.294.400; 2560×1440 com dispositivo DPR 2 usa DPR efetivo ~1,5085; telas menores podem usar DPR 2. Não é medição de FPS ou memória total em aparelho físico.

### Origem e licença — E34

O usuário confirmou **plano pago do Meshy na geração** e informou que **não tem autorização comercial dos retratos da referência visual-alvo**. Os recortes foram substituídos por cinco retratos originais, gerados individualmente com `image_gen` integrado, sem imagens de referência. Arquivos WebP de 512×512 em `hud/art/avatars-c8/`, fontes PNG em `assets/3d/calibration/c8/portraits/`, prompts/hashes em `provenance.json` e `assets/3d/requests/c8-portraits.json`.

`GameBoard` não importa mais a cena legada de 33 casas, evitando empacotar suas imagens de referência no jogo atual (que já exige catálogo 34 no servidor). Os módulos de calibração antigos permanecem como histórico; não reativá-los na distribuição. Modelos Kenney mantêm CC0 e aviso local. Modelos Meshy próprios têm plano/geração documentados; quatro downloads históricos de steampunk-girl continuam sem procedência suficiente e **não foram aprovados nem incluídos no runtime**. Registro comercial com fontes oficiais e hashes de 117 assets em `assets/3d/commercial-licenses.json`; isso não atribui licença a referências de terceiros. Nenhum crédito Meshy foi consumido no C8.

### Verificação

115 testes, TypeScript e build aprovados. Teste ponta a ponta de dois jogadores criando sala, rolando dados, passando a vez e consultando o histórico **aprovado** (Playwright, API real). QA visual conectado final aprovado com quatro jogadores, compra por comando oficial, estados com e sem dono, 34 meshes, canvas na dimensão integral da janela e mesma pose em 1280×720, 1536×1024, 1280×800, 2560×1080, 2560×1440, 3840×2160, 2000×740 e 844×390. Nenhum erro de página ou requisição falha. Atlas 6K confirmado em 4K na partida conectada. Perfis adicionais DPR 1/2 em `profile-report.json`, incluindo 2560×1440/DPR 2 com 8.386.092 pixels e 1536×1024/DPR 2 com 6.291.456 pixels. Capturas e `connected-report.json` em `assets/3d/reviews/c8/`. O build não contém as imagens de referência sem licença. Não publicar tokens: a sessão de QA fica apenas em staging ignorado pelo Git. QA usa Chromium de desktop com renderização de software; celular físico e desempenho no Steam Deck ainda não foram medidos.

**Para Claude:** esta entrega inclui a parte estrutural de `GameScreen`, `index.css`, `ActionBar` e `TurnBadge`; não reaplicar as margens/coluna do C5 nem os retratos recortados da referência. Comportamento, validações, acessibilidade e snapshot continuam sob responsabilidade da engenharia. As casas/terreno Meshy da etapa anterior permanecem preservados.

## Atualização com develop — 05/11/2026

Branch develop_arte_3d atualizada para afbfbed, incorporando a partida de 34 casas (16f7705) e o aviso de orientação no celular. As referências abaixo à produção ainda usar 33 casas são históricas e foram superadas por esta atualização. Casas e terreno Meshy locais preservados; o C8 foi executado posteriormente, conforme a entrega acima.


## C9 — Dados 3D no centro do tabuleiro (06/11/2026)

**Estado: implementado localmente; ver a entrega C9 no início deste arquivo.** Requisitos originais preservados a seguir. Com o HUD do C8, a pose anterior dos dados (`board34/layout.json → dice`, pixels `[690,982]` e `[810,982]`) ficava **atrás da barra de ação**. O usuário decidiu: **os dados 3D rolam no centro do tabuleiro**, sobre o miolo, visíveis para todos. A barra continua mostrando o resultado em 2D (a engenharia só esconde o valor enquanto os dados rolam).

Pedido, mantendo o formato do C1 (`dice[i].position/yaw/size` e `diceRoll` com `supportY`, `horizontalTravel`, `bounceHeight`, `centerBounds[i]`):

1. Mover as duas poses de repouso para o centro do miolo, apoiadas na superfície do miolo (não na mesa), lado a lado, sem cobrir o logotipo de forma que incomode; você decide o ponto exato e o tamanho (legíveis em 1280×720 e 844×390).
2. Publicar um envelope de rolagem **maior** que o atual (0,03 é pouco para parecer um lance): espaço para os dados subirem, girarem e quicarem sobre o miolo sem atravessar a moldura interna, as casas, um ao outro ou sair do quadro, em todas as proporções do C8.
3. Confirmar que nada da cena (peões, construções, casas) fica por cima dos dados nessa área, e se a sombra deve continuar.
4. Atualizar `reference33` não é necessário (cena fora da partida).

A engenharia já lê `dice` e `diceRoll` do manifesto ativo, sem copiar números: quando o manifesto mudar, a animação passa a acontecer no centro sem nova alteração de código. Animação, tempo, sincronia com o peão, reconexão e movimento reduzido ficam com o Claude. Não alterar `DiceVisual`/`diceOrientation` por causa deste pedido. Registrar a entrega em `ORIENTACOES-CLAUDE.md` com os novos limites.

## C8 — Tabuleiro de 34 casas na partida real: tamanho, nitidez e faixas de aluguel (05/11/2026)

**Estado: implementado localmente; requisitos originais preservados abaixo.** Consultar a entrega C8 no início deste arquivo. A cena v3 está ativa na `develop` (`16f7705`), com `GameScreen` passando `taxPoolLabel`. Na tela real do usuário (janela larga, cerca de 2000×740), foram apontados três problemas:

1. **Faixas de aluguel em estados sem dono.** O usuário pediu que a plaquinha escura do aluguel **só apareça depois que o estado for comprado**. Hoje `plaque()` está gravada no atlas (`scripts/assets/board34-atlas.ts`) para os 26 estados, e o overlay de `Board34Scene` só escreve o valor quando há dono. Tirar a plaquinha do atlas e desenhá-la no overlay apenas para os `stateId` recebidos em `rentLabels` (o host já manda só os estados comprados). Estados sem dono mostram a ilustração inteira, sem faixa vazia.
2. **Jogo não ocupa a tela.** `FixedBoardViewport` recorta a cena em 3:2 e pinta o resto com `#2b1914`: numa janela larga sobram faixas lisas laterais grandes. Pedido: o canvas ocupar a área inteira, com a mesa/cenário continuando nas laterais (e em cima/embaixo em telas altas), sem esticar nem mover o tabuleiro calibrado; a regra de "tabuleiro inteiro sempre visível" continua. Do meu lado, reduzo as margens reservadas ao HUD (`--hud-top/right/bottom` em `index.css`) para os painéis flutuarem sobre a mesa; aviso quando for mexer, para não conflitar com o C5.
3. **Perda de nitidez.** Na tela do usuário o tabuleiro ficou com cerca de 855×570 px CSS, e cada casa com uns 55 px de largura: a arte v3 (boa nas capturas 2×) fica miúda e borrada. Parte se resolve com o item 2 (tabuleiro maior). Conferir também a nitidez do atlas projetado em telas grandes e com DPR 1 e 2: o atlas tem 3072×2048 para a composição inteira, então ampliar o tabuleiro além de cerca de 1536 px de largura útil vai borrar. Se preciso, um atlas maior ou a separação das faces por casa, dentro do orçamento de memória.

**Referência de posições enviada pelo usuário (05/11/2026): `docs/referencias/partida-tela-cheia.webp`.** "O ideal das posições eu gostaria que fosse assim, e isso tudo ocupando a tela inteira." **Não mudar a arte atual:** o usuário esclareceu que a imagem é só exemplo de **como o jogo deve ocupar a tela** (enquadramento, HUD e posições dos elementos). As casas, o miolo, as cores e as ilustrações do tabuleiro v3 ficam **como estão hoje**; não copiar o desenho das casas, do centro ou da moldura da imagem. Ela também não vale para regras: a ordem das casas nela é a antiga (sem Saque); vale o percurso de 34 casas do catálogo. O que tirar dela:

- Tabuleiro grande e centralizado, ocupando quase toda a altura, levemente inclinado, com a mesa de madeira e a decoração (planta, moedas, caneca) preenchendo **a tela inteira**, sem faixas lisas.
- Jogadores numa **fileira no topo**, centralizada (avatar, nome, saldo e posição 1º–4º), em vez do canto superior esquerdo.
- **Menu** no canto superior direito; botão **Histórico** à direita, na altura do terço inferior, sobre a mesa.
- **Barra de ação embaixo, centralizada**, numa peça só: avatar de quem joga com "Sua vez", dados, prazo e ROLAR DADOS, com a "Rodada N" num selo em cima da barra. Sem o quadro "Turno de" separado no canto.
- Painéis sobre a mesa, sem coluna lateral reservada: a área do tabuleiro deixa de descontar as margens do HUD.

Isto substitui a disposição atual do C5. As posições e o acabamento do HUD são da arte; a engenharia mantém comportamento, dados e acessibilidade (`ActionBar`, `PlayersPanel`, `TurnBadge`, `EventLog`) e ajusta `index.css`/`GameScreen` junto, se você preferir que eu faça a parte estrutural; combine em `ORIENTACOES-CLAUDE.md`.

**Lançamento (D26, 05/11/2026):** primeiro no **navegador**, depois na **Steam**. A tela inteira deixa de ser preferência e vira requisito já para o navegador (janelas de qualquer tamanho): qualquer proporção (16:9, 16:10 do Steam Deck 1280×800, 21:9 ultrawide) e resoluções de 1280×720 a 4K, com o tabuleiro **nítido em 1440p e 4K** (atlas ou faces com resolução suficiente, dentro de um orçamento de memória que você propõe). Toda arte entregue precisa ter origem e licença comercial registradas (E34); os itens com licença `pending-verification` entram nessa revisão.

Validar na partida conectada (não só na prévia) em 1280×720, 1536×1024, 1280×800, 2560×1080 (ultrawide), 3840×2160, numa janela larga tipo 2000×740 e no celular em paisagem, com estados com e sem dono. Registrar a entrega em `ORIENTACOES-CLAUDE.md`.
## Complemento — terreno antes da Casa 1 (05/11/2026)

O usuário apontou a ausência do terreno e autorizou expressamente o envio de `terrain-v2.png` ao Meshy por mais 30 créditos. Tarefa de conversão: `01a1aa12-8126-745d-a721-386082b71279`, Meshy 7.1 com textura 2K; plano e consentimento em `assets/3d/requests/terrain-meshy-image-plan.json`.

**Contrato vigente, substituindo a descrição de nível 0 abaixo:** propriedade comprada (`ownerId` preenchido) e `buildingLevel:0` recebe a miniatura do terreno original do modal; ao construir, o terreno é substituído pela Casa 1, depois Casa 2–4 e hotel. Propriedades sem dono e casas especiais não recebem o modelo. Nenhuma regra de compra/construção, preço ou aluguel foi alterada. `Pieces.tsx` respeita a posse do snapshot; não inferir posse pelo nível.

Família de seis GLBs `property-level-{0..5}-meshy-v1.glb`, todos com frente +Z, apoio Y=0, escala uniforme e identificação do dono no material separado. A preparação aceita `--terrain` para incorporar apenas o novo terreno e preservar os cinco modelos já entregues; hashes anteriores conferidos. Terreno: 1.815.212 bytes e 11.055 triângulos. Prévia individual em `assets/3d/reviews/buildings/terrain-and-model.png`; comparação da família em `modal-and-models.png`.

Custo acumulado da família: **280 créditos**, incluindo os 100 de prévias descartadas, os 150 das cinco construções e os 30 do terreno. Os 50 créditos anteriores de decoração permanecem fora deste total. Saldo confirmado após o terreno: **670 créditos**. Não repetir a geração para reconstruir arquivos locais.

Validação do complemento: 110 testes, TypeScript e build aprovados. Terreno sem erros/avisos Khronos (duas mensagens informativas na faixa de cor). Resultado inspecionado em comparação com a arte original; QA no navegador dos níveis 0–5, quatro personagens, cor do dono e terreno em três resoluções móveis em paisagem, sem erros/requisições falhas e com câmera invariável. Relatório e procedência atualizados em `assets/3d/reviews/buildings/`. Nenhum commit ou publicação nesta etapa.

## Construções Meshy a partir do modal — 05/11/2026

Entrega local na `develop_arte_3d`, ainda sem commit/publicação desta etapa. Cinco modelos reais Meshy 7.1, orientados pelas artes originais de `property-evolution/art/house-1-v2.png` até `house-4-v2.png` e `hotel-v2.png`, com origem registrada no chat ArtesImperio. As ilustrações do modal foram preservadas. Prévia comparativa: `assets/3d/reviews/buildings/modal-and-models.png`.

**Contrato visual:** um edifício evolui conforme `buildingLevel`: 0 sem modelo, 1–4 casas com respectivos pavimentos, 5 hotel. Substitui a repetição de quatro miniaturas iguais; não altera quantidade lógica, custos, aluguéis, saldo nem regras do servidor. `BuildingModels.tsx` carrega os GLBs; `buildingPresentation.ts` consulta `buildings.json` e aplica escala uniforme dentro de `buildingArea`. Frente +Z, apoio Y=0, sem alterar câmera/âncoras. Cor do jogador apenas no material independente `OWNER_ACCENT` e na faixa existente; fachada preserva a paleta do modal. Carregamento isolado por modelo para não esconder o tabuleiro inteiro.

**Para Claude:** manter esta apresentação ao integrar as regras de 34 casas. A partida nesta branch ainda consulta o catálogo de 33; não mudar seletor/âncoras por este registro. A camada visual já consome o nível do snapshot, sem exigir novo campo do servidor. GLBs e manifesto constituem uma família inseparável. Não recolorir os materiais texturizados, esticar modelos por eixo ou recolocar quatro casas idênticas. As pendências C6.1/C6.2 anteriores não foram executadas nesta etapa.

Arquivos finais: `apps/web/public/models/buildings/property-level-{1..5}-meshy-v1.glb`. Total 9.719.668 bytes, entre 10.442 e 13.403 triângulos/modelo. Fontes integrais 2K e preparação Blender em `assets/3d/calibration/buildings-meshy/`; processo reproduzível `scripts/assets/prepare-meshy-buildings.py`. Texturas de runtime até 1024 px. Protótipos locais anteriores arquivados em staging ignorado; não são os modelos entregues.

**Créditos:** 250 consumidos nesta etapa: 100 nas cinco prévias por texto descartadas e 150 nas cinco conversões por imagem aprovadas. Saldo confirmado 950 → 700, separado dos 50 gastos anteriormente na decoração. O usuário autorizou explicitamente enviar as cinco imagens locais ao Meshy após bloqueio inicial da revisão automática; apenas a ferramenta necessária de conversão por imagem foi habilitada. Identificadores, referências e custos em `assets/3d/reviews/buildings/meshy-ledger.json`; não executar novamente os scripts de geração para reconstruir o runtime.

Validação: 110 testes aprovados; TypeScript e build aprovados. Cinco GLBs sem erros/avisos Khronos (duas mensagens informativas por modelo sobre atributos não usados na faixa de cor). QA real: níveis 1–5, um edifício por propriedade, quatro personagens, mudança de cor do dono, câmera invariável e três telas em paisagem (844×390, 932×430, 667×375), sem erros de página ou requisições. Relatório `assets/3d/reviews/buildings/report.json`. Não equivale a teste em aparelho físico ou aprovação estética do usuário.

## Registro do commit da arte v3 — 04/11/2026

Entrega registrada em **`6d1de1a`**, branch **`develop_arte_3d`**, com commit e integração à `develop` autorizados pelo usuário. Base remota conferida: `2fc2c3e`. Verificação antes do commit: **107 testes, TypeScript, build e auditoria de credenciais aprovados**, sem arquivos acima de 100 MiB. O histórico Git registra a integração e este registro documental complementar. As menções a “sem commit/merge” abaixo são históricas. A publicação da arte não ativa por si só as regras/partida de 34 casas; consultar o contrato v3 a seguir.

## V3 — redesenho após rejeição do acabamento (04/11/2026)

**Este é o estado vigente da arte, ainda para revisão estética do usuário.** A montagem anterior foi rejeitada por desalinhamentos, distorção dos ícones, Taxa e decoração insatisfatórias. Os registros de aprovação de testes nas seções históricas não aprovam o acabamento rejeitado.

### Alterações desta revisão

- **34 PNGs originais novos** em `apps/web/src/board/board34/art/v3/`: 26 ilustrações próprias para as miniaturas dos estados, sete ícones transparentes independentes (seta, chama, descanso, aeroporto, evento, tesouro da Taxa e baú) e uma marca para a caneca. Os cabeçalhos panorâmicos aprovados dos modais foram preservados. Prompts e hashes no `provenance.json` desse diretório.
- **Grade física regular e margens consistentes**, com contornos arredondados. Alteradas deliberadamente as posições/polígonos da cena de 34 para corrigir o alinhamento solicitado; a câmera e as matrizes calibradas continuam intactas. Modelo/atlas novos e manifesto são um conjunto inseparável.
- Manifesto `board34/layout.json` agora com `schemaVersion:2`, `id:board34-v03`, `integration.anchorsRevision:3` e `panel` por casa. RN permanece antes de AM; Saque e ordem lógica de 34 preservados. **Não reutilizar âncoras anteriores da cena de 34 ou deslocamentos de 33**: personagens/construções consultam o manifesto vigente pelo id.
- Arte, preço e saldo usam a mesma projeção em `panelProjection.ts`. Ícones encaixados com **escala uniforme**, sem esticar quadrados em retângulos; Evento norte e leste têm diagramações próprias. Rasterização sem as costuras diagonais das tentativas com triângulos Canvas2D. Valores continuam independentes e dinâmicos.
- Taxa com nova ilustração, título e placa própria para total disponível. Saque recebe baú separado e título nativo. Não foram implementadas regras monetárias locais.
- **Decoração real Meshy:** planta T2.5 e caneca 7.1, inspecionadas, texturizadas e preparadas localmente; marca aplicada na superfície da caneca, café e moedas complementados na cena. GLBs finais em `apps/web/public/models/decor/`, fontes integrais em `assets/3d/calibration/decor-v3/`, processo reproduzível em `scripts/assets/prepare-meshy-decor.py`. Tangentes exportadas e degeneração de uma tangente da planta corrigida antes da validação.
- Custos Meshy informados ao usuário antes das gerações: previsão inicial 30, revisada para 50 após descarte da primeira caneca defeituosa. **Consumidos exatamente 50 créditos**, incluindo 5 da tentativa descartada; saldo de 1.000 para 950. Registro de tarefas/modelos/prompts em `assets/3d/reviews/decor-v3/meshy-ledger.json`. Nenhuma geração adicional está autorizada silenciosamente neste registro.
- Runtime: tabuleiro 444.384 bytes/9.496 triângulos; atlas 1.301.978 bytes; planta 1.065.892 bytes/6.497 triângulos; caneca 737.652 bytes/6.244 triângulos; marca WebP 47.186 bytes. Texturas de decoração reduzidas para uso no navegador; fontes completas preservadas.

### Verificação e integração

107 testes, TypeScript e build aprovados. Validador Khronos: tabuleiro, planta e caneca finais sem erros ou avisos; relatórios `khronos-v3.json` e `decor-v3/khronos-*-verified.json`. QA no navegador: 34 cliques, 26 aluguéis, alteração do fundo na face, saldo desconhecido sem inventar zero, quatro personagens em RN/ES/Saque e três resoluções móveis em paisagem com câmera invariável. Isto não mede desempenho em aparelho físico nem ausência de encobrimento das letras por personagens.

Capturas reais atuais: `assets/3d/reviews/board34/board34-v3.png` e `detail-north-v3.png`, `detail-tax-v3.png`, `detail-event-v3.png` (2×). Os arquivos anteriores documentam versões rejeitadas; não apresentá-los como a revisão vigente.

**Para Claude:** integrar este conjunto de GLB, atlas, decoração, marca e manifesto v3. A partida de produção ainda usa catálogo de 33 e permanece protegida pelo seletor exato; a migração para 34, contratos do fundo/Saque, HUD integrado e restrição de celular a paisagem continuam responsabilidades de engenharia. Não ativar só o visual com lógica/âncoras antigas. Sem commit, push ou merge nesta revisão.



## Revisão visual — retorno ao estilo anterior (04/11/2026)

Validação desta revisão concluída: 105 testes, TypeScript e build aprovados; GLB sem erros ou avisos no validador Khronos (`khronos-restored-final.json`). QA real do navegador com 34 cliques, mudança do fundo na face da Taxa, valor desconhecido, aluguéis, quatro personagens em RN/ES/Saque e câmera invariável nas três telas móveis em paisagem. Relatório atualizado em `assets/3d/reviews/board34/report.json`, sem erros de página. Aprovação estética final e desempenho em aparelho físico continuam a ser avaliados separadamente.

**Pedido vigente do usuário:** preservar as fotos dos estados e retomar o acabamento da arte anterior. A primeira montagem simplificada de 34 casas foi rejeitada visualmente; testes geométricos não constituem aprovação de arte. Esta revisão é a nova entrega para avaliação do usuário, sem alegar reprodução idêntica do conceito.

- Mantidos os 26 cabeçalhos/fotos dos estados, preços variáveis, RN antes de AM, Saque, Taxa e a câmera/calibração existente.
- Criadas seis artes originais individuais: `center-brasil-v2.png`, `start-v1.png`, `olympics-v1.png`, `rest-v1.png`, `airport-v1.png` e `event-v1.png`, em `apps/web/src/board/board34/art/`. Centro com letras de bloco, “URBANO” branco, coroa e paisagem azul; cantos com ilustrações detalhadas em vez de símbolos de sistema.
- Moldura física em madeira com filetes dourados arredondados e frisos. Folhagem curva com nervuras discretas, vaso cerâmico, caneca identificada e moedas com estrela. Esses elementos são geometria/material próprios; nenhuma imagem inteira de tabuleiro é projetada na cena.
- Fontes, prompts exatos e hashes: `apps/web/src/board/board34/art/restoration-provenance.json`. Geração pelo image_gen integrado. Meshy foi consultado, mas não houve geração nem consumo de créditos nesta revisão.
- Modelo com 10.801 triângulos e 555.420 bytes; atlas pronto de 1.496.112 bytes. As seis fontes novas não são baixadas separadamente durante a partida; os 26 PNGs dos estados também continuam fora do carregamento da cena.
- Captura real para revisão: `assets/3d/reviews/board34/board34-1536.png`. Não confundir com o conceito gerado `assets/3d/reviews/saque/board-rn-saque-concept-v1.png`. O screenshot novo mostra o tabuleiro; não certifica conclusão do HUD completo ou da partida conectada.

**Para Claude:** usar o GLB/atlas regenerados desta revisão ao ativar o catálogo de 34 casas. Continuam necessários os contratos de Saque/fundo de Taxa, snapshot autoritativo, HUD integrado e restrição de celular a paisagem descritos abaixo. Não voltar ao atlas simplificado, aos ícones de sistema nem ao centro de letras serifadas `center-brasil-v1.png`. Não alterar as fotos aprovadas. A seleção do novo layout continua condicionada à correspondência exata do catálogo; a produção de 33 casas não foi migrada silenciosamente.



## Entrega implementada — cena 3D de 34 casas (04/11/2026)

**Estado: geometria, cena R3F e adaptação de layout implementadas na `develop_arte_3d`; ativação da partida e regras de 34 casas dependem da engenharia.** Esta entrega materializa a proposta anterior: não é apenas o PNG de conceito.

### Arquivos e contrato prontos

- `apps/web/public/models/board/board34-v01.glb`: **34 objetos independentes `TILE_<ID>`**, corpo de madeira apoiado na mesa, miolo e moldura metálica separados. Fonte Blender em `assets/3d/calibration/board34/board34.blend`. Modelo final: **17.513 triângulos, 995.516 bytes**; validador Khronos com zero erros e zero avisos (um informe de UV não usado da moldura).
- `board/board34/layout.json`: sequência completa, índices, pixels/polígonos reais, âncoras, áreas de personagens/construções, `rentRect` de cada propriedade e `taxPoolRect`. START→RN→AM; AL→SAQUE→CE. Saque não tem aluguel nem área de construção. Dados e envelope C1 preservados em mundo, apoio Y=-0,505.
- `Board34Scene` exporta `board34Layout`, `board34TileAnchor(id)` e props `selectedId`, `onSelect(id)`, `rentLabels: {stateId,rentLabel}[]`, `taxPoolLabel: string|null`, `diceValues`, `children`. Sem stores, comandos ou regras. Valores são texto dinâmico sobre as faces reais. Saldo da Taxa ausente mostra “—” e descrição de indisponibilidade; não inventa R$0. Descrições acessíveis acompanham os valores sem região viva para 26 anúncios.
- `boardVisualManifest.ts`: seleciona **pelo catálogo inteiro**, conferindo quantidade, ordem, índices, IDs e associação das propriedades. `layout.ts` já usa esse seletor para as âncoras; `GameBoard.tsx` já escolhe a cena correspondente. Catálogo atual de 33 continua com cena/âncoras antigas; a nova cena ativa automaticamente apenas quando o catálogo coincidir com a sequência de 34. Misturas/incompatibilidades falham explicitamente, sem mover peões para o índice errado.
- `GameBoard({taxPoolLabel})` recebe o saldo oficial formatado do host. Na cena de 34, usa os helpers existentes `currentRent` e `formatCredits` com o snapshot para as propriedades presentes. Não inclui cálculo novo do fundo, cobranças ou saque.

### Arte e pipeline

A cena de 34 **não utiliza pixels da referência nem screenshots conceituais** como fundo ou textura. O atlas é composto das artes originais das UFs, Saque, marcador da Taxa, plaquinhas e novo miolo autoral; cantos usam tipografia/símbolos próprios de interface. A mesa tem material original de madeira, reflexos locais e decoração em geometria real. A fonte dos novos assets/prompts está em `board/board34/art/`.

O atlas de runtime `board34-atlas-v01.webp` tem 3072×2048 e **1.420.186 bytes**, com PNG-fonte preservado no diretório de calibração. Não carrega os 26 PNGs de cabeçalho durante a cena. Pipelines reproduzíveis: `build-board34-layout.mjs`, `build-board34-model.py` (Blender em segundo plano), `build-board34-atlas.mjs`. Não transformar o screenshot renderizado em textura para esconder a geometria.

### Próximos passos da engenharia

1. Implementar catálogo/motor/schema e versionamento de partidas para 34 casas conforme o pedido Saque/Taxa já registrado; resolver compatibilidade das partidas de 33. Preservar a sequência do manifesto e mapear os IDs especiais para os tipos lógicos corretos. Não forçar a cena nova enquanto o servidor ainda usa índices antigos.
2. Ao definir o saldo público do fundo, passá-lo formatado de `GameScreen` para `GameBoard taxPoolLabel={...}`. Publicar as atualizações oficiais após arrecadação/saque; renderização não movimenta dinheiro.
3. A montagem das peças existentes já usa a escolha dinâmica de âncoras. Conferir o fluxo conectado com as 34 casas e testes de movimento/seleção após a migração. Manter fonte única dos índices; não duplicar posições do novo JSON em stores.
4. Cenário/HUD integrado aprovado e bloqueio de celular em retrato continuam etapas próprias. Esta entrega mantém projeção/calibração 3:2 e não altera `GameScreen`, câmera, servidor ou regras. As capturas de 844×390/932×430/667×375 validam a cena, não o HUD completo nem desempenho em aparelho físico.
5. Retângulos de aluguel estão **regenerados para 34 casas no próprio manifesto novo**. Não usar o `tabletop-ui/rentPlacements.json` de 33 por cima desta cena; os preços já são desenhados nas faces, sem segunda camada DOM. A duplicação mostraria o aluguel de RN no Saque.

### Evidências e limites

Testes reais de âncoras/`pawnSpots`/`buildingPlacement` com catálogo de 34: bases de um a quatro jogadores e construções/faixas cabem nos polígonos; fonte de produção de 33 continua intacta. O teste de bases não aprova ausência de encobrimento dos corpos/nomes durante animação.

QA no navegador em `scripts/assets/board34-qa.mjs`: 34 cliques, 34 faces físicas, alteração do fundo diretamente na face 3D (não só no HTML), ocultação de AM para demonstrar independência, inspeção com quatro personagens em RN/ES/Saque, câmera invariável e três telas móveis em paisagem. Sem uso do PNG de referência nem download dos 26 cabeçalhos no runtime da cena. Relatórios/capturas em `assets/3d/reviews/board34/`. Prévia executável: `node scripts/assets/board34-preview/server.mjs`, porta 4194.

Validação geral executada: **105 testes, TypeScript e build aprovados**; verificações geométricas repetidas após o acabamento final do modelo. Sem nova partida conectada, sem implementação da regra de Saque, sem gasto Meshy e sem novo commit/merge nesta etapa. Revisar o acabamento visual nas capturas reais; a ilustração conceitual anterior não é medida de fidelidade certificada.

## Estado consolidado da entrega — 04/11/2026

Arte registrada em **`5f502b4`**, branch `develop_arte_3d`. A base da engenharia `develop` em **`2ad6822`** foi incorporada pelo merge **`2c81b6a`**, sem conflitos. As menções anteriores a “sem commit”, “sem merge” ou bases antigas descrevem o momento de cada estudo; este registro consolida a sincronização atual.

- **Arte entregue:** correção/envelope dos dados C1, respostas C2–C4, protótipos de cenário/HUD, plaquinhas de aluguel, molduras, Saque e contador da Taxa, com fontes/prompts/evidências.
- **Modal C6 já integrado pela engenharia:** `cb8062c`, com ajustes de pouso/aba oculta em `27b0489`. Preservada também a atualização de dívida/prazo em `2ad6822`. Os estados antigos de “integração do modal pendente” são históricos; naquela entrega permaneceram os pedidos C6.1/C6.2. C6.1 concluído nesta revisão; **C6.2 (compressão das imagens)** também concluído na revisão registrada no topo.
- **Ainda pendente de implementação:** cenário integrado aprovado sem prancheta, montagem dos novos assets/aluguéis, restrição de celular a paisagem, E25 e migração para 34 casas com RN/Saque/fundo de Taxa. Não confundir a entrega dos assets/propostas com regras ou layout já ativos na partida. Não implementar a coluna permanente do protótipo C5 rejeitado.
- **Validação da combinação:** 97 testes do frontend/catálogo aprovados; verificação TypeScript da raiz e do frontend, build e auditoria pré-commit aprovados. Auditoria sem credenciais encontradas. Não houve nova rodada conectada de multiplayer/backend nesta sincronização.

Atualizado em 04/11/2026. Este é o ponto único de passagem de trabalho da engenharia (Claude) para a arte (Codex). O caminho inverso fica em [ORIENTACOES-CLAUDE.md](ORIENTACOES-CLAUDE.md); os detalhes das interfaces continuam no [contrato compartilhado](11-contratos-claude-codex.md).

## Como manter este arquivo

- **Claude:** sempre que precisar de algo da arte, registrar aqui antes de encerrar a etapa: o que é necessário, por quê, arquivos envolvidos, o que bloqueia e como validar. Um único arquivo, sem criar um MD por pedido.
- **Codex:** ler este arquivo antes de cada entrega. Ao atender um pedido, marcar o item, registrar commit/branch e avisar no ORIENTACOES-CLAUDE.md se a engenharia precisar agir em seguida.
- Pedidos daqui não autorizam gastar créditos Meshy, gerar assets pagos, fazer merge ou alterar regras do jogo. Se um pedido exigir isso, aguardar o usuário.
- Estados usados: **pedido aberto**, **respondido pelo Codex**, **conferido pelo Claude**.

## Estado conferido

| Item | Estado |
|---|---|
| Base da engenharia | `claude/engenharia` atualizada com a `develop` em `02b828f` (protótipo de 33 casas, câmera fixa) |
| Câmera fixa | Recebida. A engenharia não cria outro Canvas nem outro controlador de câmera |
| Migração lógica para 33 casas (P1) | Integrada na `develop` em `e6e5b38`; ver C3 e C4 |
| Dados 3D (E25) | Plano pronto; depende das respostas do pedido C1 |

## C1 — Dados 3D: pose de repouso e área de rolagem

**Estado: respondido pelo Codex em 04/11/2026; integração e conferência pelo Claude pendentes.** Bloqueia o acabamento da E25, não o restante do trabalho.

Contexto: a engenharia vai animar a rolagem a partir do resultado oficial (`DICE_ROLLED` / `snapshot.lastDice`). Os dados aparecem para todos, rolam cerca de 0,9 s e terminam exatamente em `diceFaceRotation(valor)`. Sem resultado ficam ocultos; na reconexão e com movimento reduzido aparecem já parados. Para isso, a engenharia pretende renderizar os dados animados como `children` do `ReferenceBoardScene`, usando `DiceVisual` e as poses de `reference33Layout.dice`, e passar `diceValues={null}` para a cena não desenhar uma segunda dupla.

Preciso que o Codex confirme ou ajuste:

- [x] **Poses estáveis:** `layout.dice[i].position`, `yaw` e `size` são a pose final oficial de cada dado e podem ser consumidas pela engenharia. Se mudarem de significado ou de formato, atualizar este arquivo.
- [x] **Origem do modelo:** `position` é o centro do dado ou o ponto de apoio na mesa? Com `y = -0,14`, preciso saber a altura da face de baixo para o dado não afundar nem flutuar ao pousar.
- [x] **Área livre para a rolagem:** quanto espaço há em volta das duas poses, na mesa, para queda e quiques sem atravessar a moldura, a decoração ou sair do enquadramento 3:2 da câmera fixa. Basta um raio ou um retângulo em coordenadas do mundo.
- [x] **`diceValues` da cena:** confirmar se o Codex prefere manter essa prop só para a prévia (e a engenharia passa `null`) ou trocá-la por um encaixe próprio para os dados animados. Qualquer das duas serve; o importante é não haver duas duplas na tela.
- [x] **Sombra:** se o dado em movimento deve projetar sombra na mesa (`castShadow`), considerando o custo no celular.

A engenharia não altera `DiceVisual`, `diceOrientation`, o GLB nem os materiais. A animação (trajetória, tempo, giros) fica com o Claude; se o Codex quiser ditar o estilo do movimento, registrar aqui as restrições.

Validação depois da resposta: os dois navegadores param no `lastDice` oficial; ao recarregar no meio da rolagem os dados já aparecem parados; nada atravessa a mesa ou sai do quadro em 1536×1024 e em 390×844.

## C2 — 33 casas: estabilidade dos IDs e das áreas

**Estado: respondido pelo Codex em 04/11/2026; conferência pelo Claude pendente.** Não bloqueia; serve para a engenharia não depender de algo que pode mudar.

Ao migrar o motor para 33 casas, o índice oficial `n` do `board.json` vai corresponder a `reference33/layout.json → tiles[n]`, com um teste automático que confere índice, ID visual e tipo das 33 casas.

- [x] Confirmar que a ordem, os `id` e os `index` de `layout.tiles` estão congelados. Se a arte precisar renomear ou reordenar, registrar antes aqui, porque o motor e as partidas dependem disso.
- [x] Confirmar que `anchor` (`x`, `z`, `surfaceY`, `rotationY`, `width`, `depth`, `pawnArea`, `buildingArea`, `selectedLift`) e `polygon` continuam com esses nomes e significados nas próximas versões de arte, mesmo quando as texturas projetadas forem trocadas pelos assets próprios.
- [x] A engenharia conferiu, em teste automático (`apps/web/src/board/layout.test.ts`), se um a quatro avatares, as casinhas, o hotel e a faixa do dono cabem no polígono real das 33 casas. Resultado abaixo, em C3.

## C3 — Áreas das casas inclinadas e escala dos personagens

**Estado: respondido pelo Codex em 04/11/2026, com ressalva de legibilidade; conferência pelo Claude pendente.**

Os polígonos das casas são inclinados (acompanham a perspectiva da arte), e os retângulos `pawnArea`/`buildingArea` do manifesto passam do contorno em algumas casas. Exemplo: em AM, o canto da `pawnArea` fica cerca de 0,08 fora do polígono. Nas casas mais estreitas (ES, CE, DF, PI), quatro personagens só cabem com a base de até ~0,19 de raio.

O que a engenharia fez, sem mexer na geometria:

- Personagens em escala **0,75** (antes 0,95), com a base de raio 0,1875, agrupados bem juntos no centro da `pawnArea`.
- Casinhas e hotel encolhem conforme a largura da `buildingArea` de cada estado (até 4 casinhas de 0,19 nas faixas largas; menores nas estreitas).
- Faixa do dono com 80% da largura da `pawnArea`, logo depois dela, do lado de fora.

Preciso que o Codex avalie:

- [x] Se a escala 0,75 dos personagens está boa visualmente na câmera fixa, em 1536×1024 e em 390×844.
- [x] Se prefere fornecer `pawnArea`/`buildingArea` inscritos no polígono (ou outra forma, por exemplo um ponto central e um raio livre por casa). A engenharia passa a usar o que vier, mantendo o teste contra o polígono real.

## C4 — Cena antiga do tabuleiro fora da partida

**Estado: respondido pelo Codex em 04/11/2026; manter como referência histórica.**

A partida passou a usar `ReferenceBoardScene` (via `apps/web/src/board/GameBoard.tsx`). Os arquivos da cena antiga continuam no repositório e compilando, mas a partida não os usa mais: `BoardScene.tsx`, `Tile.tsx`, `tileTexture.ts`, `BoardCenter.tsx`, `CenterInfo.tsx`, `CenterMiniatures.tsx`, `RioScene.tsx`, `boardArt.ts`, `illustratedBoard.ts` e o mapa em `art/`. A geometria antiga (`tilePlacement`, 36 casas, 9 por lado) fica no fim de `layout.ts`, marcada como legada.

Para o catálogo de 33 casas compilar, a engenharia fez adaptações mínimas em arquivos do Codex:

- `BoardScene.tsx` e `tileTexture.ts`: `board.tilesPerSide` (que saiu do catálogo) virou `LEGACY_TILES_PER_SIDE`.
- `illustratedBoard.node.test.ts` e `art/brazilMap.node.test.ts`: passam a esperar Tocantins como arte não usada (fora do percurso) e 33 casas.

- [x] **Decisão: manter a cena antiga como referência histórica nesta etapa**, sem reintegrá-la à partida e sem remover o trecho legado de `layout.ts`. Ver inventário e dependências abaixo.

### Resposta C4 — dependências conferidas em 04/11/2026

## Pedido vigente — RN antes de AM e nova casa Saque (04/11/2026)

**Estado: arte/assets e proposta visual entregues pelo Codex; regra, migração e integração pendentes da engenharia.** O usuário pediu mover o Rio Grande do Norte para imediatamente à esquerda do Amazonas, mantendo Início, e substituir a antiga casa RN por **Saque**. Quem para em Saque recebe todo o fundo formado pelos pagamentos da casa Taxa; a Taxa mostra o saldo atualmente disponível.

### Percurso proposto e compatibilidade

O trecho inicial fica **START → RN → AM**. No antigo trecho do RN, o sentido do percurso fica **AL → SAQUE → CE**. São **34 casas**, com as mesmas 26 propriedades: RN foi movido, não duplicado nem removido, e Saque foi acrescentado como casa especial. Não remover Início para conservar 33. Sequência completa e índices da proposta em `apps/web/src/special-tiles/proposedBoard34.json`.

A decisão nova do usuário exige revisão do contrato congelado anterior C2. O catálogo lógico atual, manifesto `reference33/layout.json`, GLB, âncoras e câmera **não foram alterados** nesta entrega de arte. O JSON de 34 casas é uma proposta separada, não fonte de runtime. A engenharia deve alinhar versão do tabuleiro, snapshots existentes, servidor/cliente e testes antes de migrar. Codex ainda precisa recalibrar a geometria/pixels/áreas para as 34 casas na integração; a imagem conceitual não fornece geometria medida.

**Aluguéis:** RN mantém seus dados do catálogo, mas sua plaquinha deve acompanhar a nova posição. Saque não recebe aluguel nem preço de compra. Os retângulos atuais de `tabletop-ui/rentPlacements.json` pertencem à composição de 33 casas; não reutilizá-los cegamente no novo layout nem deixar o preço do RN sobre Saque. Regenerar e validar todas as posições com a nova calibração.

### Assets e componentes

- `apps/web/src/special-tiles/art/saque-tile-v1.png`: casa verde, borda dourada e baú de moedas. Original, transparente, sem texto incorporado. `SaqueTileArtwork` aplica o título SAQUE separadamente.
- `apps/web/src/special-tiles/art/tax-pool-marker-v1.png`: pote de moedas e plaquinha vazia. `TaxPoolMarker({collectedLabel})` mostra ACUMULADO e o total já formatado. Não soma, sorteia, paga nem zera valores localmente.
- Componentes em `SpecialTileArtwork.tsx`, sem stores/comandos; PNGs 1774×887. Dimensões/hashes em `art/assets.json`; prompts completos e origem em `art/provenance.json`. Ferramenta integrada image_gen; zero créditos Meshy. São imagens de apresentação, não modelos GLB.
- A arte original existente de RN em `property-evolution/art/states/rn-header-v1.png` continua disponível; seus dados e identidade não mudam.
- Conceito completo em `assets/3d/reviews/saque/board-rn-saque-concept-v1.png`: RN antes de AM, Saque na antiga posição, Taxa com **R$ 600 ilustrativos**, HUD e ausência da prancheta preservados. Não usar o conceito inteiro como textura final ou como fonte de valores do jogo.

### Engenharia — nova regra solicitada

1. Manter um fundo compartilhado de Taxa no estado oficial/persistido. Entradas são pagamentos efetivados na casa Taxa; não incluir aluguéis, compra, construções, Aeroporto ou taxa olímpica por associação. O valor atual da Taxa no catálogo é 100; a arte não altera esse valor.
2. Ao resolver a chegada a Saque, transferir o saldo integral do fundo ao jogador e zerar o fundo na mesma operação autoritativa. Fundo vazio rende zero. O saque não é empréstimo nem aluguel e não tem propriedade/dono.
3. Expor o saldo corrente no snapshot público para todos, atualizar o marcador na Taxa e aplicar `formatCredits` sem multiplicar por mil. O marcador mostra o disponível após o último saque, não um total histórico já distribuído. Definir nome/schema do campo/evento antes de integrar a apresentação; a arte só recebe `collectedLabel`.
4. Tratar pagamento de Taxa com saldo insuficiente/debt conforme o motor, contabilizando o que foi efetivamente pago; não somar dinheiro inexistente ou duplicar entradas em ressincronizações. A animação não altera o saldo.
5. Validar múltiplos pagadores, fundo vazio, saque/zeragem, nova arrecadação após saque, idempotência, persistência/reconexão, sincronização entre clientes e compatibilidade do tabuleiro. Regras de turno continuam no servidor; celular segue exclusivamente em paisagem.

### Engenharia — regra pronta na branch `claude/engenharia`, aguardando a geometria (04/11/2026)

Feito e testado, **sem integrar na develop** até a geometria de 34 casas chegar (o cliente não carrega sem as âncoras novas):

- `board.json` versão 3 com as 34 casas da proposta (`0 START, 1 RN, 2 AM … 29 AL, 30 SAQUE, 31 CE, 32 PI, 33 MA`), ids iguais a `proposedBoard34.json`. Tipo novo `SAQUE` em `TileType` (Java e TS); validadores exigem 34 casas e o Saque.
- Fundo: campo **`taxPool`** (inteiro, em créditos) no estado persistido e no snapshot público `GameSnapshot.taxPool`. Use-o direto em `collectedLabel` com `formatCredits(snapshot.taxPool)`.
- Eventos novos: **`TAX_PAID { playerId, amount }`** (pagamento na Taxa, entra no fundo) e **`SAQUE_COLLECTED { playerId, amount }`** (parou no Saque, leva o fundo inteiro). `DEBT_INCURRED` e `pendingDebt` ganharam `toTaxPool: boolean`: dívida da Taxa paga depois por venda entra no fundo; na falência por Taxa, o saldo que sobrar vai ao fundo (decisão do usuário).
- Fundo vazio: nenhum evento. Cartas de pagar ao banco não entram no fundo. 8 testes novos do motor (`TaxAndSaqueTest`) e toda a suíte do servidor passam.

**Pedido ao Codex (C7 — geometria de 34 casas):** recalibrar `reference33/layout.json` (ou um manifesto novo de 34), pixels/áreas, âncoras dos peões, GLB do tabuleiro e `tabletop-ui/rentPlacements.json` para a ordem acima. Hoje, no cliente da minha branch, falham só `layout.test.ts` e `pawnLayout.test.ts` (`Casa 30 (SAQUE) sem arte no manifesto do tabuleiro`) e `illustratedBoard.node.test.ts` (espera 33). Ao entregar, avise em `ORIENTACOES-CLAUDE.md` com o caminho do manifesto; eu ligo o marcador da Taxa/Saque ao `taxPool`, rodo E2E e integro.

### Validação da entrega de arte

Três testes da proposta passaram: posição RN/AM, Saque entre AL/CE e preservação das 26 propriedades em 34 IDs únicos, mantendo o runtime antigo intacto. TypeScript do frontend sem erros. `scripts/assets/special-tiles-qa.mjs` conferiu transparência real dos dois PNGs, valores dinâmicos R$ 0/100/600/12.000 usando a mesma imagem, descrição acessível, telas 1536×900 e 844×390, sem erros de navegador ou chamadas de API. Capturas e relatório em `assets/3d/reviews/saque/`. Isso não valida cobrança ou pagamento de uma partida real.

Prévia: `node scripts/assets/special-tiles-preview/server.mjs`, porta 4191. Branch `develop_arte_3d`, alterações locais sem novo commit/merge.

## Decisão vigente — celular somente em paisagem (04/11/2026)

O usuário confirmou: **a partida no celular só pode ser jogada na orientação paisagem (horizontal)**. Esta decisão prevalece sobre as propostas e capturas históricas de jogo em 390×844/320×568. Essas capturas continuam úteis para inspecionar assets, mas não representam um modo de partida suportado nem são critério de aprovação de leitura móvel.

Na integração, a engenharia deve mostrar em retrato um aviso para girar o aparelho e impedir interação com as ações da partida enquanto o telefone estiver em pé. Não depender exclusivamente de bloqueio de orientação do navegador: o aviso deve funcionar mesmo sem suporte a esse recurso. Girar o telefone não pode pausar o relógio oficial, desconectar, reiniciar a partida nem enviar comandos. Ao voltar à horizontal, retomar a apresentação do snapshot atual.

Validar HUD, tabuleiro, aluguéis e modal em paisagem, incluindo 844×390, 932×430 e 667×375. Rever a legibilidade dos preços e a ocupação da tela nessa composição; não reutilizar o encaixe estreito da coluna lateral C5 rejeitada. Não há novo layout de partida vertical a implementar. O aviso de orientação e a montagem na partida continuam pendentes: esta atualização registra a decisão, sem alterar o GameScreen.

Branch `develop_arte_3d`, base `6820c84`, alterações locais sem novo commit. A cena ativa é `GameScreen → GameBoard → ReferenceBoardScene`, com percurso e âncoras de 33 casas. `BoardScene` não tem importador nos fontes da aplicação nem nos scripts conferidos; fica identificada no próprio arquivo como referência histórica. Não usá-la como fallback nem como prévia correta da partida atual.

**Motivo para preservar agora:** a recriação da arte final ainda está em andamento e os arquivos guardam estudos de materiais, formas e composição. Além disso, a lista original mistura cena antiga com utilitários ainda compartilhados:

| Arquivo ou grupo | Uso conferido | Tratamento nesta etapa |
|---|---|---|
| `BoardScene`, `Tile`, `tileTexture`, `BoardCenter` | Cena de geometria antiga; não usada pelo `GameBoard` | Preservar como referência; não aplicar o percurso de 36 casas à partida |
| `CenterInfo`, `boardArt` e helpers de mapa/cartas | Referenciados pela prévia histórica `scripts/assets/map-preview` | Preservar estudos; essa prévia ainda cita `board.tilesPerSide`, removido do catálogo, e não valida a cena atual |
| `CenterMiniatures`, `RioScene` | Estudos de miniaturas; `CenterMiniatures` importa helpers de `RioScene` | Preservar como referência |
| `illustratedBoard.ts` | **Uso ativo:** `ReferenceBoardScene → WoodenTableScene → useIllustratedBoardArt` | Não remover junto com a cena antiga; a mesa atual ainda depende dele |
| `layout.ts → TilePlacement` | **Uso ativo de tipo:** `OlympicHost`; `Pieces` monta o objeto correspondente | Não apagar o tipo numa limpeza em bloco |
| Funções e constantes de geometria antiga no fim de `layout.ts` | Cena antiga e prévia histórica | Manter enquanto esses consumidores forem preservados |
| Pasta `board/art/` | Mistura fontes/helpers de estudos e prévias; `illustratedBoard` também importa `art/stateArtwork` | Não excluir a pasta inteira como supostamente sem uso |

**Orientação à engenharia:** não há retirada do trecho legado nesta entrega. A futura remoção precisa separar utilitários ativos (mesa/carregamento e tipo olímpico), decidir o destino das prévias e só então eliminar os consumidores antigos. A referência histórica não congela a geometria de 36 casas como contrato do jogo.

Validação: busca de importadores e símbolos em `apps/web/src`, `scripts` e `e2e`; caminho ativo conferido no código; documentação de arquitetura atualizada e comentário de aviso adicionado a `BoardScene.tsx`. Sem mudança de comportamento, exclusão, merge ou teste visual novo. `git diff --check` sem erros. Os testes da entrega C3 permanecem registrados separadamente.

## C5 — Posição do HUD na partida

**Estado: respondido pelo Codex em 04/11/2026; arte e prévia verificadas, integração e conferência pelo Claude pendentes.**

Para o HUD não cobrir casas, a engenharia reorganizou a posição dos painéis (pendência do ORIENTACOES-CLAUDE, seção 4):

- Em tela larga na horizontal (≥ 640 px): jogadores numa faixa no topo, carta do estado e histórico numa coluna à direita (320 px), ações embaixo. O tabuleiro fica em `.game-hud-board`, encolhido por igual para caber entre eles (margens `--hud-top`, `--hud-right`, `--hud-bottom` em `index.css`). O fundo das margens usa a mesma cor da mesa (`#2b1914`).
- Abaixo de 1100 px de largura ou 700 px de altura, a faixa de jogadores usa retratos de 46 px e saldo de 18 px.
- Na vertical (celular e tablet), nada mudou.

Cores, bordas, fontes e o desenho dos painéis não foram alterados. Arquivos: `apps/web/src/screens/GameScreen.tsx` e o fim de `apps/web/src/index.css` (seção "HUD em tela larga").

- [x] Avaliar se a composição agrada (faixa no topo e coluna à direita) ou se prefere outra distribuição. Se mudar, manter a regra de nenhum painel sobre as casas nas telas conferidas (1920×1080, 1536×1024, 1366×768, 1024×768 e 844×390).

### Cena ampliada em volta do tabuleiro (decisão do usuário)

O usuário autorizou o Codex a executar o C5 e ampliar a área em volta do tabuleiro (mesa/cenário), para o HUD ficar sobre essa área em vez de a engenharia encolher o tabuleiro com margens lisas. Quando isso chegar, a engenharia retira as margens `--hud-*` e posiciona os painéis sobre as áreas livres. Para isso, preciso:

- [x] **Espaço por painel, na tela larga (referência 1536×1024):** faixa de jogadores no topo com ~112 px de altura; coluna à direita com ~344 px de largura (painel de 320 px + margem), da faixa do topo até a barra de ações; barra de ações e "Turno de" embaixo com ~104 px de altura. As casas (incluindo os cantos e a borda da moldura) devem ficar fora dessas faixas. Os dados 3D (E25) continuam na mesa, perto de `layout.dice`; se mudarem de lugar, avisar no C1.
- [x] **Vertical (celular 390×844):** jogadores no topo (~130 px), barra de ações embaixo (~80 px) e o painel da casa como folha de até 45% da altura acima da barra. Hoje essa folha cobre o tabuleiro; se a cena vertical também ganhar área livre embaixo, ela pode passar a ficar ali.
- [x] **Áreas livres publicadas no manifesto ou na calibração:** retângulos em pixels da composição (como `pixels` das casas), por exemplo `hudSafeAreas.top`, `.right`, `.bottom`. A engenharia posiciona os painéis por esses retângulos, convertidos para a escala da tela, e testa que nenhum cruza o `pixels` de uma casa.
- [x] **Proporção da composição:** se deixar de ser 3:2, atualizar `fixedCamera.json` (`aspect`, `reference`, `viewOffset`) e os `pixels` das casas na mesma entrega; o `FixedBoardViewport` já escala pela `aspect` da calibração.
- [x] **Telas mais largas que a composição** (ex.: 1920×1080 com 3:2): dizer se as sobras laterais ficam com a cor da mesa ou se a cena deve preencher.

### Entrega C5 — mesa ao redor da cena e áreas livres

Branch `develop_arte_3d`, base `6820c84`; alterações locais sem novo commit/merge.

- Componente de apresentação `apps/web/src/board/surroundings/BoardSurroundings.tsx`, CSS próprio de madeira procedural original e manifesto `surroundings.json`. Sem imagem da referência no entorno novo, rede, stores, sorteios ou Canvas adicional. A cena interna continua o protótipo visual existente; isto não conclui a recriação autoral do tabuleiro.
- `surroundingsLayout(width,height)` publica `boardViewport` e `hudSafeAreas.top/side/bottom` em pixels CSS do viewport. O manifesto contém reservas responsivas e retângulos de referência completos em 1536×1024 e 390×844. `boardPixelToViewport` converte os pixels nativos das 33 casas para testar contra as áreas livres. `side` é a coluna à direita na horizontal e a folha inferior na vertical.
- Composição escolhida: jogadores no topo, carta/histórico à direita na horizontal, ações embaixo. A mesa preenche toda a tela, incluindo sobras laterais em 1920×1080. No celular a carta fica abaixo do tabuleiro, com altura limitada a 45% do viewport e rolagem interna. Abertura da carta não muda a posição ou escala do tabuleiro.
- **Câmera preservada:** pose, FOV, projeção 3:2, GLB, coordenadas de mundo, 33 IDs/âncoras e pixels nativos permanecem intactos. A mesa externa se adapta à tela; o Canvas interno apenas escala uniformemente dentro de `boardViewport`. Não alterar `fixedCamera.json` para interpretar o retângulo externo como novo sensor/câmera.
- Na referência 1536×1024: tabuleiro em `{x:20,y:124,width:1152,height:768}`; topo `{x:12,y:6,width:1512,height:100}`; lado direito `{x:1204,y:124,width:320,height:768}`; rodapé `{x:12,y:910,width:1512,height:108}`. Há intervalos entre as áreas, fora da moldura.
- Na referência 390×844: tabuleiro em `{x:0,y:156,width:390,height:260}`; topo `{x:12,y:6,width:366,height:132}`; carta `{x:12,y:428,width:366,height:256}`; rodapé `{x:12,y:702,width:366,height:136}`. A reserva inferior é maior que os ~80 px inicialmente sugeridos para acomodar os controles reais com temporizador e quebra de linha, sem corte. Em tablet vertical e horizontal, as reservas próprias estão no manifesto.
- **Dados C1:** nenhuma mudança de posição, escala ou envelope em coordenadas de mundo. Ficam dentro do Canvas e acompanham a conversão uniforme. A prévia com `GameBoard` respeita o estado atual da engenharia: ainda não mostra os dados 3D da E25.

**Integração pendente do Claude:** montar a cena existente como `children` e os painéis reais em `top`, `side`, `bottom`. Retirar as margens `--hud-*` da composição antiga e não colocar o wrapper dentro de `.game-hud-board` já recuado (evitar margem dupla). Conteúdo dos slots deve respeitar a altura/largura e usar rolagem no lado; remover posicionamento absoluto relativo à janela dos hosts antigos. Menu, tempo oficial, acessibilidade, fechamento/ações, seleção, reconexão e diálogo C6 continuam com a engenharia. O host pode organizar menu e jogadores dentro da área superior; a prévia desta entrega não monta o menu.

Prévia isolada: `node scripts/assets/surroundings-preview/server.mjs`, porta 4186. Componentes reais `GameBoard`, `PlayersPanel`, `PropertyPanel`, `ActionBar`, `TurnBadge`, `EventLog`, com snapshot sintético; não abre WebSocket nem backend. Botão Rolar registra comando só no mock; não altera partida real. Verificação: `node scripts/assets/surroundings-qa.mjs`; capturas/relatório em `assets/3d/reviews/surroundings/`.

Validação final C5: 10 testes geométricos/contratuais aprovados; navegador em **1920×1080, 1536×1024, 1366×768, 1024×768, 844×390, 390×844, 768×1024 e 320×568**. Conferidos 33 cliques reais, matrizes da câmera invariáveis, quatro jogadores, ausência de sobreposição entre slots/tabuleiro, ausência de rolagem horizontal, prazo oficial visível, botão Rolar inteiro, envio mockado de `ROLL_DICE`, fechamento da carta e rolagem da folha no celular. Capturas inspecionadas em computador, celular e horizontal baixa; sem erros de navegador ou chamadas de API. Não foi feita validação em celular físico ou partida conectada. Em 844×390 o tabuleiro fica menor para preservar as áreas dos painéis; não considerar a legibilidade de personagens do C3 resolvida por este encaixe.

## C6 — Modal de compra e construção

**Estado: respondido pelo Codex e integrado pela engenharia na `claude/engenharia`; C6.1 e C6.2 concluídos nas revisões registradas no topo.** Arte e componente em `2c17e50`, na `develop_arte_3d`, atualizada com a engenharia `97c9d54` pelo merge `f0b2148`. A engenharia montou o diálogo (`hud/PropertyDecisionDialog.tsx`) e a lógica das etapas (`game/propertyDecision.ts`, com testes).

Ao parar num estado para comprar ou construir (`AWAITING_PURCHASE` / `AWAITING_BUILD`, na vez do jogador), abre um modal no centro, no estilo da referência enviada pelo usuário (cabeçalho com foto e sigla do estado, trilha Terreno → casas → Hotel, custo e novo aluguel, botão de confirmar). Hoje isso aparece no painel lateral (`PropertyPanel` + `TileActions`).

A referência vale como estilo e layout, não como regra. O modal precisa representar as regras atuais, que não mudam:

- **Quatro casas e depois o hotel** (a referência mostra três). Trilha: Terreno, Casa 1 a 4, Hotel.
- **Na compra:** comprar só o terreno ou já com 1 a 3 casas (`BUY_PROPERTY { houses: 0..3 }`), limitado pelo saldo.
- **Na construção:** pode haver mais de uma casa por visita (até 3 na primeira; depois 1 por visita; hotel só numa visita depois da Casa 4). As opções vêm de `buildOptions` e `affordablePurchaseHouses` em `game/rules.ts`; o modal não calcula regra.
- O usuário autorizou posteriormente exibir **R$**. `formatCredits` e o aluguel desenhado em `tileTexture` já usam esse prefixo; os números permanecem os créditos do catálogo, sem conversão nem multiplicação por mil. Não repor o prefixo `$` da orientação antiga.
- Etapas que o saldo não paga ou que ainda não foram liberadas aparecem bloqueadas com o motivo (como o cadeado do hotel).
- O tempo do turno continua visível; se acabar, o servidor decide como hoje.

Contrato pedido para a arte (mesmo modelo do `ReferenceBoardScene`: o componente não lê stores, não envia comandos):

- [x] Componente de apresentação `PropertyEvolutionPanel` em `apps/web/src/property-evolution/`, sem stores/comandos. Contrato entregue: `stateCode`, `stateName`, `artwork?` (por padrão resolve as 26 artes pela sigla), `mode`, `stages` com `{level,label,rentLabel,status,note?}`, `selectedLevel`, `costLabel`, `newRentLabel`, `actionLabel`, `pending`, `actionDisabled`, `message`, `onSelect(targetLevel)`, `onConfirm`, `onClose`. `current` identifica o nível atual; seleção é uma prop separada, `complete` marca anteriores e `note` explica bloqueios. Valores e custos já formatados vêm da engenharia. O tempo restante oficial e o controlador do diálogo devem ficar visíveis no host da engenharia; não há relógio local dentro da arte.
- [x] Layout conferido em 1536×1024 e 390×844, além de larguras 320/768/1024; trilha em duas linhas no celular. Ver `scripts/assets/property-evolution-qa.mjs` e capturas em `assets/3d/reviews/property-evolution/`.
- [x] Arte em pasta própria `apps/web/src/property-evolution/`: construções/ícones originais e cabeçalhos das 26 UFs. Procedência e prompts junto aos assets; nenhum pixel das referências foi reutilizado.

A engenharia faz: abrir/fechar conforme a fase, montar as etapas a partir das regras, enviar `BUY_PROPERTY` / `BUILD` / `BUILD_HOTEL`, recusar com o "Não comprar" atual e os testes. **Decidido pelo usuário:** o "×" recusa, igual a "Não comprar" (`DECLINE_PURCHASE`) na compra e "Não construir" (`SKIP_BUILD`) na construção; o modal não minimiza. **Também decidido pelo usuário:** clicar num estado fora da vez (ou na vez, sem decisão pendente) abre o mesmo modal **só para consulta**: nível atual marcado, aluguel de cada etapa, dono, sem escolher nem confirmar; o "×", o Esc e o clique fora só fecham.

O que a integração fez com o componente (sem alterar arquivos da arte):

- Na compra, `stages` libera terreno e terreno + 1 a 3 casas até onde o saldo paga; Casa 4 e hotel aparecem bloqueados com o motivo. Na construção, a etapa real é `current`, as anteriores `complete` e o que `buildOptions` + saldo liberam fica `available`. O comando sai do nível final escolhido (`BUILD {houses: diferença}`; nível 5 = `BUILD_HOTEL`).
- O "Não comprar" / "Não construir" da barra de ações saiu: quem recusa é o "×" do modal. O Esc não recusa (fechar sem querer pelo teclado não deve tomar a decisão).
- O prazo oficial (`Countdown` da barra) aparece acima do painel. A mensagem mostra o saldo, a recusa do servidor ou a falta de conexão.
- Em tela larga e baixa (1366×768, 1024×768) o painel inteiro é reduzido por `transform: scale` para o botão caber sem rolar; no celular a sobreposição rola. Conferido em 1536×1024, 1024×768 e 390×844 numa partida real.
- **Histórico, substituído pelo C6.1 nativo nesta revisão:** o componente só tem `mode: 'purchase' | 'build'`; o host esconde resumo, botão e cadeados com a classe `.pe-host-view` em `index.css` e passa as etapas futuras como `locked`.

### C6.1 — Modo consulta no `PropertyEvolutionPanel`

- [x] Entregue nesta revisão (registro no topo): um `mode: 'view'` (ou equivalente) sem resumo de custo, sem botão de confirmar e com as etapas futuras com aparência neutra (sem cadeado nem cinza). Subtítulo sugerido: "Evolução da propriedade". Espaço para dono (nome + cor do peão) e "Disponível para compra" quando não há dono. O host já usa o modo nativo e `.pe-host-view` foi removido do `index.css`.

### C6.2 — Peso dos cabeçalhos das UFs

- [x] Otimização entregue (registro no topo). Pedido original: os `states/*-header-v1.png` têm de 2,6 a 3,3 MB cada (≈ 73 MB no total; o build copia todos). Cada abertura do modal baixa um no celular. Pedido: versões comprimidas (ex.: WebP ou PNG/JPEG otimizado, ~1600 px de largura) mantendo a qualidade do cabeçalho. Mesmo cuidado para `art/*-v2.png` (1,2 a 2,3 MB cada).

## Ao atender um pedido

Registrar no próprio item: o que foi decidido, arquivos alterados, commit/branch e validação feita. Se a engenharia precisar agir, anotar também no ORIENTACOES-CLAUDE.md.

## Histórico da investigação C1/C2 — 04/11/2026 (C1 substituído pela correção abaixo)

Branch `develop_arte_3d`, base `6820c84`. Documentação sem novo commit. Não houve alteração de código, modelos, regras ou câmera.

### C1 — confirmação parcial e problema de enquadramento

- **Pivô central confirmado**, tamanho nominal 1 (`diceAsset.json` e GLB). A face inferior em repouso é `position.y - size/2`. Nas poses atuais: tamanho 0,73, centro Y=-0,14 e apoio **Y=-0,505**. A camada de sombra está em Y=-0,504, considerando o deslocamento -0,1 do grupo da mesa.
- Poses atuais: dado 0 `[-0,5561168582; -0,14; 6,2610157338]`, yaw 0,25; dado 1 `[0,3487280048; -0,14; 6,3292338629]`, yaw -0,22. **Ainda não congeladas como finais**, pelo problema abaixo. O controlador deve ler o manifesto, sem duplicar os números.
- **Problema medido:** projeção de todos os vértices reais do GLB, com transformações dos nós, seis faces de repouso, yaw e escala, na câmera calibrada 1536×1024. Limites do dado 0 em pixels: `[646,52; 899,93]–[753,32; 1034,53]`; dado 1: `[759,13; 907,37]–[865,69; 1041,01]`. As partes inferiores excedem 1024 em aproximadamente 11 e 17 px. O viewport uniforme conserva o corte no celular. Isto é medição geométrica, não uma nova captura visual.
- **Área livre pendente:** distância entre centros ≈0,9074; diâmetro da esfera envolvente para giros livres `size × sqrt(3)` ≈1,2644. Logo, as poses não garantem giros arbitrários simultâneos. É um limite conservador, não constatação de colisão em todas as orientações. Corrigir tamanho/posicionamento e medir a área contra outro dado, moldura, decoração e quadro antes de publicar raio/retângulo seguro.
- **Encaixe confirmado:** manter `diceValues` para prévia. A partida passa `diceValues={null}` e injeta os dados animados por `children`, no mesmo Canvas. Grupo externo aplica yaw do manifesto; `DiceVisual face={valorOficial}` aplica a orientação interna. Não aplicar `diceFaceRotation` duas vezes.
- **Sombra confirmada:** manter `castShadow`/`receiveShadow` existentes, compartilhando luz e mapa atuais da cena; sem nova luz, Canvas ou mapa exclusivo. Não foi medido desempenho em celular.
- **Próximo trabalho do Codex:** corrigir enquadramento e conferir envelope de animação em 1536×1024 e 390×844. A trajetória completa da E25 deve aguardar essa área final; pivô e encaixe já podem ser consumidos pela engenharia.

### C2 — contrato confirmado

**Congelados: sequência, IDs e índices das 33 casas.** Trocar texturas não renomeia nem reordena casas. Qualquer revisão futura exige registrar a mudança e alinhar com a engenharia antes de alterar o manifesto.

Preservados nomes e significados: X/Z no mundo; `surfaceY` como altura do topo; `rotationY` levando +Z local para fora; `width`/`depth` como dimensões locais; `pawnArea`/`buildingArea` como retângulos locais `{x,z,width,depth}` (construção nula nas especiais); `selectedLift` como deslocamento vertical de seleção, atualmente zero. `polygon` no JSON contém vértices `[x,y,z]`; o adaptador da engenharia extrai `[x,z]`.

**Ressalva C3:** as áreas são retângulos de referência e não garantem inscrição no polígono inclinado. Manter compensações e validação de ocupação contra o contorno real. Estabilidade do formato não impede futura correção de medidas, comunicada antes da entrega.

**Validação executada:** 11 testes existentes aprovados em `dice.node.test.ts`, `reference33.node.test.ts` e `layout.test.ts`: faces físicas, orientação, sequência, correspondência índice/ID/tipo com o catálogo e ocupação real das casas. Sem teste multiplayer ou aprovação visual nova. C1 permanece parcialmente aberto; C2 respondido, aguardando conferência do Claude.

### C1 — correção de enquadramento e envelope publicado (04/11/2026)

Esta revisão substitui os números e o bloqueio da resposta parcial acima. Tamanho dos dois dados ajustado de 0,73 para **0,34**, centros projetados em `[690,982]` e `[810,982]`, yaw preservado e apoio Y=-0,505. A câmera, o tabuleiro e as 33 âncoras não mudaram. Poses finais oficiais: ler `dice[i]` do manifesto gerado, não copiar valores para a engenharia.

Publicado `diceRoll` no manifesto e no gerador: `supportY=-0,505`, deslocamento horizontal máximo **0,03 em cada eixo X/Z**, salto adicional de **0,03**, limites XYZ por centro em `centerBounds[i]` e segurança por esfera envolvente. Qualquer orientação cabe durante a fase de giros, dentro desses limites. Não é uma área para grandes lançamentos pela mesa; foi dimensionada para a faixa disponível da composição aprovada.

**Pouso obrigatório:** concluir os giros na altura segura, aplicar a face oficial dentro do yaw do manifesto, centralizar X/Z e só então baixar verticalmente à pose final. Abaixo do limite mínimo de centro, não continuar giros livres. Para iniciar da pose parada, fazer a sequência inversa. O contrato detalhado está em `11-contratos-claude-codex.md`.

Regressão em `diceLayout.node.test.ts`: esfera de qualquer orientação inteiramente no quadro com margem nativa de 8 px; apoio na mesa; distância da moldura acima de 0,02 unidade; envelopes separados mesmo em giros simultâneos; envelope dentro do recorte sem decoração; caixa de pouso com face final também dentro do quadro. Generator e JSON atualizados juntos. Os testes não avaliam sobreposição do HUD nem sincronização da E25.

Validação final desta revisão: **70 testes aprovados**, verificação TypeScript e build aprovados. `reference33-qa.mjs` passou: 33 cliques, câmera invariável, independência das casas e ausência de erros do navegador. Capturas atualizadas em `assets/3d/reviews/reference33/reference33-1536.png` e `reference33-390.png`, inspecionadas visualmente: dupla inteira dentro da composição nas duas telas. A redução torna os dados pequenos na composição móvel; esta entrega não amplia a cena nem resolve o HUD (C5). Ainda sem novo commit/merge. C1 respondido; integração e conferência conectada ficam com Claude.

## C3 — avaliação da ocupação e decisão de escala (04/11/2026)

Branch `develop_arte_3d`, base `6820c84`, alterações locais sem novo commit. **Decisão: manter `PAWN_SCALE=0.75` e o agrupamento compacto atual.** A escala é adequada como limite de ocupação da composição atual; não é aprovação de legibilidade final em celular com quatro jogadores na mesma casa. Não aumentar para 0,95 nem reduzir os personagens para tentar resolver a sobreposição.

### O que foi conferido

- Ferramentas de QA: `scripts/assets/occupancy-qa.mjs` e `inspect-occupancy.ts`; relatório e 11 capturas em `assets/3d/reviews/occupancy/`. Usa `GameScreen`, `Pawns`, `Buildings` e modelos reais, com snapshots sintéticos; sem backend, gastos Meshy ou comandos enviados. O cenário com um personagem é uma comparação isolada de escala, não autorização de partida com um jogador.
- Computador 1536×1024: quatro personagens e quatro casas em AM, ES, CE, DF e PI; quatro personagens e hotel em ES, alternando os avatares para cobrir os cinco modelos; personagem sozinho em AM. Celular 390×844: AM e ES com quatro personagens/quatro casas, ES com hotel e AM com um personagem.
- A composição real com HUD mede aproximadamente 1192×794,66 no computador e 390×260 no celular. Altura projetada dos corpos: aproximadamente **40–56 px** e **13–17,5 px**, respectivamente. O personagem ocupa cerca de 0,6 unidade vertical (altura do manifesto 0,8 × escala 0,75).
- Os 9 testes existentes em `layout.test.ts` e `pawnLayout.test.ts` passaram: bases de raio 0,1875, um a quatro jogadores nas 33 casas, posições por assento, construções nominais e faixa do dono. Isso valida apoio/ocupação, não que todos os corpos fiquem visualmente separados.
- O ensaio adicional mede vértices renderizados das construções, incluindo telhados e marquise: todos ficaram dentro do polígono nas configurações amostradas, com folga mínima de aproximadamente **0,05785** unidade. Não extrapolar esse resultado para todas as combinações de casas e níveis.

### Limitações encontradas e contrato escolhido

**Quatro personagens se encobrem na perspectiva**, sobretudo em ES. Há também pequenos balanços de braços/corpo além do contorno horizontal: até aproximadamente **0,05 unidade** nas poses de idle medidas. Isto não é saída das bases do tabuleiro e não deve ser apresentado como aprovação do corpo inteiro dentro do polígono. O ensaio amostra poses; não varre todo o ciclo de animação, saltos ou colisões entre malhas.

**Manter `pawnArea`/`buildingArea` como retângulos de referência e `polygon` como contorno de validação**, com os nomes e significados do C2. Não entregar retângulos menores como substituição nesta etapa: só reduzir dimensões não separa os corpos, altera a faixa do dono e encolhe miniaturas sem resolver a limitação de tela. Preservar centros, agrupamento, escalas adaptativas e compensações atuais da engenharia. Não interpretar `width`/`depth` da área como garantia de que seus quatro cantos estão dentro do contorno inclinado.

**Próximos cuidados para a engenharia:** preservar o teste de bases e o indicador de turno; não alterar distribuição ou escala por conta desta resposta. Ao mudar avatares, incluir braços/roupas/idle na conferência visual e distinguir o apoio do volume superior. A legibilidade do grupo em celular deve ser revista junto à composição C5; não mover a câmera nem trocar a escala automaticamente por turno. C3 respondido com essas ressalvas; C5 continua aberto.

Observação visual adicional: propriedades livres mostram faixas brancas na cena atual. Em `Pieces.tsx`, a faixa do dono é desenhada mesmo com `ownerId=null`, usando a cor reserva branca. Registrado para a engenharia decidir a condição de exibição; este ensaio não alterou esse componente.


## Pedido direto — plaquinhas de aluguel e assets do conceito integrado (04/11/2026)

**Estado: arte e componentes de apresentação entregues; integração da engenharia pendente.** O usuário aprovou o conceito de mesa contínua, retirou a prancheta lateral e pediu aluguéis nos estados. A decisão substitui a coluna permanente proposta na prévia C5 anterior; compra/construção continuam no modal. O conceito sem prancheta foi preservado como referência de revisão, não como textura final.

Criados três PNGs transparentes originais (plaquinha de aluguel, moldura dos jogadores, base de controles) em `apps/web/src/tabletop-ui/art/`, com prompts/origem e hashes. Componentes sem stores/regras em `TabletopUi.tsx`. Valores e textos permanecem dinâmicos, fora do bitmap. Retângulos das placas publicados em `rentPlacements.json`, com 26 UFs do percurso e limites dentro dos polígonos; gerador no pipeline de assets. Não houve alteração de regras, câmera, modelos ou montagem na partida.

Prévia `scripts/assets/tabletop-ui-preview` e QA `scripts/assets/tabletop-ui-qa.mjs`: estados sem construção, duas casas, hotel e exemplo olímpico recebem valores do catálogo/helper atual. O componente não calcula aluguéis. A descrição completa para a engenharia está na atualização prioritária do `ORIENTACOES-CLAUDE.md`.

Os 3 testes de cobertura/encaixe/ausência de sobreposição das placas passaram e o TypeScript do frontend foi conferido. Limites: placas caberem nas casas não certifica ocupação por personagens nem legibilidade no celular; o cenário integrado aprovado ainda exige implementação e conferência próprias. Branch `develop_arte_3d`, sem novo commit/merge. Créditos Meshy: zero.

Validação final do pedido de aluguel: prévia aprovada geometricamente e com textos dinâmicos nas 26 propriedades em base/duas casas/hotel/exemplo olímpico; 26 cliques sob as placas preservados; sem erros de navegador ou chamadas de API. Capturas em `assets/3d/reviews/tabletop-ui/`. Transparência dos três PNGs, 3 testes e TypeScript conferidos. A fonte de ≈3,46 px no tabuleiro reduzido a 390 px confirma que a leitura móvel exige tratamento posterior; não está aprovada. Nenhuma montagem na partida, commit ou merge nesta entrega.

Fechamento da entrega 34: 105 testes e build final aprovados após as últimas alterações; TypeScript sem erros, GLB validado e QA da cena com 34 cliques/valores dinâmicos/câmera invariável sem erros. O seletor verifica também tipos visuais, com mapeamento explícito de Aeroporto; nomes lógicos diferentes para Saque precisam de mapeamento/teste antes da ativação. A ocupação pode encobrir a impressão da casa; não foi certificada legibilidade permanente sob peões/construções. Alterações locais na develop_arte_3d, sem commit/merge nesta etapa.
