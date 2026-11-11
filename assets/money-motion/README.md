# Cédula do Império e ajustes de composição — 11/11/2026

Aplicadas as novas orientações de arte da V1 (`develop_arte_3d`): sprite próprio para os voos de dinheiro e retirada de desfoque dos backdrops de eventos e resultado sobre o tabuleiro.

## Asset da cédula

- Original `source/banknote-v1.png`, gerado com image_gen integrado e transparência real.
- Pronto para a aplicação: `apps/web/src/hud/art/money/banknote-v1.webp`, 384×192, 30.504 bytes, proporção e alpha preservados.
- `prompt.json`: prompt integral. `manifest.json`: procedência, dimensões e hashes.

Uma cédula fictícia, verde/esmeralda/marfim/dourado, com medalhão urbano e folhagens brasileiras. Sem valor impresso: as cinco imagens representam visualmente qualquer pagamento; o valor real continua nos saldos e deltas. Não é cópia de moeda oficial. Uma nova geração de imagem, zero créditos Meshy.

MoneyMotion agora cria imagens decorativas `.money-note`, com alt vazio, aria-hidden e draggable=false. Pré-carrega o sprite na montagem e usa object-fit:contain. Tamanho: 44×22 px no computador e 32×16 px em telas de altura até 500 px, antes da escala já existente no voo.

## Preservado na animação

Cinco notas por transferência, duração 750 ms e intervalo 70 ms, mesmos pontos de origem/destino, arco, dispersão, escala, rotação e remoção ao concluir/cancelar. Nenhuma alteração em pairPayments, cálculo financeiro, espera da contagem, momento de exibição dos saldos ou sincronização com pouso/carta. Reconexão e movimento reduzido continuam sem novos voos.

## Desfoque sobre o tabuleiro

Retirado o blur de `.ev-dialog::backdrop` em event-art/event-modals.css e `.go-backdrop` em hud/gameOver.css. Fundos coloridos existentes preservados, com backdrop-filter:none. A nota comum já não usa desfoque de fundo. Menus e seletor de personagem fora da partida não foram alterados.

Esta mudança elimina essas duas solicitações de desfoque ao compositor. **Não certifica que todas as piscadas do Chrome Android estejam resolvidas**; depende de reprodução no aparelho. Atlas, mipmaps, resolução, aluguéis e câmera não foram reduzidos ou modificados. Se persistir, registrar evidência antes de alterar qualidade de textura.

## Validação

Build/TypeScript e 214 testes do frontend aprovados. `scripts/assets/money-motion-art-qa.mjs` prepara o WebP e verifica os componentes reais MoneyMotion/AnimatedBalance em um palco DOM isolado, não uma partida 3D. Fonte da apresentação em scripts/assets/money-motion-preview/.

Nove capturas em review/: jogador→jogador, jogador→banco e banco→jogador, em 1000×640, 800×360 e 667×280. Confere cinco imagens do novo asset, 750 ms/intervalos, centros de saída/chegada, saldos finais exatos, limpeza dos elementos, reconexão e movimento reduzido. Backdrops dos eventos e resultado tiveram o estilo computado conferido como none. As animações das notas são pausadas no mesmo instante de 400 ms apenas para as capturas; a aplicação mantém seu tempo normal.

Report em review/report.json. Não é teste de aparelho físico, multiplayer real ou certificação de ausência de cintilação WebGL. Sem mudanças de servidor/protocolo. Sem commit/merge nesta entrega.
