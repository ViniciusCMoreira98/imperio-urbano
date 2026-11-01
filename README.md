# Império Urbano — Edição Brasil

Jogo de tabuleiro imobiliário multiplayer (2–4 jogadores) com os 26 estados e o Distrito Federal, tabuleiro 3D isométrico e servidor autoritativo.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `apps/web` | Cliente React + Three.js |
| `apps/api` | Servidor Spring Boot 4.1 (Java 21, Maven Wrapper) |
| `apps/desktop` | Electron (fase final) |
| `packages/game-data` | Catálogo de estados, tabuleiro e regras em JSON + validação |
| `packages/shared-types` | Tipos TS de catálogo, snapshot, comandos e eventos |
| `assets/` | Modelos GLB, texturas, cartas, áudio |
| `infrastructure/docker` | Docker Compose (PostgreSQL local) |
| `docs/` | Requisitos, arquitetura, domínio, backlog |

## Comandos

```bash
npm install
npm test
npm run typecheck
```

Servidor (`apps/api`), com o Docker Desktop aberto:

```bash
docker compose -f infrastructure/docker/compose.yaml up -d   # PostgreSQL em localhost:5432
cd apps/api
./mvnw test            # testes (os de banco sobem um PostgreSQL próprio via Testcontainers)
./mvnw spring-boot:run # sobe em http://localhost:8080 e aplica as migrações Flyway
```

Banco: `imperio` / usuário `imperio` / senha `imperio` (somente local; sobrescreva com `DB_URL`, `DB_USER`, `DB_PASSWORD`).

Requisitos: Node 22+, Java 21, Docker Desktop.

## Jogar localmente

Com o Docker Desktop aberto, em três terminais:

```bash
docker compose -f infrastructure/docker/compose.yaml up -d
```

```bash
cd apps/api && ./mvnw spring-boot:run
```

```bash
npm run dev
```

Abra http://localhost:5173, escolha um apelido e crie uma sala. Para testar sozinho, abra outra aba no mesmo endereço: cada aba é um jogador diferente (a sessão fica no `sessionStorage` da aba). Entre com o código da sala, marquem "Estou pronto" e o anfitrião inicia.

## Teste de ponta a ponta

Com o PostgreSQL no ar (`docker compose … up -d`), instale o navegador uma vez e rode:

```bash
npx playwright install chromium
```

```bash
npm run e2e
```

Dois navegadores criam a sala, entram pelo código, iniciam a partida e jogam um turno ([e2e/partida.e2e.ts](e2e/partida.e2e.ts)). A API e o Vite já em execução são reaproveitados; se não estiverem, o teste os sobe. Em falha, o relatório fica em `playwright-report/`.

## Documentação

1. [Requisitos e decisões pendentes](docs/01-requisitos-e-decisoes.md)
2. [Arquitetura](docs/02-arquitetura.md)
3. [Domínio e fluxo de turnos](docs/03-dominio-e-fluxo.md)
4. [Backlog](docs/04-backlog.md)
5. [Direção visual](docs/05-direcao-visual.md)
6. [Guideline de assets 3D](docs/06-guideline-assets-3d.md)
7. [Meshy: catálogo, pipeline e padrões de otimização](docs/07-meshy-pipeline.md)
8. [Meshy: avaliação do primeiro modelo (Fase C)](docs/08-meshy-primeiro-modelo.md)
9. [Meshy: versão texturizada e proposta de animação](docs/09-meshy-versao-texturizada.md)
10. [Meshy: recriação aprovada e restauração de credenciais](docs/10-meshy-recriacao-aprovada.md)
11. [Contratos entre engenharia e arte 3D](docs/11-contratos-claude-codex.md)
12. [Primeiro personagem Meshy no manifesto](docs/12-integracao-meshy-manifesto.md)
