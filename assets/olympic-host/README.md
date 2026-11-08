# Estado-sede das Olimpíadas

Correção do tema solicitada pelo usuário: a sede é das Olimpíadas. Arte original com estádio de atletismo, pista oval, pira acesa e acabamento verde/amarelo/azul/dourado. Sem elementos de futebol.

Asset: `apps/web/src/board/board34/art/olympic-host-v1.webp`, com fundo transparente e proporção preservada. Fonte em `source/olympic-host-v1.png`; prompt integral em `prompt.json`; dimensões e hashes em `manifest.json`. Otimização reproduzível com `node scripts/assets/prepare-olympic-host.mjs`.

Para integração: utilizar como identificação visual junto ao estado ou no painel de propriedade. No tabuleiro, conferir a escala na câmera real e preservar nome, aluguel, construções e peões. Renderizar o rótulo “Sede das Olimpíadas” pela interface, fora da imagem. Sprite 2D com aparência de miniatura; não é modelo 3D.

O componente `OlympicHost` e as regras atuais permanecem inalterados nesta entrega de arte. A versão anterior de Copa foi superada por esta correção e não deve ser integrada. Arte feita com image_gen integrado, sem referências externas ou emblemas oficiais. Zero créditos Meshy.

## Prévia na propriedade

Exemplo controlado no Rio de Janeiro em `/scripts/assets/olympic-property-preview/`. Capturas em `preview/board.png` e `preview/property-detail.png`; reproduzir com `node scripts/assets/olympic-property-capture.mjs`. Usa o tabuleiro, contorno olímpico e construção reais, com o novo sprite diante da câmera. Na proposta, estádio e construção dividem a ilustração: construção deslocada lateralmente e com 82% da escala habitual apenas nesta prévia. Nome e placa de aluguel mantidos; valor mostrado vem do aluguel-base do catálogo, sem simular o cálculo olímpico. Sem jogador, servidor ou alteração da produção. A câmera real ainda precisa ser conferida nos demais estados e no celular antes de integração.

## Proposta vigente: moldura olímpica

O usuário pediu uma moldura para contornar a propriedade. Usar `olympic-frame-v1.webp` (512×683, 40.650 bytes), centro e exterior transparentes, acabamento dourado/verde, louros e pequena pira superior. Fonte em `source/olympic-frame-v1.png` e prompt integral em `frame-prompt.json`; dados em `frame-manifest.json`. Gerado com image_gen integrado, zero créditos Meshy.

Prévia padrão em `/scripts/assets/olympic-property-preview/`; capturas em `frame-preview/`; reprodução com `node scripts/assets/olympic-frame-capture.mjs`. A moldura acompanha os quatro cantos projetados do painel da casa, em plano logo acima da superfície. Construção mantida na posição e escala originais. O estudo anterior com estádio permanece disponível apenas com `?variant=stadium`. Produção e regras não alteradas. Conferir outras orientações e o tamanho da pira em celular antes de integrar.

## Versão vigente: cinco anéis no topo

A pedido do usuário, a pira foi substituída pelos cinco anéis olímpicos, com a ordem azul/preto/vermelho acima e amarelo/verde abaixo. Usar `olympic-frame-v2.webp` (512×683, 41.138 bytes), com transparência e moldura preservadas. Fonte em `source/olympic-frame-v2.png`, prompt de edição em `frame-rings-prompt.json` e manifesto em `frame-rings-manifest.json`. Edição com image_gen integrado; zero créditos Meshy.

A prévia padrão agora mostra os anéis. Capturas em `frame-rings-preview/`; reprodução: `node scripts/assets/olympic-frame-rings-capture.mjs`. Versão anterior com pira em `?variant=torch`; estádio em `?variant=stadium`. Sem alteração de produção ou regras.

## Integração autorizada e concluída — 07/11/2026

`board/OlympicHost.tsx` agora utiliza a moldura v2 no tabuleiro de 34 casas, mantendo a assinatura de props. A ativação continua vindo de `snapshot.olympics.hostStateId` em `Pieces.tsx`, sem alteração de comandos, cálculo de aluguel, câmera, posição ou escala de construções. O tabuleiro legado de 33 casas mantém o relevo anterior.

`board/olympicFrame.ts` projeta a moldura no painel real e divide suas faixas em trechos: nos estados horizontais, alonga as barras livres e preserva a proporção dos anéis e cantos. Um único mesh por sede, textura de 41 KB compartilhada, centro transparente, sem animação e sem capturar cliques. Geometria liberada ao trocar a sede. A prévia padrão também usa o componente de produção.

Conferência com `node scripts/assets/olympic-frame-qa.mjs`: RN, AC, RJ e MA em 1280×720 e 800×360, construção nível 2, troca e remoção de sede, sem erros de página/arquivos. Capturas e relatório em `integration/`. Build e 171 testes aprovados. Conferência em navegador de desktop com renderização de software; não houve medição em GPU de celular físico. Sem novo gasto de geração/Meshy e sem commit/merge nesta etapa.
