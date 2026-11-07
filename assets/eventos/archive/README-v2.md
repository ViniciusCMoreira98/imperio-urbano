# Cartas dos seis eventos — assets v2

Entrega de seis ilustrações e composição dos modais solicitados pelo usuário. As imagens são novas, feitas com o image_gen integrado, e os textos/regras/valores ficam separados em HTML e JSON. A lógica dos seis eventos ainda precisa ser integrada pela engenharia.

## Refinamento visual v2

A pedido do usuário, as seis cartas ganharam uma moldura ilustrada exclusiva de metal dourado e esmalte azul profundo, com detalhes de cartas e louros. A ilustração recebe mais espaço; categoria, título, regra e seletor têm hierarquia própria. O valor/efeito fica no rodapé junto da ação, dentro do contorno interno. A cena da dança enviada pelo usuário foi preservada.

Novo asset: `apps/web/src/event-art/art/event-frame-v2.webp` (1600×900, 219.504 bytes, cantos transparentes). Fonte: `source/event-frame-v2.png`; prompt exato: `frame-v2-prompt.json`; hashes/procedência: `frame-v2-manifest.json`. Geração pelo image_gen integrado. Seis ilustrações + moldura: 2.368.218 bytes. Sem Meshy/créditos Meshy.

Usar **`event-modals-v2.css`**, que importa a base `event-modals.css`; a prévia já usa a versão nova. O markup move o efeito/contador para `.ev-summary` dentro de `.ev-footer`. Arquivos e galeria anteriores foram preservados em `assets/3d/reviews/event-modals/v1/` para comparação. Os dados e regras não foram alterados pelo refinamento.

`node scripts/assets/prepare-event-frame.mjs` reproduz o WebP da moldura. A QA v2 também confere o hash desse asset e o encaixe do rodapé. Todas as 24 combinações foram aprovadas novamente, incluindo 844×390 e 667×375.

## Arquivos

Ilustrações para uso: `apps/web/src/event-art/art/`, em WebP, 1280×853, proporção preservada. Seis arquivos, 2.148.714 bytes no total. Fontes PNG: `assets/eventos/source/`, 17.488.203 bytes. Prompts exatos: `prompts.json`; procedência, tamanhos e hashes: `manifest.json`.

| ID proposto | Imagem | Descrição e efeito pedidos |
|---|---|---|
| `assalto` | `assalto-v1.webp` | Distração na rua à noite e assalto; pagar R$ 200,00 |
| `caramelo-viral` | `caramelo-viral-v1.webp` | Vídeo da dança com o cachorro viraliza; ganhar R$ 300,00 |
| `incendio` | `incendio-v1.webp` | Escolher um estado de um oponente; fica desocupado e disponível para nova compra |
| `visita-olimpica` | `visita-olimpica-v1.webp` | Viagem paga para o estado-sede atual das Olimpíadas |
| `escolha-sede` | `escolha-sede-v1.webp` | Convite do Comitê para escolher o estado que sediará as Olimpíadas |
| `apagao` | `apagao-v1.webp` | Escolher estado afetado; ninguém paga aluguel até o dono parar nele três vezes |

**Correção específica da dança:** a primeira proposta com rapaz de camisa azul e cachorro amarelo foi descartada. O arquivo final usa o rapaz de bermuda verde, o cachorro pequeno e o muro com a bandeira da fotografia que o usuário enviou depois. O cachorro mantém a pelagem dessa referência, sem substituí-lo por um golden retriever ou adicionar uniforme/óculos. A fotografia não é distribuída neste pacote.

As outras cinco ilustrações usam arte original do projeto como direção visual. A dança é uma estilização da fotografia fornecida, não uma geração sem referência de pessoa. O inventário registra `commercialUse: null` para esse arquivo porque não há confirmação registrada dos direitos comerciais da fotografia de entrada; isso não bloqueia a criação da prévia solicitada, mas o registro não deve ser convertido em uma autorização inventada.

## Composição e prévias

`apps/web/src/event-art/events.json` contém seis registros visuais independentes, com título, descrição, regra, badge, rótulo da ação e tipo de escolha. IDs são propostas para mapeamento; não alteram o catálogo ou os tipos oficiais do servidor.

`event-modals-v2.css` monta uma carta de evento em paisagem: ilustração à esquerda e texto/regra à direita, com valor/efeito destacado, seletor de estado quando necessário e ação no rodapé. Os contornos e botões reutilizam os assets próprios em `settings-art/art/`; nenhuma captura de tela foi achatada em uma interface rígida. Imagens usam `object-fit: contain`, sem esticar ou recortar o rapaz/cachorro. O contador de apagão é HTML, com três marcadores e valor 0/3 a 3/3.

Prévia: `/scripts/assets/event-modals-preview/` com Vite na raiz. Para abrir um evento direto: `?event=caramelo-viral`, por exemplo. `?gallery=1` mostra as seis cartas juntas. A prévia tem seleção de estado e mensagem de confirmação local; não altera saldo, dono, construção, aluguel, sede ou posição de peão.

O diálogo da prévia usa `showModal()`, foco nativo e Escape. O fechar é somente uma ferramenta da demonstração: a engenharia deve decidir como impedir que um evento obrigatório seja pulado. As três propriedades exemplificadas nos seletores e a sede “Rio de Janeiro” são dados fictícios de apresentação, não o estado atual da partida.

## Integração necessária — Claude

1. Registrar as seis cartas no catálogo oficial e sortear/resolver cada uma ao parar na casa de evento, conforme o pedido do usuário. Mapear cada ID oficial à sua ilustração.
2. O servidor deve calcular e confirmar todos os efeitos e fornecer estados elegíveis, sede atual e contador de recuperação no snapshot. O cliente apenas mostra esses dados. Evitar efeitos duplicados ao reconectar, reabrir ou confirmar novamente.
3. Assalto: perda exata de R$ 200,00. Dança: ganho exato de R$ 300,00. Usar o fluxo financeiro oficial; o destino do pagamento e a fonte do prêmio não foram especificados neste pedido.
4. Incêndio: seleção obrigatória de propriedade de um oponente; estado escolhido fica livre para compra. O usuário não especificou separadamente o tratamento das construções existentes nem o que fazer se não houver alvo; resolver esses casos antes de implementar a transição.
5. Visita: destino dinâmico é o estado-sede atual, não RJ fixo. A prévia bloqueia a ação sem sede, mas o comportamento de jogo se não existir sede, os efeitos de passar pelo início e os efeitos da chegada ainda precisam ser definidos pela engenharia/produto.
6. Comitê: mostrar os estados que o servidor permitir selecionar para sediar os jogos. O pedido não restringe a escolha a estados do jogador; não inventar essa restrição no cliente.
7. Apagão: o estado escolhido não cobra aluguel de ninguém enquanto estiver sem energia. Contar três chegadas do proprietário que termina o movimento nesse estado; somente passar por ele não corresponde a parar nele. O contador e a restauração são do servidor, não de um temporizador ou montagem da interface. Não inventar uma cobrança ou prazo alternativo. Reaplicação do apagão, troca de dono e efeitos de outros eventos precisam ter tratamento explícito na regra oficial.
8. O `hud/CardReveal.tsx` atual é uma notificação que fecha após 4,5 segundos e não suporta escolhas. Não usá-lo como temporizador para confirmar ou descartar incêndio, seleção de sede ou apagão. É necessário um fluxo de decisão pendente com modal até a resolução oficial.

O pedido C10 das Olimpíadas é separado deste pacote; este trabalho não o declara concluído. Não modifica a regra do Saque ou do pote da Taxa.

## Reprodução e validação

`node scripts/assets/prepare-event-art.mjs` reproduz os WebP usando Chromium/Playwright (qualidade 92, redução sem ampliação). `node scripts/assets/event-modals-qa.mjs` verifica os seis eventos em 1536×1024, 1280×720, 844×390 e 667×375: 24 combinações, valores −200/+300, escolhas obrigatórias, ausência de alvos/sede, contador 2/3, fechamento, decodificação e proporção das imagens, encaixe da arte e dos textos e hashes. Capturas e relatório em `assets/3d/reviews/event-modals/`.

Foram verificadas prévias controladas, sem nova partida conectada ou alteração das regras do backend. Nenhum uso do Meshy ou consumo de créditos Meshy.
