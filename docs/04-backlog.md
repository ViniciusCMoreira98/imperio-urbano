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
| ~~E21~~ | ~~Negociação entre jogadores~~ — cancelada (D12) |
| ✅ E22 | E2E Playwright com dois navegadores |

## Marco 4 — Visual e publicação

Referência de arte: [05-direcao-visual.md](05-direcao-visual.md).

Alvo visual: [visual-alvo.webp](referencias/visual-alvo.webp). Desde 2026-10-31 o trabalho é dividido entre dois agentes, em branches separadas (contratos em [11-contratos-claude-codex.md](11-contratos-claude-codex.md)):

- **Claude (engenharia):** regras, servidor, multiplayer, sincronização, posicionamento e movimento dos personagens, carregamento de GLB, áudio, testes, desempenho e publicação.
- **Codex (arte 3D):** geração e otimização de GLB (Meshy), visual do tabuleiro, câmera, iluminação, materiais, cenário, construções/monumentos e acabamento visual do HUD.

| # | Entrega | Claude (engenharia) | Codex (arte) |
|---|---|---|---|
| ✅ E23 | Avatares + seleção 3D | ✅ | — |
| ✅ E24 | Casinhas/hotéis 3D + ambiente (hoje: Rio ao entardecer) | ✅ | Refinamento visual |
| P1 | Personagens GLB: integração | ✅ Etapa 2: manifesto, esqueleto/animação opcionais, reserva | Gerar e publicar os GLB no manifesto |
| P2 | Personagens: posicionamento e bases | Etapa 3: `tileAnchor`, vários jogadores na casa, base independente, destaque do ativo | Aparência da base |
| P3 | Personagens: saltos procedurais | Etapa 4: um salto por casa, giro, preparação e aterrissagem | — |
| P4 | Personagens: multiplayer e estabilidade | Etapa 5: fila de movimentos, versões/ordem dos eventos, reconexão, testes | — |
| P5 | Personagens: polimento | Etapa 6: transições e validação com a arte | Validação visual conjunta |
| T1 | Tabuleiro com câmera estática | ✅ Percurso definitivo (Taxa, Aeroporto, sem Visita), áreas em `tileAnchor`, retirada de foco/giro | Geometria, câmera estática, materiais, atlas das casas |
| E25 | Dados 3D | Rolagem ligada ao resultado do servidor, sempre parando no valor oficial, reconexão no meio da rolagem | Modelo, material e animação visual |
| E26 | Anúncio olímpico | Disparo pelo evento do servidor, sem repetir após reconexão | Confete, selo ×N e visual da chamada |
| E27 | Cartas e mapa | Destaque do estado ao selecionar a casa (lógica) e fluxo da carta revelada | Arte das cartas de Evento e do verso da pilha |
| E28 | Sons | Sistema de áudio: eventos certos, volume, mudo, sem repetição | Escolha/geração dos sons, se pedido |
| E29 | Polimento e responsividade | Telas de Regras, Configurações e Resultado; desempenho no celular | Fonte, menus no estilo neon, acabamento visual |
| E30 | Build de produção e hospedagem | Tudo: build, banco, API, domínio, HTTPS | — |
| E31 | Electron | Tudo, depois da versão web estável | — |

Ordem do lado da engenharia: P2 → P3 → P4 → P5 → E25 → E28 → E29 → E30 → E31. As partes de arte (E25–E27, E29) podem andar em paralelo do lado do Codex.
