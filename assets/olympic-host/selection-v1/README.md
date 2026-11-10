# Arte — seleção da sede das Olimpíadas

Entrega de arte em 09/11/2026, na V1 (`develop_arte_3d`). Protótipo visual, ainda sem substituir `BoardChoicePrompt` na partida.

## Revisão de posição solicitada pelo usuário

Validação final: sete capturas; nas seis composições sobre a captura da V1, zero interseções com os 26 estados, com margem adicional de 3 px. Inclui confirmação após escolher em 667×280. Sem transbordamento de texto ou erro de página.

O painel deve permanecer **no meio do tabuleiro**, inteiramente dentro do miolo. Não pode cobrir nenhum estado, incluindo nome, arte, aluguel ou área de toque. A proposta de usar a faixa superior/lateral foi descartada pelo usuário. As prévias do tabuleiro foram refeitas com o painel central mais estreito e baixo; o estado escolhido aparece no lugar da instrução antes de confirmar. `modal-art.png` é apenas o estudo isolado do acabamento, não uma medida para copiar na partida.

A verificação agora compara o retângulo do painel (com margem de 3 px) com os polígonos completos dos 26 estados projetados na captura correspondente. A projeção é calibrada pelos pontos reais das placas do relatório da V1, não por uma estimativa visual. Na integração, calcular a posição/tamanho pelo miolo e câmera reais; não copiar as porcentagens da prévia estática como garantia para qualquer tela. Se a composição não couber, adaptar o conteúdo dentro do miolo, sem avançar sobre as casas. Nenhum botão pode interceptar o toque nos estados.

- `emblem-source.png`: imagem original, 1254×1254, com transparência real, gerada com image_gen integrado.
- `emblem.webp`: asset otimizado, 640×640, 167.458 bytes, proporção e alpha preservados. Não esticar; usar `object-fit: contain`.
- `prompt.json`: prompt integral e procedência da geração. `manifest.json`: hashes, dimensões e métricas de transparência. Zero créditos Meshy.
- `previews/modal-art.png`: apresentação isolada do modal.
- `previews/board-desktop.png`, `board-mobile.png` e `board-small.png`: composição sobre capturas estáticas da V1; não são capturas de uma integração funcional.
- `previews/selected-mobile.png` e `previews/selected-small.png`: estado após escolher São Paulo, como exemplo.
- `previews/event-small.png`: variação para a escolha por carta de evento, sem taxa e sem opção de pular.

Composição: moldura fina verde/dourada, superfície marfim, emblema de estádio/aros olímpicos e instrução prioritária de toque no tabuleiro. Não há fundo escuro cobrindo a partida. No celular, o painel é compacto, sem a linha de estado vazio; ao selecionar, aparece o nome e a sigla. A confirmação fica cinza antes da escolha e dourada depois. Textos, botões e moldura são HTML/CSS, separados do bitmap para manter leitura e permitir valores reais. Estilo reproduzível em `scripts/assets/olympic-choice-preview/index.html`.

## Contrato para integração pelo Claude

1. Aplicar a apresentação somente a `choice.kind === 'olympics'` e à carta `choice.kind === 'event' && choice.effect === 'CHOOSE_OLYMPICS_HOST'`. Preservar viagem, incêndio, apagão e venda.
2. Entrada normal: “Toque em um dos seus estados destacados no tabuleiro.” Custo recebido de `choice.fee`, hoje R$ 50; preservar `HOST_OLYMPICS` e `SKIP_OLYMPICS`. Não fixar R$ 50 na implementação.
3. Carta de evento: “Toque em um estado destacado no tabuleiro para sediar os jogos.” Os alvos são os de `choice.tiles`/`eventTargets`; podem incluir propriedade de outro jogador. Não limitar aos próprios estados. Mostrar “Sem taxa”, preservar `CHOOSE_EVENT_TARGET` e não inventar opção de pular.
4. Usar seleção real de `useViewStore` e validade de `choiceAction`; nunca enviar a escolha só por exibir a arte. Nome completo e sigla vêm do catálogo. Estado inválido exige aviso explícito; offline/aguardando resposta bloqueia confirmação. Preservar prazo e `Countdown`, regras de turno, limpeza da seleção e espera por `tableBusy`.
5. Manter as casas elegíveis destacadas e o tabuleiro clicável fora do painel. A camada externa continua `pointer-events: none`; somente o cartão recebe interação. Não aplicar `inert`, backdrop opaco ou bloqueio de foco/toque ao tabuleiro durante a escolha. Conferir posição com o enquadramento real, sem alterar a câmera.
6. Validar 800×360 e 667×280, seleção válida/inválida, troca de estado, prazo, offline, recusa normal e evento sem taxa. Os botões do protótipo ilustram os estados visuais e não estão ligados ao servidor.

## Reprodução da arte

`node scripts/assets/olympic-choice-art-qa.mjs` inicia a prévia na porta 4194, codifica o WebP a partir da fonte preservando a proporção/alpha e produz sete capturas. Verifica encaixe do cartão, texto sem transbordar, confirmação bloqueada antes de escolher e ausência de recusa no evento. No ambiente Windows, usar o `PLAYWRIGHT_BROWSERS_PATH` habitual do projeto. Relatório em `previews/report.json`; não certifica gameplay, acessibilidade do fluxo integrado ou aparelho físico.

Texto final: “Escolha o estado-sede”; instrução de toque; “Estado selecionado”; “Confirmar sede”; “Não sediar” somente no fluxo normal; custo separado. A arte decorativa recebe `alt=""` na prévia para não repetir a instrução lida. Sem commit ou merge nesta entrega.
