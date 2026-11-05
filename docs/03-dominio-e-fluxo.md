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
  │ Estado livre ............ AWAITING_PURCHASE se o saldo cobre o preço          │
  │                            (BUY_PROPERTY{0..3} | DECLINE_PURCHASE)             │
  │ Estado próprio .......... ownerVisits++ → AWAITING_BUILD se houver etapa       │
  │                            disponível (BUILD | BUILD_HOTEL | SKIP_BUILD)       │
  │ Estado de adversário .... RENT_PAID automático (saldo insuficiente → DEBT)     │
  │ Olimpíadas .............. AWAITING_OLYMPICS_HOST se possui estado e saldo ≥ 50 │
  │ Eventos ................. EVENT_CARD_DRAWN → aplica efeito (pode encadear)     │
  │ Descanso ................ skipTurns = rules.rest.turnsLost (também via carta/3ª dupla) │
  │ Aeroporto (Viagem Nac.) . travelPending; próximo turno abre AWAITING_TRAVEL_DESTINATION │
  │ Taxa .................... CREDITS_TO_BANK rules.tax.amount (sem saldo → DEBT)  │
  │ Início .................. nada                                                 │
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

Construção (D4): a compra conta como 1ª visita e permite até 3 casas; em qualquer visita do dono a 1ª etapa (até 3 casas) pode ser completada; a 4ª casa exige uma visita posterior àquela em que chegou a 3; o hotel, uma visita posterior à 4ª casa. Só parar na casa conta como visita; visitas de adversários não contam. A fase AWAITING_BUILD só abre se houver construção permitida e pagável.

Olimpíadas (D6–D7): ao parar na casa, quem possui ao menos um estado e tem saldo para a taxa (50) escolhe a sede. Cada edição avança o multiplicador (×2, ×3 … ×10, depois fica em ×10), que se aplica ao aluguel total da sede, inclusive construções. A sede anterior perde o benefício; reescolher a mesma sede também avança a edição.

Descanso (D2): no turno seguinte o jogador rola; sem dupla perde a jogada (`REST_TURN_LOST`), com dupla sai e anda normalmente, sem jogada extra (`REST_LEFT`). Continua recebendo aluguéis.

Viagem Nacional (D3): no turno seguinte, se tiver saldo para a taxa (50), escolhe qualquer outra casa (`CHOOSE_TRAVEL`) e viaja no sentido do percurso, recebendo o bônus se passar pelo Início; a casa de destino é resolvida normalmente. Rolar os dados recusa a viagem.

Ritmo do turno (D21): quando não resta decisão (fase `AWAITING_END_TURN`), o servidor passa a vez sozinho — por isso comprar encerra o turno. Prazos por fase (`TurnTimeouts`): rolar ou escolher viagem (10 s) → `ROLL_DICE`; comprar (15 s) → `DECLINE_PURCHASE`; construir → `SKIP_BUILD`; Olimpíadas → `SKIP_OLYMPICS`; dívida (10 s, `debtSeconds`) → vendas seguidas no mesmo prazo, do bem mais barato ao mais caro (as construções de um estado antes dele), até quitar ou falir sem nada a vender. O prazo pertence à versão do estado (qualquer ação reinicia; reconectar não) e o snapshot leva `turnTimeLeftMs`. Jogador da vez desconectado: modo automático (`turnTimers.automaticSeconds`), com as mesmas ações padrão e, na dívida, a mesma venda do bem mais barato ao mais caro (uma venda por jogada), com falência só sem nada a vender.

Duplas (D9): dupla dá nova jogada (`TURN_ENDED` com o mesmo jogador); a 3ª dupla seguida (`rules.dice.maxDoublesInRow`) leva direto ao Descanso, sem bônus do Início, e encerra a sequência.

Implementação: `apps/api/.../engine/GameEngine` — `decide(state, jogador, comando, dados) → eventos` e `apply(state, evento) → state`; `replay(log)` reconstrói a partida.

Eventos (D13): `packages/game-data/data/events.json` traz 16 cartas originais (ganhar, pagar, reforma por construção, aniversário, mover para uma casa — indicada pelo id dela, como `SP` ou `OLYMPICS` —, andar ±3, ir ao Descanso). O baralho é embaralhado uma vez no `GAME_STARTED` e recomeça na mesma ordem ao acabar; a ordem é informação oculta e não vai no snapshot. Pagamento sem saldo vira dívida com o banco. Movimentos de carta resolvem a nova casa (aluguel, compra, Olimpíadas, outra carta — até 3 encadeamentos).

Dívida e falência (D10–D11): vender ao banco só é permitido com dívida pendente (`AWAITING_DEBT_RESOLUTION`): uma casa/hotel (50% do custo; o hotel volta a 4 casas) ou um estado (50% do preço + 50% do investido). A dívida é quitada automaticamente assim que o saldo cobre. Fora disso o servidor recusa: "Só é possível vender ao banco para pagar uma dívida." Sem saída, declara falência: saldo e estados (com construções, visitas reiniciadas) vão ao credor; se o credor for o banco, os estados voltam livres. Sede olímpica do falido ou vendida perde o marcador (D8).

Abandono: partida em andamento sem ninguém conectado por `rules.abandonment.seconds` (120 s) termina com `GAME_ABANDONED`, sem vencedor. Quem volta antes cancela o encerramento.

Vitória: Clássico → resta 1 jogador não falido. Rápido → ao fim da 15ª rodada, maior patrimônio (D14).
