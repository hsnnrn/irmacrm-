"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, FileText, ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePositions } from "@/hooks/use-positions";
import { useDocuments, useDeleteDocument, useUpdateDocumentType } from "@/hooks/use-documents";
import { DOCUMENT_LABELS, type DocumentType } from "@/lib/position-utils";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadDialog } from "@/components/business/document-upload-dialog";

export default function DocumentSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: positions = [], isLoading: positionsLoading } = usePositions();

  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [selectedDocTypeForUpload, setSelectedDocTypeForUpload] = useState<DocumentType | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: documents = [], isLoading: documentsLoading } = useDocuments(selectedPositionId || "");
  const deleteDocument = useDeleteDocument();
  const updateDocumentType = useUpdateDocumentType();

  const handleDeleteDocument = async (doc: any) => {
    if (!doc || !doc.file_path) return;

    if (!confirm(`${DOCUMENT_LABELS[doc.type as DocumentType]} belgesini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await deleteDocument.mutateAsync({
        id: doc.id,
        positionId: selectedPositionId,
        filePath: doc.file_path,
      });
      toast({
        title: "Başarılı!",
        description: "Belge başarıyla silindi.",
      });
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Belge silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleChangeType = async (docId: string, newType: DocumentType) => {
    if (!selectedPositionId) return;

    try {
      await updateDocumentType.mutateAsync({
        id: docId,
        positionId: selectedPositionId,
        type: newType,
      });
      toast({
        title: "Güncellendi",
        description: "Belge türü güncellendi.",
      });
    } catch {
      toast({
        title: "Hata!",
        description: "Belge türü güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleOpenUpload = () => {
    if (!selectedPositionId || !selectedDocTypeForUpload) {
      toast({
        title: "Uyarı",
        description: "Lütfen pozisyon ve evrak türü seçin.",
      });
      return;
    }
    setUploadDialogOpen(true);
  };

  const handleUploadSaved = () => {
    setUploadDialogOpen(false);
    setSelectedDocTypeForUpload(null);
  };

  const allDocumentTypes: DocumentType[] = [
    "DRIVER_LICENSE",
    "VEHICLE_LICENSE",
    "INSURANCE",
    "TRANSPORT_CONTRACT",
    "CMR",
    "SALES_INVOICE",
    "PURCHASE_INVOICE",
  ];

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Evrak Düzenleme
            </h1>
            <p className="text-gray-500">
              Pozisyonlara bağlı belgeleri tür bazında yönetin. Evrak türü ekleme, silme ve değiştirme işlemlerini buradan yapabilirsiniz.
            </p>
          </div>
        </div>
        {selectedPosition && (
          <Link href={`/positions/${selectedPosition.id}`}>
            <Button variant="outline" size="sm">
              İlgili Pozisyona Git
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pozisyon Seçimi</CardTitle>
          <CardDescription>
            Evraklarını düzenlemek istediğiniz pozisyonu seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedPositionId}
            onValueChange={(value) => setSelectedPositionId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={positionsLoading ? "Yükleniyor..." : "Pozisyon seçin"} />
            </SelectTrigger>
            <SelectContent>
              {positions.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  Pozisyon #{position.position_no} -{" "}
                  {position.customers?.company_name || "Müşteri"} /{" "}
                  {position.suppliers?.company_name || "Tedarikçi"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPositionId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Belge Listesi</CardTitle>
              <CardDescription>
                Seçili pozisyona bağlı belgeleri görüntüleyin, türlerini değiştirin veya silin.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedDocTypeForUpload || ""}
                onValueChange={(value) => setSelectedDocTypeForUpload(value as DocumentType)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Evrak türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {allDocumentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {DOCUMENT_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleOpenUpload}>
                <Plus className="mr-2 h-4 w-4" />
                Evrak Yükle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <p className="text-gray-500 text-sm">Belgeler yükleniyor...</p>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <FileText className="h-10 w-10 mb-2 opacity-60" />
                <p>Bu pozisyona ait kayıtlı belge bulunmuyor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evrak Türü</TableHead>
                      <TableHead>Yüklenme Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="w-[260px] text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-500">
                              Teknik Kod: {doc.type}
                            </span>
                            <Select
                              value={doc.type}
                              onValueChange={(value) =>
                                handleChangeType(doc.id, value as DocumentType)
                              }
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {allDocumentTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {DOCUMENT_LABELS[type]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.created_at ? formatDate(doc.created_at) : "-"}
                        </TableCell>
                        <TableCell>
                          {doc.is_verified ? (
                            <Badge variant="success">Onaylı</Badge>
                          ) : (
                            <Badge variant="outline">Onaysız</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/positions/${selectedPositionId}`}
                              className="inline-flex"
                            >
                              <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Pozisyonda Gör
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        documentType={selectedDocTypeForUpload}
        positionId={selectedPositionId || ""}
        onSave={handleUploadSaved}
      />
    </div>
  );
}

