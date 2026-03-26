/**
 * Merkezi Finansal Hesaplama Modülü
 * Tüm finansal veriler (kar, alacak, borç, nakit akışı) bu fonksiyonlardan türetilir.
 * Kaynak: invoices tablosu (SALES / PURCHASE). Döviz dönüşümü: lib/exchange-rates convertCurrency.
 */

import { convertCurrency } from "@/lib/exchange-rates";
import type { ExchangeRates } from "@/lib/exchange-rates";

export type InvoiceRecord = {
  id: string;
  position_id: string;
  invoice_type: "SALES" | "PURCHASE";
  amount: number;
  currency: string;
  invoice_date: string;
  due_date: string | null;
  is_paid: boolean;
};

/**
 * Tek para birimine çevir.
 * Rates yoksa ham tutarı döndür (hatalı olabilir ama crash'ten daha iyi).
 * Rates error=true ise yine de dönüşüm yap (fallback rates da işe yarar).
 */
function toCurrency(
  amount: number,
  fromCurrency: string,
  targetCurrency: string,
  rates: ExchangeRates | null | undefined
): number {
  if (!rates) return amount;
  if (fromCurrency === targetCurrency) return amount;
  try {
    return convertCurrency(amount, fromCurrency, targetCurrency, rates);
  } catch {
    return amount;
  }
}

/**
 * Faturalardan kar hesapla: Sum(SALES) - Sum(PURCHASE)
 * @param filterFn - Opsiyonel: hangi faturalar dahil (örn. tarih, is_paid, position_id)
 */
export function computeProfitFromInvoices(
  invoices: InvoiceRecord[],
  targetCurrency: string,
  exchangeRates: ExchangeRates | null | undefined,
  filterFn?: (inv: InvoiceRecord) => boolean
): number {
  const list = filterFn ? invoices.filter(filterFn) : invoices;
  return list.reduce((sum, inv) => {
    const amt = toCurrency(inv.amount, inv.currency, targetCurrency, exchangeRates);
    return sum + (inv.invoice_type === "SALES" ? amt : -amt);
  }, 0);
}

/**
 * Aylık kar serisi (son N ay)
 */
export function computeMonthlyProfitFromInvoices(
  invoices: InvoiceRecord[],
  exchangeRates: ExchangeRates | null | undefined,
  targetCurrency: string,
  lastNMonths: number = 6
): { month: string; monthIndex: number; year: number; value: number }[] {
  const now = new Date();
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const result: { month: string; monthIndex: number; year: number; value: number }[] = [];

  for (let i = lastNMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    const value = computeProfitFromInvoices(invoices, targetCurrency, exchangeRates, (inv) => {
      const id = new Date(inv.invoice_date);
      return id.getMonth() === monthIndex && id.getFullYear() === year;
    });

    result.push({
      month: months[monthIndex],
      monthIndex,
      year,
      value,
    });
  }
  return result;
}

/**
 * Nakit akışı: aylık gelir (SALES) ve gider (PURCHASE)
 */
export function computeCashFlowFromInvoices(
  invoices: InvoiceRecord[],
  exchangeRates: ExchangeRates | null | undefined,
  targetCurrency: string,
  lastNMonths: number = 6,
  onlyPaid: boolean = false
): { month: string; monthIndex: number; year: number; income: number; expense: number; profit: number }[] {
  const now = new Date();
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const result: { month: string; monthIndex: number; year: number; income: number; expense: number; profit: number }[] = [];

  for (let i = lastNMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    const baseFilter = (inv: InvoiceRecord) => {
      const id = new Date(inv.invoice_date);
      if (id.getMonth() !== monthIndex || id.getFullYear() !== year) return false;
      if (onlyPaid && !inv.is_paid) return false;
      return true;
    };

    const income = invoices
      .filter((inv) => baseFilter(inv) && inv.invoice_type === "SALES")
      .reduce((s, inv) => s + toCurrency(inv.amount, inv.currency, targetCurrency, exchangeRates), 0);
    const expense = invoices
      .filter((inv) => baseFilter(inv) && inv.invoice_type === "PURCHASE")
      .reduce((s, inv) => s + toCurrency(inv.amount, inv.currency, targetCurrency, exchangeRates), 0);

    result.push({
      month: months[monthIndex],
      monthIndex,
      year,
      income,
      expense,
      profit: income - expense,
    });
  }
  return result;
}

/**
 * Alacak (ödenmemiş SALES), Borç (ödenmemiş PURCHASE), Vadesi geçmiş alacak
 */
export function computeReceivablesPayables(
  invoices: InvoiceRecord[],
  exchangeRates: ExchangeRates | null | undefined,
  targetCurrency: string
): { receivables: number; payables: number; overdueReceivables: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let receivables = 0;
  let payables = 0;
  let overdueReceivables = 0;

  for (const inv of invoices) {
    if (inv.is_paid) continue;
    const amt = toCurrency(inv.amount, inv.currency, targetCurrency, exchangeRates);
    if (inv.invoice_type === "SALES") {
      receivables += amt;
      if (inv.due_date && new Date(inv.due_date) < today) overdueReceivables += amt;
    } else if (inv.invoice_type === "PURCHASE") {
      payables += amt;
    }
  }
  return { receivables, payables, overdueReceivables };
}

/**
 * Ödenen faturalardan net kar
 */
export function computeNetProfitPaid(
  invoices: InvoiceRecord[],
  targetCurrency: string,
  exchangeRates: ExchangeRates | null | undefined
): number {
  return computeProfitFromInvoices(invoices, targetCurrency, exchangeRates, (inv) => inv.is_paid);
}

/**
 * Belirli position_id listesine ait faturalardan kar
 */
export function computeProfitForPositions(
  invoices: InvoiceRecord[],
  positionIds: Set<string>,
  targetCurrency: string,
  exchangeRates: ExchangeRates | null | undefined
): number {
  return computeProfitFromInvoices(invoices, targetCurrency, exchangeRates, (inv) =>
    positionIds.has(inv.position_id)
  );
}

// ─── Para Birimi Bazlı Breakdown (dönüşüm yapılmaz) ──────────────────────────

export type CurrencyBreakdown = {
  currency: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
};

/**
 * Fatura verilerini para birimi bazında grupla (döviz dönüşümü yapılmaz).
 * Her para birimi kendi değerleriyle gösterilir.
 */
export function computeByCurrency(
  invoices: InvoiceRecord[],
  filterFn?: (inv: InvoiceRecord) => boolean
): CurrencyBreakdown[] {
  const list = filterFn ? invoices.filter(filterFn) : invoices;
  const map = new Map<string, { revenue: number; cost: number }>();

  for (const inv of list) {
    if (!map.has(inv.currency)) {
      map.set(inv.currency, { revenue: 0, cost: 0 });
    }
    const entry = map.get(inv.currency)!;
    if (inv.invoice_type === "SALES") {
      entry.revenue += inv.amount;
    } else {
      entry.cost += inv.amount;
    }
  }

  const currencyOrder = ["USD", "EUR", "TRY", "RUB"];
  const result: CurrencyBreakdown[] = [];

  Array.from(map.entries()).forEach(([currency, { revenue, cost }]) => {
    const profit = revenue - cost;
    result.push({
      currency,
      revenue,
      cost,
      profit,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    });
  });

  return result.sort((a, b) => {
    const ai = currencyOrder.indexOf(a.currency);
    const bi = currencyOrder.indexOf(b.currency);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

// ─── Kapsamlı KPI Özeti ───────────────────────────────────────────────────────

export type FinancialKPISummary = {
  /** Tüm zamanlar gelir (SALES) */
  totalRevenue: number;
  /** Tüm zamanlar gider (PURCHASE) */
  totalCost: number;
  /** Brüt kar = totalRevenue - totalCost */
  grossProfit: number;
  /** Brüt kar marjı % */
  grossMargin: number;
  /** Sadece ödenenlerden net kar */
  netProfitPaid: number;
  /** Tahsil edilmemiş alacak */
  receivables: number;
  /** Ödenmemiş borç */
  payables: number;
  /** Vadesi geçmiş alacak */
  overdueReceivables: number;
  /** Bu ay gelir */
  thisMonthRevenue: number;
  /** Bu ay gider */
  thisMonthCost: number;
  /** Bu ay kar */
  thisMonthProfit: number;
  /** Geçen ay kar */
  lastMonthProfit: number;
  /** Aylık kar değişim % */
  profitTrend: number;
  /** Yıl başından bu yana gelir */
  ytdRevenue: number;
  /** Yıl başından bu yana kar */
  ytdProfit: number;
  /** Net pozisyon (alacak - borç) */
  netPosition: number;
};

/**
 * Tüm finansal KPI'ları tek seferde hesapla.
 * Dashboard ve raporlama için kullanılır.
 */
export function computeFinancialKPISummary(
  invoices: InvoiceRecord[],
  targetCurrency: string,
  exchangeRates: ExchangeRates | null | undefined
): FinancialKPISummary {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const filterMonth = (inv: InvoiceRecord, m: number, y: number) => {
    const d = new Date(inv.invoice_date);
    return d.getMonth() === m && d.getFullYear() === y;
  };

  const toC = (inv: InvoiceRecord) =>
    toCurrency(inv.amount, inv.currency, targetCurrency, exchangeRates);

  // Tüm zamanlar
  const totalRevenue = invoices
    .filter((inv) => inv.invoice_type === "SALES")
    .reduce((s, inv) => s + toC(inv), 0);
  const totalCost = invoices
    .filter((inv) => inv.invoice_type === "PURCHASE")
    .reduce((s, inv) => s + toC(inv), 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const netProfitPaid = computeNetProfitPaid(invoices, targetCurrency, exchangeRates);
  const { receivables, payables, overdueReceivables } = computeReceivablesPayables(
    invoices,
    exchangeRates,
    targetCurrency
  );

  // Bu ay
  const thisMonthInvs = invoices.filter((inv) => filterMonth(inv, currentMonth, currentYear));
  const thisMonthRevenue = thisMonthInvs
    .filter((inv) => inv.invoice_type === "SALES")
    .reduce((s, inv) => s + toC(inv), 0);
  const thisMonthCost = thisMonthInvs
    .filter((inv) => inv.invoice_type === "PURCHASE")
    .reduce((s, inv) => s + toC(inv), 0);
  const thisMonthProfit = thisMonthRevenue - thisMonthCost;

  // Geçen ay
  const lastMonthProfit = computeProfitFromInvoices(
    invoices,
    targetCurrency,
    exchangeRates,
    (inv) => filterMonth(inv, lastMonth, lastMonthYear)
  );
  const profitTrend =
    lastMonthProfit !== 0
      ? Math.round(((thisMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100)
      : thisMonthProfit > 0
      ? 100
      : 0;

  // YTD
  const ytdRevenue = invoices
    .filter((inv) => inv.invoice_type === "SALES" && new Date(inv.invoice_date).getFullYear() === currentYear)
    .reduce((s, inv) => s + toC(inv), 0);
  const ytdProfit = computeProfitFromInvoices(
    invoices,
    targetCurrency,
    exchangeRates,
    (inv) => new Date(inv.invoice_date).getFullYear() === currentYear
  );

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    grossMargin,
    netProfitPaid,
    receivables,
    payables,
    overdueReceivables,
    thisMonthRevenue,
    thisMonthCost,
    thisMonthProfit,
    lastMonthProfit,
    profitTrend,
    ytdRevenue,
    ytdProfit,
    netPosition: receivables - payables,
  };
}
