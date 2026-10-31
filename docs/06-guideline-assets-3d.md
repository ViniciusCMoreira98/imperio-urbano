# 06 — Guideline: desenvolvimento e integração de assets 3D

## Objetivo

Estabelecer padrões para criação, geração, otimização e integração de personagens, construções e cenários 3D no Império Urbano — Edição Brasil.

## Regras obrigatórias

1. **Identidade visual:** todos os assets devem manter um estilo cartoon 3D consistente, com identidade própria e sem reproduzir personagens protegidos de outras obras.
2. **Geração por IA:** priorizar Meshy AI para geração de modelos, mantendo uma arquitetura desacoplada que permita utilizar outros provedores.
3. **Formato:** utilizar GLB/glTF como formato principal dos modelos 3D.
4. **Posicionamento:** personagens devem ocupar as casas do tabuleiro, utilizando coordenadas calculadas a partir da posição lógica da partida.
5. **Movimentação:** deslocamentos devem ser animados entre as casas, respeitando o resultado dos dados e o estado recebido do servidor.
6. **Animações:** personagens devem ser preparados para idle, caminhada, comemoração e derrota. Não presumir que modelos gerados por IA já possuem rigging adequado.
7. **Otimização:** reduzir polígonos, texturas excessivas, draw calls e carregamentos desnecessários, preservando a qualidade visual.
8. **Arquitetura:** separar geração de assets, renderização 3D e regras de negócio. O backend permanece responsável pelo estado oficial da partida.
9. **Segurança:** nunca expor credenciais de APIs no frontend e nunca realizar operações pagas sem autorização.
10. **Qualidade:** validar os modelos antes de integrá-los, incluindo geometria, escala, materiais, texturas e desempenho.
11. **Implementação incremental:** priorizar pequenas entregas funcionais, sem modificar componentes que não estejam relacionados à tarefa.
12. **Eficiência de IA:** reduzir consumo de tokens, evitar leitura desnecessária de arquivos e utilizar RTK e Caveman quando estiverem disponíveis e configurados.

## Critérios de aceitação

Todo personagem 3D integrado ao jogo deve:

- Carregar corretamente no navegador.
- Aparecer sobre a casa correspondente.
- Manter escala e orientação consistentes.
- Suportar movimentação entre casas.
- Não sobrepor indevidamente outros jogadores.
- Não causar degradação significativa de desempenho.
- Ser compatível com o sistema de seleção de avatares.

## Regra final

Antes de implementar qualquer funcionalidade relacionada a assets 3D, consultar esta guideline e respeitar os padrões existentes no projeto.
