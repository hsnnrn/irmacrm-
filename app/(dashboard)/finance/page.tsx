"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  Globe,
  PieChart,
  Activity,
  AlertTriangle,
  Target,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices } from "@/hooks/use-invoices";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { convertCurrency } from "@/lib/exchange-rates";
import {
  computeReceivablesPayables,
  computeNetProfitPaid,
  computeCashFlowFromInvoices,
  computeByCurrency,
  computeFinancialKPISummary,
  type CurrencyBreakdown,
} from "@/lib/finance";
import { CurrencyCard } from "@/components/ui/currency-card";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { useTableFeatures } from "@/hooks/use-table-features";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SortableHeader } from "@/components/ui/sortable-header";

// ─── Currency helpers ─────────────────────────────────────────────────────────

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  TRY: "🇹🇷",
  RUB: "🇷🇺",
};

function formatNative(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${currency}`;
  }
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  colorClass,
  bgClass,
  borderClass,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass?: string;
  borderClass?: string;
}) {
  return (
    <Card className={borderClass}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${bgClass ?? "bg-gray-50"}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinancePage() {
  const { data: invoicesData, isLoading, error } = useInvoices();
  const { data: exchangeRates, isLoading: ratesLoading } = useExchangeRates();
  const [filterType, setFilterType] = useState<"ALL" | "SALES" | "PURCHASE">("ALL");
  const [filterPaid, setFilterPaid] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  const { currency: displayCurrency, setCurrency: setDisplayCurrency } = useCurrencyStore();

  // Normalize invoices
  const invoices = useMemo(
    () =>
      (invoicesData ?? []).map((inv: any) => ({
        id: inv.id,
        position_id: inv.position_id,
        invoice_type: inv.invoice_type as "SALES" | "PURCHASE",
        amount: Number(inv.amount),
        currency: inv.currency,
        invoice_date: inv.invoice_date,
        due_date: inv.due_date ?? null,
        is_paid: Boolean(inv.is_paid),
        position_no: inv.positions?.position_no ?? 0,
        customer_name: inv.positions?.customers?.company_name ?? "—",
        loading_point: inv.positions?.loading_point ?? "",
        unloading_point: inv.positions?.unloading_point ?? "",
        overdue_days:
          inv.due_date && !inv.is_paid
            ? Math.max(
                0,
                Math.floor(
                  (new Date().getTime() - new Date(inv.due_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )
            : 0,
      })),
    [invoicesData]
  );

  const convertAmount = (amount: number, fromCurrency: string): number => {
    if (!exchangeRates) return amount;
    try {
      return convertCurrency(amount, fromCurrency, displayCurrency, exchangeRates);
    } catch {
      return amount;
    }
  };

  // ── KPI Özeti ──────────────────────────────────────────────────────────────
  const kpi = useMemo(
    () => computeFinancialKPISummary(invoices, displayCurrency, exchangeRates ?? undefined),
    [invoices, displayCurrency, exchangeRates]
  );

  // ── Döviz Bazlı Breakdown ─────────────────────────────────────────────────
  const currencyBreakdown = useMemo(() => computeByCurrency(invoices), [invoices]);

  // ── Nakit Akışı ───────────────────────────────────────────────────────────
  const cashFlow = useMemo(
    () =>
      computeCashFlowFromInvoices(
        invoices,
        exchangeRates ?? undefined,
        displayCurrency,
        6,
        false
      ),
    [invoices, displayCurrency, exchangeRates]
  );

  // ── Vade Analizi (aging) ──────────────────────────────────────────────────
  const overdueAging = useMemo(() => {
    const unpaidSales = invoices.filter((inv) => inv.invoice_type === "SALES" && !inv.is_paid);
    const buckets = {
      current: 0,
      d30: 0,
      d60: 0,
      d90: 0,
      d90plus: 0,
    };
    for (const inv of unpaidSales) {
      const amt = convertAmount(inv.amount, inv.currency);
      if (inv.overdue_days === 0) buckets.current += amt;
      else if (inv.overdue_days <= 30) buckets.d30 += amt;
      else if (inv.overdue_days <= 60) buckets.d60 += amt;
      else if (inv.overdue_days <= 90) buckets.d90 += amt;
      else buckets.d90plus += amt;
    }
    return buckets;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, displayCurrency, exchangeRates]);

  // ── Tablo Filtresi ────────────────────────────────────────────────────────
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterType !== "ALL" && inv.invoice_type !== filterType) return false;
      if (filterPaid === "PAID" && !inv.is_paid) return false;
      if (filterPaid === "UNPAID" && inv.is_paid) return false;
      return true;
    });
  }, [invoices, filterType, filterPaid]);

  const {
    data: paginatedInvoices,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    totalItems,
  } = useTableFeatures(filteredInvoices, 10, { key: "invoice_date", direction: "desc" });

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <p className="text-red-600">Hata: {(error as Error).message}</p>
      </div>
    );
  }

  const maxCashFlow = Math.max(...cashFlow.map((m) => m.income + m.expense), 1);
  const totalAging =
    overdueAging.current + overdueAging.d30 + overdueAging.d60 + overdueAging.d90 + overdueAging.d90plus || 1;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finans</h1>
          <p className="text-gray-500 text-sm">
            Alacak, borç ve karlılık takibi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw
            className={`h-4 w-4 text-gray-400 ${ratesLoading ? "animate-spin" : ""}`}
          />
          <span className="text-sm text-gray-500">Kur:</span>
          <Select
            value={displayCurrency}
            onValueChange={(value: any) => setDisplayCurrency(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TRY">TRY (₺)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="RUB">RUB (₽)</SelectItem>
            </SelectContent>
          </Select>
          {exchangeRates && !exchangeRates.error && (
            <span className="text-xs text-green-600 font-medium">TCMB Canlı</span>
          )}
        </div>
      </div>

      {/* ── KPI Satırı 1: Brüt Karlılık ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-600" />
          Brüt Karlılık Analizi
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Toplam Ciro"
            value={formatCurrency(kpi.totalRevenue, displayCurrency)}
            subtitle={`${invoices.filter((i) => i.invoice_type === "SALES").length} satış faturası`}
            icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
            colorClass="text-blue-700"
            bgClass="bg-blue-50"
          />
          <KpiCard
            title="Toplam Maliyet"
            value={formatCurrency(kpi.totalCost, displayCurrency)}
            subtitle={`${invoices.filter((i) => i.invoice_type === "PURCHASE").length} alış faturası`}
            icon={<TrendingDown className="h-4 w-4 text-red-600" />}
            colorClass="text-red-700"
            bgClass="bg-red-50"
          />
          <KpiCard
            title="Brüt Kar"
            value={formatCurrency(kpi.grossProfit, displayCurrency)}
            subtitle={`Kar Marjı: %${kpi.grossMargin.toFixed(1)}`}
            icon={<DollarSign className="h-4 w-4 text-green-600" />}
            colorClass={kpi.grossProfit >= 0 ? "text-green-700" : "text-red-700"}
            bgClass="bg-green-50"
            borderClass={kpi.grossProfit >= 0 ? "border-green-200" : "border-red-200"}
          />
          <KpiCard
            title="Net Kar (Ödenenler)"
            value={formatCurrency(kpi.netProfitPaid, displayCurrency)}
            subtitle="Sadece tahsil edilen"
            icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
            colorClass={kpi.netProfitPaid >= 0 ? "text-emerald-700" : "text-red-700"}
            bgClass="bg-emerald-50"
            borderClass="border-emerald-200 bg-emerald-50"
          />
        </div>
      </section>

      {/* ── KPI Satırı 2: Alacak & Borç ── */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
          <Activity className="h-4 w-4 text-orange-600" />
          Alacak & Borç Yönetimi
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Toplam Alacak"
            value={formatCurrency(kpi.receivables, displayCurrency)}
            subtitle="Ödenmemiş satış faturaları"
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            colorClass="text-green-700"
            bgClass="bg-green-50"
          />
          <KpiCard
            title="Toplam Borç"
            value={formatCurrency(kpi.payables, displayCurrency)}
            subtitle="Ödenmemiş alış faturaları"
            icon={<TrendingDown className="h-4 w-4 text-red-600" />}
            colorClass="text-red-700"
            bgClass="bg-red-50"
          />
          <KpiCard
            title="Vadesi Geçmiş"
            value={formatCurrency(kpi.overdueReceivables, displayCurrency)}
            subtitle="Gecikmiş tahsilat"
            icon={<Clock className="h-4 w-4 text-orange-600" />}
            colorClass="text-orange-700"
            bgClass="bg-orange-50"
            borderClass="border-orange-200"
          />
          <KpiCard
            title="Net Pozisyon"
            value={formatCurrency(kpi.netPosition, displayCurrency)}
            subtitle="Alacak eksi borç"
            icon={<Target className="h-4 w-4 text-purple-600" />}
            colorClass={kpi.netPosition >= 0 ? "text-purple-700" : "text-red-700"}
            bgClass="bg-purple-50"
          />
        </div>
      </section>

      {/* ── Döviz Bazlı Tablo ── */}
      {currencyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              Döviz Bazlı Finansal Tablo
            </CardTitle>
            <CardDescription>
              Orijinal para birimlerinde — döviz dönüşümü uygulanmaz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Para Birimi</th>
                    <th className="text-right py-3 px-4 font-semibold text-green-700">Gelir (Satış)</th>
                    <th className="text-right py-3 px-4 font-semibold text-red-700">Gider (Alış)</th>
                    <th className="text-right py-3 px-4 font-semibold text-blue-700">Brüt Kar</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Kar Marjı</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Görsel</th>
                  </tr>
                </thead>
                <tbody>
                  {currencyBreakdown.map((cb: CurrencyBreakdown) => (
                    <tr key={cb.currency} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{CURRENCY_FLAGS[cb.currency] ?? "🌍"}</span>
                          <span className="font-bold text-gray-900">{cb.currency}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-green-700">
                        {formatNative(cb.revenue, cb.currency)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-red-700">
                        {formatNative(cb.cost, cb.currency)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold">
                        <span className={cb.profit >= 0 ? "text-green-700" : "text-red-700"}>
                          {cb.profit >= 0 ? "+" : ""}
                          {formatNative(cb.profit, cb.currency)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Badge variant={cb.profit >= 0 ? "success" : "danger"}>
                          {cb.profit >= 0 ? "+" : ""}%{cb.margin.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex h-2.5 w-32 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full ${cb.profit >= 0 ? "bg-green-500" : "bg-red-500"}`}
                            style={{ width: `${Math.min(Math.abs(cb.margin), 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {currencyBreakdown.length > 1 && (
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2">
                      <td className="py-3 px-4 font-bold text-gray-700">
                        Toplam ({displayCurrency})
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-700">
                        {formatCurrency(kpi.totalRevenue, displayCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-red-700">
                        {formatCurrency(kpi.totalCost, displayCurrency)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        <span className={kpi.grossProfit >= 0 ? "text-green-700" : "text-red-700"}>
                          {kpi.grossProfit >= 0 ? "+" : ""}
                          {formatCurrency(kpi.grossProfit, displayCurrency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={kpi.grossProfit >= 0 ? "success" : "danger"}>
                          %{kpi.grossMargin.toFixed(1)}
                        </Badge>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Nakit Akışı + Vade Analizi ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nakit Akışı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Aylık Nakit Akışı
            </CardTitle>
            <CardDescription>
              Son 6 ay gelir / gider / kar ({displayCurrency})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cashFlow.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Henüz fatura verisi yok.</p>
              ) : (
                cashFlow.map((data) => {
                  const total = Math.max(data.income + data.expense, 1);
                  return (
                    <div key={`${data.month}-${data.year}`} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 w-14 shrink-0">
                          {data.month} {data.year !== new Date().getFullYear() ? data.year : ""}
                        </span>
                        <div className="flex gap-3 flex-wrap justify-end">
                          <span className="text-green-600">
                            +{formatCurrency(data.income, displayCurrency)}
                          </span>
                          <span className="text-red-600">
                            -{formatCurrency(data.expense, displayCurrency)}
                          </span>
                          <span
                            className={`font-bold ${
                              data.profit >= 0 ? "text-blue-700" : "text-red-700"
                            }`}
                          >
                            ={formatCurrency(data.profit, displayCurrency)}
                          </span>
                        </div>
                      </div>
                      <div className="flex h-4 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="bg-green-400 transition-all"
                          style={{ width: `${(data.income / maxCashFlow) * 100}%` }}
                        />
                        <div
                          className="bg-red-400 transition-all"
                          style={{ width: `${(data.expense / maxCashFlow) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vade Analizi (Aging) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alacak Vade Analizi
            </CardTitle>
            <CardDescription>Ödenmemiş satış faturaları yaşlandırma ({displayCurrency})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Vadesi Gelmemiş", value: overdueAging.current, color: "bg-green-500", textColor: "text-green-700" },
                { label: "1-30 Gün Gecikmiş", value: overdueAging.d30, color: "bg-yellow-500", textColor: "text-yellow-700" },
                { label: "31-60 Gün Gecikmiş", value: overdueAging.d60, color: "bg-orange-500", textColor: "text-orange-700" },
                { label: "61-90 Gün Gecikmiş", value: overdueAging.d90, color: "bg-red-500", textColor: "text-red-700" },
                { label: "90+ Gün Gecikmiş", value: overdueAging.d90plus, color: "bg-red-800", textColor: "text-red-900" },
              ].map((bucket) => (
                <div key={bucket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{bucket.label}</span>
                    <span className={`font-semibold ${bucket.textColor}`}>
                      {formatCurrency(bucket.value, displayCurrency)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bucket.color} transition-all`}
                      style={{ width: `${(bucket.value / totalAging) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Fatura Listesi ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle>Fatura Listesi</CardTitle>
              <CardDescription>
                {totalItems} fatura • Tüm alış ve satış faturalarını görüntüleyin
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tümü</SelectItem>
                  <SelectItem value="SALES">Satış Faturaları</SelectItem>
                  <SelectItem value="PURCHASE">Alış Faturaları</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPaid} onValueChange={(value: any) => setFilterPaid(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Durum</SelectItem>
                  <SelectItem value="PAID">Ödendi</SelectItem>
                  <SelectItem value="UNPAID">Bekliyor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    label="Pos."
                    sortKey="position_no"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Firma"
                    sortKey="customer_name"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>Tip</TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Tutar (Orijinal)"
                    sortKey="amount"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                </TableHead>
                <TableHead className="text-right">
                  Tutar ({displayCurrency})
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Fatura Tarihi"
                    sortKey="invoice_date"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Vade"
                    sortKey="due_date"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Durum"
                    sortKey="is_paid"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-gray-400">
                    Fatura kaydı bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono font-semibold whitespace-nowrap">
                      #{invoice.position_no}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words leading-tight max-w-[160px]">
                      {invoice.customer_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.invoice_type === "SALES" ? "success" : "danger"}>
                        {invoice.invoice_type === "SALES" ? "Satış" : "Alış"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      <span
                        className={
                          invoice.invoice_type === "SALES" ? "text-green-600" : "text-red-600"
                        }
                      >
                        {CURRENCY_FLAGS[invoice.currency] ?? ""}{" "}
                        {formatNative(invoice.amount, invoice.currency)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500 whitespace-nowrap">
                      {invoice.currency !== displayCurrency
                        ? formatCurrency(convertAmount(invoice.amount, invoice.currency), displayCurrency)
                        : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="whitespace-nowrap">{invoice.due_date ? formatDate(invoice.due_date) : "—"}</p>
                        {invoice.overdue_days > 0 && !invoice.is_paid && (
                          <p className="text-xs text-red-600 font-medium">
                            {invoice.overdue_days}g gecikmiş
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.is_paid ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 text-sm">Ödendi</span>
                        </div>
                      ) : (
                        <Badge variant={invoice.overdue_days > 0 ? "danger" : "warning"}>
                          {invoice.overdue_days > 0 ? "Vadesi Geçti" : "Bekliyor"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            totalItems={totalItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}
