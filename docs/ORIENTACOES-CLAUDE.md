# Orientações e pendências para o Claude Code

Atualizado em 02/11/2026. Este é o ponto único de passagem de trabalho entre arte (Codex) e engenharia (Claude).

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
