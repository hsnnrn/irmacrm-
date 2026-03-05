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
import { Plus, Pencil, Trash2, Search, AlertTriangle, Loader2, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SupplierDialog } from "@/components/business/supplier-dialog";
import { formatDate } from "@/lib/utils";
import { useSuppliers, useDeleteSupplier } from "@/hooks/use-suppliers";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";
import { exportToExcel, formatDateForExport } from "@/lib/export-utils";
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
import { useUserProfile } from "@/hooks/use-user-profile";

export default function SuppliersPage() {
  const { permissions } = useUserProfile();
  const { data: suppliers, isLoading, error } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter((supplier) =>
      supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  const {
    data: paginatedSuppliers,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    sortConfig,
    requestSort,
    totalItems
  } = useTableFeatures(filteredSuppliers, 10, { key: "company_name", direction: "asc" });

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    
    try {
      await deleteSupplier.mutateAsync(supplierToDelete);
      toast({
        title: "Başarılı!",
        description: "Tedarikçi başarıyla silindi.",
      });
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!filteredSuppliers || filteredSuppliers.length === 0) {
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
        "Vergi/TC No",
        "Vade Günü",
        "Kara Liste",
        "Oluşturma Tarihi",
      ],
      rows: filteredSuppliers.map((supplier: any) => [
        supplier.company_name,
        supplier.tax_id || "-",
        supplier.payment_term_days || 0,
        supplier.is_blacklisted ? "Evet" : "Hayır",
        formatDateForExport(supplier.created_at),
      ]),
    };

    exportToExcel(exportData, `Tedarikciler_${new Date().toISOString().split("T")[0]}`);
    toast({
      title: "Başarılı!",
      description: "Tedarikçi listesi Excel formatında indirildi.",
    });
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    setSelectedSupplier(null);
  };

  const activeSuppliers = (suppliers || []).filter((s) => !s.is_blacklisted).length;
  const blacklistedSuppliers = (suppliers || []).filter((s) => s.is_blacklisted).length;
  const avgPaymentTerm =
    (suppliers || []).length > 0
      ? (suppliers || []).reduce((sum, s) => sum + (s.payment_term_days || 0), 0) /
        (suppliers || []).length
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tedarikçiler</h1>
          <p className="text-gray-500">
            Nakliyeci ve tedarikçi bilgilerini yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={!filteredSuppliers || filteredSuppliers.length === 0}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel'e Aktar
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tedarikçi listesini Excel formatında indir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {permissions?.canWrite && (
            <Button
              onClick={() => {
                setSelectedSupplier(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Tedarikçi
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Tedarikçi</CardDescription>
            <CardTitle className="text-3xl">{suppliers?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktif Tedarikçi</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {activeSuppliers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kara Liste</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {blacklistedSuppliers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ort. Vade Günü</CardDescription>
            <CardTitle className="text-3xl">
              {Math.round(avgPaymentTerm)} gün
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tedarikçi Listesi</CardTitle>
              <CardDescription>
                Tüm tedarikçilerinizi görüntüleyin ve yönetin
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tedarikçi ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                    label="Vergi No"
                    sortKey="tax_id"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Vade Günü"
                    sortKey="payment_term_days"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Durum"
                    sortKey="is_blacklisted"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    label="Kayıt Tarihi"
                    sortKey="created_at"
                    currentSort={sortConfig}
                    onSort={requestSort}
                  />
                </TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className={
                    (supplier.is_blacklisted ? "bg-red-50 opacity-60 " : "hover:bg-slate-50/50 ") + 
                    "transition-colors"
                  }
                >
                  <TableCell className="font-medium align-top">
                    <div className="flex items-start gap-2">
                      {supplier.is_blacklisted && (
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <span className="whitespace-normal break-words leading-tight">
                      {supplier.company_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 align-top whitespace-nowrap">
                    {supplier.tax_id}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline" className="whitespace-nowrap">
                      {supplier.payment_term_days} gün
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    {supplier.is_blacklisted ? (
                      <Badge variant="danger">Kara Liste</Badge>
                    ) : (
                      <Badge variant="success">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(supplier.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {permissions?.canWrite && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(supplier)}
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
                                  onClick={() => handleDeleteClick(supplier.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Sil</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Info Card */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">
            Tedarikçi Referans Sistemi
          </CardTitle>
          <CardDescription className="text-red-700">
            Her pozisyon için otomatik olarak benzersiz bir referans numarası
            oluşturulur. Bu numara fatura ve ödeme süreçlerinde kullanılır.
            Referans numarası formatı: <strong>IRG-YIL-SIRA-KDVNO</strong>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Supplier Dialog */}
      <SupplierDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        supplier={selectedSupplier}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tedarikçiyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu tedarikçiyi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz ve tedarikçiye ait tüm bilgiler kalıcı olarak silinecektir.
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

