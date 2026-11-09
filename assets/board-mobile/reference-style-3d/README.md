# Tabuleiro 3D seguindo a referência aprovada

Prévia real de um renderizador separado, não uma imagem gerada do jogo e não uma partida conectada. Página: /scripts/assets/reference-style-board-preview/. Capturas em review/board-WxH.png usam DPR 2; W/H são medidas CSS.

## Recursos e geometria

ReferenceStyleBoard.tsx monta a superfície octogonal, base de madeira com espessura/bevel, molduras arredondadas, centro ilustrado, dados reais e personagens existentes. referenceStyleLayout.ts divide o percurso em 34 polígonos nativos; quatro cantos recebem mais espaço. IDs/índices/ordem vêm do catálogo oficial, com 26 estados, oito especiais e um PR. Centro reduzido a 70% do contorno para ampliar as propriedades.

As 26 imagens v3 são reutilizadas com recorte proporcional. O UV das faces é uma base ortonormal no próprio plano; nenhum retângulo é deformado por interpolação bilinear para simular um trapézio. A câmera produz o encurtamento visual natural. Faixas de texto projetadas separadamente mantêm as letras nítidas; símbolo monetário menor e valores medidos para caber. Aluguéis são recebidos do host, sem cálculo de regras no renderizador. O exemplo usa aluguéis-base do catálogo, Taxa R$ 600 e quatro jogadores demonstrativos.

O usuário dispensou construções soltas no centro: a prévia não monta modelos de casas. Não confundir os prédios pintados do cenário com construções de propriedades. Todos os GLBs originais permanecem intactos. Os dados usam DiceVisual existente; personagens usam AvatarFigure existente. Nenhum avatar novo foi criado nesta etapa.

## Arte nova

Centro reference-center-v2.png e fundo reference-environment-v1.png em apps/web/src/board-presentation/art/. V1 do centro preservado como fonte da revisão de posicionamento do Cristo. Gerados com imagegen integrado; prompts completos em prompts.json, dimensões e hashes em asset-manifest.json. Logo, dados, interface e preços não estão embutidos nessas pinturas. Zero créditos Meshy. Consulta gratuita do saldo retornou 670 créditos, sem geração de modelos.

## Conferência e limites

Script: node scripts/assets/reference-style-board-qa.mjs. Confere IDs, 61 textos, preços sem corte, presença real de pixels WebGL, carregamento, enquadramento, seleção por clique/teclado e callbacks de Rolar/Configurações, em 1672×941, 1360×768, 932×430, 800×360 e 667×280. Relatório: review/report.json. Testes geométricos em referenceStyleLayout.node.test.ts verificam catálogo, área da faixa, base ortonormal e interseções com o contorno.

Não certifica multiplayer, movimentação, dados oficiais/animados, reconexão, todos os jogadores/níveis, modificadores de aluguel, inventário, desempenho ou leitura em aparelho físico. A câmera é ortográfica inclinada e adaptada ao formato da tela; a referência gerada não define coordenadas ou regras. O visual é uma aproximação implementada da referência, ainda sujeita à revisão estética do usuário.

## Integração seguinte

GameScreen e o renderizador padrão não foram substituídos. A geometria desta prévia usa coordenadas novas: não importar diretamente as âncoras do layout antigo. Antes de conectar, publicar trajetórias, regiões de construções/peões e envelope dos dados compatíveis, consumir BoardInsets do host, currentRent/snapshot/formatCredits e os handlers oficiais. Preservar as construções nas propriedades e não reintroduzir casas decorativas soltas no centro. Completar a seleção/consulta e fluxos reais antes de promover a nova cena. Sem commit/merge nesta etapa.

## Revisão por sobreposição — 08/11/2026

Mantidos os modelos e o estilo atuais dos personagens por determinação do usuário. Seus retratos e GLBs têm hashes registrados em asset-manifest.json; nenhuma mudança nesses arquivos. As diferenças entre personagens da imagem e do jogo não são pendências.

Contorno e câmera aproximados por sobreposição com reference-approved.png; resultado em review/alignment-overlay.png (magenta: anterior; verde: revisado). Artefato exclusivamente de comparação, não usado como textura. O roteiro reference-style-compare.mjs também salva comparison.svg lado a lado. A revisão inicial foi arquivada em revision-01/.

Faixas seguem as arestas das casas e centralizam os textos. Cantos especiais têm símbolos/títulos voltados ao jogador; novo relevo das molduras. HUD usa moldura vetorial própria ReferencePlayerCard e ícone de Som; os retratos continuam sendo os mesmos. Centro separa logo, dados e Rolar com ajuste para celular; QA verifica seus limites projetados. Zero créditos Meshy e nenhuma geração raster nesta revisão.

A conferência final também cobre colisão entre as caixas orientadas dos nomes e aluguéis laterais (SAT), além da ausência de corte. Em telas até 320 px de altura, sigla e preço das propriedades laterais compartilham uma única faixa, preservando o tamanho do valor e evitando sobreposição. Nas demais telas, as duas legendas mantêm posições separadas; siglas laterais são menores que os valores. Saque e Evento lateral possuem ícone e título lado a lado. Esta adaptação tipográfica não altera as imagens dos estados nem as regras.

## Branch da versão 2

Por definição do usuário, esta é a versão 2 do tabuleiro. Branch codex/tabuleiro-v2, criada de origin/develop (7913772). Prévia independente; o jogo padrão continua sendo a implementação da develop.
