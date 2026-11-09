# V1 — revisão de cenários carregados, 09/11/2026

Capturas do GameScreen real, com snapshots simulados e os modelos existentes. Não são conceitos gerados nem validação em aparelho físico ou multiplayer real.

Reprodução: `node scripts/assets/v1-adverse-qa.mjs --strict`, com o Chromium do Playwright instalado. O roteiro inicia e fecha seu próprio servidor local na porta 4193. No Windows deste ambiente, definir `PLAYWRIGHT_BROWSERS_PATH=C:\Users\Plust\AppData\Local\ms-playwright`.

## Cenários

- Todos os 26 estados com hotéis, São Paulo sediando Olimpíadas no multiplicador máximo 10, Ceará em Apagão, Taxa acumulada em R$ 60.000 e saldos até R$ 1.234.567. Capturas em 1280×720, 800×360 e 667×280.
- Quatro jogadores juntos no Maranhão em Apagão, níveis de construção variados e Minas Gerais sediando Olimpíadas.
- Quatro jogadores juntos no Rio Grande do Norte sediando Olimpíadas, com hotéis.
- Quatro jogadores juntos em São Paulo sediando Olimpíadas, com hotéis.

Os três cenários de ocupação são capturados em 800×360 e 667×280. Quatro jogadores é o limite vigente do catálogo; não usar a fixture histórica de seis como configuração válida do servidor.

## Verificações e limites

O relatório registra os valores das 26 placas, medição do texto dentro de cada placa, fila de renderização, hotéis carregados, bases distintas dos personagens, mesma pose da câmera em todas as telas, saldos sem transbordamento e controles dentro da janela. Confere os aluguéis contra o catálogo oficial e o multiplicador; Apagão substitui o valor. Testa também o alcance dos botões pelo apontador e a abertura da consulta completa da propriedade.

Inspeção visual: quatro personagens na mesma propriedade estreita apresentam oclusão parcial dos corpos pela perspectiva. Bases distintas não garantem quatro silhuetas inteiramente visíveis. As capturas não certificam identificação individual de todos os ocupantes nem leitura confortável dos menores textos num telefone físico. Não reduzir mais os modelos nem alterar a câmera apenas para fazer as verificações passarem.

Sem alteração do renderizador, artes ou modelos nesta revisão; sem consumo de créditos Meshy. A V2 permanece separada. `report.json` contém as medições; os PNGs mostram a implementação da V1.
