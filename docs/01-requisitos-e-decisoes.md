# 01 — Análise de requisitos e decisões pendentes

Status das decisões: **PROPOSTA** = valor adotado provisoriamente nos dados/código, aguardando confirmação.
Tudo que é número está em `packages/game-data/data/*.json`, não no código.

## 1. Distribuição do tabuleiro (calculada)

**34 casas** (D25, 2026-11-04; antes D24 com 33): as casas da arte `assets/board/tabuleiro-brasil-alvo.png` com o RN movido para antes do AM e a casa **Saque** no lugar antigo do RN — 26 UFs (**sem Tocantins**), dois Eventos e Início, Olimpíadas, Descanso, Taxa, Aeroporto e Saque. Os lados têm tamanhos diferentes (8, 9, 9 e 7 casas entre os cantos), como na arte; o motor só usa o total de casas. A versão anterior, de 36 casas e 9 por lado (27 UFs, quatro Eventos), foi substituída.

Percurso definitivo, sentido horário. Cada casa tem um **id estável** (`board.json`): a sigla nos estados e o id da arte nas especiais. As cartas apontam destinos por esse id, nunca pelo número.

| Índice | Casas |
|---|---|
| 0 | **Início** (`START`) |
| 1–7 | RN AM RR · *Eventos* (`EVENT_NORTH`) · AP PA RO |
| 8 | **Olimpíadas** (`OLYMPICS`) |
| 9–16 | AC MT MS GO · *Eventos* (`EVENT_EAST`) · DF MG ES |
| 17 | **Descanso** (`REST`) |
| 18–25 | RJ PR SP · *Taxa* (`TAX`) · RS SC PE PB |
| 26 | **Aeroporto** (`AIRPORT`; regra da Viagem Nacional, D3) |
| 27–33 | BA SE AL · **Saque** (`SAQUE`) · CE PI MA |

- 8 grupos de cor seguindo as regiões geográficas; Nordeste (9 UFs) dividido em 3 grupos. Sem Tocantins, o Norte II fica com RO, AM e PA.
- Preços que **nunca diminuem ao longo do percurso** (vizinhos podem repetir): a casa 1 (RN) é a mais barata e a 33 (MA) a mais cara. Terreno de 60 a 350 (decisão do usuário em 08/11/2026).
- A ordem e os ids seguem o manifesto da arte (`apps/web/src/board/reference33/layout.json`); um teste confere índice, id e tipo das casas (o manifesto de 34 casas depende da recalibração do Codex).
- Validação automática (`packages/game-data/src/catalog.test.ts`): sem UF ausente/duplicada, preços que não diminuem ao longo do tabuleiro, cada UF exatamente uma vez no tabuleiro, ids únicos, todas as casas especiais presentes.
- Partidas salvas no tabuleiro anterior ficam guardadas, mas não continuam: o servidor avisa "Esta partida usa o tabuleiro antigo e não pode continuar" (versão do tabuleiro gravada em cada snapshot).

## 2. Balanceamento (valores do usuário, 08/11/2026)

Cada jogador começa com **2.500** créditos e recebe **300** ao passar pelo Início (`rules.json`, decisão do usuário em 08/11/2026). Valores definidos pelo usuário casa a casa e gravados em `states.json`. Custos de construção em quatro faixas (RJ e SP com hotel mais caro); aluguéis em créditos:

| # | Estado | Terreno | Casa | Hotel | Aluguel: terreno · 1 · 2 · 3 · 4 casas · hotel |
|---|---|---|---|---|---|
| 1 | RN | 60 | 50 | 150 | 2 · 25 · 50 · 75 · 100 · 150 |
| 2 | AM | 60 | 50 | 150 | 2 · 28 · 55 · 83 · 112 · 180 |
| 3 | RR | 60 | 50 | 150 | 4 · 30 · 60 · 90 · 125 · 200 |
| 5 | AP | 100 | 50 | 150 | 6 · 33 · 65 · 98 · 135 · 220 |
| 6 | PA | 100 | 50 | 150 | 6 · 35 · 75 · 105 · 140 · 240 |
| 7 | RO | 120 | 50 | 150 | 8 · 38 · 75 · 113 · 150 · 260 |
| 9 | AC | 140 | 100 | 250 | 10 · 70 · 140 · 210 · 280 · 440 |
| 10 | MT | 140 | 100 | 250 | 10 · 75 · 150 · 225 · 300 · 465 |
| 11 | MS | 160 | 100 | 250 | 12 · 80 · 160 · 240 · 320 · 490 |
| 12 | GO | 160 | 100 | 250 | 12 · 85 · 170 · 255 · 340 · 515 |
| 14 | DF | 180 | 100 | 250 | 14 · 90 · 180 · 270 · 360 · 540 |
| 15 | MG | 180 | 100 | 250 | 14 · 95 · 190 · 285 · 380 · 565 |
| 16 | ES | 200 | 100 | 250 | 16 · 100 · 200 · 300 · 400 · 590 |
| 18 | RJ | 220 | 150 | 400 | 20 · 215 · 430 · 535 · 700 · 900 |
| 19 | PR | 220 | 150 | 350 | 18 · 120 · 240 · 350 · 470 · 745 |
| 20 | SP | 240 | 150 | 400 | 20 · 125 · 450 · 570 · 795 · 1000 |
| 22 | RS | 260 | 150 | 350 | 18 · 125 · 245 · 370 · 495 · 845 |
| 23 | SC | 260 | 150 | 350 | 18 · 130 · 255 · 385 · 515 · 870 |
| 24 | PE | 280 | 150 | 350 | 20 · 135 · 265 · 400 · 535 · 895 |
| 25 | PB | 280 | 150 | 350 | 20 · 140 · 275 · 415 · 455 · 920 |
| 27 | BA | 300 | 200 | 500 | 22 · 150 · 290 · 435 · 480 · 950 |
| 28 | SE | 300 | 200 | 500 | 20 · 160 · 305 · 455 · 505 · 980 |
| 29 | AL | 300 | 200 | 500 | 20 · 170 · 320 · 475 · 530 · 1100 |
| 31 | CE | 350 | 200 | 500 | 35 · 190 · 360 · 535 · 610 · 1200 |
| 32 | PI | 350 | 200 | 500 | 35 · 210 · 400 · 595 · 690 · 1300 |
| 33 | MA | 350 | 200 | 500 | 40 · 230 · 440 · 655 · 770 · 1400 |

Patrimônio (fim do modo Rápido e dos modos por tempo de 25 min e 1 h) = saldo + preço dos estados + valor investido em construções + aluguel que cada estado cobra no momento (com sede olímpica; zero durante o apagão). Empate: vence quem tem mais saldo; persistindo, todos os empatados vencem. O aluguel no patrimônio foi decidido pelo usuário em 07/11/2026, para que bens valham mais que o custo.

## 3. Inconsistências e lacunas encontradas

| # | Tema | Problema | Proposta |
|---|---|---|---|
| D1 | **Visita** | Não há regra; sem prisão, "visita" não tem significado. | **Removida** do percurso (2026-11-01): a arte do tabuleiro não tem Visita; o canto passou a ser o Aeroporto. |
| D2 | **Descanso** | Efeito não definido. | Canto: jogador perde a próxima jogada, mas continua recebendo aluguéis. Sai antes se tirar dupla. |
| D3 | **Viagem Nacional (Aeroporto)** | Efeito não definido. | No turno seguinte, em vez de rolar, escolhe qualquer **estado** e viaja até ele pagando 50 (só estados são destino, pedido do usuário, 06/11/2026) (recebe 200 se passar pelo Início). Pode recusar e rolar normalmente. |
| D4 | **Construção por visitas** | "Primeira visita" e "completar até três casas" se sobrepõem: comprar e voltar depois sem ter 3 casas conta como 2ª visita? | Regra por **etapa**, no máximo uma etapa por visita: etapa 1 (0–3 casas) pode ser completada em qualquer visita do dono; 4ª casa exige uma visita posterior àquela em que chegou a 3; hotel exige visita posterior à 4ª casa. A compra conta como 1ª visita. Só conta **parar** na casa (passar não conta). |
| D5 | **Grupos de cor** | Construção não exige o grupo completo → cor fica só decorativa. | MVP: decorativa. Opção configurável `fullGroupBaseRentMultiplier` (ex.: ×2 no aluguel sem construção com grupo completo), hoje 1. |
| D6 | **Olimpíadas sem estados** | Jogador sem propriedades não tem o que escolher. | Opção indisponível; não paga a taxa. |
| D7 | **Multiplicador olímpico** | Aplica sobre aluguel base ou total? Após ×10? | Multiplica o aluguel total (com construções). Após a 9ª edição permanece ×10. Mesma sede pode ser reescolhida (sobe a edição). |
| D8 | **Sede olímpica e posse** | O que acontece se a sede for vendida ou o dono falir? | Marcador é removido; a próxima edição continua a contagem. |
| D9 | **Duplas nos dados** | Não definido. | Dupla dá nova jogada; 3ª dupla seguida manda para Descanso. |
| D10 | **Dívida sem saldo** | Não há hipoteca nem venda definida. | Venda ao banco **só quando o saldo não cobre uma dívida**. Desde 08/11/2026 (decisão do usuário) só se vende o **estado inteiro** (terreno + construções juntos), por **80%** do preço + investido (`rules.debtSale.refundPercent`). O jogador marca os estados no tabuleiro, como na escolha da sede; um aviso soma o valor, mostra a dívida e só libera "Vender" quando a soma com o saldo paga a dívida (comando `SELL_STATES`, uma venda só). Sem decisão no prazo, o servidor vende do estado que rende menos ao que rende mais até cobrir; nem vendendo tudo, falência. Sem venda livre, sem venda de casa avulsa e sem hipoteca. |
| D11 | **Falência** | Para quem vão os bens? | Dívida com jogador: estados (com construções) vão ao credor. Dívida com banco: estados voltam livres ao banco. |
| D12 | **Negociação** | Escopo indefinido. | **Fora do jogo.** Não há negociação entre jogadores: estados só mudam de dono por compra, venda ao banco ou falência. |
| D13 | **Cartas de eventos** | Conteúdo não definido. | Baralho de 16 cartas originais (ganhar/pagar, mover, ir para Descanso, viagem grátis), embaralhado pelo servidor. Lista em entrega própria. |
| D14 | **Modo Rápido** | Empate de patrimônio. | Desempate por saldo; persistindo, empate declarado. "Rodada completa" = todos os jogadores ativos jogaram. |
| D15 | **Contas de usuário** | Spring Security exigido, mas cadastro não foi pedido. | MVP com **convidado**: apelido → token de sessão opaco (guardado no navegador) usado para reconectar. Sem senha. Contas reais depois. |
| D16 | **Primeiro marco vs. servidor autoritativo** | O marco 1 é só frontend, mas o frontend não pode decidir dados. | Marco 1 é uma **demo visual local** (rolagem fake isolada em `apps/web/src/dev`). Removida quando o WebSocket entrar. |
| D17 | **Mapa do Brasil nas cartas** | Exige contorno das 27 UFs. | Usar malhas do IBGE (dados públicos) simplificadas para SVG próprio; nada de arte de terceiros. |
| D18 | **Tipos compartilhados Java × TS** | `shared-types` não é consumível pelo Java. | JSON de `game-data` é a fonte única para ambos. DTOs Java escritos à mão, protegidos por teste de contrato com snapshots JSON de exemplo. Gerar por JSON Schema só se a duplicação doer. |
| D19 | **Ambiente** | Docker, Maven e pnpm não estão instalados nesta máquina. | npm workspaces (sem pnpm); Maven Wrapper (`mvnw`) no `apps/api`; Docker Desktop necessário a partir da entrega do backend (PostgreSQL/Testcontainers). |
| D22 | **Onde mostrar as Olimpíadas** (pedido do usuário) | A seção 8 pede edição, multiplicador, sede e responsável no centro do tabuleiro. | O destaque fica **no próprio estado-sede**: moldura dourada pulsando, tocha e selo "🔥×N" virado para a câmera; o centro não tem mais painel olímpico. A carta do estado mostra o multiplicador e quem é o dono. |
| D21 | **Ritmo do turno** (pedido do usuário) | Jogador parado trava a partida. | Prazos no servidor (`rules.turnTimers`): 7 s para rolar (eram 5 s; pedido do usuário, 07/11/2026) → rola sozinho; 7 s para a ação da casa onde parou (comprar/construir/sediar/escolher a viagem do Aeroporto) → recusa (na viagem, rola). O prazo só corre depois que a mesa mostra a jogada (dados rolando e personagens andando, inclusive a do adversário no mesmo lote, até 12 s a mais) e a contagem some da tela durante a animação (pedido do usuário, 06/11/2026). Sem decisão restante, a vez passa sozinha (inclusive logo após comprar). Dívida: 10 s (`debtSeconds`, pedido do usuário) para vender por conta própria; ao acabar, o servidor vende de uma vez até quitar, do bem mais barato ao mais caro pelo valor que o banco paga (as construções de um estado saem antes dele; falência só sem nada a vender). Jogador desconectado entra no **modo automático** (a cada 2 s o servidor joga a ação padrão; na dívida, a mesma venda, um bem por vez) até voltar; com ninguém conectado a partida pausa e, se ninguém voltar em 2 minutos (`rules.abandonment.seconds`), é encerrada sem vencedor. A câmera não se move sozinha. |
| D20 | **Ações no turno** | Construir só é possível ao parar no estado? | Sim: compra/construção só no estado onde o peão parou; venda ao banco só com dívida (D10). Não há negociação (D12). |
| D23 | **Taxa** | Casa nova da arte do tabuleiro (2026-11-01). | Paga `rules.tax.amount` (100) ao parar; o valor vai para o **fundo do Saque** (D25), não ao banco. Sem saldo, vira dívida (fluxo de D10/D11) cujo pagamento também vai ao fundo. Passar pela casa não cobra. |
| D25 | **Saque e RN antes do AM** (pedido do usuário, 2026-11-04) | Fundo para a Taxa e RN junto do Início. | 34 casas: RN no índice 1, Saque entre AL e CE. O fundo (`taxPool`, público no snapshot) recebe só pagamentos da Taxa (`TAX_PAID`, ou `DEBT_SETTLED` de dívida com `toTaxPool`); na falência por Taxa, o saldo que sobrar vai ao fundo e os estados voltam ao banco. Parar no Saque paga o fundo inteiro (`SAQUE_COLLECTED`) e o zera; fundo vazio rende zero. Cartas de pagar ao banco não entram no fundo. Partidas do tabuleiro anterior não continuam. |
| D26 | **Lançamento: navegador primeiro, depois Steam** (pedido do usuário, 2026-11-05) | O MVP foi pensado como site, com prioridade ao computador e celular em paisagem. | **1º lançamento no navegador** (site hospedado, E30), com convidado (D15). **Depois, Steam** (Windows; Steam Deck desejável). Já vale para o navegador: tela cheia em qualquer proporção, tabuleiro nítido e licença dos assets, porque janelas de navegador também variam e o site já é público. Consequências para a Steam: (1) app de desktop empacotado a partir do cliente web (E31); (2) partida em **tela cheia em qualquer proporção** — 16:9, 16:10, 21:9 ultrawide, de 1280×720 a 4K —, sem faixas lisas, com o tabuleiro nítido em 1440p/4K; (3) contas Steam (nome, avatar, amigos, convites e lobby) substituem o convidado de D15 na versão Steam (E32); (4) teclado e controle, além do mouse (E33); (5) servidor hospedado (E30); (6) **todos os assets com origem e licença comercial comprovadas** antes do lançamento (E34). O celular continua possível, só em paisagem, como etapa posterior. |
| D27 | **Passe Livre e Aluguel Zero não acumulam** (pedido do usuário, 2026-11-07) | Cartas de item podiam ser guardadas várias vezes. | Cada jogador guarda no máximo um de cada. Quem já tem o item e tira a carta dele não a recebe: a carta é pulada sem ser revelada (`EVENT_CARD_SKIPPED`) e vale a próxima do baralho. Depois de usar o item, a carta pode ser tirada de novo. Outros jogadores continuam podendo recebê-la. |
| D28 | **Aluguel Zero um pouco mais raro** (pedido do usuário, 2026-11-07) | Todas as cartas tinham a mesma chance. | Cada carta tem `copies` em `events.json` (cópias no baralho embaralhado): 3 para as demais e 2 para o Aluguel Zero, que sai com 2/3 da frequência de cada outra (2 em 26 ≈ 7,7%, contra 3 em 26 ≈ 11,5%). Vale para partidas novas; as em andamento mantêm o baralho que tinham. |
| D24 | **33 casas da arte** (pedido do usuário, 2026-11-02) | O percurso de 36 casas não corresponde à arte aprovada. | 33 casas da arte, 26 UFs (sem Tocantins), dois Eventos; ids estáveis por casa e cartas por id. Partidas do tabuleiro anterior ficam guardadas, mas não continuam. |
