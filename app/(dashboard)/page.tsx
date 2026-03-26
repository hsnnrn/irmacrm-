"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  DollarSign,
  Truck,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Globe,
  Clock,
  Banknote,
  PieChart,
  RefreshCw,
  Calculator,
  FileText,
} from "lucide-react";
import { usePositions } from "@/hooks/use-positions";
import { useInvoices } from "@/hooks/use-invoices";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import {
  computeFinancialKPISummary,
  computeCashFlowFromInvoices,
  computeByCurrency,
  type CurrencyBreakdown,
  type InvoiceRecord,
} from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  icon,
  colorClass,
  bgClass,
  tag,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  tag?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {tag && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
              {tag}
            </span>
          )}
        </div>
        <div className={`rounded-lg p-2 ${bgClass}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {trendPositive ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span
              className={`text-xs font-medium ${
                trendPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </span>
            <span className="text-xs text-gray-400">geçen aya göre</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {badge && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <span className="text-sm text-gray-400 hidden sm:block">— {description}</span>
      )}
    </div>
  );
}

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
    const sym: Record<string, string> = { USD: "$", EUR: "€", TRY: "₺", RUB: "₽" };
    return `${sym[currency] ?? currency}${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { permissions } = useUserProfile();
  const { data: positions, isLoading: positionsLoading, error: positionsError } = usePositions();
  const { data: invoicesRaw, isLoading: invoicesLoading, error: invoicesError } = useInvoices();
  const { data: exchangeRates, isLoading: ratesLoading } = useExchangeRates();
  const { currency: displayCurrency, setCurrency: setDisplayCurrency } = useCurrencyStore();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Normalize to InvoiceRecord[]
  const invoices = useMemo(
    (): InvoiceRecord[] =>
      (invoicesRaw ?? []).map((inv: any) => ({
        id: String(inv.id),
        position_id: String(inv.position_id),
        invoice_type: inv.invoice_type as "SALES" | "PURCHASE",
        amount: Number(inv.amount ?? 0),
        currency: String(inv.currency ?? "TRY"),
        invoice_date: String(inv.invoice_date ?? ""),
        due_date: inv.due_date ? String(inv.due_date) : null,
        is_paid: Boolean(inv.is_paid),
      })),
    [invoicesRaw]
  );

  // ── Finansal KPI Özeti (fatura bazlı) ────────────────────────────────────
  const kpi = useMemo(
    () => computeFinancialKPISummary(invoices, displayCurrency, exchangeRates ?? undefined),
    [invoices, displayCurrency, exchangeRates]
  );

  // ── Para Birimi Bazlı Breakdown ───────────────────────────────────────────
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

  // ── Pozisyon Bazlı Metrikler ──────────────────────────────────────────────
  const opMetrics = useMemo(() => {
    const pos = positions ?? [];
    const total = pos.length;
    const completed = pos.filter((p: any) => p.status === "COMPLETED").length;
    const active = pos.filter(
      (p: any) => p.status === "IN_TRANSIT" || p.status === "READY_TO_DEPART"
    ).length;
    const inTransit = pos.filter((p: any) => p.status === "IN_TRANSIT").length;
    const pending = pos.filter(
      (p: any) => p.status === "DELIVERED" || p.status === "READY_TO_DEPART"
    ).length;
    const cancelled = pos.filter((p: any) => p.status === "CANCELLED").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Pozisyon bazlı tahmini kar (estimated_profit alanından)
    // Bu değer invoice olmadan da gösterilir
    const positionEstimatedProfit = pos.reduce(
      (s: number, p: any) =>
        s + (p.status !== "CANCELLED" ? Number(p.estimated_profit ?? 0) : 0),
      0
    );

    // Satış fiyatı toplamı (TRY ve yabancı döviz ayrı)
    const salesByPosition: { currency: string; amount: number }[] = pos
      .filter((p: any) => p.status !== "CANCELLED" && p.sales_price)
      .map((p: any) => ({ currency: p.sales_currency ?? "USD", amount: Number(p.sales_price ?? 0) }));

    const now = new Date();
    const thisMonthPositions = pos.filter((p: any) => {
      const d = new Date(p.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      completed,
      active,
      inTransit,
      pending,
      cancelled,
      completionRate,
      positionEstimatedProfit,
      salesByPosition,
      thisMonthPositions,
    };
  }, [positions]);

  // ── Action Required ───────────────────────────────────────────────────────
  const { paginatedItems, totalItems, totalPages } = useMemo(() => {
    const pos = positions ?? [];
    const allItems = pos.filter(
      (p: any) => p.status === "DELIVERED" || p.status === "READY_TO_DEPART"
    );
    const total = allItems.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    const items = allItems
      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
      .map((p: any) => ({
        id: p.id,
        positionNo: `#${p.position_no}`,
        customer: (p.customers as any)?.company_name || "Müşteri",
        issue:
          p.status === "DELIVERED" ? "Kapatma işlemi bekleniyor" : "Belgeler eksik",
        priority: p.status === "DELIVERED" ? "high" : "medium",
        route: `${p.loading_point} → ${p.unloading_point}`,
      }));
    return { paginatedItems: items, totalItems: total, totalPages: pages };
  }, [positions, currentPage]);

  // ── Son Aktiviteler ───────────────────────────────────────────────────────
  const recentActivities = useMemo(() => {
    const pos = positions ?? [];
    return pos
      .slice()
      .sort(
        (a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 5)
      .map((p: any) => ({
        action:
          p.status === "COMPLETED"
            ? "Pozisyon tamamlandı"
            : p.status === "IN_TRANSIT"
            ? "Yola çıktı"
            : p.status === "DELIVERED"
            ? "Teslimat yapıldı"
            : p.status === "CANCELLED"
            ? "İptal edildi"
            : "Pozisyon oluşturuldu",
        position: `#${p.position_no}`,
        customer: (p.customers as any)?.company_name || "",
        route: `${p.loading_point} → ${p.unloading_point}`,
        time: getTimeAgo(p.updated_at),
        status: p.status,
        icon:
          p.status === "COMPLETED"
            ? CheckCircle
            : p.status === "IN_TRANSIT"
            ? Truck
            : p.status === "CANCELLED"
            ? AlertCircle
            : Package,
        iconColor:
          p.status === "COMPLETED"
            ? "text-green-600"
            : p.status === "IN_TRANSIT"
            ? "text-blue-600"
            : p.status === "CANCELLED"
            ? "text-red-600"
            : "text-gray-600",
      }));
  }, [positions]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (positionsLoading || invoicesLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
          <p className="mt-2 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (positionsError || invoicesError) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center space-y-2">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="text-red-600 font-medium">Veri yükleme hatası</p>
          <p className="text-sm text-gray-500">
            {(positionsError as any)?.message || (invoicesError as any)?.message || "Supabase bağlantısını kontrol edin"}
          </p>
        </div>
      </div>
    );
  }

  const hasInvoices = invoices.length > 0;
  const hasPositions = opMetrics.total > 0;
  const profitTrendPositive = kpi.profitTrend >= 0;
  const maxCashFlow = Math.max(...cashFlow.map((m) => m.income + m.expense), 1);

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString("tr-TR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {permissions?.canViewFinance && (
          <div className="flex items-center gap-2">
            <RefreshCw
              className={`h-4 w-4 text-gray-400 ${ratesLoading ? "animate-spin" : ""}`}
            />
            <span className="text-sm text-gray-500">Gösterim Kuru:</span>
            <Select value={displayCurrency} onValueChange={(v: any) => setDisplayCurrency(v)}>
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
        )}
      </div>

      {/* ── Uyarı: Veri yok ── */}
      {!hasPositions && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Henüz pozisyon verisi bulunmuyor.
              </p>
              <p className="text-xs text-yellow-700">
                Operasyon verilerini görmek için{" "}
                <Link href="/positions/create" className="underline font-medium">
                  pozisyon oluşturun
                </Link>{" "}
                veya Supabase SQL Editor'de{" "}
                <code className="bg-yellow-100 px-1 rounded">seed_data.sql</code> dosyasını çalıştırın.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Uyarı: Fatura yok ── */}
      {hasPositions && !hasInvoices && permissions?.canViewFinance && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center gap-3 py-4">
            <FileText className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Fatura kaydı bulunamadı — finansal KPI'lar pozisyon tahminine göre hesaplanıyor.
              </p>
              <p className="text-xs text-blue-700">
                Gerçek kar verisi için pozisyonlara satış ve alış faturası ekleyin. Supabase SQL
                Editor'de <code className="bg-blue-100 px-1 rounded">INSERT_DASHBOARD_DATA.sql</code>{" "}
                ile örnek fatura verisi oluşturabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Finansal KPI Satırı 1 ── */}
      {permissions?.canViewFinance && (
        <section className="space-y-3">
          <SectionTitle
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            title="Finansal Performans"
            description="Tüm zamanlar & dönemsel analiz"
            badge={hasInvoices ? "Fatura bazlı" : "Pozisyon tahmini"}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Toplam Ciro"
              value={
                hasInvoices
                  ? formatCurrency(kpi.totalRevenue, displayCurrency)
                  : formatCurrency(
                      (positions ?? [])
                        .filter((p: any) => p.status !== "CANCELLED" && p.sales_price)
                        .reduce((s: number, p: any) => {
                          // fallback: sum of sales_price (kur dönüşümü yapılamaz, ham toplam)
                          return s + Number(p.sales_price ?? 0);
                        }, 0),
                      (positions?.[0] as any)?.sales_currency ?? "USD"
                    )
              }
              subtitle={
                hasInvoices
                  ? `${invoices.filter((i) => i.invoice_type === "SALES").length} satış faturası`
                  : "Pozisyon satış fiyatı toplamı (ham)"
              }
              icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
              colorClass="text-blue-700"
              bgClass="bg-blue-50"
              tag={!hasInvoices ? "Tahmini" : undefined}
            />
            <KpiCard
              title="Brüt Kar"
              value={
                hasInvoices
                  ? formatCurrency(kpi.grossProfit, displayCurrency)
                  : formatCurrency(opMetrics.positionEstimatedProfit, (positions?.[0] as any)?.sales_currency ?? "USD")
              }
              subtitle={
                hasInvoices
                  ? `Kar Marjı: %${kpi.grossMargin.toFixed(1)}`
                  : "Pozisyon estimated_profit toplamı"
              }
              icon={<DollarSign className="h-4 w-4 text-green-600" />}
              colorClass={
                (hasInvoices ? kpi.grossProfit : opMetrics.positionEstimatedProfit) >= 0
                  ? "text-green-700"
                  : "text-red-700"
              }
              bgClass="bg-green-50"
              tag={!hasInvoices ? "Tahmini" : undefined}
            />
            <KpiCard
              title="Net Kar (Ödenenler)"
              value={formatCurrency(hasInvoices ? kpi.netProfitPaid : 0, displayCurrency)}
              subtitle={hasInvoices ? "Tahsil edilen faturalardan" : "Fatura eklendikten sonra hesaplanır"}
              icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
              colorClass={hasInvoices && kpi.netProfitPaid < 0 ? "text-red-700" : "text-emerald-700"}
              bgClass="bg-emerald-50"
            />
            <KpiCard
              title="YTD Kar"
              value={formatCurrency(hasInvoices ? kpi.ytdProfit : opMetrics.positionEstimatedProfit, displayCurrency)}
              subtitle={
                hasInvoices
                  ? `${new Date().getFullYear()} yılı toplam`
                  : "Yıl içi tahmini kar (pozisyon bazlı)"
              }
              icon={<Target className="h-4 w-4 text-purple-600" />}
              colorClass={
                (hasInvoices ? kpi.ytdProfit : opMetrics.positionEstimatedProfit) >= 0
                  ? "text-purple-700"
                  : "text-red-700"
              }
              bgClass="bg-purple-50"
              tag={!hasInvoices ? "Tahmini" : undefined}
            />
          </div>
        </section>
      )}

      {/* ── Finansal KPI Satırı 2: Alacak & Borç ── */}
      {permissions?.canViewFinance && (
        <section className="space-y-3">
          <SectionTitle
            icon={<Banknote className="h-5 w-5 text-orange-600" />}
            title="Alacak & Borç Durumu"
            description="Güncel nakit pozisyonu"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Toplam Alacak"
              value={formatCurrency(kpi.receivables, displayCurrency)}
              subtitle="Tahsil edilmemiş satış faturası"
              icon={<TrendingUp className="h-4 w-4 text-green-600" />}
              colorClass="text-green-700"
              bgClass="bg-green-50"
            />
            <KpiCard
              title="Toplam Borç"
              value={formatCurrency(kpi.payables, displayCurrency)}
              subtitle="Ödenmemiş alış faturası"
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
            />
            <KpiCard
              title="Bu Ay Kar"
              value={formatCurrency(
                hasInvoices ? kpi.thisMonthProfit : 0,
                displayCurrency
              )}
              subtitle={
                hasInvoices
                  ? `Gelir: ${formatCurrency(kpi.thisMonthRevenue, displayCurrency)}`
                  : "Fatura kaydı yok"
              }
              trend={
                hasInvoices && (kpi.lastMonthProfit !== 0 || kpi.thisMonthProfit !== 0)
                  ? `${Math.abs(kpi.profitTrend)}%`
                  : undefined
              }
              trendPositive={profitTrendPositive}
              icon={<Activity className="h-4 w-4 text-indigo-600" />}
              colorClass={
                hasInvoices && kpi.thisMonthProfit < 0 ? "text-red-700" : "text-indigo-700"
              }
              bgClass="bg-indigo-50"
            />
          </div>
        </section>
      )}

      {/* ── Operasyonel KPI ── */}
      <section className="space-y-3">
        <SectionTitle
          icon={<Package className="h-5 w-5 text-gray-600" />}
          title="Operasyonel Metrikler"
          description="Pozisyon & sefer durumu"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            title="Toplam Pozisyon"
            value={String(opMetrics.total)}
            subtitle={`Bu ay: ${opMetrics.thisMonthPositions} yeni`}
            icon={<Package className="h-4 w-4 text-gray-600" />}
            colorClass="text-gray-900"
            bgClass="bg-gray-50"
          />
          <KpiCard
            title="Aktif Pozisyon"
            value={String(opMetrics.active)}
            subtitle="Hazır + Yolda"
            icon={<Activity className="h-4 w-4 text-blue-600" />}
            colorClass="text-blue-700"
            bgClass="bg-blue-50"
          />
          <KpiCard
            title="Tamamlanma Oranı"
            value={`%${opMetrics.completionRate}`}
            subtitle={`${opMetrics.completed} / ${opMetrics.total} pozisyon`}
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            colorClass="text-green-700"
            bgClass="bg-green-50"
          />
          <KpiCard
            title="Yoldaki Araçlar"
            value={String(opMetrics.inTransit)}
            subtitle="IN_TRANSIT statüsünde"
            icon={<Truck className="h-4 w-4 text-orange-600" />}
            colorClass="text-orange-700"
            bgClass="bg-orange-50"
          />
          <KpiCard
            title="Bekleyen İşlemler"
            value={String(opMetrics.pending)}
            subtitle="Aksiyon gerektiren"
            icon={<AlertCircle className="h-4 w-4 text-red-600" />}
            colorClass="text-red-700"
            bgClass="bg-red-50"
          />
        </div>
      </section>

      {/* ── Pozisyon Tahmini Kar Tablosu (fatura yokken) ── */}
      {permissions?.canViewFinance && !hasInvoices && hasPositions && (
        <section className="space-y-3">
          <SectionTitle
            icon={<Calculator className="h-5 w-5 text-purple-600" />}
            title="Pozisyon Bazlı Tahmini Kar"
            description="estimated_profit alanından (fatura girilmeden hesaplanmış)"
            badge="Tahmini"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status bazlı kar dağılımı */}
            {(
              [
                { status: "COMPLETED", label: "Tamamlanan", color: "text-green-700", bg: "bg-green-50" },
                { status: "IN_TRANSIT", label: "Yolda", color: "text-blue-700", bg: "bg-blue-50" },
                { status: "READY_TO_DEPART", label: "Hazır", color: "text-orange-700", bg: "bg-orange-50" },
                { status: "DELIVERED", label: "Teslim Edildi", color: "text-purple-700", bg: "bg-purple-50" },
              ] as const
            ).map((s) => {
              const filtered = (positions ?? []).filter((p: any) => p.status === s.status);
              const sum = filtered.reduce((acc: number, p: any) => acc + Number(p.estimated_profit ?? 0), 0);
              return (
                <Card key={s.status}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{s.label}</CardTitle>
                    <div className={`rounded-lg p-2 ${s.bg}`}>
                      <Target className={`h-4 w-4 ${s.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl font-bold ${s.color}`}>
                      {sum !== 0
                        ? sum.toLocaleString("tr-TR", { minimumFractionDigits: 0 })
                        : "—"}
                    </div>
                    <p className="text-xs text-gray-500">{filtered.length} pozisyon • Karma döviz</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Para Birimi Bazlı Breakdown (sadece fatura varsa) ── */}
      {permissions?.canViewFinance && hasInvoices && currencyBreakdown.length > 0 && (
        <section className="space-y-3">
          <SectionTitle
            icon={<Globe className="h-5 w-5 text-indigo-600" />}
            title="Döviz Bazlı Finansal Tablo"
            description="Orijinal para birimlerinde (dönüşüm yapılmaz)"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {currencyBreakdown.map((cb: CurrencyBreakdown) => (
              <Card key={cb.currency} className="overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-br from-slate-50 to-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CURRENCY_FLAGS[cb.currency] ?? "🌍"}</span>
                      <CardTitle className="text-base font-bold">{cb.currency}</CardTitle>
                    </div>
                    <Badge variant={cb.profit >= 0 ? "success" : "danger"} className="text-xs">
                      %{Math.abs(cb.margin).toFixed(1)} {cb.profit >= 0 ? "kar" : "zarar"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Gelir</span>
                    <span className="text-sm font-semibold text-green-700">
                      {formatNative(cb.revenue, cb.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Gider</span>
                    <span className="text-sm font-semibold text-red-700">
                      {formatNative(cb.cost, cb.currency)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">Brüt Kar</span>
                    <span
                      className={`text-sm font-bold ${cb.profit >= 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      {cb.profit >= 0 ? "+" : ""}
                      {formatNative(cb.profit, cb.currency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cb.profit >= 0 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(Math.abs(cb.margin), 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Net Pozisyon Kartı */}
            <Card className="overflow-hidden border-2 border-blue-200">
              <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base font-bold text-blue-800">Net Pozisyon</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Alacak - Borç dengesi ({displayCurrency})
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Alacak</span>
                  <span className="text-sm font-semibold text-green-700">
                    {formatCurrency(kpi.receivables, displayCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Borç</span>
                  <span className="text-sm font-semibold text-red-700">
                    {formatCurrency(kpi.payables, displayCurrency)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700">Net</span>
                  <span
                    className={`text-sm font-bold ${kpi.netPosition >= 0 ? "text-green-700" : "text-red-700"}`}
                  >
                    {formatCurrency(kpi.netPosition, displayCurrency)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.netPosition >= 0 ? "bg-green-500" : "bg-red-500"}`}
                    style={{
                      width: `${
                        kpi.receivables + kpi.payables > 0
                          ? Math.min(
                              (kpi.receivables / (kpi.receivables + kpi.payables)) * 100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* ── Nakit Akışı + Son Aktiviteler ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nakit Akışı */}
        {permissions?.canViewFinance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Aylık Nakit Akışı
              </CardTitle>
              <CardDescription>
                Son 6 ay gelir / gider / kar ({displayCurrency})
                {!hasInvoices && " · Fatura eklenince görünür"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasInvoices ? (
                <div className="text-center py-8 space-y-2">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Fatura kaydı eklendikten sonra nakit akışı grafiği burada görünür.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cashFlow.map((data) => (
                    <div key={`${data.month}-${data.year}`} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 w-14 shrink-0">
                          {data.month.slice(0, 3)}
                        </span>
                        <div className="flex gap-3 text-right flex-wrap justify-end">
                          <span className="text-green-600">
                            +{formatCurrency(data.income, displayCurrency)}
                          </span>
                          <span className="text-red-600">
                            -{formatCurrency(data.expense, displayCurrency)}
                          </span>
                          <span
                            className={`font-bold ${data.profit >= 0 ? "text-blue-700" : "text-red-700"}`}
                          >
                            ={formatCurrency(data.profit, displayCurrency)}
                          </span>
                        </div>
                      </div>
                      <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Son Aktiviteler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600" />
              Son Aktiviteler
            </CardTitle>
            <CardDescription>En son güncellenen pozisyonlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Henüz aktivite yok.</p>
              ) : (
                recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="rounded-full bg-gray-100 p-2 mt-0.5 shrink-0">
                      <activity.icon className={`h-3.5 w-3.5 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{activity.action}</p>
                        <span className="text-xs font-mono text-gray-500 shrink-0">
                          {activity.position}
                        </span>
                      </div>
                      {activity.customer && (
                        <p className="text-xs text-gray-500 truncate">{activity.customer}</p>
                      )}
                      <p className="text-xs text-gray-400 truncate">{activity.route}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Dikkat Gereken İşlemler ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                Dikkat Gereken İşlemler
              </CardTitle>
              <CardDescription>{totalItems} adet işlem aksiyon bekliyor</CardDescription>
            </div>
            {totalItems > 0 && (
              <Link href="/positions">
                <Button variant="outline" size="sm">
                  Tümünü Gör
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                <p className="text-sm text-gray-500">Bekleyen işlem bulunmuyor.</p>
              </div>
            ) : (
              paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 transition-all hover:shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{item.positionNo}</span>
                      <Badge variant={item.priority === "high" ? "danger" : "warning"}>
                        {item.priority === "high" ? "Acil" : "Orta"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.customer}</p>
                    <p className="text-xs text-gray-400">{item.route}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-700">{item.issue}</p>
                    <Link
                      href={`/positions/${item.id}`}
                      className="mt-1 inline-block text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      İncele →
                    </Link>
                  </div>
                </div>
              ))
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins}dk önce`;
  if (diffHours < 24) return `${diffHours}sa önce`;
  return `${diffDays}g önce`;
}
