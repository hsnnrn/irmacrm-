"use client";

import { useState, useMemo } from "react";
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
import { Plus, Pencil, Trash2, Search, Loader2, Download, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerDialog } from "@/components/business/customer-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";
import { exportToExcel, formatDateForExport, formatCurrencyForExport } from "@/lib/export-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableFeatures } from "@/hooks/use-table-features";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SortableHeader } from "@/components/ui/sortable-header";
import type { Tables } from "@/lib/supabase";

type Customer = Tables<"customers">;

export default function CustomersPage() {
  const { data: customers, isLoading, error } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const filteredCustomers = useMemo<Customer[]>(() => {
    if (!customers) return [];
    return customers.filter(
      (customer: Customer) =>
        customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.contact_person?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (customer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const {
    data: paginatedCustomers,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    totalItems
  } = useTableFeatures(filteredCustomers, 10, { key: "company_name", direction: "asc" });

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    
    try {
      await deleteCustomer.mutateAsync(customerToDelete);
      toast({
        title: "Başarılı!",
        description: "Müşteri başarıyla silindi.",
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      toast({
        title: "Uyarı!",
        description: "Dışa aktarılacak veri bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      headers: [
        "Firma Adı",
        "Vergi No",
        "Yetkili Kişi",
        "E-posta",
        "Telefon",
        "Cari Döviz",
        "Risk Limiti",
        "Mevcut Bakiye",
        "Risk Durumu",
        "Oluşturma Tarihi",
      ],
      rows: filteredCustomers.map((customer) => [
        customer.company_name,
        customer.tax_id || "-",
        customer.contact_person || "-",
        customer.email || "-",
        customer.phone || "-",
        customer.account_currency || "TRY",
        formatCurrencyForExport(customer.risk_limit || 0, customer.account_currency || "TRY"),
        formatCurrencyForExport(customer.current_balance || 0, customer.account_currency || "TRY"),
        getRiskStatus(customer.current_balance || 0, customer.risk_limit || 1).text,
        formatDateForExport(customer.created_at),
      ]),
    };

    exportToExcel(exportData, `Musteriler_${new Date().toISOString().split("T")[0]}`);
    toast({
      title: "Başarılı!",
      description: "Müşteri listesi Excel formatında indirildi.",
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setSelectedCustomer(null);
  };

  const getRiskStatus = (balance: number, limit: number) => {
    const percentage = (balance / limit) * 100;
    if (percentage > 80) return { variant: "danger" as const, text: "Risk" };
    if (percentage > 50) return { variant: "warning" as const, text: "Dikkat" };
    return { variant: "success" as const, text: "Normal" };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
          <p className="text-gray-500">
            Müşteri bilgilerini yönetin ve takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={!filteredCustomers || filteredCustomers.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel'e Aktar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Müşteri listesini Excel formatında indir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={() => {
              setSelectedCustomer(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Müşteri</CardDescription>
            <CardTitle className="text-3xl">{customers?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Risk Limiti</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(
                (customers || []).reduce((sum, c) => sum + (c.risk_limit || 0), 0),
                "TRY"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mevcut Bakiye</CardDescription>
            <CardTitle className="text-3xl">
              {formatCurrency(
                (customers || []).reduce((sum, c) => sum + (c.current_balance || 0), 0),
                "TRY"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Müşteri Listesi</CardTitle>
              <CardDescription>
                Tüm müşterilerinizi görüntüleyin ve yönetin
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Müşteri ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-gray-500">
                      {filteredCustomers.length} sonuç
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filtrelenmiş müşteri sayısı</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    label="Firma Adı"
                    sortKey="company_name"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Yetkili Kişi"
                    sortKey="contact_person"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead className="text-center">Cari Döviz</TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Risk Limiti"
                    sortKey="risk_limit"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Bakiye"
                    sortKey="current_balance"
                    currentSort={sortConfig}
                    onSort={requestSort}
                    align="right"
                  />
                </TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCustomers.map((customer) => {
                const riskStatus = getRiskStatus(
                  customer.current_balance,
                  customer.risk_limit
                );
                return (
                  <TableRow key={customer.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium align-top">
                      <div className="space-y-1">
                        <p className="font-semibold whitespace-normal break-words leading-tight">
                          {customer.company_name}
                        </p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {customer.tax_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal break-words">{customer.contact_person}</TableCell>
                    <TableCell className="align-top">
                      <div className="text-sm space-y-1">
                        <p className="whitespace-normal break-all">{customer.email || "-"}</p>
                        <p className="text-gray-500 whitespace-nowrap">{customer.phone || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-top">
                      <Badge variant="outline">
                        {customer.account_currency || "TRY"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap align-top">
                      {formatCurrency(customer.risk_limit, customer.account_currency || "TRY")}
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap align-top">
                      {formatCurrency(customer.current_balance, customer.account_currency || "TRY")}
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant={riskStatus.variant}>
                        {riskStatus.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(customer)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Düzenle</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(customer.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sil</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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

      {/* Customer Dialog */}
      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz ve müşteriye ait tüm bilgiler kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

