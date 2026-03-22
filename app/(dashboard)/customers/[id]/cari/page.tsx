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

// ─── Types ───────────────────────────────────────────────────────────────────

type Movement = {
  date: string;
  docNo: string;
  type: "BORC" | "ALACAK";
  description: string;
  borc: number;
  alacak: number;
  currency: string;
  status: string;
};

type CurrencySummary = {
  currency: string;
  totalBorc: number;
  totalAlacak: number;
  balance: number;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerCariPage() {
  const params = useParams();
  const customerId = params?.id as string | undefined;
  const ledger = useCustomerLedger(customerId ?? null);
  const data = ledger.data as CustomerLedgerData | undefined;
  const isLoading = ledger.isLoading;
  const error = ledger.error;

  const accountCurrency = data?.customer?.account_currency || "TRY";

  const DEPARTED_STATUSES = [
    "READY_TO_DEPART",
    "IN_TRANSIT",
    "DELIVERED",
    "COMPLETED",
  ] as const;

  const { positions, movements, currencySummaries } = useMemo(() => {
    const allPos = data?.positions || [];
    const pos = allPos.filter((p) =>
      DEPARTED_STATUSES.includes(p.status as (typeof DEPARTED_STATUSES)[number])
    );
    const posIds = new Set(pos.map((p) => p.id));
    const invs = (data?.allInvoices || []).filter((inv) =>
      posIds.has(inv.position_id)
    );
    const payments = data?.payments || [];
    const previousYearBalance = data?.customer?.previous_year_balance || 0;

    const salesInvoices = invs.filter((inv) => inv.invoice_type === "SALES");

    type RawItem = {
      date: Date;
      docNo: string;
      type: "BORC" | "ALACAK";
      description: string;
      amount: number;
      currency: string;
      status: string;
    };

    const items: RawItem[] = [];

    // Borç: Satış faturaları varsa onlar (kendi döviz cinsinde), yoksa pozisyon tutarları
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
        items.push({
          date: new Date(inv.invoice_date),
          docNo: posLabel || `F-${inv.id.slice(0, 8)}`,
          type: "BORC",
          description: position
            ? `${posLabel} - ${routeDesc} - Satış Faturası`
            : "Satış Faturası",
          amount: inv.amount,
          currency: inv.currency,
          status: statusLabel,
        });
      });
    } else {
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

    // Manuel cari hareketler — kendi döviz cinsinde
    payments.forEach((p) => {
      const movType: "BORC" | "ALACAK" = (p.movement_type as "BORC" | "ALACAK") || "ALACAK";
      const defaultDesc =
        movType === "ALACAK" ? "Müşteri Ödemesi" : "Manuel Borç Girişi";
      const docNo =
        p.invoice_no ||
        (movType === "ALACAK" ? `OD-${p.id.slice(0, 8)}` : `MB-${p.id.slice(0, 8)}`);
      items.push({
        date: new Date(p.payment_date),
        docNo,
        type: movType,
        description: p.description || defaultDesc,
        amount: p.amount,
        currency: p.currency,
        status: movType === "ALACAK" ? "Ödeme" : "Manuel Borç",
      });
    });

    // Tarihe göre sıralama (aynı günde BORÇ → ALACAK)
    const typeOrder: Record<"BORC" | "ALACAK", number> = { BORC: 0, ALACAK: 1 };
    items.sort((a, b) => {
      const diff = a.date.getTime() - b.date.getTime();
      return diff !== 0 ? diff : typeOrder[a.type] - typeOrder[b.type];
    });

    // ── Hareketler listesi ──────────────────────────────────────────────────
    const moveList: Movement[] = [];

    if (previousYearBalance !== 0) {
      moveList.push({
        date: "Önceki Yıl",
        docNo: "-",
        type: previousYearBalance >= 0 ? "BORC" : "ALACAK",
        description: "Devreden Bakiye",
        borc: previousYearBalance > 0 ? previousYearBalance : 0,
        alacak: previousYearBalance < 0 ? Math.abs(previousYearBalance) : 0,
        currency: accountCurrency,
        status: "-",
      });
    }

    items.forEach((item) => {
      moveList.push({
        date: formatDate(item.date),
        docNo: item.docNo,
        type: item.type,
        description: item.description,
        borc: item.type === "BORC" ? item.amount : 0,
        alacak: item.type === "ALACAK" ? item.amount : 0,
        currency: item.currency,
        status: item.status,
      });
    });

    // ── Döviz bazlı toplamlar ───────────────────────────────────────────────
    const buckets: Record<string, { borc: number; alacak: number }> = {};

    const add = (cur: string, borc: number, alacak: number) => {
      if (!buckets[cur]) buckets[cur] = { borc: 0, alacak: 0 };
      buckets[cur].borc += borc;
      buckets[cur].alacak += alacak;
    };

    // Devreden bakiye
    if (previousYearBalance !== 0) {
      add(
        accountCurrency,
        previousYearBalance > 0 ? previousYearBalance : 0,
        previousYearBalance < 0 ? Math.abs(previousYearBalance) : 0
      );
    }

    items.forEach((item) => {
      add(
        item.currency,
        item.type === "BORC" ? item.amount : 0,
        item.type === "ALACAK" ? item.amount : 0
      );
    });

    const CURRENCY_ORDER = ["USD", "EUR", "TRY", "RUB"];
    const summaries: CurrencySummary[] = Object.entries(buckets)
      .map(([currency, vals]) => ({
        currency,
        totalBorc: vals.borc,
        totalAlacak: vals.alacak,
        balance: vals.borc - vals.alacak,
      }))
      .sort(
        (a, b) =>
          (CURRENCY_ORDER.indexOf(a.currency) === -1
            ? 99
            : CURRENCY_ORDER.indexOf(a.currency)) -
          (CURRENCY_ORDER.indexOf(b.currency) === -1
            ? 99
            : CURRENCY_ORDER.indexOf(b.currency))
      );

    return { positions: pos, movements: moveList, currencySummaries: summaries };
  }, [data, accountCurrency]);

  // ── Export / Print ─────────────────────────────────────────────────────────

  const handlePrint = () => {
    printCustomerLedger({
      customerName: data?.customer?.company_name || "",
      taxId: data?.customer?.tax_id || undefined,
      contactPerson: data?.customer?.contact_person || undefined,
      movements: movements.map((m) => ({
        date: m.date,
        docNo: m.docNo,
        type: m.type,
        description: m.description,
        borc: m.borc,
        alacak: m.alacak,
        currency: m.currency,
        status: m.status,
      })),
      currencySummaries,
    });
  };

  const handleExportExcel = () => {
    if (!data?.customer) return;
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
        ],
        rows: movements.map((m) => [
          m.date,
          m.docNo,
          m.description,
          m.status,
          m.currency,
          m.borc || "",
          m.alacak || "",
        ]),
      },
      `Cari_Ekstresi_${customerName}`
    );
  };

  const [showTrips, setShowTrips] = useState(false);

  // ── Loading / Error ────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

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
              {data.customer.company_name} — Cari hesap dökümü
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

      {/* Müşteri Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Bilgileri</CardTitle>
          <CardDescription>Cari hesap detayları</CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* Döviz Bazlı Özet Kartlar */}
      {currencySummaries.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Döviz Bazlı Bakiye
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currencySummaries.map((s) => (
              <Card key={s.currency} className="relative overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    s.balance > 0
                      ? "bg-red-400"
                      : s.balance < 0
                      ? "bg-emerald-400"
                      : "bg-gray-300"
                  }`}
                />
                <CardHeader className="pb-2 pl-5">
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-bold">
                      {s.currency}
                    </Badge>
                    {s.balance > 0
                      ? "Borç Bakiyesi"
                      : s.balance < 0
                      ? "Alacak Fazlası"
                      : "Bakiye Sıfır"}
                  </CardDescription>
                  <CardTitle
                    className={`text-xl ${
                      s.balance > 0
                        ? "text-red-600"
                        : s.balance < 0
                        ? "text-emerald-600"
                        : "text-gray-700"
                    }`}
                  >
                    {formatCurrency(Math.abs(s.balance), s.currency)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pl-5 pt-0">
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>
                      Borç:{" "}
                      <span className="font-medium text-red-600">
                        {formatCurrency(s.totalBorc, s.currency)}
                      </span>
                    </span>
                    <span>
                      Alacak:{" "}
                      <span className="font-medium text-emerald-600">
                        {formatCurrency(s.totalAlacak, s.currency)}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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
                        {formatCurrency(pos.sales_price || 0, pos.sales_currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {STATUS_LABELS[pos.status as keyof typeof STATUS_LABELS] || pos.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pos.departure_date ? formatDate(pos.departure_date) : "-"}
                      </TableCell>
                      <TableCell>
                        {pos.delivery_date ? formatDate(pos.delivery_date) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sefer listesi performans için varsayılan olarak gizlidir. Görüntülemek için
              yukarıdaki butona tıklayın.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Cari Hareketler */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Hesap Hareketleri</CardTitle>
          <CardDescription>
            Her hareket kendi döviz cinsinde gösterilir — otomatik çevrim yapılmaz
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
                <TableHead className="text-center">Döviz</TableHead>
                <TableHead className="text-right">Borç</TableHead>
                <TableHead className="text-right">Alacak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    Henüz cari hareket bulunmuyor.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{m.date}</TableCell>
                    <TableCell className="font-mono text-sm">{m.docNo}</TableCell>
                    <TableCell className="max-w-xs truncate" title={m.description}>
                      {m.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="text-xs font-bold tracking-wide"
                      >
                        {m.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {m.borc > 0 ? formatCurrency(m.borc, m.currency) : "-"}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 font-medium">
                      {m.alacak > 0 ? formatCurrency(m.alacak, m.currency) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Döviz bazlı alt toplam */}
          {currencySummaries.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left pb-1.5 pl-1 font-semibold">Döviz</th>
                    <th className="text-right pb-1.5 font-semibold">Toplam Borç</th>
                    <th className="text-right pb-1.5 font-semibold">Toplam Alacak</th>
                    <th className="text-right pb-1.5 font-semibold">Net Bakiye</th>
                    <th className="text-right pb-1.5 pr-1 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {currencySummaries.map((s) => (
                    <tr key={s.currency} className="border-t border-gray-100">
                      <td className="py-1.5 pl-1">
                        <Badge variant="secondary" className="text-xs font-bold">
                          {s.currency}
                        </Badge>
                      </td>
                      <td className="py-1.5 text-right font-medium text-red-600 tabular-nums">
                        {formatCurrency(s.totalBorc, s.currency)}
                      </td>
                      <td className="py-1.5 text-right font-medium text-emerald-600 tabular-nums">
                        {formatCurrency(s.totalAlacak, s.currency)}
                      </td>
                      <td className={`py-1.5 text-right font-bold tabular-nums ${
                        s.balance > 0 ? "text-red-600" : s.balance < 0 ? "text-emerald-600" : "text-gray-500"
                      }`}>
                        {formatCurrency(Math.abs(s.balance), s.currency)}
                      </td>
                      <td className="py-1.5 text-right pr-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          s.balance > 0
                            ? "bg-red-50 text-red-600"
                            : s.balance < 0
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {s.balance > 0 ? "Borç Bakiyesi" : s.balance < 0 ? "Alacak Fazlası" : "Sıfır"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
