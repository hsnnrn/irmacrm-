// Position Status Management and Business Logic

export type PositionStatus =
  | "DRAFT"
  | "READY_TO_DEPART"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type DocumentType =
  | "DRIVER_LICENSE"
  | "VEHICLE_LICENSE"
  | "INSURANCE"
  | "TRANSPORT_CONTRACT"
  | "CMR"
  | "SALES_INVOICE"
  | "PURCHASE_INVOICE";

export const STATUS_LABELS: Record<PositionStatus, string> = {
  DRAFT: "Taslak",
  READY_TO_DEPART: "Hareket Hazır",
  IN_TRANSIT: "Yolda",
  DELIVERED: "Teslim Edildi",
  COMPLETED: "Kapandı",
  CANCELLED: "İptal",
};

export const STATUS_COLORS: Record<PositionStatus, string> = {
  DRAFT: "secondary",
  READY_TO_DEPART: "warning",
  IN_TRANSIT: "info",
  DELIVERED: "success",
  COMPLETED: "default",
  CANCELLED: "danger",
};

export const STATUS_STYLES: Record<PositionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200",
  READY_TO_DEPART: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
  IN_TRANSIT: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
  COMPLETED: "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200",
  CANCELLED: "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200",
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  DRIVER_LICENSE: "Sürücü Belgesi",
  VEHICLE_LICENSE: "Araç Ruhsatı",
  INSURANCE: "Sigorta Belgesi",
  TRANSPORT_CONTRACT: "Taşıma Sözleşmesi",
  CMR: "CMR (Teslimat Belgesi)",
  SALES_INVOICE: "Satış Faturası",
  PURCHASE_INVOICE: "Alış Faturası",
};

// Generate supplier reference number
export function generateSupplierRefNo(
  year: number,
  sequence: number,
  taxId: string
): string {
  const taxIdSuffix = taxId.slice(-4);
  return `IRG-${year}-${sequence.toString().padStart(4, "0")}-${taxIdSuffix}`;
}

// Check if position can depart (transition to IN_TRANSIT)
export function canDepart(documents: DocumentType[]): {
  canDepart: boolean;
  missingDocs: DocumentType[];
} {
  const requiredDocs: DocumentType[] = [
    "DRIVER_LICENSE",
    "VEHICLE_LICENSE",
    "INSURANCE",
    "TRANSPORT_CONTRACT",
  ];

  const missingDocs = requiredDocs.filter((doc) => !documents.includes(doc));

  return {
    canDepart: missingDocs.length === 0,
    missingDocs,
  };
}

// Check if position can be closed (transition to COMPLETED)
export function canClose(
  documents: DocumentType[],
  hasInvoices: { sales: boolean; purchase: boolean }
): {
  canClose: boolean;
  missingItems: string[];
} {
  const missingItems: string[] = [];

  if (!documents.includes("CMR")) {
    missingItems.push("CMR Belgesi");
  }

  // Fatura kontrolü: Hem belge olarak hem de invoice kaydı olarak kontrol et
  // Belge olarak yüklenmişse veya invoice kaydı varsa kabul et
  const hasSalesInvoiceDoc = documents.includes("SALES_INVOICE");
  const hasPurchaseInvoiceDoc = documents.includes("PURCHASE_INVOICE");
  
  if (!hasSalesInvoiceDoc && !hasInvoices.sales) {
    missingItems.push("Satış Faturası");
  }

  if (!hasPurchaseInvoiceDoc && !hasInvoices.purchase) {
    missingItems.push("Alış Faturası");
  }

  return {
    canClose: missingItems.length === 0,
    missingItems,
  };
}

// Calculate profit
export function calculateProfit(
  salesPrice: number,
  salesCurrency: string,
  costPrice: number,
  costCurrency: string,
  exchangeRates: Record<string, number> = {
    TRY: 1,
    USD: 32.5,
    EUR: 35.2,
    RUB: 0.35,
  }
): number {
  const salesInTRY = salesPrice * (exchangeRates[salesCurrency] || 1);
  const costInTRY = costPrice * (exchangeRates[costCurrency] || 1);
  return salesInTRY - costInTRY;
}

/**
 * Pozisyondan satış/maliyet için TRY kuru al.
 * Öncelik: sales_exchange_rate/cost_exchange_rate, exchange_rates_snapshot.sales_rate/cost_rate,
 * sonra USD_TRY, EUR_TRY, RUB_TRY. TRY ise 1.
 */
export function getPositionExchangeRate(
  position: { sales_currency?: string; cost_currency?: string; sales_exchange_rate?: number | null; cost_exchange_rate?: number | null; exchange_rates_snapshot?: Record<string, unknown> | null },
  type: "sales" | "cost"
): number {
  const currency = type === "sales" ? position.sales_currency : position.cost_currency;
  if (currency === "TRY" || !currency) return 1;

  const col = type === "sales" ? position.sales_exchange_rate : position.cost_exchange_rate;
  if (col != null && col > 0) return col;

  const snap = position.exchange_rates_snapshot as Record<string, number> | undefined;
  if (snap) {
    const k = type === "sales" ? "sales_rate" : "cost_rate";
    if (typeof snap[k] === "number" && snap[k] > 0) return snap[k];
    const key = `${currency}_TRY` as "USD_TRY" | "EUR_TRY" | "RUB_TRY";
    if (typeof snap[key] === "number" && snap[key] > 0) return snap[key];
  }
  return 1;
}

// Get next allowed statuses based on current status and conditions
export function getNextAllowedStatuses(
  currentStatus: PositionStatus,
  canDepartCheck: boolean,
  canCloseCheck: boolean
): PositionStatus[] {
  switch (currentStatus) {
    case "DRAFT":
      return ["READY_TO_DEPART", "CANCELLED"];
    case "READY_TO_DEPART":
      return canDepartCheck ? ["IN_TRANSIT", "CANCELLED"] : [];
    case "IN_TRANSIT":
      return ["DELIVERED", "CANCELLED"];
    case "DELIVERED":
      return canCloseCheck ? ["COMPLETED"] : [];
    case "COMPLETED":
      return [];
    case "CANCELLED":
      return [];
    default:
      return [];
  }
}
