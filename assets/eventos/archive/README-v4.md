# Cartas de evento — versão vigente v4 (arte autoral)

O usuário esclareceu que a referência servia somente para as proporções verticais, não para copiar a arte. A versão vigente tem desenho próprio: fundo azul profundo com nuances de petróleo, filetes finos em cobre, cantos chanfrados e motivos geométricos discretos. O título é integrado à superfície da carta, sem faixa, e a imagem tem mais espaço. A proporção 420:600 foi mantida. **Sem nenhum botão ou seletor. O tempo de exibição e a escolha no tabuleiro serão definidos e integrados pelo Claude.** Esta versão substitui visualmente v1/v2/v3, preservando o fluxo passivo solicitado.

## Usar estes arquivos

- `apps/web/src/event-art/EventNotificationCard.tsx`: componente React passivo, recebe somente `eventId`. ID desconhecido não renderiza carta.
- `apps/web/src/event-art/event-original-v4.css`: carta e camada opcional `sc-event-layer`, sem captura de cliques, escurecimento ou bloqueio de foco.
- `apps/web/src/event-art/art/card-original-v4.svg`: moldura autoral editável. Não usa os assets de fundo claro e faixa azul da v3.
- `apps/web/src/event-art/events.json`: seis registros, com `cardTitle` e `cardText` próprios para a carta simplificada. Não há rótulos de ação.
- `apps/web/src/event-art/art/*-v1.webp`: as seis ilustrações já criadas. A dança mantém a imagem corrigida conforme a fotografia enviada pelo usuário.

Textos permanecem em HTML. As ilustrações são exibidas com proporção preservada, sem recortar ou esticar os personagens. O componente não possui botões, campos, seletor de estado, função de fechar, callbacks, cálculos financeiros ou temporizador. O host controla quando montá-lo e quando removê-lo. Não usar `showModal()`, fundo escuro, blur ou overlay que bloqueie o tabuleiro.

As seis ilustrações somam 2.148.714 bytes; a nova moldura v4 tem 1.872 bytes. O frame luxuoso v2 continua apenas como material histórico, não é usado pela versão atual. Os diretórios `assets/3d/reviews/event-modals/v1/` e `v2/` preservam exemplos anteriores. O guia anterior, a prévia interativa e a QA v2 ficam em `archive/` e **não são a especificação atual**.

## Fluxo para Claude

1. O jogador para na casa de evento e o servidor determina a carta.
2. O host mostra a carta por um tempo definido pela engenharia. Esta entrega não fixa uma duração nem adiciona timer ao componente visual.
3. O host retira a carta.
4. Quando necessário, o jogador escolhe o estado diretamente no tabuleiro, que deve estar visível e sem bloqueio de uma camada modal invisível. Não abrir lista ou botão dentro da carta.
5. O servidor valida a escolha e resolve o evento pendente. O desaparecimento da carta não pode confirmar, cancelar ou aplicar o efeito por si só, nem liberar outras ações indevidas enquanto a escolha está pendente.

O pedido atual substitui a antiga instrução de manter um modal aberto até a escolha: **não reaplicar esse comportamento**. As seis regras continuam sendo responsabilidade do servidor.

| ID visual proposto | Regra solicitada |
|---|---|
| `assalto` | Assalto noturno: pagar R$ 200,00 |
| `caramelo-viral` | Vídeo da dança viraliza: ganhar R$ 300,00 |
| `incendio` | Escolher estado de oponente; fica desocupado e disponível para nova compra |
| `visita-olimpica` | Ir até o estado-sede atual das Olimpíadas |
| `escolha-sede` | Escolher um estado para sediar as Olimpíadas |
| `apagao` | Escolher estado afetado; ninguém paga aluguel até o dono parar nele três vezes |

Continuam sem definição adicional neste pedido: destino do pagamento/fonte do prêmio; construções após incêndio; comportamento sem alvo/sede; efeitos de passar pelo início na viagem; reaplicação de apagão e troca de dono. Não inventar essas regras no componente de arte. O contador do apagão deve vir do servidor e pode ser mostrado na apresentação da propriedade ou do tabuleiro, não há controle interativo dele na carta.

## Prévia e validação

Abrir `/scripts/assets/event-modals-preview/?event=incendio` com Vite na raiz. `?gallery=1` mostra as seis cartas. A prévia usa o componente React real sobre uma **captura do tabuleiro**, apenas para demonstrar a composição. Não é uma partida conectada e não implementa seleção de estados. `window.eventSimpleQA.hide()` simula o host retirando a carta; `show(id)` a mostra. Não há timer, seletor ou botões de demonstração na tela.

`node scripts/assets/event-original-vectors.mjs` reproduz a moldura e o manifesto v4. `node scripts/assets/event-modals-qa.mjs` confere seis cartas em 1536×1024, 1280×720, 844×390 e 667×375 (24 combinações), texto e título, ausência total de controles/diálogo, camada transparente que permite passagem de clique, retirada da carta, tabuleiro visível depois dela e hashes dos SVG. Capturas e relatório em `assets/3d/reviews/event-modals/`. TypeScript e build também conferidos; sem nova partida conectada ou teste em celular físico.

## Procedência

Ilustrações: image_gen integrado, com fontes em `source/`, prompts em `prompts.json` e hashes em `manifest.json`. A ilustração da dança é uma estilização da fotografia fornecida pelo usuário; os direitos comerciais dessa entrada não foram confirmados no registro, preservando `commercialUse: null` no inventário. As outras cinco usaram arte própria do projeto como direção visual. A fotografia não é distribuída como asset.

SVG v4: arte original do projeto, manifesto `original-v4-manifest.json`. Os arquivos v3 e as prévias anteriores são apenas históricos. Sem nova geração de imagem ou consumo de créditos Meshy nesta revisão simplificada. O pedido C10 continua separado e pendente. Não altera Saque, Taxa ou as regras de produção.
