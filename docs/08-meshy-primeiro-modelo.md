# 08 — Fase C: avaliação do primeiro modelo Meshy

Avaliação executada em 2026-10-31, após autorização do usuário, na worktree isolada `codex/meshy-phase-b`. Entrega de avaliação estática; **modelo não aprovado para uso na partida**. Sem alterações nos componentes do jogo, regras, multiplayer, backend ou movimentação. Nenhuma operação paga, geração, rigging ou animação Meshy foi executada. Sem novo commit ou merge nesta fase.

## Origem e integridade

- Modelo: `steampunk-girl-no-base-v2`.
- Tarefa existente: `af7d43b2-33d8-5397-b940-6e727f3f3c10`, `image-to-3d`, status `SUCCEEDED`.
- Download gratuito do `model_urls.glb` retornado pela consulta de status, pelo pipeline da Fase B.
- Original preservado em `assets/3d/source/steampunk-girl-no-base-v2-bc942e966436.glb`, ignorado pelo Git.
- SHA-256 original: `bc942e966436fcb9307e39aa7a9d08ca3280adbf9c23aaca36f83bc85a1f1e23`.
- Nenhuma chave lida ou copiada. URL temporária não versionada; arquivo de transferência já removido.

## Resultados medidos

| Verificação | Original Meshy | Cópia estática experimental |
|---|---:|---:|
| Tamanho | 55.743.356 bytes (53,16 MiB) | 173.520 bytes (169,45 KiB) |
| Triângulos | 2.322.916 | 10.000 |
| Primitivas / materiais | 1 / 1 | 1 / 1 |
| Texturas / imagens | 0 / 0 | 0 / 0 |
| Skins / animações | 0 / 0 | 0 / 0 |
| Khronos: erros / avisos | 0 / 0 | 0 / 0 |
| Orçamento técnico de personagem | Reprovado em tamanho e triângulos | Passou na triagem parcial |

O GLB recebido identifica seu gerador como `meshyd untextured companion`: é a geometria sem texturas, não uma personagem colorida pronta. Não se presume que outras saídas ou versões da tarefa sejam iguais.

A redução local usou Blender 5.2.3 LTS, modificador Decimate, triangulação e exportação GLB sem compressão/decoders adicionais. Original intocado. Cópia normalizada em aproximadamente 1 m de altura, Y para cima, pés próximos de Y=0. No Three.js, altura medida 1,000843 m e mínimo Y=0,000287 m; a frente aparece para +Z na prévia. A base roxa da prévia é geometria separada.

Cópia: `assets/3d/optimized/characters/steampunk-girl-no-base-v2-static-preview-v01.glb`. SHA-256: `3eedefa4545c33d4c8eeb2b6a599399099a321b7e18e7d4d594f7360f536c87f`. Apesar da pasta `optimized`, esta revisão é **experimental**, sem aprovação de publicação. O campo `optimizedPath` do catálogo continua nulo; a cópia está registrada em `evaluation.staticPreview`.

## Aparência e limitações

A silhueta chibi, o chapéu e os cachos lembram a personagem steampunk da parte inferior da referência `docs/referencias/visual-alvo.webp`. Porém, faltam cores e texturas, e a decimação automática perde detalhes importantes do rosto, saia e botas. A prévia permite avaliar proporções; não atinge o acabamento da referência. É necessária retopologia/revisão manual com preservação de detalhes e materiais antes de considerar um asset final.

Não há rig nem clips `idle`, `walk`, `celebrate` ou `defeat`. Clonar a cena com SkeletonUtils funcionou, mas isso não comprova rigging: o modelo é estático. Sua pose com braços junto ao corpo e a roupa detalhada exigem avaliação antes de preparar um esqueleto. Nenhuma animação foi simulada ou inserida no jogo.

O campo glTF `asset` não contém informação de copyright/licença. Não houve comprovação de titularidade das imagens de origem ou das condições da conta Meshy. Licença permanece `pending-verification`; não concluir liberação comercial com base no download.

## Evidências

Relatórios reproduzíveis e imagens em [`assets/3d/reviews/phase-c`](../assets/3d/reviews/phase-c):

- [Original no Blender](../assets/3d/reviews/phase-c/original.png) e [redução no mesmo enquadramento](../assets/3d/reviews/phase-c/reduced.png).
- [Prévia desktop](../assets/3d/reviews/phase-c/browser-1280.png) e [prévia em viewport móvel](../assets/3d/reviews/phase-c/browser-390.png).
- [Khronos original](../assets/3d/reviews/phase-c/khronos-source.json), [Khronos reduzido](../assets/3d/reviews/phase-c/khronos-reduced.json), [Blender](../assets/3d/reviews/phase-c/blender.json) e [navegador](../assets/3d/reviews/phase-c/browser.json).

Khronos glTF Validator `2.0.0-dev.3.10`: zero erros, avisos, infos ou hints nos dois arquivos. Chromium/Playwright carregou o reduzido em Three.js r187, a mesma revisão instalada no projeto; sem erros de página/console em 1280×900 e 390×844, clone bem-sucedido e bounds conferidos. Capturas revisadas visualmente; enquadramento móvel e iluminação ajustados. Os sete testes do pipeline continuam passando.

O teste de viewport móvel ocorreu em navegador desktop. Não mede GPU de celular, memória total da partida, FPS ou frame time p95 com quatro jogadores. Esses critérios continuam pendentes.

## Reproduzir a prévia

Na raiz da worktree, com as dependências existentes do projeto disponíveis:

```powershell
node scripts/assets/preview-server.mjs
```

Abrir `http://127.0.0.1:4174`. Servidor apenas local, desligar com Ctrl+C. Ele serve a prévia, o modelo experimental e módulos JS do Three; não serve credenciais ou a raiz do projeto. Não conecta ao backend ou Meshy. Para QA automatizada, parar esse servidor antes de rodar `node scripts/assets/preview-qa.mjs`; o teste inicia e encerra seu próprio servidor e navegador.

Validador instalado apenas no diretório temporário ignorado, sem alterar o package-lock do jogo. Para repor essa ferramenta:

```powershell
npm install --prefix assets/3d/staging/tooling gltf-validator@2.0.0-dev.3.10 --no-audit --no-fund
node scripts/assets/validate-khronos.mjs assets/3d/optimized/characters/steampunk-girl-no-base-v2-static-preview-v01.glb assets/3d/reports/khronos-recheck.json
node --test scripts/assets/glb.node-test.mjs
```

O script `prepare-static-preview.py` reproduz a derivação no Blender em background. Exige três argumentos após `--`: original, destino GLB **novo** e pasta de relatórios. É exclusivo para modelo estático; recusa armatures e não é um otimizador de personagens animados. Regenerar em outra revisão, sem sobrescrever esta cópia.

## Decisão e próximo passo

Fase C de avaliação concluída; integração à partida permanece suspensa por qualidade, licença e ausência de rig/animações. Recomendação: confirmar licença/origem e decidir se vale investir em retopologia, materiais e rig local deste candidato, ou avaliar outra versão existente com saída texturizada. Isso requer uma próxima etapa autorizada. Não executar geração, retexturização, rig ou animação paga sem autorização específica de custo/modelo. O personagem atual do jogo permanece preservado.
