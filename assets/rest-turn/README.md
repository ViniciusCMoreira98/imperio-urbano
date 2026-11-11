# Modal da própria vez no Descanso — 11/11/2026

Implementado na interface real da V1, branch develop_arte_3d, em RestTurnChoice (GameScreen). Usa os comandos de servidor já existentes; não é apenas composição de arte.

## Comportamento

- Aparece somente para o jogador da tela, na própria vez mostrada, com partida em andamento, fase AWAITING_ROLL, posição REST e skipTurns > 0. Espera dados, movimentos e carta de evento terminarem. Visitar a casa sem penalidade não abre o modal.
- Duas opções: **Utilizar carta** e **Rolar dados**. Sem Passe Livre, a primeira permanece visível/desabilitada com “Sem Passe Livre”. Aluguel Zero não substitui Passe Livre.
- Utilizar carta envia USE_REST_PASS. Não rola automaticamente em seguida; a resposta oficial libera o jogador e a barra normal volta a oferecer a jogada. Rolar dados envia ROLL_DICE e preserva a regra de sair com dupla.
- Quantidade de cartas, contagem do Descanso e prazo vêm do estado oficial. O cliente não desconta inventário nem antecipa movimento.
- Um envio bloqueia os dois botões enquanto aguarda. Recusa do servidor permite tentar novamente; desconexão bloqueia ambos e a ressincronia libera a interface conforme o snapshot. Falha no envio não mantém o bloqueio preso.
- Prazo do servidor permanece no painel. A barra normal oculta rolagem, RestChip e contador redundantes durante a escolha, evitando dois botões de rolagem e dois alertas sonoros.
- Foco fica entre as opções disponíveis (ou no diálogo se ambas bloqueadas) e volta ao elemento anterior ao fechar. Não há ação de Escape ou toque fora que use carta ou role por acidente. No celular em pé, o modal é desmontado e o aviso de girar continua prioritário.

## Arte e fontes

Moldura floral dourada/esmeralda/marfim reutilizada do aviso de dados iguais, copiada para apps/web/src/hud/art/rest-turn/frame-v1.webp para empacotamento da aplicação. Procedência original e prompt: assets/notices/doubles-v1/. O cabeçalho reutiliza apps/web/src/event-art/art/passe-livre-v1.webp, com origem em assets/eventos/passe-livre-manifest.json. Nenhuma geração adicional de imagem e zero créditos Meshy.

Arquivos: apps/web/src/game/restChoice.ts (elegibilidade), hud/RestTurnChoice.tsx e restTurnChoice.css (modal), GameScreen.tsx (montagem) e ActionBar.tsx (remoção de duplicidades). O RestChip também passa a quebrar linhas no HUD móvel, em vez de transbordar a coluna quando aparece fora da escolha.

Moldura em nove partes, slice220 fill; cantos preservados. Dois botões lado a lado, sem escurecer o cenário. Arte, nomes, valores e personagens do tabuleiro preservados. O painel fica no miolo; as superfícies renderizadas dos 26 estados foram conferidas sem interseção, incluindo margem de 3 px, em 800×360 e 667×280.

## Validação e limites

198 testes do frontend aprovados, incluindo três novos casos de elegibilidade; TypeScript/build aprovados. Roteiro scripts/assets/rest-turn-choice-qa.mjs usa GameScreen real e intercepta WebSocket com snapshots simulados. Capturas e report.json em review/.

Confere os envelopes USE_REST_PASS/ROLL_DICE, bloqueio durante resposta, ausência de desconto otimista, recusa/reabertura, ausência de Passe Livre, saída do Descanso, outra vez, animação de dados, offline, foco/Tab e prioridade do aviso de girar. Cada dimensão de captura é inicializada naquele viewport. Não é teste de multiplayer real, aparelho físico ou aceitação dos comandos por uma API ativa. Nenhuma regra/protocolo/backend foi alterado; a engenharia deve preservar as ações existentes na integração de branches.

Reprodução: node scripts/assets/rest-turn-choice-qa.mjs, com PLAYWRIGHT_BROWSERS_PATH habitual; servidor de QA na porta 4196. Sem commit/merge nesta entrega.
