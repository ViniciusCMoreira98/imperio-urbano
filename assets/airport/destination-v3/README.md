# Aeroporto — moldura e fundo ilustrados

Nova entrega de assets em 10/11/2026, para o tabuleiro V1 (develop_arte_3d). Esta revisão substitui visualmente o acabamento de CSS da revisão 2, preservando-a como histórico.

Asset original gerado com image_gen integrado: moldura dourada/teal, asas esculpidas, rebites e folhagens tropicais; papel azul-claro e pontilhado de bilhete. O espaço central fica livre para textos reais. Nenhuma palavra ou valor está gravado na imagem.

## Arquivos

- frame-source.png: fonte original 1536×1024, preservada.
- frame.webp: versão otimizada 1024×683.
- prompt.json: prompt integral e procedência da nova geração.
- frame-manifest.json: resolução, bytes, hashes e parâmetros da moldura.
- previews/: 6 capturas e relatório de encaixe.
- Emblema reaproveitado do kit da revisão 1; manifest.json registra sua referência. Não é uma segunda geração desse emblema.

## Aplicação

A moldura usa nove partes (border-image-slice:174 fill), com cantos quadrados preservados em escala uniforme. Somente os trilhos retos e o papel central se adaptam ao tamanho do cartão. Não esticar a imagem inteira com background-size:100% 100%. Largura visual dos cantos: 18 px padrão, 15 px na menor tela e 30 px apenas na apresentação ampliada isolada. O fundo é opaco; a camada toda fica dentro do painel, sem bloquear os estados ao redor.

Fonte da composição: scripts/assets/airport-choice-preview-v3/index.html e theme.css. A folha herda os estilos de controles da revisão 2, usa a imagem real na moldura/fundo e mantém os textos separados. Emblema e título centralizados para liberar os cantos ilustrados. Não aumentar o cartão para mostrar mais decoração. Mantidos o centro do tabuleiro e os contratos funcionais das revisões anteriores.

Validação: 6 capturas; composições sobre o tabuleiro em 1280×720, 800×360 e 667×280, incluindo estado escolhido nas duas telas móveis. Sem interseção do painel/moldura com os 26 estados, com margem de 3 px; sem texto transbordando ou erros de página. Capturas são protótipos sobre fundo estático, não integração funcional. modal-art.png é estudo ampliado do acabamento e não representa tamanho de partida.

Reprodução: node scripts/assets/olympic-choice-art-qa.mjs --airport --illustrated. O roteiro codifica o WebP com proporção preservada a partir da fonte e registra hashes. A integração deve medir os polígonos reais/câmera atual, respeitar o miolo, prazos e elegibilidade já existentes.

Duas novas gerações de imagem nesta etapa, uma por modal. Zero créditos Meshy. Sem mudanças no tabuleiro, câmera, modelos, comandos ou regras. Sem commit/merge nesta entrega.
