# 12 — Primeiro personagem Meshy no manifesto

Atualização posterior: o manifesto agora aponta para a revisão de braços baixos descrita em [13 — pose de repouso](13-luana-pose-repouso.md). O restante deste documento registra a integração inicial da versão em T.

Integração local feita na branch `codex/meshy-phase-b`, após sincronização em `6c5e3e1` e autorização para a próxima tarefa. Respeitado o [contrato 11](11-contratos-claude-codex.md): conteúdo do manifesto e assets alterados; formato, validação, carregador, base, backend e lógica de movimento preservados. Nenhuma chamada paga ou geração nova. Custo adicional: **zero créditos**; recriação anterior permanece em 30.

## Conteúdo integrado

`avatar-3` (Luana) passa a usar `steampunk-brasil-v01-textured`, com arquivo público `/models/characters/steampunk-brasil-v01.glb`. Altura 0,8, frente +Z sem correção adicional, offset zero e `idleClip: null`. Os demais avatares permanecem Kenney. A antiga Luana (`kenney-female-b`) foi mantida como entrada com `avatarId: null`; o fallback global continua `kenney-male-a`.

O manifesto marca o Meshy como **candidate**, para avaliação local, e registra que os termos de distribuição ainda precisam ser confirmados. O carregador atual aceita esse estado; ele não representa liberação comercial nem aprovação final para distribuição. Nenhum filtro de status foi alterado nesta tarefa.

## Ajuste do GLB

Sobre o original texturizado preservado, foi aplicada redução leve de 12.194 para **11.900 triângulos** (2,41%), sem esqueleto/animação e sem redução de resolução. A textura mantém **4.096×4.096**, reencodificada em JPEG qualidade 90 como na prévia anterior. Sem alteração deliberada de pose ou geometria de pedestal: a base é do componente existente do jogo.

Derivado: `assets/3d/optimized/characters/steampunk-brasil-v01-game-v01.glb`. Cópia idêntica em `apps/web/public/models/characters/steampunk-brasil-v01.glb`.

- Tamanho: **2.019.584 bytes (1,93 MiB)**.
- SHA-256: `6464d04215354c6c4a6d54dc6dd7e2e25e05c44c83ae9ac121f8cfcc4c0d69e7`.
- Um material e uma textura; zero skins/clips.
- Dentro dos limites de 12 mil triângulos e 3 MiB do contrato 11.
- Khronos: zero erros, avisos, infos ou hints.

O script `repack-textured-glb.py` ganhou um quarto argumento opcional para essa redução leve. Mantém o comportamento anterior quando omitido e recusa modelos/limites fora do intervalo estreito previsto. A derivação não é um otimizador genérico.

## Conferência real do carregador

`scripts/assets/manifest-integration-qa.mjs` sobe uma cena local isolada, compilando **os componentes reais** `AvatarPreview` e `AvatarFigure` com o manifesto atual. O arquivo de conferência não altera a entrada do jogo, não usa sessão/API e não simula uma partida multiplayer.

Validações no Chromium, em 1280×900 e 390×1000:

- Quatro instâncias independentes, com as bases existentes em quatro cores.
- Contagem de 11.900 triângulos em cada cópia do modelo.
- Pés/base apoiados: mínimo Y=0,1 no topo da superfície de teste; altura total 0,86, incluindo base de 0,06.
- Troca Meshy → Kenney → Meshy na seleção.
- Pedido de `walk` sem clip tratado sem erro; **não** significa que foi criada uma caminhada.
- GLB Meshy respondendo 404 em contexto separado: aviso esperado e modelo reserva carregado.
- Sem erros inesperados na carga normal; capturas inspecionadas visualmente.

Evidências em [`assets/3d/reviews/manifest-integration`](../assets/3d/reviews/manifest-integration): `integration.json`, `optimization.json`, `screening.json`, `khronos.json`, `manifest-1280.png` e `manifest-390.png`.

Para repetir, com dependências instaladas:

```powershell
node scripts/assets/manifest-integration-qa.mjs
```

O teste inicia e encerra navegador e servidor locais na porta 4175. Não executa nenhum serviço Meshy. A instalação nesta worktree foi completada com `npm ci --ignore-scripts --no-audit --no-fund`, sem alterar package.json ou package-lock.json, pois faltava o plugin React do build.

Verificações finais: build de produção, 32 testes do projeto, checagem de tipos e 7 testes do pipeline aprovados. O build apenas avisa sobre o tamanho do bundle JS existente; essa tarefa não mudou o código de empacotamento.

## Limites e próxima etapa

A personagem ainda está estática, em pose com braços abertos. Rigging não é requisito para carregar este candidato pelo contrato atual; saltos procedurais permanecem responsabilidade da engenharia. Não foi alterado nenhum deslocamento entre casas.

A textura 4K preserva a nitidez, mas continua acima do alvo inicial de 1K em `budgets.json`. O limite global não foi alterado: política de memória GPU e medição em aparelho móvel real continuam pendentes, assim como licença de distribuição. O teste com quatro cópias compartilha o mesmo recurso e não mede um conjunto de quatro personagens distintos. Nenhum FPS ou desempenho de celular foi declarado.

Mudanças ficam nesta worktree, sem commit ou merge automático. Os originais e a credencial local foram preservados.
