# Orientações e pendências para o Claude Code

## V1 — mesma câmera e cartas móveis simplificadas, 08/11/2026

Atendidas na develop_arte_3d as orientações novas da engenharia (commit de referência 3f00838): GameScreen usa framing="standard" no computador e no celular; CameraRig preserva pose/quaternion/FOV da câmera calibrada e só muda o enquadramento pelas reservas medidas do HUD. A barra de ações móvel foi compactada conforme a engenharia. Os estilos mobileBoard dos estudos antigos ficaram restritos a data-mobile-study, evitando que a distribuição arquivada do HUD e a câmera antiga se tornem o padrão da V1.

No celular deitado, Board34Scene repinta os 26 cabeçalhos somente com a sigla maior, inclusive propriedades sem dono; o nome completo continua no computador e na consulta por toque. RentTags amplia a placa existente em 25% na largura e 60% na altura, mantendo a base e limitando a região aos limites do painel. Valores continuam vindo do host/currentRent, inclusive Apagão; sem mudança de regras. Preservados os PNGs/atlas originais, mipmaps, bias, anisotropia/DPR e os modelos/personagens atuais. No celular usa o atlas original 6K quando o hardware suporta, com fallback ao original padrão. Aluguéis continuam na fila opaca de ordem 20 e personagens em 30; os toques atravessam as etiquetas. Nenhuma geração de arte ou crédito Meshy.

Validação: build/TypeScript e 195 testes aprovados. Novo roteiro scripts/assets/v1-mobile-same-camera-qa.mjs monta o GameScreen real com WebSocket simulado e confere 1280×720, 800×360, 667×280 e 932×430 (seis jogadores), exatamente a mesma pose de câmera, 26 etiquetas e suas medidas, siglas maiores/ausência do nome completo na pintura móvel, atlas 6K, Apagão, consulta do nome completo ao tocar, gaveta de cartas, comando ROLL_DICE e bloqueio da partida em 390×844 com toque. Capturas/relatório em assets/3d/reviews/v1-mobile-same-camera/. Captura de consulta: property-full-name.png. Não é validação de multiplayer ou aparelho físico; limites de leitura dependem do viewport.

Essa orientação substitui as expectativas dos roteiros antigos mobile-diamond/mobile-clarity que exigiam outra pose ou etiquetas voltadas para a câmera. Mantê-los como histórico dos estudos. Publicação autorizada pelo usuário: registrar os ajustes na develop_arte_3d e integrá-los à develop. O tabuleiro V2 continua separado na codex/tabuleiro-v2.


## Versão 1 — atualização com a develop, 08/11/2026

Definição vigente do usuário: develop_arte_3d é a branch da versão 1; codex/tabuleiro-v2 é a branch da versão 2. Atualizada a V1 com origin/develop 7913772. A implementação nova do tabuleiro V2 permanece na sua branch própria; referências a esse conceito nas seções antigas abaixo são histórico anterior à separação das versões.

Conflito de GameScreen resolvido combinando o enquadramento existente da V1 com useShownTaxPool da develop, para que a Taxa acompanhe a chegada do personagem. Mantidas as correções de movimento, saldo, turno, escolha de estado, venda e regras recebidas da develop, assim como os ajustes visuais já existentes da V1.


Validação da atualização: build/TypeScript e 195 testes do frontend aprovados; 241 testes do servidor aprovados, sem falhas ou testes ignorados.

## Checkpoint autorizado na develop_arte_3d — 08/11/2026

O usuário autorizou commitar o trabalho pendente nesta branch e depois atualizá-la com a develop. Este checkpoint inclui correções de personagens/aluguel, ícone do app, gaveta de cartas, estudos e direção de arte aprovada. Os protótipos rejeitados ficam registrados como histórico de revisão; não representam a implementação aprovada. Preservar os modelos atuais de terreno/casas/hotel. A nova arte ainda precisa ser implementada. Não fazer merge destas alterações na develop nesta solicitação.


## Preservar as casas atuais — determinação do usuário, 08/11/2026

O usuário reforçou após aprovar o conceito: “lembrando de permanecer as mesmas casas que tem hoje”. Preservar a família de modelos atual: terreno, casas dos níveis 1 a 4 e hotel, já criada e integrada. Não substituir essas construções pelas casas ilustrativas do conceito nem gerar outra família. Preservar também as 34 casas do percurso, estados, especiais, IDs e sequência oficial. A direção aprovada orienta acabamento e apresentação; não autoriza trocar os modelos ou o catálogo atuais.


## Direção de arte APROVADA pelo usuário — 08/11/2026

O usuário aprovou explicitamente o conceito assets/board-mobile/art-direction-v2/concept.png: “Ficou perfeito, se ficar assim ta ótimo”. Esta é a referência visual vigente para a implementação. A aprovação é do acabamento, riqueza das ilustrações, integração dos aluguéis e proporções do HUD. Os estudos anteriores clean/spacious/rectangular continuam rejeitados e não podem ser promovidos como se fossem a versão aprovada.

Preservar na adaptação: ilustrações brasileiras ricas e reconhecíveis, molduras finas champagne/douradas, fundos marfim, azul/esmeralda, cenário de praia com madeira, logo/centro ilustrado, aluguéis legíveis e integrados às casas, HUD compacto nos quatro cantos e construções na área interna sem esconder preços. Não trocar por grandes faixas vazias, placas pretas flutuantes ou texturas deformadas. A fidelidade deve ser avaliada por comparação visual com o conceito, além dos testes funcionais.

Correções obrigatórias ao converter conceito em jogo: mapa oficial de 34 casas/26 estados, IDs e sequência do catálogo, apenas um PR, quatro cantos corretos, valores oficiais e saldo acumulado da Taxa/Saque. O conceito gerado contém diferenças de quantidade/posição e preços ilustrativos; não usá-lo como textura única do tabuleiro nem como fonte de regras. Separar recursos da apresentação, textos/dados dinâmicos e regiões de interação. Reutilizar as fontes originais aprovadas onde alcançarem o acabamento; gerar assets específicos quando necessário, mantendo a composição aprovada.

A aprovação foi registrada, junto com o roteiro de adaptação em assets/board-mobile/art-direction-v2/IMPLEMENTACAO.md. O jogo padrão ainda não foi convertido para essa direção visual. Não apresentar o conceito como captura da implementação. Sem commit, merge ou créditos Meshy nesta atualização. Qualquer geração Meshy adicional exige informar o custo antes, conforme preferência anterior do usuário.


## Nova revisão de direção de arte — 08/11/2026

O usuário também rejeitou o estudo rectangular por perda de qualidade. NÃO promover qualquer uma das três reconstruções móveis como visual aprovado. O usuário quer preservar o acabamento ilustrado original e a riqueza das artes, com leitura/enquadramento de Business Tour.

Criado conceito de direção visual com image_gen integrado, referenciando o atlas original e a segunda captura Business Tour do usuário. Arquivo assets/board-mobile/art-direction-v2/concept.png; prompt em prompt.txt. É imagem conceitual, NÃO captura de implementação. Há diferenças de sequência/quantidade (incluindo repetição de PR) e valores ilustrativos; não usar essa imagem inteira como atlas nem como definição do catálogo. Avaliar acabamento, riqueza das ilustrações, proporção do HUD e integração dos aluguéis. Para produção, manter rigorosamente 34 casas, IDs oficiais e valores calculados.

Nenhuma nova alteração do renderizador nesta etapa. As propostas anteriores continuam isoladas. Sem Meshy, commit ou merge. Próxima etapa depende da revisão visual da proposta, antes de outra implementação.


## Reconstrução retangular após rejeição do esticamento — 08/11/2026

O usuário rejeitou a prévia spacious como esticada e sem acabamento. NÃO promover aquela versão nem considerar testes de área como aprovação estética. Sua deformação por trapézios e a projeção dependente da câmera antiga foram descartadas na nova direção.

Novo estudo separado ?mobileStyle=rectangular: rectangularLayout.ts monta as 34 casas em retângulos nativos; as 26 propriedades têm exatamente 1×3 unidades, cantos 3×3, lados com distribuição coerente da sequência oficial. RectangularBoardStudy.tsx cria geometria e texturas próprias por casa; não deforma o GLB nem usa sourceQ/atlas projetado. As artes originais v3, especiais e center-brasil-v2 são encaixadas com escala uniforme (contain), sem corte e sem ajuste independente de largura/altura. Texto cabe por redução da fonte, sem esticar glifos. Cada tela de propriedade reserva área interna para construção, imagem, sigla e faixa externa para aluguel. Valores continuam calculados pelo host e também constam do conteúdo acessível.

Os 34 assets efetivamente renderizados estão exportados em assets/3d/reviews/mobile-rectangular-study/tiles/. São exemplos do snapshot de conferência, inclusive preços dinâmicos; não usar seus valores fixos em produção. Norte/leste têm a arte/texto rotacionados em 180° para leitura na câmera do tabuleiro. texture-proportions.json registra arquivo-fonte, resolução e escala física de cada superfície: diferença máxima de densidade entre eixos menor que 0,04% (arredondamento de pixels). Proporção do arquivo preservada dentro da área da imagem.

Câmera nativa usa near=5, adequado à distância 100, para evitar z-fighting entre face e suporte separados por 0,001. Suportes usam caixas com dimensões exatas. Imagens-fonte carregadas por ImageLoader, sem enviá-las desnecessariamente como texturas à GPU; só os canvases das faces são texturas. Famílias Meshy existentes e modelos de personagens preservados; zero novos créditos.

Verificações: teste novo garante ângulos retos, medidas iguais das 26 propriedades e ausência de colisão entre casas/centro; script mobile-rectangular-study-qa.mjs espera as 34 faces carregarem antes das capturas, verifica escala de textura, seleção de RN por toque, gaveta e ROLL_DICE. Prévia em 800×360 e 667×280, DPR 2, snapshot com proprietários/níveis variados. Build e 178 testes aprovados. Somente estudo de desenvolvimento, sem substituir a versão padrão, commit ou merge. Revisões estéticas continuam necessárias; passagem de testes não implica aprovação visual do usuário.


## Propriedades ampliadas com artes originais — prévia de 08/11/2026

Preferência atual do usuário: manter as artes do tabuleiro; o estudo sem ilustrações não é a direção desejada. Nova prévia isolada ?mobileStyle=spacious restaura as mesmas ilustrações v3 dos 26 estados, artes especiais, centro-brasil-v2, moldura dourada e ambiente de praia. Não recriar ou substituir essas artes por casas lisas.

Centro reduzido para 76% em cada eixo (42,24% menos área). Todas as propriedades ganham área: norte +23,66%, leste +32,18%, sul +40,80%, oeste +31,08%; números medidos na geometria, com o contorno externo preservado. Bordas internas ajustadas em trapézios, cantos recompostos e centro reduzido em conjunto, sem sobrepor casas. Novo atlas separado models/board/board34-mobile-spacious-v1.webp, fonte compartilhada mobile-clean-atlas.ts; não sobrescreve o atlas original. Layout de estudo calculado por spaciousLayout.ts e selecionado por visualLayout.ts. IDs, sequência oficial, dados/regras e modelo GLB fonte não mudaram.

A malha clonada é deformada antes da projeção de UV, junto com os painéis, preços, âncoras, áreas de personagens/construções, contornos de propriedade e moldura olímpica. Para este estudo o host usa áreas conservadoras próprias, porque o antigo buildingZone pressupõe retângulos e fazia a escala das casas encolher em trapézios. As construções originais continuam presentes. Faixa de aluguel reduzida a 24% da profundidade para reservar mais espaço às ilustrações; preço continua no piso externo. Botão central até 320 px de altura reduzido a 112×28 para não cobrir as propriedades expandidas.

Verificação: novo teste de ganho de área, centro/contorno, ordem oficial e ausência de sobreposição entre todas as 34 casas e o centro. 177 testes aprovados com dois workers e build aprovado. Uma execução simultânea ao navegador teve timeout no teste existente de dados; passou ao repetir a suíte sem essa carga. Prévia real GameScreen com conexão simulada em 800×360 e 667×280, seleção de RN por toque, gaveta e comando ROLL_DICE conferidos; sem erros do navegador. Capturas/relatório em assets/3d/reviews/mobile-spacious-study/; script mobile-spacious-study-qa.mjs. Ainda é prévia separada; não houve commit, merge, serviço externo ou créditos Meshy.


## Direção visual móvel revisada com segunda referência — estudo de 08/11/2026

O usuário REJEITOU a versão com etiquetas grandes e pediu organização semelhante ao Business Tour; enviou uma segunda referência com aluguel em faixa externa. Não considerar mobile-clarity aprovado. Novo estudo isolado, disponível em desenvolvimento com ?mobileStyle=clean. Ainda não substitui o visual padrão da partida.

Criados assets próprios: models/board/board34-mobile-clean-v1.webp (6144×4096, cerca de 537 KB), mobile-clean-environment-v1.webp (fundo em gradiente, cerca de 8,5 KB), fonte scripts/assets/mobile-clean-atlas.ts e PNG de revisão. Casas claras, faixa de preço na borda externa, nome/sigla no meio e construção na área interna; centro livre com padrão discreto, ícones especiais vetoriais próprios. Molduras passam a cinza claro, sem dourado. HUD do estudo com quatro jogadores nos cantos, botão central azul e controles circulares à direita. Mantidos os modelos de construções e personagens existentes.

mobileCleanLayout identifica o sentido externo de cada painel pela geometria, sem pressupor que norte/sul/leste/oeste compartilhem orientação. RentTags no estudo pinta valores no piso da faixa externa, sem placa flutuante e sem R$ repetido em cada casa; legenda Aluguéis em R$ no HUD. Dados, regras e valores continuam oficiais; preços completos no conteúdo acessível e consulta de propriedade. Modo padrão e computador preservados. Para integrar futuramente, considerar fallback de textura para dispositivos limitados; o estudo é 6K.

Prévia real em 800×360 e 667×280 com WebSocket simulado, arquivos em assets/3d/reviews/mobile-clean-study/. Fonte/geração/captura: scripts/assets/mobile-clean-study-qa.mjs. Build e 176 testes aprovados. Sem serviços externos, Meshy, commit ou merge. Próximo passo: revisar esta composição com o usuário antes de promover o estudo a visual padrão.


## Nitidez e aluguéis no celular — revisão de 08/11/2026

Correção solicitada pelo usuário após a prévia em losango: o critério de atlas ainda usava o enquadramento padrão e escolhia 3K no celular. Agora mobile-diamond usa o atlas 6144×4096 existente quando maxTextureSize permite; fallback 3K em hardware incompatível. Anisotropia no máximo disponível, mipmaps/bias -0,5 e DPR até 3 preservados. Arte original, modelos, geometria e distância/enquadramento não mudaram nesta revisão.

MobileRentTag mantém cada preço ancorado no centro da placa original e renderiza texto com 10,5 px CSS, fundo azul-escuro, números claros e filete dourado. A placa acompanha a direção de profundidade da propriedade, com rotação voltada para a câmera para não achatar a altura das letras. RN/MA têm separação de 6 px junto ao Início. Textura própria a densidade 4; sem interceptar toques. Ordem opaca 20, alphaTest 0,05, depthTest/depthWrite falsos; personagens continuam em 30. Não recolocar etiquetas por cima dos personagens. O texto duplicado na textura plana é omitido somente no modo móvel; computador conserva as placas originais. Valores e Apagão continuam derivados do host, sem alterar cálculo de aluguel.

Build e 176 testes aprovados. Script mobile-clarity-qa.mjs confere atlas 6K, 26 etiquetas, tamanho de fonte, ordem de desenho, seleção de RN, gaveta e comando ROLL_DICE; capturas em 667×280, 800×360, 932×430 e 1280×720. Conferência final verifica ausência de sobreposição entre as etiquetas na distribuição registrada. Prévia em navegador a DPR 2, sem teste em aparelho físico. Arquivos em assets/3d/reviews/mobile-clarity/. Sem geração de arte externa, Meshy, commit ou merge nesta etapa.


## Celular: enquadramento inspirado no Business Tour — 08/11/2026

Atendido o pedido explícito para celular deitado. Novo modo mobile-diamond: câmera em losango a -45°, perspectiva de distância longa e elevação adaptada à proporção. O host mede cada card nos dois cantos inferiores, controles à direita e gaveta; não reserva mais duas colunas inteiras. O encaixe usa o contorno real do tabuleiro e separação de polígonos; a barra central fica no espaço interno, fora das propriedades. Ao abrir cartas, barra e câmera se deslocam para a área livre. Computador mantém a calibração original.

CSS específico em screens/mobileBoard.css: jogadores divididos entre os cantos, controles compactos, ação central; até 320 px de altura mostra somente a ação e o selo para preservar área útil. Status continua disponível nos jogadores/na interface acessível. Siglas dos estados maiores no modo móvel; fotos, cores dos donos e consulta por toque preservadas. Mipmaps, bias -0,5 e DPR até 3 vindos da develop preservados. Não houve uso de Meshy, alteração de regras, commit ou merge.

Validação: build; 175 testes existentes e teste novo de câmera com três proporções, colisão de controles/propriedades e restauração desktop. Prévia real GameScreen com servidor de jogo simulado em 800×360, 667×280, 932×430 (seis jogadores) e 1280×720. Em celulares o quadro ocupa aproximadamente 72% da largura e 91–94% da altura. Seleção de RN por toque, comando oficial ROLL_DICE e abrir/fechar cartas conferidos. Script scripts/assets/mobile-diamond-qa.mjs e capturas/relatório em assets/3d/reviews/mobile-diamond/. Navegador com DPR 2; desempenho em aparelho físico ainda não medido.

Esta decisão substitui o enquadramento móvel alinhado anterior. Os relatórios mobile-framing e item-drawer anteriores registram o layout antigo; suas expectativas de colunas/rodapé não representam esta versão. Para Claude: manter HUD medido pelo host, siglas móveis, restauração desktop e prioridades de aluguel/personagens. Não recolocar reservas simétricas de colunas quando o HUD estiver em grid nos cantos.


## Ícone do app e gaveta de cartas — concluídos (08/11/2026)

Criado ícone próprio com coroa, monograma IU e escudo verde sobre azul, em vetor editável `assets/app-icon/source/app-icon-v1.svg`. Substituídos os quatro PNG públicos nos mesmos nomes/tamanhos (192, 512, maskable 512 e Apple 180). `scripts/assets/pwa-icons.mjs` agora gera a arte nova, sem depender do logotipo completo. Emblema dentro da zona segura de 80%: raio 176,2 px, limite 204,8 px. Manifesto, HTML, botão e lógica de instalação preservados. Fontes, manifesto de hashes e prévia em `assets/app-icon/`; conferência `app-icon-qa.mjs`.

Criado `hud/art/cards/cards-v1.svg` original, reutilizado no botão e no cabeçalho da gaveta. Acabamento azul/dourado em `hud/itemDrawer.css`, cabeçalho Suas cartas, fechar compacto e destaque verde quando Passe Livre disponível. Contador, quantidades legadas, aria-expanded/controls, role dialog, Escape, toggle/× e ações preservados. Componentes RestExitItemButton/RentWaiverItemIndicator e regras não mudaram.

`useHudLayout` agora observa a gaveta, reserva sua largura para não cobrir o tabuleiro e limita sua altura acima da barra de ação/selo; desfaz a reserva ao fechar. Mantidos 194 px no celular e clamp(200 px,20vw,280 px) no computador. Até 340 px de altura, ajustada somente a altura de linha dos nomes/saldos para separar os jogadores dos botões inferiores. Para Claude: preservar a medição de largura independente da translação da animação e a limpeza dos observadores; não transformar a reserva direita do computador em modo de câmera móvel (não há reserva esquerda nesse caso).

Conferência da gaveta no GameScreen real com WebSocket simulado: 800×330, 667×280, 932×430 e 1280×720; quatro usos de Passe Livre via comando oficial, contadores, contagem antiga de cinco itens, fechar/reabrir e enquadramento restaurado. Movimento reduzido conferido. Scripts `item-drawer-qa.mjs`; capturas/relatório e guia em `assets/3d/reviews/item-drawer/`. 175 testes e build aprovados durante a revisão. Arte vetorial original, sem serviços externos ou créditos Meshy. Ajustes anteriores de personagens e aluguel preservados. Sem commit/merge nesta etapa.

## Personagens maiores e aluguel sem sobrepor a cabeça — concluído (08/11/2026)

Atendida a orientação de leitura dos personagens. `Pawns.tsx` deriva a ocupação das casas dos jogadores não falidos e passa `figureScale` a Pawn: 1,70 sozinho, 1,35 em dupla e 1,00 com três ou mais. Só a figura cresce; `PAWN_SCALE` permanece 0,75, `pawnSpots`/âncoras não mudaram e o raio de apoio continua 0,1875. Bases recebem fundo escuro, faixa colorida espessa e filete claro, dentro do mesmo raio. `PlayerBase.emphasized` é opcional e preserva as outras telas. Durante os saltos, o corpo usa o tamanho original; a escala volta suavemente ao pousar. A seta acompanha a altura, mantendo o próprio tamanho.

`useHudLayout` mantém 3,5% de folga superior no computador e usa 7% no celular deitado, para acomodar cabeça e seta em 280 px de altura. As reservas continuam medidas pelo host, sem oscilação por ocupação. A câmera não foi alterada nesta etapa.

Correção apontada pelo usuário: a etiqueta de aluguel estava acima da cabeça. `board/renderOrder.ts` define aluguel em ordem 20 e personagens em 30. `RentTags` agora é opaco com alphaTest 0,05, depthTest/depthWrite falsos; continua acima das construções, mas os modelos e a seta ficam à frente da etiqueta. `AvatarFigure.renderOrder` é opcional, aplica-se às malhas clonadas e ao fallback. Não modificar os materiais originais compartilhados nem voltar a pôr RentTags na fila transparente, pois isso recria a sobreposição. Preços, posições das placas e regras permanecem oficiais e inalterados.

Validação: 175 testes e build; 64 cenários com RN/AC/RJ/MA, um a quatro personagens, cinco modelos, 800×330, 667×300, 800×280 e 1280×720. Conferidos vértices das bases dentro das casas, cabeça/seta no navegador, caminhada, restauração da escala e saída por falência (etapa isolada em prévia nova). Dez combinações adicionais conferem a prioridade de aluguel/personagens e o antes/depois da sobreposição real. Scripts `pawn-readability-qa.mjs` e `rent-head-occlusion-qa.mjs`; capturas e relatórios em `assets/3d/reviews/pawn-readability/`. Sem geração de arte ou créditos Meshy e sem commit/merge nesta entrega. Próxima pendência separada: ícone e acabamento da gaveta de cartas guardadas.

## Publicação dos ajustes do celular (08/11/2026)

Commit e merge para develop autorizados pelo usuário: inclui câmera móvel adaptativa, entrada compacta com Google, teste de restauração da câmera, estudo comparativo, capturas e relatório. Conferidos 175 testes, build e prévia com cinco telas de partida e quatro de entrada. Os registros anteriores de sem commit/merge descrevem o estado anterior a esta solicitação. Identificadores finais no histórico Git. Próxima pendência: arte do ícone e gaveta de cartas guardadas.

## Celular deitado — câmera e entrada compacta concluídas (08/11/2026)

Criado o modo `mobile-landscape` em `board/camera/tabletopViewport.ts` e `mobileLandscapeCamera.ts`. GameScreen o escolhe a partir das reservas laterais de `useHudLayout`; as reservas e o HUD continuam sob controle do host. Câmera com distância longa reduz o encolhimento das casas distantes, elevação adaptada ao espaço livre e encaixe pelo contorno real. Ao voltar ao computador, restaura zoom e calibração originais. Avaliados ângulos em losango; foram descartados porque diminuíam a área das propriedades. Mantido o alinhamento em favor da leitura, sem mudar arte, geometria, regras ou peças.

Conferência com GameScreen/HUD reais e WebSocket simulado: quatro tamanhos de celular e 1280×720, sem erros. Ganho de área do tabuleiro 14–37%; da menor propriedade 41–71%, comparando o mesmo HUD com a câmera anterior. Nomes completos continuam pequenos: consulta por toque permanece disponível. Formulário de entrada compactado em altura até 340 px; com sessão anterior e Google cabe sem rolar em 667×280, 800×280, 800×300 e 915×320. Botão oficial intacto (prévia usa slot neutro).

175 testes e build aprovados. Scripts `mobile-camera-study.mjs` e `mobile-framing-qa.mjs`; capturas, medidas e limites em `assets/3d/reviews/mobile-framing/`. Para Claude: manter o modo móvel escolhido pelo host, reservas medidas e restauração da câmera ao sair do celular deitado. A próxima pendência de arte continua sendo ícone e gaveta de cartas. Sem commit/merge ou créditos Meshy nesta etapa.

## Publicação dos controles e da moldura olímpica (08/11/2026)

Commit de arte `9ea5f1e`: painéis de entrada/conta, controles compactos de configurações e ações secundárias, exceções aprovadas do menu preservadas, moldura olímpica v2 e respectivos assets/prévias. Integrada a develop até `ca9c0da` antes da publicação. Conflito em `SettingsDialog.tsx` resolvido preservando `useAccountSync` e `photoUrl` da engenharia, junto com os novos estilos e ocultação do bloco Google sem Client ID. Prévia controlada atualizada com campo `photoUrl` nulo para corresponder ao contrato da API.

Validação após integração: 174 testes e build aprovados. As mudanças de produção, cartas guardadas, foto Google e prazo de sete segundos vindas da develop foram preservadas. Os pedidos novos de arte da gaveta permanecem nas orientações abaixo, para a próxima tarefa; esta publicação não os implementa.

## Moldura olímpica v2 integrada — 07/11/2026

Após aprovação do usuário, `board/OlympicHost.tsx` passou a renderizar a moldura com os cinco anéis no tabuleiro de 34 casas. `olympicFrame.ts` projeta a arte no painel real, com divisão das barras para preservar anéis/cantos nos estados horizontais. Um mesh estático por sede, textura compartilhada de 41 KB, centro transparente, sem interceptar cliques; conserva o relevo anterior como fallback do tabuleiro de 33 casas. `Pieces.tsx` e `snapshot.olympics.hostStateId` continuam controlando a sede, sem mudanças de regras, aluguel, câmera, modelos ou áreas dos personagens.

Validação: build e 171 testes aprovados; `scripts/assets/olympic-frame-qa.mjs` passou em RN/AC/RJ/MA, 1280×720 e 800×360, construção nível 2, mudança e remoção de sede, sem erros. Capturas/relatório em `assets/olympic-host/integration/`. A prévia padrão também usa o componente real. Para Claude: integração visual concluída, não recriar regras nem usar estádio/pira; asset vigente `olympic-frame-v2.webp`. Sem commit/merge nesta etapa, zero créditos Meshy adicionais.

## Moldura olímpica com anéis — preferência vigente (07/11/2026)

O usuário pediu substituir a pira pelos cinco anéis olímpicos. Asset vigente: `apps/web/src/board/board34/art/olympic-frame-v2.webp` (512×683, 41.138 bytes), com moldura e centro transparente preservados. Fonte, prompt de edição e manifesto em `assets/olympic-host/`. A prévia padrão no Rio usa v2; capturas em `assets/olympic-host/frame-rings-preview/`. A pira v1 foi superada, acessível só com `?variant=torch`. Para Claude: ainda é estudo visual, sem integração nas regras ou produção; preservar nome/aluguel/construções. image_gen integrado; zero créditos Meshy. Sem commit/merge.

## Moldura da propriedade olímpica — preferência vigente (07/11/2026)

O usuário prefere uma moldura ao estádio sobre a propriedade. Criado `apps/web/src/board/board34/art/olympic-frame-v1.webp` (512×683, 40.650 bytes), centro transparente, ouro/verde, louros e pira pequena. Fonte, prompt e manifesto em `assets/olympic-host/`. Prévia no Rio em `/scripts/assets/olympic-property-preview/`; capturas `assets/olympic-host/frame-preview/`. A casa usa posição e escala originais. O estudo de estádio foi superado e só abre com `?variant=stadium`. Para Claude: proposta visual ainda não integrada; manter regras de Olimpíadas e validar encaixe da moldura nos demais estados/celular. Zero créditos Meshy; sem commit/merge.

## Arte da sede das Olimpíadas — correção de tema (07/11/2026)

O usuário corrigiu o pedido: a sede é das Olimpíadas, não da Copa. Usar `apps/web/src/board/board34/art/olympic-host-v1.webp`: estádio de atletismo com pista oval e pira acesa, fundo transparente, acabamento brasileiro do projeto. Fonte, prompt e manifesto em `assets/olympic-host/`; otimização com `node scripts/assets/prepare-olympic-host.mjs`. O conceito de futebol em `assets/copa/` foi superado e não deve ser integrado. Prévia pedida pelo usuário no Rio de Janeiro: `/scripts/assets/olympic-property-preview/`, capturas em `assets/olympic-host/preview/`. Estádio e casa lado a lado; somente na prévia a casa tem deslocamento lateral e escala 82%. Aluguel-base ilustrativo do catálogo; sem simular bônus olímpico. Conferir demais estados e celular antes de integrar.

Entrega de arte, sem alteração de regras ou aplicação automática no tabuleiro. Para Claude: manter os dados de Olimpíadas e `OlympicHost`; conferir a escala da arte antes de integrar, preservando nome, aluguel, construções e peões. Renderizar “Sede das Olimpíadas” pela interface. Gerado com image_gen integrado, zero créditos Meshy. Sem commit/merge nesta entrega.

## Controles secundários — padrão compartilhado e exceções aprovadas (07/11/2026)

**Decisão vigente do usuário:** o botão principal **Jogar Online** e a criação das partidas já estavam aprovados; preservar sua arte e proporção. Seu personagem, Trocar e Suas partidas também foram restaurados ao visual anterior por solicitação do usuário. Foi revertida a tentativa de transformar Jogar Online num botão horizontal. As telas/estilos `PlayEntryScreens`, `play-menu.css`, `OnlineMenuScreen` e `online-menu.css` não foram alterados nesta padronização. A prévia antiga também mantém a arte original dos botões de jogar.

Aplicado o padrão compacto azul/dourado aos controles secundários: confirmações de propriedade, botões comuns `ui/Button`, abas/cabeçalho e ações de configurações. Avatares, seletores de cor e indicadores circulares preservados. `ui/button-theme.css` é o tema do Button comum; sem mudanças de handlers, variantes ou sons. O botão Rolar dados mantém seu tratamento específico e o rodapé do resultado mantém a hierarquia aprovada.

Controles de configurações centralizados em `settings-art/settings-controls.css`, que importa o kit base e é usado pelo host real e pela prévia do kit. Evita molduras ovais esticadas também nas demais abas/ações do kit. O menu em celular deitado organiza marca à esquerda e ações à direita; Jogar Online usa a arte/razão originais e Suas partidas permanece visível. Sem alterar rotas, dados, conta, jogo, câmera ou modelos. Botão oficial Google intacto.

Conferência: controles/menu em três tamanhos com callbacks; configurações reais em quatro tamanhos/estados; kit com três abas e cinco tamanhos (15 combinações); propriedade em três modos/quatro tamanhos; resultado em 28 combinações, com botão de retorno preservado. 171 testes e build aprovados durante a revisão. Guias e capturas em `assets/3d/reviews/controls-pattern/` e diretórios anteriores. Sem geração de imagens/Meshy/créditos ou commit/merge nesta entrega.


## Configurações — proporções dos botões (07/11/2026)

Pedido do usuário atendido no host `hud/settingsHost.css`: cabeçalho CONFIGURAÇÕES com largura do texto e moldura retangular arredondada, abas Som/Conta compactas, Sair da conta/Trocar apelido com largura do conteúdo e Concluir/Restaurar padrão com proporção própria. Substituídos os backgrounds ovais esticados por bordas/degradês CSS no host, sem gerar imagens nem alterar os assets históricos do kit. Ativo em verde, demais ações em azul, bordas douradas. Tamanhos menores próprios para celular deitado.

**Para Claude:** ações, rótulos, role=tab/aria-selected, navegação por teclado, foco, logout e som preservados. Sem alteração no botão/iframe oficial Google. O roteiro `scripts/assets/google-account-qa.mjs` passou nos quatro tamanhos e estados de conta, com limites/textos dos controles conferidos; novas capturas de Som incluídas em `assets/3d/reviews/google-account/`. Sem geração/Meshy/créditos, commit ou merge nesta revisão.


## Login Google — acabamento dos painéis (07/11/2026)

**Pedido atendido localmente na develop_arte_3d, base 1fbd3bb.** Refinados `screens/MenuScreen.tsx`/`menuScreen.css` e `hud/SettingsDialog.tsx`/`settingsHost.css`. Tela do apelido ganhou moldura azul/dourada, campos e ações próprios, separador e bloco “Leve seu progresso com você”. Em celular deitado, logotipo fica à esquerda e formulário à direita, incluindo o acesso ao último convidado sem cortar controles. Conta mostra identidade/tipo/e-mail separados do painel de progresso, confirmação para conta conectada e avisos de erro/resultado. Reutilizados os ícones link/check e o cenário existentes; zero geração raster ou créditos.

**Para Claude:** `auth/GoogleButton.tsx` permaneceu intacto. Não redesenhar logotipo/botão/iframe; renderButton, tema, larguras e textos oficiais preservados. CSS novo só nos contêineres externos. Entrada por apelido, sessão anterior, callback do Google, token do convidado, mensagens LINKED/SIGNED_IN/CREATED e logout mantidos. Sem Client ID, o cartão de acesso da aba Conta agora fica oculto junto com o botão, usando googleClientId em cache. Backend, rotas, prêmio/carteira e persistência não mudaram.

Prévia controlada com os componentes reais: `/scripts/assets/google-account-preview/`; guia, capturas e relatório em `assets/3d/reviews/google-account/`. O botão é um SLOT NEUTRO identificado na prévia, sem copiar marca Google; a produção mantém o renderer oficial. Sem conta/credencial/API/OAuth reais na conferência. Ambiente de API local estava indisponível. QA `scripts/assets/google-account-qa.mjs`: oito combinações (menu/conta em 1280×720, 844×390, 800×360 e 667×375), conta conectada/e-mail longo, configuração ausente, falha de login/SDK, entrada de convidado e callbacks de login/vínculo/saída, sem requisição externa. 171 testes e build/TypeScript aprovados. Sem commit/merge nesta entrega.


## Publicação da escolha de personagem e fim de partida (07/11/2026)

Commit e merge/publicação na develop solicitados pelo usuário. Inclui os dois refinamentos visuais, assets/fontes/prompts/manifestos, prévias/QA e orientações. Registros anteriores de “sem commit/merge” descrevem o estado antes desta solicitação. Preservar as atualizações recentes da develop, incluindo o login Google opcional. As regras, o ranking, os valores e as ações existentes permanecem os mesmos. Identificadores finais no histórico Git.


## Fim de partida — arte entregue (07/11/2026)

**Pedido atendido localmente na develop_arte_3d, base 015aede.** Refinados `hud/GameOverScreen.tsx` e `gameOver.css`: painel azul/dourado, ícones originais diferentes para relógio/fim/abandono, prêmio destacado, ranking com cores do dono, coroa nos vencedores e troféu/confete para quem vence ou divide a vitória. Confete é decorativo, sem interceptar cliques, e respeita prefers-reduced-motion. Falidos permanecem apagados no fim, empates preservam posições. Nome longo tem reticências/título completo e “(você)” separado.

Assets novos em `hud/art/game-over/`: troféu WebP transparente (512×496, 69.572 bytes) e três SVG originais. Fonte, prompt integral, manifesto e guia em `assets/game-over/`. image_gen integrado, sem referência externa/Meshy/créditos. Inventário de procedência atualizado.

**Para Claude:** mesmas props myId/token/gameId/onLeave e consulta existente de aposta. Helpers `finalRanking`, `endedByClock`, `prizeShare`, regras, prêmio e som preservados. Só apresentação. Componente de produção já consome a arte, sem mudança de host. O ranking tem rolagem própria; não voltar a aplicar overflow ao cartão inteiro, pois o rodapé deve ficar visível. Três jogadores cabem em 800×360 e 667×375; seis rolam. A implementação visual não concede moedas.

Prévia isolada criada com o componente real em `/scripts/assets/game-over-preview/`, dados/consulta de aposta simulados apenas ali, sem API real. Roteiro `scripts/assets/game-over-qa.mjs`: 28 combinações (7 situações × 4 telas), 2 a 6 jogadores, vitória/falência/tempo/empate/derrota/abandono, prêmio ausente, nomes/saldos longos, callback de retorno, botão sempre visível e hashes/alpha. Capturas/relatório em `assets/3d/reviews/game-over/`; nenhum erro ou chamada API. Quatro testes de classificação existentes e build/TypeScript aprovados; sem nova partida conectada ou celular físico. Refinamento anterior de escolha do personagem preservado. Sem commit/merge nesta entrega.


## Escolha do personagem — acabamento visual (07/11/2026)

**Pedido do usuário atendido localmente na develop_arte_3d, base e03e66c.** Refinado `play-menu/CharacterPicker.tsx` e `character-picker.css` no componente já usado pelo menu: moldura azul/dourada, ícone de jogadores, prévia 3D com cenário tropical e nome/cor escolhidos, cinco retratos em cartões com marca de seleção, seis cores com rótulos visíveis, resumo da escolha e rodapé com ações bem separadas. Reutilizados os retratos, modelos, ícone e fundo originais existentes; sem nova geração raster/Meshy/créditos.

**Contrato preservado para Claude:** mesmas props/ações dos stores de personagem, preferências e API; mesmos nomes, IDs e seis cores. Mantidos role=radio, aria-checked, rótulos, diálogo nativo, cancelamento/fechamento e confirmação. Nenhum modelo, animação, seleção salva ou regra de desempate de cor foi alterado. O refinamento já está no componente de produção, sem exigir troca de rota. O CSS do selo de troca no card e do botão do menu foi preservado. O cenário decorativo só usa a arte aprovada, sem novo Canvas.

Prévia com componente e modelos reais: `/scripts/assets/character-picker-preview/`. Sessão e salvamento são simulados SOMENTE nessa prévia, sem chamadas API nem uso da conta do usuário. QA `scripts/assets/character-picker-qa.mjs`: 1280×720, 1024×768, 844×390, 800×360, 667×375; todas as escolhas, resumo, confirmação, cancelamento sem salvar, reabertura com escolha salva, Esc, erro e espera conferidos. Capturas/relatório em `assets/3d/reviews/character-picker/`. Build/TypeScript aprovados; sem teste em celular físico ou nova chamada ao servidor. Sem commit/merge nesta entrega. Contagem da sala de espera e apresentação dos itens continuam refinamentos separados.


## Publicação das três novas cartas (07/11/2026)

Commit e merge/publicação na develop solicitados pelo usuário: Descanso merecido com texto revisado e piso v2; Passe Livre guardável para sair do Descanso; Aluguel Zero de ativação automática na primeira propriedade adversária. Inclui assets/fontes/prompts/manifestos, apresentação dos itens, prévias/QA e contratos para a engenharia. Registros anteriores de “sem commit/merge” são históricos. Regras, inventário e consumo no servidor permanecem pendentes de integração, conforme as orientações vigentes de cada carta. Identificadores finais no histórico Git.


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


## Nova carta — Descanso merecido (07/11/2026)

**Arte e carta entregues localmente na develop_arte_3d, base e02c2d5.** Pedido do usuário: “Você trabalhou muito, vá para o descanso e faça a sua pausa merecida!”. Ilustração inspirada no print enviado: trabalhador de camiseta escura e luvas, deitado no apoio de concreto com braços abertos, parede de reboco e pausa descontraída. Arquivo `apps/web/src/event-art/art/descanso-merecido-v1.webp` (1280×853, 309.064 bytes); PNG em `assets/eventos/source/`; prompt integral e manifesto próprios em `assets/eventos/descanso-merecido-*`. Geração pelo image_gen integrado, sem Meshy/créditos. Registro de direitos da referência de entrada ainda não confirmado, conforme inventário.

Kit agora possui sete cartas. ID visual proposto `descanso-merecido`, título “Descanso merecido”, texto: “Descansar né ? Que o cara não é de ferro ! Vá para o Descanso.”. Componente passivo/moldura brasileira v5 preservados; sem botão, seletor, timer ou backdrop. Prévia `/scripts/assets/event-modals-preview/?event=descanso-merecido`. Sete cartas × quatro telas: 28 combinações aprovadas; texto, imagens, passagem de clique e retirada conferidos, sem erros. Build/TypeScript aprovados.

**Para Claude:** integrar esta sétima carta ao baralho e motor oficiais. Destino já existente `REST`, índice 17, nome Descanso; `destinationTileId` no kit é apenas metadado visual, não movimento de cliente. O servidor decide o deslocamento e publica os eventos/snapshot; aguardar o fechamento da carta no fluxo de apresentação já existente. O usuário só pediu ir ao Descanso: não acrescentar perda de turnos, dinheiro, cura ou outras consequências. Definir com a regra do jogo se esse deslocamento recebe bônus ao passar pelo Início; esta arte não decide isso. Não alterar os efeitos das seis cartas integradas. Sem commit/merge nesta entrega.


## Integração com carteira/apostas da develop (07/11/2026)

Recebida a atualização `fdeb0b2`. Preservados o serviço de carteira, saldos reais, catálogo de apostas, fichas/inputs e a prop opcional `stake`. O host de produção usa `OnlineRoomEntryScreen` (importado com o apelido anterior), mantendo a criação/convite/apostas já integrados. O novo `OnlinePlayScreen` continua sendo a escolha visual de três destinos para integração da engenharia; não chamar sua nova assinatura com as props do formulário antigo. A proposta da praia e a sala de espera continuam conforme os limites registrados. 150 testes e build aprovados após resolver o conflito. Publicação autorizada pelo usuário.


## Publicação das entregas visuais (07/11/2026)

Commit e integração na develop solicitados pelo usuário: correção do Apagão, ambiente de praia e enquadramento ampliado, proposta da sala de espera e fluxo online em três opções com botões compactos/lista pública. Registros anteriores de “sem commit/merge” descrevem o estado antes desta solicitação. Preservar a integração de carteira/apostas recebida na develop; serviços de salas públicas e ativação dos novos temas/fluxos permanecem conforme os contratos de engenharia. Identificadores finais no histórico Git.


## Jogar Online — botões menores (07/11/2026)

Pedido do usuário atendido em `online-menu.css`: três opções centralizadas em largura máxima de 900 px, altura de 220 px por botão no computador, ícones de 58 px e painel de 440 px. Em celular em paisagem: botões de até 145 px, ícones de 34 px e painel de até 260 px. As três rotas e os rótulos foram preservados. Prévia e capturas atualizadas em `assets/3d/reviews/public-rooms/`; QA do fluxo aprovado nas 16 combinações, sem erros. Alteração visual local, sem commit/merge ou créditos.


## Jogar Online — três destinos separados (07/11/2026)

**Decisão vigente do usuário; substitui a tela online anterior com criação/convite juntos e botão público dentro do convite.** Menu inicial → Jogar Online abre só três opções: **Criar sala**, **Salas Públicas**, **Salas Privadas**. Criar sala abre exclusivamente Clássico/Rápido e criar; Privadas abre exclusivamente código de convite/entrar; Públicas usa a listagem entregue. Todas retornam à escolha online; a escolha online retorna ao menu inicial. Jogar Agora/LAN permanece separado, com o comportamento anterior.

Implementação visual: `OnlineMenuScreen.tsx` exporta `OnlinePlayScreen` (também reexportado por `PlayEntryScreens.tsx`), com callbacks obrigatórios `onCreateRoom`, `onPublicRooms`, `onPrivateRooms`, além de player, wallet opcional conforme contrato anterior e onBack. `CreateOnlineRoomScreen` e `PrivateRoomsScreen` reutilizam os componentes existentes, exibindo só a seção correspondente. Estado do modo e código pertence ao host. CSS novo `online-menu.css`; retratos, ícones e molduras originais reutilizados, cadeado vetorial próprio. Prévia conectada: `?view=online`, `?view=create-online`, `?view=private`, `?view=rooms`.

**Para Claude:** ligar esses destinos às rotas/estado do host e preservar o fluxo real de lobby. A listagem pública e visibilidade público/privado ainda precisam do serviço descrito na orientação anterior; esta revisão não inventa API ou publica salas privadas. Valores e salas da prévia continuam amostras; não foram criadas salas reais. O usuário pediu manter somente Clássico/Rápido na criação; definição da visibilidade ainda precisa ser contemplada pela engenharia sem confundir esta escolha com os modos da partida.

QA do fluxo em `scripts/assets/public-rooms-qa.mjs`: quatro telas × quatro tamanhos (16 capturas), os três destinos, retorno, modo/criar, código normalizado/entrar, sala lotada, atualização e estados de lista. Capturas/relatório em `assets/3d/reviews/public-rooms/`. Build/TypeScript aprovados. Sem geração raster, créditos Meshy, mudança de produção, commit ou merge.


## Jogar Online — botão e salas públicas (07/11/2026)

**Pedido direto atendido no kit visual da develop_arte_3d.** `OnlinePlayScreen` aceita `onBrowseRooms`; quando fornecido, exibe “Entrar em uma sala / Ver salas públicas”. A entrada por convite continua em “Entrar com código”. Jogar Agora/LAN permanece separado. A prévia conecta o botão ao novo `PublicRoomsScreen`, com nome/anfitrião, modo, ocupação, disponibilidade, botão Entrar e Atualizar salas; salas lotadas/indisponíveis não permitem entrada. Estados de carregamento, lista vazia, erro e entrada pendente incluídos. Nenhum asset de imagem novo; identidade do projeto reutilizada.

**Para Claude — integração necessária:** a API atual só cria/entra por convite e lista partidas do próprio jogador; não existe listagem pública nem distinção público/privado. Implementar visibilidade explícita na criação, catálogo autenticado de salas públicas e entrada validada no servidor. Nunca tornar salas privadas existentes públicas automaticamente, nem expor códigos/tokens privados. `PublicRoomCard` em `apps/web/src/play-menu/PublicRoomsScreen.tsx`: id, name, hostName, mode, players, capacity, joinable. `onJoin(roomId)` e `onRefresh` são callbacks, sem API no kit. Validar atomicamente vagas/estado na entrada e tratar sala que lotou/iniciou/sumiu; após sucesso abrir o lobby real. Não inventar ping, XP, moedas ou disponibilidade. Retrato do host não é fabricado: lista usa ícone genérico de jogadores.

Prévia: `/scripts/assets/play-menu-preview/?view=online` → botão → lista, ou `?view=rooms`. Salas são exemplos locais; nenhuma entrada real enviada. Roteiro `scripts/assets/public-rooms-qa.mjs`, capturas/relatório em `assets/3d/reviews/public-rooms/`: duas telas × quatro tamanhos, navegação, entrada por callback, sala lotada, atualizar, vazio, carregamento, erro e pendência. Build e TypeScript conferidos. `MenuScreen`/API de produção não alterados; sem commit/merge ou créditos Meshy.


## Sala de espera — proposta de arte (07/11/2026)

Pedido do usuário atendido com a proposta `assets/concepts/sala-de-espera/sala-de-espera-v1.png`, no estilo tropical azul/dourado do menu. Código da sala/copiar, quatro vagas, anfitrião, indicação de pronto, avatar/cor e início pelo anfitrião seguem as funções atuais de `screens/LobbyScreen.tsx`. Nomes, código e estados são exemplos gráficos. Prompt/origem em `assets/concepts/sala-de-espera/provenance.json`; geração pelo image_gen integrado, sem Meshy/créditos.

**Para Claude:** esta entrega é uma proposta raster, não uma tela implementada nem atlas para recortar controles. Na implementação, textos, nomes, código, vagas e pronto devem vir do lobby; usar os retratos/modelos próprios já existentes e controles HTML acessíveis. O retrato 3D desenhado na proposta é ilustrativo, não um GLB novo. “Escolhendo” representa visualmente ainda não pronto; não inventar estado de rede novo. Não alterar capacidade, regras de início, personalização ou transporte para reproduzir a imagem. Adequar ao celular em paisagem e validar o encaixe real. Sem alterações na tela de produção, commit ou merge nesta proposta.


## Praia — tabuleiro ampliado na apresentação (07/11/2026)

Pedido do usuário: aumentar o tabuleiro da proposta. A prévia da praia agora usa toda a janela, sem a barra de inspeção, e `Board34Scene` aceita `framing="immersive"`. O enquadramento reduz a reserva superior/inferior para 32/40 px em telas de altura menor que 700 px e 54/64 px nas maiores. A pose, perspectiva e proporções são mantidas; escala e deslocamento de enquadramento são uniformes. No celular 844×390, a ampliação em relação à prévia anterior é de aproximadamente 44%; os recortes das casas continuam inteiros.

**Para Claude:** combinar `environment="beach"` com `framing="immersive"` na integração visual e conferir os painéis reais nas reservas menores. A produção e o enquadramento padrão `standard` não foram alterados. Não confundir a prévia sem HUD com certificação de encaixe dos controles da partida. O host de produção continua responsável pelos controles/landscape. Testes de câmera e dados: 8 aprovados. Conferência visual/cliques no roteiro `scripts/assets/beach-environment-qa.mjs`, com capturas/relatório no mesmo diretório da entrega da praia. Sem nova geração de arte ou consumo de créditos; sem commit/merge.


## Ambiente de praia tropical — arte e prévia (07/11/2026)

**Pedido direto atendido na develop_arte_3d, sobre bd145e6.** Proposta aprovada em `assets/concepts/praia-tropical/`; arte limpa em `apps/web/src/board/board34/art/beach-environment-v1.webp` (1672×941, 439.518 bytes). Deque dourado, mar, areia, coqueiros, coco e toalha nas extremidades; nenhum tabuleiro, HUD, texto ou personagem gravado na imagem. Fonte, prompt integral, manifesto e guia em `assets/praia-tropical/`. Geração pelo image_gen integrado; zero créditos Meshy.

**Para Claude:** `Board34Scene` aceita `environment="beach"` e mantém `wood` como padrão. O tema usa fundo proporcional com recorte central, reflexos e receptor transparente das sombras reais. Vaso/caneca/moedas antigos são omitidos nesse tema; sem objetos que interceptem a seleção. Câmera, geometria, IDs, peças, dados e valores preservados. Prévia em `/scripts/assets/board34-preview/?environment=beach`, com modelos e seleção reais, sem backend. A produção permanece no tema anterior até a engenharia ligar a opção no host.

TypeScript e build aprovados. Capturas e relatório da conferência de composição/cliques em `assets/3d/reviews/praia-tropical/`; roteiro `scripts/assets/beach-environment-qa.mjs`. A prévia não certifica desempenho em celular físico nem uma partida conectada. Alterações locais, sem commit/merge nesta entrega.


## Apagão — kit alinhado à regra integrada (07/11/2026)

**Pedido atendido na develop_arte_3d, sobre bd145e6.** Em `apps/web/src/event-art/events.json`, o Apagão agora usa `targetKind: opponent-property`; descrição e carta pedem estado de um oponente. Texto curto vigente: “Roubaram os fios! Escolha um estado de um oponente. Sem aluguel até o dono parar nele 3 vezes.” Resumido para caber sem diminuir a letra. Arte, proporções, fluxo passivo, duração controlada pelo host e regras do servidor preservados.

A integração das seis cartas já veio da develop em `ea61b7a`/`bd145e6`; os registros anteriores de integração pendente são históricos. Esta correção só alinha o kit visual. QA das seis cartas em quatro tamanhos: 24 combinações aprovadas, sem texto cortado, controles ou erros; capturas/relatório atualizados em `assets/3d/reviews/event-modals/`. Sem geração de imagem ou créditos Meshy. Alterações locais, sem novo commit/merge nesta correção.


## Jogar Agora/Jogar Online e cards do menu — arte (07/11/2026)

**Estado: componentes e assets concluídos na develop_arte_3d, sobre c1e2c55; commit e integração na develop autorizados em 07/11/2026. Integração de produção com a engenharia.** O usuário pediu as duas telas e os cards de jogador/moedas/diamantes. Esclarecimento explícito: **Jogar Agora = mesma rede local, em aparelhos diferentes; Jogar Online = internet. Não é IA nem jogo no mesmo aparelho.**

Entrega em `apps/web/src/play-menu/`: `LocalPlayScreen` e `OnlinePlayScreen` (criar/entrar por código, Clássico/Rápido, capacidade do catálogo), `PlayerMenuCard` e `CurrencyMenuCard` (moedas/diamantes). Oito SVG originais independentes para molduras, Wi-Fi, globo, cronômetro e retorno. Textos e valores são HTML; cenário, logotipo e retratos próprios reutilizados. Prévia em `scripts/assets/play-menu-preview/`, com rotas `?view=lan`, `?view=online` e `?view=cards`. A demonstração anterior do menu agora abre essas telas e usa “Mesma rede local” no lugar de IA. `MenuScreen.tsx` de produção não foi alterado.

**Para Claude:** guia e manifesto em `assets/play-menu/`. Telas controladas por props/callbacks; sem chamadas de API ou store. O host precisa ligar criação/entrada ao canal correto. Não há descoberta automática de rede, matchmaking ou transporte LAN implementado no kit. Em LAN, os aparelhos precisam alcançar a mesma instância local; não usar localhost do próprio aparelho como endereço do anfitrião. Preservar o comportamento real atual até conectar esses serviços.

Player card aceita apelido/retrato e nível/experiência opcionais; carteira opcional, com saldos fornecidos pelo host. O botão + só existe se houver callback. **Não fabricar níveis, XP, moedas ou diamantes em produção.** Valores das capturas são amostras visuais, não dados de conta nem créditos da partida. Os callbacks da prévia apenas registram ações locais; nenhum jogo ou pagamento foi enviado.

**Validação:** roteiro `scripts/assets/play-menu-qa.mjs`: duas telas × cinco tamanhos (1536×1024, 1280×720, 1024×768, 844×390, 667×375), campos e botões dentro da tela, modo, código obrigatório/normalizado, espera/erro, nome/saldo longos, dados ausentes e navegação das prévias. Capturas/relatório em `assets/3d/reviews/play-menu/`. TypeScript e build conferidos. Sem teste de rede real entre aparelhos, geração raster ou uso de Meshy/créditos Meshy nesta etapa de arte. Publicação autorizada pelo usuário; identificadores no histórico Git.

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
- **Modal C6 já integrado pela engenharia:** `cb8062c`, com ajustes de pouso/aba oculta em `27b0489`. Preservada também a atualização de dívida/prazo em `2ad6822`. Os estados antigos de “integração do modal pendente” são históricos; permanecem para Codex os pedidos **C6.1 (modo consulta nativo)** e **C6.2 (compressão das imagens)**, não atendidos nesta entrega.
- **Ainda pendente de implementação:** cenário integrado aprovado sem prancheta, montagem dos novos assets/aluguéis, restrição de celular a paisagem, E25 e migração para 34 casas com RN/Saque/fundo de Taxa. Não confundir a entrega dos assets/propostas com regras ou layout já ativos na partida. Não implementar a coluna permanente do protótipo C5 rejeitado.
- **Validação da combinação:** 97 testes do frontend/catálogo aprovados; verificação TypeScript da raiz e do frontend, build e auditoria pré-commit aprovados. Auditoria sem credenciais encontradas. Não houve nova rodada conectada de multiplayer/backend nesta sincronização.

Atualizado em 04/11/2026. Este é o ponto único de passagem de trabalho entre arte (Codex) e engenharia (Claude).

## Decisão mais recente — protótipo aprovado e aluguéis nos estados (04/11/2026)

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

### Validação da entrega de arte

Três testes da proposta passaram: posição RN/AM, Saque entre AL/CE e preservação das 26 propriedades em 34 IDs únicos, mantendo o runtime antigo intacto. TypeScript do frontend sem erros. `scripts/assets/special-tiles-qa.mjs` conferiu transparência real dos dois PNGs, valores dinâmicos R$ 0/100/600/12.000 usando a mesma imagem, descrição acessível, telas 1536×900 e 844×390, sem erros de navegador ou chamadas de API. Capturas e relatório em `assets/3d/reviews/saque/`. Isso não valida cobrança ou pagamento de uma partida real.

Prévia: `node scripts/assets/special-tiles-preview/server.mjs`, porta 4191. Branch `develop_arte_3d`, alterações locais sem novo commit/merge.

## Decisão vigente — celular somente em paisagem (04/11/2026)

O usuário confirmou: **a partida no celular só pode ser jogada na orientação paisagem (horizontal)**. Esta decisão prevalece sobre as propostas e capturas históricas de jogo em 390×844/320×568. Essas capturas continuam úteis para inspecionar assets, mas não representam um modo de partida suportado nem são critério de aprovação de leitura móvel.

Na integração, a engenharia deve mostrar em retrato um aviso para girar o aparelho e impedir interação com as ações da partida enquanto o telefone estiver em pé. Não depender exclusivamente de bloqueio de orientação do navegador: o aviso deve funcionar mesmo sem suporte a esse recurso. Girar o telefone não pode pausar o relógio oficial, desconectar, reiniciar a partida nem enviar comandos. Ao voltar à horizontal, retomar a apresentação do snapshot atual.

Validar HUD, tabuleiro, aluguéis e modal em paisagem, incluindo 844×390, 932×430 e 667×375. Rever a legibilidade dos preços e a ocupação da tela nessa composição; não reutilizar o encaixe estreito da coluna lateral C5 rejeitada. Não há novo layout de partida vertical a implementar. O aviso de orientação e a montagem na partida continuam pendentes: esta atualização registra a decisão, sem alterar o GameScreen.

O usuário aprovou o conceito de mesa/cenário contínuo com HUD integrado visualmente e pediu **retirar a prancheta lateral de estado**, porque compra/construção usam o modal já entregue. Esta decisão substitui a proposta anterior C5 que reservava uma coluna permanente para `PropertyPanel`: não implementar aquela prancheta/coluna como destino visual final. Não confundir a imagem conceitual aprovada com implementação pronta. Referência da versão sem prancheta em `assets/3d/reviews/tabletop-ui/approved-concept-no-clipboard.png`; não usar esse bitmap de conceito como fundo final da partida.

Novo pedido: **preço do aluguel nos estados**. Arte original e componentes de apresentação em `apps/web/src/tabletop-ui/`:

- `art/rent-plaque-v1.png`: plaquinha dourada/índigo transparente, sem texto. `RentPlaque` recebe `stateName`, `rentLabel` já formatado e `kind: base | current`. Não grava valores, não acessa stores e não calcula regras.
- `art/player-frame-v1.png`: moldura vazia de jogador, com encaixe de retrato; `PlayerNameplate` recebe nome, saldo formatado, retrato e indicação de ativo. Mantém retratos e dados fora da imagem.
- `art/action-dock-v1.png`: base vazia dos controles. `ActionDock` recebe `roundLabel` e `children`; botões, dados, prazo e comandos continuam com a engenharia.
- PNGs originais RGBA, 2172×724, transparência verificada; visualização sem margem transparente por janela SVG, sem editar o arquivo-fonte. `art/assets.json` contém dimensões/janelas/hashes; prompts completos e origem em `art/provenance.json`. Ferramenta integrada image_gen; sem Meshy.
- `rentPlacements.json` e gerador `scripts/assets/build-rent-placements.mjs` publicam retângulos dentro das 26 propriedades da câmera nativa 1536×1024; não há placas em casas especiais, nem TO. Não alteram as 33 âncoras, regras, modelos ou câmera.

**Ações da engenharia para integrar depois da revisão:**

1. Estados livres mostram aluguel base do catálogo, identificado como base; estados possuídos mostram aluguel atual calculado pelo helper existente `currentRent(snapshot,definition)` e formatado por `formatCredits`, incluindo nível e Olimpíadas. Não mostrar preço de compra como aluguel e não multiplicar números por mil.
2. Passar dados prontos para a arte. `StateRentOverlay` é uma camada DOM de apresentação de referência sobre o Canvas nativo 3:2; usar a conversão de pixels da composição correta se o cenário/HUD for ampliado. Não duplicar a camada na textura e no DOM. Dados ausentes podem omitir a placa, sem inventar zero.
3. As placas têm `pointer-events:none` e descrição acessível sem região viva para 26 anúncios simultâneos. Preservar seleção de casa e informação completa no fluxo/modal aprovado. O encaixe em polígonos não comprova ausência de encobrimento de peões/construções; conferir cenas ocupadas e o posicionamento final ao integrar.
4. Não manter os 26 textos em fonte microscópica como aprovação de celular. A composição 3:2 reduzida a 390 px torna esses números pequenos; legibilidade móvel e informação da casa selecionada precisam de solução na integração, sem mudar a câmera por turno. A prévia fornece inspeção em resolução nativa; não é certificação de leitura em celular físico.
5. Preservar o modal existente e não reintroduzir a prancheta. Os novos componentes/assets **não estão montados no GameScreen**; pedido anterior de apresentar antes de implementar continua respeitado.

Prévia local: `node scripts/assets/tabletop-ui-preview/server.mjs`, porta 4188. Verificação `node scripts/assets/tabletop-ui-qa.mjs`; capturas em `assets/3d/reviews/tabletop-ui/`. A demonstração alterna base/duas casas/hotel e ES com duas casas/Olimpíadas ×3 usando catálogo e helper existentes, sem backend. Branch `develop_arte_3d`, alterações locais sem novo commit/merge.

## Atualização prioritária — as imagens são referências para criar arte

O usuário esclareceu que o Codex deve criar a arte tomando as imagens como modelo, sem utilizar as imagens enviadas, recortes ou projeções delas como arte final do produto. A prévia atual de 33 casas usa o PNG diretamente e passa a ser classificada como **protótipo de layout/câmera**. A recriação das artes é pendência do Codex; não é tarefa do Claude.

**Ação do Claude:** a migração lógica de 33 casas já foi incorporada da `develop` (base `97c9d54`, que inclui `e6e5b38`). Preservar essa integração e manter a troca dos assets desacoplada da lógica. Não consolidar a projeção atual do tabuleiro como acabamento final e não substituir ou redesenhar as artes por conta própria. Conferir a entrega de novos assets do Codex antes de marcar a integração visual como validada. Não é necessário reabrir a decisão já aprovada sobre as 33 casas.

## Nova entrega — painel de compra e evolução da propriedade

**Estado: componente visual com novas ilustrações detalhadas disponível para revisão do usuário; integração funcional pendente do Claude.** O usuário rejeitou a primeira versão de vetores simplificados. A revisão substitui construções e paisagem por arte original gerada, seguindo o painel azul/dourado da primeira referência e as miniaturas com telhas, sacadas, vegetação e calçadas da segunda referência. Não declarar fidelidade aprovada antes da revisão do usuário. Esta entrega não substitui `PropertyPanel`/`TileActions` automaticamente. Nenhum arquivo de regras, stores, movimento ou backend foi alterado. As imagens enviadas são somente referências; seus pixels não foram utilizados no painel.

Arquivos: `apps/web/src/property-evolution/PropertyEvolutionPanel.tsx`, `property-evolution.css` e `PropertyArtwork.tsx`. Ilustrações individuais de terreno, quatro casas, hotel e paisagem em `art/*-v2.png`; os prompts, origem e limitações estão em `art/provenance.json` (ferramenta integrada `image_gen`, sem API/CLI ou Meshy). As construções são imagens 2D de interface com transparência, não novos GLBs para o tabuleiro. Prévia isolada em `scripts/assets/property-evolution-preview/`; verificação reproduzível: `node scripts/assets/property-evolution-qa.mjs`. Capturas desktop/compra/celular e relatório em `assets/3d/reviews/property-evolution/`.

**Ações do Claude:**

- [x] Montar o painel em um diálogo controlado pelo fluxo atual ao cair em propriedade comprável ou própria com construção permitida. Preservar seleção/consulta de propriedades de terceiros e demais ações existentes. Não abrir uma decisão de compra fora de `AWAITING_PURCHASE`, nem construção fora de `AWAITING_BUILD`.
- [x] Fornecer `stateCode`, `stateName`, `mode: 'purchase' | 'build'`, `stages`, `selectedLevel`, `costLabel`, `newRentLabel`, `actionLabel`, `message`, `actionDisabled`, `pending` e callbacks. `stages` contém `{level, label, rentLabel, status, note?}`. Status: `current`, `available`, `locked`, `complete`. A arte não calcula permissão, saldo, preço, aluguel ou visitas. Textos monetários devem vir de `formatCredits` e do catálogo/snapshot, incluindo multiplicador olímpico quando aplicável.
- [x] **`onSelect(targetLevel)` entrega o nível final pretendido, não o número de casas a construir.** Para compra, traduzir nível 0–3 permitido em `BUY_PROPERTY {houses: targetLevel}`; para construção, calcular a diferença para o nível atual e usar `BUILD {houses: diferença}`; nível 5 permitido usa `BUILD_HOTEL`. Reaproveitar `affordablePurchaseHouses`, `buildOptions`, saldo, posição, fase, turno e validações existentes. Não enviar a seleção diretamente como quantidade de construção.
- [x] Manter **Terreno + Casa 1 + Casa 2 + Casa 3 + Casa 4 + Hotel**. A referência mostra três casas, mas as regras vigentes têm quatro; não mudar o motor para adequá-lo ao desenho. As etapas disponíveis dependem da visita e do saldo. O `note` de cada bloqueio vem do controlador, não de uma regra fixa na arte.
- [x] Em modo compra não há etapa atual de propriedade já possuída: o terreno pode ser uma opção disponível. Em modo construção marcar o nível real como `current`, anteriores `complete` e escolhas válidas `available`. Seleção é controlada pelo host; limpar/revalidar ao mudar estado, snapshot, turno ou disponibilidade.
- [x] Conectar `onConfirm` aos comandos reais somente depois de revalidar o estado atual. Desabilitar por desconexão/observação/fase inválida e durante envio; mostrar erro/retorno do servidor sem presumir sucesso. O componente também impede confirmar uma seleção que não esteja `available`.
- [x] O host é responsável por `role="dialog"`, `aria-modal`, foco inicial, contenção/restauração de foco, Escape/fechamento e sobreposição escurecida com rolagem vertical. A arte fornece uma seção nomeada, controles nativos e botão de fechar; não fornece um controlador de diálogo. Aplicar a decisão registrada em `ORIENTACOES-CODEX.md`, C6: o X recusa com `DECLINE_PURCHASE` na compra ou `SKIP_BUILD` na construção, sem minimizar e sem enviar `PASS`/`END_TURN` como substituto. Manter o temporizador oficial visível no diálogo/host, inclusive durante envio e até expirar; o painel não cria contagem local nem prolonga o turno.
- [x] O cabeçalho agora resolve automaticamente a arte original de cada UF pela prop `stateCode`, usando `StateHeaderArtwork.tsx`. Não passar `RioArtwork` fixo para todos os estados. A prop opcional `artwork` só precisa ser usada para uma substituição deliberada; normalmente deve ser omitida. As construções são reutilizáveis em todas as UFs, com fontes PNG de alta resolução (largura mínima verificada de 1024 px); manter `object-fit: contain` e proporções. Não ampliar além da resolução disponível nem reintroduzir o desenho vetorial simplificado. Moedas, casa com seta e ferramentas são PNGs originais; controles e dados continuam separados da arte.
- [ ] Validar compra simples/com casas, construção a partir de nível diferente de zero, Casa 4, hotel, saldo insuficiente, nova visita, aluguel olímpico, desconexão, fechamento e expiração de decisão. Conferir teclado e celular com o HUD real. A prévia testa apenas a apresentação e os callbacks, sem conexão ao servidor. **Conferido:** compra simples e com 2 casas, recusa pelo "×", expiração (o servidor recusou sozinho), consulta fora da vez, Esc e foco, em 1536×1024, 1024×768 e 390×844 numa partida real. Construção a partir de nível > 0, Casa 4, hotel, saldo insuficiente, nova visita e aluguel olímpico estão cobertos por testes (`game/propertyDecision.test.ts`), sem conferência ao vivo; desconexão não foi refeita.

Os botões da prévia alternam cenários ilustrativos e não executam comandos. O fundo neutro é exclusivo da prévia; o host deve sobrepor o painel ao tabuleiro real. Créditos Meshy consumidos nesta entrega: **0**. Não considerar concluída a integração por existir uma screenshot.

**Revisão adicional de 02/11:** criadas artes individuais de moedas (`coins-v2.png`), casa com seta (`rent-growth-v2.png`) e ferramentas (`build-tools-v2.png`), conectadas ao resumo e ao botão. Fontes e prompts em `art/investment-provenance.json`. O X de fechar usa vetor centralizado, independente da fonte. O usuário autorizou explicitamente exibir **R$**: `formatCredits` e o aluguel desenhado em `tileTexture` foram atualizados, mantendo os números do catálogo e a economia do jogo. Preservar essa indicação ao integrar e substituir versões antigas que ainda mostrem apenas `$`. Não multiplicar preços por mil para reproduzir os números ilustrativos da referência. Os três ícones também aparecem na composição de celular.

### Cabeçalhos turísticos — todas as UFs do tabuleiro aprovado

**25 novas ilustrações originais entregues, total de 26 com o RJ existente. Integração visual na prévia disponível; fluxo conectado ainda pendente do Claude.** Arquivos individuais em `apps/web/src/property-evolution/art/states/*-header-v1.png`, procedência e prompts completos em `states/provenance.json`. O RJ continua em `art/rio-header-v2.png`, preservando sua versão existente. São ilustrações estilizadas, não fotografias documentais nem reproduções arquitetônicas medidas. Nenhum recorte das referências do usuário foi utilizado. Sem operações Meshy.

- API: `StateHeaderArtwork({stateCode})`; manifesto `STATE_HEADER_ART`; consulta `getStateHeaderArt(stateCode)` retorna `{name, src}` ou `undefined`. `PropertyEvolutionPanel` já usa esse componente por padrão quando `artwork` não é fornecido. A sigla e o nome continuam em HTML; não fazem parte do bitmap. IDs desconhecidos não caem silenciosamente no RJ.
- Cobertura: **AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE**. São as 26 UFs do percurso de 33 casas já incorporado da `develop`; **TO não foi incluído**. Esta entrega de arte não reordena nem modifica o catálogo lógico.
- Claude deve passar a sigla/ID verdadeiro da definição selecionada para `stateCode` e o nome correspondente para `stateName`. Não resolver imagem por índice do tabuleiro nem inferir estado pelo nível de construção. Reutilizar a mesma arte em compra/construção e nas revisitas do mesmo estado.
- Preservar a proporção 3:1 das fontes e o recorte visual do cabeçalho; não esticar imagens. As fontes têm cerca de 2 mil pixels de largura, adequadas para o cabeçalho em telas de alta densidade. Não carregar todas em sequência durante uma partida: o componente renderiza somente a imagem selecionada; a prancha é exclusiva da prévia de arte.
- A prévia tem seletor de UF e a opção **Todas as artes** (`?gallery=1`). Captura da prancha em `assets/3d/reviews/property-evolution/state-headers-gallery.png`, além de exemplos de modal CE/MT/SP. Rodar `node scripts/assets/property-evolution-qa.mjs` para conferir cobertura contra `reference33/layout.json`, fontes distintas, abertura das 26 UFs no computador/celular e ausência de cortes horizontais.
- Esta entrega serve ao **cabeçalho do modal**. Não substituir automaticamente as texturas do tabuleiro por esses panoramas; o desenho das casas do tabuleiro continua um trabalho próprio de composição e integração.

Sincronização desta entrega: arte e formatação em R$ registradas em `2c17e50`, atualizadas com a base da engenharia `97c9d54` em `f0b2148`. O contrato de apresentação responde ao pedido C6; a montagem do diálogo, temporizador, recusa/confirmacão e comandos continuam pendentes da engenharia. Os demais pedidos C1–C5 não foram atendidos por este commit de modal e não devem ser marcados como concluídos por causa desta entrega.

## Como manter este arquivo

- **Codex:** sempre que uma entrega exigir ação do Claude, atualizar este MD antes de encerrar a entrega. Registrar o que fazer, dependências, arquivos, contrato e validação. Manter um único arquivo, sem criar um MD por alteração.
- **Claude:** ler este arquivo e o [contrato compartilhado](11-contratos-claude-codex.md) antes de integrar arte. Atualizar os estados das tarefas depois de executar e verificar. Não marcar como concluído apenas porque o código foi escrito.
- Distinguir **arte pronta**, **integração pendente** e **integração validada**. Uma prévia visual não comprova regras, multiplayer ou posicionamento em partida real.
- Decisões recentes explícitas do usuário prevalecem sobre descrições históricas. Não reintroduzir versões antigas para resolver conflitos.
- Preservar alterações locais, trabalhar na própria branch/worktree e não fazer merge/publicação automaticamente. Não executar operações pagas do Meshy.

## Estado conferido

| Item | Estado |
|---|---|
| Base de engenharia incorporada | Commit `7f002d5`: Taxa/Aeroporto, contrato ampliado de áreas e retirada dos controles de câmera já implementados |
| Catálogo desse commit | Ainda tem **36 casas, 27 UFs e 4 Eventos**; não atende à decisão posterior de 33 casas |
| Decisão posterior do usuário | **33 casas da imagem**, 26 UFs, **sem Tocantins**, dois Eventos; Claude adapta o motor |
| Protótipo das 33 casas | Geometria independente, posições, seleção e câmera preparados; aparência atual usa a referência diretamente |
| Arte final recriada | **Pendente do Codex:** criar/substituir texturas, ilustrações e demais assets derivados diretamente das imagens de referência |
| Integração ao jogo conectado | **Pendente**; a prévia de arte não substitui automaticamente a cena do jogo |
| Compartilhamento da entrega mais recente | Entrega registrada na `develop_arte_3d` para integração autorizada à `develop`; consultar o histórico Git antes de atualizar a branch de engenharia |

A entrega pode ser lida em `C:\Users\Plust\Projetos\imperio-urbano\.worktrees\meshy-phase-b`. O nome antigo da pasta não muda a branch, que é `develop_arte_3d`. Ao chegar à `develop`, atualizar a branch de engenharia preservando suas alterações locais. Se houver arquivos posteriores ainda não commitados, não presumir que `git pull` os trará. Antes de integrar, conferir o commit disponibilizado pelo usuário; não copiar versões antigas inteiras sobre arquivos de engenharia.

Sincronização desta entrega: protótipo e orientações registrados em `46afea7`; base `7f002d5` incorporada à branch de arte em `3a62bf0`. Validação após combinar os trabalhos: **70 testes e build aprovados**, mais conferência da câmera no navegador com a API atual `clearSelection`. A inspeção considera a visibilidade dos ancestrais das malhas, respeitando a saída/ocultação dos peões do Claude. Isso não conclui a migração lógica para 33 casas nem a criação dos assets próprios, que continuam pendentes conforme as tarefas abaixo.

## P1 — Integrar o tabuleiro definitivo de 33 casas

**Estado: engenharia integrada na `claude/engenharia` (sem commit), arte final pendente do Codex.** Motor, catálogo (33 casas, ids estáveis, cartas por id), partidas antigas e cena de 33 casas no jogo concluídos; pendentes: dados (E25) e HUD em telas largas. Validação: 141 testes do servidor, 67 do frontend e catálogo, build, E2E com dois clientes (3 aprovados, 1 pulado) e captura de partida real com quatro jogadores. Pedidos à arte em [ORIENTACOES-CODEX.md](ORIENTACOES-CODEX.md) (C3, C4).

### 1. Atualizar o percurso e suas referências

Fonte da ordem e das posições visuais: [reference33/layout.json](../apps/web/src/board/reference33/layout.json). A sequência é:

`START → AM → RR → EVENT_NORTH → AP → PA → RO → OLYMPICS → AC → MT → MS → GO → EVENT_EAST → DF → MG → ES → REST → RJ → PR → SP → TAX → RS → SC → PE → PB → AIRPORT → BA → SE → AL → RN → CE → PI → MA`.

- [x] Adaptar `packages/game-data/data/board.json` às 33 posições. Não duplicar UFs. Remover TO do conjunto jogável e os dois Eventos excedentes.
- [x] Conferir catálogo, grupos, validadores e referências ao estado removido. Preservar as imagens-fonte originais; a prancha de artes continua contendo TO como asset não utilizado.
- [x] Adaptar as referências por índice em cartas, movimento, destinos e testes. Exemplos do layout visual: Olimpíadas **7**, DF **13**, Descanso **16**, SP **19**, Taxa **20**, Aeroporto **25**. Preferir resolver destinos por ID, sem espalhar novos números fixos.
- [x] Auditar pressupostos de quatro lados iguais/`tilesPerSide=9`. A composição da referência não deve ser forçada à distribuição uniforme anterior.
- [x] Preservar as regras já aprovadas de Taxa e Aeroporto do commit `7f002d5`; não inventar valores ou efeitos a partir de desenhos. `AIRPORT` é ID visual; pode continuar associado ao tipo funcional `NATIONAL_TRAVEL`.
- [x] Definir compatibilidade de snapshots/partidas antigas de 36 casas. Não reinterpretar silenciosamente os índices de uma partida persistida como posições de 33 casas. Não apagar dados sem instrução do usuário.

### 2. Conectar a cena visual ao jogo

Arquivos fornecidos pela arte:

| Arquivo/API | Uso |
|---|---|
| `apps/web/src/board/reference33/ReferenceBoardScene.tsx` | Cena R3F da nova composição |
| `reference33Layout` / `referenceTileAnchor(id)` | Manifesto e consulta da âncora pelo ID visual |
| `apps/web/public/models/board/reference33-v01.glb` | 33 casas independentes, corpo, moldura e camadas estáticas |
| `apps/web/src/board/camera/fixedCamera.json` | Projeção e pose calibradas; não alterar por turno |
| `assets/board/tabuleiro-brasil-alvo.png` | Fonte visual aprovada, sem modificações |

- [x] Substituir a cena antiga pelo `ReferenceBoardScene` na integração funcional. Ele já fornece o Canvas e a câmera: não criar outro Canvas ou outro controlador de câmera ao redor.
- [x] Mapear `onSelect(visualId)` para o índice lógico correto e passar `selectedId` de volta. Não enviar IDs visuais diretamente ao servidor sem o adaptador de comandos correspondente.
- [x] Injetar peões e construções por `children`, dentro da cena. Adaptar os acessores compartilhados para consumir o mesmo manifesto que as malhas usam.
- [ ] Conectar `diceValues` exclusivamente a `snapshot.lastDice`; sem resultado, passar `null`. Os valores **5/3 da prévia são ilustrativos**, nunca dados de partida. **Pendente (E25):** a partida passa `diceValues={null}` até a animação dos dados ligada ao resultado oficial.
- [x] Preservar conexão, turnos, painel de propriedade, comandos e fluxo de encerramento ao substituir a cena.

O componente de arte não lê stores, não sorteia, não envia comandos e não resolve regras. A integração é responsabilidade da engenharia.

### 3. Usar as âncoras e áreas corretas

- [x] Preservar `tileAnchor(index)` como acesso funcional compartilhado, resolvendo o índice oficial para o ID visual antes da consulta.
- [x] Consumir `x`, `z`, `surfaceY`, `rotationY`, `width`, `depth`, `pawnArea`, `buildingArea` e o polígono real da casa.
- [x] O perfil novo fornece **surfaceY=0,08** e **selectedLift=0**. Não adicionar o antigo deslocamento de seleção de 0,06 nesta composição; a seleção já destaca a arte sem elevar a casa.
- [x] Atualizar `pawnLayout`, movimentos e posicionamento das construções para o novo sistema. Não manter coordenadas ou espaçamentos do tabuleiro anterior.
- [x] Validar um a quatro jogadores na mesma casa, escala/raio dos avatares e construções. As áreas fornecidas são referências geométricas: verificar que as peças realmente cabem no polígono, não apenas no retângulo envolvente.
- [x] Validar saltos, giro dos personagens, chegada e reconexão sem deslocar a câmera.

### 4. Preservar a câmera estática e adaptar o HUD

**Já feito pela engenharia:** `ViewControls` foi removido e a seleção deixou de disparar foco/giro. Não recriar esses controles.

- [x] Usar a câmera calibrada do Codex, que não lê `viewStore` e não reage a mouse, toque, seleção ou turnos.
- [x] Depois da integração, retirar os campos temporários `focusedTile` e `quarterTurns` se não houver mais consumidores. Não restaurar `focusTile`, `rotate` ou `clearFocus` antigos para fazer ferramentas de teste desatualizadas passarem; adaptar os testes às APIs atuais, como `clearSelection`.
- [x] Reposicionar os painéis funcionais para que o HUD não cubra casas importantes. Manter a composição 3:2 inteira, com escala uniforme e margens nas telas que precisarem. **Feito:** em tela larga na horizontal (≥ 640 px), os jogadores ficam numa faixa no topo, a carta do estado e o histórico numa coluna à direita e as ações embaixo; o tabuleiro ocupa só o espaço entre eles (`game-hud-board` em `index.css`, mesma condição de `WIDE_HUD_QUERY` em `GameScreen.tsx`). Abaixo de 1100 px de largura ou 700 px de altura a faixa de jogadores fica compacta. Conferido em 1920×1080, 1536×1024, 1366×768, 1024×768 e 844×390, sem painel sobre casas. Na vertical (celular 390×844, tablet 768×1024) continua como antes: jogadores no topo e o painel da casa abre como folha sobre o tabuleiro, fechando no ×. Solução provisória: quando o Codex ampliar a cena em volta do tabuleiro (ORIENTACOES-CODEX, C5), os painéis passam a ficar sobre as áreas livres da cena e as margens saem.
- [x] Exibir detalhes de propriedade no HUD sem zoom ou aproximação automática.

### 5. Critérios de conclusão

- [x] 33 casas no motor e na cena, 26 UFs únicas e dois Eventos; índices e destinos coerentes.
- [x] Seleção das 33 casas abre os dados corretos; ações chegam ao servidor com os identificadores corretos.
- [x] Peões, construções e destaques acompanham as respectivas casas, sem afundar, flutuar ou sair das áreas.
- [x] Testes do motor, frontend e E2E de dois clientes/reconexão passam com o novo percurso.
- [ ] Câmera continua imóvel com roda, arrasto, pinça, seleção e troca de turno. **Conferido em parte:** pose idêntica à calibrada depois de seleções e trocas de turno na partida real; roda, arrasto e pinça não foram refeitos nesta integração.
- [x] Conferência de screenshot real da partida, sem alterar posições, cores ou enquadramento da arte para acomodar a integração.

Validações do protótipo já executadas: 68 testes e build; 33 cliques na prévia; GLB sem erros/avisos Khronos; comparação de faces e bordas com a referência. Elas **não aprovam a recriação de arte**, que ainda não ocorreu para os elementos projetados, e **não substituem** os testes funcionais da nova integração. Repetir a conferência visual após o Codex entregar os assets próprios.

Ferramentas disponíveis:

```powershell
node scripts/assets/reference33-preview/server.mjs
node scripts/assets/reference33-qa.mjs
```

Prévia independente: `http://127.0.0.1:4183/scripts/assets/reference33-preview/`. A conferência automática usa a porta 4184. Evidências em `assets/3d/reviews/reference33/`.

## P2 — Outras integrações de arte pendentes

Estas são pendências registradas, não uma indicação para misturá-las à migração P1. Executar conforme a ordem de trabalho autorizada pelo usuário e marcar cada integração somente após validar.

| Entrega | Arte disponível | Ação do Claude | Validar |
|---|---|---|---|
| E25 — Dados 3D | `src/dice/DiceVisual.tsx`, `diceOrientation.ts` e GLB de dados | Ligar apresentação/animação ao resultado oficial e controlar repetição/fila | Valores finais corretos, nulos ocultos, reconexão e movimento reduzido; nunca usar os pares fixos das demos |
| E26 — Anúncio olímpico | `src/olympics/OlympicCallout.tsx` e CSS | Disparar pelo evento oficial, ancorar à sede e deduplicar | Sem repetição após reconexão, sem duplicar selo ×N, sem modal central; preferência de movimento reduzido respeitada |
| E27 — Frente das cartas | `src/cards/EventCardVisual.tsx` e CSS | Usar no fluxo existente de `CardReveal`, passando `card` e `who` | Texto oficial, revelação/fechamento preservados e anúncio acessível sem duplicação |

Os caminhos `src/...` desta tabela são relativos a `apps/web/`. Detalhes das interfaces permanecem no [contrato compartilhado](11-contratos-claude-codex.md). A pilha de cartas não deve ser recolocada sobre o centro aprovado sem decisão visual do usuário.

## Ao terminar uma tarefa

Registrar aqui: estado final, commit/branch quando disponíveis, testes executados e impedimentos reais. Avisar se a arte precisar fornecer outro dado ou corrigir uma interface. Não alterar a identidade visual, consumir créditos ou fazer merge automaticamente para concluir uma integração.

## Retorno C1/C2 — 04/11/2026

Branch `develop_arte_3d`, base `6820c84`; documentação sem novo commit. Ver medições e contrato na seção “Respostas técnicas C1/C2” de `ORIENTACOES-CODEX.md`.

- **C2 respondido:** sequência, IDs e índices congelados; formato e significado das âncoras/polígonos preservados. Manter testes contra o catálogo e compensações de ocupação do C3.
- **C1 parcial:** pivô central; apoio em Y=-0,505 nas poses atuais. Usar `diceValues={null}` e `children`, sem Canvas adicional; yaw externo e face oficial interna, sem duplicar a orientação. Manter sombras compartilhadas existentes.
- **Bloqueio encontrado:** projeção dos vértices reais em repouso excede o rodapé de 1024 px em aproximadamente 11 e 17 px. O espaçamento também não garante giros livres simultâneos. Aguardar correção de enquadramento e área segura pelo Codex antes de fechar trajetórias da E25; não alterar câmera nem duplicar poses no controlador.
- 11 testes existentes aprovados de dados, manifesto e ocupação. Sem validação conectada ou visual nova; C1 não está concluído.

### C1 — atualização que substitui o bloqueio de enquadramento acima

Dados redimensionados para 0,34 e reposicionados; yaw, apoio e câmera preservados. Poses finais em `reference33Layout.dice`; novo `diceRoll` publica limites por centro para giros livres, apoio Y=-0,505, deslocamento de até 0,03 em X/Z e salto adicional 0,03. **Engenharia:** consumir os limites do manifesto. Girar apenas dentro de `centerBounds`; concluir face oficial e yaw, centralizar X/Z, depois descer à pose de repouso sem continuar giros. Ver contrato em `11-contratos-claude-codex.md`. Não copiar coordenadas nem criar outro Canvas.

O novo teste geométrico cobre qualquer orientação pelo limite conservador da esfera, margem de quadro, moldura, decoração e separação da dupla. A implementação da trajetória, resultado oficial, reconexão, movimento reduzido e testes conectados continuam com Claude. A área permite animação curta na faixa disponível, não um lançamento amplo pela mesa.

Validação final C1: 70 testes, TypeScript e build aprovados; prévia no navegador aprovada com 33 cliques e câmera invariável. Capturas 1536×1024 e 390×844 atualizadas e inspecionadas, sem corte da dupla. Os dados ficam pequenos no celular por respeitarem a composição fixa; C5 continua aberto. Sem novo commit/merge nesta revisão.

## Retorno C3 — escala e áreas de ocupação (04/11/2026)

**Decisão da arte: manter escala 0,75 e a distribuição compacta atual.** `pawnArea`/`buildingArea` continuam retângulos locais de referência; `polygon` é o limite real. Não mudar centros nem encolher retângulos para fazer caber seus cantos: isso altera faixa do dono e miniaturas e não resolve o encobrimento dos corpos.

QA novo em `scripts/assets/occupancy-qa.mjs` / `inspect-occupancy.ts`; relatório e 11 capturas em `assets/3d/reviews/occupancy/`. Tela real, snapshots sintéticos, cinco avatares, AM/ES/CE/DF/PI, quatro casas e hotel, computador/celular; sem backend. Os 9 testes existentes de layout e distribuição passaram nas 33 casas. As construções renderizadas amostradas também ficam dentro do contorno, incluindo detalhes que não estão nas caixas nominais (folga mínima ≈0,05785).

**Ressalvas:** quatro corpos se encobrem na perspectiva; a altura dos personagens no celular é só 13–17,5 px (no computador, 40–56 px). Poses amostradas de idle têm projeção horizontal de braços/corpo até ≈0,05 unidade além do polígono, embora as bases caibam. Não marcar corpo inteiro, legibilidade do grupo, ciclo completo de idle ou saltos como aprovados pelo teste de bases. Não aumentar escala nem reduzir para esconder o problema; rever leitura do grupo junto à composição C5. Não há mudança funcional necessária para consumir a decisão C3.

**Achado adicional para a engenharia:** a faixa do dono em `Pieces.tsx` aparece branca também em propriedades livres, pois é desenhada com `ownerId=null` e cor reserva `#ffffff`. Conferir se deve ser omitida enquanto não há dono; a arte não modificou o fluxo nem o componente nesta revisão. C3 respondido com ressalvas, aguardando conferência. Sem novo commit/merge.


## Retorno C4 — cena antiga preservada (04/11/2026)

**Decisão: manter a cena antiga como referência histórica**, sem montá-la na partida e sem retirar o trecho legado de `layout.ts` nesta etapa. Branch `develop_arte_3d`, base `6820c84`, sem novo commit/merge. Aviso incluído em `BoardScene.tsx`; arquitetura atualizada para `GameBoard → ReferenceBoardScene`.

A lista original de arquivos antigos contém dependências compartilhadas: a mesa atual usa `WoodenTableScene → illustratedBoard.ts → art/stateArtwork`; o destaque olímpico atual usa o tipo `TilePlacement` de `layout.ts`. Não apagar esses arquivos/tipos numa limpeza em bloco. A prévia histórica `scripts/assets/map-preview` também importa `Tile`, `BoardCenter`, `CenterInfo` e `boardArt`, mas ainda cita o campo removido `board.tilesPerSide`; não tratá-la como validação funcional da cena atual.

Nenhuma ação de remoção necessária para Claude nesta entrega. Antes de eventual limpeza futura, separar carregamento da mesa/tipo olímpico, decidir o destino das prévias e revisar consumidores. Inventário detalhado no C4 de `ORIENTACOES-CODEX.md`. Validação por busca de dependências e conferência do caminho ativo; sem mudanças de comportamento ou nova validação visual.


## Entrega C5 — mesa ampliada e encaixes de HUD (04/11/2026)

Arte em `board/surroundings/BoardSurroundings.tsx`, estilos próprios e `surroundings.json`. `surroundingsLayout` retorna retângulo do tabuleiro e áreas livres dos três slots em pixels CSS; `boardPixelToViewport` transforma os pixels nativos das casas para o espaço do viewport. O manifesto publica os retângulos completos para 1536×1024 e 390×844; detalhes no C5 de `ORIENTACOES-CODEX.md` e no contrato compartilhado.

**Ações da engenharia:**

- Montar `<BoardSurroundings top={painelSuperior} side={cartaEHistorico} bottom={barraETurno}><GameBoard/></BoardSurroundings>` na tela da partida. O componente visual não acessa stores nem envia comandos.
- Substituir as margens `--hud-*` e os hosts absolutos anteriores; não aplicar duas vezes o recuo. Painéis ficam nos slots. `side` é direita na horizontal e abaixo do tabuleiro na vertical, com rolagem interna e máximo de 45% da altura. Manter o temporizador oficial e fluxo de ações.
- Organizar menu e jogadores dentro da área superior, incluindo foco/volta ao menu. A prévia contém os painéis e ações reais, mas não monta o menu nem valida seu encaixe. Revalidar a composição completa ao integrar.
- Usar os retângulos publicados para conferir que painéis não cruzam casas/moldura; preservar relação 3:2 do Canvas e escala uniforme. Não alterar câmera, GLB, catálogo, ordem ou âncoras.
- Em telas baixas e no celular, a barra inferior recebe reserva maior que o rascunho inicial para caber prazo e controles sem corte. Valores são do manifesto, não duplicar números no host.
- Não mudar dados C1: poses e envelope em mundo permanecem. E25 continua uma integração separada. A madeira do entorno é CSS original; o tabuleiro ainda usa o protótipo visual anterior.

Prévia `scripts/assets/surroundings-preview`, verificação `scripts/assets/surroundings-qa.mjs`, capturas/relatório `assets/3d/reviews/surroundings/`. Snapshot e envio mockados; não considerar multiplayer, reconexão, menu, modal C6 ou integração ao `GameScreen` concluídos. Branch `develop_arte_3d`, sem novo commit/merge.


**Validação da entrega C5:** 10 testes de áreas/manifesto aprovados; prévia em oito viewports, 33 cliques, câmera invariável, temporizador e Rolar sem corte, envio mockado preservado, fechamento e rolagem da carta. Relatório final sem erros/chamadas de API. A cena em 844×390 fica pequena devido às reservas; C3 continua com ressalva de legibilidade. A integração completa, menu e fluxos conectados continuam pendentes da engenharia.

Validação final dos assets: três PNGs com transparência real conferida e hashes registrados; 3 testes geométricos aprovados; TypeScript do frontend sem erros. Prévia no navegador: valores das 26 placas corretos nos quatro cenários, texto dentro das placas, 26 cliques atravessando a camada, botão demonstrativo separado da arte e sem chamadas de API/erros. Capturas do tabuleiro e controles inspecionadas. Em 390 px, a fonte da placa norte mede aproximadamente 3,46 px: **leitura móvel não aprovada** e registrada como pendência de apresentação/consulta na integração. Não declarar que a aprovação do encaixe prova legibilidade em tela pequena.

Detalhe de integração: o seletor também confere os tipos visuais (com `NATIONAL_TRAVEL → AIRPORT`). O manifesto novo usa `SAQUE`; se a engenharia escolher outro nome lógico, registrar o mapeamento explícito e seu teste, sem relaxar a conferência de tipos/IDs. Capturas com quatro peças demonstram ocupação, mas peões e construções podem encobrir partes da impressão, inclusive o preço: a consulta completa continua no modal. Não considerar legibilidade permanente dos textos sob peças ou desempenho em celular físico aprovados pelos testes de encaixe.
