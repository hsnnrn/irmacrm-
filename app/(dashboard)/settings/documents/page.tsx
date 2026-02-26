"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  useDocumentTypes,
  useCreateDocumentType,
  useUpdateDocumentType,
  useDeleteDocumentType,
  type DocumentTypeConfig,
} from "@/hooks/use-document-types";

export default function DocumentTypesSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: documentTypes, isLoading, error } = useDocumentTypes();
  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const [newCode, setNewCode] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newRequiredForDeparture, setNewRequiredForDeparture] = useState(true);
  const [newRequiredForClose, setNewRequiredForClose] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCode.trim() || !newLabel.trim()) {
      toast({
        title: "Uyarı",
        description: "Kod ve ad alanları zorunludur.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        type: newCode,
        label: newLabel,
        is_required_for_departure: newRequiredForDeparture,
        is_required_for_close: newRequiredForClose,
      });

      setNewCode("");
      setNewLabel("");
      setNewRequiredForDeparture(true);
      setNewRequiredForClose(false);

      toast({
        title: "Başarılı",
        description: "Yeni evrak türü eklendi.",
      });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Evrak türü eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (type: DocumentTypeConfig) => {
    try {
      await updateMutation.mutateAsync({
        id: type.id,
        is_active: !type.is_active,
      });

      toast({
        title: "Güncellendi",
        description: `Evrak türü ${!type.is_active ? "aktif" : "pasif"} yapıldı.`,
      });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Kayıt güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFlags = async (
    type: DocumentTypeConfig,
    field: "is_required_for_departure" | "is_required_for_close",
    value: boolean
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: type.id,
        [field]: value,
      });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Kayıt güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (docType: DocumentTypeConfig) => {
    setDeletingId(docType.id);
    try {
      // Bu türle bağlı evrak var mı kontrol et
      const { count, error } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("type", docType.type);

      if (error) throw error;

      if (count && count > 0) {
        toast({
          title: "Silinemedi",
          description:
            "Bu evrak türüne bağlı pozisyon evrakları var. Önce bu evrakları başka bir türe taşıyın veya türü pasif yapın.",
          variant: "destructive",
        });
        return;
      }

      await deleteMutation.mutateAsync({ id: docType.id });

      toast({
        title: "Silindi",
        description: "Evrak türü başarıyla silindi.",
      });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Evrak türü silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Evrak Türleri
          </h1>
          <p className="text-gray-500">
            Pozisyonlar için kullanılan evrak türlerini yönetin. Yeni tür
            ekleyebilir, zorunluluk durumlarını ayarlayabilir ve türleri
            pasif/aktif yapabilirsiniz.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/settings")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ayarlara Dön
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Yeni Evrak Türü</CardTitle>
            <CardDescription>
              Örnek: kod: A_DOCUMENT, ad: A Belgesi. Kod, sistem içinde
              kullanılacak benzersiz anahtardır.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAdd}>
              <div className="space-y-2">
                <Label htmlFor="code">Kod</Label>
                <Input
                  id="code"
                  placeholder="Örn: A_DOCUMENT"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Büyük harf ve alt çizgi kullanmanız önerilir. Örn:
                  DRIVER_LICENSE, A_DOCUMENT vb.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Ad</Label>
                <Input
                  id="label"
                  placeholder="Örn: A Belgesi"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-departure">
                    Çıkış için zorunlu
                  </Label>
                  <Checkbox
                    id="req-departure"
                    checked={newRequiredForDeparture}
                    onCheckedChange={(checked) =>
                      setNewRequiredForDeparture(checked === true)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-close">Kapanış için zorunlu</Label>
                  <Checkbox
                    id="req-close"
                    checked={newRequiredForClose}
                    onCheckedChange={(checked) =>
                      setNewRequiredForClose(checked === true)
                    }
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Evrak Türü Ekle
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mevcut Evrak Türleri</CardTitle>
            <CardDescription>
              Sistem genelinde kullanılan tüm evrak türlerini buradan
              yönetebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="text-gray-500">
                  Evrak türleri yükleniyor...
                </span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Evrak türleri yüklenirken bir hata oluştu. Lütfen daha
                  sonra tekrar deneyin.
                </span>
              </div>
            ) : !documentTypes || documentTypes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Henüz tanımlı evrak türü yok. Soldan yeni bir tür ekleyin.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kod</TableHead>
                      <TableHead>Ad</TableHead>
                      <TableHead>Çıkış</TableHead>
                      <TableHead>Kapanış</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">
                        İşlemler
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-mono text-xs">
                          {type.type}
                        </TableCell>
                        <TableCell>{type.label}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={type.is_required_for_departure}
                            onCheckedChange={(checked) =>
                              handleUpdateFlags(
                                type,
                                "is_required_for_departure",
                                checked === true
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={type.is_required_for_close}
                            onCheckedChange={(checked) =>
                              handleUpdateFlags(
                                type,
                                "is_required_for_close",
                                checked === true
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={type.is_active ? "outline" : "secondary"}
                            onClick={() => handleToggleActive(type)}
                          >
                            {type.is_active ? "Aktif" : "Pasif"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(type)}
                            disabled={deletingId === type.id}
                          >
                            {deletingId === type.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

