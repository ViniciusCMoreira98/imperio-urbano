# Ícone do app — 08/11/2026

Arte vetorial original: coroa dourada, monograma IU, escudo verde e fundo azul. O emblema substitui a reprodução em tamanho reduzido do logotipo completo. O acabamento continua a linguagem de gradientes, ouro e azul do kit de ícones do projeto. Não usa fontes externas, imagens de terceiros, geração raster ou Meshy.

Fonte editável: `source/app-icon-v1.svg`. Exportação: `node scripts/assets/pwa-icons.mjs`. Foram mantidos os caminhos e tamanhos usados pelo manifesto e pelo HTML:

| Arquivo em `apps/web/public/` | Tamanho |
|---|---|
| `icon-192.png` | 192×192 |
| `icon-512.png` | 512×512 |
| `icon-maskable-512.png` | 512×512 |
| `apple-touch-icon.png` | 180×180 |

Todos têm fundo opaco e sangrado. O emblema, sem a sombra decorativa, ocupa raio máximo de 176,2 px na fonte de 512 px; a zona segura circular de 80% permite até 204,8 px. Por isso as versões normal e maskable podem usar a mesma composição sem reduzir ainda mais a identidade.

Conferência: `node scripts/assets/app-icon-qa.mjs`. Verifica dimensões PNG, hashes e zona segura rasterizando o emblema real. Prévia em `review/icon-preview.png`; formas circular/arredondada são simulações de recorte, não capturas de um launcher físico. Dados em `manifest.json`.

Nome, orientação, display, rotas, botão de instalação e lógica da PWA não mudaram. O manifesto continua apontando para os mesmos arquivos. Sem commit ou merge nesta entrega.
