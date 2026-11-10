# Aeroporto — cartão de embarque

Revisão 2 da apresentação do modal, 10/11/2026. Continua no tabuleiro V1, branch develop_arte_3d; não corresponde à branch do tabuleiro V2.

Identidade própria de cartão de embarque: cabeçalho azul-petróleo/turquesa, papel azul-claro com linhas discretas, separador pontilhado do canhoto, destino em etiqueta azul e ação principal azul.

Emblema original preservado da revisão 1; nenhuma nova geração de imagem ou crédito Meshy. A personalização é feita em HTML/CSS nativos para preservar textos, escala e nitidez. Fonte da apresentação: scripts/assets/airport-choice-preview-v2/index.html e theme.css. Emblema, prompt original e procedência permanecem no kit assets/airport/destination-v1/; manifesto desta revisão referencia o arquivo reutilizado.

Painel permanece central, inteiramente no miolo e com as mesmas dimensões validadas da composição anterior. Não aumentar o cartão para acomodar a decoração. Cabeçalho, texturas e detalhes ficam dentro da moldura. Preservar os contratos funcionais e de seleção do README da revisão 1, incluindo CHOOSE_TRAVEL, ROLL_DICE, destinos livres/próprios/adversários e custo de choice.fee. Ainda é prévia de arte sobre captura estática, sem alteração do BoardChoicePrompt real.

Validação: 6 capturas em previews/; nas composições sobre o tabuleiro, nenhum dos 26 estados intersecta o painel/moldura, com margem de 3 px. Inclui 800×360 e 667×280 antes/depois da escolha. Sem transbordamento ou erros de página. O teste de projeção da prévia não substitui a medição responsiva na integração real. modal-art.png é estudo ampliado do acabamento, não o tamanho a aplicar no jogo.

Reprodução: node scripts/assets/olympic-choice-art-qa.mjs --airport --personalized. Esta revisão preserva os arquivos da apresentação anterior. Sem commit ou merge nesta entrega.
