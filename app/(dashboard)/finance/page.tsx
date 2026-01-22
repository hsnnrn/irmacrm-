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
} from "@/lib/finance";
import { CurrencyCard } from "@/components/ui/currency-card";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { useTableFeatures } from "@/hooks/use-table-features";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SortableHeader } from "@/components/ui/sortable-header";

export default function FinancePage() {
  const { data: invoicesData, isLoading, error } = useInvoices();
  const { data: exchangeRates, isLoading: ratesLoading } = useExchangeRates();
  const [filterType, setFilterType] = useState<"ALL" | "SALES" | "PURCHASE">("ALL");
  const { currency: displayCurrency, setCurrency: setDisplayCurrency } = useCurrencyStore();
  
  // Process invoices data
  const invoices = (invoicesData || []).map((inv: any) => ({
    ...inv,
    position_no: inv.positions?.position_no || 0,
    customer_name: "Pozisyon", // Position based invoice
    overdue_days: inv.due_date && !inv.is_paid
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24)))
      : 0,
  }));
  
  // Convert amount to display currency
  const convertAmount = (amount: number, fromCurrency: string): number => {
    if (!exchangeRates) return amount;
    return convertCurrency(amount, fromCurrency, displayCurrency, exchangeRates);
  };

  // Merkezi finance modülü: alacak, borç, vadesi geçmiş, net kar
  const { receivables: totalReceivables, payables: totalPayables, overdueReceivables } = useMemo(
    () => computeReceivablesPayables(invoices, exchangeRates ?? undefined, displayCurrency),
    [invoices, displayCurrency, exchangeRates]
  );
  const totalProfit = useMemo(
    () => computeNetProfitPaid(invoices, displayCurrency, exchangeRates ?? undefined),
    [invoices, displayCurrency, exchangeRates]
  );

  // Nakit akışı: faturalardan gerçek veri (son 6 ay)
  const cashFlow = useMemo(
    () => computeCashFlowFromInvoices(invoices, exchangeRates ?? undefined, displayCurrency, 6, false),
    [invoices, displayCurrency, exchangeRates]
  );

  const filteredInvoices = useMemo(() => {
    return invoices.filter(
    (inv: any) => filterType === "ALL" || inv.invoice_type === filterType
  );
  }, [invoices, filterType]);

  const {
    data: paginatedInvoices,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    totalItems
  } = useTableFeatures(filteredInvoices, 10, { key: "invoice_date", direction: "desc" });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
          <p className="mt-2 text-gray-600">Faturalar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Hata: {(error as Error).message}</p>
          <p className="mt-2 text-gray-600">
            Supabase bağlantısını kontrol edin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finans</h1>
        <p className="text-gray-500">
          Alacak, borç ve karlılık takibi yapın
        </p>
        </div>
        
        {/* Currency Selector */}
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 text-gray-500 ${ratesLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm text-gray-600">Kur Seçimi:</span>
          <Select
            value={displayCurrency}
            onValueChange={(value: any) => setDisplayCurrency(value)}
          >
            <SelectTrigger className="w-[120px]">
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
            <span className="text-xs text-green-600">TCMB Canlı</span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <CurrencyCard
          title="Toplam Alacak"
          description="Toplam Alacak"
          amount={totalReceivables}
          originalCurrency={displayCurrency}
          icon={<TrendingUp className="h-4 w-4 text-green-600" />}
          className="border-green-200"
          titleClassName="text-green-600"
        />

        <CurrencyCard
          title="Toplam Borç"
          description="Toplam Borç"
          amount={totalPayables}
          originalCurrency={displayCurrency}
          icon={<TrendingDown className="h-4 w-4 text-red-600" />}
          className="border-red-200"
          titleClassName="text-red-600"
        />

        <CurrencyCard
          title="Vadesi Geçmiş"
          description="Vadesi Geçmiş"
          amount={overdueReceivables}
          originalCurrency={displayCurrency}
          icon={<Clock className="h-4 w-4 text-orange-600" />}
          className="border-orange-200"
          titleClassName="text-orange-600"
        />

        <CurrencyCard
          title="Net Kar (Ödenenler)"
          description="Net Kar (Ödenenler)"
          amount={totalProfit}
          originalCurrency={displayCurrency}
          icon={<DollarSign className="h-4 w-4 text-green-700" />}
          className="border-green-300 bg-green-50"
          titleClassName="text-green-700"
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fatura Listesi</CardTitle>
              <CardDescription>
                Tüm alış ve satış faturalarını görüntüleyin
              </CardDescription>
            </div>
            <Select
              value={filterType}
              onValueChange={(value: any) => setFilterType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                <SelectItem value="SALES">Satış Faturaları</SelectItem>
                <SelectItem value="PURCHASE">Alış Faturaları</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    label="Pozisyon"
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
                <TableHead>
                  <SortableHeader
                    label="Tip"
                    sortKey="invoice_type"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Tutar"
                    sortKey="amount"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
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
                    label="Vade Tarihi"
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    <p className="text-gray-500">Henüz fatura kaydı yok.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice: any) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono font-semibold whitespace-nowrap align-top">
                    #{invoice.position_no}
                  </TableCell>
                  <TableCell className="whitespace-normal break-words align-top leading-tight">
                    {invoice.customer_name}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant={
                        invoice.invoice_type === "SALES" ? "success" : "danger"
                      }
                      className="whitespace-nowrap"
                    >
                      {invoice.invoice_type === "SALES" ? "Satış" : "Alış"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold align-top whitespace-nowrap ${
                      invoice.invoice_type === "SALES"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <div>
                      <p>{formatCurrency(convertAmount(invoice.amount, invoice.currency), displayCurrency)}</p>
                      {invoice.currency !== displayCurrency && (
                        <p className="text-xs text-gray-500">
                    {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{formatDate(invoice.due_date)}</p>
                      {invoice.overdue_days > 0 && !invoice.is_paid && (
                        <p className="text-xs text-red-600">
                          {invoice.overdue_days} gün gecikmiş
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invoice.is_paid ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Ödendi</span>
                      </div>
                    ) : (
                      <Badge
                        variant={invoice.overdue_days > 0 ? "danger" : "warning"}
                      >
                        {invoice.overdue_days > 0 ? "Vadesi Geçti" : "Bekliyor"}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )))}
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

      {/* Cash Flow – Faturalardan gerçek veri */}
      <Card>
        <CardHeader>
          <CardTitle>Nakit Akışı Özeti</CardTitle>
          <CardDescription>Son 6 aylık gelir-gider dengesi (fatura tarihine göre, {displayCurrency})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cashFlow.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">Henüz fatura verisi yok.</p>
            ) : (
              cashFlow.map((data) => {
                const total = data.income + data.expense || 1;
                return (
                  <div key={`${data.month}-${data.year}`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month} {data.year}</span>
                      <div className="flex gap-4 flex-wrap">
                        <span className="text-green-600">
                          +{formatCurrency(data.income, displayCurrency)}
                        </span>
                        <span className="text-red-600">
                          -{formatCurrency(data.expense, displayCurrency)}
                        </span>
                        <span className="font-semibold">
                          = {formatCurrency(data.profit, displayCurrency)}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-4 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="bg-green-500"
                        style={{ width: `${(data.income / total) * 100}%` }}
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${(data.expense / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

