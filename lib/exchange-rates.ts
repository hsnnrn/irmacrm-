/**
 * Exchange Rate Service
 * Fetches real-time currency exchange rates from TCMB (Central Bank of Turkey)
 */

export interface ExchangeRates {
  USD: {
    buying: number;
    selling: number;
  };
  EUR: {
    buying: number;
    selling: number;
  };
  RUB: {
    buying: number;
    selling: number;
  };
  lastUpdate: string;
  source?: 'TCMB' | 'fallback';
  error?: boolean;
}

/**
 * Fetch exchange rates from our API endpoint
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch('/api/exchange-rates', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback rates
    return {
      USD: { buying: 34.50, selling: 34.65 },
      EUR: { buying: 37.20, selling: 37.35 },
      RUB: { buying: 0.35, selling: 0.36 },
      lastUpdate: new Date().toISOString(),
      error: true
    };
  }
}

/**
 * Convert amount from one currency to another using TCMB rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;

  // Convert to TRY first
  let amountInTRY = amount;
  if (fromCurrency !== 'TRY') {
    const rate = rates[fromCurrency as keyof Omit<ExchangeRates, 'lastUpdate'>];
    amountInTRY = amount * rate.selling;
  }

  // Then convert from TRY to target currency
  if (toCurrency === 'TRY') return amountInTRY;
  
  const targetRate = rates[toCurrency as keyof Omit<ExchangeRates, 'lastUpdate'>];
  return amountInTRY / targetRate.buying;
}

/**
 * Format exchange rate for display (shows 4 decimal places)
 */
export function formatExchangeRate(rate: number): string {
  // Handle edge cases
  if (!isFinite(rate)) {
    return String(rate);
  }
  
  // Show exactly 4 decimal places
  return rate.toFixed(4);
}

/**
 * Get exchange rate snapshot for storing with position
 */
export async function getExchangeRateSnapshot(): Promise<Record<string, number>> {
  const rates = await fetchExchangeRates();
  return {
    USD_TRY: rates.USD.selling,
    EUR_TRY: rates.EUR.selling,
    RUB_TRY: rates.RUB.selling,
  };
}

