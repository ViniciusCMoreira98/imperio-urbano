# 05 — Direção visual

Referência: [arte-conceito.webp](referencias/arte-conceito.webp). Ela define o **estilo**; regras e valores continuam vindo de `packages/game-data`.
Os preços, a ordem dos estados e os cantos da imagem são ilustrativos (há UF repetida e outras faltando) e **não** substituem o catálogo.

## O que adotar da referência

| Área | Referência | Hoje (Marco 1) | Entrega |
|---|---|---|---|
| Ambiente | Tabuleiro sobre mesa de madeira, plantas desfocadas ao redor | Fundo azul liso | E24 |
| Casas | Faixa colorida forte com sigla + preço; miniatura do ponto turístico sobre cada estado | Arte em canvas, sem miniaturas | E24, E27 |
| Cantos | Losangos/hexágonos ilustrados com ícone grande (Olimpíadas com tocha, Descanso com guarda-sol) | Quadrado colorido com símbolo | E27 |
| Centro | Mapa ilustrado (rios, matas, cidades, Cristo, estádio), logotipo "Império Urbano — Edição Brasil" | Gradiente com "BRASIL" | E27 |
| Baralhos | Pilhas 3D "Eventos" e "Propriedades" no centro | Placas reservadas | E24 |
| Peões | Peões cartunescos coloridos (formato clássico) | Peão vermelho simples | E23 |
| Moeda | Sufixo C na arte | Mantido `$ 1.250` (decisão do usuário) | — |
| Painel de jogadores | Cartões à esquerda: avatar, nome, saldo, casas/hotéis/estados, coroa no líder, borda na cor do peão | Placa vazia | E20 |
| Carta do estado | Cabeçalho verde com nome e sigla, foto da paisagem, compra e aluguel base em destaque, tabela com ícones de casa, custo de construção, botão Comprar | Painel escuro com tabela | E27 (paisagem), E20 (ações) |
| Barra inferior | Dados 3D brancos + botão vermelho **Rolar dados**; botões Construir, Vender, Trocar com ícone | Botão verde + texto | E25, E20 |
| Histórico | Abas Chat / Eventos / Histórico no canto inferior esquerdo | — | E20 (chat fora do MVP) |
| Atalhos | Minimapa + Configurações, Jogadores, Tela cheia no canto inferior direito | Botões de giro | E29 |

## Paleta e tipografia

- Interface: painéis azul-marinho translúcidos com borda clara, botões saturados (verde = comprar, vermelho = rolar, cinza-azulado = ações secundárias).
- Texto: sem serifa, pesado e arredondado nos títulos (estilo "display" de jogo casual). Fonte licenciada livre a definir (ex.: Google Fonts, empacotada localmente).
- Arte 3D: estilo cartoon, cores vivas, iluminação quente de fim de tarde, sombras suaves.

## Pontos que divergem das regras aprovadas

| Referência | Regra aprovada | Situação |
|---|---|---|
| Descanso "Receba 100 C" | D2: perde a próxima jogada | Mantida D2 (arte é só ilustrativa) |
| Visita "Apenas visite. Sem penalidade." | D1: casa neutra | Igual |
| Sem casa Viagem Nacional | Exigida pelos requisitos | Mantida |
| "Chat" | Não previsto no MVP | Proposta: entra depois do multiplayer |

## Produção dos modelos

Miniaturas e peões em low-poly feitos no Blender (GLB, < 2 mil triângulos por miniatura, textura atlas compartilhada), carregados com `useGLTF` e instanciados. Enquanto não existirem, usar formas procedurais no mesmo estilo de cor.

## Telas e menus

Referências: [menu-inicial.webp](referencias/menu-inicial.webp) e [telas-menu.webp](referencias/telas-menu.webp). Valem como guia de estilo e de organização das telas; como na arte do tabuleiro, textos e números da imagem são ilustrativos.

Padrão visual comum: fundo com paisagem brasileira desfocada, painel central azul-marinho com borda clara, título em faixa no topo, botão voltar (←) no canto, botão principal amarelo/verde grande e botões secundários azuis com ícone.

| Tela da referência | O que entra | Entrega |
|---|---|---|
| Menu inicial | Logo, avatar + apelido do convidado, botões Jogar, Regras, Configurações | E18 (layout), E27 (arte de fundo e personagens) |
| Criar sala / Entrar em sala | Abas Criar/Entrar; modo de jogo (Clássico/Rápido); código da sala com botão copiar | E18 |
| Sala de espera | Código copiável, lista de jogadores com Pronto/Aguardando, coroa no anfitrião, avatar em destaque, Iniciar partida | E18 |
| Seleção de avatar | Grade dos 5 avatares, selecionado com check, Confirmar | E18 (provisório 2D), E23 (prévia 3D) |
| Regras | Abas por tema (objetivo, movimentação, propriedades, construções, Olimpíadas, eventos, vitória) | E29 |
| Configurações | Áudio, gráficos, tela cheia, limpar dados locais | E28/E29 |
| Partida | Igual à referência do tabuleiro | E20 |

## Itens das telas fora dos requisitos (não adotados sem decisão)

| Item na arte | Situação |
|---|---|
| Moedas (5.000) e diamantes (250) com botão "+" | Não previsto: implica economia/loja fora da partida. Não adotar no MVP. |
| Nível do jogador, XP, conquistas, estatísticas, histórico (Perfil) | Exige contas permanentes; o MVP usa convidados (D15). Pós-MVP. |
| "Partida Rápida" pública (encontrar partida) | Requisito pede salas privadas por código. Pós-MVP (matchmaking). |
| Número de jogadores e "permitir entrada por código" ao criar sala | Hoje a sala aceita 2–4 e só existe entrada por código. Proposta: limite opcional de jogadores na E18 se você quiser. |
| "Limite de rodadas: Sem limite" | Já coberto pelo modo: Clássico = sem limite, Rápido = 15 rodadas. |
| "Salas online" (lista de salas) | Só salas privadas no MVP. |
