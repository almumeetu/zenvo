import { CurrencyCode, CurrencyRate } from '../types';
import { CURRENCIES } from '../data/initialData';

export function formatCurrency(
  amountInUSD: number,
  currencyCode: CurrencyCode = 'USD',
  rates: CurrencyRate[] = CURRENCIES
): string {
  const currency = rates.find((c) => c.code === currencyCode) || rates[0];
  const convertedAmount = amountInUSD * currency.rateToUSD;

  if (currencyCode === 'BDT') {
    return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
  } else if (currencyCode === 'INR') {
    return `${currency.symbol}${convertedAmount.toFixed(1)}`;
  } else {
    return `${currency.symbol}${convertedAmount.toFixed(2)}`;
  }
}
