# Orientações e pendências para o Claude Code

Atualizado em 02/11/2026. Este é o ponto único de passagem de trabalho entre arte (Codex) e engenharia (Claude).

## Atualização prioritária — as imagens são referências para criar arte

O usuário esclareceu que o Codex deve criar a arte tomando as imagens como modelo, sem utilizar as imagens enviadas, recortes ou projeções delas como arte final do produto. A prévia atual de 33 casas usa o PNG diretamente e passa a ser classificada como **protótipo de layout/câmera**. A recriação das artes é pendência do Codex; não é tarefa do Claude.

**Ação do Claude:** pode avançar na migração lógica de 33 casas e na integração dos contratos de IDs/âncoras. Manter a troca dos assets desacoplada da lógica. Não consolidar a projeção atual como acabamento final e não substituir ou redesenhar as artes por conta própria. Conferir a entrega de novos assets do Codex antes de marcar a integração visual como validada. Não é necessário reabrir a decisão já aprovada sobre as 33 casas.

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

**Estado: protótipo geométrico/contratos disponíveis; arte final pendente do Codex; execução da engenharia pendente.** A escolha das 33 casas já foi confirmada pelo usuário; não é necessário perguntar novamente se deve manter 36. A parte lógica pode avançar sem declarar a arte projetada como final.

### 1. Atualizar o percurso e suas referências

Fonte da ordem e das posições visuais: [reference33/layout.json](../apps/web/src/board/reference33/layout.json). A sequência é:

`START → AM → RR → EVENT_NORTH → AP → PA → RO → OLYMPICS → AC → MT → MS → GO → EVENT_EAST → DF → MG → ES → REST → RJ → PR → SP → TAX → RS → SC → PE → PB → AIRPORT → BA → SE → AL → RN → CE → PI → MA`.

- [ ] Adaptar `packages/game-data/data/board.json` às 33 posições. Não duplicar UFs. Remover TO do conjunto jogável e os dois Eventos excedentes.
- [ ] Conferir catálogo, grupos, validadores e referências ao estado removido. Preservar as imagens-fonte originais; a prancha de artes continua contendo TO como asset não utilizado.
- [ ] Adaptar as referências por índice em cartas, movimento, destinos e testes. Exemplos do layout visual: Olimpíadas **7**, DF **13**, Descanso **16**, SP **19**, Taxa **20**, Aeroporto **25**. Preferir resolver destinos por ID, sem espalhar novos números fixos.
- [ ] Auditar pressupostos de quatro lados iguais/`tilesPerSide=9`. A composição da referência não deve ser forçada à distribuição uniforme anterior.
- [ ] Preservar as regras já aprovadas de Taxa e Aeroporto do commit `7f002d5`; não inventar valores ou efeitos a partir de desenhos. `AIRPORT` é ID visual; pode continuar associado ao tipo funcional `NATIONAL_TRAVEL`.
- [ ] Definir compatibilidade de snapshots/partidas antigas de 36 casas. Não reinterpretar silenciosamente os índices de uma partida persistida como posições de 33 casas. Não apagar dados sem instrução do usuário.

### 2. Conectar a cena visual ao jogo

Arquivos fornecidos pela arte:

| Arquivo/API | Uso |
|---|---|
| `apps/web/src/board/reference33/ReferenceBoardScene.tsx` | Cena R3F da nova composição |
| `reference33Layout` / `referenceTileAnchor(id)` | Manifesto e consulta da âncora pelo ID visual |
| `apps/web/public/models/board/reference33-v01.glb` | 33 casas independentes, corpo, moldura e camadas estáticas |
| `apps/web/src/board/camera/fixedCamera.json` | Projeção e pose calibradas; não alterar por turno |
| `assets/board/tabuleiro-brasil-alvo.png` | Fonte visual aprovada, sem modificações |

- [ ] Substituir a cena antiga pelo `ReferenceBoardScene` na integração funcional. Ele já fornece o Canvas e a câmera: não criar outro Canvas ou outro controlador de câmera ao redor.
- [ ] Mapear `onSelect(visualId)` para o índice lógico correto e passar `selectedId` de volta. Não enviar IDs visuais diretamente ao servidor sem o adaptador de comandos correspondente.
- [ ] Injetar peões e construções por `children`, dentro da cena. Adaptar os acessores compartilhados para consumir o mesmo manifesto que as malhas usam.
- [ ] Conectar `diceValues` exclusivamente a `snapshot.lastDice`; sem resultado, passar `null`. Os valores **5/3 da prévia são ilustrativos**, nunca dados de partida.
- [ ] Preservar conexão, turnos, painel de propriedade, comandos e fluxo de encerramento ao substituir a cena.

O componente de arte não lê stores, não sorteia, não envia comandos e não resolve regras. A integração é responsabilidade da engenharia.

### 3. Usar as âncoras e áreas corretas

- [ ] Preservar `tileAnchor(index)` como acesso funcional compartilhado, resolvendo o índice oficial para o ID visual antes da consulta.
- [ ] Consumir `x`, `z`, `surfaceY`, `rotationY`, `width`, `depth`, `pawnArea`, `buildingArea` e o polígono real da casa.
- [ ] O perfil novo fornece **surfaceY=0,08** e **selectedLift=0**. Não adicionar o antigo deslocamento de seleção de 0,06 nesta composição; a seleção já destaca a arte sem elevar a casa.
- [ ] Atualizar `pawnLayout`, movimentos e posicionamento das construções para o novo sistema. Não manter coordenadas ou espaçamentos do tabuleiro anterior.
- [ ] Validar um a quatro jogadores na mesma casa, escala/raio dos avatares e construções. As áreas fornecidas são referências geométricas: verificar que as peças realmente cabem no polígono, não apenas no retângulo envolvente.
- [ ] Validar saltos, giro dos personagens, chegada e reconexão sem deslocar a câmera.

### 4. Preservar a câmera estática e adaptar o HUD

**Já feito pela engenharia:** `ViewControls` foi removido e a seleção deixou de disparar foco/giro. Não recriar esses controles.

- [ ] Usar a câmera calibrada do Codex, que não lê `viewStore` e não reage a mouse, toque, seleção ou turnos.
- [ ] Depois da integração, retirar os campos temporários `focusedTile` e `quarterTurns` se não houver mais consumidores. Não restaurar `focusTile`, `rotate` ou `clearFocus` antigos para fazer ferramentas de teste desatualizadas passarem; adaptar os testes às APIs atuais, como `clearSelection`.
- [ ] Reposicionar os painéis funcionais para que o HUD não cubra casas importantes. Manter a composição 3:2 inteira, com escala uniforme e margens nas telas que precisarem.
- [ ] Exibir detalhes de propriedade no HUD sem zoom ou aproximação automática.

### 5. Critérios de conclusão

- [ ] 33 casas no motor e na cena, 26 UFs únicas e dois Eventos; índices e destinos coerentes.
- [ ] Seleção das 33 casas abre os dados corretos; ações chegam ao servidor com os identificadores corretos.
- [ ] Peões, construções e destaques acompanham as respectivas casas, sem afundar, flutuar ou sair das áreas.
- [ ] Testes do motor, frontend e E2E de dois clientes/reconexão passam com o novo percurso.
- [ ] Câmera continua imóvel com roda, arrasto, pinça, seleção e troca de turno.
- [ ] Conferência de screenshot real da partida, sem alterar posições, cores ou enquadramento da arte para acomodar a integração.

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
