# Aviso — Dados iguais!

Arte criada em 11/11/2026 para o tabuleiro V1 (develop_arte_3d). Ainda não substitui a apresentação real de TableNotices.

Moldura original com dourado/esmeralda, papel marfim, flores e folhagens brasileiras. Frame gerado com image_gen integrado; sem rostos, números ou pontos de dados gravados na imagem. Os dois dados são desenhados pela interface a partir do resultado oficial, para não mostrar um par diferente do lance que gerou o aviso.

## Arquivos e aplicação

- frame-source.png: fonte original 1536×1024, preservada.
- frame.webp: otimizado 1024×683, 119.804 bytes.
- prompt.json: prompt integral da geração; manifest.json: origem, dimensões, hashes e parâmetros.
- previews/notice-art.png: apresentação isolada ampliada, não o tamanho de partida.
- previews/: nove capturas e relatório, com extra turno, saída do Descanso, três duplas seguidas e jogada de outra pessoa.
- scripts/assets/doubles-notice-preview/index.html: protótipo HTML/CSS com pontos dos dados dinâmicos, texto e fechar separados do bitmap.

Usar nove partes (border-image-slice:220 fill). Cantos quadrados preservados, só trilhos retos/papel central adaptados. Cantos: 20 px computador, 17 px celular, 14 px na menor tela, 35 px apenas no estudo ampliado. Não esticar a imagem inteira. Painel central no miolo, sem cobrir estados, seus nomes, artes ou aluguéis; sem escurecer a partida.

## Mensagens

- Normal: “Dados iguais!” / “Você joga de novo.”
- Saída do Descanso: “Você saiu do Descanso.”
- Terceira dupla consecutiva: “Três duplas seguidas: você vai direto para o Descanso.” Nesse caso texto e pontos usam bordô, sem prometer outra jogada.
- Outra pessoa: usar o nome e a consequência oficial, sem tratar como se fosse a vez do observador.

Os valores 3/3, 2/2, 5/5 e 6/6 das capturas são exemplos. O fundo do tabuleiro é uma captura estática anterior e não está sincronizado ao aviso. Não usar essa composição como comprovação de gameplay ou sincronização.

## Integração pelo Claude

1. Aplicar a arte somente a shown.kind === 'doubles' em TableNotices. Preservar Aluguel Zero e sem saldo.
2. Usar os dados do DICE_ROLLED que originou aquela notificação, não o snapshot.lastDice atual nem uma leitura do título traduzido. Como TableNotice hoje contém apenas id/kind/title/text/after, acrescentar um campo opcional de apresentação dice:{first,second}, preenchido por tableNotices a partir do evento, sem mudar protocolo/servidor. Validar igualdade e faixa 1–6 antes de desenhar pontos; sem dados válidos, mostrar o título/texto existentes sem inventar faces.
3. Preservar os textos oficiais e suas condições (PLAYER_MOVED.sentToRest, REST_LEFT e jogador correto). Não calcular uma regra paralela ou contar duplas nesta arte; não prometer extra turno nas exceções. Não adicionar ROLL_DICE automático ou botão para ganhar outra vez.
4. Manter ready, after:'dice', fila, identidade/versionamento dos eventos, espera do término dos dados e limpeza em resync. Evitar que reconexão ou renderizações repitam o aviso.
5. Manter duração atual de doubles (2.500 ms), fechamento pelo × e comportamento de toque fora, sem criar temporizador dentro do asset. Preservar área de toque acessível do fechar na integração; a prévia demonstra apenas o acabamento. Não acrescentar backdrop opaco/inert ou interceptação desnecessária do tabuleiro.
6. Preservar role=status/aria-live=polite; pontos decorativos aria-hidden, mas resultado numérico e consequência continuam disponíveis em texto acessível. O template usa aria-label com o par completo.
7. Medir o aviso pelo miolo projetado da câmera real, incluindo moldura e controles. Os percentuais da prévia estática não garantem encaixe em toda tela. Validar 800×360 e 667×280, seis pares possíveis, textos mais longos, terceiro par/saída do Descanso, outra pessoa, fila e reconexão.

## Validação da arte

node scripts/assets/doubles-notice-art-qa.mjs inicia servidor próprio na porta 4195, prepara o WebP e gera nove capturas. Confere as seis faces, mensagens, encaixe e ausência de transbordamento, além da interseção do aviso com os polígonos dos 26 estados, margem de 3 px. No Windows usar PLAYWRIGHT_BROWSERS_PATH habitual.

Nove capturas, oito composições sobre a V1 sem cobrir estados e sem erros de página. Não é teste do componente integrado, do tempo real de exibição ou de aparelho físico. Nenhuma alteração em câmera, tabuleiro ou modelos; uma nova geração de imagem, zero créditos Meshy. Sem commit/merge nesta entrega.
