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

/** Tek para birimine çevir (exchangeRates yoksa orijinal tutarı döndür, karışık para toplamı hatalı olabilir) */
function toCurrency(
  amount: number,
  fromCurrency: string,
  targetCurrency: string,
  rates: ExchangeRates | null | undefined
): number {
  if (!rates || rates.error) return amount;
  return convertCurrency(amount, fromCurrency, targetCurrency, rates);
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
 * Ödenenler veya tümü - filterFn ile kontrol edilir. Varsayılan: tümü (income/expense tahmini)
 * İsterseniz is_paid ile sınırlayabilirsiniz.
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
 * Ödenen faturalardan net kar (Finance sayfası "Net Kar (Ödenenler)" ile uyumlu)
 */
export function computeNetProfitPaid(
  invoices: InvoiceRecord[],
  targetCurrency: string,
  exchangeRates: ExchangeRates | null | undefined
): number {
  return computeProfitFromInvoices(invoices, targetCurrency, exchangeRates, (inv) => inv.is_paid);
}

/**
 * Belirli position_id listesine ait faturalardan kar (örn. sadece COMPLETED pozisyonlar)
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
