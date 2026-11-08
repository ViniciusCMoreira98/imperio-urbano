# Reconstrução nativa, sem deformar o atlas

Estudo ?mobileStyle=rectangular, separado do visual padrão. As 26 propriedades são retângulos de 1×3 unidades. Todas as 34 casas usam geometria direta e texturas próprias. A câmera antiga não projeta mais a arte sobre esta versão. Fontes originais preservadas, com imagem contida proporcionalmente; sem crop ou scale diferente em cada eixo.

Arquivos tiles/*.png são as 34 texturas realmente usadas na captura. Incluem valores de aluguel de um snapshot de demonstração e orientação invertida em 180° nos lados norte/leste para leitura na câmera. Não são preços estáticos de produção. texture-proportions.json comprova densidade uniforme: erro menor que 0,04% por arredondamento de pixels.

Capturas do GameScreen real em 800×360 e 667×280, DPR 2, conexão simulada e propriedades de vários jogadores com níveis variados. Script mobile-rectangular-study-qa.mjs espera todas as faces antes de salvar e confere o comando de rolar, seleção de RN e gaveta. Nenhum teste de desempenho em aparelho físico. Nenhum crédito Meshy ou geração de imagens externa utilizado.

Fonte do layout: rectangularLayout.ts. Composição de superfícies: RectangularBoardStudy.tsx. Não usar as versões rejeitadas como direção aprovada. O usuário ainda não aprovou esta nova prévia.
