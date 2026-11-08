# Leitura dos personagens — 08/11/2026

## Decisão visual

Ampliar somente a figura, mantendo a base, a posição dos pés e as áreas das casas no tamanho aprovado. Um personagem sozinho recebe escala visual de 1,70; em dupla, 1,35; com três ou mais, 1,00. `PAWN_SCALE` continua 0,75 e o raio máximo de apoio continua 0,1875 no mundo. `pawnSpots`, assentos e índices não mudaram.

A base do tabuleiro ganhou fundo escuro translúcido, faixa mais espessa na cor do jogador e filete claro. Tudo está dentro do mesmo raio de apoio. `PlayerBase` conserva a aparência anterior quando não recebe `emphasized`, preservando o seletor e as outras prévias de personagem. Não houve alteração de modelos, uniformes ou texturas.

O corpo cresce e diminui suavemente quando a ocupação muda. Durante a caminhada usa o tamanho original, voltando ao tamanho de destino ao pousar. A saída por falência conserva o tamanho mostrado até encolher; a comemoração usa a figura ampliada. A seta acompanha a cabeça, mantendo tamanho próprio e oscilação menor no tabuleiro.

O host reserva 7% da altura como folga dos personagens no celular deitado, além dos 6 px de separação. A reserva anterior de 3,5% continua no computador. Isso evita cortar a cabeça e a seta nas telas baixas sem alterar a câmera ou fazer o enquadramento oscilar a cada mudança de ocupação.

## Conferência

Reprodução: `node scripts/assets/pawn-readability-qa.mjs`, com Chromium instalado. O roteiro monta GameScreen, câmera, modelos e animações reais; apenas o WebSocket e os dados são controlados, sem sala real ou envio de comandos a um servidor.

Verifica RN/AC/RJ/MA com um a quatro personagens, nos tamanhos 800×330, 667×300, 800×280 e 1280×720; os cinco avatares estão presentes. Percorre os vértices das malhas efetivamente renderizadas das bases e confere o contorno real das respectivas casas. Mede a projeção da caixa 3D do modelo com e sem ampliação; essa medida é uma estimativa de altura, não uma contagem dos pixels da silhueta. Confere também a borda superior, a caminhada até a casa seguinte, a volta da escala após pousar e a saída por falência. Resultados em `report.json` e capturas `RN-*`/`RJ-*`.

175 testes e build aprovados. Conferência em Chromium de desktop, sem medição de GPU de celular físico. Reutilizados os cinco modelos existentes; sem geração de arte e zero créditos Meshy. Sem commit ou merge nesta entrega. O ícone e o acabamento da gaveta de cartas continuam como pendência separada.

## Resultado final e correção do aluguel sobre a cabeça

Concluídos 64 cenários de encaixe, com cinco avatares, caminhada/restauração da escala e saída por falência. A etapa de animações recarrega a prévia em 800×330 para não herdar a carga acumulada da varredura gráfica. `geometry-report.json` registra os 64 casos de geometria; `report.json` registra também as animações. A opção `PAWN_QA_ANIMATION_ONLY=1` executa só a etapa de animação, com relatório separado.

O usuário identificou etiquetas sobre a cabeça. `RentTags` agora usa fila opaca com recorte alpha, ordem 20 e sem gravar/testar profundidade; as malhas dos personagens e a seta usam ordem 30. Assim o aluguel continua acima das construções e a cabeça fica acima da etiqueta. A posição, o valor e a seleção das propriedades não mudaram. `AvatarFigure` recebe a ordem de desenho opcional, aplicada à cópia local e ao fallback; as outras telas conservam o comportamento anterior.

`node scripts/assets/rent-head-occlusion-qa.mjs` passou em dez combinações de avatar/tela. O roteiro encontra uma sobreposição real no Aeroporto com a etiqueta da Bahia e verifica raios da câmera sobre a cabeça; recria o comportamento anterior para a captura antes e restaura a correção depois. Capturas atualizadas e relatório em `rent-occlusion/`. As capturas gerais RN/RJ mostram a revisão de escala anterior à correção das camadas; os detalhes dessa pasta mostram a versão corrigida. A etapa de geometria continua válida: ordem de desenho não muda posições nem dimensões. 175 testes e build aprovados após a correção.
