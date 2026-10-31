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

Tabelas iniciais: `guest_sessions`, `games`, `game_players`, `game_events`, `game_snapshots`, `processed_commands`.

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
