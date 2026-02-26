"use client";

import { useMemo } from "react";
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
import { useCustomerLedger } from "@/hooks/use-customer-ledger";
import { STATUS_LABELS } from "@/lib/position-utils";
import { printCustomerLedger } from "@/lib/print-utils";
import { convertCurrency } from "@/lib/exchange-rates";
import { useExchangeRates } from "@/hooks/use-exchange-rates";

export default function CustomerCariPage() {
  const params = useParams();
  const customerId = params?.id as string | undefined;
  const { data, isLoading, error } = useCustomerLedger(customerId ?? null);
  const { data: exchangeRates } = useExchangeRates();

  const currency = data?.customer?.account_currency || "TRY";

  const toCustomerCurrency = (amount: number, fromCurrency: string) => {
    if (fromCurrency === currency) return amount;
    if (!exchangeRates || (exchangeRates as any).error) return amount;
    try {
      return convertCurrency(amount, fromCurrency, currency, exchangeRates as any);
    } catch {
      return amount;
    }
  };

  const { positions, movements, summary } = useMemo(() => {
    const pos = data?.positions || [];
    const invs = data?.allInvoices || [];

    const salesInvoices = invs.filter((inv) => inv.invoice_type === "SALES");
    const totalReceivable = salesInvoices.reduce(
      (sum, inv) => sum + toCustomerCurrency(inv.amount, inv.currency),
      0
    );
    const paidSales = salesInvoices.filter((inv) => inv.is_paid);
    const totalReceived = paidSales.reduce(
      (sum, inv) => sum + toCustomerCurrency(inv.amount, inv.currency),
      0
    );
    const unpaidSales = salesInvoices.filter((inv) => !inv.is_paid);
    const balance = unpaidSales.reduce(
      (sum, inv) => sum + toCustomerCurrency(inv.amount, inv.currency),
      0
    );

    const moveList: {
      date: string;
      description: string;
      receivable: number;
      received: number;
      balance: number;
    }[] = [];

    let runReceivable = 0;
    let runReceived = 0;
    salesInvoices
      .sort(
        (a, b) =>
          new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime()
      )
      .forEach((inv) => {
        const amt = toCustomerCurrency(inv.amount, inv.currency);
        const position = pos.find((p) => p.id === inv.position_id);
        const desc = position
          ? `Poz #${position.position_no} - ${position.loading_point} → ${position.unloading_point} - Satış Faturası`
          : `Satış Faturası`;
        runReceivable += amt;
        if (inv.is_paid) {
          runReceived += amt;
        }
        moveList.push({
          date: formatDate(inv.invoice_date),
          description: desc,
          receivable: amt,
          received: inv.is_paid ? amt : 0,
          balance: runReceivable - runReceived,
        });
      });

    return {
      positions: pos,
      movements: moveList,
      summary: {
        totalReceivable,
        totalReceived,
        balance,
      },
    };
  }, [data, currency, exchangeRates]);

  const handlePrint = () => {
    printCustomerLedger({
      customerName: data?.customer?.company_name || "",
      taxId: data?.customer?.tax_id || undefined,
      contactPerson: data?.customer?.contact_person || undefined,
      currency,
      positions: positions.map((p) => ({
        positionNo: p.position_no,
        loadingPoint: p.loading_point,
        unloadingPoint: p.unloading_point,
        salesPrice: p.sales_price || 0,
        salesCurrency: p.sales_currency || "TRY",
        status: STATUS_LABELS[p.status as keyof typeof STATUS_LABELS] || p.status,
        departureDate: p.departure_date
          ? formatDate(p.departure_date)
          : undefined,
        deliveryDate: p.delivery_date ? formatDate(p.delivery_date) : undefined,
      })),
      movements,
      summary,
    });
  };

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
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Yazdır
        </Button>
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
              <p className="text-sm text-gray-500">Cari Döviz</p>
              <Badge variant="outline">{currency}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Alacak</CardDescription>
            <CardTitle className="text-xl">
              {formatCurrency(summary.totalReceivable, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Tahsilat</CardDescription>
            <CardTitle className="text-xl text-emerald-600">
              {formatCurrency(summary.totalReceived, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kalan Bakiye</CardDescription>
            <CardTitle
              className={`text-xl ${
                summary.balance > 0 ? "text-amber-600" : "text-gray-700"
              }`}
            >
              {formatCurrency(summary.balance, currency)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Sefer Listesi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sefer Listesi
          </CardTitle>
          <CardDescription>
            Bu müşteriye ait tüm seferler ve tutarlar
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        {STATUS_LABELS[pos.status as keyof typeof STATUS_LABELS] ||
                          pos.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {pos.departure_date
                        ? formatDate(pos.departure_date)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {pos.delivery_date ? formatDate(pos.delivery_date) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cari Hareketler */}
      <Card>
        <CardHeader>
          <CardTitle>Cari Hesap Hareketleri</CardTitle>
          <CardDescription>
            Alacak, tahsilat ve bakiye dökümü
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="text-right">Alacak</TableHead>
                <TableHead className="text-right">Tahsilat</TableHead>
                <TableHead className="text-right">Bakiye</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-8"
                  >
                    Henüz cari hareket bulunmuyor.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((m, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{m.date}</TableCell>
                    <TableCell className="max-w-xs truncate" title={m.description}>
                      {m.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.receivable > 0
                        ? formatCurrency(m.receivable, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.received > 0
                        ? formatCurrency(m.received, currency)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(m.balance, currency)}
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
