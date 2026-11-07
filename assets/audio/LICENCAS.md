# Áudio — origem e licença

Faixas usadas pelo jogo em `apps/web/public/audio/`. Os originais ficam na máquina do usuário em
`D:\Projetos Pessoais\Efeitos Sonoros` e não entram no repositório.

| Faixa | Uso no jogo | Origem (informada pelo usuário, 06/11/2026) |
|---|---|---|
| `dado`, `saltoPeao`, `abrirJanela`, `confirmarAcao`, `erroAcaoInvalida`, `passarBotao`, `comprar`, `construir`, `pagarAluguel`, `receberDinheiro`, `cartaEvento`, `olimpiadas`, `suaVez`, `vitoria` | Efeitos sonoros (`src/audio/sounds.ts`) | ElevenLabs (efeitos sonoros gerados) |
| `menuInicial` | Música em loop do menu, do Jogar Online e da sala de espera (`src/audio/music.ts`); nova versão em 07/11/2026 | Suno (música gerada) |
| `musicaTabuleiro` | Música em loop durante a partida (`src/audio/music.ts`), desde 07/11/2026 | Suno (música gerada) |

Ainda faltam os efeitos `tempoAcabando` e `falencia`, que ficam mudos até chegarem.

## Pendências para uso comercial (navegador e Steam)

O jogo será vendido ou distribuído comercialmente, então cada faixa precisa de licença comercial
comprovada.

**Estado: provisório.** O usuário informou (06/11/2026) que **todas as faixas atuais foram geradas nos
planos gratuitos** da ElevenLabs e do Suno, que não permitem uso comercial. Elas servem só para
desenvolvimento e testes. **Antes de qualquer lançamento, todas serão geradas de novo em plano pago**
e substituídas aqui, com os mesmos nomes de arquivo; o código não precisa mudar.

O que conferir em cada caso, segundo os termos conhecidos dos serviços (sem valor de parecer jurídico;
conferir os termos vigentes):

- **ElevenLabs:** os efeitos precisam ter sido gerados num plano pago. No plano gratuito, o uso é
  não comercial e exige atribuição.
- **Suno:** a música precisa ter sido gerada com o plano Pro ou Premier ativo no momento da criação.
  Faixas feitas no plano gratuito pertencem à Suno e só podem ter uso não comercial. Assinar depois não
  regulariza faixas antigas.

Ao gerar de novo, guardar para cada serviço o plano usado, as datas de geração e uma cópia ou link dos
termos da época, e atualizar esta tabela.
