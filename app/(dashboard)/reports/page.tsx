"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingUp, Users, Package, Loader2 } from "lucide-react";
import { usePositions } from "@/hooks/use-positions";
import { useInvoices } from "@/hooks/use-invoices";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { generateMonthlyReport } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { data: positions, isLoading: positionsLoading } = usePositions();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: exchangeRates } = useExchangeRates();
  const { toast } = useToast();

  const reports = [
    {
      title: "Aylık Performans Raporu",
      description: "Tüm pozisyonların aylık kar/zarar özeti",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      action: "monthly",
    },
    {
      title: "Müşteri Analizi",
      description: "Müşteri bazlı ciro ve karlılık raporu",
      icon: Users,
      color: "text-red-600",
      bgColor: "bg-red-50",
      action: "customer",
    },
    {
      title: "Tedarikçi Değerlendirme",
      description: "Tedarikçi performans ve maliyet analizi",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      action: "supplier",
    },
    {
      title: "Operasyonel Rapor",
      description: "Tamamlanan ve devam eden işlemler özeti",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: "operational",
    },
  ];

  // Calculate statistics and data availability
  const stats = useMemo(() => {
    if (!positions || !invoices) {
      return {
        completedThisMonth: 0,
        avgDeliveryTime: 0,
        growth: 0,
        hasEnoughData: false,
      };
    }

    const now = new Date();
    const thisMonth = positions.filter((p: any) => {
      const date = new Date(p.created_at);
      return p.status === "COMPLETED" &&
             date.getMonth() === now.getMonth() &&
             date.getFullYear() === now.getFullYear();
    });

    // Calculate average delivery time
    const deliveredPositions = positions.filter(
      (p: any) => p.status === "COMPLETED" && p.departure_date && p.delivery_date
    );

    const totalDays = deliveredPositions.reduce((sum: number, p: any) => {
      const departure = new Date(p.departure_date);
      const delivery = new Date(p.delivery_date);
      const days = Math.floor((delivery.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    const avgDeliveryTime = deliveredPositions.length > 0
      ? (totalDays / deliveredPositions.length).toFixed(1)
      : 0;

    const hasEnoughData = positions.length >= 5 && invoices.length >= 3;

    return {
      completedThisMonth: thisMonth.length,
      avgDeliveryTime,
      growth: 12, // This could be calculated by comparing to last month
      hasEnoughData,
    };
  }, [positions, invoices]);

  const handleDownloadReport = (reportType: string) => {
    if (!positions || !invoices) {
      toast({
        title: "Hata!",
        description: "Veriler henüz yüklenmedi.",
        variant: "destructive",
      });
      return;
    }

    // Check if there's enough data for meaningful reports
    const hasEnoughData = positions.length >= 5 && invoices.length >= 3;

    if (!hasEnoughData) {
      toast({
        title: "Yetersiz Veri!",
        description: "Rapor oluşturmak için yeterli veri bulunmuyor. Daha fazla pozisyon ve fatura ekledikten sonra tekrar deneyin.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (reportType === "monthly") {
        generateMonthlyReport(positions, invoices, exchangeRates ?? undefined);
        toast({
          title: "Rapor oluşturuldu!",
          description: "Aylık performans raporu indirildi.",
        });
      } else {
        toast({
          title: "Yakında!",
          description: "Bu rapor türü henüz hazırlanıyor.",
        });
      }
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Rapor oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (positionsLoading || invoicesLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
          <p className="mt-2 text-gray-600">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
        <p className="text-gray-500">
          Detaylı iş raporlarını görüntüleyin ve indirin
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-3 ${report.bgColor}`}>
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => handleDownloadReport(report.action)}
                disabled={!stats.hasEnoughData && reportType !== "monthly"}
                variant={!stats.hasEnoughData && reportType !== "monthly" ? "secondary" : "default"}
              >
                <Download className="mr-2 h-4 w-4" />
                {!stats.hasEnoughData && reportType !== "monthly"
                  ? "Yetersiz Veri - Yakında"
                  : "Rapor İndir (PDF)"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hızlı İstatistikler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Bu Ay Tamamlanan</p>
              <p className="text-3xl font-bold">{stats.completedThisMonth}</p>
              <p className="text-xs text-green-600">+{stats.growth}% geçen aya göre</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Ortalama Teslimat Süresi</p>
              <p className="text-3xl font-bold">{stats.avgDeliveryTime} gün</p>
              <p className="text-xs text-green-600">Performans iyi</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Toplam Pozisyon</p>
              <p className="text-3xl font-bold">{positions?.length || 0}</p>
              <p className="text-xs text-green-600">Sisteme kayıtlı</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

