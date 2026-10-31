# 04 — Backlog priorizado

Cada entrega é pequena, testável e termina com algo visível ou com testes verdes.

## Marco 1 — Tabuleiro 3D navegável (frontend local)

| # | Entrega | Pronto quando |
|---|---|---|
| ✅ E0 | Monorepo, catálogo de 27 UFs, tabuleiro de 36 casas, regras em JSON, tipos e validação | `npm test` verde |
| ✅ E1 | Scaffold `apps/web` (Vite + React + TS + Tailwind + R3F + Drei + Zustand) | `npm run dev` abre cena vazia |
| ✅ E2 | Geometria do tabuleiro a partir de `board.json` (casas, cores, bordas elevadas, centro reservado) | 36 casas corretas na tela |
| ✅ E3 | Câmera isométrica: visão geral, zoom e rotação limitados, foco suave | Inspecionar qualquer casa |
| ✅ E4 | Casas interativas: hover/seleção → painel lateral com dados do estado | Clique mostra preço/aluguéis |
| ✅ E5 | Peão + demo local de dados (isolada em `src/dev`) com animação GSAP casa a casa | Peão dá voltas no tabuleiro |

## Marco 2 — Motor de regras (backend, sem rede)

| # | Entrega |
|---|---|
| ✅ E6 | Scaffold `apps/api` (Spring Boot 4.1, Java 21, Maven Wrapper), `catalog` lendo os JSON |
| ✅ E7 | `engine`: turnos, dados determinísticos, movimento, bônus do Início, duplas |
| ✅ E8 | Compra e aluguel |
| ✅ E9 | Construção por etapas/visitas (D4) |
| ✅ E10 | Olimpíadas |
| ✅ E11 | Dívida, venda ao banco, falência, vitória (Clássico e Rápido) |
| ✅ E12 | Cartas de eventos (16 cartas) |
| ✅ E13 | Descanso, Viagem Nacional |

## Marco 3 — Multiplayer

| # | Entrega |
|---|---|
| ✅ E14 | Docker Compose (PostgreSQL), Flyway, persistência de eventos/snapshots |
| ✅ E15 | Sessão de convidado + Spring Security |
| ✅ E16 | Lobby: criar sala, código, entrar, avatar/cor, pronto, iniciar |
| ✅ E17 | WebSocket: comandos, idempotência, broadcast, snapshot |
| ✅ E18 | Cliente `net/` + store ligado ao servidor; remove demo local |
| ✅ E19 | Reconexão e retomada de partida (Testcontainers) |
| ✅ E20 | HUD completo: jogadores, ações, histórico, carta do estado |
| E21 | Negociação entre jogadores (D12) |
| E22 | E2E Playwright com dois navegadores |

## Marco 4 — Visual e publicação

Referência de arte: [05-direcao-visual.md](05-direcao-visual.md).

E23 avatares provisórios + seleção 3D · E24 miniaturas de casas/hotéis · E25 dados 3D · E26 anúncio olímpico com confete · E27 mapa central e cartas com SVG das UFs · E28 sons · E29 polimento e responsividade · E30 build de produção e hospedagem · E31 Electron (após web estável).
