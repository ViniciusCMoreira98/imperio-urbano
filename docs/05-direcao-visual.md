# 05 — Direção visual

**Regra vigente para toda imagem enviada pelo usuário:** a imagem define o modelo visual a reproduzir por criação de arte. Não usar a imagem enviada, seus recortes, seus pixels ou uma projeção dela como textura, fundo, atlas, retrato ou arte final do produto. Criar modelos, ilustrações, materiais, texturas, elementos gráficos e renders próprios, usando a referência para estudar forma, composição, identidade e acabamento. A imagem original pode ser preservada para análise, calibração e comparação visual, sem aparecer como conteúdo renderizado do jogo. Regeneração em resolução maior não deve ser confundida com reutilizar/ampliar a referência.

**Referência principal do tabuleiro:** `assets/board/tabuleiro-brasil-alvo.png`, imagem fornecida na conversa: centro com paisagem do Rio e logotipo grande, casas douradas e mesa de madeira. O usuário confirmou 33 casas, 26 UFs (sem TO), dois Eventos, Taxa e Aeroporto; a engenharia adapta o motor. Câmera fixa e composição preservadas. A prévia que projeta o PNG nas malhas é um protótipo de alinhamento e precisa ter a arte substituída por assets próprios do Codex. A geometria, câmera e âncoras aproveitáveis não autorizam manter as texturas da referência como solução final.

As descrições abaixo registram direções e implementações anteriores; onde recomendam usar recortes das referências como arte, foram substituídas pela regra acima.

**Alvo visual atual (substitui as referências abaixo onde divergirem):** [visual-alvo.webp](referencias/visual-alvo.webp). O usuário quer personagens, tabuleiro, HUD e ambiente assim: personagens chibi estilo anime sobre bases com anel de luz na cor do jogador; tabuleiro escuro com borda em neon (roxo, azul, amarelo), casas brancas com ilustração e faixa de cor, centro azul-escuro em grade com logotipo, mapa do Brasil e miniaturas 3D (prédios, estádio, Catedral de Brasília, coqueiros); ambiente do Rio ao entardecer (prédios iluminados, Cristo Redentor, Pão de Açúcar, mar com barcos); HUD em painéis roxos com borda neon, retrato, posição (1º–4º) e coroa no líder, barra inferior com botão laranja "Rolar dados". Continuam valendo: moeda "$", preços do catálogo, regras aprovadas e tela limpa no celular.

Referência: [arte-conceito.webp](referencias/arte-conceito.webp). Ela define o **estilo**; regras e valores continuam vindo de `packages/game-data`.

**Arte do tabuleiro** ([tabuleiro-arte.webp](referencias/tabuleiro-arte.webp), cópia em `assets/board`): define a **ordem das casas** (sentido horário a partir do Início: Roraima, Amazonas, Acre, Rondônia, Evento, Tocantins, Pará, Amapá, Olimpíadas, …) e é usada como arte: cada casa mostra a ilustração recortada da imagem (`apps/web/src/board/boardArt.ts`) e o centro usa o mapa ilustrado com o logotipo. Preços em "C" e textos dos cantos da imagem não são usados (valem catálogo e regras). Ajustes: a casa sem nome da imagem é a Viagem Nacional; como a imagem tem 9 casas no topo e 7 embaixo, o Maranhão desce para o lado direito e o Rio de Janeiro passa para a fileira de baixo, mantendo a sequência.
Os preços, a ordem dos estados e os cantos da imagem são ilustrativos (há UF repetida e outras faltando) e **não** substituem o catálogo.

**(Antes do alvo visual) A arte-conceito era a referência principal**: o usuário quer o resultado final bem próximo dela (mesa de madeira, casas com ilustração do ponto turístico, mapa ilustrado com o logotipo no centro, pilhas de cartas, cantos ilustrados). Referência secundária: [estilo-business-tour.webp](referencias/estilo-business-tour.webp) (Business Tour), só para personagens humanos como peões; nenhuma arte, personagem ou layout dele é copiado.

## O que adotar da referência

| Área | Referência | Hoje (Marco 1) | Entrega |
|---|---|---|---|
| Ambiente | Tabuleiro sobre mesa de madeira, plantas desfocadas ao redor | ✅ Ambiente paradisíaco brasileiro (pedido do usuário): deck de madeira numa praia, areia clara, mar turquesa com espuma, coqueiros, moitas floridas e morros no horizonte; sol quente | E24 |
| Casas | Faixa colorida forte com sigla + preço; miniatura do ponto turístico sobre cada estado | Arte em canvas; ✅ casinhas e hotel 3D na cor do dono (E24); pontos turísticos na E27 | E24, E27 |
| Cantos | Losangos/hexágonos ilustrados com ícone grande (Olimpíadas com tocha, Descanso com guarda-sol) | Quadrado colorido com símbolo | E27 |
| Centro | Mapa ilustrado (rios, matas, cidades, Cristo, estádio), logotipo "Império Urbano — Edição Brasil" | Gradiente com "BRASIL" | E27 |
| Baralhos | Pilhas 3D "Eventos" e "Propriedades" no centro | ✅ Pilha 3D de Eventos (não há baralho de propriedades nas regras) | E24 |
| Peões | Personagens humanos em estilo cartoon (decisão do usuário, como no Business Tour) | ✅ Personagens humanos do pacote Mini Characters (Kenney, CC0, `apps/web/public/models/characters`): Jurema, Caio, Luana, Otávio e Seu Zé, sobre base na cor do jogador; andam com animação virados para onde vão e, parados, olham para a câmera | E23 |
| Moeda | Sufixo C na arte | Mantido `$ 1.250` (decisão do usuário) | — |
| Painel de jogadores | Cartões à esquerda: avatar, nome, saldo, casas/hotéis/estados, coroa no líder, borda na cor do peão | ✅ Feito (+ patrimônio e estado: automático, descansando, viagem) | E20 |
| Carta do estado | Cabeçalho verde com nome e sigla, foto da paisagem, compra e aluguel base em destaque, tabela com ícones de casa, custo de construção, botão Comprar | Painel escuro com tabela | E27 (paisagem), E20 (ações) |
| Barra inferior | Dados 3D brancos + botão vermelho **Rolar dados**; botões Construir e Vender com ícone (sem Trocar: não há negociação, D12) | ✅ Barra e botões feitos (dados ainda 2D) | E25 (dados 3D) |
| Histórico | Abas Chat / Eventos / Histórico no canto inferior esquerdo | ✅ Abas Histórico / Cartas sob os jogadores (chat fora do MVP) | E20 |
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
| Seleção de avatar | Grade dos 5 avatares, selecionado com check, Confirmar | E18 (grade), ✅ E23 (prévia 3D na sala de espera) |
| Regras | Abas por tema (objetivo, movimentação, propriedades, construções, Olimpíadas, eventos, vitória) | E29 |
| Configurações | Áudio, gráficos, tela cheia, limpar dados locais | E28/E29 |
| Partida | Igual à referência do tabuleiro | E20 |

## Fora do visual (decisão do usuário)

- Sem balão de texto narrando o lance: o resultado aparece nos dados da barra e no histórico.

## Itens das telas fora dos requisitos (não adotados sem decisão)

| Item na arte | Situação |
|---|---|
| Moedas (5.000) e diamantes (250) com botão "+" | Não previsto: implica economia/loja fora da partida. Não adotar no MVP. |
| Nível do jogador, XP, conquistas, estatísticas, histórico (Perfil) | Exige contas permanentes; o MVP usa convidados (D15). Pós-MVP. |
| "Partida Rápida" pública (encontrar partida) | Requisito pede salas privadas por código. Pós-MVP (matchmaking). |
| Número de jogadores e "permitir entrada por código" ao criar sala | Hoje a sala aceita 2–4 e só existe entrada por código. Proposta: limite opcional de jogadores na E18 se você quiser. |
| "Limite de rodadas: Sem limite" | Já coberto pelo modo: Clássico = sem limite, Rápido = 15 rodadas. |
| "Salas online" (lista de salas) | Só salas privadas no MVP. |

## Tela limpa e celular

Diretriz do usuário: a partida não pode ficar poluída e precisa funcionar no celular.

- Mostrar só o que serve agora: botões que não podem ser usados ficam escondidos, não desativados (Rolar só na vez de rolar; Vender só com dívida).
- Jogadores: avatar, nome, saldo e um ícone de estado (🤖 😴 ✈️ 💀); contagens e patrimônio ficam na dica.
- Histórico recolhido num botão; a carta do estado só aparece com uma casa selecionada.
- Rodada, modo e vez ficam no painel do centro do tabuleiro, não no topo.
- Olimpíadas: destaque no estado-sede (moldura dourada, tocha e selo ×N), não no centro da mesa (D22).
- **Tela inteira (D26: navegador agora, Steam depois):** a partida ocupa a janela toda em qualquer proporção (16:9, 16:10, 21:9, de 1280×720 a 4K); a mesa e o cenário preenchem as sobras, sem faixas lisas e sem esticar o tabuleiro. Referência de posições: [partida-tela-cheia.webp](referencias/partida-tela-cheia.webp) — jogadores numa fileira no topo, Menu no canto superior direito, Histórico à direita, barra de ação única embaixo (avatar "Sua vez", dados, prazo, ROLAR DADOS, selo da rodada). A imagem vale para enquadramento e HUD; a arte atual do tabuleiro não muda.
- Celular: **só em paisagem** (decisão de 2026-11-04), validado em 844×390, 932×430 e 667×375; em pé, aviso para girar o aparelho, sem pausar o relógio nem desconectar. Não há layout de partida vertical. Menus e lobby continuam funcionando em pé.
