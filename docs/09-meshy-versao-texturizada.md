# 09 — Candidato texturizado e próxima etapa de animação

**Revisão visual solicitada pelo usuário:** a versão de 10 mil triângulos foi considerada borrada/pixelada e não foi aceita artisticamente. Foi preparada uma comparação separada com 50 mil triângulos, mapa de cor de 2.048 px, sombreamento suave e material cartoon simplificado. O orçamento oficial permanece inalterado. Evidências em `assets/3d/reviews/quality-review`. O teste de animação pago continua sem autorização de custo.

### Correção da comparação de qualidade

A redução inicial combinava perda geométrica, mapa de cor de baixa resolução e normal map não rebakeado para a nova malha. Não é possível atribuir todo o defeito visual a uma única causa. Na comparação, foi preservada mais geometria e resolução, removido o normal map antigo e usada rugosidade 0,65 com metallic=0. A silhueta, o rosto e a leitura da roupa melhoraram na inspeção do render; ainda falta aprovação artística do usuário.

O arquivo `assets/3d/reviews/quality-review/textured-quality-v03.glb` é uma referência estática, não um asset final otimizado. Tem aproximadamente 3,23 MiB e excede os limites atuais de tamanho, triângulos e resolução. Não foi colocado na partida, nem usado para rigging. A revisão v03 passou no Khronos com zero erros/avisos e uma informação de accessor não utilizado. Tangentes sem uso foram retiradas da primitiva; os bytes correspondentes permanecem no BIN e podem ser eliminados numa futura compactação. A revisão com tangentes inválidas ficou apenas na pasta temporária ignorada.

Para abrir essa comparação, usar `$env:ASSET_PREVIEW_MODEL='steampunk-girl-quality-review'` antes de iniciar o servidor de prévia. Esta opção não muda os limites de produção nem aprova maior consumo de GPU. O próximo ajuste de produção deve preservar os detalhes com retopologia/bake e medição de desempenho, em vez de repetir a decimação agressiva. Não avançar ao teste pago de animação enquanto a qualidade visual não estiver resolvida.

Em 2026-10-31, o usuário autorizou prosseguir e criar outro modelo se necessário. Antes de qualquer geração paga, foram consultadas as três outras tarefas existentes e tentados seus downloads gratuitos. Nenhuma operação paga foi executada. Desenvolvimento na mesma worktree isolada; jogo e alterações anteriores preservados.

## Descoberta

`steampunk-girl-no-base-v1`, tarefa `8260b211-f1f5-4631-b52a-af9c65a6bd23`, contém três texturas e é uma base visual melhor que o companion sem texturas avaliado anteriormente. Original: 88.642.052 bytes, 2.322.916 triângulos, um material, sem rig ou animações. SHA-256 `090c1c21b99cfbe0263cc1404e65b1b8959c4c119c7da7b6b2533c28eb31abd6`.

`steampunk-girl-turnaround-v2` também foi baixado e tem 74.674.604 bytes, 3.111.924 triângulos, sem texturas, rig ou clips. A tentativa de download de `steampunk-girl-turnaround-v1` foi interrompida pelo pipeline, sem arquivo salvo; essa versão não foi avaliada e a causa não foi determinada. Não presumir que ela não tenha texturas.

## Cópia para avaliação

A versão texturizada foi reduzida localmente no Blender para 10.000 triângulos. Os mapas foram limitados a 1.024 px, preservando UVs e materiais. Foram exportadas tangentes para normal mapping. Na revisão v02, o pivô foi corrigido após a redução: pés em Y=0 e centro horizontal na origem. O original não foi alterado.

Arquivo: `assets/3d/optimized/characters/steampunk-girl-no-base-v1-textured-preview-v02.glb`, **1.074.928 bytes (~1,03 MiB)**. SHA-256 `7fef272982154b03363c28dd473ec7b717b38e5656fe5dc7077d036ccba544bd`.

O original passou pelo Khronos sem erros, com um aviso de tangentes ausentes e uma informação de matriz identidade redundante. A cópia v02 passou **sem erros ou avisos**. A triagem de orçamento também passou. O Blender alertou sobre múltiplos nós de imagem para um sampler; a saída foi conferida no navegador, mas ainda requer avaliação artística final. Não confundir conformidade de arquivo com rig funcional.

A comparação mostra melhora clara sobre o companion neutro: rosto, cabelo e roupa são reconhecíveis pelas texturas. Ainda há perda geométrica nos cachos e bordas da roupa. Não foi criada uma versão animada nem substituído o personagem do jogo.

Evidências em [`assets/3d/reviews/textured-review`](../assets/3d/reviews/textured-review). As revisões v01/v02 são experimentais e não aprovadas para publicação. A licença continua sem comprovação. Validação em viewport de celular não representa benchmark em aparelho real.

Para abrir a cópia texturizada:

```powershell
$env:ASSET_PREVIEW_MODEL='steampunk-girl-no-base-v1'
node scripts/assets/preview-server.mjs
```

Abrir `http://127.0.0.1:4174`, encerrar com Ctrl+C. Para QA, parar o servidor e executar `node scripts/assets/preview-qa.mjs` com a mesma variável. Depois remover a seleção com `Remove-Item Env:ASSET_PREVIEW_MODEL`.

## Próxima decisão

Recomenda-se testar animação desta base antes de pagar por uma geração nova. A API Meshy de rig requer humanoide texturizado com no máximo 300 mil faces; o original excede esse limite. Pelo fluxo de tarefas remotas: remesh por **5 créditos**, depois rigging por **5 créditos**, incluindo caminhada/corrida em arquivos separados. Proposta de custo total: **10 créditos**, pendente de confirmação explícita. Não há escolha de modelo de IA nessas duas operações.

O modelo local reduzido já atende ao limite, mas a interface de rig recebe task ID remoto ou URL de GLB. Não existe nesta entrega um upload/hospedagem pública autorizado para enviar a cópia local; ela não foi exposta externamente. Não presumir que o rig de 5 créditos possa consumir diretamente o arquivo local.

Rigging automático pode falhar ou deformar vestido/cabelo; a pose com braços baixos é menos favorável que uma T-pose. O custo proposto autoriza um teste, não garante qualidade de animação. Depois do rig, validar pesos e caminhada, preparar idle local se necessário e testar em prévia isolada. Comemoração/derrota e integração à partida são etapas posteriores; nenhuma mudança na lógica de movimentação está prevista.

As ferramentas de remesh/rig permanecem desabilitadas na configuração da Fase A. Será necessário disponibilizá-las após a confirmação de custo; nenhuma restrição foi alterada ou contornada. Se o teste não for adequado, apresentar uma proposta de nova geração com pose e orçamento definidos, sem iniciar gastos adicionais.
