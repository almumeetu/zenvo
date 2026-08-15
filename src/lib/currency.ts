import { CurrencyCode, CurrencyRate } from '../types';
import { CURRENCIES } from '../data/initialData';

export function formatCurrency(
  amountInUSD: number,
  currencyCode: CurrencyCode = 'USD',
  rates: CurrencyRate[] = CURRENCIES,
  customBDT?: number
): string {
  if (currencyCode === 'BDT') {
    const val = customBDT !== undefined ? customBDT : amountInUSD * 120;
    return `৳${Math.round(val).toLocaleString()}`;
  }
  const currency = rates.find((c) => c.code === currencyCode) || rates[0];
  const converted = amountInUSD * currency.rateToUSD;
  return `${currency.symbol}${converted.toFixed(2)}`;
}
