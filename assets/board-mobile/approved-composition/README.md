# Composição visual das 34 casas

Montagem estática para revisão da direção aprovada. Não é captura de partida conectada e não está integrada ao GameScreen.

- Página: /scripts/assets/approved-board-composition-preview/.
- Componentes: apps/web/src/board-presentation/ApprovedBoardComposition.tsx e ApprovedBoardKit.tsx.
- Layout: approvedCompositionLayout.ts; IDs/ordem sempre do catálogo oficial.
- Cenário central: panorama original gerado; prompt e procedência neste diretório.
- Construções: model-sprites/ guarda renders dos seis GLBs existentes em quatro cores. Manifesto inclui hashes/escala; não usar como substituição dos GLBs no jogo.
- Capturas: review/composition-WxH.png, geradas com DPR 2. Tamanhos CSS nos nomes; não interpretar resolução do PNG como tamanho do telefone.
- Conferência: node scripts/assets/approved-board-composition-qa.mjs. Navegador e Vite fechados ao terminar.

Os valores são exemplos calculados do catálogo para níveis demonstrativos. Não representam snapshot real. A seleção, rolagem e controles apenas registram callbacks de revisão. Usar valores e comandos oficiais ao integrar.

Comparação visual: mantém artes estaduais, moldura dourada, faixas marfim e cenário brasileiro. Composição frontal ainda difere da perspectiva do conceito; leitura das faixas laterais em 667×280 segue pendente. Zero novos créditos Meshy. Não certifica aparelho físico, desempenho, multiplayer ou aprovação estética.

Validação: build e 180 testes aprovados; cinco viewports, 34 casas oficiais, 26 estados/8 especiais, modelos originais, nenhum preço cortado ou coberto. Relatório em review/report.json.
