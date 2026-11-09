# Kit de apresentação da referência aprovada

Primeira etapa da adaptação de art-direction-v2/concept.png, aprovada em 08/11/2026. Este kit contém recursos e componentes independentes; ainda não monta o tabuleiro jogável.

## Entrega

14 SVGs originais em apps/web/src/board-presentation/art/: moldura, nome e aluguel nas orientações vertical/horizontal; especiais esmeralda, azul e ouro; botão de dados, controle circular, cartão de jogador; ícones de créditos e configurações. Dimensões e viewBox explícitos, transparência e contornos escaláveis. Fonte reproduzível: scripts/assets/build-approved-board-kit.mjs. Hashes e recursos reutilizados em asset-manifest.json.

ApprovedBoardKit.tsx exporta ApprovedPropertyCard, ApprovedSpecialCard, ApprovedRollButton, ApprovedPlayerCard e ApprovedRoundControl. Cada componente recebe os dados e ações do host; não há regra, comando de rede ou preço fixo dentro da apresentação. ApprovedPropertyCard aceita orientação portrait (3:4) ou landscape (2:1), rentLabel, ownerColor, selected e onSelect. Preservar a proporção de cada orientação. Arte em cover com recorte proporcional; arquivos originais intactos. O nome completo fica no rótulo acessível e também na composição horizontal. Preços não são anunciados como dezenas de regiões live simultâneas.

Na integração, manter currentRent/formatCredits e snapshot como fonte dos valores, e os handlers existentes como fonte das ações. A galeria usa house2 do catálogo para conferir os textos, sem representar uma partida. Os oito especiais seguem os IDs oficiais (dois eventos, quatro cantos, Taxa e Saque). Modelos atuais de terreno, casas e hotel não foram substituídos.

## Prévia e conferência

Página: /scripts/assets/approved-board-kit-preview/. Capture com node scripts/assets/approved-board-kit-qa.mjs. O script usa navegador local e Vite e fecha ambos ao concluir.

review/kit-overview.png é uma captura da galeria de componentes, não do jogo. catalog-portrait.png e catalog-landscape.png mostram as 26 artes originais nas duas composições; catalog-special.png mostra os oito especiais. Os PNGs property-* e small-scale-and-long-values.png são exemplos de apresentação, não assets com preço fixo para produção.

report.json verifica os IDs, proporções, textos sem corte, callbacks, teclado, carregamento de imagens e 800×360/667×280. Revisão visual das duas folhas completas de estados realizada. Sem teste em aparelho físico. Sem créditos Meshy ou geração de raster externo nesta etapa.

## Continuidade

Próxima etapa: composição completa das 34 casas usando este kit, com cenário/centro originais e modelos atuais. Conferir visualmente contra o conceito antes da integração ao GameScreen. Não reutilizar as deformações dos estudos rejeitados.

## Ampliação na composição completa — 08/11/2026

Kit ampliado de 14 para 26 SVGs, com orientação landscape-edge 3:1 e variações proporcionais dos especiais. special-icon-crops.json registra limites de conteúdo dos ícones originais para viewBox; os arquivos-fonte continuam intactos. A composição completa e suas limitações estão documentadas em ../approved-composition/README.md.

O kit compartilhado agora registra 27 SVGs com o ícone de Som. A moldura reference-player-frame-v2.svg é uma fonte vetorial independente da revisão 3D, registrada no manifesto daquela entrega.
