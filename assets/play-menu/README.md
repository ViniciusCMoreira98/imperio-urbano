# Jogar Agora, Jogar Online e cards do menu

Entrega visual de 07/11/2026 na `develop_arte_3d`, sobre `c1e2c55`.

**Decisão explícita do usuário:** Jogar Agora é uma partida entre aparelhos na mesma rede local (Wi-Fi ou cabeada). Não é uma partida com IA ou várias pessoas no mesmo aparelho. Jogar Online é para jogadores pela internet.

Foram criadas duas telas controladas e três cards independentes, com a identidade azul/dourada e o cenário brasileiro já aprovado. Esta entrega prepara a interface e as peças visuais; não implementa descoberta de rede, hospedagem LAN, servidor online, progressão de conta ou economia.

## Componentes

| Arquivo/export | Uso |
|---|---|
| `apps/web/src/play-menu/PlayEntryScreens.tsx` → `LocalPlayScreen` | Jogar Agora: criar partida local ou entrar com código; indicação de mesma rede |
| Mesmo arquivo → `OnlinePlayScreen` | Criar sala online ou entrar com convite; indicação de internet |
| `apps/web/src/play-menu/MenuCards.tsx` → `PlayerMenuCard` | Retrato, apelido, nível e experiência opcionais |
| Mesmo arquivo → `CurrencyMenuCard kind="coins"` | Card de moedas, saldo e ação opcional de adicionar |
| Mesmo arquivo → `CurrencyMenuCard kind="diamonds"` | Card de diamantes, saldo e ação opcional de adicionar |
| `apps/web/src/play-menu/play-menu.css` | Composição responsiva e estados de seleção, foco, espera, erro e desabilitado |

Os dois modos são os já existentes no catálogo: Clássico (último a falir) e Rápido (15 rodadas). Limites de jogadores e de rodadas vêm de `@imperio/game-data`, sem duplicar números no componente. O convite é apresentado como código de seis caracteres, compatível com o fluxo existente.

### Contrato para engenharia

`PlayEntryProps` fornece `player`, `wallet?`, `mode`, `onModeChange`, `inviteCode`, `onInviteCodeChange`, `onCreate`, `onJoin`, `onBack`, `pending?` e `error?`. O host guarda o estado e conecta as ações aos serviços oficiais. As telas não importam store de jogo, API ou sessão e não enviam requisições.

`PlayerMenuCard` recebe `nickname`, `portrait` (ReactNode), `level?` e `experience?: {current; target}`. Nível e experiência são ocultados quando não fornecidos. `CurrencyMenuCard` recebe `kind`, `balance` e `onAdd?`; sem callback não mostra o botão de adicionar. A carteira inteira pode ser omitida. Não fabricar saldos ou progressão para preencher a interface de produção.

Os números das prévias (nível 28, experiência 12.450/15.000, 156.800 moedas e 2.430 diamantes) são amostras visuais da referência do usuário. Não representam dados de conta nem valores iniciais de partida. Saldo do menu e créditos da partida não devem ser confundidos.

### Rede local e internet

A distinção visual de canal não implementa transporte. Na integração LAN, cada aparelho precisa acessar a mesma instância local por um endereço alcançável na rede; `localhost` em outro aparelho não aponta para o computador que hospeda a partida. Configurar servidor, interface, origem WebSocket e sessão de cada jogador na engenharia, sem expor credenciais na tela.

O fluxo atual cria/entra em salas por código. A nova tela mantém esse mecanismo; não promete encontrar salas automaticamente na rede, matchmaking público ou funcionar sem um servidor. O host deve preservar a distinção entre backend local e online, não apenas mudar o título.

A tela de produção `screens/MenuScreen.tsx` permanece com seus fluxos reais existentes. A restrição de jogar no celular em paisagem continua com o host. Não ativar automaticamente níveis, moedas, diamantes, compras ou novos canais de rede sem os serviços correspondentes. A integração atual do menu/configurações feita pela engenharia foi preservada.

## Assets separados

Pasta: `apps/web/src/play-menu/art/`. Oito SVG originais do projeto, sem texto ou valores fixos:

- `player-card-v1.svg`: moldura do jogador, com espaço para retrato e informações.
- `coin-card-v1.svg`: moldura de moedas.
- `diamond-card-v1.svg`: moldura de diamantes.
- `play-panel-v1.svg`: moldura das telas de entrada.
- `wifi-v1.svg`: identificação da rede local.
- `globe-v1.svg`: identificação da internet.
- `stopwatch-v1.svg`: modo rápido.
- `back-v1.svg`: retorno ao menu.

Retratos C8, cenário, logotipo, ícones de coroa/jogadores/moeda/diamante/adicionar são reaproveitados dos assets próprios existentes, sem duplicação. Todos os nomes, saldos, valores e rótulos continuam em HTML. Procedência e hashes em `manifest.json`; reprodução por `node scripts/assets/play-menu-vectors.mjs`. Inventário comercial atualizado. Sem Meshy ou créditos Meshy; nenhuma nova geração raster foi necessária.

## Prévia e QA

Com Vite na raiz:

- `/scripts/assets/play-menu-preview/?view=lan`: Jogar Agora, mesma rede.
- `/scripts/assets/play-menu-preview/?view=online`: Jogar Online, internet.
- `/scripts/assets/play-menu-preview/?view=cards`: os três cards separados.

A prévia original `/scripts/assets/main-menu-preview/` agora navega para as duas telas; Menu retorna a ela. O subtítulo antigo de IA foi substituído por “Mesma rede local” nessa demonstração. A produção não foi renomeada por esse ajuste.

`node scripts/assets/play-menu-qa.mjs` verifica as duas telas em 1536×1024, 1280×720, 1024×768, 844×390 e 667×375: dez combinações, imagens, encaixe, seleção de modo, código normalizado/obrigatório, callbacks locais, espera, erro, nome/saldo longos, dados opcionais ausentes e navegação da prévia do menu. As ações não criam uma partida, não enviam pagamentos e não alteram contas. Relatório e capturas em `assets/3d/reviews/play-menu/`. TypeScript e build conferidos separadamente. Sem nova partida conectada ou teste em aparelhos diferentes da mesma rede nesta entrega visual.
