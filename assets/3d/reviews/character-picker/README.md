# Escolha do personagem — revisão visual de 07/11/2026

Refinamento do componente real `apps/web/src/play-menu/CharacterPicker.tsx`, com estilo em `character-picker.css`.

Prévia: `/scripts/assets/character-picker-preview/`, em Vite na raiz. Usa os mesmos modelos 3D, retratos, cinco personagens e seis cores da produção; sessão e salvamento restritos à demonstração. Não faz chamadas API nem modifica preferências reais.

O cenário da prévia reutiliza o fundo original do menu; nenhuma nova imagem ou GLB foi gerado. A arte não substitui os modelos aprovados nem o comportamento do servidor. Mantidos os controles nativos, rótulos, cancelamento, erro e confirmação.

Reprodução: `node scripts/assets/character-picker-qa.mjs`, com Chromium do Playwright instalado. O roteiro verifica cinco tamanhos, cada opção de personagem/cor, nomes e resumo correspondentes, confirmação, cancelamento sem salvar, reabertura, Esc, erro e espera, sem requisições API. O relatório e as capturas neste diretório são de uma prévia controlada, não de uma sessão conectada à produção.
