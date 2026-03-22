"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Printer, Loader2, FileText, Package } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCustomerLedger, type CustomerLedgerData } from "@/hooks/use-customer-ledger";
import { STATUS_LABELS } from "@/lib/position-utils";
import { printCustomerLedger } from "@/lib/print-utils";
import { exportToExcel } from "@/lib/export-utils";

export default function CustomerCariPage() {
  const params = useParams();
  const customerId = params?.id as string | undefined;
  const ledger = useCustomerLedger(customerId ?? null);
  const data = ledger.data as CustomerLedgerData | undefined;
  const isLoading = ledger.isLoading;
  const error = ledger.error;

  // account_currency sadece bilgi amaçlı gösterilir; dönüşüm yapılmaz
  const accountCurrency = data?.customer?.account_currency || "TRY";

  const DEPARTED_STATUSES = [
    "READY_TO_DEPART",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
  ] as const;

  const { positions, movements, currencySummary } = useMemo(() => {
    const allPos = data?.positions || [];
    const pos = allPos.filter((p) =>
      DEPARTED_STATUSES.includes(p.status as any)
    );
    const posIds = new Set(pos.map((p) => p.id));
    const invs = (data?.allInvoices || []).filter((inv) =>
      posIds.has(inv.position_id)
    );
    const payments = data?.payments || [];
    const previousYearBalance = data?.customer?.previous_year_balance || 0;

    const salesInvoices = invs.filter((inv) => inv.invoice_type === "SALES");

    type RawMovement = {
      date: Date;
      docNo: string;
      type: "BORC" | "ALACAK";
      description: string;
      amount: number;
      currency: string;
      status: string;
    };

    const items: RawMovement[] = [];

    // Borç: Satış faturaları — kendi orijinal para biriminde
    if (salesInvoices.length > 0) {
      salesInvoices.forEach((inv) => {
        const position = pos.find((p) => p.id === inv.position_id);
        const posLabel = position ? `Poz #${position.position_no}` : "";
        const routeDesc = position
          ? `${position.loading_point} → ${position.unloading_point}`
          : "";
        const statusLabel =
          STATUS_LABELS[position?.status as keyof typeof STATUS_LABELS] ||
          position?.status ||
          "-";
        const desc = position
          ? `${posLabel} - ${routeDesc} - Satış Faturası`
          : "Satış Faturası";
        items.push({
          date: new Date(inv.invoice_date),
          docNo: posLabel || `F-${inv.id.slice(0, 8)}`,
          type: "BORC",
          description: desc,
          amount: inv.amount,
          currency: inv.currency || accountCurrency,
          status: statusLabel,
        });
      });
    } else {
      // Fatura girilmemişse pozisyon satış tutarları — kendi para biriminde
      pos.forEach((position) => {
        const price = position.sales_price || 0;
        if (price > 0) {
          const statusLabel =
            STATUS_LABELS[position.status as keyof typeof STATUS_LABELS] ||
            position.status ||
            "-";
          items.push({
            date: new Date(position.created_at),
            docNo: `Poz #${position.position_no}`,
            type: "BORC",
            description: `Poz #${position.position_no} - ${position.loading_point} → ${position.unloading_point} - Satış Tutarı`,
            amount: price,
            currency: (position.sales_currency as string) || accountCurrency,
            status: statusLabel,
          });
        }
      });
    }

    // Manuel cari hareketler — kendi orijinal para biriminde
    payments.forEach((p) => {
      const movType: "BORC" | "ALACAK" =
        (p.movement_type as "BORC" | "ALACAK") || "ALACAK";
      const defaultDesc =
        movType === "ALACAK" ? "Müşteri Ödemesi" : "Manuel Borç Girişi";
      const docNo =
        p.invoice_no ||
        (movType === "ALACAK"
          ? `OD-${p.id.slice(0, 8)}`
          : `MB-${p.id.slice(0, 8)}`);
      items.push({
        date: new Date(p.payment_date),
        docNo,
        type: movType,
        description: p.description || defaultDesc,
        amount: p.amount,
        currency: p.currency || accountCurrency,
        status: movType === "ALACAK" ? "Ödeme" : "Manuel Borç",
      });
    });

    // Tarihe göre sıralama (aynı günde BORÇ -> ALACAK)
    const typeOrder: Record<"BORC" | "ALACAK", number> = { BORC: 0, ALACAK: 1 };
    items.sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      if (diff !== 0) return diff;
      return typeOrder[a.type] - typeOrder[b.type];
    });

    // Per-currency running balances
    const runningByCurrency: Record<string, number> = {};

    // Devreden bakiye hesaba katılıyor (account_currency cinsinden)
    if (previousYearBalance !== 0) {
      runningByCurrency[accountCurrency] =
        (runningByCurrency[accountCurrency] || 0) + previousYearBalance;
    }

    const moveList: {
      date: string;
      docNo: string;
      type: "BORC" | "ALACAK";
      description: string;
      borc: number;
      alacak: number;
      balance: number;
      currency: string;
      status: string;
    }[] = [];

    if (previousYearBalance !== 0) {
      moveList.push({
        date: "Önceki Yıl",
        docNo: "-",
        type: previousYearBalance >= 0 ? "BORC" : "ALACAK",
        description: "Devreden Bakiye",
        borc: previousYearBalance > 0 ? previousYearBalance : 0,
        alacak: previousYearBalance < 0 ? Math.abs(previousYearBalance) : 0,
        balance: previousYearBalance,
        currency: accountCurrency,
        status: "-",
      });
    }

    items.forEach((item) => {
      const cur = item.currency;
      if (runningByCurrency[cur] === undefined) runningByCurrency[cur] = 0;
      if (item.type === "BORC") {
        runningByCurrency[cur] += item.amount;
      } else {
        runningByCurrency[cur] -= item.amount;
      }
      moveList.push({
        date: formatDate(item.date),
        docNo: item.docNo,
        type: item.type,
        description: item.description,
        borc: item.type === "BORC" ? item.amount : 0,
        alacak: item.type === "ALACAK" ? item.amount : 0,
        balance: runningByCurrency[cur],
        currency: cur,
        status: item.status,
      });
    });

    // Per-currency summary (devreden bakiye dahil)
    const summary: Record<
      string,
      { totalBorc: number; totalAlacak: number; balance: number }
    > = {};

    if (previousYearBalance !== 0) {
      summary[accountCurrency] = {
        totalBorc: previousYearBalance > 0 ? previousYearBalance : 0,
        totalAlacak: previousYearBalance < 0 ? Math.abs(previousYearBalance) : 0,
        balance: previousYearBalance,
      };
    }

    items.forEach((item) => {
      const cur = item.currency;
      if (!summary[cur])
        summary[cur] = { totalBorc: 0, totalAlacak: 0, balance: 0 };
      if (item.type === "BORC") {
        summary[cur].totalBorc += item.amount;
      } else {
        summary[cur].totalAlacak += item.amount;
      }
      summary[cur].balance =
        summary[cur].totalBorc - summary[cur].totalAlacak;
    });

    return {
      positions: pos,
      movements: moveList,
      currencySummary: summary,
    };
  }, [data, accountCurrency]);

  const handlePrint = () => {
    printCustomerLedger({
      customerName: data?.customer?.company_name || "",
      taxId: data?.customer?.tax_id || undefined,
      contactPerson: data?.customer?.contact_person || undefined,
      currency: accountCurrency,
      movements: movements.map((m) => ({
        date: m.date,
        docNo: m.docNo,
        type: m.type,
        description: m.description,
        borc: m.borc,
        alacak: m.alacak,
        balance: m.balance,
        status: m.status,
      })),
      summary: {
        totalReceivable: Object.values(currencySummary).reduce(
          (s, c) => s + c.totalBorc,
          0
        ),
        totalReceived: Object.values(currencySummary).reduce(
          (s, c) => s + c.totalAlacak,
          0
        ),
        balance: Object.values(currencySummary).reduce(
          (s, c) => s + c.balance,
          0
        ),
      },
    });
  };

  const handleExportExcel = () => {
    if (!data || !data.customer) return;
    const customerName = data.customer.company_name || "Cari_Hesap";
    exportToExcel(
      {
        headers: [
          "Tarih",
          "Belge No",
          "İşlem / Açıklama",
          "Sefer Durumu",
          "Döviz",
          "Borç",
          "Alacak",
          "Bakiye",
        ],
        rows: movements.map((m) => [
          m.date,
          m.docNo,
          m.description,
          m.status,
          m.currency,
          m.borc,
          m.alacak,
          m.balance,
        ]),
      },
      `Cari_Ekstresi_${customerName}`
    );
  };

  const [showTrips, setShowTrips] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !data?.customer) {
    return (
      <div className="space-y-6">
        <Link href="/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Müşterilere Dön
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Müşteri bulunamadı veya bir hata oluştu.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currencyEntries = Object.entries(currencySummary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Cari Hesap
            </h1>
            <p className="text-gray-500">
              {data.customer.company_name} - Cari hesap dökümü
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            Excel&apos;e Aktar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Yazdır / PDF
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
          <CardDescription>Cari hesap detayları</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Firma</p>
              <p className="font-semibold">{data.customer.company_name}</p>
            </div>
            {data.customer.tax_id && (
              <div>
                <p className="text-sm text-gray-500">Vergi No</p>
                <p>{data.customer.tax_id}</p>
              </div>
            )}
            {data.customer.contact_person && (
              <div>
                <p className="text-sm text-gray-500">Yetkili</p>
                <p>{data.customer.contact_person}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Varsayılan Döviz</p>
              <Badge variant="outline">{accountCurrency}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-currency Summary Cards */}
      {currencyEntries.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-400 text-sm">
            Henüz cari hareket bulunmuyor.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {currencyEntries.map(([cur, totals]) => (
            <div key={cur} className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    Toplam Borç
                    <Badge variant="secondary" className="text-xs">{cur}</Badge>
                  </CardDescription>
                  <CardTitle className="text-xl text-red-600">
                    {formatCurrency(totals.totalBorc, cur)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    Toplam Alacak (Tahsilat)
                    <Badge variant="secondary" className="text-xs">{cur}</Badge>
                  </CardDescription>
                  <CardTitle className="text-xl text-emerald-600">
                    {formatCurrency(totals.totalAlacak, cur)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    Kalan Bakiye
                    <Badge variant="secondary" className="text-xs">{cur}</Badge>
                  </CardDescription>
                  <CardTitle
                    className={`text-xl ${
                      totals.balance > 0
                        ? "text-amber-600"
                        : totals.balance < 0
                        ? "text-emerald-600"
                        : "text-gray-700"
                    }`}
                  >
                    {formatCurrency(totals.balance, cur)}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totals.balance > 0
                      ? "Müşteri borçlu"
                      : totals.balance < 0
                      ? "Müşteriden alacaklıyız"
                      : "Bakiye sıfır"}
                  </p>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Sefer Listesi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sefer Listesi
            </CardTitle>
            <CardDescription>
              Yola çıkmış seferler (Hareket Hazır, Yolda, Teslim Edildi, Kapandı)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrips((v) => !v)}
          >
            {showTrips ? "Sefer Listesini Gizle" : "Sefer Listesini Göster"}
          </Button>
        </CardHeader>
        <CardContent>
          {showTrips ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poz. No</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead className="text-right">Satış Tutarı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Yükleme</TableHead>
                  <TableHead>Teslimat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500 py-8"
                    >
                      Henüz sefer kaydı bulunmuyor.
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/positions/${pos.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          #{pos.position_no}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {pos.loading_point} → {pos.unloading_point}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          pos.sales_price || 0,
                          pos.sales_currency
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {STATUS_LABELS[
                            pos.status as keyof typeof STATUS_LABELS
                          ] || pos.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pos.departure_date
                          ? formatDate(pos.departure_date)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {pos.delivery_date
                          ? formatDate(pos.delivery_date)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sefer listesi performans için varsayılan olarak gizlidir.
              Görüntülemek için yukarıdaki butona tıklayın.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cari Hareketler */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Hesap Hareketleri</CardTitle>
          <CardDescription>
            Borç, alacak ve bakiye — her kalem kendi orijinal dövizinde gösterilir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Belge No</TableHead>
                <TableHead>İşlem / Açıklama</TableHead>
                <TableHead>Sefer Durumu</TableHead>
                <TableHead>Döviz</TableHead>
                <TableHead className="text-right">Borç</TableHead>
                <TableHead className="text-right">Alacak</TableHead>
                <TableHead className="text-right">Bakiye</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-gray-500 py-8"
                  >
                    Henüz cari hareket bulunmuyor.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{m.date}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {m.docNo}
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={m.description}
                    >
                      {m.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs"
                      >
                        {m.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {m.borc > 0
                        ? formatCurrency(m.borc, m.currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {m.alacak > 0
                        ? formatCurrency(m.alacak, m.currency)
                        : "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        m.balance > 0
                          ? "text-amber-600"
                          : m.balance < 0
                          ? "text-emerald-600"
                          : "text-gray-500"
                      }`}
                    >
                      {formatCurrency(m.balance, m.currency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
