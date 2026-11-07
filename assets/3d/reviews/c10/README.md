# C10 — sede olímpica no tabuleiro e no modal

Entrega local na `develop_arte_3d`, sobre `3b21774`. O usuário autorizou executar a próxima orientação C10. Sem novo modelo Meshy, geração paga, consumo de créditos ou alteração das regras do servidor.

## Tabuleiro

`OlympicHost.tsx` mantém a assinatura `placement` e acrescenta `contour?: readonly [number, number][]`. `Pieces.tsx` já fornece o contorno local real via `olympicLocalContour(anchor)`; consumidores antigos sem contorno usam o retângulo de `placement`.

Louros dourados em baixo-relevo, incrustação verde e um filete dourado marcam a sede. Não há tocha alta, placa opaca ou multiplicador sobre o tabuleiro. A identidade do dono continua no contorno externo existente. A geometria acompanha o contorno arredondado da própria casa, sem mudar câmera, âncoras, nomes, placas ou modelos das construções.

Os insets ficam entre 0,014 e 0,054 unidade para dentro da casa. Folhas usam centros a 0,031, comprimento 0,052 e largura de controle 0,016. Altura máxima acima da superfície: 0,031 unidade. O filete usa espessura entre 0,55 e 1,4 px, proporcional à altura do canvas, para não invadir a placa de aluguel nas telas pequenas. Não aumentar essa largura sem repetir a auditoria de nomes e aluguéis.

O conjunto usa dois meshes de geometria reunida e uma linha, sem luz própria ou textura nova. Materiais e geometrias são liberados ao desmontar/trocar de casa. Pulso leve apenas na emissão dos materiais; `prefers-reduced-motion` congela a apresentação e reage a mudanças da preferência durante a sessão. As três partes não capturam raycast de seleção do jogador.

## Modal

`PropertyEvolutionPanel` aceita a propriedade opcional:

```ts
olympics?: { multiplier: number; edition: number; label: string }
```

`PropertyEvolutionStage` aceita `baseRentLabel?: string`. O componente não multiplica ou divide dinheiro. `game/propertyDecision.ts` fornece o valor original do catálogo e mantém `rentLabel` calculado pela regra existente. `PropertyDecisionDialog.tsx` já fornece ambos os valores e o selo pronto “Sede das Olimpíadas ×N”.

O selo exibe a edição e uma chama vetorial original. Cada uma das seis etapas mostra o valor original riscado e o aluguel com bônus em destaque. Na etapa atual de construção, o valor continua visível, com “Aluguel atual”. O resumo de aluguel já era multiplicado e permanece assim. O texto redundante do rodapé foi reduzido; saldo, recusas, ausência de conexão e preço de aquisição do imóvel livre permanecem no fluxo do host. Estados que não são sede preservam o visual anterior.

Compra, construção e consulta foram conferidas. Os controles financeiros e as regras não mudaram.

## Evidências

- 141 testes, incluindo geometria dos 26 estados nos quatro lados, folgas até as áreas de personagens/construções e origem dos seis aluguéis; TypeScript e build aprovados.
- `c10-modal-qa.mjs`: três modos × quatro telas, mais hotel, nome longo, ×10 e estado sem sede. Relatório `modal-report.json`.
- `c10-board-qa.mjs`: RN, AC, PB e MA com hotel e quatro personagens em 1280×720 e 844×390; movimento reduzido e retomada do pulso. A auditoria de raios usa a geometria real, incluindo a linha, sobre pontos de nome e aluguel. O roteiro aguarda o índice correto da casa antes de medir, para não comparar o contorno da seleção anterior. Relatório `board-report.json` e capturas/detalhes.
- `c10-connected-qa.mjs`: API Spring Boot real, banco local, quatro sessões e WebSockets; dado de desenvolvedor, compra e seleção da sede via comandos oficiais. Modal aberto por clique no tabuleiro e os seis pares de aluguel conferidos em 1280×720 e 844×390. Relatório `connected-report.json`; credenciais da sessão ficam somente em staging ignorado pelo Git.

Prévia do tabuleiro: `/scripts/assets/board34-preview/?olympics=1`. Prévia do modal: `/scripts/assets/c10-modal-preview/`. Os scripts de QA precisam do Chromium instalado pelo Playwright; os scripts de prévia controlada sobem seu próprio Vite. O teste conectado usa interface local em 5185 e API local em 8085 com dev-tools habilitado, nunca uma configuração de produção.

A validação do tabuleiro usa Chromium de desktop com renderização de software. Não houve medição de GPU em aparelho físico. A lógica das novas cartas de evento permanece uma integração separada da engenharia.

## Procedência

Geometria procedural original em `OlympicHost.tsx` / `olympicPresentation.ts` e selo SVG inline original em `PropertyEvolutionPanel.tsx`. Texturas, casas, hotel, avatares e panoramas são os assets próprios já existentes. Nenhum arquivo de terceiros novo foi acrescentado.
