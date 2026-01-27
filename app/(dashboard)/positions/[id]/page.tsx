"use client";

import { useState, useEffect } from "react";
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
  MoreVertical,
  Trash2,
  Printer,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X,
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
import { useDocuments, useDeleteDocument } from "@/hooks/use-documents";
import { usePositionInvoices } from "@/hooks/use-invoices";
import { useToast } from "@/hooks/use-toast";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { translateSupabaseError } from "@/lib/utils";
import { getExchangeRateSnapshot } from "@/lib/exchange-rates";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // Handle async params for Next.js 13+
  const [positionId, setPositionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const resolveParams = async () => {
      try {
        // Check if params is a Promise or already resolved
        let resolvedParams: { id: string };
        
        if (params && typeof (params as any).then === 'function') {
          // It's a Promise
          resolvedParams = await params;
        } else {
          // It's already resolved (production build sometimes does this)
          resolvedParams = params as unknown as { id: string };
        }
        
        if (!cancelled && resolvedParams?.id) {
          setPositionId(resolvedParams.id);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error resolving params:", error);
        }
      }
    };
    
    resolveParams();
    
    return () => {
      cancelled = true;
    };
  }, [params]);

  const { data: position, isLoading, error } = usePosition(positionId || "");
  const { data: documentsData, refetch: refetchDocuments } = useDocuments(positionId || "");
  const { data: invoicesData } = usePositionInvoices(positionId || "");
  const { data: exchangeRates } = useExchangeRates();
  const updatePosition = useUpdatePosition();
  const deleteDocument = useDeleteDocument();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [expandedDocTypes, setExpandedDocTypes] = useState<Set<DocumentType>>(
    new Set()
  );
  const [isEditingFinancials, setIsEditingFinancials] = useState(false);
  const [financialData, setFinancialData] = useState({
    sales_price: "",
    sales_currency: "USD",
    cost_price: "",
    cost_currency: "USD",
  });

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

  // Initialize financial data when entering edit mode
  const handleStartEditFinancials = () => {
    if (typedPosition) {
      setFinancialData({
        sales_price: typedPosition.sales_price?.toString() || "",
        sales_currency: typedPosition.sales_currency || "USD",
        cost_price: typedPosition.cost_price?.toString() || "",
        cost_currency: typedPosition.cost_currency || "USD",
      });
    }
    setIsEditingFinancials(true);
  };

  // Process documents data - support multiple documents per type
  const uploadedDocTypes = (documentsData || []).map((d: any) => d.type as DocumentType);
  // Group documents by type - each type can have multiple documents
  const documentsByType = new Map<DocumentType, any[]>();
  (documentsData || []).forEach((doc: any) => {
    const type = doc.type as DocumentType;
    if (!documentsByType.has(type)) {
      documentsByType.set(type, []);
    }
    documentsByType.get(type)!.push(doc);
  });
  
  const documents = allDocumentTypes.map((type) => {
    const docs = documentsByType.get(type) || [];
    return {
      type,
      uploaded: docs.length > 0,
      documents: docs, // Array of documents for this type
      primaryDocument: docs[0] || null, // First document as primary
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

  const handleViewDocument = (doc: any) => {
    const docType = doc.type as DocumentType;
    setSelectedDocType(docType);
    
    // Get all documents of this type
    const allDocsOfType = documentsByType.get(docType) || [];
    setSelectedDocuments(allDocsOfType);
    
    setViewDialogOpen(true);
  };

  const handleDeleteDocument = async (doc: any) => {
    if (!doc || !doc.file_path) return;

    const docType = doc.type as DocumentType;
    if (!confirm(`${DOCUMENT_LABELS[docType]} belgesini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteDocument.mutateAsync({
        id: doc.id,
        positionId: positionId || "",
        filePath: doc.file_path,
      });
      toast({
        title: "Başarılı!",
        description: "Belge başarıyla silindi.",
      });
      refetchDocuments();
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const handlePrintDocument = (doc: any) => {
    if (!doc) return;

    const printWindow = window.open(doc.file_url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleAddAdditionalDocument = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setUploadDialogOpen(true);
  };

  const toggleExpandedDocuments = (docType: DocumentType) => {
    setExpandedDocTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(docType)) {
        newSet.delete(docType);
      } else {
        newSet.add(docType);
      }
      return newSet;
    });
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
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const isDraft = typedPosition?.status === "DRAFT";

  // Get exchange rate for a currency
  const getExchangeRate = (currency: string): number => {
    if (currency === "TRY") return 1;
    if (!exchangeRates) return 0;
    
    // Assuming exchangeRates has structure like { USD: { selling: 34.50 }, ... }
    const rate = (exchangeRates as any)[currency]?.selling || 0;
    return rate;
  };

  const handleSaveFinancials = async () => {
    if (!positionId) return;

    try {
      const salesPrice = financialData.sales_price ? parseFloat(financialData.sales_price) : null;
      const costPrice = financialData.cost_price ? parseFloat(financialData.cost_price) : null;
      
      // Get exchange rates for sales and cost currencies
      const salesExchangeRate = financialData.sales_currency === "TRY" 
        ? 1 
        : getExchangeRate(financialData.sales_currency);
      const costExchangeRate = financialData.cost_currency === "TRY" 
        ? 1 
        : getExchangeRate(financialData.cost_currency);
      
      // Calculate estimated profit in TRY
      const salesInTry = salesPrice ? salesPrice * salesExchangeRate : 0;
      const costInTry = costPrice ? costPrice * costExchangeRate : 0;
      const estimatedProfit = salesInTry - costInTry;

      // Get exchange rates snapshot
      const exchangeRatesSnapshot = await getExchangeRateSnapshot();
      const fullSnapshot = {
        ...exchangeRatesSnapshot,
        sales_rate: salesExchangeRate,
        cost_rate: costExchangeRate,
        snapshot_date: new Date().toISOString(),
      };

      await updatePosition.mutateAsync({
        id: positionId,
        sales_price: salesPrice,
        sales_currency: financialData.sales_currency,
        sales_exchange_rate: salesExchangeRate,
        cost_price: costPrice,
        cost_currency: financialData.cost_currency,
        cost_exchange_rate: costExchangeRate,
        estimated_profit: estimatedProfit,
        exchange_rates_snapshot: fullSnapshot,
        updated_at: new Date().toISOString(),
      } as any);

      toast({
        title: "Başarılı!",
        description: "Finansal bilgiler güncellendi.",
      });

      setIsEditingFinancials(false);
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const handleCancelEditFinancials = () => {
    // Reset to original values
    if (typedPosition) {
      setFinancialData({
        sales_price: typedPosition.sales_price?.toString() || "",
        sales_currency: typedPosition.sales_currency || "USD",
        cost_price: typedPosition.cost_price?.toString() || "",
        cost_currency: typedPosition.cost_currency || "USD",
      });
    }
    setIsEditingFinancials(false);
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
              {formatCurrency(typedPosition.estimated_profit ?? 0, typedPosition.sales_currency)}
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
              <div className="space-y-4">
                {documents.map((docGroup) => (
                  <div key={docGroup.type} className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-4 bg-white">
                      <div className="flex items-center gap-3 flex-1">
                        {docGroup.uploaded ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{DOCUMENT_LABELS[docGroup.type]}</p>
                            {docGroup.documents.length > 1 && (
                              <Badge variant="outline" className="ml-2">
                                {docGroup.documents.length} adet
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {docGroup.uploaded
                              ? docGroup.primaryDocument?.created_at
                                ? `Yüklendi - ${formatDate(docGroup.primaryDocument.created_at)}`
                                : "Yüklendi"
                              : "Yüklenmedi"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {docGroup.uploaded ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDocument(docGroup.primaryDocument)}
                            >
                              <Eye className="mr-2 h-3 w-3" />
                              Görüntüle
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handlePrintDocument(docGroup.primaryDocument)}>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Yazdır
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleAddAdditionalDocument(docGroup.type)}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Ek Evrak Ekle
                                </DropdownMenuItem>
                                {docGroup.documents.length > 1 && (
                                  <DropdownMenuItem
                                    onClick={() => toggleExpandedDocuments(docGroup.type)}
                                  >
                                    {expandedDocTypes.has(docGroup.type) ? (
                                      <>
                                        <ChevronUp className="mr-2 h-4 w-4" />
                                        Ek Evrakları Gizle
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        Ek Evrakları Göster
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteDocument(docGroup.primaryDocument)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDocumentUpload(docGroup.type)}
                          >
                            <Upload className="mr-2 h-3 w-3" />
                            Yükle
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Ek Evraklar Listesi */}
                    {docGroup.uploaded && docGroup.documents.length > 1 && expandedDocTypes.has(docGroup.type) && (
                      <div className="ml-8 space-y-2">
                        {docGroup.documents.slice(1).map((doc: any, index: number) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-sm font-medium">
                                  {DOCUMENT_LABELS[docGroup.type]} #{index + 2}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.created_at ? formatDate(doc.created_at) : "Yüklendi"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDocument(doc)}
                              >
                                <Eye className="mr-2 h-3 w-3" />
                                Görüntüle
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handlePrintDocument(doc)}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Yazdır
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteDocument(doc)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Sil
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-4">
          {isDraft && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      Pozisyon taslak durumunda. Finansal bilgileri düzenleyebilirsiniz.
                    </p>
                  </div>
                  {!isEditingFinancials ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStartEditFinancials}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditFinancials}
                      >
                        <X className="mr-2 h-4 w-4" />
                        İptal
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveFinancials}
                        disabled={updatePosition.isPending}
                      >
                        {updatePosition.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Kaydet
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Satış (Navlun)</CardTitle>
              </CardHeader>
              <CardContent>
                {isDraft && isEditingFinancials ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sales_price">Satış Fiyatı</Label>
                      <Input
                        id="sales_price"
                        type="number"
                        step="0.01"
                        value={financialData.sales_price}
                        onChange={(e) =>
                          setFinancialData((prev) => ({
                            ...prev,
                            sales_price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sales_currency">Para Birimi</Label>
                      <Select
                        value={financialData.sales_currency}
                        onValueChange={(value) =>
                          setFinancialData((prev) => ({
                            ...prev,
                            sales_currency: value,
                          }))
                        }
                      >
                        <SelectTrigger id="sales_currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold">
                        {formatCurrency(typedPosition.sales_price ?? 0, typedPosition.sales_currency)}
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
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maliyet</CardTitle>
              </CardHeader>
              <CardContent>
                {isDraft && isEditingFinancials ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost_price">Maliyet Fiyatı</Label>
                      <Input
                        id="cost_price"
                        type="number"
                        step="0.01"
                        value={financialData.cost_price}
                        onChange={(e) =>
                          setFinancialData((prev) => ({
                            ...prev,
                            cost_price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost_currency">Para Birimi</Label>
                      <Select
                        value={financialData.cost_currency}
                        onValueChange={(value) =>
                          setFinancialData((prev) => ({
                            ...prev,
                            cost_currency: value,
                          }))
                        }
                      >
                        <SelectTrigger id="cost_currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-bold">
                        {formatCurrency(typedPosition.cost_price ?? 0, typedPosition.cost_currency)}
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
                )}
              </CardContent>
            </Card>

            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Net Kar</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const salesPrice = isDraft && isEditingFinancials
                    ? (financialData.sales_price ? parseFloat(financialData.sales_price) : 0)
                    : (typedPosition.sales_price ?? 0);
                  const costPrice = isDraft && isEditingFinancials
                    ? (financialData.cost_price ? parseFloat(financialData.cost_price) : 0)
                    : (typedPosition.cost_price ?? 0);
                  const salesCurrency = isDraft && isEditingFinancials
                    ? financialData.sales_currency
                    : typedPosition.sales_currency;
                  const estimatedProfit = salesPrice - costPrice;
                  const profitMargin = salesPrice !== 0 ? ((estimatedProfit / salesPrice) * 100) : 0;

                  return (
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-bold text-green-600">
                          {formatCurrency(estimatedProfit, salesCurrency)}
                        </p>
                        <p className="text-sm text-green-700">
                          {salesPrice !== 0
                            ? `%${profitMargin.toFixed(1)} kar marjı`
                            : "—"}
                        </p>
                      </div>
                      {salesCurrency !== "TRY" && (
                        <div className="text-right">
                          <p className="text-xs text-green-700">TRY Karşılığı</p>
                          <p className="text-sm font-bold text-green-700">
                            {formatCurrency(
                              salesPrice * getPositionExchangeRate(typedPosition, "sales") -
                                costPrice * getPositionExchangeRate(typedPosition, "cost"),
                              "TRY"
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
        positionId={positionId || ""}
        onSave={handleDocumentSave}
      />

      <DocumentViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        documentType={selectedDocType}
        documents={selectedDocuments}
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

