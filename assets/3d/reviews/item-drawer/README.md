# Cartas guardadas — acabamento de 08/11/2026

Ícone original `apps/web/src/hud/art/cards/cards-v1.svg`: duas cartas com moldura dourada, frente verde e selo nas cores brasileiras, seguindo o kit de eventos. O mesmo arquivo aparece no botão e no cabeçalho. Fonte editável vetorial, sem raster de terceiros ou Meshy.

`hud/ItemTray.tsx` usa o ícone e apresenta o cabeçalho “Suas cartas”, com quantidade e fechamento compacto. `hud/itemDrawer.css` dá acabamento azul/dourado ao botão e à gaveta; a disponibilidade do Passe Livre conserva o brilho e ganha fundo verde. As imagens e componentes de Passe Livre e Aluguel Zero foram reutilizados sem mudar sua função. Mantidos contador vermelho, quantidades antigas, aria-expanded/aria-controls, role dialog, Escape, fechar pelo botão e pelo ×, bloqueios e comando USE_REST_PASS.

## Espaço do tabuleiro

Larguras preservadas: 194 px em telas até 500 px de altura e clamp(200 px, 20vw, 280 px) nas demais. `useHudLayout` mede a gaveta ao abrir e reserva sua largura antes da animação de entrada. No computador, usa reserva à direita; no celular, reservas laterais simétricas. A altura é limitada pelo início da barra de ação, incluindo o selo da rodada. Ao fechar, o enquadramento volta ao anterior. O observador acompanha adição/remoção da gaveta e é limpo ao sair da partida.

Nas telas até 340 px, a altura de linha dos nomes e saldos foi ajustada, mantendo os tamanhos de fonte e retratos, para separar os quatro cards de jogador dos botões inferiores.

## Conferência

`node scripts/assets/item-drawer-qa.mjs` monta o GameScreen real com WebSocket controlado, sem sala ou conta reais. Passou em 800×330, 667×280, 932×430 e 1280×720. Verifica o contorno do tabuleiro fora da gaveta, espaço acima da barra/selo, largura móvel de 194 px, ausência de corte horizontal, retorno do enquadramento e abrir/fechar por botão, × e Escape. Usa o Passe Livre por meio do comando oficial e responde com snapshot simulado, conferindo contador e desaparecimento das cartas consumidas. Mantém contagem legada de cinco itens e respeita movimento reduzido.

Capturas `drawer-*` mostram a partida; `detail-*` mostram o painel. `report.json` contém quatro cenários e os quatro comandos. 175 testes e build aprovados durante a revisão. Conferência em Chromium de desktop; sem medição de GPU em celular físico. Sem créditos Meshy, commit ou merge nesta entrega.
