# Enquadramento móvel e entrada compacta — 08/11/2026

O host seleciona `mobile-landscape` quando `useHudLayout` fornece reservas laterais. As reservas continuam medidas pelo host. A câmera usa distância focal longa para reduzir o encolhimento do lado distante e adapta a elevação ao espaço livre. Encaixe calculado a partir do contorno real da moldura, sem cortar o tabuleiro. Ao sair do layout lateral, a calibração original do computador é restaurada. Não foram alterados arte dos estados, modelos, regras, dimensões físicas nem áreas de personagens/construções.

## Escolha de câmera

`mobile-camera-study.mjs` compara rotações de 0°, 25° e 45° e elevações de 35°, 43°, 50° e 60°. O estudo usa reservas ilustrativas de 120 px por lateral em 800×330; não substitui a conferência com o HUD. No losango de 45°, a área das menores propriedades cai em relação à orientação frontal. A solução final mantém o alinhamento e reduz a perspectiva, buscando a leitura e o aproveitamento da tela. O ângulo vertical se adapta; não é simplesmente uma câmera fixa mais de cima.

## Conferência com a partida real em prévia controlada

`node scripts/assets/mobile-framing-qa.mjs` usa GameScreen, HUD, câmera, tabuleiro, peças e modelos de produção. Só os dados e WebSocket são simulados; nenhuma partida real é modificada. O mesmo HUD medido serve para comparar a câmera antiga com a nova. Capturas e medidas em `report.json`.

| Tela | Ganho na área do tabuleiro | Ganho na área da menor propriedade |
|---|---:|---:|
| 800×330 | 14% | 41% |
| 667×300 | 37% | 71% |
| 800×280 | 18% | 45% |
| 915×412 | 18% | 47% |
| 1280×720 | 0% — câmera original | 0% |

As medidas são de área projetada em pixels, não tamanho de fonte. Construções de terreno a hotel, quatro personagens, dados e moldura olímpica presentes nas capturas. Conferidos limites do contorno entre as reservas, crescimento da menor propriedade e retorno à câmera original. Os nomes completos ainda são pequenos nos celulares: tocar na propriedade continua sendo a forma de consultar detalhes. A conferência usa Chromium de desktop; não é medição de GPU de celular físico.

## Entrada em telas baixas

Formulário com apelido, entrada, sessão anterior e Google cabe sem rolagem em 667×280, 800×280, 800×300 e 915×320. O botão oficial Google não foi modificado. A prévia apresenta um slot neutro com as dimensões do botão; não realiza OAuth nem chamadas externas. Capturas `login-*`.

175 testes e build aprovados. Sem geração de imagens ou uso de Meshy. Sem commit ou merge nesta entrega. A arte definitiva do ícone/gaveta de cartas permanece como próxima pendência separada.
