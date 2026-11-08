# Conta e progresso — revisão visual de 07/11/2026

Refinamento da tela de apelido e da aba Conta das Configurações, com componentes reais `screens/MenuScreen.tsx` e `hud/SettingsDialog.tsx`. Moldura azul/dourada, entrada por apelido, retorno ao último convidado e bloco de progresso separados. Na aba Conta, identidade/e-mail e acesso Google aparecem em cartões próprios; conta conectada tem confirmação visual.

`auth/GoogleButton.tsx` e seu iframe oficial não foram alterados. Tema, texto, largura, carregamento GIS e callbacks continuam os existentes. O CSS novo só alcança os painéis e os contêineres externos. Sem Client ID, o bloco de vínculo não aparece. A aba Conta consulta a mesma configuração pública em cache usada pelo botão.

Prévia: `/scripts/assets/google-account-preview/?view=menu&last=1` ou `?view=account`. Estados de Conta: `state=linked`, `off`, `error`, `sdk-error`. Usa sessão, configuração e callbacks simulados somente na prévia. O lugar do botão oficial é representado por um **slot neutro identificado**, com a mesma largura/altura, sem logotipo ou cópia do botão Google. Não é uma substituição do botão de produção. A conferência não faz OAuth nem usa conta, credencial ou API reais.

Roteiro: `node scripts/assets/google-account-qa.mjs`. Verifica quatro resoluções, limites dos painéis/campos/área do botão, e-mail longo, entrada por apelido, ligação do convidado com token, entrada pelo menu sem token, saída da conta, configuração ausente, falha de login e SDK. O relatório cobre oito combinações de tela/tamanho, além dos quatro estados. Confirma ausência de requisições externas. Capturas deste diretório mostram o slot de prévia quando o acesso Google está disponível.

171 testes existentes e build/TypeScript aprovados. Reutilizados os ícones e o cenário originais do projeto; sem novos assets raster, Meshy ou créditos. Não certifica OAuth com um Client ID real ou celular físico.

## Botões e cabeçalho

Revisão posterior do usuário: largura proporcional ao conteúdo, cantos arredondados e bordas CSS no cabeçalho, abas Som/Conta, saída da conta e ações do rodapé. Não estica os SVG ovais antigos. Roteiro ampliado para limites e textos dos botões; capturas sound-* mostram também a aba Som. Ações e acessibilidade preservadas.
