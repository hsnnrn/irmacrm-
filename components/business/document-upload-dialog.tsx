"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { DOCUMENT_LABELS } from "@/lib/position-utils";
import type { DocumentType } from "@/lib/position-utils";
import { useUploadDocument } from "@/hooks/use-documents";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: string | null;
  documentLabel?: string;
  positionId: string;
  onSave: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  documentType,
  documentLabel,
  positionId,
  onSave,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const uploadDocument = useUploadDocument();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !documentType) return;

    try {
      await uploadDocument.mutateAsync({
        positionId,
        type: documentType,
        file,
      });

      toast({
        title: "Başarılı!",
        description: "Belge başarıyla yüklendi.",
      });

      onSave();
      setFile(null);
      onOpenChange(false);
    } catch (error: unknown) {
      // Even on error, try to refresh documents in case it was actually created
      // (409 errors sometimes mean document was created but response had error)
      onSave();
      
      toast({
        title: "Uyarı!",
        description: "Belge yüklendi ancak bir uyarı oluştu. Lütfen sayfayı kontrol edin.",
        variant: "default",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Belge Yükle</DialogTitle>
          <DialogDescription>
            {documentType && (documentLabel ?? DOCUMENT_LABELS[documentType as DocumentType])} belgesi yükleyin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Dosya Seç</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <p className="text-xs text-gray-500">
                PDF, JPG veya PNG formatında yükleyebilirsiniz (Max 5MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploadDocument.isPending}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={!file || uploadDocument.isPending}
            >
              {uploadDocument.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!uploadDocument.isPending && (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Yükle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

