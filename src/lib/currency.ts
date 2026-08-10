import { CurrencyCode, CurrencyRate } from '../types';
import { CURRENCIES } from '../data/initialData';

export function formatCurrency(
  amountInUSD: number,
  currencyCode: CurrencyCode = 'USD',
  rates: CurrencyRate[] = CURRENCIES
): string {
  const currency = rates.find((c) => c.code === currencyCode) || rates[0];
  const converted = amountInUSD * currency.rateToUSD;
  if (currencyCode === 'BDT') {
    return `${currency.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}
