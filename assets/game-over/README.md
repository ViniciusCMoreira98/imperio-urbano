# Fim de partida — arte de 07/11/2026

Acabamento do componente de produção `apps/web/src/hud/GameOverScreen.tsx`, com estilos em `hud/gameOver.css`. Painel azul/dourado, ícone por motivo de encerramento, troféu e confete para vitória/empate do jogador, prêmio em moedas e ranking com as cores dos peões. As animações respeitam movimento reduzido.

## Assets

| Arquivo em `apps/web/src/hud/art/game-over/` | Uso e origem |
|---|---|
| `trophy-v1.webp` | Troféu original gerado pelo image_gen integrado, 512×496, 69.572 bytes, transparência preservada. |
| `clock-v1.svg` | Relógio original em vetor para tempo esgotado. |
| `finish-v1.svg` | Coroa original em vetor para fim de jogo. |
| `exit-v1.svg` | Saída original em vetor para encerramento sem vencedor. |

Fonte do troféu em `source/trophy-v1.png`; prompt integral em `prompt.json`; dimensões, alpha e hashes dos quatro assets em `manifest.json`. Conversão: `node scripts/assets/prepare-game-over.mjs`. Os SVG são fontes editáveis próprias. O ícone de moeda e os retratos reutilizam assets do projeto. Sem referências de terceiros, Meshy ou créditos Meshy.

## Contrato preservado

Mesmas props `myId`, `token`, `gameId`, `onLeave`; a consulta do valor de aposta permanece a existente. `finalRanking`, `endedByClock` e `prizeShare` não foram modificados. Posições, vencedores, empate, propriedade, saldo, patrimônio e prêmio continuam derivados dos dados oficiais pelos mesmos helpers. A apresentação não concede moedas nem altera a partida. O som de vitória não mudou.

Ranking é a região com rolagem; cabeçalho/resultado e rodapé permanecem fora dela. Três jogadores cabem sem rolagem em 800×360 e 667×375; seis rolam. O retorno ao menu permanece visível. Nomes longos têm reticências e nome completo no título; o indicador “(você)” permanece separado.

## Prévia e conferência

Abrir `/scripts/assets/game-over-preview/?case=victory`. Casos: `classic`, `tie`, `placed`, `abandoned`, `nostake`, `six`; `count=2` a `count=6` ajusta o número de jogadores da amostra. O componente é real, com snapshot e consulta de aposta simulados apenas na prévia; sem conta, chamada API ou concessão de prêmio reais. A imagem de tabuleiro ao fundo é referência de composição própria.

`node scripts/assets/game-over-qa.mjs`: 7 situações × 4 tamanhos (28 combinações), contagens de 2 a 6, ranking/prêmio comparados aos helpers originais, três jogadores sem rolagem e seis com rolagem em celular, retorno sempre visível e callback preservado, movimento reduzido, transparência e hashes. Capturas/relatório em `assets/3d/reviews/game-over/`. Quatro testes existentes de `finalRanking` e build/TypeScript aprovados. Não certifica uma partida conectada ou celular físico.
