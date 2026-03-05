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
  Package,
  AlertCircle,
  DollarSign,
  Truck,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { usePositions } from "@/hooks/use-positions";
import { useInvoices } from "@/hooks/use-invoices";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { computeProfitFromInvoices, computeMonthlyProfitFromInvoices } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { CurrencyCard } from "@/components/ui/currency-card";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function DashboardPage() {
  const { permissions } = useUserProfile();
  const { data: positions, isLoading: positionsLoading } = usePositions();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: exchangeRates } = useExchangeRates();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!positions || !invoices) {
      return {
        activePositions: {
          value: 0,
          trend: "0%",
          trendColor: "text-gray-600"
        },
        thisMonthProfit: {
          value: 0,
          trend: "0%",
          trendColor: "text-gray-600"
        },
        inTransit: {
          value: 0,
          trend: "Yükleniyor",
          trendColor: "text-gray-600"
        },
        pendingActions: {
          value: 0,
          trend: "Yükleniyor",
          trendColor: "text-gray-600"
        },
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Helper to filter by month
    const filterByMonth = (dateStr: string, month: number, year: number) => {
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };

    // 1. Active Positions
    const activePositions = positions.filter(
      (p: any) => p.status === "IN_TRANSIT" || p.status === "READY_TO_DEPART"
    ).length;

    // Previous month active (approximate by created_at for trend)
    const currentMonthPositions = positions.filter((p: any) => filterByMonth(p.created_at, currentMonth, currentYear)).length;
    const lastMonthPositions = positions.filter((p: any) => filterByMonth(p.created_at, lastMonth, lastMonthYear)).length;
    const positionTrend = lastMonthPositions > 0 
      ? Math.round(((currentMonthPositions - lastMonthPositions) / lastMonthPositions) * 100) 
      : 0;

    // 2. In Transit
    const inTransit = positions.filter((p: any) => p.status === "IN_TRANSIT").length;
    // Transit trend (using updated_at as proxy for activity)
    const inTransitTrend = 0; // Hard to calculate historical state without history table

    // 3. Profit (merkezi finance modülü – TRY, invoice_date bazlı)
    const thisMonthProfit = computeProfitFromInvoices(
      invoices,
      "TRY",
      exchangeRates ?? undefined,
      (inv) => filterByMonth(inv.invoice_date, currentMonth, currentYear)
    );
    const lastMonthProfit = computeProfitFromInvoices(
      invoices,
      "TRY",
      exchangeRates ?? undefined,
      (inv) => filterByMonth(inv.invoice_date, lastMonth, lastMonthYear)
    );
    const profitTrend = lastMonthProfit !== 0 
      ? Math.round(((thisMonthProfit - lastMonthProfit) / Math.abs(lastMonthProfit)) * 100)
      : 0;

    // 4. Pending Actions
    const pendingActions = positions.filter(
      (p: any) => p.status === "DELIVERED" || p.status === "READY_TO_DEPART"
    ).length;
    const pendingTrend = 0; // Dynamic real-time count

    return {
      activePositions: {
        value: activePositions,
        trend: positionTrend > 0 ? `+${positionTrend}%` : `${positionTrend}%`,
        trendColor: positionTrend >= 0 ? "text-green-600" : "text-red-600"
      },
      thisMonthProfit: {
        value: thisMonthProfit,
        trend: profitTrend > 0 ? `+${profitTrend}%` : `${profitTrend}%`,
        trendColor: profitTrend >= 0 ? "text-green-600" : "text-red-600"
      },
      inTransit: {
        value: inTransit,
        trend: "Aktif",
        trendColor: "text-red-600"
      },
      pendingActions: {
        value: pendingActions,
        trend: "İşlem Bekliyor",
        trendColor: "text-orange-600"
      },
    };
  }, [positions, invoices, exchangeRates]);

  // Get action required items from real data
  const { paginatedItems, totalItems, totalPages } = useMemo(() => {
    if (!positions) return { paginatedItems: [], totalItems: 0, totalPages: 0 };
    
    const allItems = positions
      .filter((p: any) => 
        p.status === "DELIVERED" || p.status === "READY_TO_DEPART"
      );

    const total = allItems.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    
    // Reset to page 1 if current page is out of bounds
    // Note: We can't call setState in useMemo, handled in useEffect or render
    
    const items = allItems
      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
      .map((p: any) => ({
        id: p.id,
        positionNo: `#${p.position_no}`,
        customer: (p.customers as any)?.company_name || "Müşteri",
        issue: p.status === "DELIVERED" ? "Kapatma işlemi bekleniyor" : "Belgeler eksik",
        priority: p.status === "DELIVERED" ? "high" : "medium",
        route: `${p.loading_point} → ${p.unloading_point}`,
      }));

    return { paginatedItems: items, totalItems: total, totalPages: pages };
  }, [positions, currentPage]);

  // Get recent activities from positions
  const recentActivities = useMemo(() => {
    if (!positions) return [];

    return positions
      .sort((a: any, b: any) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 3)
      .map((p: any) => ({
        action: p.status === "COMPLETED" ? "Pozisyon tamamlandı" :
                p.status === "IN_TRANSIT" ? "Yola çıktı" :
                p.status === "DELIVERED" ? "Teslimat yapıldı" : "Pozisyon oluşturuldu",
        position: `#${p.position_no}`,
        time: getTimeAgo(p.updated_at),
        icon: p.status === "COMPLETED" ? CheckCircle :
              p.status === "IN_TRANSIT" ? Truck : Package,
      }));
  }, [positions]);

  // Aylık karlılık (merkezi finance – TRY)
  const monthlyProfitability = useMemo(() => {
    if (!invoices) return [];
    const rows = computeMonthlyProfitFromInvoices(invoices, exchangeRates ?? undefined, "TRY", 6);
    const maxProfit = Math.max(...rows.map((m) => m.value), 1);
    return rows.map((m) => ({
      month: m.month,
      value: m.value,
      percent: maxProfit > 0 ? (m.value / maxProfit) * 100 : 0,
    }));
  }, [invoices, exchangeRates]);

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

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Lojistik operasyonlarınıza genel bakış
        </p>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-4 md:grid-cols-2 ${permissions?.canViewFinance ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {/* Aktif Pozisyonlar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Pozisyonlar
            </CardTitle>
            <div className="rounded-lg p-2 bg-red-50">
              <Package className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePositions.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.activePositions.trendColor}>{stats.activePositions.trend}</span> geçen aya göre
            </p>
          </CardContent>
        </Card>

        {/* Bu Ay Kar - sadece finans yetkisi olanlar görür */}
        {permissions?.canViewFinance && (
          <CurrencyCard
            title="Bu Ay Kar"
            description="Bu Ay Kar"
            amount={stats.thisMonthProfit.value}
            originalCurrency="TRY"
            icon={<DollarSign className="h-4 w-4 text-green-600" />}
            className="border-green-200 bg-green-50"
            titleClassName="text-green-600"
          />
        )}

        {/* Yoldaki Araçlar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yoldaki Araçlar
            </CardTitle>
            <div className="rounded-lg p-2 bg-orange-50">
              <Truck className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.inTransit.trendColor}>{stats.inTransit.trend}</span>
            </p>
          </CardContent>
        </Card>

        {/* Bekleyen İşlemler */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bekleyen İşlemler
            </CardTitle>
            <div className="rounded-lg p-2 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingActions.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className={stats.pendingActions.trendColor}>{stats.pendingActions.trend}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Action Required */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 animate-blink" />
                  Dikkat Gereken İşlemler
                </CardTitle>
                <CardDescription>
                  {totalItems} adet işlem bekleniyor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedItems.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">
                  Bekleyen işlem bulunmuyor.
                </p>
              ) : (
                paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 transition-all hover:shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {item.positionNo}
                      </span>
                      <Badge
                        variant={
                          item.priority === "high" ? "danger" : "warning"
                        }
                      >
                        {item.priority === "high" ? "Acil" : "Orta"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.customer}</p>
                    <p className="text-xs text-gray-500">{item.route}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-700">
                      {item.issue}
                    </p>
                    <Link 
                      href={`/positions/${item.id}`}
                      className="mt-2 inline-block text-xs text-red-600 hover:text-red-800"
                    >
                      İncele →
                    </Link>
                  </div>
                </div>
                ))
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Sayfa {currentPage} / {totalPages}
                  </div>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
            <CardDescription>
              Son 24 saatte gerçekleşen işlemler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.position}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aylık Karlılık - sadece finans yetkisi olanlar görür */}
        {permissions?.canViewFinance && (
          <Card>
            <CardHeader>
              <CardTitle>Aylık Karlılık</CardTitle>
              <CardDescription>Son 6 aylık kar trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monthlyProfitability.map((data) => (
                  <div key={data.month} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-gray-600">
                        {formatCurrency(data.value, "TRY")}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                        style={{ width: `${data.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to get time ago
function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
}

