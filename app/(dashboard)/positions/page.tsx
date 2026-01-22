"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import {
  Plus,
  Search,
  Package,
  TrendingUp,
  AlertCircle,
  Eye,
  Loader2,
  FileSpreadsheet,
  Printer,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/position-utils";
import { cn } from "@/lib/utils";
import type { PositionStatus } from "@/lib/position-utils";
import { usePositions } from "@/hooks/use-positions";
import { useInvoices } from "@/hooks/use-invoices";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { computeProfitForPositions } from "@/lib/finance";
import { exportToExcel, formatDateForExport, formatCurrencyForExport } from "@/lib/export-utils";
import { printTable } from "@/lib/print-utils";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTableFeatures } from "@/hooks/use-table-features";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SortableHeader } from "@/components/ui/sortable-header";

export default function PositionsPage() {
  const { data: positions, isLoading, error } = usePositions();
  const { data: invoices } = useInvoices();
  const { data: exchangeRates } = useExchangeRates();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<PositionStatus | "ALL">(
    "ALL"
  );

  const filteredPositions = useMemo(() => {
    return (positions || []).filter((position: any) => {
    const customerName = (position.customers as any)?.company_name || "";
    const matchesSearch =
      position.position_no.toString().includes(searchTerm) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.loading_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.unloading_point.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "ALL" || position.status === filterStatus;

    return matchesSearch && matchesStatus;
  });
  }, [positions, searchTerm, filterStatus]);

  const {
    data: paginatedPositions,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    totalItems
  } = useTableFeatures(filteredPositions, 10, { key: "created_at", direction: "desc" });

  const handleExport = () => {
    if (!filteredPositions || filteredPositions.length === 0) {
      toast({
        title: "Uyarı!",
        description: "Dışa aktarılacak veri bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      headers: [
        "Pozisyon No",
        "Müşteri",
        "Tedarikçi",
        "Yükleme",
        "Boşaltma",
        "Satış",
        "Maliyet",
        "Kar",
        "Durum",
        "Oluşturma Tarihi",
      ],
      rows: filteredPositions.map((pos: any) => [
        pos.position_no,
        (pos.customers as any)?.company_name || "-",
        (pos.suppliers as any)?.company_name || "-",
        pos.loading_point,
        pos.unloading_point,
        formatCurrencyForExport(pos.sales_price || 0, pos.sales_currency || "TRY"),
        formatCurrencyForExport(pos.cost_price || 0, pos.cost_currency || "TRY"),
        formatCurrencyForExport(pos.estimated_profit || 0, pos.sales_currency || "TRY"),
        STATUS_LABELS[pos.status as PositionStatus] || pos.status,
        formatDateForExport(pos.created_at),
      ]),
    };

    exportToExcel(exportData, `Pozisyonlar_${new Date().toISOString().split("T")[0]}`);
    toast({
      title: "Başarılı!",
      description: "Pozisyon listesi Excel formatında indirildi.",
    });
  };

  const handlePrint = () => {
    if (!filteredPositions || filteredPositions.length === 0) {
      toast({
        title: "Uyarı!",
        description: "Yazdırılacak veri bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    printTable(
      "Pozisyon Listesi",
      [
        "Pozisyon No",
        "Müşteri",
        "Tedarikçi",
        "Yükleme → Boşaltma",
        "Satış",
        "Maliyet",
        "Kar",
        "Durum",
        "Oluşturma Tarihi",
      ],
      filteredPositions.map((pos: any) => [
        `#${pos.position_no}`,
        (pos.customers as any)?.company_name || "-",
        (pos.suppliers as any)?.company_name || "-",
        `${pos.loading_point} → ${pos.unloading_point}`,
        formatCurrencyForExport(pos.sales_price || 0, pos.sales_currency || "TRY"),
        formatCurrencyForExport(pos.cost_price || 0, pos.cost_currency || "TRY"),
        formatCurrencyForExport(pos.estimated_profit || 0, pos.sales_currency || "TRY"),
        STATUS_LABELS[pos.status as PositionStatus] || pos.status,
        formatDateForExport(pos.created_at),
      ])
    );
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...COMMON_SHORTCUTS.NEW_POSITION,
      action: () => {
        window.location.href = "/positions/create";
      },
    },
    {
      ...COMMON_SHORTCUTS.EXPORT,
      action: handleExport,
    },
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
          <p className="mt-2 text-gray-600">Pozisyonlar yükleniyor...</p>
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
            Supabase bağlantısını kontrol edin veya veri ekleyin
          </p>
        </div>
      </div>
    );
  }

  const totalPositions = positions?.length || 0;
  const activePositions = (positions || []).filter(
    (p: any) =>
      p.status === "IN_TRANSIT" ||
      p.status === "READY_TO_DEPART" ||
      p.status === "DELIVERED"
  ).length;
  // Toplam Kar: COMPLETED pozisyonların faturalarından (merkezi finance – TRY)
  const completedIds = new Set((positions || []).filter((p: any) => p.status === "COMPLETED").map((p: any) => p.id));
  const totalProfit = computeProfitForPositions(invoices || [], completedIds, "TRY", exchangeRates ?? undefined);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pozisyonlar</h1>
          <p className="text-gray-500">
            Operasyon kartlarını yönetin ve takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={!filteredPositions || filteredPositions.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excel'e Aktar (Ctrl+Shift+E)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  disabled={!filteredPositions || filteredPositions.length === 0}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Yazdır
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Yazdır (Ctrl+P)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Link href="/positions/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Pozisyon
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Toplam Pozisyon
            </CardDescription>
            <CardTitle className="text-3xl">{totalPositions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Aktif Operasyonlar
            </CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {activePositions}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Toplam Kar (Tamamlanan)
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {formatCurrency(totalProfit, "TRY")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card data-table-container>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Pozisyon Listesi</CardTitle>
                <CardDescription>
                  Tüm operasyon kartlarınızı görüntüleyin
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="w-full sm:w-[200px]">
                  <Select
                    value={filterStatus}
                    onValueChange={(value) =>
                      setFilterStatus(value as PositionStatus | "ALL")
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Durum Filtrele" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <span className="inline-flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full shrink-0", {
                              DRAFT: "bg-slate-500",
                              READY_TO_DEPART: "bg-amber-500",
                              IN_TRANSIT: "bg-red-500",
                              DELIVERED: "bg-emerald-500",
                              COMPLETED: "bg-indigo-500",
                              CANCELLED: "bg-rose-500",
                            }[key as PositionStatus] || "bg-gray-400")} />
                            <span className={cn("font-medium", {
                              DRAFT: "text-slate-700",
                              READY_TO_DEPART: "text-amber-700",
                              IN_TRANSIT: "text-red-700",
                              DELIVERED: "text-emerald-700",
                              COMPLETED: "text-indigo-700",
                              CANCELLED: "text-rose-700",
                            }[key as PositionStatus] || "text-gray-700")}>{label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Pozisyon ara..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Hızlı durum filtre etiketleri - tıklanabilir */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500 mr-1">Hızlı filtre:</span>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setFilterStatus("ALL")}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                        "hover:scale-105 active:scale-95",
                        filterStatus === "ALL"
                          ? "border-gray-400 bg-gray-100 text-gray-800 ring-2 ring-gray-400 ring-offset-1"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      Tümü
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Tüm pozisyonları göster</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {(Object.entries(STATUS_LABELS) as [PositionStatus, string][]).map(([key, label]) => (
                <TooltipProvider key={key} delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setFilterStatus(key);
                          toast({
                            title: "Filtre uygulandı",
                            description: `${label} durumuna göre filtrelendi.`,
                          });
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                          "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95",
                          STATUS_STYLES[key],
                          filterStatus === key && "ring-2 ring-offset-1 ring-red-500 shadow-md"
                        )}
                      >
                        {label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{label} — tıklayarak filtrele</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    label="Pozisyon No"
                    sortKey="position_no"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Müşteri"
                    sortKey="customers.company_name"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Rota"
                    sortKey="loading_point"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Yük"
                    sortKey="cargo_description"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Satış"
                    sortKey="sales_price"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Maliyet"
                    sortKey="cost_price"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Kar"
                    sortKey="estimated_profit"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Durum"
                    sortKey="status"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <p className="text-gray-500">Henüz pozisyon eklenmemiş.</p>
                    <Link href="/positions/create">
                      <Button className="mt-2" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        İlk Pozisyonu Oluştur
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPositions.map((position: any) => (
                <TableRow key={position.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono font-semibold whitespace-nowrap align-top">
                    #{position.position_no}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-medium whitespace-normal break-words leading-tight">
                        {(position.customers as any)?.company_name || "Müşteri"}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-normal break-words">
                        {(position.suppliers as any)?.company_name || "Tedarikçi"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm space-y-1">
                        <p className="font-medium whitespace-normal break-words leading-tight">
                          {position.loading_point}
                        </p>
                      <p className="text-gray-400 text-xs">↓</p>
                        <p className="font-medium whitespace-normal break-words leading-tight">
                          {position.unloading_point}
                        </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm whitespace-normal break-words align-top min-w-[120px]">
                    {position.cargo_description}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap align-top">
                    {formatCurrency(
                      position.sales_price,
                      position.sales_currency
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap align-top">
                    {formatCurrency(
                      position.cost_price,
                      position.cost_currency
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600 whitespace-nowrap align-top">
                    {formatCurrency(
                      position.estimated_profit || 0,
                      position.sales_currency
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setFilterStatus(position.status as PositionStatus);
                              // Scroll to top of table for better UX
                              document.querySelector('[data-table-container]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              toast({
                                title: "Filtre uygulandı",
                                description: `${STATUS_LABELS[position.status as PositionStatus]} durumuna göre filtrelendi.`,
                              });
                            }}
                            className="group relative"
                            aria-label={`${STATUS_LABELS[position.status as PositionStatus]} durumuna göre filtrele`}
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                STATUS_STYLES[position.status as PositionStatus],
                                "cursor-pointer",
                                "hover:scale-110 hover:shadow-lg hover:z-10",
                                "active:scale-95",
                                "transition-all duration-200 ease-in-out",
                                "group-hover:ring-2 group-hover:ring-offset-1",
                                filterStatus === position.status && "ring-2 ring-offset-2 ring-red-500 scale-105"
                              )}
                            >
                              <span className="relative z-0">
                                {STATUS_LABELS[position.status as PositionStatus]}
                              </span>
                            </Badge>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm font-medium">
                            {STATUS_LABELS[position.status as PositionStatus]} durumuna göre filtrelemek için tıklayın
                          </p>
                          {filterStatus === position.status && (
                            <p className="text-xs text-gray-400 mt-1">
                              ✓ Aktif filtre
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/positions/${position.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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
