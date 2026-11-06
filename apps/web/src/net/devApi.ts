// Rotas de desenvolvedor: só o painel de dev (import.meta.env.DEV) importa este módulo, então ele não
// entra no build de produção. No servidor, as rotas só existem com app.dev-tools.enabled=true.
import { request } from './api';

export const devApi = {
  nextDice: (token: string, gameId: string, first: number, second: number) =>
    request<void>('POST', `/dev/games/${gameId}/next-dice`, token, { first, second }),
};
