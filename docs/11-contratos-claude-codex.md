# 11 — Contratos entre engenharia (Claude) e arte 3D (Codex)

## C8 — entrega local de tela inteira, HUD e nitidez (05/11/2026)

Implementação na `develop_arte_3d`, sobre `afbfbed`; commit e integração à `develop` solicitados e autorizados pelo usuário. Identificadores registrados no histórico Git. **A arte v3, os estados, o miolo, a moldura e o percurso de 34 casas foram preservados.** A referência de tela serve somente ao enquadramento e à posição dos controles.

- **Aluguéis após a compra:** as plaquinhas foram retiradas dos dois atlas. `paintRentalPlaque` e o texto são desenhados no overlay apenas para as propriedades recebidas em `rentLabels`; `GameBoard` exige `ownerId` preenchido. A Taxa conserva sua placa e saldo próprios. Fontes dos estados sem dono ficam livres de faixas vazias.
- **Mesa contínua:** `FixedBoardViewport expanded` usa a janela inteira. `tabletopViewport.ts` ajusta apenas a janela de projeção, com escala uniforme e espaço para o HUD; não altera pose, geometria, âncoras, matriz de mundo da câmera nem a calibração usada para projetar a arte. Mostra o tabuleiro completo e continua a madeira nas áreas excedentes de cada proporção. Planta, moedas e caneca existentes se distribuem horizontalmente sobre o plano da mesa para aproveitar as laterais extras, sem deslocar o tabuleiro. A projeção de exibição agora varia com o tamanho da janela; testes antigos que exigem projeção idêntica ao redimensionar são históricos. A matriz de mundo permanece idêntica.
- **HUD C8:** jogadores centralizados no topo, Menu à direita, Histórico independente no terço inferior direito e barra inferior única com retrato/vez, dados, prazo, ações e selo de rodada. `TurnBadge` foi incorporado à `ActionBar`; o rótulo acessível `Turno de: Você/nome` foi preservado. `GameScreen` não reserva coluna para painéis; `PropertyPanel` só aparece quando solicitado, flutuando. Modais, comandos e condições de ação seguem da engenharia. O aviso de celular em pé continua ativo.
- **Perfis de textura:** atlas normal 3072×2048, 1.357.692 bytes; atlas 6K 6144×4096, 3.716.762 bytes. O maior é solicitado quando o tamanho físico projetado supera 3072 px e a GPU suporta 6144. O anterior permanece visível durante a troca assíncrona. `paintPanel` rasteriza na resolução de cada perfil, mantendo tipografia e contornos maiores. Não foram inventados detalhes além da resolução das ilustrações-fonte.
- **Orçamento:** atlas sem mipmaps; normal 24 MiB, 6K 96 MiB, overlay 24 MiB. Até **144 MiB de texturas GPU do tabuleiro** se os dois perfis estiverem no cache, além da madeira, modelos, avatares e buffers. Desenho limitado a 8.388.608 pixels: 4K/DPR 1 usa 8.294.400; 2560×1440 com dispositivo DPR 2 usa DPR efetivo ~1,5085; telas menores podem usar DPR 2. Não é medição de FPS ou memória total em aparelho físico.

### Origem e licença — E34

O usuário confirmou **plano pago do Meshy na geração** e informou que **não tem autorização comercial dos retratos da referência visual-alvo**. Os recortes foram substituídos por cinco retratos originais, gerados individualmente com `image_gen` integrado, sem imagens de referência. Arquivos WebP de 512×512 em `hud/art/avatars-c8/`, fontes PNG em `assets/3d/calibration/c8/portraits/`, prompts/hashes em `provenance.json` e `assets/3d/requests/c8-portraits.json`.

`GameBoard` não importa mais a cena legada de 33 casas, evitando empacotar suas imagens de referência no jogo atual (que já exige catálogo 34 no servidor). Os módulos de calibração antigos permanecem como histórico; não reativá-los na distribuição. Modelos Kenney mantêm CC0 e aviso local. Modelos Meshy próprios têm plano/geração documentados; quatro downloads históricos de steampunk-girl continuam sem procedência suficiente e **não foram aprovados nem incluídos no runtime**. Registro comercial com fontes oficiais e hashes de 117 assets em `assets/3d/commercial-licenses.json`; isso não atribui licença a referências de terceiros. Nenhum crédito Meshy foi consumido no C8.

### Verificação

115 testes, TypeScript e build aprovados. Teste ponta a ponta de dois jogadores criando sala, rolando dados, passando a vez e consultando o histórico **aprovado** (Playwright, API real). QA visual conectado final aprovado com quatro jogadores, compra por comando oficial, estados com e sem dono, 34 meshes, canvas na dimensão integral da janela e mesma pose em 1280×720, 1536×1024, 1280×800, 2560×1080, 2560×1440, 3840×2160, 2000×740 e 844×390. Nenhum erro de página ou requisição falha. Atlas 6K confirmado em 4K na partida conectada. Perfis adicionais DPR 1/2 em `profile-report.json`, incluindo 2560×1440/DPR 2 com 8.386.092 pixels e 1536×1024/DPR 2 com 6.291.456 pixels. Capturas e `connected-report.json` em `assets/3d/reviews/c8/`. O build não contém as imagens de referência sem licença. Não publicar tokens: a sessão de QA fica apenas em staging ignorado pelo Git. QA usa Chromium de desktop com renderização de software; celular físico e desempenho no Steam Deck ainda não foram medidos.

**Para Claude:** esta entrega inclui a parte estrutural de `GameScreen`, `index.css`, `ActionBar` e `TurnBadge`; não reaplicar as margens/coluna do C5 nem os retratos recortados da referência. Comportamento, validações, acessibilidade e snapshot continuam sob responsabilidade da engenharia. As casas/terreno Meshy da etapa anterior permanecem preservados.

## Atualização com develop — 05/11/2026

Branch develop_arte_3d atualizada para afbfbed, incorporando a partida de 34 casas (16f7705) e o aviso de orientação no celular. As referências abaixo à produção ainda usar 33 casas são históricas e foram superadas por esta atualização. Casas e terreno Meshy locais preservados; o C8 foi executado posteriormente, conforme a entrega acima.


## Complemento — terreno antes da Casa 1 (05/11/2026)

O usuário apontou a ausência do terreno e autorizou expressamente o envio de `terrain-v2.png` ao Meshy por mais 30 créditos. Tarefa de conversão: `01a1aa12-8126-745d-a721-386082b71279`, Meshy 7.1 com textura 2K; plano e consentimento em `assets/3d/requests/terrain-meshy-image-plan.json`.

**Contrato vigente, substituindo a descrição de nível 0 abaixo:** propriedade comprada (`ownerId` preenchido) e `buildingLevel:0` recebe a miniatura do terreno original do modal; ao construir, o terreno é substituído pela Casa 1, depois Casa 2–4 e hotel. Propriedades sem dono e casas especiais não recebem o modelo. Nenhuma regra de compra/construção, preço ou aluguel foi alterada. `Pieces.tsx` respeita a posse do snapshot; não inferir posse pelo nível.

Família de seis GLBs `property-level-{0..5}-meshy-v1.glb`, todos com frente +Z, apoio Y=0, escala uniforme e identificação do dono no material separado. A preparação aceita `--terrain` para incorporar apenas o novo terreno e preservar os cinco modelos já entregues; hashes anteriores conferidos. Terreno: 1.815.212 bytes e 11.055 triângulos. Prévia individual em `assets/3d/reviews/buildings/terrain-and-model.png`; comparação da família em `modal-and-models.png`.

Custo acumulado da família: **280 créditos**, incluindo os 100 de prévias descartadas, os 150 das cinco construções e os 30 do terreno. Os 50 créditos anteriores de decoração permanecem fora deste total. Saldo confirmado após o terreno: **670 créditos**. Não repetir a geração para reconstruir arquivos locais.

Validação do complemento: 110 testes, TypeScript e build aprovados. Terreno sem erros/avisos Khronos (duas mensagens informativas na faixa de cor). Resultado inspecionado em comparação com a arte original; QA no navegador dos níveis 0–5, quatro personagens, cor do dono e terreno em três resoluções móveis em paisagem, sem erros/requisições falhas e com câmera invariável. Relatório e procedência atualizados em `assets/3d/reviews/buildings/`. Nenhum commit ou publicação nesta etapa.

## Construções Meshy a partir do modal — 05/11/2026

Entrega local na `develop_arte_3d`, ainda sem commit/publicação desta etapa. Cinco modelos reais Meshy 7.1, orientados pelas artes originais de `property-evolution/art/house-1-v2.png` até `house-4-v2.png` e `hotel-v2.png`, com origem registrada no chat ArtesImperio. As ilustrações do modal foram preservadas. Prévia comparativa: `assets/3d/reviews/buildings/modal-and-models.png`.

**Contrato visual:** um edifício evolui conforme `buildingLevel`: 0 sem modelo, 1–4 casas com respectivos pavimentos, 5 hotel. Substitui a repetição de quatro miniaturas iguais; não altera quantidade lógica, custos, aluguéis, saldo nem regras do servidor. `BuildingModels.tsx` carrega os GLBs; `buildingPresentation.ts` consulta `buildings.json` e aplica escala uniforme dentro de `buildingArea`. Frente +Z, apoio Y=0, sem alterar câmera/âncoras. Cor do jogador apenas no material independente `OWNER_ACCENT` e na faixa existente; fachada preserva a paleta do modal. Carregamento isolado por modelo para não esconder o tabuleiro inteiro.

**Para Claude:** manter esta apresentação ao integrar as regras de 34 casas. A partida nesta branch ainda consulta o catálogo de 33; não mudar seletor/âncoras por este registro. A camada visual já consome o nível do snapshot, sem exigir novo campo do servidor. GLBs e manifesto constituem uma família inseparável. Não recolorir os materiais texturizados, esticar modelos por eixo ou recolocar quatro casas idênticas. As pendências C6.1/C6.2 anteriores não foram executadas nesta etapa.

Arquivos finais: `apps/web/public/models/buildings/property-level-{1..5}-meshy-v1.glb`. Total 9.719.668 bytes, entre 10.442 e 13.403 triângulos/modelo. Fontes integrais 2K e preparação Blender em `assets/3d/calibration/buildings-meshy/`; processo reproduzível `scripts/assets/prepare-meshy-buildings.py`. Texturas de runtime até 1024 px. Protótipos locais anteriores arquivados em staging ignorado; não são os modelos entregues.

**Créditos:** 250 consumidos nesta etapa: 100 nas cinco prévias por texto descartadas e 150 nas cinco conversões por imagem aprovadas. Saldo confirmado 950 → 700, separado dos 50 gastos anteriormente na decoração. O usuário autorizou explicitamente enviar as cinco imagens locais ao Meshy após bloqueio inicial da revisão automática; apenas a ferramenta necessária de conversão por imagem foi habilitada. Identificadores, referências e custos em `assets/3d/reviews/buildings/meshy-ledger.json`; não executar novamente os scripts de geração para reconstruir o runtime.

Validação: 110 testes aprovados; TypeScript e build aprovados. Cinco GLBs sem erros/avisos Khronos (duas mensagens informativas por modelo sobre atributos não usados na faixa de cor). QA real: níveis 1–5, um edifício por propriedade, quatro personagens, mudança de cor do dono, câmera invariável e três telas em paisagem (844×390, 932×430, 667×375), sem erros de página ou requisições. Relatório `assets/3d/reviews/buildings/report.json`. Não equivale a teste em aparelho físico ou aprovação estética do usuário.

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

## Contrato adicional — área de rolagem dos dados (04/11/2026)

Fonte: `reference33/layout.json → diceRoll`. `dice[i].position`, `yaw` e `size` descrevem o repouso final, com pivô central. `diceRoll.supportY` é o plano de apoio; `centerBounds[i].min/max` são limites XYZ do **centro** durante giros livres, em coordenadas mundiais. Não são limites da superfície do dado. `horizontalTravel` é o deslocamento máximo em X e Z a partir da posição final; `bounceHeight` é a variação vertical adicional permitida acima do centro mínimo de giro. `rotationClearance: bounding-sphere` significa que cabe qualquer orientação dentro desses limites.

Para pousar: manter o centro dentro do envelope durante os giros; concluir a orientação da face oficial e o yaw; voltar ao X/Z final; somente então baixar verticalmente até `dice[i].position.y`. Abaixo do centro mínimo do envelope não há garantia para giros livres: usar a orientação final, sem inclinação adicional. A sequência inversa permite sair do repouso. Esses limites não são uma trajetória ou temporização; a animação é responsabilidade da engenharia.

O envelope foi verificado contra o quadro com margem de 8 px na composição nativa, moldura com folga de 0,02 unidade, recorte sem decoração e o outro dado. A câmera continua fixa, em 3:2; a margem escala junto com a composição no celular. Não confundir a validação da cena isolada com integração multiplayer ou com ausência de sobreposição pelo HUD.

## C3 — precisão das áreas e escala (04/11/2026)

As áreas locais de personagens/construções são retângulos de referência, não retângulos necessariamente inscritos nos polígonos inclinados. O `polygon` é o limite de ocupação; preservar a distribuição compacta e as escalas adaptativas existentes. O teste de discos de apoio (raio 0,1875 na escala 0,75) não demonstra separação visual dos corpos, nem confinamento de braços/roupas durante todo o idle. A arte mantém escala 0,75 nesta composição, com ressalva de encobrimento do grupo e tamanho pequeno no celular. Não alterar escala conforme turno/casa ou mudar a câmera para resolver isso sem revisar o contrato.

## C5 — contrato da composição ao redor da cena (04/11/2026)

A entrega de arte usa `BoardSurroundings` como camada de apresentação ao redor da cena existente. Não muda a câmera, o GLB nem `reference33/layout.json → tiles[].pixels`. Há dois sistemas explícitos: pixels nativos da câmera 1536×1024 e pixels do viewport externo. `surroundingsLayout(width,height)` publica `boardViewport` e `hudSafeAreas` em pixels do viewport; `boardPixelToViewport` transforma pixels nativos por escala uniforme e translação. O manifesto `surroundings.json` registra referência, reservas e mínimos. A camada externa se adapta à tela; o Canvas interno continua 3:2.

Props: `children` é a cena/tabuleiro existente; `top`, `side`, `bottom` são elementos de apresentação fornecidos pela engenharia. O componente não lê stores, não decide ações e não abre conexões. O slot `side` fica à direita em tela larga e abaixo do tabuleiro na vertical, com rolagem interna. Os painéis precisam respeitar o retângulo recebido e não usar posicionamento absoluto em relação à janela. O entorno preenche toda a tela com madeira procedural CSS original, inclusive as sobras laterais; não inclui outra imagem de tabuleiro.

Integração: usar a camada no lugar das margens `--hud-*`, não dentro delas. Claude conecta os painéis reais e mantém menu, temporizador e acessibilidade. A prévia usa os componentes reais com snapshot sintético, sem certificar conexão, multiplayer ou finalização do modal C6. Redimensionamento altera apenas os retângulos DOM e a escala uniforme da composição; câmera e coordenadas de mundo permanecem constantes.


## Placas de aluguel e molduras do conceito aprovado (04/11/2026)

`tabletop-ui/TabletopUi.tsx` exporta `RentPlaque`, `StateRentOverlay`, `PlayerNameplate` e `ActionDock`. São apresentação: sem stores, regras, conexões ou comandos. Os PNGs são vazios; valores, nomes, retratos, dados e tempo são conteúdo separado. Não incorporar preços em texturas finais.

`RentLabel = {stateId,stateName,rentLabel,kind:'base'|'current'}`; `StateRentOverlay({labels})` usa retângulos nativos de `rentPlacements.json`, sobre composição 1536×1024, com escala uniforme. Preços completos e descrições acessíveis; cliques atravessam a camada. Fonte do aluguel é a engenharia: base no estado livre; `currentRent` com nível/multiplicador no estado possuído; `formatCredits` para R$. Não calcular nem multiplicar na arte. Não confundir preço de compra com aluguel.

A nova decisão visual do usuário retira a prancheta lateral de estado do conceito C5; o modal de compra/construção existente permanece. O conceito de cenário contínuo é referência visual, não prova de integração funcional. A camada de preços ainda precisa de conferência com peões/construções e solução legível no celular ao integrar. Não reintroduzir a coluna permanente da prévia anterior como implementação do conceito aprovado.


## Decisão vigente — celular somente em paisagem (04/11/2026)

O usuário confirmou: **a partida no celular só pode ser jogada na orientação paisagem (horizontal)**. Esta decisão prevalece sobre as propostas e capturas históricas de jogo em 390×844/320×568. Essas capturas continuam úteis para inspecionar assets, mas não representam um modo de partida suportado nem são critério de aprovação de leitura móvel.

Na integração, a engenharia deve mostrar em retrato um aviso para girar o aparelho e impedir interação com as ações da partida enquanto o telefone estiver em pé. Não depender exclusivamente de bloqueio de orientação do navegador: o aviso deve funcionar mesmo sem suporte a esse recurso. Girar o telefone não pode pausar o relógio oficial, desconectar, reiniciar a partida nem enviar comandos. Ao voltar à horizontal, retomar a apresentação do snapshot atual.

Validar HUD, tabuleiro, aluguéis e modal em paisagem, incluindo 844×390, 932×430 e 667×375. Rever a legibilidade dos preços e a ocupação da tela nessa composição; não reutilizar o encaixe estreito da coluna lateral C5 rejeitada. Não há novo layout de partida vertical a implementar. O aviso de orientação e a montagem na partida continuam pendentes: esta atualização registra a decisão, sem alterar o GameScreen.


## Revisão solicitada pelo usuário — proposta de 34 casas, RN e Saque (04/11/2026)

A nova decisão acrescenta uma casa especial SAQUE: START → RN → AM no começo; AL → SAQUE → CE no antigo trecho de RN. As 26 propriedades permanecem; Início não sai. `special-tiles/proposedBoard34.json` é contrato de proposta, separado do manifesto atual de 33 casas. Não há migração de catálogo, modelo, câmera ou partidas aplicada nesta entrega. A revisão do congelamento C2 precisa ser coordenada entre arte e engenharia antes da integração.

O fundo de Taxa é estado oficial do servidor: acumula pagamentos efetivados de Taxa, é recebido integralmente ao parar em Saque e zera nessa operação. O marcador na Taxa mostra o saldo disponível, com atualização por snapshot/eventos, sem contagem ou transferência local. R$600 no conceito é exemplo. A engenharia define o schema e valida dívida, idempotência, persistência e multiplayer.

`special-tiles/SpecialTileArtwork.tsx`: `SaqueTileArtwork()` fornece a arte/título da casa e `TaxPoolMarker({collectedLabel:string})` fornece pote e total já formatado. Sem stores/regras/comandos. Imagens originais transparentes, texto e valor separados. Saque não tem plaquinha de aluguel; RN mantém seu aluguel e deve ganhar novas coordenadas na futura calibração. As posições de 33 casas não aprovam ocupação ou preços na proposta de 34. Conceito e assets em `assets/3d/reviews/saque/` e `special-tiles/art/`; detalhes no pedido vigente dos dois arquivos de orientação.

## Implementação visual de 34 casas — contrato em execução (04/11/2026)

Novo módulo `board/board34`: geometria/GLB e atlas próprios, manifesto com 34 IDs/índices/polígonos/âncoras e área de aluguel por UF. A sequência vem de `special-tiles/proposedBoard34.json`; START→RN→AM e AL→SAQUE→CE. Preservar a calibração fixa e as coordenadas mundiais da mesa/dados C1.

O seletor do frontend só ativa a cena de 34 casas se o catálogo inteiro (IDs e índices em ordem) corresponder ao novo manifesto; com catálogo de 33, mantém cena/âncoras atuais. Não ativar só pela contagem nem simular a regra Saque no cliente. `Board34Scene` recebe seleção/callback, `rentLabels`, `taxPoolLabel`, dados e `children` da engenharia, sem stores/comandos. O host usa os helpers existentes para calcular/formatar aluguéis e fornece o saldo oficial da Taxa; valor ausente é informação indisponível, não zero inventado.

As artes do novo atlas vêm dos assets originais das UFs/Saque/Taxa e de um novo centro autoral; não usar o screenshot conceitual nem pixels do tabuleiro de referência como textura. Seleção, geometria e peças continuam independentes de qualquer imagem. A ativação na partida requer catálogo/motor/snapshot de 34 casas pelo Claude, sem misturar índices de 33 e 34.


## Entrega do contrato 34 em código (04/11/2026)

O manifesto concreto agora é `board/board34/layout.json`, com GLB próprio `board34-v01.glb`, atlas original WebP e `Board34Scene`. A arte de 34 está implementada; a migração do motor/catálogo/snapshots segue pendente. `boardVisualManifest` ativa por IDs, índices e sequência inteira, com as 26 associações de propriedades. `layout.ts` e `GameBoard` já adotam essa escolha; catálogo atual de 33 permanece no cenário antigo. Não contornar o seletor para misturar índices.

API visual: `selectedId`, `onSelect(id)`, `rentLabels: {stateId,rentLabel}[]`, `taxPoolLabel: string|null`, `diceValues`, `children`. Totais e aluguéis ficam na face real, sem regra local. Valor desconhecido da Taxa não equivale a zero. O host precisa fornecer o saldo público formatado via `GameBoard({taxPoolLabel})`; seus cálculos/transferências pertencem ao servidor.

`rentRect` e `taxPoolRect` usam pixels nativos 1536×1024; o atlas tem resolução 2×, sem alterar posições. Âncoras mantêm os campos/significados anteriores. Valores não estão gravados no atlas estático; a cena mistura uma textura de texto atualizável. Não sobrepor as posições antigas de 33 casas à nova cena. Câmera e envelope dos dados C1 preservados. Fontes, geometria e QA detalhados na nova seção de entrega dos dois arquivos de orientação.