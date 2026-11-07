# Ambiente de praia tropical — 07/11/2026

Arte derivada da proposta aprovada `assets/concepts/praia-tropical/ambiente-praia-v1.png`. Fundo exclusivo de ambiente: deque dourado, mar turquesa, areia, coqueiros, coco e toalha nas laterais. Não contém tabuleiro, HUD, textos ou peças embutidos.

- Runtime: `apps/web/src/board/board34/art/beach-environment-v1.webp`, 1672×941, 439.518 bytes.
- Fonte PNG: `source/beach-environment-v1.png`.
- Prompt integral/origem: `prompt.json`; dimensões, hashes e compressão: `manifest.json`.
- Reprodução da conversão sem recorte: `node scripts/assets/prepare-beach-environment.mjs`.

## Uso e prévia

`Board34Scene` aceita `environment="beach"`. O padrão `wood` permanece compatível com a partida atual. `TabletopEnvironment` apresenta a arte como fundo da cena, com recorte central proporcional, reflexos e receptor transparente de sombras; o fundo não intercepta os cliques. No tema praia, os modelos decorativos antigos de vaso, caneca e moedas não são montados. Tabuleiro, câmera, dados, construções, aluguéis e regras permanecem os mesmos.

Prévia: `/scripts/assets/board34-preview/?environment=beach`. Acrescentar `&olympics=1` permite conferir a sede olímpica. A prévia usa o tabuleiro e modelos reais com estado controlado, sem API ou partida conectada. A montagem do tema na partida fica para a engenharia; o menu e a produção não foram trocados silenciosamente.

QA: `node scripts/assets/beach-environment-qa.mjs`. Capturas e relatório em `assets/3d/reviews/praia-tropical/`.

Geração pelo `image_gen` integrado, sem Meshy ou créditos Meshy. A referência usa arte própria do projeto; os valores/nomes da proposta não integram o fundo final.

## Tabuleiro ampliado

A prévia da praia ocupa a janela inteira, oculta a barra de inspeção e usa framing=immersive. Em 844×390, o tabuleiro fica aproximadamente 44% maior do que na apresentação anterior. O perfil padrão e a produção permanecem preservados; na integração, conferir os painéis reais nas reservas superiores/inferiores menores. A perspectiva e a escala entre os eixos permanecem uniformes.
