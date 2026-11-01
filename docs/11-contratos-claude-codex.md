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

`avatars/PlayerBase.tsx`: `PlayerBase { color, active }` (disco + anel; pulsa na vez do jogador) e `ActiveMarker { color, height }` (seta sobre a cabeça de quem joga). Independentes do GLB; a base fica na superfície da casa e não sobe no salto. **Posição, cor e estado ativo: Claude. Aparência (material, brilho, forma): Codex**, sem mudar as props e mantendo `BASE_HEIGHT` como a altura onde o personagem pisa.
