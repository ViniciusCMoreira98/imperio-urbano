# Nova arte do estado-sede — 11/11/2026

Proposta de acabamento mais marcante para a propriedade que está sediando as Olimpíadas, no tabuleiro V1 (develop_arte_3d). Ainda não substitui OlympicHost/olympic-frame-v2 na partida.

## Direção visual

Moldura azul-cobalto de maior contraste, dourado mais forte, filete ciano, detalhes das cinco cores, aros maiores, louros e placa própria de SEDE OLÍMPICA. O preenchimento central é transparente para preservar a arte do estado e seus dados. Cor do proprietário, UF, nome e aluguel permanecem separados. Não usar tocha, futebol ou novas construções. A família atual de terreno/casas/hotel e os personagens não foram alterados.

Também criado um marcador complementar horizontal com aros grandes e faixa azul vazia. Ele permite identificação adicional da sede quando a moldura de piso ficar pequena; posicionamento real deve ser calibrado sem invadir outro estado, esconder aluguel, foto ou personagens. Não é uma nova casa especial de Olimpíadas.

## Assets

- frame-source.png: fonte original transparente da moldura, preservada.
- frame.webp: 768×1024, 157.470 bytes.
- badge-source.png: fonte original transparente do marcador complementar.
- badge.webp: 768×384, 117.048 bytes.
- frame-prompt.json e badge-prompt.json: prompts integrais; manifest.json: dimensões/hashes/procedência dos dois assets.
- previews/comparison.png: comparação de propriedade comum com a proposta de sede.
- previews/host-closeup.png: detalhe frontal da proposta.
- previews/comparison-small.png: apresentação reduzida do mesmo estudo.

Duas imagens novas geradas com image_gen integrado. Alpha preservado no centro e no exterior; nome, foto e aluguel têm pontos de transparência conferidos no relatório. Textos e valores não são parte dos bitmaps. Não deformar a imagem ou achatar os aros.

## Importante para integração pelo Claude

Esta é uma prévia frontal de acabamento, **não uma captura da partida nem teste em telefone físico**. Fonte em scripts/assets/olympic-highlight-preview/index.html. A foto original SP é reutilizada sem deformação. O exemplo de aluguel usa SP sem construções: R$ 20 base, R$ 40 com multiplicador ×2 já aplicado. Na partida usar currentRent e snapshot.olympics, nunca fixar esses valores ou multiplicador.

1. Aplicar somente ao estado de snapshot.olympics.hostStateId, removendo a identificação anterior quando a sede mudar. Preservar Olympics especiais, sequência dos 34 espaços, regras, dono e modelos atuais.
2. A moldura nova tem crest/placa maiores: a abertura transparente começa perto de 29% da altura da imagem. O olympicFrameGrid atual foi calibrado para outra arte, com sourceY em 0/.14/.9/1. **Não substituir a textura mantendo essa malha sem recalibrar**: a placa pode cobrir nome e foto ou os aros podem deformar.
3. Recalibrar UVs/faixas preservando aros e louros em proporção uniforme; acomodar os trilhos simples ao contorno real. Preservar UF/nome/cor do dono, ilustração, faixa de aluguel e construções/peões. Não expandir adornos por cima dos estados vizinhos para ganhar tamanho.
4. Renderizar SEDE OLÍMPICA em texto nativo na placa, e o multiplicador atual separado. Valor do aluguel já inclui o multiplicador. Não cobrar ou aplicar o bônus duas vezes por causa da apresentação.
5. O badge complementar é opcional de apresentação: calibrar junto ao próprio estado ou na consulta correspondente, sem virar placa genérica no centro do tabuleiro e sem bloquear os alvos de clique. Não colocar enormes banners sobre as cabeças. A aparência deve distinguir sede de estado apenas selecionado/propriedade de determinado dono.
6. Validar pelo menos RN e SP (verticais), MA e MG (horizontais), construções 0–5 e 1–4 ocupantes, computador/800×360/667×280. Fotografias, UF, aluguel, prédios e peões não podem ser cobertos. Toques atravessam a ornamentação decorativa; respeitar a ordem de renderização existente dos aluguéis/personagens. Reduzir movimento se acrescentar qualquer animação; esta entrega não exige pulsação ou partículas.

## Reprodução

node scripts/assets/olympic-highlight-art-qa.mjs prepara os WebPs e produz três capturas na porta 4197. Confere transparência do espaço dos dados/foto, proporção das imagens, texto sem transbordar e ausência de erros de página. Não valida a projeção nova na malha 3D: essa calibração continua pendente na integração.

Zero créditos Meshy, sem modelo novo ou alteração do tabuleiro real. Versões anteriores preservadas. Sem commit/merge nesta entrega.
