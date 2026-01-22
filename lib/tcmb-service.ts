/**
 * TCMB Exchange Rate Service
 * Fetches real-time exchange rates from Türkiye Cumhuriyet Merkez Bankası (TCMB)
 * Source: https://www.tcmb.gov.tr/kurlar/today.xml
 */

import { XMLParser } from 'fast-xml-parser';

export interface TCMBCurrency {
  Isim: string;
  ForexBuying: string;
  ForexSelling: string;
  BanknoteBuying: string;
  BanknoteSelling: string;
  CrossRateUSD?: string;
  CrossRateOther?: string;
  CurrencyCode: string;
  Unit: string;
}

export interface TCMBResponse {
  Tarih_Date: {
    Tarih: string;
    Date: string;
    Bulten_No: string;
    Currency: TCMBCurrency[];
  };
}

export interface ParsedExchangeRate {
  buying: number;
  selling: number;
  banknoteBuying?: number;
  banknoteSelling?: number;
  currencyCode: string;
  name: string;
  unit: number;
}

export interface ExchangeRatesResult {
  USD: { buying: number; selling: number };
  EUR: { buying: number; selling: number };
  RUB: { buying: number; selling: number };
  lastUpdate: string;
  source: 'TCMB' | 'fallback';
  error?: boolean;
}

/**
 * Extract currency values directly from XML using regex to preserve precision
 * This bypasses XML parser's number conversion
 */
function extractCurrencyFromXML(xmlData: string, currencyCode: string): {
  ForexBuying: string;
  ForexSelling: string;
  BanknoteBuying?: string;
  BanknoteSelling?: string;
  Unit: string;
  Isim: string;
} | null {
  try {
    // Find the Currency block for the specific currency code
    const currencyRegex = new RegExp(
      `<Currency[^>]*CurrencyCode="${currencyCode}"[^>]*>([\\s\\S]*?)</Currency>`,
      'i'
    );
    
    const match = xmlData.match(currencyRegex);
    if (!match) {
      return null;
    }

    const currencyBlock = match[1];
    
    // Extract values using regex - preserve as strings
    const extractTag = (tagName: string): string => {
      const tagRegex = new RegExp(`<${tagName}[^>]*>([^<]+)</${tagName}>`, 'i');
      const tagMatch = currencyBlock.match(tagRegex);
      return tagMatch ? tagMatch[1].trim() : '';
    };

    return {
      ForexBuying: extractTag('ForexBuying'),
      ForexSelling: extractTag('ForexSelling'),
      BanknoteBuying: extractTag('BanknoteBuying') || undefined,
      BanknoteSelling: extractTag('BanknoteSelling') || undefined,
      Unit: extractTag('Unit') || '1',
      Isim: extractTag('Isim'),
    };
  } catch (error) {
    console.error(`Error extracting ${currencyCode} from XML:`, error);
    return null;
  }
}

/**
 * Parse TCMB XML response and extract exchange rates
 * Uses regex extraction to preserve full precision
 */
function parseTCMBXML(xmlData: string): TCMBResponse | null {
  try {
    // Extract date information
    const dateMatch = xmlData.match(/<Tarih_Date[^>]*Date="([^"]+)"/i);
    const tarihMatch = xmlData.match(/<Tarih_Date[^>]*Tarih="([^"]+)"/i);
    const bultenMatch = xmlData.match(/<Bulten_No>([^<]+)<\/Bulten_No>/i);
    
    // Extract currencies using regex (preserves precision)
    const currencies: TCMBCurrency[] = [];
    
    // Extract USD, EUR, RUB
    const currencyCodes = ['USD', 'EUR', 'RUB'];
    for (const code of currencyCodes) {
      const currencyData = extractCurrencyFromXML(xmlData, code);
      if (currencyData) {
        currencies.push({
          CurrencyCode: code,
          ForexBuying: currencyData.ForexBuying,
          ForexSelling: currencyData.ForexSelling,
          BanknoteBuying: currencyData.BanknoteBuying || '',
          BanknoteSelling: currencyData.BanknoteSelling || '',
          Unit: currencyData.Unit,
          Isim: currencyData.Isim,
        });
      }
    }

    return {
      Tarih_Date: {
        Tarih: tarihMatch ? tarihMatch[1] : '',
        Date: dateMatch ? dateMatch[1] : '',
        Bulten_No: bultenMatch ? bultenMatch[1] : '',
        Currency: currencies,
      },
    };
  } catch (error) {
    console.error('XML Parse Error:', error);
    return null;
  }
}

/**
 * Extract currency data from TCMB response
 * Preserves full precision by working with strings and converting only when necessary
 */
function extractCurrency(
  currencies: TCMBCurrency[],
  currencyCode: string
): ParsedExchangeRate | null {
  const currency = currencies.find(
    (c) => c.CurrencyCode === currencyCode
  );

  if (!currency) {
    return null;
  }

  // TCMB provides rates as 1 unit of foreign currency = X TRY
  // ForexBuying: Bank buys foreign currency from you (you sell to bank)
  // ForexSelling: Bank sells foreign currency to you (you buy from bank)
  
  // Get raw string values to preserve precision
  let buyingStr = (currency.ForexBuying || '0').trim();
  let sellingStr = (currency.ForexSelling || '0').trim();
  let banknoteBuyingStr = currency.BanknoteBuying?.trim();
  let banknoteSellingStr = currency.BanknoteSelling?.trim();
  const unit = parseInt(currency.Unit || '1', 10);

  // If unit > 1, divide by unit to get rate for 1 unit
  // Do division using string manipulation to preserve precision
  if (unit > 1 && unit > 0) {
    const divideByUnit = (valueStr: string): string => {
      const value = parseFloat(valueStr);
      if (isNaN(value)) return valueStr;
      // Use high precision division
      const result = value / unit;
      // Convert back to string preserving all decimals
      return result.toString();
    };
    
    buyingStr = divideByUnit(buyingStr);
    sellingStr = divideByUnit(sellingStr);
    if (banknoteBuyingStr) {
      banknoteBuyingStr = divideByUnit(banknoteBuyingStr);
    }
    if (banknoteSellingStr) {
      banknoteSellingStr = divideByUnit(banknoteSellingStr);
    }
  }

  // Convert to number only at the end, preserving as much precision as possible
  // Use parseFloat which preserves more precision than Number() for decimal numbers
  const buying = parseFloat(buyingStr);
  const selling = parseFloat(sellingStr);
  const banknoteBuying = banknoteBuyingStr ? parseFloat(banknoteBuyingStr) : undefined;
  const banknoteSelling = banknoteSellingStr ? parseFloat(banknoteSellingStr) : undefined;

  return {
    buying,
    selling,
    banknoteBuying,
    banknoteSelling,
    currencyCode: currency.CurrencyCode,
    name: currency.Isim,
    unit: unit,
  };
}

/**
 * Fetch exchange rates from TCMB
 */
export async function fetchTCMBExchangeRates(): Promise<ExchangeRatesResult> {
  const fallbackRates: ExchangeRatesResult = {
    USD: { buying: 43.10, selling: 43.50 },
    EUR: { buying: 50.20, selling: 50.70 },
    RUB: { buying: 0.53, selling: 0.55 },
    lastUpdate: new Date().toISOString(),
    source: 'fallback',
    error: true,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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

    const parsedData = parseTCMBXML(xmlData);

    if (!parsedData || !parsedData.Tarih_Date || !parsedData.Tarih_Date.Currency) {
      throw new Error('Invalid TCMB XML structure');
    }

    const currencies = Array.isArray(parsedData.Tarih_Date.Currency)
      ? parsedData.Tarih_Date.Currency
      : [parsedData.Tarih_Date.Currency];

    // Extract USD, EUR, RUB rates
    const usdRate = extractCurrency(currencies, 'USD');
    const eurRate = extractCurrency(currencies, 'EUR');
    const rubRate = extractCurrency(currencies, 'RUB');

    // Use TCMB date or current date
    const tcmbDate = parsedData.Tarih_Date.Date || parsedData.Tarih_Date.Tarih;
    const lastUpdate = tcmbDate
      ? new Date(tcmbDate).toISOString()
      : new Date().toISOString();

    return {
      USD: {
        buying: usdRate?.buying || fallbackRates.USD.buying,
        selling: usdRate?.selling || fallbackRates.USD.selling,
      },
      EUR: {
        buying: eurRate?.buying || fallbackRates.EUR.buying,
        selling: eurRate?.selling || fallbackRates.EUR.selling,
      },
      RUB: {
        buying: rubRate?.buying || fallbackRates.RUB.buying,
        selling: rubRate?.selling || fallbackRates.RUB.selling,
      },
      lastUpdate,
      source: 'TCMB',
      error: false,
    };
  } catch (error) {
    console.error('TCMB Exchange Rate Fetch Error:', error);
    
    // Return fallback rates with error flag
    return {
      ...fallbackRates,
      error: true,
    };
  }
}
