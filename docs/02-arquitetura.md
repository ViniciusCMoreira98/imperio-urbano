# 02 — Arquitetura do MVP

Monólito modular. Um servidor Spring Boot autoritativo, um cliente React. Sem microsserviços.

```
 navegador (apps/web)                         servidor (apps/api)
┌─────────────────────────────┐   WebSocket   ┌────────────────────────────────────────┐
│ React UI ─ Zustand store    │ ── comando ─▶ │ realtime ─▶ game (aplicação)            │
│     ▲          ▲            │               │               │  idempotência, versão   │
│ R3F cena   net/ws client    │ ◀─ eventos ── │               ▼                         │
│ (só lê o snapshot)          │   + snapshot  │            engine (Java puro, sem Spring)│
└─────────────────────────────┘               │               │  valida → eventos → apply│
                                              │               ▼                         │
          packages/game-data (JSON) ─────────▶│ catalog    persistence (PostgreSQL)     │
                                              └────────────────────────────────────────┘
```

## Decisões (ADR curtas)

| ADR | Decisão | Motivo |
|---|---|---|
| A1 | Servidor é a única autoridade; o cliente envia **intenções** (`ROLL_DICE`, `BUY_PROPERTY{houses}`) sem valores. | Requisito; evita trapaça. |
| A2 | Motor de regras em Java puro (`engine`), função `decide(state, command) → events` + `apply(state, event) → state`. | Testável sem Spring; reutilizável por bots (um bot é só outro emissor de comandos). |
| A3 | Persistência: log de eventos (`game_events`) + snapshot JSONB a cada comando aceito (`game_snapshots`). Recuperação = último snapshot. | Simples, auditável, permite replay e histórico. Sem event store dedicado. |
| A4 | Idempotência por `commandId` (tabela `processed_commands`) + `expectedVersion` (concorrência otimista). | Requisito; cobre reenvio após reconexão. |
| A5 | WebSocket nativo do Spring (`TextWebSocketHandler`) com envelope JSON, sem STOMP. | Uma conexão por jogador/partida; menos dependências no cliente. |
| A6 | Partidas ativas em memória (um lock por partida), gravadas a cada comando. | 2–4 jogadores, uma instância; escala horizontal fica fora do MVP. |
| A7 | `packages/game-data` (JSON) é a fonte única de catálogo e regras para TS e Java. | Elimina duplicação de valores. Java lê do classpath (copiado no build). |
| A8 | Autenticação de convidado com token opaco (Spring Security, filtro próprio). | Sem cadastro no MVP (D15). |
| A9 | Navegação de telas via estado no Zustand, sem router. | Poucas telas; evita dependência. Reavaliar se surgirem URLs compartilháveis além do código da sala. |
| A10 | Gerenciador: **npm workspaces** (JS) + **Maven Wrapper** (Java). | Já disponíveis na máquina; pnpm não está instalado. |

## Módulos do backend (`apps/api`, pacote `br.imperiourbano`)

| Módulo | Responsabilidade | Depende de |
|---|---|---|
| `catalog` | Carrega e valida `states.json`, `board.json`, `rules.json` no boot. | — |
| `engine` | Estado da partida, comandos, eventos, regras (compra, aluguel, construção, Olimpíadas, eventos, falência, vitória). Dados injetados via interface `Dice`/`Deck` (aleatoriedade controlável em teste). | `catalog` (só tipos) |
| `game` | Caso de uso "executar comando": carrega partida, checa idempotência/versão/turno, chama engine, persiste, publica. | `engine`, `persistence` |
| `lobby` | Criar sala, código de convite (6 caracteres sem ambíguos), entrar, avatar/cor, pronto, iniciar. | `game` |
| `identity` | Sessão de convidado, filtro Spring Security, resolução do jogador no handshake. | — |
| `realtime` | Handler WebSocket, sessões por partida, broadcast de eventos, snapshot no (re)connect, heartbeat. | `game`, `identity` |
| `persistence` | Entidades JPA, repositórios, migrações Flyway. | — |

Sessão de convidado (E15): `POST /api/sessions {nickname}` cria o jogador e devolve `{playerId, nickname, token}` (o token só aparece aí; o banco guarda o hash SHA-256). Demais rotas exigem `Authorization: Bearer <token>`; `GET /api/sessions/me` confere um token guardado. Apelido: 2–20 caracteres (letras, números, espaço, `. _ -`). Em desenvolvimento o Vite repassa `/api` para `localhost:8080`.

Salas (E16), todas com token: `POST /api/games {mode}` cria a sala (o criador é o anfitrião, assento 0); `POST /api/games/join {inviteCode}` entra pelo código de 6 caracteres (sem I, O, 0, 1; maiúsculas ou minúsculas); `GET /api/games/{id}`; `PUT /api/games/{id}/me {avatarId, pawnColor}` (avatares podem repetir, cores não); `PUT /api/games/{id}/me/ready {ready}`; `POST /api/games/{id}/start` (só o anfitrião, 2–4 jogadores todos prontos; ordem de jogo = assentos). Quem não é da sala recebe 404. Alterações travam a linha da partida (`SELECT … FOR UPDATE`) para entradas simultâneas não disputarem assento.

Tempo real (E17): `/ws/games/{gameId}?token=...` (o token vai na URL porque o navegador não envia cabeçalhos no WebSocket). O handshake só aceita membros de partidas já iniciadas. O cliente envia `{commandId, expectedVersion, command}`; `GameService` serializa os comandos da partida, ignora `commandId` repetido (responde só com SNAPSHOT), recusa versão desatualizada e aplica o motor com dados do servidor. Aplicado → `EVENTS` + `SNAPSHOT` para todos; recusado → `COMMAND_REJECTED` + `SNAPSHOT` só para quem enviou. O snapshot público (`SnapshotView`) junta motor + sala (avatar, cor, conectado) e omite o baralho. Origens aceitas: `app.allowed-origins` (padrão: Vite em `localhost:5173`).

Cliente (E18): telas Menu → Sala → Partida em `apps/web/src/screens`, navegação por `appStore`. A sala consulta `GET /api/games/{id}` a cada 1,5 s (ainda sem canal próprio) e passa para a partida quando ela começa. Na partida, `net/gameSocket.ts` mantém o WebSocket (reconexão com espera crescente) e `gameStore` guarda só o que o servidor manda; botões apenas enviam intenções. Sessão e sala atual ficam no `sessionStorage` (uma por aba, sobrevive a recarregar).

Turnos automáticos (D21): `GameService` publica `GameUpdated` a cada mudança; `TurnTimer` (ordem 1) agenda o prazo da nova versão e o `GameSocketHandler` (ordem 2) envia EVENTS + SNAPSHOT com o tempo restante. Quando o prazo acaba, `GameService.timeout` joga a ação padrão pelo jogador da vez, se a versão não mudou. Prazos ficam em memória: após reiniciar o servidor, recomeçam quando alguém reconecta.

Reconexão e retomada (E19):
- Cliente: o WebSocket reconecta sozinho (espera crescente) e também na hora em que a rede volta ou a aba volta a ficar visível. A sessão da aba fica no `sessionStorage`; o último convidado também no `localStorage`, e o menu oferece "Continuar como …" numa aba nova. `GET /api/games/mine` lista as salas e partidas não encerradas do jogador ("Suas partidas" → Voltar).
- Servidor: ao (re)conectar recebe o snapshot do banco; o prazo do turno continua de onde estava (não ganha tempo extra). `Presence` conta conexões por jogador ("conectado" no snapshot); um ping a cada 20 s derruba conexões mortas. Jogador da vez desconectado (fora de `Presence`) entra no modo automático: `TurnTimer` agenda a ação padrão em `automaticSeconds` em vez do prazo inteiro e refaz o agendamento quando ele cai ou volta. Partida sem ninguém conectado fica pausada: o prazo vence sem jogar e recomeça inteiro quando alguém volta. `Presence` publica `Presence.Changed` quando a partida esvazia ou alguém volta; o `AbandonmentWatcher` encerra a partida (`GameService.abandon`) se ninguém voltar em 2 minutos. Ao subir o servidor, as partidas em andamento já começam a contar esse prazo.

Tabelas (Flyway, `apps/api/src/main/resources/db/migration`): `games`, `game_events`, `game_snapshots`, `processed_commands` (E14); `guest_sessions` (E15); `game_players` e `games.host_player_id` (E16); `game_snapshots.board_version` (P1, 33 casas).

`persistence.GameStore` grava, numa transação, os eventos de um comando (`sequence` = versão após o evento), o snapshot resultante e o `commandId`; a versão da partida em `games` faz a concorrência otimista. Eventos e estado viram JSON (`jsonb`) por `GameJson`, que nomeia cada evento como no protocolo TS (ex.: `DICE_ROLLED`) sem anotar o motor. A ordem do baralho fica no snapshot do servidor e não deve ir ao cliente. Cada snapshot leva a versão do tabuleiro (`board.json`): snapshot de outra versão não é carregado nem entra no relógio ou no abandono, e quem conecta recebe `GAME_UNAVAILABLE` ("Esta partida usa o tabuleiro antigo e não pode continuar") em vez do estado; nada é apagado.

## Módulos do frontend (`apps/web/src`)

| Pasta | Conteúdo |
|---|---|
| `app/` | Raiz, troca de telas, layout principal. |
| `screens/` | Início, Criar/Entrar, Seleção de avatar, Regras, Configurações, Resultado. |
| `board/` | Cena R3F: `BoardScene`, `Tile`, `Pawn`, `CameraRig`, `Dice3D`, `Buildings`, layout calculado a partir de `board.json`. |
| `hud/` | Painel de jogadores, painel da propriedade, barra de ações, histórico, painel olímpico. |
| `property-card/` | Carta digital do estado (cabeçalho colorido, paisagem, mapa, tabela). |
| `store/` | Zustand: `gameStore` (snapshot do servidor, somente leitura) e `uiStore` (seleção, câmera, telas). |
| `net/` | Cliente WebSocket, fila de comandos com `commandId`, reconexão com backoff. |
| `animation/` | Timelines GSAP (movimento, construção, anúncio olímpico) disparadas por eventos recebidos. |

Regra de ouro: nenhum componente React calcula aluguel, saldo ou permissão. Botões habilitados vêm de `phase` + dados do snapshot; o servidor valida de novo.

## Testes

| Camada | Ferramenta | Foco |
|---|---|---|
| `engine` | JUnit 5 | Toda regra de negócio, com dados e baralho determinísticos. |
| `game`/`realtime` | JUnit + Testcontainers (PostgreSQL) | Idempotência, versão, reconexão, sincronização entre 2 clientes. |
| `game-data`, stores | Vitest | Consistência do catálogo, redutores do store. |
| E2E | Playwright | Criar sala, entrar com 2 navegadores, jogar um turno. |

Mockito apenas para bordas (relógio, gerador de código), nunca para o motor.
