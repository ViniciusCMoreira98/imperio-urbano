# 10 — Recriação aprovada: plano e situação

## Texturização aprovada e concluída

Após o usuário aprovar a geometria, foi criada uma única tarefa refine, `01a19523-8666-73a6-b5b8-2e223bae5555`, vinculada ao preview `01a1951d-cac3-724c-b2a6-5cfdc969d18f`. A requisição está em `assets/3d/requests/steampunk-brasil-v01-refine.json`. Herda Meshy 7.1 sem override, usa base color 4K, `enable_pbr=false`, GLB, sem 8K ou custo adicional de resolução.

Tarefa `SUCCEEDED`, **10 créditos** confirmados. Total da recriação: **30 créditos** (20 geometria + 10 textura). Saldo: **1.000**. Os 5 créditos opcionais de otimização não foram usados; rigging continua não autorizado nesta etapa. Registro separado antes da chamada impede repetir o refine automaticamente.

Original texturizado preservado em `assets/3d/source/steampunk-brasil-v01-textured-e4b1de4f65a9.glb`: 9.833.664 bytes, 12.194 triângulos, 1 material, 1 textura 4.096×4.096, sem skins ou clips. SHA-256 `e4b1de4f65a93fe6e88e748aaa6ade30fca21383e74023b2849480fa7f67931b`.

O script local `scripts/assets/repack-textured-glb.py` reexportou a malha sem modificador/decimação, reencodificando a textura JPEG em qualidade 90 sem reduzir resolução. A imagem já era JPEG; a nova codificação usa compressão com perda, portanto não é cópia pixel a pixel. Resultado: `assets/3d/optimized/characters/steampunk-brasil-v01-textured-web-v01.glb`, **2.026.948 bytes (1,93 MiB)**, mesmos 12.194 triângulos e textura 4K. SHA-256 `ba12572c5e010a46860e81b5f6380f222676774119e890c1ab42cf68d076e346`. Não houve serviço pago de otimização.

Khronos: original sem erros/avisos, uma informação de matriz identidade redundante; cópia web sem erros, avisos ou infos. Playwright/Chromium com Three.js r187 carregou a cópia em 1280×900 e 390×844, sem erros, com uma textura 4K confirmada. Prévia revisada visualmente: rosto, cabelo loiro, olhos azuis, casaco e capacete vinho, óculos turquesa e botas marrons legíveis. Evidências em `assets/3d/reviews/steampunk-brasil-v01-textured`. Sete testes do pipeline aprovados.

Para visualizar: `$env:ASSET_PREVIEW_MODEL='steampunk-brasil-v01-textured'; node scripts/assets/preview-server.mjs`, abrir `http://127.0.0.1:4174`. A prévia normaliza apenas visualmente a altura; o GLB original permanece preservado.

Ainda **não aprovado para a partida**: 194 triângulos acima do limite inicial, textura 4K acima da política inicial de 1K, ausência de rig/animações, licença e benchmark móvel real pendentes. O arquivo cabe no limite de 3 MiB, mas isso não mede memória GPU (textura 4K continua consumindo a memória correspondente). Os limites oficiais não foram alterados. Não foi aplicado ao jogo; regras, backend, multiplayer, movimentação e avatares existentes continuam preservados. Nenhum commit desta etapa foi solicitado ou executado.

## Atualização: credenciais restauradas e geração iniciada

O usuário solicitou a restauração do arquivo desaparecido. Uma cópia integral de `variable.env` foi recuperada de um objeto local não alcançável do Git, sem exibir seu conteúdo. A integridade foi conferida pelo identificador Git do arquivo. Também foi restaurada a exclusão `variable.env` no `.gitignore` da worktree original; ela não estava mais presente. O arquivo continua fora do índice. Nenhum commit de credenciais foi criado. Não foi possível determinar a causa da exclusão original.

Uma conexão nova ao servidor Meshy validou gratuitamente a chave restaurada: saldo de 1.030 créditos antes da geração. Em seguida foi retomada a geração aprovada, sem rigging, com a tarefa `01a1951d-cac3-724c-b2a6-5cfdc969d18f`, status inicial `PENDING`, custo previsto de 20 créditos. O registro de tentativa impede reenvio automático. Texturas e otimização ainda não foram solicitadas; teto aprovado permanece 35 créditos.

As seções abaixo documentam o impedimento anterior, já resolvido.

### Resultado da geração

Tarefa concluída com `SUCCEEDED`, consumo confirmado de **20 créditos**, saldo de **1.010** (antes: 1.030). Nenhum refine, remesh separado ou rig foi solicitado. A solicitação `should_remesh=true` incluída na geração não acrescentou cobrança além dos 20 informados. Permanecem 15 créditos no teto autorizado, sendo 10 previstos para textura e 5 opcionais para otimização.

GLB original: `assets/3d/source/steampunk-brasil-v01-cd6199d107d0.glb`, 682.920 bytes, 12.194 triângulos, sem texturas, materiais declarados, skins ou clips. SHA-256 `cd6199d107d0fccef1b744713a583db177eec410680db254964f234f98546100`. Cópia de avaliação e evidências em `assets/3d/reviews/steampunk-brasil-v01`.

Khronos: zero erros/avisos, uma informação sobre UV não utilizado enquanto não há material. Triagem do orçamento: 194 triângulos acima de 12.000 (1,62%); não foi alterado o limite oficial. A geometria é uma chibi de chapéu com óculos, casaco, botas e braços abertos. A geração não reproduziu os cachos e a saia descritos literalmente; a semelhança artística exige aprovação do usuário. Não foi alegado rig adequado apenas por estar em pose aberta.

Chromium e Three.js r187 carregaram o arquivo em 1280×900 e 390×844, sem erros de página/console. A prévia normaliza visualmente a altura para 1 e centraliza os pés; o GLB original é preservado sem essa alteração. O clone da cena carregou. Não há benchmark de hardware móvel. Os sete testes do pipeline passaram; o teste de catálogo foi ajustado para aceitar novos registros sem assumir uma quantidade fixa.

Prévia: `$env:ASSET_PREVIEW_MODEL='steampunk-brasil-v01'; node scripts/assets/preview-server.mjs`. Geração ainda sem aprovação para uso na partida. A descrição da ferramenta `meshy_text_to_3d` exige que a prévia seja aprovada antes de `meshy_text_to_3d_refine`; portanto a geometria será apresentada ao usuário antes de gastar os 10 créditos de texturização, dentro do teto já aprovado.

Em 2026-10-31 o usuário confirmou o plano de recriação com Meshy 7.1, GLB, teto inicial de **35 créditos**, deixando rigging para depois. Distribuição: preview de geometria 20, texturas 10 e até 5 de otimização se necessária. Não inclui Ultra geometry, texturas 8K, nova geração de imagem, rigging ou animações. Não repetir gerações automaticamente.

Pedido preparado em `assets/3d/requests/steampunk-brasil-v01-preview.json`: personagem adulta chibi original, steampunk, roupa simplificada e formas largas, braços em T, alvo de 12 mil triângulos, formato GLB. O alvo é solicitado ao serviço; geometria real ainda precisa ser medida. A referência artística principal continua `docs/referencias/visual-alvo.webp`.

## Preparação da conexão

Consultada a [documentação oficial OpenAI sobre MCP](https://learn.chatgpt.com/docs/extend/mcp). Em `C:/Users/Plust/.codex/config.toml`, a allowlist do servidor Meshy foi ampliada apenas com `meshy_text_to_3d`, `meshy_text_to_3d_refine`, `meshy_remesh` e `meshy_download_model`. A lista anterior de consultas foi mantida. Rigging/animações continuam desabilitados. Backup datado preservado ao lado da configuração; chave não incluída no script nem no projeto.

Essas novas ferramentas não ficaram disponíveis automaticamente no inventário desta sessão. Foi preparado cliente MCP local separado, usando o servidor instalado 0.6.7 e verificando a allowlist atual antes de executar. O script `scripts/assets/meshy-approved-preview.mjs` aceita apenas `create-preview`, `status` e `balance`, registra a tentativa antes de enviar a geração e não reenvia se o registro já existe. Chave é carregada pelo Node no processo filho, sem ser exibida.

## Impedimento encontrado

A conexão nova não inicializou porque **o arquivo configurado de credenciais não existe mais**: `C:/Users/Plust/Projetos/imperio-urbano/variable.env`. Também não há `MESHY_API_KEY` no ambiente desta execução. Nenhuma tentativa de recuperar chave de outros processos foi feita.

Não houve chamada paga, registro de tarefa ou task ID retornado. `meshy_list_tasks` com tipo `text-to-3d`, após a falha, retornou lista vazia. A conexão Meshy já disponível no chat ainda responde a consultas, mas isso não comprova que o arquivo local continue presente.

Solicitado ao usuário somente restaurar o arquivo local ou informar seu novo caminho, **sem enviar a chave no chat**. O script verifica existência antes de inicializar, e aceita `MESHY_ENV_FILE` como caminho alternativo. Nenhuma credencial será versionada.

## Continuação

Depois de restaurado o acesso: conferir saldo, enviar uma única geração aprovada e preservar task ID. Em qualquer timeout/erro de rede após envio, consultar as tarefas antes de repetir. Aguardar a mesma tarefa, baixar a geometria e apresentar a aparência ao usuário antes de executar o refine. A descrição da ferramenta Meshy exige aprovação da prévia antes da texturização; isso não amplia o teto financeiro de 35 créditos. Até lá, saldo gasto nesta etapa: **zero**.

O jogo, backend, multiplayer e movimentação permanecem preservados. Nenhum commit ou merge desta recriação foi feito.
