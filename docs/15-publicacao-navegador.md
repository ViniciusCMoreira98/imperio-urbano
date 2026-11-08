# Publicação no navegador

Preparado em 07/11/2026. Nada foi contratado nem publicado ainda: este documento descreve o pacote de
produção e as opções de hospedagem para o usuário escolher.

## Como fica em produção

Um único servidor entrega tudo no mesmo endereço (`https://seu-dominio`):

| Caminho | O quê |
|---|---|
| `/` e arquivos do site | Build do Vite dentro do jar (`classpath:/static`) |
| `/api/...` | API REST (convidado, login com Google, salas, carteira) |
| `/ws/games/{id}` | WebSocket da partida |
| `/actuator/health` | Saúde, para a hospedagem saber se o servidor está no ar |

Como site, API e WebSocket têm a mesma origem, não há CORS. A hospedagem só precisa rodar **um contêiner
Docker** e dar um **PostgreSQL**.

- `Dockerfile` (raiz): monta o site (Node 22), compila a API com o site dentro (Java 21) e gera uma imagem
  só com o Java e o jar, rodando com usuário sem privilégios. Imagem de ~500 MB.
- Cache: `/assets/*` (nome com hash) fica um ano no navegador; modelos, áudio e `index.html` são
  revalidados a cada visita. HTML, CSS, JS e JSON vão comprimidos.
- O botão "dev" e a rota de dados escolhidos ficam fora: o painel só existe no build de desenvolvimento e a
  rota exige `DEV_TOOLS=true`, que nunca deve ser usado em produção.

### Variáveis de ambiente

| Variável | Obrigatória | Exemplo / observação |
|---|---|---|
| `DB_URL` | sim | `jdbc:postgresql://HOST:5432/BANCO` (formato JDBC) |
| `DB_USER` / `DB_PASSWORD` | sim | Credenciais do PostgreSQL da hospedagem. Nunca no repositório. |
| `ALLOWED_ORIGINS` | sim | `https://seu-dominio` (sem barra no fim; vários separados por vírgula). Sem isso o WebSocket recusa a conexão. |
| `GOOGLE_CLIENT_ID` | não | O mesmo ID do Google Cloud, com `https://seu-dominio` acrescentado às origens autorizadas. Vazio = só convidado. |
| `PORT` | não | Definida pela própria hospedagem; padrão 8080. |

As migrações do banco (Flyway) rodam sozinhas ao iniciar.

### Limites conhecidos

- **Uma instância só.** O relógio dos modos por tempo, os prazos dos turnos e a presença dos jogadores
  ficam na memória do servidor. Não ligar escala automática nem várias réplicas; a hospedagem também não
  pode "adormecer" o servidor por falta de acesso (planos gratuitos que dormem quebram as partidas).
- O token do jogador vai na URL do WebSocket. Com HTTPS ele não aparece na rede, mas pode aparecer em logs
  da hospedagem. Melhorar antes de crescer (passar o token na primeira mensagem).
- JavaScript principal de 1,6 MB (472 KB comprimido) e 54 MB de arquivos no total (modelos e áudio são
  baixados conforme o uso). Dividir o código fica para depois.
- Áudio do plano gratuito da ElevenLabs/Suno: refazer em plano pago antes do lançamento (ver
  `assets/audio/LICENCAS.md`).

## Ensaio local da produção

Com o Docker Desktop aberto, na raiz do repositório:

```bash
docker compose -f infrastructure/docker/compose.prod.yaml up --build
```

Abre em <http://localhost:8090>, com banco próprio (separado do desenvolvimento). Para parar:
`docker compose -f infrastructure/docker/compose.prod.yaml down`.

Conferido em 07/11/2026: site, modelos e áudio servidos com o cache certo, compressão gzip no JavaScript,
`/api` protegida (401 sem token), saúde `UP`, migrações aplicadas num banco vazio e uma partida jogada no
navegador pelo WebSocket, sem erros no console nem no log.

## Hospedagem: opções

Preços aproximados em dólar, pesquisados em 07/11/2026 (mudam com frequência; conferir na página de cada
um antes de contratar). Todos rodam o `Dockerfile` e aceitam WebSocket. O jogo é por turnos, então a
latência de servidores nos EUA (cerca de 120–180 ms do Brasil) não atrapalha.

| Opção | Como | Custo/mês estimado | Prós | Contras |
|---|---|---|---|---|
| **Railway** (recomendada para começar) | Contêiner a partir do GitHub + PostgreSQL gerenciado | ~US$ 10–15 (plano Hobby de US$ 5 com US$ 5 de uso incluso, mais o uso de memória e banco) | Mais simples: conecta o repositório, lê o Dockerfile, domínio próprio com HTTPS, banco no mesmo painel | Cobrança por uso (pôr limite de gasto); backups do banco a configurar |
| **Render** | Web Service Docker + Postgres | ~US$ 13 (Starter 512 MB + Postgres Basic 256 MB); ~US$ 31 com 2 GB de memória | Preço fixo e previsível | 512 MB é apertado para o Java; plano gratuito dorme (não serve) |
| **VPS** (ex.: Hetzner) + Docker Compose | Servidor próprio com o `compose.prod.yaml` e um proxy com HTTPS (Caddy) | ~€ 4–7 (2–4 GB de memória) | Mais barato e mais memória | Atualizações, segurança e backups ficam por nossa conta |
| **Fly.io** | Máquina + Managed Postgres | ~US$ 45+ (o Postgres gerenciado mais barato custa US$ 38) | Regiões no mundo todo, inclusive São Paulo | Caro pelo banco gerenciado |

**Domínio:** `.com.br` no Registro.br, cerca de R$ 40 por ano.

### Passos depois da escolha (com o usuário)

1. Contratar a hospedagem e o domínio (o usuário faz o pagamento; nenhuma cobrança automática por aqui).
2. Criar o PostgreSQL e o serviço a partir do repositório (Dockerfile da raiz).
3. Definir as variáveis acima no painel da hospedagem.
4. Apontar o domínio e esperar o HTTPS.
5. No Google Cloud, acrescentar `https://seu-dominio` às origens autorizadas do Client ID e publicar o app
   na tela de permissão (`docs/14-login-google.md`).
6. Ligar backups diários do banco e um limite de gasto.
7. Testar com duas contas: sala, partida e login com Google.

## Railway: passo a passo (escolha do usuário, 07/11/2026)

O Railway lê o `Dockerfile` da raiz sozinho. Não há `railway.json`: a configuração por arquivo está
obsoleta (serviços novos não podem usar e ela para em 01/12/2026), então tudo abaixo é feito no painel.
Criar conta e pagar fica com o usuário.

1. **Conta e plano:** criar a conta em <https://railway.com> com o GitHub e assinar o plano **Hobby**
   (US$ 5/mês com US$ 5 de uso incluso). Em *Workspace › Usage*, definir um **limite de gasto**
   (ex.: US$ 20) para não haver surpresa.
2. **Projeto e banco:** *New Project › Deploy PostgreSQL*. O serviço do banco se chama `Postgres`
   (se mudar o nome, trocar nas referências abaixo).
3. **Serviço do jogo:** no mesmo projeto, *New › GitHub Repo* › `imperio-urbano`. Em *Settings › Source*,
   escolher a branch (`develop` para o primeiro teste; depois `main`, quando ela receber a develop).
   O build usa o `Dockerfile` automaticamente (leva alguns minutos na primeira vez).
4. **Variáveis do serviço do jogo** (*Variables › Raw Editor*), copiando exatamente:

   ```
   DB_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   ALLOWED_ORIGINS=https://${{RAILWAY_PUBLIC_DOMAIN}}
   GOOGLE_CLIENT_ID=31503414946-alvdie9k0psslo4n4s7468a8go0d6vtn.apps.googleusercontent.com
   ```

   As referências `${{...}}` puxam host, porta, usuário e senha do banco pela rede privada do projeto:
   nenhuma senha é copiada à mão nem vai para o repositório. Não definir `PORT` (o Railway define) e nunca
   definir `DEV_TOOLS`.
5. **Endereço público:** *Settings › Networking › Generate Domain* (gera `algo.up.railway.app` com HTTPS).
   Quando houver domínio próprio, *Custom Domain*, criar o registro DNS que o Railway mostrar e trocar
   `ALLOWED_ORIGINS` para `https://seu-dominio` (ou os dois, separados por vírgula).
6. **Ajustes do serviço** (*Settings › Deploy*):
   - *Healthcheck Path*: `/actuator/health` (só troca de versão quando a nova responde).
   - *Restart Policy*: `On Failure`.
   - *Replicas*: **1**, e *Serverless* (dormir sem acesso) **desligado**: o jogo guarda prazos na memória.
7. **Google:** no Google Cloud, acrescentar `https://algo.up.railway.app` (e depois o domínio próprio) às
   *Origens JavaScript autorizadas* do Client ID.
8. **Backups:** no serviço `Postgres`, *Backups*, ativar backups automáticos.
9. **Teste:** abrir o endereço em duas abas (ou dois aparelhos), criar sala, jogar alguns turnos e entrar
   com o Google.

Cada push na branch escolhida gera um deploy novo. Se algo falhar, os logs ficam em *Deployments › View Logs*.

Fontes: [Railway: preços](https://docs.railway.com/pricing/plans), [Railway: configuração por arquivo](https://docs.railway.com/config-as-code), [Railway: PostgreSQL](https://docs.railway.com/databases/postgresql), [Railway: variáveis](https://docs.railway.com/variables/reference),
[Render](https://render.com/articles/how-much-does-cloud-application-hosting-cost-for-small-businesses),
[Fly.io](https://fly.io/pricing.md), [Hetzner](https://vpsbenchmarks.com/hosters/hetzner/plans/cx22).
