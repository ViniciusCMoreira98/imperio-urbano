# Personagens 3D: prompts e fluxo de produção

Fluxo definido pela [guideline de assets 3D](06-guideline-assets-3d.md): **imagem de conceito → Meshy (imagem para 3D) → esqueleto e animações → GLB validado → integração**. Estilo alvo: [visual-alvo.webp](referencias/visual-alvo.webp), cartoon 3D chibi com identidade própria (sem copiar personagens de outras obras).

## 1. Imagem de conceito (entrada do Meshy)

Gere na ferramenta de imagem de sua preferência. Se ela aceitar, envie `visual-alvo.webp` como referência de estilo. A imagem serve para o Meshy reconstruir o modelo, então o que importa é a **leitura do corpo**, não a pose bonita:

- Corpo inteiro, **de frente**, em **A-pose** (braços abertos uns 30–45° para baixo, pernas levemente afastadas). Mãos vazias; acessórios presos ao corpo.
- **Fundo branco ou cinza liso**, luz uniforme, sem sombra no chão, sem base, sem texto.
- Personagem centralizado, ocupando quase toda a altura da imagem; 1024 × 1024 px ou mais.
- Opcional, melhora muito o resultado: gerar também **costas** e **perfil** do mesmo personagem (o Meshy aceita várias vistas).
- Confira se o plano da ferramenta permite **uso comercial**.

### Estilo (cole no início de cada prompt)

> Personagem 3D estilo cartoon chibi para jogo de tabuleiro mobile, renderização 3D estilizada (como figura de vinil), cabeça grande (2,5 cabeças de altura), olhos grandes e expressivos, cores vivas e saturadas, formas simples e arredondadas, poucos detalhes finos, corpo inteiro, vista frontal, A-pose (braços abertos para baixo, pernas levemente afastadas), mãos vazias, fundo branco liso, luz uniforme de estúdio, sem sombra, sem base, sem texto.

### Personagens

1. **Jurema** — garota de pele morena, cabelo cacheado volumoso preso com uma flor de ipê amarelo, roupa moderna em roxo e dourado com detalhes de penas.
2. **Caio** — rapaz de cabelo prateado arrepiado e olhos violeta, casaco longo roxo-escuro com detalhes dourados, luvas.
3. **Luana** — garota de cabelo rosa em duas marias-chiquinhas com laços, vestido branco e vermelho com babados, botas, pequena coroa dourada.
4. **Iara** — garota de cabelo verde-água longo, roupa de exploradora da Amazônia em verde-escuro com capuz curto, pulseiras de sementes.
5. **Otávio** — garoto loiro de cabelo cacheado, estilo aventureiro: chapéu marrom com óculos de proteção, colete de couro, cachecol, mochila pequena.

Salve como `assets/avatars/conceito/personagem-1.png` … `personagem-5.png` (e `-costas`, `-perfil` se gerar).

## 2. Meshy: imagem para 3D

No site meshy.ai, **Image to 3D** (ou Multi-view, se tiver as três vistas):

- Topologia: **triângulos**; contagem alvo **~15 mil triângulos** por personagem (bom para celular).
- Textura: ativada, **PBR desligado ou simples**, resolução **1024**.
- Pose: **A-pose** (opção "symmetry/A-pose" quando existir).
- Gere e confira antes de seguir: rosto legível, mãos e pés inteiros, sem buracos ou "derretidos".

## 3. Esqueleto e animações

A guideline não presume rigging pronto. Duas opções:

- **Meshy → Animate/Rigging**: rigging automático de humanoide e biblioteca de animações.
- **Mixamo** (gratuito): envie o modelo em FBX/OBJ, marque os pontos do corpo e aplique as animações.

Animações necessárias, com estes **nomes exatos** (o jogo procura por eles):

| Nome | Uso no jogo |
|---|---|
| `idle` | parado na casa |
| `walk` | andando entre casas |
| `celebrate` | vitória / compra importante |
| `defeat` | falência |

Exporte **um único GLB por personagem** com as quatro animações, texturas embutidas, escala em metros, personagem olhando para **+Z** e pés em **y = 0**.

## 4. Validação antes de integrar (critérios da guideline)

- Abre num visualizador glTF (ex.: gltf-viewer.donmccurdy.com) sem erros.
- Até ~20 mil triângulos, 1 material, textura de até 1024 px, arquivo abaixo de ~3 MB.
- As quatro animações tocam sem pés deslizando nem partes atravessando o corpo.

Coloque os arquivos em `assets/avatars/modelos/avatar-1.glb` … `avatar-5.glb` e me avise: eu valido, otimizo se preciso, troco os modelos atuais (Kenney) e ligo comemoração e derrota no fim da partida.

## Custos e chaves

Gerar no site do Meshy usa os créditos da **sua** conta. Se um dia automatizarmos pela API do Meshy, a chave fica só no servidor (nunca no navegador) e nenhuma geração paga roda sem sua autorização.
