# 03 — Modelo de domínio e fluxo de turnos

Tipos de referência: `packages/shared-types/src` (`catalog.ts`, `game.ts`, `protocol.ts`).

## Entidades

| Entidade | Campos principais | Origem |
|---|---|---|
| `StateDefinition` | id/sigla, nome, região, grupo, preço, tabela de aluguel, custo casa/hotel | estático (`states.json`) |
| `TileDefinition` | índice, tipo, `stateId?` | estático (`board.json`) |
| `RulesConfig` | créditos iniciais, bônus do Início, dados, construção, Olimpíadas, modos | estático (`rules.json`) |
| `Game` | id, código de convite, modo, status, versão, rodada, jogador da vez, fase | dinâmico |
| `PlayerState` | id, apelido, avatar, cor, assento, saldo, posição, pronto, conectado, falido, turnos a pular | dinâmico |
| `PropertyState` | `stateId`, dono, `buildingLevel` (0–5), `ownerVisits`, `levelReachedAtVisit` | dinâmico |
| `OlympicsState` | edição, estado-sede, jogador responsável, multiplicador | dinâmico |
| `GameEvent` | sequência, tipo, payload, timestamp | log persistido |

`buildingLevel`: 0–3 casas (etapa 1), 4 = quarta casa (etapa 2), 5 = hotel (etapa 3).

**Aluguel** = `rent[level] × (sede ? multiplicador : 1)` (× `fullGroupBaseRentMultiplier` se nível 0 e grupo completo).

## Estados da partida

```
LOBBY ──START_GAME (2–4 prontos, chamado pelo anfitrião)──▶ IN_PROGRESS ──vitória──▶ FINISHED
```

## Fases do turno

```
            ┌──────────────── dupla (≤2) ─────────────────┐
            ▼                                             │
     AWAITING_ROLL ──ROLL_DICE──▶ [move + bônus Início] ──▶ resolve casa
        │ (skipTurns>0 → pula, exceto dupla)                │
        │ (Viagem pendente → AWAITING_TRAVEL_DESTINATION)   │
        ▼                                                   ▼
  ┌───────────────────────────── resolução da casa ───────────────────────────────┐
  │ Estado livre ............ AWAITING_PURCHASE (BUY_PROPERTY{0..3} | DECLINE)     │
  │ Estado próprio .......... ownerVisits++ → AWAITING_BUILD se houver etapa       │
  │                            disponível (BUILD | BUILD_HOTEL | SKIP_BUILD)       │
  │ Estado de adversário .... RENT_PAID automático (saldo insuficiente → DEBT)     │
  │ Olimpíadas .............. AWAITING_OLYMPICS_HOST se possui estado e saldo ≥ 50 │
  │ Eventos ................. EVENT_CARD_DRAWN → aplica efeito (pode encadear)     │
  │ Descanso ................ skipTurns = 1                                        │
  │ Viagem Nacional ......... marca viagem para o próximo turno                    │
  │ Início / Visita ......... nada                                                 │
  └────────────────────────────────────────────────────────────────────────────────┘
                                       │
         AWAITING_DEBT_RESOLUTION ◀────┤ (SELL_BUILDING | SELL_PROPERTY | DECLARE_BANKRUPTCY)
                                       ▼
                               AWAITING_END_TURN ──END_TURN──▶ próximo jogador ativo
                                                               (fim de rodada → checa modo Rápido)
```

## Validações do servidor (todo comando)

1. Sessão válida e jogador pertence à partida.
2. `commandId` não processado (senão devolve o mesmo resultado).
3. `expectedVersion` = versão atual (senão rejeita e reenvia snapshot).
4. É o turno do jogador e o comando é permitido na `phase` atual.
5. Regra específica: saldo, disponibilidade, etapa de construção, posse da sede etc.

Vitória: Clássico → resta 1 jogador não falido. Rápido → ao fim da 15ª rodada, maior patrimônio (D14).
