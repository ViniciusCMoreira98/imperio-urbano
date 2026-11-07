# Login com Google

Implementado em 07/11/2026. O jogo continua aceitando convidado (só apelido). O Google é opcional e serve
para salvar o progresso (moedas, diamantes, vitórias, personagem) e recuperá-lo em qualquer aparelho.

## Como funciona

1. O navegador mostra o botão oficial do Google (Google Identity Services) e recebe um **ID token**.
2. Envia o token para `POST /api/sessions/google`.
3. O servidor confere o token localmente: assinatura com as chaves públicas do Google, emissor
   (`accounts.google.com`), público igual ao nosso Client ID e validade. **Não há segredo nem chamada paga**:
   o Client ID é público, e as chaves do Google são baixadas e guardadas em cache.
4. O servidor responde com um token de sessão deste aparelho, do mesmo tipo que o do convidado.

### Regras da conta

| Situação | Resultado |
|---|---|
| Convidado (no menu) entra com uma conta Google ainda não usada | A conta fica **ligada a esse convidado**. Moedas, vitórias e personagem continuam. |
| Conta Google já ligada a um jogador | Entra nesse jogador. O convidado aberto antes fica como estava. |
| Tela do apelido, conta Google nova | Cria um jogador com o primeiro nome do Google (ajustado às regras do apelido). |
| Outro aparelho | Entrar com Google recupera o mesmo jogador. Cada aparelho tem o próprio token. |
| "Sair da conta" (Configurações › Conta) | Apaga só o token deste aparelho. |

O e-mail só é guardado quando o Google o marca como verificado, e serve apenas para exibir na aba Conta.

### Onde fica no jogo

- Tela do apelido: "ou" + botão "Continuar com o Google".
- Configurações › Conta: tipo de conta (Convidado ou Google · e-mail), botão "Fazer login com o Google"
  para o convidado salvar o progresso, e "Sair da conta" para quem entrou com Google.
- Sem Client ID configurado, os botões não aparecem e tudo funciona como antes.

## Configurar (uma vez, gratuito)

É preciso criar o Client ID numa conta Google sua. Não dá para fazer isso pelo jogo.

1. Acesse <https://console.cloud.google.com/> e crie um projeto (ex.: "Imperio Urbano").
2. **APIs e serviços › Tela de permissão OAuth** (ou "Google Auth Platform"):
   - Tipo de usuário **Externo**, nome do app "Império Urbano", e-mail de suporte.
   - Escopos: os básicos (`openid`, `email`, `profile`), que não exigem verificação do Google.
   - Enquanto estiver em "Teste", só os e-mails adicionados como **usuários de teste** conseguem entrar.
     Para liberar para todos, publique o app (com só esses escopos, não precisa de revisão).
3. **Credenciais › Criar credenciais › ID do cliente OAuth › Aplicativo da Web**:
   - **Origens JavaScript autorizadas:** `http://localhost:5173` e `http://localhost:5174` (desenvolvimento)
     e, depois, o domínio de produção (ex.: `https://imperiourbano.com.br`).
   - URIs de redirecionamento: não precisa (o botão usa popup).
4. Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`).
5. Inicie a API com a variável de ambiente:

   ```powershell
   $env:GOOGLE_CLIENT_ID='SEU_ID.apps.googleusercontent.com'; .\mvnw.cmd spring-boot:run
   ```

   No servidor de produção, defina `GOOGLE_CLIENT_ID` do mesmo jeito. O frontend busca o valor em
   `GET /api/sessions/config`, então não precisa de variável no Vite.

## Técnico

- Migração `V10__google_accounts.sql`: `guest_sessions.google_sub` (único) e `email`, mais a tabela
  `session_tokens` (um token por aparelho).
- Servidor: `identity/GoogleIdTokenVerifier` (Nimbus, `spring-security-oauth2-jose`),
  `GuestSessionService.signInWithGoogle`, rotas `POST /api/sessions/google`, `POST /api/sessions/logout`
  e `GET /api/sessions/config`; `GET /api/sessions/me` informa `google` e `email`.
- Cliente: `auth/GoogleButton.tsx` (carrega `https://accounts.google.com/gsi/client` só quando há Client ID).
- Testes: `GoogleSignInTest`, com o verificador simulado.
