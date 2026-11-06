# Orientações e pendências para o Claude Code

## Publicação das entregas de interface (06/11/2026)

Validação após incorporar a develop: **135 testes, TypeScript, build e auditoria dos 35 WebP no pacote aprovados**. Commit de entrega: `df14e45`.

Integração com a engenharia `0dda111`: preservados os sons de abertura e o resumo calculado de aluguel olímpico nos três modos, além do preço de compra na consulta de estado livre. A identidade/nível do proprietário usa a nova apresentação nativa. O novo pedido C10 permanece aberto, fora desta entrega.

Commit e integração/publicação na `develop` solicitados pelo usuário. Inclui C6.1/C6.2, pacote do menu inicial e kit das três abas de configurações. Os registros anteriores de “sem commit/merge” descrevem o estado antes desta solicitação. Assets de menu e configurações continuam como kits com prévias isoladas; somente o modal de propriedade foi integrado à interface de produção. Identificadores da publicação ficam no histórico Git.

## Configurações — assets das três abas (06/11/2026)

**Estado: kit de arte entregue localmente na develop_arte_3d, sem substituir a tela de produção.** O usuário aprovou os mockups Geral/Som/Conta e pediu a criação dos assets. Entrega: **32 SVG originais editáveis** em `apps/web/src/settings-art/art/`, incluindo moldura externa, título, cartões, skyline, botões comuns/principais/destrutivos, abas, fechar, alternâncias, volume, seletor e 15 ícones. Estilos de composição e estados em `settings-assets.css`. Retrato, coroa e engrenagem reutilizam assets próprios existentes; não houve nova geração ou consumo de créditos Meshy.

**Para Claude:** guia e manifesto com hashes em `assets/settings/`. Gerador reproduzível: `scripts/assets/settings-vectors.mjs`. Prévia navegável em `scripts/assets/settings-preview/`, com HTML/JS isolados, sem store ou comandos do jogo. Textos/valores são HTML, não imagens. Conectar ações e preferências reais apenas na integração; campos e botões da prévia não implementam os serviços que representam. Excluir conta abre somente uma confirmação visual cancelável; nenhuma conta é alterada. O host deve manter foco, confirmação, persistência e restrição do jogo para paisagem. Modo disabled, foco, hover e pressionado são CSS; checkbox/range/select são nativos. Todos os 32 assets constam do inventário comercial como arte vetorial original do projeto.

**Validação:** `scripts/assets/settings-qa.mjs`: 15 combinações de aba/tela, em 1672×941, 1280×720, 1024×768, 844×390 e 667×375, além de foco e desabilitado. Imagens decodificadas, sem estouro dos cartões ou controles fora da tela; alternâncias, FPS, volume, salvar/restaurar em memória, teclado e fechar/reabrir conferidos. Capturas/relatório em `assets/3d/reviews/settings/`. Sem nova partida conectada, testes de servidor, commit ou merge nesta entrega isolada de assets.

## Menu inicial — pacote de assets (06/11/2026)

**Estado: artes e prévia entregues localmente na `develop_arte_3d`; integração à tela inicial ainda não realizada.** Referência enviada pelo usuário: menu tropical de Império Urbano. 16 assets em `apps/web/src/main-menu/art/`: cenário de praia/deque, logotipo, cachorro e dados em WebP (três com transparência); três molduras SVG vazias para botões e nove ícones/decorações SVG. Textos, valores, avatar, medidor e molduras dos indicadores ficam em HTML/CSS, separados das imagens. As quatro ilustrações somam 878.814 bytes. PNG originais, prompts exatos, hashes e guia em `assets/menu-inicial/`. Geração pelo image_gen integrado; sem Meshy/créditos Meshy. Retrato reutilizado da família própria C8, sem recortar o avatar da referência.

**Para Claude:** composição de exemplo em `scripts/assets/main-menu-preview/index.html`; estilo reutilizável em `apps/web/src/main-menu/menu-assets.css`. Preservar proporção das artes e a restrição do celular para paisagem. Nome, nível, experiência, moedas e diamantes da prévia são amostras; integrar dados e comandos oficiais separadamente. A opção “Partida Clássica (IA)” é apenas o rótulo da referência e não implementa IA. Os seis controles da prévia só mostram uma mensagem local; não executam jogo ou compra. Não substituir a tela de produção automaticamente com este protótipo.

**Validação:** `scripts/assets/main-menu-qa.mjs` aprovado em 1672×941, 1280×720, 844×390 e 667×375; imagens decodificadas, controles dentro da tela, sem estouro horizontal, requisições falhas ou erros de página. Capturas/relatório em `assets/3d/reviews/main-menu/`. Fontes e derivados registrados no manifesto; inventário comercial inclui os 16 assets para uso na interface. Entrega isolada de arte, sem nova partida conectada, commit ou merge.

## C6.2 — imagens do modal otimizadas (06/11/2026)

**Estado: concluído localmente na `develop_arte_3d`, sobre `fdbc93d`, junto da entrega C6.1 ainda sem commit.** Os componentes `StateHeaderArtwork.tsx` e `PropertyArtwork.tsx` agora importam 35 derivados WebP de `art/optimized/`. Cabeçalhos: 1600 px de largura; terreno, casas e hotel: 1024 px; ícones: 512 px. Proporção preservada, sem ampliação, redimensionamento de alta qualidade e WebP com qualidade 92. Transparência conferida pixel a pixel contra a imagem redimensionada, sem alteração do canal alfa pela compressão.

| Grupo | Antes | Depois | Redução |
|---|---:|---:|---:|
| 26 cabeçalhos | 78,74 MB | 8,68 MB | 88,97% |
| 6 construções/terreno | 11,60 MB | 1,60 MB | 86,20% |
| 3 ícones | 3,91 MB | 0,16 MB | 95,92% |
| Total | 94,25 MB | 10,44 MB | 88,92% |

Valores em MB decimais. Fontes PNG e seus registros de procedência preservados sem alteração; não são mais copiadas para o pacote do modal. `art/optimized/manifest.json` registra origem, hashes, tamanho e configuração de cada derivado. Inventário comercial e gerador atualizados com os 35 derivados. Nenhuma nova geração de arte, upload externo ou consumo de créditos.

**Reprodução e validação:** `node scripts/assets/compress-property-art.mjs` gera os derivados usando o codificador WebP do Chromium instalado pelo Playwright. Depois de `npm run build`, `node scripts/assets/property-compression-qa.mjs` confere hashes das fontes e derivados, inventário, transparência registrada, presença dos 35 WebP no build e ausência dos PNG originais no pacote. Comparações antes/depois e relatório em `assets/3d/reviews/property-compression/`. Conferência visual de desktop e celular paisagem aprovada; regressão de compra/construção, 52 trocas de cabeçalho, consulta nas cinco telas, 126 testes, TypeScript e build aprovados. A validação visual desta rodada foi feita na prévia controlada, sem medição de velocidade numa rede móvel real.

**Para Claude:** integração já realizada nos imports do modal; não restaurar os imports PNG. As fontes continuam disponíveis para edição ou novas conversões. C6.1 e C6.2 concluídos; nenhum commit, publicação ou merge executado nesta rodada.

## C6.1 — arte do modal de consulta (06/11/2026)

**Estado: implementado e validado localmente na `develop_arte_3d`, sobre `fdbc93d`.** O pedido do usuário foi criar a arte deste modal seguindo o padrão do projeto. Moldura azul e dourada, panoramas próprios dos estados e seis ilustrações originais foram preservados. A consulta ganhou identificação do proprietário (retrato, nome e cor do peão), nível e aluguel atuais, destaque verde do nível atual e aluguel legível nas seis etapas. Sem dono, mostra “Disponível para compra”. Etapas futuras ficam coloridas e neutras.

**Contrato para engenharia:** `PropertyEvolutionPanel` aceita `mode: 'view'` e `owner?: { name: string; color: string; portrait?: ReactNode } | null`. As propriedades de ações são opcionais nesse modo. As etapas são conteúdo estático: não selecionam nem confirmam, não exibem cadeados, resumo de custo ou botão de construção. O host `hud/PropertyDecisionDialog.tsx` já passa o modo nativo, os dados do dono e o retrato original; a adaptação `.pe-host-view` foi removida de `index.css`. Fechamento, foco e comandos de compra/construção permanecem sob controle do host. Aluguéis continuam vindo das regras existentes, incluindo o bônus olímpico.

**Validação:** 126 testes, TypeScript e build aprovados. Prévia controlada em `scripts/assets/property-view-preview/`, QA em `scripts/assets/property-view-qa.mjs` e capturas/relatório em `assets/3d/reviews/property-view/`: proprietário, imóvel livre, hotel, nome longo, seis aluguéis, nenhuma ação financeira disparada, fechamento e cinco tamanhos (1280×720, 1024×768, 844×390, 667×375 e 390×844). As duas telas pequenas em paisagem cabem integralmente. Retrato foi apenas uma verificação de robustez; a restrição do jogo para paisagem permanece. Regressão visual de compra/construção e dos 26 cabeçalhos aprovada pelo roteiro existente. Esta rodada usou prévia controlada, sem nova partida conectada.

Sem geração de imagens, uso do Meshy ou consumo de créditos: composição feita com as artes próprias já aprovadas. **C6.2 concluído na revisão de otimização registrada acima.** Nenhum commit ou merge desta entrega foi executado.

## C9 — dados 3D no miolo: entrega de arte (06/11/2026)

**Estado: implementado e validado na `develop_arte_3d`, sobre `6aa9d62`; commit e integração à `develop` solicitados e autorizados pelo usuário. Identificadores no histórico Git.** Os dados foram retirados da região atrás da barra e colocados no primeiro plano do miolo, flanqueando a faixa inferior do logotipo. Em repouso, o título e “EDIÇÃO BRASIL” continuam legíveis. Tamanho dobrado de 0,34 para **0,68**; as mesmas faces, materiais e GLB foram preservados.

### Contrato para Claude — manifesto ativo como única fonte

`apps/web/src/board/board34/layout.json` conserva o formato existente de `dice` e `diceRoll`. Câmera, casas, âncoras, ordem de 34 e `reference33` preservados. Os campos `face/pixel` servem à prévia/calibração; a partida continua desenhando somente o resultado recebido do servidor.

| Campo | Dado 0 | Dado 1 |
|---|---|---|
| `position` de repouso | `[-2.45, 0.375, 2.4]` | `[2.3, 0.375, 2.4]` |
| `yaw` | `0.25` | `-0.22` |
| `size` | `0.68` | `0.68` |
| `centerBounds.min` | `[-2.85, 0.6438972746, 2.0]` | `[1.9, 0.6438972746, 2.0]` |
| `centerBounds.max` | `[-2.05, 1.1438972746, 2.8]` | `[2.7, 1.1438972746, 2.8]` |

Valores completos no JSON são autoritativos. `supportY = 0.035`, igual à superfície do miolo, e não à mesa (`-0.505`). O centro parado fica em `supportY + size/2 = 0.375`. `horizontalTravel = 0.40` por eixo (antes 0,03); `bounceHeight = 0.50` acima do mínimo de giro (antes 0,03). A subida total do centro até o ponto mais alto é cerca de 0,769 unidade a partir do repouso.

**Segurança do giro:** esfera conservadora de raio `sqrt(3) × size/2 = 0.5888972746`. O mínimo de giro deixa 0,02 unidade entre essa esfera e o piso. A esfera inteira permanece dentro do polígono do miolo nos extremos X/Z; as faixas dos dois dados são separadas, sem colisão entre eles, com casas ou moldura. Repouso fica abaixo do mínimo do giro: manter a subida inicial sem rotação extra e o pouso vertical já existentes no `rollPlan/RollingDice`.

**Sombras: sim, permanecem ativas.** Como o miolo usa um shader de arte projetada, foi acrescentado o receptor transparente `CENTER_CONTACT_SHADOW`, 0,001 acima da superfície, com opacidade 0,30 e recuo de 0,06 nas bordas. Ele recebe sombras reais sem pintar o atlas nem modificar a ilustração. Os dados continuam lançando sombra. Nenhuma casa, peão ou construção ocupa fisicamente a área de giro.

**Integração:** a animação atual já consome este manifesto. Não foram alterados `DiceVisual`, `diceOrientation`, `RollingDice`, tempos, sorteio, eventos, sincronização do peão, reconexão ou movimento reduzido. A barra conserva o resultado 2D e a regra de ocultá-lo durante o lance. A responsabilidade de animação continua com a engenharia. A garantia referente aos peões considera suas posições nas casas; preservar a espera do lance antes do movimento. Travessias aéreas de viagens e comemorações continuam sob a coordenação da engenharia, sem introduzir simultaneidade com o giro na área reservada.

### Reprodução e evidências

- Definição de arte em `scripts/assets/board34-dice.mjs`, usada também pelo gerador completo de layout. `node scripts/assets/update-board34-dice.mjs` atualiza somente `dice/diceRoll`, preservando todos os outros campos.
- A prévia de peças agora usa `tileAnchor/pawnSpots` da partida, incluindo as faixas de construção da revisão `6aa9d62`, em vez das antigas áreas brutas.
- **126 testes, TypeScript e build aprovados.** Testes geométricos verificam apoio, projeção calibrada, esfera de giro, separação dos dados, enquadramento e planos extremos da animação existente. Em repouso, a projeção dos dados fica livre das caixas conservadoras dos quatro peões por casa (até 1,05 de altura) e de todos os seis níveis de propriedade.
- QA controlado com modelos reais em **1280×720, 1536×1024, 1280×800, 2560×1080, 2560×1440, 3840×2160, 2000×740 e 844×390**. Largura medida de cerca de **30 e 29 px no celular em paisagem**; 58 e 56 px em 1280×720. A matriz de mundo da câmera permanece igual.
- Nas **34 casas**, quatro personagens e hotel onde aplicável: repouso e oito extremos inclinados do envelope, com raios de visibilidade atingindo os meshes dos próprios dados. Sem erros de página ou requisições falhas. Isto amostra a visibilidade no ar; não é uma nova simulação física nem medição em celular físico.
- Capturas `assets/3d/reviews/c9/rest-1536x1024.png`, `rest-844x390.png` e `flight-limit-stress.png`; relatório completo em `report.json`. Executar `node scripts/assets/c9-qa.mjs`. A validação desta etapa é uma prévia controlada de arte; não foi criada uma partida conectada nova.
- **Zero créditos Meshy adicionais e nenhuma geração de arte raster nesta etapa.**

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

Atualizado em 04/11/2026. Este é o ponto único de passagem de trabalho entre arte (Codex) e engenharia (Claude).

## Decisão mais recente — protótipo aprovado e aluguéis nos estados (04/11/2026)

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

O usuário aprovou o conceito de mesa/cenário contínuo com HUD integrado visualmente e pediu **retirar a prancheta lateral de estado**, porque compra/construção usam o modal já entregue. Esta decisão substitui a proposta anterior C5 que reservava uma coluna permanente para `PropertyPanel`: não implementar aquela prancheta/coluna como destino visual final. Não confundir a imagem conceitual aprovada com implementação pronta. Referência da versão sem prancheta em `assets/3d/reviews/tabletop-ui/approved-concept-no-clipboard.png`; não usar esse bitmap de conceito como fundo final da partida.

Novo pedido: **preço do aluguel nos estados**. Arte original e componentes de apresentação em `apps/web/src/tabletop-ui/`:

- `art/rent-plaque-v1.png`: plaquinha dourada/índigo transparente, sem texto. `RentPlaque` recebe `stateName`, `rentLabel` já formatado e `kind: base | current`. Não grava valores, não acessa stores e não calcula regras.
- `art/player-frame-v1.png`: moldura vazia de jogador, com encaixe de retrato; `PlayerNameplate` recebe nome, saldo formatado, retrato e indicação de ativo. Mantém retratos e dados fora da imagem.
- `art/action-dock-v1.png`: base vazia dos controles. `ActionDock` recebe `roundLabel` e `children`; botões, dados, prazo e comandos continuam com a engenharia.
- PNGs originais RGBA, 2172×724, transparência verificada; visualização sem margem transparente por janela SVG, sem editar o arquivo-fonte. `art/assets.json` contém dimensões/janelas/hashes; prompts completos e origem em `art/provenance.json`. Ferramenta integrada image_gen; sem Meshy.
- `rentPlacements.json` e gerador `scripts/assets/build-rent-placements.mjs` publicam retângulos dentro das 26 propriedades da câmera nativa 1536×1024; não há placas em casas especiais, nem TO. Não alteram as 33 âncoras, regras, modelos ou câmera.

**Ações da engenharia para integrar depois da revisão:**

1. Estados livres mostram aluguel base do catálogo, identificado como base; estados possuídos mostram aluguel atual calculado pelo helper existente `currentRent(snapshot,definition)` e formatado por `formatCredits`, incluindo nível e Olimpíadas. Não mostrar preço de compra como aluguel e não multiplicar números por mil.
2. Passar dados prontos para a arte. `StateRentOverlay` é uma camada DOM de apresentação de referência sobre o Canvas nativo 3:2; usar a conversão de pixels da composição correta se o cenário/HUD for ampliado. Não duplicar a camada na textura e no DOM. Dados ausentes podem omitir a placa, sem inventar zero.
3. As placas têm `pointer-events:none` e descrição acessível sem região viva para 26 anúncios simultâneos. Preservar seleção de casa e informação completa no fluxo/modal aprovado. O encaixe em polígonos não comprova ausência de encobrimento de peões/construções; conferir cenas ocupadas e o posicionamento final ao integrar.
4. Não manter os 26 textos em fonte microscópica como aprovação de celular. A composição 3:2 reduzida a 390 px torna esses números pequenos; legibilidade móvel e informação da casa selecionada precisam de solução na integração, sem mudar a câmera por turno. A prévia fornece inspeção em resolução nativa; não é certificação de leitura em celular físico.
5. Preservar o modal existente e não reintroduzir a prancheta. Os novos componentes/assets **não estão montados no GameScreen**; pedido anterior de apresentar antes de implementar continua respeitado.

Prévia local: `node scripts/assets/tabletop-ui-preview/server.mjs`, porta 4188. Verificação `node scripts/assets/tabletop-ui-qa.mjs`; capturas em `assets/3d/reviews/tabletop-ui/`. A demonstração alterna base/duas casas/hotel e ES com duas casas/Olimpíadas ×3 usando catálogo e helper existentes, sem backend. Branch `develop_arte_3d`, alterações locais sem novo commit/merge.

## Atualização prioritária — as imagens são referências para criar arte

O usuário esclareceu que o Codex deve criar a arte tomando as imagens como modelo, sem utilizar as imagens enviadas, recortes ou projeções delas como arte final do produto. A prévia atual de 33 casas usa o PNG diretamente e passa a ser classificada como **protótipo de layout/câmera**. A recriação das artes é pendência do Codex; não é tarefa do Claude.

**Ação do Claude:** a migração lógica de 33 casas já foi incorporada da `develop` (base `97c9d54`, que inclui `e6e5b38`). Preservar essa integração e manter a troca dos assets desacoplada da lógica. Não consolidar a projeção atual do tabuleiro como acabamento final e não substituir ou redesenhar as artes por conta própria. Conferir a entrega de novos assets do Codex antes de marcar a integração visual como validada. Não é necessário reabrir a decisão já aprovada sobre as 33 casas.

## Nova entrega — painel de compra e evolução da propriedade

**Estado: componente visual com novas ilustrações detalhadas disponível para revisão do usuário; integração funcional pendente do Claude.** O usuário rejeitou a primeira versão de vetores simplificados. A revisão substitui construções e paisagem por arte original gerada, seguindo o painel azul/dourado da primeira referência e as miniaturas com telhas, sacadas, vegetação e calçadas da segunda referência. Não declarar fidelidade aprovada antes da revisão do usuário. Esta entrega não substitui `PropertyPanel`/`TileActions` automaticamente. Nenhum arquivo de regras, stores, movimento ou backend foi alterado. As imagens enviadas são somente referências; seus pixels não foram utilizados no painel.

Arquivos: `apps/web/src/property-evolution/PropertyEvolutionPanel.tsx`, `property-evolution.css` e `PropertyArtwork.tsx`. Ilustrações individuais de terreno, quatro casas, hotel e paisagem em `art/*-v2.png`; os prompts, origem e limitações estão em `art/provenance.json` (ferramenta integrada `image_gen`, sem API/CLI ou Meshy). As construções são imagens 2D de interface com transparência, não novos GLBs para o tabuleiro. Prévia isolada em `scripts/assets/property-evolution-preview/`; verificação reproduzível: `node scripts/assets/property-evolution-qa.mjs`. Capturas desktop/compra/celular e relatório em `assets/3d/reviews/property-evolution/`.

**Ações do Claude:**

- [x] Montar o painel em um diálogo controlado pelo fluxo atual ao cair em propriedade comprável ou própria com construção permitida. Preservar seleção/consulta de propriedades de terceiros e demais ações existentes. Não abrir uma decisão de compra fora de `AWAITING_PURCHASE`, nem construção fora de `AWAITING_BUILD`.
- [x] Fornecer `stateCode`, `stateName`, `mode: 'purchase' | 'build'`, `stages`, `selectedLevel`, `costLabel`, `newRentLabel`, `actionLabel`, `message`, `actionDisabled`, `pending` e callbacks. `stages` contém `{level, label, rentLabel, status, note?}`. Status: `current`, `available`, `locked`, `complete`. A arte não calcula permissão, saldo, preço, aluguel ou visitas. Textos monetários devem vir de `formatCredits` e do catálogo/snapshot, incluindo multiplicador olímpico quando aplicável.
- [x] **`onSelect(targetLevel)` entrega o nível final pretendido, não o número de casas a construir.** Para compra, traduzir nível 0–3 permitido em `BUY_PROPERTY {houses: targetLevel}`; para construção, calcular a diferença para o nível atual e usar `BUILD {houses: diferença}`; nível 5 permitido usa `BUILD_HOTEL`. Reaproveitar `affordablePurchaseHouses`, `buildOptions`, saldo, posição, fase, turno e validações existentes. Não enviar a seleção diretamente como quantidade de construção.
- [x] Manter **Terreno + Casa 1 + Casa 2 + Casa 3 + Casa 4 + Hotel**. A referência mostra três casas, mas as regras vigentes têm quatro; não mudar o motor para adequá-lo ao desenho. As etapas disponíveis dependem da visita e do saldo. O `note` de cada bloqueio vem do controlador, não de uma regra fixa na arte.
- [x] Em modo compra não há etapa atual de propriedade já possuída: o terreno pode ser uma opção disponível. Em modo construção marcar o nível real como `current`, anteriores `complete` e escolhas válidas `available`. Seleção é controlada pelo host; limpar/revalidar ao mudar estado, snapshot, turno ou disponibilidade.
- [x] Conectar `onConfirm` aos comandos reais somente depois de revalidar o estado atual. Desabilitar por desconexão/observação/fase inválida e durante envio; mostrar erro/retorno do servidor sem presumir sucesso. O componente também impede confirmar uma seleção que não esteja `available`.
- [x] O host é responsável por `role="dialog"`, `aria-modal`, foco inicial, contenção/restauração de foco, Escape/fechamento e sobreposição escurecida com rolagem vertical. A arte fornece uma seção nomeada, controles nativos e botão de fechar; não fornece um controlador de diálogo. Aplicar a decisão registrada em `ORIENTACOES-CODEX.md`, C6: o X recusa com `DECLINE_PURCHASE` na compra ou `SKIP_BUILD` na construção, sem minimizar e sem enviar `PASS`/`END_TURN` como substituto. Manter o temporizador oficial visível no diálogo/host, inclusive durante envio e até expirar; o painel não cria contagem local nem prolonga o turno.
- [x] O cabeçalho agora resolve automaticamente a arte original de cada UF pela prop `stateCode`, usando `StateHeaderArtwork.tsx`. Não passar `RioArtwork` fixo para todos os estados. A prop opcional `artwork` só precisa ser usada para uma substituição deliberada; normalmente deve ser omitida. As construções são reutilizáveis em todas as UFs, com fontes PNG de alta resolução (largura mínima verificada de 1024 px); manter `object-fit: contain` e proporções. Não ampliar além da resolução disponível nem reintroduzir o desenho vetorial simplificado. Moedas, casa com seta e ferramentas são PNGs originais; controles e dados continuam separados da arte.
- [ ] Validar compra simples/com casas, construção a partir de nível diferente de zero, Casa 4, hotel, saldo insuficiente, nova visita, aluguel olímpico, desconexão, fechamento e expiração de decisão. Conferir teclado e celular com o HUD real. A prévia testa apenas a apresentação e os callbacks, sem conexão ao servidor. **Conferido:** compra simples e com 2 casas, recusa pelo "×", expiração (o servidor recusou sozinho), consulta fora da vez, Esc e foco, em 1536×1024, 1024×768 e 390×844 numa partida real. Construção a partir de nível > 0, Casa 4, hotel, saldo insuficiente, nova visita e aluguel olímpico estão cobertos por testes (`game/propertyDecision.test.ts`), sem conferência ao vivo; desconexão não foi refeita.

Os botões da prévia alternam cenários ilustrativos e não executam comandos. O fundo neutro é exclusivo da prévia; o host deve sobrepor o painel ao tabuleiro real. Créditos Meshy consumidos nesta entrega: **0**. Não considerar concluída a integração por existir uma screenshot.

**Revisão adicional de 02/11:** criadas artes individuais de moedas (`coins-v2.png`), casa com seta (`rent-growth-v2.png`) e ferramentas (`build-tools-v2.png`), conectadas ao resumo e ao botão. Fontes e prompts em `art/investment-provenance.json`. O X de fechar usa vetor centralizado, independente da fonte. O usuário autorizou explicitamente exibir **R$**: `formatCredits` e o aluguel desenhado em `tileTexture` foram atualizados, mantendo os números do catálogo e a economia do jogo. Preservar essa indicação ao integrar e substituir versões antigas que ainda mostrem apenas `$`. Não multiplicar preços por mil para reproduzir os números ilustrativos da referência. Os três ícones também aparecem na composição de celular.

### Cabeçalhos turísticos — todas as UFs do tabuleiro aprovado

**25 novas ilustrações originais entregues, total de 26 com o RJ existente. Integração visual na prévia disponível; fluxo conectado ainda pendente do Claude.** Arquivos individuais em `apps/web/src/property-evolution/art/states/*-header-v1.png`, procedência e prompts completos em `states/provenance.json`. O RJ continua em `art/rio-header-v2.png`, preservando sua versão existente. São ilustrações estilizadas, não fotografias documentais nem reproduções arquitetônicas medidas. Nenhum recorte das referências do usuário foi utilizado. Sem operações Meshy.

- API: `StateHeaderArtwork({stateCode})`; manifesto `STATE_HEADER_ART`; consulta `getStateHeaderArt(stateCode)` retorna `{name, src}` ou `undefined`. `PropertyEvolutionPanel` já usa esse componente por padrão quando `artwork` não é fornecido. A sigla e o nome continuam em HTML; não fazem parte do bitmap. IDs desconhecidos não caem silenciosamente no RJ.
- Cobertura: **AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE**. São as 26 UFs do percurso de 33 casas já incorporado da `develop`; **TO não foi incluído**. Esta entrega de arte não reordena nem modifica o catálogo lógico.
- Claude deve passar a sigla/ID verdadeiro da definição selecionada para `stateCode` e o nome correspondente para `stateName`. Não resolver imagem por índice do tabuleiro nem inferir estado pelo nível de construção. Reutilizar a mesma arte em compra/construção e nas revisitas do mesmo estado.
- Preservar a proporção 3:1 das fontes e o recorte visual do cabeçalho; não esticar imagens. As fontes têm cerca de 2 mil pixels de largura, adequadas para o cabeçalho em telas de alta densidade. Não carregar todas em sequência durante uma partida: o componente renderiza somente a imagem selecionada; a prancha é exclusiva da prévia de arte.
- A prévia tem seletor de UF e a opção **Todas as artes** (`?gallery=1`). Captura da prancha em `assets/3d/reviews/property-evolution/state-headers-gallery.png`, além de exemplos de modal CE/MT/SP. Rodar `node scripts/assets/property-evolution-qa.mjs` para conferir cobertura contra `reference33/layout.json`, fontes distintas, abertura das 26 UFs no computador/celular e ausência de cortes horizontais.
- Esta entrega serve ao **cabeçalho do modal**. Não substituir automaticamente as texturas do tabuleiro por esses panoramas; o desenho das casas do tabuleiro continua um trabalho próprio de composição e integração.

Sincronização desta entrega: arte e formatação em R$ registradas em `2c17e50`, atualizadas com a base da engenharia `97c9d54` em `f0b2148`. O contrato de apresentação responde ao pedido C6; a montagem do diálogo, temporizador, recusa/confirmacão e comandos continuam pendentes da engenharia. Os demais pedidos C1–C5 não foram atendidos por este commit de modal e não devem ser marcados como concluídos por causa desta entrega.

## Como manter este arquivo

- **Codex:** sempre que uma entrega exigir ação do Claude, atualizar este MD antes de encerrar a entrega. Registrar o que fazer, dependências, arquivos, contrato e validação. Manter um único arquivo, sem criar um MD por alteração.
- **Claude:** ler este arquivo e o [contrato compartilhado](11-contratos-claude-codex.md) antes de integrar arte. Atualizar os estados das tarefas depois de executar e verificar. Não marcar como concluído apenas porque o código foi escrito.
- Distinguir **arte pronta**, **integração pendente** e **integração validada**. Uma prévia visual não comprova regras, multiplayer ou posicionamento em partida real.
- Decisões recentes explícitas do usuário prevalecem sobre descrições históricas. Não reintroduzir versões antigas para resolver conflitos.
- Preservar alterações locais, trabalhar na própria branch/worktree e não fazer merge/publicação automaticamente. Não executar operações pagas do Meshy.

## Estado conferido

| Item | Estado |
|---|---|
| Base de engenharia incorporada | Commit `7f002d5`: Taxa/Aeroporto, contrato ampliado de áreas e retirada dos controles de câmera já implementados |
| Catálogo desse commit | Ainda tem **36 casas, 27 UFs e 4 Eventos**; não atende à decisão posterior de 33 casas |
| Decisão posterior do usuário | **33 casas da imagem**, 26 UFs, **sem Tocantins**, dois Eventos; Claude adapta o motor |
| Protótipo das 33 casas | Geometria independente, posições, seleção e câmera preparados; aparência atual usa a referência diretamente |
| Arte final recriada | **Pendente do Codex:** criar/substituir texturas, ilustrações e demais assets derivados diretamente das imagens de referência |
| Integração ao jogo conectado | **Pendente**; a prévia de arte não substitui automaticamente a cena do jogo |
| Compartilhamento da entrega mais recente | Entrega registrada na `develop_arte_3d` para integração autorizada à `develop`; consultar o histórico Git antes de atualizar a branch de engenharia |

A entrega pode ser lida em `C:\Users\Plust\Projetos\imperio-urbano\.worktrees\meshy-phase-b`. O nome antigo da pasta não muda a branch, que é `develop_arte_3d`. Ao chegar à `develop`, atualizar a branch de engenharia preservando suas alterações locais. Se houver arquivos posteriores ainda não commitados, não presumir que `git pull` os trará. Antes de integrar, conferir o commit disponibilizado pelo usuário; não copiar versões antigas inteiras sobre arquivos de engenharia.

Sincronização desta entrega: protótipo e orientações registrados em `46afea7`; base `7f002d5` incorporada à branch de arte em `3a62bf0`. Validação após combinar os trabalhos: **70 testes e build aprovados**, mais conferência da câmera no navegador com a API atual `clearSelection`. A inspeção considera a visibilidade dos ancestrais das malhas, respeitando a saída/ocultação dos peões do Claude. Isso não conclui a migração lógica para 33 casas nem a criação dos assets próprios, que continuam pendentes conforme as tarefas abaixo.

## P1 — Integrar o tabuleiro definitivo de 33 casas

**Estado: engenharia integrada na `claude/engenharia` (sem commit), arte final pendente do Codex.** Motor, catálogo (33 casas, ids estáveis, cartas por id), partidas antigas e cena de 33 casas no jogo concluídos; pendentes: dados (E25) e HUD em telas largas. Validação: 141 testes do servidor, 67 do frontend e catálogo, build, E2E com dois clientes (3 aprovados, 1 pulado) e captura de partida real com quatro jogadores. Pedidos à arte em [ORIENTACOES-CODEX.md](ORIENTACOES-CODEX.md) (C3, C4).

### 1. Atualizar o percurso e suas referências

Fonte da ordem e das posições visuais: [reference33/layout.json](../apps/web/src/board/reference33/layout.json). A sequência é:

`START → AM → RR → EVENT_NORTH → AP → PA → RO → OLYMPICS → AC → MT → MS → GO → EVENT_EAST → DF → MG → ES → REST → RJ → PR → SP → TAX → RS → SC → PE → PB → AIRPORT → BA → SE → AL → RN → CE → PI → MA`.

- [x] Adaptar `packages/game-data/data/board.json` às 33 posições. Não duplicar UFs. Remover TO do conjunto jogável e os dois Eventos excedentes.
- [x] Conferir catálogo, grupos, validadores e referências ao estado removido. Preservar as imagens-fonte originais; a prancha de artes continua contendo TO como asset não utilizado.
- [x] Adaptar as referências por índice em cartas, movimento, destinos e testes. Exemplos do layout visual: Olimpíadas **7**, DF **13**, Descanso **16**, SP **19**, Taxa **20**, Aeroporto **25**. Preferir resolver destinos por ID, sem espalhar novos números fixos.
- [x] Auditar pressupostos de quatro lados iguais/`tilesPerSide=9`. A composição da referência não deve ser forçada à distribuição uniforme anterior.
- [x] Preservar as regras já aprovadas de Taxa e Aeroporto do commit `7f002d5`; não inventar valores ou efeitos a partir de desenhos. `AIRPORT` é ID visual; pode continuar associado ao tipo funcional `NATIONAL_TRAVEL`.
- [x] Definir compatibilidade de snapshots/partidas antigas de 36 casas. Não reinterpretar silenciosamente os índices de uma partida persistida como posições de 33 casas. Não apagar dados sem instrução do usuário.

### 2. Conectar a cena visual ao jogo

Arquivos fornecidos pela arte:

| Arquivo/API | Uso |
|---|---|
| `apps/web/src/board/reference33/ReferenceBoardScene.tsx` | Cena R3F da nova composição |
| `reference33Layout` / `referenceTileAnchor(id)` | Manifesto e consulta da âncora pelo ID visual |
| `apps/web/public/models/board/reference33-v01.glb` | 33 casas independentes, corpo, moldura e camadas estáticas |
| `apps/web/src/board/camera/fixedCamera.json` | Projeção e pose calibradas; não alterar por turno |
| `assets/board/tabuleiro-brasil-alvo.png` | Fonte visual aprovada, sem modificações |

- [x] Substituir a cena antiga pelo `ReferenceBoardScene` na integração funcional. Ele já fornece o Canvas e a câmera: não criar outro Canvas ou outro controlador de câmera ao redor.
- [x] Mapear `onSelect(visualId)` para o índice lógico correto e passar `selectedId` de volta. Não enviar IDs visuais diretamente ao servidor sem o adaptador de comandos correspondente.
- [x] Injetar peões e construções por `children`, dentro da cena. Adaptar os acessores compartilhados para consumir o mesmo manifesto que as malhas usam.
- [ ] Conectar `diceValues` exclusivamente a `snapshot.lastDice`; sem resultado, passar `null`. Os valores **5/3 da prévia são ilustrativos**, nunca dados de partida. **Pendente (E25):** a partida passa `diceValues={null}` até a animação dos dados ligada ao resultado oficial.
- [x] Preservar conexão, turnos, painel de propriedade, comandos e fluxo de encerramento ao substituir a cena.

O componente de arte não lê stores, não sorteia, não envia comandos e não resolve regras. A integração é responsabilidade da engenharia.

### 3. Usar as âncoras e áreas corretas

- [x] Preservar `tileAnchor(index)` como acesso funcional compartilhado, resolvendo o índice oficial para o ID visual antes da consulta.
- [x] Consumir `x`, `z`, `surfaceY`, `rotationY`, `width`, `depth`, `pawnArea`, `buildingArea` e o polígono real da casa.
- [x] O perfil novo fornece **surfaceY=0,08** e **selectedLift=0**. Não adicionar o antigo deslocamento de seleção de 0,06 nesta composição; a seleção já destaca a arte sem elevar a casa.
- [x] Atualizar `pawnLayout`, movimentos e posicionamento das construções para o novo sistema. Não manter coordenadas ou espaçamentos do tabuleiro anterior.
- [x] Validar um a quatro jogadores na mesma casa, escala/raio dos avatares e construções. As áreas fornecidas são referências geométricas: verificar que as peças realmente cabem no polígono, não apenas no retângulo envolvente.
- [x] Validar saltos, giro dos personagens, chegada e reconexão sem deslocar a câmera.

### 4. Preservar a câmera estática e adaptar o HUD

**Já feito pela engenharia:** `ViewControls` foi removido e a seleção deixou de disparar foco/giro. Não recriar esses controles.

- [x] Usar a câmera calibrada do Codex, que não lê `viewStore` e não reage a mouse, toque, seleção ou turnos.
- [x] Depois da integração, retirar os campos temporários `focusedTile` e `quarterTurns` se não houver mais consumidores. Não restaurar `focusTile`, `rotate` ou `clearFocus` antigos para fazer ferramentas de teste desatualizadas passarem; adaptar os testes às APIs atuais, como `clearSelection`.
- [x] Reposicionar os painéis funcionais para que o HUD não cubra casas importantes. Manter a composição 3:2 inteira, com escala uniforme e margens nas telas que precisarem. **Feito:** em tela larga na horizontal (≥ 640 px), os jogadores ficam numa faixa no topo, a carta do estado e o histórico numa coluna à direita e as ações embaixo; o tabuleiro ocupa só o espaço entre eles (`game-hud-board` em `index.css`, mesma condição de `WIDE_HUD_QUERY` em `GameScreen.tsx`). Abaixo de 1100 px de largura ou 700 px de altura a faixa de jogadores fica compacta. Conferido em 1920×1080, 1536×1024, 1366×768, 1024×768 e 844×390, sem painel sobre casas. Na vertical (celular 390×844, tablet 768×1024) continua como antes: jogadores no topo e o painel da casa abre como folha sobre o tabuleiro, fechando no ×. Solução provisória: quando o Codex ampliar a cena em volta do tabuleiro (ORIENTACOES-CODEX, C5), os painéis passam a ficar sobre as áreas livres da cena e as margens saem.
- [x] Exibir detalhes de propriedade no HUD sem zoom ou aproximação automática.

### 5. Critérios de conclusão

- [x] 33 casas no motor e na cena, 26 UFs únicas e dois Eventos; índices e destinos coerentes.
- [x] Seleção das 33 casas abre os dados corretos; ações chegam ao servidor com os identificadores corretos.
- [x] Peões, construções e destaques acompanham as respectivas casas, sem afundar, flutuar ou sair das áreas.
- [x] Testes do motor, frontend e E2E de dois clientes/reconexão passam com o novo percurso.
- [ ] Câmera continua imóvel com roda, arrasto, pinça, seleção e troca de turno. **Conferido em parte:** pose idêntica à calibrada depois de seleções e trocas de turno na partida real; roda, arrasto e pinça não foram refeitos nesta integração.
- [x] Conferência de screenshot real da partida, sem alterar posições, cores ou enquadramento da arte para acomodar a integração.

Validações do protótipo já executadas: 68 testes e build; 33 cliques na prévia; GLB sem erros/avisos Khronos; comparação de faces e bordas com a referência. Elas **não aprovam a recriação de arte**, que ainda não ocorreu para os elementos projetados, e **não substituem** os testes funcionais da nova integração. Repetir a conferência visual após o Codex entregar os assets próprios.

Ferramentas disponíveis:

```powershell
node scripts/assets/reference33-preview/server.mjs
node scripts/assets/reference33-qa.mjs
```

Prévia independente: `http://127.0.0.1:4183/scripts/assets/reference33-preview/`. A conferência automática usa a porta 4184. Evidências em `assets/3d/reviews/reference33/`.

## P2 — Outras integrações de arte pendentes

Estas são pendências registradas, não uma indicação para misturá-las à migração P1. Executar conforme a ordem de trabalho autorizada pelo usuário e marcar cada integração somente após validar.

| Entrega | Arte disponível | Ação do Claude | Validar |
|---|---|---|---|
| E25 — Dados 3D | `src/dice/DiceVisual.tsx`, `diceOrientation.ts` e GLB de dados | Ligar apresentação/animação ao resultado oficial e controlar repetição/fila | Valores finais corretos, nulos ocultos, reconexão e movimento reduzido; nunca usar os pares fixos das demos |
| E26 — Anúncio olímpico | `src/olympics/OlympicCallout.tsx` e CSS | Disparar pelo evento oficial, ancorar à sede e deduplicar | Sem repetição após reconexão, sem duplicar selo ×N, sem modal central; preferência de movimento reduzido respeitada |
| E27 — Frente das cartas | `src/cards/EventCardVisual.tsx` e CSS | Usar no fluxo existente de `CardReveal`, passando `card` e `who` | Texto oficial, revelação/fechamento preservados e anúncio acessível sem duplicação |

Os caminhos `src/...` desta tabela são relativos a `apps/web/`. Detalhes das interfaces permanecem no [contrato compartilhado](11-contratos-claude-codex.md). A pilha de cartas não deve ser recolocada sobre o centro aprovado sem decisão visual do usuário.

## Ao terminar uma tarefa

Registrar aqui: estado final, commit/branch quando disponíveis, testes executados e impedimentos reais. Avisar se a arte precisar fornecer outro dado ou corrigir uma interface. Não alterar a identidade visual, consumir créditos ou fazer merge automaticamente para concluir uma integração.

## Retorno C1/C2 — 04/11/2026

Branch `develop_arte_3d`, base `6820c84`; documentação sem novo commit. Ver medições e contrato na seção “Respostas técnicas C1/C2” de `ORIENTACOES-CODEX.md`.

- **C2 respondido:** sequência, IDs e índices congelados; formato e significado das âncoras/polígonos preservados. Manter testes contra o catálogo e compensações de ocupação do C3.
- **C1 parcial:** pivô central; apoio em Y=-0,505 nas poses atuais. Usar `diceValues={null}` e `children`, sem Canvas adicional; yaw externo e face oficial interna, sem duplicar a orientação. Manter sombras compartilhadas existentes.
- **Bloqueio encontrado:** projeção dos vértices reais em repouso excede o rodapé de 1024 px em aproximadamente 11 e 17 px. O espaçamento também não garante giros livres simultâneos. Aguardar correção de enquadramento e área segura pelo Codex antes de fechar trajetórias da E25; não alterar câmera nem duplicar poses no controlador.
- 11 testes existentes aprovados de dados, manifesto e ocupação. Sem validação conectada ou visual nova; C1 não está concluído.

### C1 — atualização que substitui o bloqueio de enquadramento acima

Dados redimensionados para 0,34 e reposicionados; yaw, apoio e câmera preservados. Poses finais em `reference33Layout.dice`; novo `diceRoll` publica limites por centro para giros livres, apoio Y=-0,505, deslocamento de até 0,03 em X/Z e salto adicional 0,03. **Engenharia:** consumir os limites do manifesto. Girar apenas dentro de `centerBounds`; concluir face oficial e yaw, centralizar X/Z, depois descer à pose de repouso sem continuar giros. Ver contrato em `11-contratos-claude-codex.md`. Não copiar coordenadas nem criar outro Canvas.

O novo teste geométrico cobre qualquer orientação pelo limite conservador da esfera, margem de quadro, moldura, decoração e separação da dupla. A implementação da trajetória, resultado oficial, reconexão, movimento reduzido e testes conectados continuam com Claude. A área permite animação curta na faixa disponível, não um lançamento amplo pela mesa.

Validação final C1: 70 testes, TypeScript e build aprovados; prévia no navegador aprovada com 33 cliques e câmera invariável. Capturas 1536×1024 e 390×844 atualizadas e inspecionadas, sem corte da dupla. Os dados ficam pequenos no celular por respeitarem a composição fixa; C5 continua aberto. Sem novo commit/merge nesta revisão.

## Retorno C3 — escala e áreas de ocupação (04/11/2026)

**Decisão da arte: manter escala 0,75 e a distribuição compacta atual.** `pawnArea`/`buildingArea` continuam retângulos locais de referência; `polygon` é o limite real. Não mudar centros nem encolher retângulos para fazer caber seus cantos: isso altera faixa do dono e miniaturas e não resolve o encobrimento dos corpos.

QA novo em `scripts/assets/occupancy-qa.mjs` / `inspect-occupancy.ts`; relatório e 11 capturas em `assets/3d/reviews/occupancy/`. Tela real, snapshots sintéticos, cinco avatares, AM/ES/CE/DF/PI, quatro casas e hotel, computador/celular; sem backend. Os 9 testes existentes de layout e distribuição passaram nas 33 casas. As construções renderizadas amostradas também ficam dentro do contorno, incluindo detalhes que não estão nas caixas nominais (folga mínima ≈0,05785).

**Ressalvas:** quatro corpos se encobrem na perspectiva; a altura dos personagens no celular é só 13–17,5 px (no computador, 40–56 px). Poses amostradas de idle têm projeção horizontal de braços/corpo até ≈0,05 unidade além do polígono, embora as bases caibam. Não marcar corpo inteiro, legibilidade do grupo, ciclo completo de idle ou saltos como aprovados pelo teste de bases. Não aumentar escala nem reduzir para esconder o problema; rever leitura do grupo junto à composição C5. Não há mudança funcional necessária para consumir a decisão C3.

**Achado adicional para a engenharia:** a faixa do dono em `Pieces.tsx` aparece branca também em propriedades livres, pois é desenhada com `ownerId=null` e cor reserva `#ffffff`. Conferir se deve ser omitida enquanto não há dono; a arte não modificou o fluxo nem o componente nesta revisão. C3 respondido com ressalvas, aguardando conferência. Sem novo commit/merge.


## Retorno C4 — cena antiga preservada (04/11/2026)

**Decisão: manter a cena antiga como referência histórica**, sem montá-la na partida e sem retirar o trecho legado de `layout.ts` nesta etapa. Branch `develop_arte_3d`, base `6820c84`, sem novo commit/merge. Aviso incluído em `BoardScene.tsx`; arquitetura atualizada para `GameBoard → ReferenceBoardScene`.

A lista original de arquivos antigos contém dependências compartilhadas: a mesa atual usa `WoodenTableScene → illustratedBoard.ts → art/stateArtwork`; o destaque olímpico atual usa o tipo `TilePlacement` de `layout.ts`. Não apagar esses arquivos/tipos numa limpeza em bloco. A prévia histórica `scripts/assets/map-preview` também importa `Tile`, `BoardCenter`, `CenterInfo` e `boardArt`, mas ainda cita o campo removido `board.tilesPerSide`; não tratá-la como validação funcional da cena atual.

Nenhuma ação de remoção necessária para Claude nesta entrega. Antes de eventual limpeza futura, separar carregamento da mesa/tipo olímpico, decidir o destino das prévias e revisar consumidores. Inventário detalhado no C4 de `ORIENTACOES-CODEX.md`. Validação por busca de dependências e conferência do caminho ativo; sem mudanças de comportamento ou nova validação visual.


## Entrega C5 — mesa ampliada e encaixes de HUD (04/11/2026)

Arte em `board/surroundings/BoardSurroundings.tsx`, estilos próprios e `surroundings.json`. `surroundingsLayout` retorna retângulo do tabuleiro e áreas livres dos três slots em pixels CSS; `boardPixelToViewport` transforma os pixels nativos das casas para o espaço do viewport. O manifesto publica os retângulos completos para 1536×1024 e 390×844; detalhes no C5 de `ORIENTACOES-CODEX.md` e no contrato compartilhado.

**Ações da engenharia:**

- Montar `<BoardSurroundings top={painelSuperior} side={cartaEHistorico} bottom={barraETurno}><GameBoard/></BoardSurroundings>` na tela da partida. O componente visual não acessa stores nem envia comandos.
- Substituir as margens `--hud-*` e os hosts absolutos anteriores; não aplicar duas vezes o recuo. Painéis ficam nos slots. `side` é direita na horizontal e abaixo do tabuleiro na vertical, com rolagem interna e máximo de 45% da altura. Manter o temporizador oficial e fluxo de ações.
- Organizar menu e jogadores dentro da área superior, incluindo foco/volta ao menu. A prévia contém os painéis e ações reais, mas não monta o menu nem valida seu encaixe. Revalidar a composição completa ao integrar.
- Usar os retângulos publicados para conferir que painéis não cruzam casas/moldura; preservar relação 3:2 do Canvas e escala uniforme. Não alterar câmera, GLB, catálogo, ordem ou âncoras.
- Em telas baixas e no celular, a barra inferior recebe reserva maior que o rascunho inicial para caber prazo e controles sem corte. Valores são do manifesto, não duplicar números no host.
- Não mudar dados C1: poses e envelope em mundo permanecem. E25 continua uma integração separada. A madeira do entorno é CSS original; o tabuleiro ainda usa o protótipo visual anterior.

Prévia `scripts/assets/surroundings-preview`, verificação `scripts/assets/surroundings-qa.mjs`, capturas/relatório `assets/3d/reviews/surroundings/`. Snapshot e envio mockados; não considerar multiplayer, reconexão, menu, modal C6 ou integração ao `GameScreen` concluídos. Branch `develop_arte_3d`, sem novo commit/merge.


**Validação da entrega C5:** 10 testes de áreas/manifesto aprovados; prévia em oito viewports, 33 cliques, câmera invariável, temporizador e Rolar sem corte, envio mockado preservado, fechamento e rolagem da carta. Relatório final sem erros/chamadas de API. A cena em 844×390 fica pequena devido às reservas; C3 continua com ressalva de legibilidade. A integração completa, menu e fluxos conectados continuam pendentes da engenharia.

Validação final dos assets: três PNGs com transparência real conferida e hashes registrados; 3 testes geométricos aprovados; TypeScript do frontend sem erros. Prévia no navegador: valores das 26 placas corretos nos quatro cenários, texto dentro das placas, 26 cliques atravessando a camada, botão demonstrativo separado da arte e sem chamadas de API/erros. Capturas do tabuleiro e controles inspecionadas. Em 390 px, a fonte da placa norte mede aproximadamente 3,46 px: **leitura móvel não aprovada** e registrada como pendência de apresentação/consulta na integração. Não declarar que a aprovação do encaixe prova legibilidade em tela pequena.

Detalhe de integração: o seletor também confere os tipos visuais (com `NATIONAL_TRAVEL → AIRPORT`). O manifesto novo usa `SAQUE`; se a engenharia escolher outro nome lógico, registrar o mapeamento explícito e seu teste, sem relaxar a conferência de tipos/IDs. Capturas com quatro peças demonstram ocupação, mas peões e construções podem encobrir partes da impressão, inclusive o preço: a consulta completa continua no modal. Não considerar legibilidade permanente dos textos sob peças ou desempenho em celular físico aprovados pelos testes de encaixe.
