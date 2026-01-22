import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/exchange-rates/all
 * Fetches all exchange rates from TCMB today.xml
 */
export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IRMA-CRM/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`TCMB API responded with status: ${response.status}`);
    }

    const xmlData = await response.text();

    if (!xmlData || xmlData.trim().length === 0) {
      throw new Error('TCMB returned empty response');
    }

    // Extract all currencies using regex
    const currencies: any[] = [];
    const currencyRegex = /<Currency[^>]*CurrencyCode="([^"]+)"[^>]*>([\s\S]*?)<\/Currency>/gi;
    let match;

    while ((match = currencyRegex.exec(xmlData)) !== null) {
      const currencyCode = match[1];
      const currencyBlock = match[2];

      const extractTag = (tagName: string): string => {
        const tagRegex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'i');
        const tagMatch = currencyBlock.match(tagRegex);
        return tagMatch ? tagMatch[1].trim() : '';
      };

      currencies.push({
        CurrencyCode: currencyCode,
        Isim: extractTag('Isim'),
        ForexBuying: extractTag('ForexBuying'),
        ForexSelling: extractTag('ForexSelling'),
        BanknoteBuying: extractTag('BanknoteBuying'),
        BanknoteSelling: extractTag('BanknoteSelling'),
        Unit: extractTag('Unit') || '1',
      });
    }

    // Extract date
    const dateMatch = xmlData.match(/<Tarih_Date[^>]*Date="([^"]+)"/i);
    const tarihMatch = xmlData.match(/<Tarih_Date[^>]*Tarih="([^"]+)"/i);
    const lastUpdate = dateMatch
      ? dateMatch[1]
      : tarihMatch
      ? tarihMatch[1]
      : new Date().toISOString();

    return NextResponse.json({
      currencies,
      lastUpdate,
      count: currencies.length,
    });
  } catch (error) {
    console.error('TCMB All Rates API Error:', error);
    return NextResponse.json(
      {
        currencies: [],
        lastUpdate: new Date().toISOString(),
        count: 0,
        error: true,
      },
      { status: 200 }
    );
  }
}
