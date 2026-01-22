"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  Loader2,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  canDepart,
  canClose,
  getNextAllowedStatuses,
  DOCUMENT_LABELS,
  getPositionExchangeRate,
} from "@/lib/position-utils";
import type { PositionStatus, DocumentType } from "@/lib/position-utils";
import { DocumentUploadDialog } from "@/components/business/document-upload-dialog";
import { DocumentViewDialog } from "@/components/business/document-view-dialog";
import { StatusChangeDialog } from "@/components/business/status-change-dialog";
import { usePosition, useUpdatePosition, type PositionWithRelations } from "@/hooks/use-positions";
import { useDocuments } from "@/hooks/use-documents";
import { usePositionInvoices } from "@/hooks/use-invoices";
import { useToast } from "@/hooks/use-toast";

// All document types
const allDocumentTypes: DocumentType[] = [
  "DRIVER_LICENSE",
  "VEHICLE_LICENSE",
  "INSURANCE",
  "TRANSPORT_CONTRACT",
  "CMR",
  "SALES_INVOICE",
  "PURCHASE_INVOICE",
];

export default function PositionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: position, isLoading, error } = usePosition(params.id);
  const { data: documentsData, refetch: refetchDocuments } = useDocuments(params.id);
  const { data: invoicesData } = usePositionInvoices(params.id);
  const updatePosition = useUpdatePosition();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] = useState<{
    fileUrl: string;
    filePath: string | null;
  } | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
          <p className="mt-2 text-gray-600">Pozisyon yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !position) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Pozisyon bulunamadı</p>
          <Link href="/positions">
            <Button className="mt-4">Pozisyonlara Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Type assertion for position with relations
  const typedPosition = position as PositionWithRelations;

  // Process documents data
  const uploadedDocTypes = (documentsData || []).map((d: any) => d.type as DocumentType);
  const documentsMap = new Map(
    (documentsData || []).map((d: any) => [d.type, d])
  );
  const documents = allDocumentTypes.map((type) => {
    const docData = documentsMap.get(type);
    return {
      type,
      uploaded: uploadedDocTypes.includes(type),
      document: docData || null,
    };
  });

  // Process invoices data
  const invoices = {
    sales: (invoicesData || []).some((inv: any) => inv.invoice_type === "SALES"),
    purchase: (invoicesData || []).some((inv: any) => inv.invoice_type === "PURCHASE"),
  };

  // Check departure and closure conditions
  const departureCheck = canDepart(uploadedDocTypes);
  const closureCheck = canClose(uploadedDocTypes, invoices);

  const allowedStatuses = getNextAllowedStatuses(
    typedPosition.status as PositionStatus,
    departureCheck.canDepart,
    closureCheck.canClose
  );

  const handleDocumentUpload = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setUploadDialogOpen(true);
  };

  const handleDocumentSave = () => {
    setUploadDialogOpen(false);
    setSelectedDocType(null);
    // Belgeleri yeniden yükle
    refetchDocuments();
  };

  const handleViewDocument = (docType: DocumentType) => {
    const doc = documentsMap.get(docType);
    if (doc) {
      setSelectedDocType(docType);
      setSelectedDocument({
        fileUrl: doc.file_url,
        filePath: doc.file_path || null,
      });
      setViewDialogOpen(true);
    }
  };

  const handleStatusChange = async (newStatus: PositionStatus) => {
    try {
      await updatePosition.mutateAsync({
        id: typedPosition.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
      toast({
        title: "Durum güncellendi!",
        description: `Pozisyon durumu ${STATUS_LABELS[newStatus]} olarak değiştirildi.`,
      });
      setStatusDialogOpen(false);
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Durum güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const customerName = typedPosition.customers?.company_name || "Müşteri";
  const supplierName = typedPosition.suppliers?.company_name || "Tedarikçi";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/positions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Pozisyon #{typedPosition.position_no}
              </h1>
              <Badge
                variant={
                  STATUS_COLORS[typedPosition.status as PositionStatus] as
                    | "success"
                    | "warning"
                    | "danger"
                    | "default"
                }
              >
                {STATUS_LABELS[typedPosition.status as PositionStatus]}
              </Badge>
            </div>
            <p className="text-gray-500">
              {typedPosition.loading_point} → {typedPosition.unloading_point}
            </p>
          </div>
        </div>
        <Button onClick={() => setStatusDialogOpen(true)}>
          Durum Değiştir
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Müşteri</CardDescription>
            <CardTitle className="text-lg">{customerName}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tedarikçi</CardDescription>
            <CardTitle className="text-lg">{supplierName}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tahmini Kar</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">
              {formatCurrency(typedPosition.estimated_profit, typedPosition.sales_currency)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Referans No</CardDescription>
            <CardTitle className="font-mono text-sm">
              {typedPosition.supplier_ref_no}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Missing Actions Alert */}
      {((typedPosition.status === "READY_TO_DEPART" && !departureCheck.canDepart) ||
        (typedPosition.status === "DELIVERED" && !closureCheck.canClose)) && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 animate-blink" />
              Eksik İşlemler
            </CardTitle>
            <CardDescription className="text-red-600">
              Aşağıdaki işlemler tamamlanmadan pozisyon ilerleyemez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {typedPosition.status === "READY_TO_DEPART" &&
                !departureCheck.canDepart && (
                  <div className="rounded-lg bg-red-100 p-3">
                    <p className="font-semibold text-red-800">
                      Yola çıkmak için eksik belgeler:
                    </p>
                    <ul className="ml-4 mt-2 list-disc text-sm text-red-700">
                      {departureCheck.missingDocs.map((doc) => (
                        <li key={doc}>{DOCUMENT_LABELS[doc]}</li>
                      ))}
                    </ul>
                  </div>
                )}
              {typedPosition.status === "DELIVERED" && !closureCheck.canClose && (
                <div className="rounded-lg bg-red-100 p-3">
                  <p className="font-semibold text-red-800">
                    Kapatmak için eksik işlemler:
                  </p>
                  <ul className="ml-4 mt-2 list-disc text-sm text-red-700">
                    {closureCheck.missingItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="documents">Belgeler</TabsTrigger>
          <TabsTrigger value="financials">Finansal</TabsTrigger>
          <TabsTrigger value="events">Olaylar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rota Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Yükleme Noktası</p>
                  <p className="font-semibold">{typedPosition.loading_point}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Boşaltma Noktası</p>
                  <p className="font-semibold">{typedPosition.unloading_point}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Yük Açıklaması</p>
                  <p className="font-semibold">{typedPosition.cargo_description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarihler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Oluşturulma</p>
                  <p className="font-semibold">
                    {formatDate(typedPosition.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kalkış Tarihi</p>
                  <p className="font-semibold">
                    {typedPosition.departure_date
                      ? formatDate(typedPosition.departure_date)
                      : "Henüz yola çıkmadı"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teslimat Tarihi</p>
                  <p className="font-semibold">
                    {typedPosition.delivery_date
                      ? formatDate(typedPosition.delivery_date)
                      : "Henüz teslim edilmedi"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Belge Yönetimi</CardTitle>
              <CardDescription>
                Pozisyon için gerekli belgeleri yükleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {documents.map((doc) => (
                  <div
                    key={doc.type}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      doc.uploaded
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {doc.uploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium">{DOCUMENT_LABELS[doc.type]}</p>
                        <p className="text-xs text-gray-500">
                          {doc.uploaded
                            ? doc.document?.created_at
                              ? `Yüklendi - ${formatDate(doc.document.created_at)}`
                              : "Yüklendi"
                            : "Yüklenmedi"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.uploaded ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocument(doc.type)}
                        >
                          <Eye className="mr-2 h-3 w-3" />
                          Görüntüle
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDocumentUpload(doc.type)}
                        >
                          <Upload className="mr-2 h-3 w-3" />
                          Yükle
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Satış (Navlun)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold">
                      {formatCurrency(typedPosition.sales_price, typedPosition.sales_currency)}
                    </p>
                    <p className="text-sm text-gray-500">Müşteriden</p>
                  </div>
                  {typedPosition.sales_currency !== "TRY" && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Kur: {getPositionExchangeRate(typedPosition, "sales").toFixed(4)}</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatCurrency(
                          (typedPosition.sales_price || 0) * getPositionExchangeRate(typedPosition, "sales"),
                          "TRY"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maliyet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold">
                      {formatCurrency(typedPosition.cost_price, typedPosition.cost_currency)}
                    </p>
                    <p className="text-sm text-gray-500">Tedarikçiye</p>
                  </div>
                  {typedPosition.cost_currency !== "TRY" && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Kur: {getPositionExchangeRate(typedPosition, "cost").toFixed(4)}</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatCurrency(
                          (typedPosition.cost_price || 0) * getPositionExchangeRate(typedPosition, "cost"),
                          "TRY"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Net Kar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(
                        typedPosition.estimated_profit ?? 0,
                        typedPosition.sales_currency
                      )}
                    </p>
                    <p className="text-sm text-green-700">
                      {(typedPosition.sales_price && Number(typedPosition.sales_price) !== 0)
                        ? `%${(((typedPosition.estimated_profit ?? 0) / Number(typedPosition.sales_price)) * 100).toFixed(1)} kar marjı`
                        : "—"}
                    </p>
                  </div>
                  {typedPosition.sales_currency !== "TRY" && (
                    <div className="text-right">
                      <p className="text-xs text-green-700">TRY Karşılığı</p>
                      <p className="text-sm font-bold text-green-700">
                        {formatCurrency(
                          (typedPosition.sales_price || 0) * getPositionExchangeRate(typedPosition, "sales") -
                            (typedPosition.cost_price || 0) * getPositionExchangeRate(typedPosition, "cost"),
                          "TRY"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    Tedarikçi Referans Numarası
                  </p>
                  <p className="font-mono text-lg font-bold text-red-700">
                    {typedPosition.supplier_ref_no}
                  </p>
                  <p className="mt-2 text-sm text-red-600">
                    Bu referans numarasını tedarikçiye iletirken kullanın.
                    Ödeme ve fatura süreçlerinde bu numara geçerlidir.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zaman Çizelgesi</CardTitle>
              <CardDescription>
                Pozisyon üzerinde gerçekleşen tüm olaylar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <Package className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Pozisyon Oluşturuldu</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(typedPosition.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        documentType={selectedDocType}
        positionId={params.id}
        onSave={handleDocumentSave}
      />

      <DocumentViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        documentType={selectedDocType}
        fileUrl={selectedDocument?.fileUrl || null}
        filePath={selectedDocument?.filePath || null}
      />

      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={typedPosition.status as PositionStatus}
        allowedStatuses={allowedStatuses}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

