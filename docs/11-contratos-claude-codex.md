# 11 — Contratos entre engenharia (Claude) e arte 3D (Codex)

**Orientações operacionais e fila atual da engenharia:** [ORIENTACOES-CLAUDE.md](ORIENTACOES-CLAUDE.md). O Codex deve atualizar esse único arquivo sempre que uma entrega exigir ação do Claude; este contrato mantém os detalhes das interfaces. Pedidos da engenharia para a arte: [ORIENTACOES-CODEX.md](ORIENTACOES-CODEX.md).

## Regra vigente de criação — referências não são assets finais

O usuário esclareceu que toda imagem enviada é um modelo visual para o Codex criar a arte, não uma imagem a utilizar no produto. Criar assets próprios: modelos, ilustrações, texturas, materiais, logotipo/retratos e renders conforme a referência. Não aplicar o PNG enviado, recortes ou projeções dele como arte final das casas, centro, mesa, decoração ou HUD. A referência permanece somente para estudo, calibração e comparação. Esta decisão substitui as recomendações históricas de projeção, recorte e reaproveitamento de pixels nas seções seguintes.

Estado real: a prévia atual de 33 casas usa projeção do PNG enviado e, portanto, é um protótipo de disposição/câmera, **não uma entrega de arte recriada aprovada**. Codex precisa substituir as artes derivadas diretamente das referências. Geometria, 33 IDs, posição, câmera fixa e âncoras podem ser aproveitados após validação. Os relatórios de baixo erro RGB dessa projeção comprovam alinhamento dos mesmos pixels, não criação independente ou fidelidade de novos assets. A comparação obrigatória deve ser repetida com os assets próprios.

Claude pode avançar no motor/contratos de 33 casas e adaptar a interface de integração, mas não deve consolidar as projeções/recortes como assets finais nem recriar a arte no lugar do Codex. Não desfazer a decisão de 33 casas, não sobrescrever alterações alheias e não consumir créditos Meshy sem autorização. Este registro não iniciou geração paga, nova reconstrução ou merge automático.

## Decisão mais recente — 33 casas da imagem, faces totalmente preenchidas

O usuário confirmou explicitamente reproduzir as 33 casas da imagem composta: 26 UFs (sem TO), dois Eventos e Início, Olimpíadas, Descanso, Taxa e Aeroporto. O layout de 36 casas do motor não é o destino visual. Claude adapta regras e índices; Codex entrega geometria, posição, arte e âncoras estáveis por ID. Não retirar estados nem alterar o backend nesta worktree para simular essa migração. O layout visual de 33 casas deve poder ser conferido em R3F com seleção independente e servir à integração posterior.

As artes precisam ocupar a face inteira de cada casa: ajustar a geometria aos polígonos da referência, usando projeção de textura de repouso na câmera fixa, sem margens `contain`, sem pequenos cartões dentro de quadros e sem esticar imagens para retângulos arbitrários. A imagem composta é idêntica ao novo anexo do usuário e fornece os pixels aprovados. Qualidade é medida no enquadramento nativo 1536×1024; amostrar em textura maior não inventa detalhe que a fonte não tem. Meshes de casas independentes, corpo extrudado e seleção própria; centro e mesa/decorativos são camadas separadas. Nunca usar uma foto plana do tabuleiro inteiro por baixo das casas para mascarar falhas.

### Entrega visual de 33 casas

- `apps/web/src/board/reference33/layout.json` contém IDs, sequência de referência, polígonos em pixels/mundo, altura e âncoras por ID. Sequência: Início → AM → RR → Evento norte → AP → PA → RO → Olimpíadas → AC → MT → MS → GO → Evento leste → DF → MG → ES → Descanso → RJ → PR → SP → Taxa → RS → SC → PE → PB → Aeroporto → BA → SE → AL → RN → CE → PI → MA. Sem TO e sem outros Eventos. Claude associa esses IDs aos índices oficiais do novo motor; não aproveitar os índices do catálogo de 36 casas desta branch.
- `ReferenceBoardScene.tsx` exporta a camada R3F, `reference33Layout` e `referenceTileAnchor(id)`. Props: `selectedId`, `onSelect(id)`, `diceValues` e `children` (conteúdo 3D injetado pela engenharia). `diceValues` é nulo por padrão; a prévia usa 5/3 fixos e explicitamente ilustrativos. A cena não lê stores, sorteia dados ou envia comandos. O callback funciona nas 33 casas. A seleção destaca a superfície, sem elevar a casa ou mover a câmera.
- Âncora: `x`, `z`, `surfaceY=0.08`, `rotationY`, `width`, `depth`, `pawnArea`, `buildingArea` e `selectedLift=0`. As áreas são retângulos de referência para a integração; a engenharia deve validar distribuição/escala dos avatares e construções dentro do polígono, sem assumir medidas do tabuleiro anterior. O polígono real acompanha cada casa para essa validação.
- Geometria Blender: `apps/web/public/models/board/reference33-v01.glb`, 33 objetos nomeados `TILE_<ID>`, extrudados, com quinas chanfradas e lados dourados; centro, corpo, moldura, mesa/decorativos e intervalos separados. 7.517 triângulos, 446.128 bytes; Khronos: zero erros e zero avisos. Cena fonte: `assets/3d/calibration/reference33/reference33.blend`. Não são primitivas provisórias. Geradores: `build-reference33-layout.mjs` e `build-reference33-model.py` em `scripts/assets/`.
- Faces impressas recebem coordenadas projetivas de repouso (`sourceQ`); elas continuam presas a cada objeto, não são amostradas pela posição atual do pixel na tela. A textura é o PNG original compartilhado, sem regravar ou reduzir ilustrações. Mesa/decorativos têm um recorte geométrico que exclui o tabuleiro. A camada dos intervalos mascara as 33 casas e o centro; ao ocultar uma casa aparece o suporte, não outra foto dela. Dados são GLBs separados; a região dos dados pintados na foto foi excluída do fundo.
- Prévia independente: `node scripts/assets/reference33-preview/server.mjs`, URL `http://127.0.0.1:4183/scripts/assets/reference33-preview/`. Não é uma partida conectada e não substitui automaticamente `GameScreen`/`BoardScene`. A ligação ao motor de 33 casas, posicionamento, ocupação e regras permanece com Claude. Os arquivos funcionais dele não foram alterados ou sobrescritos.
- Conferência: `node scripts/assets/reference33-qa.mjs`. Capturas, sobreposição e diferença em `assets/3d/reviews/reference33/`. Testa 33 cliques reais, 33 objetos independentes, câmera invariável, celular e desaparecimento da arte ao ocultar AM. Compara pixels interiores de cada face (excluindo 4 px da borda chanfrada): maior MAE ≈1,012/255 na referência nativa. Isso aprova preenchimento/arte das casas, não certifica a reconstrução inteira nem qualidade 4K inexistente na fonte. Corpo, dados, peças/construções e integração continuam sujeitos à revisão. Validação geral da branch: 68 testes e build aprovados. Zero créditos pagos, sem commit/merge nesta entrega.

Correção das faixas marrons: a impressão projetiva agora cobre também os lados e chanfros `GoldSides` de cada casa, preservando geometria e profundidade. Na câmera fixa, o acabamento usa as cores/sombras da borda aprovada, evitando que uma faixa de material uniforme invada a imagem. O corpo de madeira continua separado. A comparação passou a incluir uma faixa de 6 px em torno dos contornos: MAE médio caiu de ≈22,665 para ≈1,582/255, com limite de regressão <3. `edge-fix-before.png` guarda a captura anterior; `comparison.json` registra antes/depois. Modelo, posições, câmera e backend não foram alterados para esse ajuste. Os 33 cliques e a independência das casas continuam conferidos; build aprovado. A conferência usa porta 4184, permitindo manter a prévia do usuário na 4183.

## Decisão vigente — câmera estática, calibração aprovada

O usuário aprovou executar a primeira entrega de calibração: câmera fixa no Blender/R3F e comparação da screenshot real com `assets/board/tabuleiro-brasil-alvo.png` em 1536×1024. Nenhum controle, foco de casa ou evento de turno pode alterar a câmera. Responsividade por escala uniforme da composição 3:2, com margens, sem recorte ou esticamento. A pose/projeção só muda ao carregar outra calibração explicitamente aprovada, nunca por estado da partida.

Codex altera somente cena/câmera e ferramentas de calibração nesta etapa. Claude mantém seleção, saltos, distribuição e regras; deve retirar os botões/atalhos de câmera e o disparo de foco dos próprios componentes. Não alterar `Pawn`, `Pawns`, `pawnLayout`, `Tile`, `ViewControls`, `GameScreen`, stores ou backend nesta entrega. A câmera deve permanecer imóvel mesmo enquanto esses comandos legados ainda atualizem o store. Mudanças do Claude posteriores à base desta worktree não serão sobrescritas ou mescladas automaticamente.

A calibração usa o envelope externo atual do tabuleiro. Pontos de referência são interseções estimadas dos trechos retos da moldura, não os extremos das quinas arredondadas. Medir erro de projeção separadamente da diferença de pixels: alinhar quatro cantos não conclui a reconstrução. Geometria, ordem/arte das casas, sombras, decoração e composição interna continuam sujeitos às etapas seguintes e ao percurso aprovado pela engenharia. Não deformar a screenshot após a captura para melhorar métricas.

### Primeira entrega — calibração implementada

- Perfil: `apps/web/src/board/camera/fixedCamera.json`, referência original 1536×1024 com hash, envelope 11,9×11,9 e superfície Y=0,3. Câmera perspectiva, FOV vertical ≈20,21549°, posição ≈[0,570736; 18,579600; 20,374700], orientação e deslocamento óptico registrados no perfil. Não copiar valores para stores ou criar ajustes por turno.
- Cena Blender: `assets/3d/calibration/fixed-camera/fixed-camera.blend`. Contém câmera, referência como fundo e envelope de arame explicitamente marcado como objeto de calibração, oculto no render; não é a geometria final. Regenerar com Blender em segundo plano e `scripts/assets/calibrate-fixed-camera.py`. O script usa coordenadas Y-up no perfil e converte para os eixos do Blender na cena.
- `CameraRig.tsx` usa `applyFixedCamera`, sem CameraControls/OrbitControls, store, animação ou eventos de entrada. `FixedBoardViewport.tsx` mantém a área 3:2 por escala uniforme com margens. Em 390×844, a composição mede 390×260; não usar zoom/corte para preencher o restante da tela. Ajustes de HUD/sobreposição são da integração posterior com Claude.
- Comparação: `node scripts/assets/fixed-camera-qa.mjs`. Renderiza `GameScreen` no Chromium com WebSocket interceptado, sem backend real. Grava captura completa com peças, captura estática com HUD oculto e snapshot sem peças, sobreposição 50%, diferença RGB ampliada ×2, lado a lado e relatório em `assets/3d/reviews/fixed-camera/`. As imagens comparadas são nativamente 1536×1024, sem deformação após captura. No código de desenvolvimento, `__imperioStaticCamera` permite ao teste inspecionar as matrizes reais; não é incluído em produção.
- A projeção do Blender ficou a menos de 0,001 px dos quatro pontos medidos; a do navegador coincide numericamente com eles. Isso mede o ajuste aos pontos manuais, não a precisão física da ilustração nem o contorno inteiro. Testes no navegador confirmam matrizes invariantes sob roda, arrasto, Q/E, duplo clique/foco, troca de turno, resize e pinça de toque.
- A comparação atual mantém `fidelityAccepted=false`: MAE RGB global ≈71,38/255, centro ≈56,51, casas/moldura ≈95,73 e mesa/decoração ≈54,74. Não converter esses valores em porcentagem de fidelidade. Faltam contorno arredondado, integração do novo percurso e artes separadas, alinhamento interno de logotipo/paisagem, decoração, sombras e acabamento. A próxima entrega é reconstruir o corpo/moldura, preservando a câmera calibrada e medindo novamente.
- Validação desta worktree: 65 testes e build aprovados. Zero créditos Meshy. Não houve merge, commit ou modificação dos componentes do Claude. A base da branch permanece anterior às mudanças recentes de engenharia; integrar com o layout definitivo somente após alinhar os contratos.

### Correção dos recortes das UFs

`board/art/stateArtwork.ts` carrega a prancha definitiva e desenha a janela completa da UF com ajuste `contain`. `tileTexture.ts` usa essa função para preservar nome, paisagem e borda, reservando espaço separado para a faixa de aluguel nas propriedades compradas. As proporções não são alteradas; as margens restantes dependem da geometria atual e serão tratadas na reconstrução das casas. Câmera, layout lógico, altura das casas, cliques e posicionamento não foram alterados nesta correção. Na integração com as mudanças do Claude, reaplicar somente a chamada ao helper, preservando os novos tipos e regras de sua versão; não substituir o arquivo inteiro por uma versão anterior.

`scripts/assets/inspect-state-art.ts` verifica na cena real a proporção, limites da textura, limites da projeção e visibilidade dos quatro cantos por raycast. O ensaio estático de 27 UFs livres e 27 compradas oculta peões somente nos snapshots de teste para distinguir recorte/oclusão pela moldura de sobreposição natural por personagens. Relatórios: `state-art-visibility.json` e `state-art-visibility-owned.json`, junto à comparação da câmera. Hook de inspeção da cena disponível somente em desenvolvimento. A captura com jogadores continua separada. A comparação de fidelidade geral permanece reprovada até concluir a reconstrução; encaixar as artes completas não equivale a aprovar a composição final.

Interfaces que os dois lados respeitam para trabalhar em paralelo (branches separadas, sem merge automático). Mudança de contrato: atualizar este documento **antes** do código e avisar o outro lado.

## 1. Manifesto de personagens (`apps/web/src/avatars/characters.json`)

Fonte única dos personagens jogáveis. **Formato e validação: Claude** (`characterManifest.ts` + teste). **Conteúdo (arquivos, ajustes): Codex.** Nenhum caminho de modelo fica fora deste arquivo.

```jsonc
{
  "schemaVersion": 1,
  "fallback": "kenney-male-a",          // personagem usado se um modelo faltar ou falhar
  "characters": [
    {
      "id": "kenney-female-a",          // id estável do asset (igual ao catálogo do Codex quando houver)
      "avatarId": "avatar-1",           // avatar do jogo (o servidor aceita avatar-1 … avatar-5); null = só reserva/fallback
      "file": "/models/characters/character-female-a.glb", // caminho público servido pelo Vite
      "height": 0.8,                    // altura no tabuleiro, em unidades da cena (1 casa = 1 de largura)
      "rotationY": 0,                   // correção de frente em radianos (o jogo espera frente +Z)
      "offset": [0, 0, 0],              // ajuste fino do pivô após a normalização (x, y, z)
      "idleClip": "idle",               // opcional: nome do clip de "parado"; null = sem animação
      "status": "published",            // candidate | validated | approved | published
      "license": "CC0 (Kenney)"
    }
  ]
}
```

Normalização feita pelo carregador (não alterar a geometria original):

1. Mede a caixa do modelo na pose de repouso.
2. Escala uniforme para a altura `height`.
3. Centraliza em X/Z e apoia os pés em Y = 0.
4. Aplica `rotationY` e `offset`.

Esqueleto e animações são **opcionais**: com `SkinnedMesh` o modelo é clonado com `SkeletonUtils.clone`; sem, com `clone()` comum. O movimento entre casas é procedural (saltos), sem depender de clip de caminhada.

Clips opcionais por nome (procurados no GLB; não precisam de campo no manifesto):

| Clip | Quando toca | Sem o clip |
|---|---|---|
| `idle` (ou o `idleClip` do manifesto) | parado na casa | personagem estático |
| `celebrate` | vencedor, no fim da partida, parado na casa | saltinhos procedurais no lugar |
| `defeat` | jogador que faliu, antes de sair do tabuleiro | só a saída procedural (encolhe e afunda) |

O clip só é usado se existir; nada no jogo depende dele. Animações de esqueleto devem ficar no lugar (sem deslocar a raiz), porque posição e saltos são do jogo.

Requisitos do GLB (alinhados a `docs/07-meshy-pipeline.md` do Codex): glTF 2.0 autocontido ou com texturas ao lado, Y para cima, frente +Z, **sem pedestal/base**, até 12 mil triângulos e 3 MiB.

## 2. Superfície das casas (implementado na Etapa 3)

Interface compartilhada em `apps/web/src/board/layout.ts`, para os personagens pisarem certo mesmo se o Codex mudar a geometria do tabuleiro:

```ts
interface TileAnchor { x: number; z: number; surfaceY: number; rotationY: number; width: number; depth: number; isCorner: boolean }
function tileAnchor(index: number): TileAnchor   // fonte única de posição e altura da casa
```

A espessura das casas (`TILE_HEIGHT`) mora em `layout.ts`; `Tile.tsx` a importa de lá (e reexporta para quem já usava). Se a arte mudar a geometria das casas, ajusta `TILE_HEIGHT`/`tileAnchor` para `surfaceY` continuar igual ao topo real. Personagens e bases só leem `tileAnchor`; a distribuição de até 4 jogadores na mesma casa fica em `board/pawnLayout.ts`.

## 3. Base iluminada do jogador (implementado na Etapa 3)

`avatars/PlayerBase.tsx`: `PlayerBase { color, active }` (somente anel de luz, sem disco/pedestal; pulsa na vez do jogador) e `ActiveMarker { color, height }` (seta sobre a cabeça de quem joga). Independentes do GLB; o anel fica na superfície da casa e não sobe no salto. A pedido do usuário, `BASE_HEIGHT = 0`: os pés apoiam diretamente na superfície da casa, sem uma plataforma física. **Posição, cor e estado ativo: Claude. Aparência (material, brilho, forma): Codex**, sem mudar as props e mantendo `BASE_HEIGHT` como a altura onde o personagem pisa. O chão circular da prévia de seleção também foi removido; a engenharia mantém os deslocamentos/saltos relativos à altura de apoio.

## 4. Cor do uniforme — proposta para a engenharia

**Arte (Codex):** máscara UV em PNG, sem alterar a textura original, e dados de referência por asset. **Engenharia (Claude):** campos opcionais do manifesto, carregamento da máscara e aplicação da cor recebida pelo avatar. Implementado pela engenharia: campo `uniform` no manifesto (tipo e validação em `characterManifest.ts`), aplicação em `apps/web/src/avatars/uniformTint.ts` (material próprio por cópia, cor por uniforme, texturas compartilhadas, cache intacto) e uso no tabuleiro e na prévia da sala.

Campo proposto no manifesto: `uniform?: { mask: string; referenceLuminance: number; localYRange?: [number, number] }`. `mask` usa caminho público `/models/...png`; `referenceLuminance` é um número positivo no espaço linear. Na Luana, o material 0 é o único material; a máscara controla somente o casaco e suas mangas. Capacete, pele, cabelo, olhos, botas, luvas, bolsas, camisa e detalhes dourados devem preservar a cor original.

Máscara: canal R linear (0 = preservar, 1 = recolorir, valores intermediários = borda suavizada), mesmo `TEXCOORD_0` do albedo, `NoColorSpace`, `flipY=false`, `generateMipmaps=false`, `minFilter=magFilter=LinearFilter` e `ClampToEdgeWrapping`. Desabilitar mipmaps somente na máscara evita misturar regiões UV protegidas com o casaco em níveis menores; a textura original mantém sua filtragem. Não multiplicar a textura burgundy diretamente pela cor do jogador: isso escurece verde/azul. Após amostrar o albedo em espaço linear, calcular `shade = clamp(dot(base.rgb, vec3(0.2126, 0.7152, 0.0722)) / referenceLuminance, 0.15, 2.0)` e `base.rgb = mix(base.rgb, playerColorLinear * shade, mask.r)`, antes da iluminação. Preservar alpha, mapas, PBR e a compilação normal do material.

Cada instância precisa do próprio material e uniforme de cor; textura base e máscara podem ser compartilhadas. A troca de cor não pode alterar outra peça nem modificar os materiais do cache de `useGLTF`. Liberar apenas materiais criados pela instância; não descartar texturas compartilhadas. Avatares sem `uniform` continuam com o comportamento atual, inclusive o reserva. Aplicar também à prévia de seleção. Não mudar regras, rede ou movimentação para implementar este recurso.

Quando houver `localYRange`, passar `position.y` da geometria original por um varying **antes de morph/skinning e da normalização do manifesto**. Multiplicar o peso da máscara por `step(minY, localY) * step(localY, maxY)`. Essa guarda por região protege cabeça/pescoço e pernas contra pequenas amostragens nas bordas do atlas. Para a Luana atual, usar `[-0.57, 0.07]`, referência `0.02695356` e a máscara v04 do descriptor; não derivar esses limites da posição da peça no tabuleiro. Sem esse campo, a guarda vale 1.

Os arquivos e a luminância medida acompanham o asset; conferir o descriptor JSON preparado pela arte antes de preencher o manifesto. Validar as seis cores e múltiplas cópias simultâneas do mesmo avatar em cores diferentes. Os limites de memória GPU seguem sujeitos à medição em aparelho real.

### Entrega de arte disponível

- Máscara: `apps/web/public/models/characters/steampunk-brasil-v01-uniform-mask-v04.png` (1024×1024, canal R).
- Descriptor: `apps/web/public/models/characters/steampunk-brasil-v01-uniform-v04.json`; o objeto `uniform` fornece os campos propostos para a Luana no manifesto.
- Referência funcional isolada do shader: `scripts/assets/uniform-preview.html`. O uniforme `uniformStrength` existe somente para o teste comparativo ligado/desligado; não é um novo campo necessário no manifesto.
- Gerador reutilizável para este asset: `scripts/assets/bake-uniform-mask.py`. Não é segmentador genérico de personagens; usa a cor burgundy do albedo e as regiões UV/geometria desta Luana, sem editar GLB ou textura base.
- Conferência: `node scripts/assets/uniform-mask-qa.mjs`; resultados e capturas de frente/costas em `assets/3d/reviews/uniform-mask`. Testa seis cores, materiais independentes, máscara compartilhada e preservação das regiões medidas comparando cada instância consigo mesma no mesmo viewport, com a recoloração ligada/desligada. Isso evita confundir diferenças de derivadas/rasterização entre colunas da GPU com vazamento real da máscara.

O carregador de produção, seu schema/validação e o manifesto permanecem sem a integração de cor nesta entrega de arte. A engenharia deve implementar essa parte e atualizar este mesmo contrato; não criar outro documento apenas para a alteração.

## 5. E25 — Visual dos dados 3D

**Codex:** GLB autoral, materiais, componente visual e demonstração isolada. **Claude:** disparo/repetição da rolagem, leitura do resultado oficial, reconexão, acessibilidade e integração no tabuleiro/HUD. A preparação de arte não substitui o componente 2D atual nem envia comandos ao servidor.

`dice-ivory-v01.glb`: cubo de lado 1, pivô no centro, Y para cima; corpo marfim com cantos arredondados e pontos escuros em cavidades rasas. Sem letras, pedestal, texturas, luzes ou câmeras embutidas. Um modelo compartilhado entre os dois dados, dois materiais, meta de até 3 mil triângulos e 128 KiB por dado. Escala sugerida: lado 0,5 da cena; para repousar numa superfície Y, posicionar o centro em `Y + size / 2`.

Orientação nativa: **+Y=1, -Y=6, +Z=2, -Z=5, +X=3, -X=4**. Opostas somam sete. A especificação gerada fica em `apps/web/src/dice/diceAsset.json`. `diceFaceRotation(face)` retorna a rotação XYZ que coloca a face recebida para cima; não sorteia valores. `DiceVisual { face?: 1|2|3|4|5|6, size?: number }` é um componente para uso dentro de um Canvas R3F, com origem no centro. O grupo externo fica livre para posição/rotação da animação; ao terminar, aplicar identidade nesse grupo e o `face` oficial no visual, ou usar diretamente a rotação exportada no motor de animação.

O componente visual não lê stores, não gera resultados e não anima por conta própria. O valor padrão 1 existe apenas para inspecionar o asset sem props. Na integração, a engenharia deve passar explicitamente os valores do servidor; sem resultado, ocultar ou apresentar estado de espera, sem inventar um lance. Ao reconectar ou reduzir animações, apresentar o resultado oficial diretamente. A demonstração da arte usa pares predeterminados e não representa lógica de uma partida.

### Entrega de arte disponível

- Modelo: `apps/web/public/models/dice/dice-ivory-v01.glb`, 84.280 bytes, 2.664 triângulos, dois materiais e nenhuma textura; produzido localmente, com zero créditos Meshy.
- Componente: `apps/web/src/dice/DiceVisual.tsx`; orientação em `diceOrientation.ts`. Nós independentes por instância, geometria e materiais compartilhados; não modificar os materiais do cache na integração.
- Gerador: `scripts/assets/build-dice.py`, executado com Blender em segundo plano e três argumentos: GLB, descriptor JSON e relatório JSON. Recusa sobrescrever um GLB existente.
- Demonstração: `scripts/assets/dice-preview/`, com rotação e pequenos saltos de apresentação usando pares fixos. `node scripts/assets/dice-visual-qa.mjs` verifica as seis faces e o repouso final nos tamanhos de janela 1280 e 390; gera capturas e relatório em `assets/3d/reviews/dice/`. Não mede desempenho em celular físico.
- Validação: glTF com zero erros e zero avisos; testes conferem os 21 pontos na geometria exportada, orientações e orçamento do asset. A integração da E25 com a partida permanece com a engenharia.

## 6. E26 — Anúncio olímpico junto ao estado-sede

**Arte (Codex):** `apps/web/src/olympics/OlympicCallout.tsx` e CSS local: tocha vetorial autoral, painel roxo/marinho com borda dourada, nome da sede, selo ×N, chamada breve e 24 confetes. Não usa imagens, fontes remotas, créditos Meshy, stores, temporizadores JS ou sorteio. O visual pertence ao estado-sede, conforme D22; não abrir modal central nem deslocar a câmera.

**Interface:** componente DOM `OlympicCallout { stateName: string; multiplier: number; edition?: number; celebrate?: boolean; reducedMotion?: boolean }`. A engenharia pode colocá-lo num `Html` do Drei, acima da casa, usando a posição da sede e ajustando projeção/oclusão; o componente não decide coordenadas. `stateName`, `multiplier` e `edition` vêm do estado oficial, sem calcular progressão na arte. O multiplicador aceita inteiro positivo, sem limitar as regras futuras.

`celebrate=false` apresenta somente o selo persistente. Com `celebrate=true`, a entrada dura 650 ms, os confetes terminam em menos de 2 s e a chamada some em 3,2 s, mantendo o selo. A sequência inicia na montagem; para uma nova edição, a engenharia deve montar com uma chave estável do evento oficial. Não mudar a chave a cada render. Reconexão/snapshot inicial: usar `celebrate=false`; deduplicação, fila e disparo por evento são responsabilidades do Claude.

O componente não captura cliques, não altera foco e oferece uma descrição acessível estática (`role=img`). A engenharia decide o anúncio único em sua região viva existente, evitando repetição por render/reconexão. Preferência CSS `prefers-reduced-motion` ou prop `reducedMotion=true` remove deslocamentos e confetes; a chamada aparece parada e some após o mesmo prazo. Não há pisca-pisca nem animação infinita. O selo também pode complementar a tocha/moldura 3D existente em `board/OlympicHost.tsx`; evitar duplicar dois selos ×N ao integrar.

Demonstração isolada: `scripts/assets/olympics-preview/`. Conferência: `node scripts/assets/olympics-visual-qa.mjs`; capturas e relatório em `assets/3d/reviews/olympics/`. O teste verifica ×10, permanência do selo após a chamada, replay explícito, movimento reduzido por prop e sistema, limites das janelas 1280/390, ausência de captura de cliques e de chamadas à API. A sede/edição da prévia são ilustrativas. Nenhum disparo real ou componente atual do tabuleiro foi substituído nesta entrega.

## 7. E27 — Mapa central e cartas

**Arte (Codex):** substituir o recorte raster do mapa central por desenho local com contornos de UFs, acabamento verde/dourado e relevo discreto; preservar logotipo, slots e miniaturas da cena. O mapa é decorativo: não altera o catálogo, preços, ordem, seleção ou posição das casas. Os nomes/siglas e cores de grupos continuam no catálogo. Sem carregamento remoto durante a partida. Nenhuma interação nova no centro.

Preparar também frente visual reutilizável das cartas (`EventCardVisual`, recebe `card: EventCard` e `who?: string`) e desenho do verso usado na pilha. Textos e efeitos vêm do catálogo existente; a arte não calcula efeitos, escolhe cartas, lê stores ou controla revelação/prazo. A engenharia conecta a frente ao fluxo de `CardReveal`, mantendo regras, acessibilidade e fechamento. Não criar outro baralho. Origem dos contornos, geração e resultados visuais serão registrados nesta seção ao concluir.

### Entrega disponível

- Mapa já aplicado em `BoardCenter.tsx`: contornos das 27 UFs em `board/art/brazilMap.json`, incluindo DF, com norte no fundo (-Z). Fonte: [API de Malhas do IBGE](https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/vnd.geo%2Bjson&qualidade=minima&intrarregiao=UF), qualidade mínima. O arquivo de origem está em `assets/board/sources/brazil-uf-ibge.geojson`; SHA-256 e projeção constam no descriptor. `node scripts/assets/build-brazil-map.mjs` regenera o descriptor localmente.
- `createBrazilMapCanvas()` em `board/art/brazilMapArt.ts` produz textura transparente de 1024×1049 com contornos claros, halo e lateral desenhada (relevo ilustrado, não malha extrudada). Mosaico decorativo verde, amarelo e vermelho como na referência, sem vínculo com grupos de compra ou donos. Não serve como cartografia técnica. `CENTER_LAYOUT`, `centerSlots` e âncoras das casas preservados.
- Mapa: uma textura RGBA de aproximadamente 4,1 MiB antes dos mipmaps e um plano de dois triângulos; textura descartada ao desmontar. As miniaturas já existentes permanecem ao redor. Desempenho em aparelho real continua pendente de medição pela engenharia.
- Cartas: `cards/EventCardVisual.tsx` e `eventCards.css`, com 16 motivos SVG próprios, texto do catálogo, nome opcional de quem tirou a carta e fallback para cartas futuras. Sem imagens/fontes remotas ou créditos pagos. Não adicionar outro `role=status` dentro da região viva existente. A frente está preparada, mas `hud/CardReveal.tsx` e seu prazo/fluxo não foram alterados.
- Verso já aplicado à pilha em `CenterInfo.tsx` via `cards/eventCardBack.ts`; posições, espessura e quantidade de lâminas inalteradas. Nenhum segundo baralho foi adicionado.
- Prévia: `scripts/assets/map-preview/`. `node scripts/assets/map-visual-qa.mjs` gera relatório/capturas em `assets/3d/reviews/map-cards/`: 1280/390 px, 16 textos conferidos contra o catálogo, 27 UFs, clique real na casa Início, nenhuma rolagem horizontal, erro de navegador ou chamada à API. Testes de contorno verificam cobertura das UFs, anéis fechados, limites e hash da fonte. Refinamento dos demais cantos/paisagens e integração da revelação continuam separados desta entrega.

## 8. Aproximação do HUD à referência

A pedido do usuário, Codex pode alterar a apresentação dos painéis, retratos, dados estáticos e centro do tabuleiro. Preservar ordenação por patrimônio, saldos, estados ativos, comandos, condições dos botões e fluxos de conexão. Retratos são ilustrações de interface obtidas da referência local, sem substituir os GLBs. Nenhum botão decorativo sem função (chat/loja/configurações futuras) será introduzido. A moeda continua `$` e não se adotam valores ou regras escritos na referência. Dados visuais mostram somente `snapshot.lastDice`; animação ligada a eventos permanece na integração E25. No celular, priorizar legibilidade e acesso às ações, adaptando a composição da referência horizontal.

Entrega: `hud/AvatarPortrait.tsx` usa janelas SVG sobre a referência existente (um arquivo WebP compartilhado, aproximadamente 472 KiB, sem duplicar a imagem). Coroa e posição continuam refletindo o ranking real. Acabamento em `index.css`; o resultado estático dos dados usa `hud/DiceFaces.tsx`, com os valores recebidos e descrição acessível. A barra não acrescenta ações fora da fase atual. No desktop, controles no alto à direita e jogadores à esquerda; no celular, faixa compacta de quatro jogadores e barra inferior adaptável.

O centro usa agora o logotipo da própria `visual-alvo.webp`, mantendo o anterior como reserva enquanto carrega. `boardArt.ts` registra a janela/máscara no espaço 1671×941 da referência. Piso azul mais claro, mapa saturado e estádio com estrutura, arquibancada e marcações do campo. Enquadramento inicial mais frontal (azimute 0,08 e raio de enquadramento 0,55×lado externo), preservando giros Q/E de 90°, foco, limites e fórmulas de enquadramento. Nenhum GLB, regra ou movimento de personagem foi alterado.

Conferência: `node scripts/assets/hud-visual-qa.mjs`, prévia em `scripts/assets/hud-preview/`, capturas/relatório em `assets/3d/reviews/hud-reference/`. Usa a tela real `GameScreen` com WebSocket interceptado somente no navegador de teste; nenhuma partida real ou API. Verifica 1671×941/390×844, comando `ROLL_DICE` e versão intactos, dados oficiais estáticos, dados nulos ocultos, ausência de Rolar no turno alheio, rotação por teclado, abertura/fechamento da carta do estado e limites do HUD. Os personagens e o cenário continuam sendo os modelos 3D atuais; os retratos de interface não regeneram esses modelos.

## 9. Nova arte principal do tabuleiro — imagem fornecida pelo usuário

**Atualização mais recente:** o usuário forneceu duas fontes separadas, `assets/board/rio-em-cores.png` para o centro e `assets/board/estados-brasileiros-atlas.png` para as casas. Essas fontes substituem o recorte da imagem composta como destino da arte. O usuário encaminhará ao Claude a adaptação do percurso/regras. Codex prepara fonte, janelas e proporções; não decide regras de Taxa/Aeroporto nem remove UFs por suposição. A prancha contém as 27 UFs do catálogo, incluindo TO e DF; portanto não há UF a excluir só com base nessa imagem. Quantidade de artes únicas não define quantidade/ordem de casas ou repetições de Eventos.

**Entrega para essa adaptação:** `assets/board/board-art-manifest.json` registra as duas fontes (1536×1024), hashes SHA-256, 27 janelas de UFs, seis janelas especiais e logotipo. Centro completo em proporção 3:2; não esticar para um quadrado. Cada janela de casa traz sua própria proporção. `START`, `EVENT`, `AIRPORT`, `TAX`, `REST`, `OLYMPICS` são IDs de arte, sem associação automática a tipos/efeitos do motor. A ordem da prancha é um catálogo de artes, não uma sequência do percurso.

`apps/web/src/board/art/BoardArtwork.tsx` exporta `BoardArtworkSprite`, `BoardCenterArtwork`, `boardArtManifest`, `boardAtlasUrl` e `boardCenterUrl`. Os recortes SVG preservam os pixels e proporções, sem redesenhar nomes ou reaproveitar paisagens diferentes (TO tem arte própria). Ainda não substituem automaticamente a geometria/fluxo atual: a engenharia adapta o suporte/layout e integra essas fontes. A implementação da imagem composta descrita abaixo registra o estado anterior de compatibilidade; suas adaptações não são exigências para o novo percurso solicitado pelo usuário.

Regeneração: `node scripts/assets/build-board-art-manifest.mjs`. Prévia: `scripts/assets/board-atlas-preview/`; conferência `node scripts/assets/board-atlas-qa.mjs`. Capturas/relatório em `assets/3d/reviews/board-atlas/`: 1536 e 390 px, 27 UFs e seis especiais, proporções mantidas, sem erro de navegador ou API. Originais copiados foram comparados por hash com os arquivos recebidos e são idênticos. Build aprovado; zero créditos. Nenhuma nova regra ou exclusão de estado foi implementada pela arte.

A partir desta solicitação, `assets/board/tabuleiro-brasil-alvo.png` (1536×1024) é a fonte visual do tabuleiro: a própria imagem enviada, preservada sem recriação por IA. Centro ilustrado do Rio/logotipo, madeira e casas douradas substituem o centro em grade, mapa vetorial e cenário externo anterior. HUD e personagens permanecem independentes. A aplicação usa janelas quadrilaterais corrigidas em perspectiva; o PNG original permanece intacto.

O percurso continua com as 36 casas do catálogo e as mesmas âncoras/alturas. A arte tem composição diferente: não criar Taxa, não renomear Viagem Nacional para Aeroporto, não remover Visita ou eventos e não reordenar UFs. Tocantins não aparece na imagem; recebe paisagem fluvial do próprio centro, com nome/sigla oficiais. Assim, a imagem original é exata; o tabuleiro jogável reaproveita essa arte com as adaptações necessárias ao catálogo. Não apresentar uma imagem estática como se suas casas divergentes fossem as casas interativas reais.

Entrega aplicada em `BoardScene`, `BoardCenter`, `Tile`, `tileTexture` e `WoodenTableScene`. A imagem original tem 3.479.266 bytes; hash e procedência estão em `assets/board/tabuleiro-brasil-alvo.json`. `illustratedBoard.ts` contém as janelas, homografia e carregamento compartilhado. O centro usa textura 1536², sem outra imagem gerada, sem grade, sem mapa vetorial e sem miniaturas sobre a paisagem já ilustrada. A mesa usa somente uma faixa de madeira da imagem, com repetição espelhada para evitar emendas; não usa outra imagem de tabuleiro como fundo falso.

As paisagens das casas vêm da fonte; nomes e siglas são redesenhados do catálogo para preservar proporções e grafia, com moldura dourada e faixa discreta do grupo oficial. As casas laterais ficam legíveis na vista inicial. Aluguel/cor do dono, seleção, foco e eventos de ponteiro continuam os mesmos. Texturas liberadas ao desmontar. O antigo painel central de rodada/modo foi substituído por uma indicação na barra de ações; não há perda desses dados nem de comandos. HUD e GLBs dos jogadores não foram substituídos.

Conferência da nova arte: `$env:IMPERIO_ART_REVIEW='board-illustrated'; node scripts/assets/hud-visual-qa.mjs` em PowerShell. Capturas e relatório em `assets/3d/reviews/board-illustrated/`, usando tela real e WebSocket simulado em 1671×941 e 390×844. Testes verificam hash/dimensões do original, 27 UFs, seis tipos especiais, 36 casas e projeção das janelas. Total de 63 testes e build aprovados. Nenhum crédito pago ou alteração de backend, catálogo, regras ou movimentos. A composição original completa (inclusive seus objetos de mesa e casas divergentes) é preservada no PNG de origem, não reproduzida integralmente pela geometria jogável.

## 10. Tabuleiro com câmera estática — percurso, âncoras e interação (aprovado em 2026-11-01)

Substitui, para o percurso, a restrição da seção 9 ("não criar Taxa, não renomear Viagem Nacional para Aeroporto, não remover Visita, não reordenar UFs"): o usuário aprovou a nova ordem. A arte continua com o Codex; a engenharia já entregou catálogo, regras, âncoras e interação.

**Percurso (36 casas, sentido horário; fonte `packages/game-data/data/board.json`):**

| Índice | Casas | ID de arte (manifesto) |
|---|---|---|
| 0 | Início | `START` |
| 1–8 | AM, RR, Eventos, AP, PA, RO, TO, Eventos | UFs, `EVENT` |
| 9 | Olimpíadas | `OLYMPICS` |
| 10–17 | AC, MT, MS, GO, Eventos, DF, MG, ES | UFs, `EVENT` |
| 18 | Descanso | `REST` |
| 19–26 | RJ, PR, SP, Taxa, RS, SC, PE, PB | UFs, `TAX` |
| 27 | Aeroporto | `AIRPORT` |
| 28–35 | BA, SE, AL, Eventos, RN, CE, PI, MA | UFs, `EVENT` |

Tipos do motor → ID de arte: `START`→`START`, `EVENT`→`EVENT`, `OLYMPICS`→`OLYMPICS`, `REST`→`REST`, `TAX`→`TAX`, `NATIONAL_TRAVEL` (nome "Aeroporto")→`AIRPORT`. O tipo `VISIT` deixou de existir. Regras: Aeroporto = Viagem Nacional (D3); Taxa paga `rules.tax.amount` (100) ao banco, sem saldo vira dívida (D23).

Adaptação mínima feita pela engenharia em arquivos do Codex, só para compilar: `tileTexture.ts` (estilo reserva de `TAX` no lugar de `VISIT`), `boardArt.ts` (`SPECIAL_CROPS` parcial, sem `VISIT`) e `illustratedBoard.node.test.ts` (a Taxa usa o desenho reserva até a integração do atlas). `SPECIAL_ART.VISIT` em `illustratedBoard.ts` ficou sem uso. A troca para `estados-brasileiros-atlas.png` / `BoardArtwork.tsx` é do Codex.

**Âncoras — `tileAnchor(index)` em `apps/web/src/board/layout.ts` continua o acesso único:**

```ts
interface TileArea { x: number; z: number; width: number; depth: number } // sistema da casa
interface TileAnchor {
  index; x; z; surfaceY; rotationY; width; depth; isCorner; // como antes
  pawnArea: TileArea;            // onde até 4 personagens se distribuem
  buildingArea: TileArea | null; // faixa de casas/hotel; null onde não há construção (não-PROPERTY)
  selectedLift: number;          // quanto a casa sobe ao ser selecionada (0 se a arte não sobe)
}
anchorToWorld(anchor, lx, lz) // ponto local da casa → mundo, mesma rotação da casa
```

- Sistema da casa: origem no centro, x ao longo da largura, +z para fora do tabuleiro (−z para o centro), igual a `rotationY`.
- Valores atuais (provisórios, coerentes com a geometria de hoje): margem 0,01; em estados, `buildingArea` é a faixa de 0,5 do lado interno e `pawnArea` o restante; nas demais casas, `pawnArea` ocupa a casa inteira menos a margem.
- **Codex:** ao reconstruir a geometria estática, ajusta os números dentro de `layout.ts` (ou num módulo de geometria que `tileAnchor` leia), mantendo a interface; posiciona casas/hotel dentro de `buildingArea`; mantém `surfaceY` igual ao topo real da arte.
- **Engenharia:** personagens usam `pawnArea` (`pawnSpots`, `pawnCenter`), a seleção usa `selectedLift`, os saltos usam `surfaceY`.
- Testes de contrato (`layout.test.ts`, `pawnLayout.test.ts`): nas 36 casas as áreas ficam dentro da casa, construções não sobrepõem personagens, só estados têm `buildingArea`, 4 personagens cabem separados na `pawnArea`.

**Interação sem câmera móvel (feito):** saíram `ViewControls` (botões ⟲ ⌂ ⟳ e teclas Q/E/Esc) e o duplo clique de foco em `Tile`. Clicar numa casa continua abrindo o painel; o "×" do painel só limpa a seleção. `viewStore` ficou com `selectedTile`, `selectTile` e `clearSelection`; `focusedTile` e `quarterTurns` ficam fixos (`null` e `0`) só enquanto `CameraRig.tsx`/`cameraPose.ts` ainda os leem.

**Próximo passo do Codex (aguarda aprovação do usuário):** câmera estática sem ler `focusedTile`/`quarterTurns` (e sem arrastar/girar/zoom). Depois disso a engenharia remove os dois campos do `viewStore`. `scripts/assets/hud-visual-qa.mjs` ainda verifica a rotação por teclado e precisa ser atualizado pelo Codex.
