# 11 — Contratos entre engenharia (Claude) e arte 3D (Codex)

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

**Arte (Codex):** máscara UV em PNG, sem alterar a textura original, e dados de referência por asset. **Engenharia (Claude):** campos opcionais do manifesto, carregamento da máscara e aplicação da cor recebida pelo avatar. A proposta não está implementada no carregador atual.

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
