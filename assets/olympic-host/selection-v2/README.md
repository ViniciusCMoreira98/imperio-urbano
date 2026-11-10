# Olimpíadas — credencial da sede

Revisão 2 da apresentação do modal, 10/11/2026. Continua no tabuleiro V1, branch develop_arte_3d; não corresponde à branch do tabuleiro V2.

Identidade própria de credencial da sede: cabeçalho verde-esmeralda, filetes dourados, superfície marfim com curvas discretas inspiradas na pista, etiqueta do estado em dourado, ação principal verde e detalhe nas cinco cores dos jogos.

Emblema original preservado da revisão 1; nenhuma nova geração de imagem ou crédito Meshy. A personalização é feita em HTML/CSS nativos para preservar textos, escala e nitidez. Fonte da apresentação: scripts/assets/olympic-choice-preview-v2/index.html e theme.css. Emblema, prompt original e procedência permanecem no kit assets/olympic-host/selection-v1/; manifesto desta revisão referencia o arquivo reutilizado.

Painel permanece central, inteiramente no miolo e com as mesmas dimensões validadas da composição anterior. Não aumentar o cartão para acomodar a decoração. Cabeçalho, texturas e detalhes ficam dentro da moldura. Preservar os contratos funcionais e de seleção do README da revisão 1, incluindo HOST_OLYMPICS, SKIP_OLYMPICS e a diferença da escolha por evento, sem taxa e sem recusa. Ainda é prévia de arte sobre captura estática, sem alteração do BoardChoicePrompt real.

Validação: 7 capturas em previews/; nas composições sobre o tabuleiro, nenhum dos 26 estados intersecta o painel/moldura, com margem de 3 px. Inclui 800×360 e 667×280 antes/depois da escolha. Sem transbordamento ou erros de página. O teste de projeção da prévia não substitui a medição responsiva na integração real. modal-art.png é estudo ampliado do acabamento, não o tamanho a aplicar no jogo.

Reprodução: node scripts/assets/olympic-choice-art-qa.mjs --personalized. Esta revisão preserva os arquivos da apresentação anterior. Sem commit ou merge nesta entrega.
