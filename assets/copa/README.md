# Estado-sede da Copa — conceito superado

**Correção do usuário:** o tema correto é Olimpíadas. Não integrar este conceito; usar `assets/olympic-host/` e `olympic-host-v1.webp`.

Marcador ilustrado com estádio, bola e taça, nas cores verde, amarelo, azul e dourado do projeto. Fonte em `source/copa-host-v1.png`; asset com alpha em `apps/web/src/board/board34/art/copa-host-v1.webp`. Prompt integral em `prompt.json` e dados do arquivo em `manifest.json`.

Aplicação prevista: identificação visual da sede em painel de propriedade ou marcador junto à casa. Manter proporção e transparência, sem esticar. No tabuleiro, reservar uma área que preserve nome, aluguel, peão e construções; conferir a escala na câmera real antes da integração. Texto “Sede da Copa” deve ser renderizado pela interface, fora da imagem.

Entrega de arte para apresentação, sem alterar a partida. O sistema atual usa `OlympicHost` e dados de Olimpíadas; não foi renomeado nem convertido automaticamente para Copa. A engenharia deve conectar o asset ao estado oficial da sede quando essa regra estiver definida. Não adicionar efeitos sobre aluguel nem trocar a sinalização existente apenas por esta entrega.

Arte gerada com image_gen integrado, sem imagens de terceiros ou símbolos oficiais de competições. Sem uso de Meshy: zero créditos Meshy. A imagem é um sprite 2D; não é um modelo 3D.
