import { NextResponse } from 'next/server';
import { fetchTCMBExchangeRates } from '@/lib/tcmb-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/exchange-rates
 * Fetches real-time exchange rates from TCMB (Türkiye Cumhuriyet Merkez Bankası)
 * Returns USD, EUR, and RUB rates with buying/selling prices
 */
export async function GET() {
  try {
    const rates = await fetchTCMBExchangeRates();

    // Return the rates in the expected format
    return NextResponse.json({
      USD: rates.USD,
      EUR: rates.EUR,
      RUB: rates.RUB,
      lastUpdate: rates.lastUpdate,
      source: rates.source,
      error: rates.error || false,
    });
  } catch (error) {
    console.error('Exchange Rate API Error:', error);
    
    // Return fallback rates
    const fallbackRates = {
      USD: { buying: 43.10, selling: 43.50 },
      EUR: { buying: 50.20, selling: 50.70 },
      RUB: { buying: 0.53, selling: 0.55 },
      lastUpdate: new Date().toISOString(),
      source: 'fallback' as const,
      error: true,
    };

    return NextResponse.json(fallbackRates, { status: 200 });
  }
}
