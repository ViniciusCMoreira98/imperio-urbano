// Para onde o dinheiro voa quando os saldos mostrados mudam juntos (pedido do usuário, 11/11/2026):
// quem perdeu paga quem ganhou; o que sobra vai para o banco (compra, construção, taxa) ou sai dele
// (bônus do Início, saque, carta de ganhar). Só apresentação: os valores já vêm do servidor.

export const BANK = 'bank';

export interface MoneyFlight {
  from: string;
  to: string;
  amount: number;
}

/** Pares pagador → recebedor a partir das variações de saldo (valores iguais primeiro, como o aluguel). */
export function pairPayments(deltas: Readonly<Record<string, number>>): MoneyFlight[] {
  const payers = Object.entries(deltas).filter(([, d]) => d < 0).map(([id, d]) => ({ id, left: -d }));
  const receivers = Object.entries(deltas).filter(([, d]) => d > 0).map(([id, d]) => ({ id, left: d }));
  const flights: MoneyFlight[] = [];
  const send = (from: string, to: string, amount: number) => amount > 0 && flights.push({ from, to, amount });

  for (const payer of payers) {
    const same = receivers.find((r) => r.left === payer.left);
    if (same) {
      send(payer.id, same.id, payer.left);
      same.left = 0;
      payer.left = 0;
    }
  }
  for (const payer of payers) {
    for (const receiver of receivers) {
      if (payer.left === 0) break;
      const amount = Math.min(payer.left, receiver.left);
      send(payer.id, receiver.id, amount);
      payer.left -= amount;
      receiver.left -= amount;
    }
    send(payer.id, BANK, payer.left);
  }
  for (const receiver of receivers) send(BANK, receiver.id, receiver.left);
  return flights;
}
