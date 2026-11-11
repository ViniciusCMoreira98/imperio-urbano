# Pagar a dívida — assets e prévia

Entrega de arte em 10/11/2026, para o tabuleiro V1, branch develop_arte_3d. Ainda não altera DebtSalePrompt na partida.

Identidade própria: bordô, dourado e papel marfim; moedas, chaves de propriedades, pequenos elementos de arquitetura e folhagens brasileiras na moldura. Emblema de livro-caixa com moedas/chave. Sem selo de pago, valores ou textos gravados nas imagens: o resultado da operação continua dependendo do servidor.

## Arquivos

- frame-source.png: moldura/fundo originais 1536×1024, image_gen integrado.
- frame.webp: versão otimizada 1024×683, com frame-manifest.json (hashes/dimensões).
- emblem-source.png: emblema original 1254×1254, com transparência real.
- emblem.webp: emblema otimizado 640×640, proporção/alpha preservados; manifest.json registra procedência/hashes.
- frame-prompt.json e emblem-prompt.json: prompts integrais das duas novas gerações.
- previews/: oito capturas e report.json, incluindo sem seleção, São Paulo selecionado, venda insuficiente e falência por impossibilidade de pagar.

Moldura em nove partes (border-image-slice:174 fill): cantos preservados, só trilhos retos e papel central adaptados ao tamanho do cartão. Cantos com 18 px padrão, 15 px na menor tela e 30 px apenas na apresentação ampliada. Não deformar a imagem inteira. Emblema com object-fit:contain; texto e botões separados da ilustração.

## Apresentação e limites

Composição central no miolo, sem cobrir estados, suas artes, aluguéis ou áreas de toque. O estudo isolado modal-art.png mostra acabamento, não o tamanho de jogo. Fonte em scripts/assets/debt-choice-preview/index.html; as prévias usam capturas estáticas da V1 e botões ilustrativos, sem envio de comandos.

Exemplo: dívida R$ 250, saldo R$ 100; antes de escolher faltam R$ 150. São Paulo sem construções custa R$ 240 no catálogo; a venda a 80% rende R$ 192 e deixa R$ 42 após pagar. Selecionar somente Amazonas, terreno de R$ 60, rende R$ 48 e ainda faltam R$ 102. São valores de demonstração; a implementação usa saleSummary/stateSaleValue atuais, nunca essas constantes.

## Contrato para integração pelo Claude

1. Aplicar a arte ao DebtSalePrompt/choice.kind=sale, em AWAITING_DEBT_RESOLUTION, mantendo a venda de estados inteiros e regras atuais. Não criar outro tipo de dívida ou comando.
2. Preservar saleSummary, SALE_PERCENT, saleStore.picked/toggle/clear, elegibilidade dos próprios estados e troca da seleção sem abrir consulta de propriedade. O servidor continua autoritativo.
3. Exibir dívida, credor real (Taxa, jogador ou banco), saldo, itens selecionados com nome/construções/valor, total recebido, falta ou sobra. A prévia compacta exemplifica um estado; não descartar a lista completa ou o credor ao integrar. Listas longas devem usar rolagem dentro do miolo, sem crescer sobre as casas. Não truncar/abreviar valores financeiros.
4. Vender somente quando summary.covers e online, enviando SELL_STATES com os stateIds calculados; preservar espera de resposta, limpeza da seleção e fluxo de dívida/movimento. Sem desconto otimista, sem transferência local ou alteração do percentual de venda.
5. Falência é o comando existente DECLARE_BANKRUPTCY, visualmente secundário ao vender. Se summary.hopeless, preservar a mensagem de impossibilidade e a ausência da ação de vender. Não alterar a disponibilidade atual da falência por causa da arte.
6. Preservar Countdown/prazo e bloqueios de turno/offline/pendência. Adaptar conteúdo e rolagem dentro do miolo real, incluindo temporizador; não copiar as porcentagens da prévia estática como garantia responsiva. Não aplicar fundo opaco/inert sobre o tabuleiro; toques fora do cartão alcançam os estados.
7. Validar 800×360 e 667×280, múltiplos estados/remoção da seleção, terreno/casas/hotel, credor com nome longo, valores grandes, venda insuficiente/suficiente, hopeless, offline/prazo e resposta do servidor. Testar moldura inteira sem interseção com os 26 estados.

## Reprodução

node scripts/assets/olympic-choice-art-qa.mjs --debt prepara os dois WebPs e gera oito capturas. No ambiente Windows usar o PLAYWRIGHT_BROWSERS_PATH habitual. O roteiro verifica encaixe, ausência de transbordamento, ação principal habilitada/bloqueada nos exemplos e ausência de interseção com os polígonos completos dos 26 estados, com margem de 3 px.

Resultado: oito capturas, sete composições sobre o tabuleiro, zero interseções com estados e zero erros de página. Não é teste do gameplay integrado, de múltiplas seleções reais ou de telefone físico. Duas gerações com image_gen integrado; zero créditos Meshy. Sem alteração do componente real, commit ou merge nesta entrega.
