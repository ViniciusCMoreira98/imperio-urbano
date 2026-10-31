# Império Urbano — Edição Brasil

Jogo de tabuleiro imobiliário multiplayer (2–4 jogadores) com os 26 estados e o Distrito Federal, tabuleiro 3D isométrico e servidor autoritativo.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `apps/web` | Cliente React + Three.js (a criar — E1) |
| `apps/api` | Servidor Spring Boot 4.1 (Java 21, Maven Wrapper) |
| `apps/desktop` | Electron (fase final) |
| `packages/game-data` | Catálogo de estados, tabuleiro e regras em JSON + validação |
| `packages/shared-types` | Tipos TS de catálogo, snapshot, comandos e eventos |
| `assets/` | Modelos GLB, texturas, cartas, áudio |
| `infrastructure/docker` | Docker Compose |
| `docs/` | Requisitos, arquitetura, domínio, backlog |

## Comandos

```bash
npm install
npm test
npm run typecheck
```

Servidor (`apps/api`):

```bash
cd apps/api
./mvnw test            # testes
./mvnw spring-boot:run # sobe em http://localhost:8080
```

Requisitos: Node 22+, Java 21. Docker Desktop a partir do backend.

## Documentação

1. [Requisitos e decisões pendentes](docs/01-requisitos-e-decisoes.md)
2. [Arquitetura](docs/02-arquitetura.md)
3. [Domínio e fluxo de turnos](docs/03-dominio-e-fluxo.md)
4. [Backlog](docs/04-backlog.md)
5. [Direção visual](docs/05-direcao-visual.md)
