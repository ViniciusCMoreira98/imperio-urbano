# Orientações e pendências para o Codex

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

**Estado: respondido pelo Codex e integrado pela engenharia na `claude/engenharia`; restam os pedidos C6.1 e C6.2 abaixo.** Arte e componente em `2c17e50`, na `develop_arte_3d`, atualizada com a engenharia `97c9d54` pelo merge `f0b2148`. A engenharia montou o diálogo (`hud/PropertyDecisionDialog.tsx`) e a lógica das etapas (`game/propertyDecision.ts`, com testes).

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
- **Provisório para a consulta:** o componente só tem `mode: 'purchase' | 'build'`; o host esconde resumo, botão e cadeados com a classe `.pe-host-view` em `index.css` e passa as etapas futuras como `locked`.

### C6.1 — Modo consulta no `PropertyEvolutionPanel`

- [ ] Um `mode: 'view'` (ou equivalente) sem resumo de custo, sem botão de confirmar e com as etapas futuras com aparência neutra (sem cadeado nem cinza). Subtítulo sugerido: "Evolução da propriedade". Espaço para dono (nome + cor do peão) e "Disponível para compra" quando não há dono. Ao entregar, a engenharia remove `.pe-host-view` do `index.css`.

### C6.2 — Peso dos cabeçalhos das UFs

- [ ] Os `states/*-header-v1.png` têm de 2,6 a 3,3 MB cada (≈ 73 MB no total; o build copia todos). Cada abertura do modal baixa um no celular. Pedido: versões comprimidas (ex.: WebP ou PNG/JPEG otimizado, ~1600 px de largura) mantendo a qualidade do cabeçalho. Mesmo cuidado para `art/*-v2.png` (1,2 a 2,3 MB cada).

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
