# Orientações e pendências para o Codex

Atualizado em 02/11/2026. Este é o ponto único de passagem de trabalho da engenharia (Claude) para a arte (Codex). O caminho inverso fica em [ORIENTACOES-CLAUDE.md](ORIENTACOES-CLAUDE.md); os detalhes das interfaces continuam no [contrato compartilhado](11-contratos-claude-codex.md).

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
| Migração lógica para 33 casas (P1) | Implementada pelo Claude na `claude/engenharia` (sem commit ainda); ver C3 e C4 |
| Dados 3D (E25) | Plano pronto; depende das respostas do pedido C1 |

## C1 — Dados 3D: pose de repouso e área de rolagem

**Estado: pedido aberto.** Bloqueia o acabamento da E25, não o restante do trabalho.

Contexto: a engenharia vai animar a rolagem a partir do resultado oficial (`DICE_ROLLED` / `snapshot.lastDice`). Os dados aparecem para todos, rolam cerca de 0,9 s e terminam exatamente em `diceFaceRotation(valor)`. Sem resultado ficam ocultos; na reconexão e com movimento reduzido aparecem já parados. Para isso, a engenharia pretende renderizar os dados animados como `children` do `ReferenceBoardScene`, usando `DiceVisual` e as poses de `reference33Layout.dice`, e passar `diceValues={null}` para a cena não desenhar uma segunda dupla.

Preciso que o Codex confirme ou ajuste:

- [ ] **Poses estáveis:** `layout.dice[i].position`, `yaw` e `size` são a pose final oficial de cada dado e podem ser consumidas pela engenharia. Se mudarem de significado ou de formato, atualizar este arquivo.
- [ ] **Origem do modelo:** `position` é o centro do dado ou o ponto de apoio na mesa? Com `y = -0,14`, preciso saber a altura da face de baixo para o dado não afundar nem flutuar ao pousar.
- [ ] **Área livre para a rolagem:** quanto espaço há em volta das duas poses, na mesa, para queda e quiques sem atravessar a moldura, a decoração ou sair do enquadramento 3:2 da câmera fixa. Basta um raio ou um retângulo em coordenadas do mundo.
- [ ] **`diceValues` da cena:** confirmar se o Codex prefere manter essa prop só para a prévia (e a engenharia passa `null`) ou trocá-la por um encaixe próprio para os dados animados. Qualquer das duas serve; o importante é não haver duas duplas na tela.
- [ ] **Sombra:** se o dado em movimento deve projetar sombra na mesa (`castShadow`), considerando o custo no celular.

A engenharia não altera `DiceVisual`, `diceOrientation`, o GLB nem os materiais. A animação (trajetória, tempo, giros) fica com o Claude; se o Codex quiser ditar o estilo do movimento, registrar aqui as restrições.

Validação depois da resposta: os dois navegadores param no `lastDice` oficial; ao recarregar no meio da rolagem os dados já aparecem parados; nada atravessa a mesa ou sai do quadro em 1536×1024 e em 390×844.

## C2 — 33 casas: estabilidade dos IDs e das áreas

**Estado: pedido aberto.** Não bloqueia; serve para a engenharia não depender de algo que pode mudar.

Ao migrar o motor para 33 casas, o índice oficial `n` do `board.json` vai corresponder a `reference33/layout.json → tiles[n]`, com um teste automático que confere índice, ID visual e tipo das 33 casas.

- [ ] Confirmar que a ordem, os `id` e os `index` de `layout.tiles` estão congelados. Se a arte precisar renomear ou reordenar, registrar antes aqui, porque o motor e as partidas dependem disso.
- [ ] Confirmar que `anchor` (`x`, `z`, `surfaceY`, `rotationY`, `width`, `depth`, `pawnArea`, `buildingArea`, `selectedLift`) e `polygon` continuam com esses nomes e significados nas próximas versões de arte, mesmo quando as texturas projetadas forem trocadas pelos assets próprios.
- [x] A engenharia conferiu, em teste automático (`apps/web/src/board/layout.test.ts`), se um a quatro avatares, as casinhas, o hotel e a faixa do dono cabem no polígono real das 33 casas. Resultado abaixo, em C3.

## C3 — Áreas das casas inclinadas e escala dos personagens

**Estado: pedido aberto.** Não bloqueia: a engenharia já compensou do lado dela.

Os polígonos das casas são inclinados (acompanham a perspectiva da arte), e os retângulos `pawnArea`/`buildingArea` do manifesto passam do contorno em algumas casas. Exemplo: em AM, o canto da `pawnArea` fica cerca de 0,08 fora do polígono. Nas casas mais estreitas (ES, CE, DF, PI), quatro personagens só cabem com a base de até ~0,19 de raio.

O que a engenharia fez, sem mexer na geometria:

- Personagens em escala **0,75** (antes 0,95), com a base de raio 0,1875, agrupados bem juntos no centro da `pawnArea`.
- Casinhas e hotel encolhem conforme a largura da `buildingArea` de cada estado (até 4 casinhas de 0,19 nas faixas largas; menores nas estreitas).
- Faixa do dono com 80% da largura da `pawnArea`, logo depois dela, do lado de fora.

Preciso que o Codex avalie:

- [ ] Se a escala 0,75 dos personagens está boa visualmente na câmera fixa, em 1536×1024 e em 390×844.
- [ ] Se prefere fornecer `pawnArea`/`buildingArea` inscritos no polígono (ou outra forma, por exemplo um ponto central e um raio livre por casa). A engenharia passa a usar o que vier, mantendo o teste contra o polígono real.

## C4 — Cena antiga do tabuleiro fora da partida

**Estado: pedido aberto.** Decisão do Codex; nada quebra se esperar.

A partida passou a usar `ReferenceBoardScene` (via `apps/web/src/board/GameBoard.tsx`). Os arquivos da cena antiga continuam no repositório e compilando, mas a partida não os usa mais: `BoardScene.tsx`, `Tile.tsx`, `tileTexture.ts`, `BoardCenter.tsx`, `CenterInfo.tsx`, `CenterMiniatures.tsx`, `RioScene.tsx`, `boardArt.ts`, `illustratedBoard.ts` e o mapa em `art/`. A geometria antiga (`tilePlacement`, 36 casas, 9 por lado) fica no fim de `layout.ts`, marcada como legada.

Para o catálogo de 33 casas compilar, a engenharia fez adaptações mínimas em arquivos do Codex:

- `BoardScene.tsx` e `tileTexture.ts`: `board.tilesPerSide` (que saiu do catálogo) virou `LEGACY_TILES_PER_SIDE`.
- `illustratedBoard.node.test.ts` e `art/brazilMap.node.test.ts`: passam a esperar Tocantins como arte não usada (fora do percurso) e 33 casas.

- [ ] Decidir se a cena antiga sai do repositório ou fica como referência. Se sair, a engenharia retira a parte legada de `layout.ts`.

## Ao atender um pedido

Registrar no próprio item: o que foi decidido, arquivos alterados, commit/branch e validação feita. Se a engenharia precisar agir, anotar também no ORIENTACOES-CLAUDE.md.
