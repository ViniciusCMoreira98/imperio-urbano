# 13 — Pose de repouso da Luana

Em 2026-11-01, após autorização para baixar os braços, a Luana Meshy recebeu uma pose estática de repouso. Trabalho na worktree `codex/meshy-phase-b`, sem merge/commit automático. Custo adicional: **zero créditos**. Nenhuma operação Meshy foi chamada.

## Derivação e preservação

Fonte preservada: `assets/3d/optimized/characters/steampunk-brasil-v01-game-v01.glb`, revisão em T com 11.900 triângulos. O script específico `scripts/assets/relax-static-arms.py` cria dois ossos temporários no Blender para baixar os braços em 60 graus, com pesos suavizados na região dos ombros. Aplica a deformação à cópia e remove ossos, pesos e modificador antes de exportar. Não cria nem exporta rig de animação.

Foram movidos 2.339 dos 18.890 vértices importados. Uma verificação numérica confirmou que os 16.547 vértices das regiões protegidas (cabeça acima do limite definido, pernas e centro do tronco) não mudaram. A máscara é específica desta personagem e não deve ser aplicada genericamente a outros GLBs.

Nova revisão: `assets/3d/optimized/characters/steampunk-brasil-v01-rest-v01.glb`. Cópia pública idêntica: `apps/web/public/models/characters/steampunk-brasil-v01-rest-v01.glb`.

- 11.900 triângulos, um material e uma textura.
- **2.020.832 bytes (~1,93 MiB)**.
- Textura 4.096×4.096, JPEG embutido **idêntico byte a byte** ao da revisão anterior; sem reencodificação ou redução.
- Nenhuma skin ou animação exportada.
- SHA-256 GLB: `21636805b6a0f2d9ee2c788343aa5db362f58e13fccfd851f11185b361ca40bd`.
- Khronos: zero erros, avisos, infos e hints.

O manifesto muda apenas o caminho do arquivo de `avatar-3`. ID, altura 0,8, orientação, offset, base, fallback e `idleClip: null` ficam preservados. O modelo ainda é candidato local; pendências de licença e política de memória da textura 4K/benchmark móvel não foram declaradas resolvidas.

## Conferência visual e funcional

Com os componentes reais `AvatarPreview` e `AvatarFigure`, em cena local isolada:

- Quatro cópias simultâneas, sobre bases coloridas independentes, sem erros inesperados.
- Braços baixos, mãos ao lado do casaco; cabeça, roupa, botas e leitura do rosto preservadas na inspeção visual.
- Largura total de cada figura, incluindo base, **0,5**; o corpo não ultrapassa a largura da base nesta pose.
- Pés/base continuam apoiados na superfície de teste em Y=0,1; altura total 0,86.
- Troca Meshy → Kenney → Meshy e pedido de `walk` inexistente tratados sem erro.
- GLB ausente artificialmente: reserva Kenney carregado, com os avisos esperados.
- Capturas em 1280×900 e 390×1000 inspecionadas. Isso não é medição de hardware móvel ou teste de uma partida multiplayer completa.

Evidências em [`assets/3d/reviews/rest-pose`](../assets/3d/reviews/rest-pose): relatórios `pose.json`, `screening.json`, `khronos.json`, `integration.json` e capturas `manifest-1280.png`/`manifest-390.png`.

Para repetir a conferência:

```powershell
$env:ASSET_QA_REVIEW='rest-pose'
node scripts/assets/manifest-integration-qa.mjs
```

O teste passa a ler os caminhos do modelo e do reserva diretamente do manifesto, evitando duplicar o nome do arquivo ao testar a falha de carregamento. O harness registra também a largura para verificar a pose. Nenhum componente de produção foi alterado.

Verificações: 32 testes do projeto, 7 do pipeline, checagem de tipos, build de produção e validação visual do carregador. Regras, backend, multiplayer, saltos e movimentação entre casas preservados. O arquivo anterior em T permanece disponível para reversão ou futura preparação de um rig.
