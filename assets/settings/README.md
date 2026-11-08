# Configurações — kit de assets v1

32 assets vetoriais independentes para as três abas aprovadas: Geral, Som e Conta. Estilo azul-marinho, azul real, dourado, contornos ciano e estados ativos verdes. Os mockups aprovados são referências visuais; os arquivos deste kit são SVG originais editáveis, não recortes de telas com textos fixos.

## Arquivos

Pasta de uso: `apps/web/src/settings-art/art/`. Todos os nomes terminam em `-v1.svg`.

| Grupo | Arquivos | Uso |
|---|---|---|
| Estrutura | `panel-frame`, `heading-frame`, `section-frame`, `skyline` | Moldura externa, placa de título, cartões internos e faixa decorativa do Rio |
| Botões | `button-navy`, `button-green`, `button-red`, `close` | Ação comum, principal, destrutiva e fechar |
| Abas | `tab-active`, `tab-inactive` | Navegação Geral / Som / Conta |
| Alternâncias | `toggle-on`, `toggle-off` | Controles ligados e desligados |
| Volume | `slider-track`, `slider-fill`, `slider-thumb` | Trilha, preenchimento e puxador |
| Escolha | `select-frame`, `segment-selected` | Seletor de idioma e opção selecionada de FPS |
| Ícones | `profile`, `music`, `speaker`, `monitor`, `performance`, `shield`, `document`, `lock`, `headset`, `trash`, `link`, `logout`, `check`, `chevron`, `reset` | Perfil, áudio, interface, desempenho, privacidade, suporte e ações |

Reaproveitados do pacote existente: `main-menu/art/gear-v1.svg`, `main-menu/art/crown-v1.svg` e retrato original `hud/art/avatars-c8/avatar-2.webp`. O cenário do menu aparece somente atrás da prévia. Não há novo upload externo, geração de imagem ou uso do Meshy nesta etapa.

## Montagem e estados

`apps/web/src/settings-art/settings-assets.css` fornece a composição e os estados de foco, hover, pressionado e desabilitado. A grade se adapta às telas baixas em paisagem. Molduras estruturais podem preencher seu contêiner; ícones, retratos e controles com proporção própria devem usar `contain`. Evitar esticar uma captura de tela completa.

Textos, nomes, números e porcentagens são HTML. Os controles usam elementos nativos: `input[type=checkbox]`, `input[type=range]`, `select` e botões. Volume usa a propriedade CSS `--fill` para a porcentagem do preenchimento. `:checked` seleciona o asset da alternância; `aria-selected` seleciona a aba; `aria-pressed` seleciona o segmento de FPS; `disabled` aplica o estado desabilitado sem exigir uma nova imagem. Esses atributos devem refletir os dados reais do host.

O estilo `.st-dialog` demonstra a sobreposição; o host continua responsável pelo diálogo, foco, Escape, confirmação de operações e persistência. A prévia usa `dialog.showModal()`, navegação de abas pelas setas/Home/End e foco nativo.

## Prévia de integração

Abrir `/scripts/assets/settings-preview/` com Vite na raiz. Os arquivos `index.html` e `preview.mjs` demonstram as três abas navegáveis.

- **Geral:** avatares, emojis, zoom, previsão de turnos, FPS (30/60/Auto), idioma e ping.
- **Som:** música, efeitos, sons da interface, silenciar tudo, som em segundo plano e aviso da sua vez.
- **Conta:** perfil, vincular conta, privacidade, diagnóstico, exclusão, saída e conclusão.

A prévia só altera valores em memória. Salvar não altera as preferências reais. As ações de conta mostram mensagens locais; Excluir conta abre somente uma confirmação demonstrativa com Cancelar. Nenhuma conta é excluída, nenhum diagnóstico é enviado, nenhum serviço de sincronização é implementado e nenhum comando do jogo é chamado. Nome e nível são dados de exemplo. O idioma tem apenas Português (Brasil) no exemplo; não promete traduções existentes.

O host deve definir quais recursos já existem antes de exibi-los no produto e conectar as ações aos fluxos oficiais. A restrição existente do jogo para celular em paisagem permanece responsabilidade do host. Este kit não modifica a tela de produção.

## Reprodução e validação

`node scripts/assets/settings-vectors.mjs` reproduz os SVG e `assets/settings/manifest.json`, com hashes, tamanhos e referências dos mockups aprovados. O inventário comercial em `assets/3d/commercial-licenses.json` inclui os assets como arte vetorial original do projeto.

`node scripts/assets/settings-qa.mjs` verifica as três abas em 1672×941, 1280×720, 1024×768, 844×390 e 667×375. Verifica carregamento das imagens, encaixe dos cartões/controles, alternâncias, FPS, atualização dos volumes, salvar/restaurar em memória, confirmação demonstrativa de exclusão, foco, navegação por teclado, estado desabilitado e fechamento/reabertura. Capturas e relatório ficam em `assets/3d/reviews/settings/`. Sem nova partida conectada ou teste em aparelho físico nesta entrega de arte.

## Controles compactos — 07/11/2026

Entrada atual do kit: apps/web/src/settings-art/settings-controls.css. Importa a base e aplica o mesmo cabeçalho, abas e botões retangulares arredondados do host real. As molduras SVG antigas continuam como fontes históricas. O botão oficial Google não é alterado.
