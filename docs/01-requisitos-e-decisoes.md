# 01 — Análise de requisitos e decisões pendentes

Status das decisões: **PROPOSTA** = valor adotado provisoriamente nos dados/código, aguardando confirmação.
Tudo que é número está em `packages/game-data/data/*.json`, não no código.

## 1. Distribuição do tabuleiro (calculada)

**36 casas, 9 por lado** (4 cantos + 32 laterais = 27 estados + 5 especiais laterais).

| Opção | Casas | Especiais laterais | Volta média (2d6 ≈ 7) |
|---|---|---|---|
| 32 | 8/lado | 1 | ~4,6 turnos — sem espaço para eventos |
| **36 (escolhida)** | 9/lado | 5 | ~5,1 turnos |
| 40 | 10/lado | 9 | ~5,7 turnos — mais casas vazias, menos revisitas |

36 favorece a mecânica de construção por visitas (o jogador volta mais vezes aos próprios estados) e dá casas maiores para a arte.

| Lado | Casas | Grupos (preço) |
|---|---|---|
| 0 | **Início** | — |
| 1–8 | AC RR AP · *Eventos* · RO TO AM PA | Norte I (100–120), Norte II (135–170) |
| 9 | **Descanso** | — |
| 10–17 | PI MA SE · *Eventos* · AL PB RN CE | Nordeste I (185–205), Nordeste II (215–250) |
| 18 | **Olimpíadas** | — |
| 19–26 | PE BA · *Eventos* · MS MT GO DF · *Visita* | Nordeste III (265–280), Centro-Oeste (295–340) |
| 27 | **Viagem Nacional** | — |
| 28–35 | SC PR RS · *Eventos* · ES MG RJ SP | Sul (355–385), Sudeste (400–500) |

- 8 grupos de cor seguindo as regiões geográficas; Nordeste (9 UFs) dividido em 3 grupos.
- 27 preços distintos entre 100 e 500, crescentes no sentido do percurso.
- Validação automática (`packages/game-data/src/catalog.test.ts`): sem UF ausente/duplicada, preços únicos, cada UF exatamente uma vez no tabuleiro, todas as casas especiais presentes.

## 2. Balanceamento inicial (PROPOSTA)

Derivado do preço `P`, arredondado para múltiplos de 5, e gravado explicitamente em `states.json` (editável estado a estado):

| Item | Fórmula | AC (100) | SP (500) |
|---|---|---|---|
| Aluguel base | 0,10 P | 10 | 50 |
| 1 / 2 / 3 casas | 0,40 / 0,90 / 1,60 P | 40 / 90 / 160 | 200 / 450 / 800 |
| 4 casas | 2,20 P | 220 | 1100 |
| Hotel | 3,00 P | 300 | 1500 |
| Custo por casa | 0,50 P | 50 | 250 |
| Custo do hotel | 1,00 P | 100 | 500 |

Patrimônio (modo Rápido) = saldo + preço dos estados + valor investido em construções.

## 3. Inconsistências e lacunas encontradas

| # | Tema | Problema | Proposta |
|---|---|---|---|
| D1 | **Visita** | Não há regra; sem prisão, "visita" não tem significado. | Casa neutra (nada acontece). Pode virar destino de cartas. |
| D2 | **Descanso** | Efeito não definido. | Canto: jogador perde a próxima jogada, mas continua recebendo aluguéis. Sai antes se tirar dupla. |
| D3 | **Viagem Nacional** | Efeito não definido. | No turno seguinte, em vez de rolar, escolhe qualquer casa e viaja até ela pagando 50 (recebe 200 se passar pelo Início). Pode recusar e rolar normalmente. |
| D4 | **Construção por visitas** | "Primeira visita" e "completar até três casas" se sobrepõem: comprar e voltar depois sem ter 3 casas conta como 2ª visita? | Regra por **etapa**, no máximo uma etapa por visita: etapa 1 (0–3 casas) pode ser completada em qualquer visita do dono; 4ª casa exige uma visita posterior àquela em que chegou a 3; hotel exige visita posterior à 4ª casa. A compra conta como 1ª visita. Só conta **parar** na casa (passar não conta). |
| D5 | **Grupos de cor** | Construção não exige o grupo completo → cor fica só decorativa. | MVP: decorativa. Opção configurável `fullGroupBaseRentMultiplier` (ex.: ×2 no aluguel sem construção com grupo completo), hoje 1. |
| D6 | **Olimpíadas sem estados** | Jogador sem propriedades não tem o que escolher. | Opção indisponível; não paga a taxa. |
| D7 | **Multiplicador olímpico** | Aplica sobre aluguel base ou total? Após ×10? | Multiplica o aluguel total (com construções). Após a 9ª edição permanece ×10. Mesma sede pode ser reescolhida (sobe a edição). |
| D8 | **Sede olímpica e posse** | O que acontece se a sede for negociada ou o dono falir? | Marcador é removido; a próxima edição continua a contagem. |
| D9 | **Duplas nos dados** | Não definido. | Dupla dá nova jogada; 3ª dupla seguida manda para Descanso. |
| D10 | **Dívida sem saldo** | Não há hipoteca nem venda definida. | Antes da falência o jogador pode vender construções ao banco (50% do custo) e estados ao banco (50% do preço). Sem hipoteca no MVP. |
| D11 | **Falência** | Para quem vão os bens? | Dívida com jogador: estados (com construções) vão ao credor. Dívida com banco: estados voltam livres ao banco. |
| D12 | **Negociação** | Escopo indefinido. | Troca de estados + créditos entre dois jogadores, no turno de quem propõe; construções acompanham o estado; contadores de visita são reiniciados para o novo dono (começa na etapa em que o estado está). |
| D13 | **Cartas de eventos** | Conteúdo não definido. | Baralho de 16 cartas originais (ganhar/pagar, mover, ir para Descanso, viagem grátis), embaralhado pelo servidor. Lista em entrega própria. |
| D14 | **Modo Rápido** | Empate de patrimônio. | Desempate por saldo; persistindo, empate declarado. "Rodada completa" = todos os jogadores ativos jogaram. |
| D15 | **Contas de usuário** | Spring Security exigido, mas cadastro não foi pedido. | MVP com **convidado**: apelido → token de sessão opaco (guardado no navegador) usado para reconectar. Sem senha. Contas reais depois. |
| D16 | **Primeiro marco vs. servidor autoritativo** | O marco 1 é só frontend, mas o frontend não pode decidir dados. | Marco 1 é uma **demo visual local** (rolagem fake isolada em `apps/web/src/dev`). Removida quando o WebSocket entrar. |
| D17 | **Mapa do Brasil nas cartas** | Exige contorno das 27 UFs. | Usar malhas do IBGE (dados públicos) simplificadas para SVG próprio; nada de arte de terceiros. |
| D18 | **Tipos compartilhados Java × TS** | `shared-types` não é consumível pelo Java. | JSON de `game-data` é a fonte única para ambos. DTOs Java escritos à mão, protegidos por teste de contrato com snapshots JSON de exemplo. Gerar por JSON Schema só se a duplicação doer. |
| D19 | **Ambiente** | Docker, Maven e pnpm não estão instalados nesta máquina. | npm workspaces (sem pnpm); Maven Wrapper (`mvnw`) no `apps/api`; Docker Desktop necessário a partir da entrega do backend (PostgreSQL/Testcontainers). |
| D21 | **Ritmo do turno** (pedido do usuário) | Jogador parado trava a partida. | Prazos no servidor (`rules.turnTimers`): 10 s para rolar/escolher a viagem → rola sozinho; 15 s para comprar/construir/sediar → recusa. Sem decisão restante, a vez passa sozinha (inclusive logo após comprar). Dívida não tem prazo para quem está conectado. Jogador desconectado entra no **modo automático** (a cada 2 s o servidor joga a ação padrão; na dívida, vende construção → estado → falência) até voltar; com ninguém conectado a partida pausa e, se ninguém voltar em 2 minutos (`rules.abandonment.seconds`), é encerrada sem vencedor. A câmera não se move sozinha. |
| D20 | **Ações no turno** | Construir só é possível ao parar no estado? | Sim: compra/construção só no estado onde o peão parou. Negociação e venda podem ocorrer em qualquer momento do próprio turno. |
