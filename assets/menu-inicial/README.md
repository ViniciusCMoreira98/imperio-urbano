# Menu inicial — pacote de arte v1

Pedido: criar os assets da referência de menu tropical fornecida pelo usuário. Entrega de arte e composição isolada; a tela inicial atual do jogo não foi substituída.

## Arquivos para uso no jogo

Pasta: `apps/web/src/main-menu/art/`.

| Arquivo | Uso |
|---|---|
| `background-v1.webp` | Cenário completo de praia e deque, sem interface, cachorro ou letras |
| `logo-v1.webp` | Logotipo com coroa e faixa, fundo transparente |
| `mascot-v1.webp` | Cachorro com camisa do Brasil e bola, fundo transparente |
| `dice-v1.webp` | Par de dados, fundo transparente |
| `button-green-v1.svg` | Moldura vazia de Jogar Agora |
| `button-blue-v1.svg` | Moldura vazia de Jogar Online |
| `button-navy-v1.svg` | Moldura vazia de Como Jogar |
| `players-v1.svg`, `book-v1.svg` | Ícones de multiplayer e instruções |
| `coin-v1.svg`, `diamond-v1.svg` | Ícones das moedas e diamantes |
| `plus-v1.svg`, `gear-v1.svg`, `crown-v1.svg` | Adicionar, configurações e nível |
| `laurel-left-v1.svg`, `laurel-right-v1.svg` | Ramos decorativos do botão inferior |

16 assets: 4 WebP e 12 SVG. Os PNG originais ficam em `assets/menu-inicial/source/`. Prompts exatos em `prompts.json`; dimensões, hashes e transparência em `manifest.json`. As ilustrações foram geradas pelo image_gen integrado. SVG e CSS são arte original do projeto, editável. Sem Meshy ou créditos Meshy. O retrato da referência não foi recortado: a prévia usa `avatar-2.webp`, já original do projeto.

## Composição

`apps/web/src/main-menu/menu-assets.css` fornece as molduras dos indicadores, avatar, medidor de experiência, posicionamento e estados de foco, hover, pressionado e desabilitado. As três molduras SVG são vazias: textos em HTML permanecem acessíveis e editáveis. Não incluir textos, valores, nomes ou porcentagens diretamente nas imagens.

`scripts/assets/main-menu-preview/index.html` demonstra a montagem em uma cena 16:9 proporcional, com seis controles de prévia. O cenário é um plano; logotipo, mascote e ícones são camadas independentes. A caneca e as plantas fazem parte do cenário, sem clique próprio. Não esticar cada ilustração por eixo. Os recortes já têm margens e sombras suaves.

Em telas com outra proporção, a prévia contém a cena inteira, com faixas azul-marinho. A engenharia pode reposicionar os elementos em telas ultralargas; evitar cortar os controles ao preencher a janela. A restrição existente para jogar somente em paisagem no celular deve ser mantida pelo host.

## Engenharia

Ligar os botões aos fluxos oficiais existentes somente na integração. Valores de moedas, diamantes, experiência, nível e nome são exemplos estáticos da referência; não representam uma economia já implementada. O rótulo “Partida Clássica (IA)” reproduz a referência visual e não adiciona um modo de IA. O botão de adicionar não abre compra real. A prévia apenas mostra uma mensagem local e não envia comandos, pagamentos ou mensagens externas.

Para servir a prévia, usar Vite na raiz e abrir `/scripts/assets/main-menu-preview/`. Para verificar e capturar: `node scripts/assets/main-menu-qa.mjs`. Para reproduzir SVG: `node scripts/assets/main-menu-vectors.mjs`. Para preparar WebP a partir das fontes: `node scripts/assets/prepare-main-menu.mjs` (Chromium do Playwright instalado).

Capturas e relatório: `assets/3d/reviews/main-menu/`. Verificados 1672×941, 1280×720, 844×390 e 667×375, carregamento das imagens, seis controles, ausência de estouro horizontal e erros de página. Sem nova partida conectada nesta entrega de arte.
