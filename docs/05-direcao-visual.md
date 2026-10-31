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
