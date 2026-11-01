# 07 — Meshy: catálogo e pipeline de assets (Fase B)

## Estado e escopo

Fase B preparada em 2026-10-31. Fase C aguarda aprovação explícita. Registro da Fase A consultado em `C:/Users/Plust/.codex/integrations/meshy/SETUP.md` (o caminho informado sem a barra antes de `.codex` não existia). `RTK.md` não foi localizado no projeto nem nos diretórios ancestrais; nenhuma instrução dele foi presumida.

Branch `codex/meshy-phase-b`, worktree `.worktrees/meshy-phase-b`, criada a partir de `dfc081f`. Alterações locais do Claude em `.gitignore`, `BoardScene.tsx` e `cameraPose.ts` ficaram na worktree original. Não há merge, commit ou modificação do runtime nesta entrega.

O pipeline usa apenas Node nativo (22+), sem dependência nova, sem chave de API e sem chamadas de geração, processamento ou otimização paga. A configuração MCP da Fase A continua intacta; a ferramenta MCP de download segue desabilitada. Esta fase consultou somente modelos concluídos e não baixou modelos Meshy.

## Organização e rastreabilidade

| Caminho | Uso |
|---|---|
| `assets/3d/catalog.json` | Inventário versionado por ID estável, task ID, origem, formato, licença e estado de revisão |
| `assets/3d/budgets.json` | Limites iniciais para triagem |
| `assets/3d/source/` | GLB original imutável, ignorado pelo Git; nome com ID e hash |
| `assets/3d/staging/` | Trabalho local no Blender, texturas e exportações provisórias, ignorados |
| `assets/3d/reports/` | Triagem JSON local com SHA-256 e pendências, ignorada |
| `assets/3d/optimized/{characters,buildings,scenery}/` | Entregáveis revisados, ainda vazio |
| `apps/web/public/models/` | Destino futuro de publicação; assets Kenney atuais preservados |

Catálogo consultado nos tipos text-to-3d, image-to-3d e multi-image-to-3d: quatro modelos concluídos. Outros tipos (rigging, Creative Lab etc.) não foram inventariados. Não armazenar URLs assinadas, chave, conteúdo de `variable.env` ou credenciais nos metadados. Campos nulos significam desconhecido, não ausência de rig/animacões.

Estados editoriais: `candidate` → `downloaded` → `validated` → `optimized` → `approved` → `published`, ou `rejected`. A transição é manual e exige evidência. Importar não atualiza nem aprova o catálogo automaticamente. Registrar hash do original, caminho do relatório e do otimizado ao revisar. Usar nomes `<id>-vNN.glb` no otimizado e conservar a origem.

## Operação local

Executar na raiz desta worktree:

```powershell
node scripts/assets/pipeline.mjs catalog
node --test scripts/assets/glb.test.mjs
node scripts/assets/pipeline.mjs validate steampunk-girl-no-base-v2 C:/caminho/modelo.glb
node scripts/assets/pipeline.mjs import steampunk-girl-no-base-v2 C:/caminho/modelo.glb
```

`validate` apenas lê o arquivo e gera relatório. `import` também guarda uma cópia em `source`. Nunca sobrescrevem originais ou publicam no frontend. O código de saída é 1 para triagem reprovada ou erro. Um original acima do orçamento é preservado em quarentena com relatório; GLB estruturalmente inválido é recusado antes de salvar. Se já existir o mesmo original, usar `validate` em vez de importar novamente.

Download preparado para depois da aprovação da Fase C: consultar status da tarefa existente para obter `model_urls.glb`, ou baixar pelo painel Meshy e usar `import`. Na rota direta, fornecer a URL temporária pela variável de ambiente `MESHY_ASSET_URL` e executar `node scripts/assets/pipeline.mjs download <id>`. Remover a variável após o uso. Não fornecer a chave Meshy nessa variável, nem passar URL assinada na linha de comando ou commit. O comando faz somente GET ao CDN `https://assets.meshy.ai`, recusa redirecionamentos e outros hosts, limita 100 MiB e espera até 60 segundos. URLs expiradas devem ser renovadas consultando a mesma tarefa; nunca recriar a tarefa. Se o CDN mudar, revisar a allowlist explicitamente.

O download não comprova que a URL corresponde ao task ID escolhido: conferir a origem no status Meshy e registrar o hash. Nenhum download de produção foi exercitado na Fase B. O catálogo é independente do provedor; importação local permite outras fontes, desde que tenham proveniência e licença documentadas.

## Validação em duas etapas

O script é uma **triagem parcial**, não substitui o Khronos glTF Validator. Verifica cabeçalho, chunks, BIN, limites de bufferViews, ausência de URIs externas, presença/contagem básica de geometria e orçamento. Relata materiais, texturas, skins e nomes dos clips. Não resolve todas as referências glTF, offsets de accessors, índices, hierarquia, bounds transformados, dimensões de imagem ou conformidade completa. `approvedForRuntime` permanece falso mesmo quando a triagem passa. Triângulos são contados por geometria, não por instância/draw call da cena.

Antes de aprovar: executar Khronos glTF Validator local com zero erros, revisar avisos e salvar evidência; abrir em Blender e em uma prévia isolada com o mesmo Three.js do projeto. Verificar geometria quebrada, normais, faces invertidas, materiais PBR, transparência, texturas e memória GPU, bounds mundiais, escala, orientação, pivô, licença e semelhança com a referência. Testar clone de esqueleto e os clips necessários sem alterar a movimentação atual. Não presumir rig funcional pela existência de `skins`.

## Padrões de otimização

Referência principal: `docs/referencias/visual-alvo.webp`, vista nesta fase. Personagens chibi/anime originais, silhueta legível na câmera isométrica, cores vivas, materiais cartoon e iluminação suave de entardecer; miniaturas brasileiras estilizadas. Base com anel na cor do jogador fica separada do personagem. A temática steampunk do candidato exige revisão artística; o nome não comprova aderência visual.

| Classe | Triângulos máximos por geometria | GLB máximo | Materiais | Texturas | Resolução máxima |
|---|---:|---:|---:|---:|---:|
| Personagem | 12.000 | 3 MiB | 2 | 4 | 1.024 px |
| Construção/miniatura | 1.999 | 1 MiB | 1 | 2 | 1.024 px |
| Cenário | 5.000 | 2 MiB | 2 | 4 | 1.024 px |

Limites iniciais, não resultados medidos. Miniaturas respeitam a guideline de menos de 2 mil triângulos. Preferir atlas compartilhado e reduzir materiais/partes invisíveis. Aplicar limpeza e redução local no Blender sobre cópia, revisar UVs e bake; preservar o esqueleto, pesos e clips. Não aplicar decimação destrutiva ao original. Sem serviços pagos de remesh, rig ou retexturização.

Exportar GLB 2.0 autocontido, Y para cima, frente +Z, pés no plano Y=0, pivô central no chão, escala aplicada e sem câmera/luzes auxiliares. Personagem de referência com altura normalizada de 1 m, sem base; o componente atual adapta para altura 0,8 e base 0,06. Revisar a adaptação apenas em futura fase autorizada. Clips previstos pela guideline: `idle`, `walk`, `celebrate`, `defeat`; o runtime atual consome apenas idle/walk.

Começar com PNG/JPEG embutidos e sem compressão que exija decoder adicional. KTX2, Meshopt e Draco ficam para decisão específica após medição e suporte do loader; não habilitá-los automaticamente. Congelar transforms e remover objetos ocultos sem destruir skinning. Repetições de construções podem usar instâncias em futura integração.

Meta de aceitação futura: comparar a mesma partida/câmera antes e depois, com quatro peões e cena completa, em aparelho móvel identificado. Registrar frame time p95, draw calls, triângulos renderizados, memória de texturas e tempo de carga fria/quente. Meta inicial: ≥30 FPS e regressão de p95 ≤10%; medições e dispositivo ainda pendentes. Ajustar orçamento com evidência e aprovação, nunca declarar desempenho apenas pelo tamanho do arquivo.

## Proposta da Fase C — aguardando aprovação

Avaliar primeiro `steampunk-girl-no-base-v2`, tarefa `af7d43b2-33d8-5397-b940-6e727f3f3c10` (GLB existente, image-to-3d). É a versão mais recente sem base segundo o nome e permite avaliar a separação da base do jogador. Não foi baixada, nem aprovada artisticamente ou para uso comercial.

Após aprovação: obter o GLB existente gratuitamente, importar, validar, revisar licença e aparência, medir orçamento e avaliar rig/clips. Preparar uma prévia isolada e relatar a necessidade de otimização local. Não substituir avatares, alterar movimentação ou iniciar operações pagas. Se faltar rig/animação, apresentar a limitação e uma proposta separada. Nenhuma geração ou processamento pago está autorizado.

## Verificação da entrega

`node --test scripts/assets/glb.test.mjs`: 7 testes aprovados, cobrindo GLB mínimo, assinatura/truncamento/chunks, recursos externos, bufferViews, orçamento/extensões, allowlist de download, catálogo e ID inválido no CLI. `git diff --check`: sem erros. O GLB Kenney existente foi recusado corretamente por usar textura externa; não foi convertido nem modificado. A inspeção deste arquivo não comprova compatibilidade dos modelos Meshy. O download remoto, a otimização, a validação Khronos e a prévia no navegador ficam pendentes para o primeiro modelo na Fase C.

A exclusão local `/.worktrees/` foi adicionada em `.git/info/exclude` da área original, e a entrada auxiliar da worktree foi retirada do índice sem apagar arquivos. Isso evita incorporar a worktree como submódulo; as três alterações existentes do Claude permanecem preservadas. Ao reunir esta entrega com `develop`, conservar também a exclusão de `variable.env` já existente na alteração local do Claude.
