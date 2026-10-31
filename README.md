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

## Documentação

1. [Requisitos e decisões pendentes](docs/01-requisitos-e-decisoes.md)
2. [Arquitetura](docs/02-arquitetura.md)
3. [Domínio e fluxo de turnos](docs/03-dominio-e-fluxo.md)
4. [Backlog](docs/04-backlog.md)
5. [Direção visual](docs/05-direcao-visual.md)
