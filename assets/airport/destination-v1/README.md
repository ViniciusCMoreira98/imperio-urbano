# Arte — destino da viagem pelo Aeroporto

Entrega de arte em 10/11/2026 na V1 (`develop_arte_3d`). Protótipo visual, ainda sem substituir o `BoardChoicePrompt` da partida.

Emblema original: avião branco/azul/verde, marcador de destino e pista sobre medalhão azul/dourado, com folhas tropicais. Criado com image_gen integrado, sem marca de companhia aérea. Fonte `emblem-source.png` (1254×1254, transparente); otimizado `emblem.webp` (640×640, 99.180 bytes), mantendo proporção e alpha. Usar `object-fit: contain`. Prompt integral em `prompt.json`; dimensões, hashes e procedência em `manifest.json`. Zero créditos Meshy.

## Apresentação

O painel fica **no meio do tabuleiro, inteiramente no miolo**, sem cobrir nenhum estado, incluindo arte, nome, aluguel e área de toque. Reutiliza o acabamento marfim/verde/dourado da escolha olímpica, com textos separados do bitmap.

- Antes da seleção: “Escolha o destino”, “Toque no estado de destino.”, Viajar bloqueado.
- Depois: “Confirme a viagem”, nome completo/sigla do destino e Viajar habilitado.
- Valor da viagem separado; R$ 50 é o custo atual do catálogo, não uma constante para a implementação.
- “Rolar dados” representa a alternativa já existente para seguir a jogada sem viajar. Não é um comando novo de cancelar.

Protótipo em `scripts/assets/airport-choice-preview/index.html`. As imagens em `previews/` são composições sobre capturas estáticas da V1, não uma integração funcional. `modal-art.png` é somente estudo isolado do acabamento; as medidas da partida são as das prévias do tabuleiro.

## Contrato para o Claude

1. Aplicar somente quando `choice.kind === 'travel'`, fase `AWAITING_TRAVEL_DESTINATION`. Preservar outras escolhas.
2. Alvos oficiais de `choice.tiles`: estados do tipo PROPERTY, inclusive livres ou de adversários; não filtrar por proprietário nem oferecer casas especiais. Nome/sigla vêm do catálogo e seleção do viewStore.
3. Confirmar somente alvo válido via `choiceAction`, enviando o comando existente `CHOOSE_TRAVEL` com `tileIndex`. Não enviar automaticamente ao exibir a arte e não movimentar o personagem localmente por otimismo.
4. Custo de `choice.fee`/`rules.nationalTravel.fee`; não duplicar cobrança ou inventar isenção de aluguel. Preservar regras de chegada do servidor.
5. Se o botão Rolar dados ficar no painel, usar o mesmo envio/validação de `ROLL_DICE` do ActionBar e coordenar a apresentação dos dois controles. Não criar `SKIP_TRAVEL`, não enviar viagem junto com rolagem. Bloquear ambos conforme offline, turno, mesa ocupada e resposta em andamento.
6. Preservar Countdown/prazo, tableBusy, limpeza da seleção e mensagem para casa inválida. O temporizador também deve caber no miolo sem empurrar o cartão sobre as propriedades.
7. Dimensionar/posicionar pelo miolo projetado da câmera real. A camada externa permite toques no tabuleiro, só o cartão recebe interação; sem backdrop opaco ou partida inerte. Não copiar as porcentagens estáticas do protótipo como garantia responsiva.
8. Validar 800×360 e 667×280 antes/depois da seleção; troca de destino, casa especial inválida, propriedade livre/adversária, prazo, offline e rolagem em vez de viagem. Conferir ausência de interseção com os 26 estados, incluindo moldura e controles.

## Reprodução e validação da arte

`node scripts/assets/olympic-choice-art-qa.mjs --airport` usa a mesma calibração e verificação geométrica do modal olímpico, gera o WebP e seis capturas: isolada, computador, 800×360, 667×280 e selecionado nas duas telas móveis. Porta local 4194; definir `PLAYWRIGHT_BROWSERS_PATH` conforme o ambiente.

Resultado: cinco composições sobre o tabuleiro sem interseção com nenhum dos 26 estados (margem de 3 px), sem transbordamento de texto ou erros de página. Relatório `previews/report.json`. É validação das prévias estáticas, não de gameplay integrado ou telefone físico. Sem mudanças no tabuleiro, câmera ou modelos. Sem commit/merge nesta entrega.
