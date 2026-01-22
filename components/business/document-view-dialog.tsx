"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { DOCUMENT_LABELS } from "@/lib/position-utils";
import type { DocumentType } from "@/lib/position-utils";
import { getSignedUrl } from "@/lib/storage";

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  fileUrl: string | null;
  filePath: string | null;
}

export function DocumentViewDialog({
  open,
  onOpenChange,
  documentType,
  fileUrl,
  filePath,
}: DocumentViewDialogProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && (fileUrl || filePath)) {
      setLoading(true);
      setError(null);

      const loadDocument = async () => {
        try {
          // Eğer file_path varsa signed URL kullan (private bucket için)
          if (filePath) {
            const signedUrl = await getSignedUrl(filePath);
            if (signedUrl) {
              setDocumentUrl(signedUrl);
              setLoading(false);
              return;
            }
          }

          // Public URL kullan
          if (fileUrl) {
            setDocumentUrl(fileUrl);
            setLoading(false);
          } else {
            setError("Belge URL'i bulunamadı.");
            setLoading(false);
          }
        } catch (err) {
          setError("Belge yüklenirken bir hata oluştu.");
          setLoading(false);
        }
      };

      loadDocument();
    } else if (!open) {
      // Dialog kapandığında state'i temizle
      setDocumentUrl(null);
      setError(null);
      setLoading(true);
    }
  }, [open, fileUrl, filePath]);

  // Dosya formatını belirle - önce file_path'ten, sonra URL'den
  const getFileExtension = () => {
    if (filePath) {
      const match = filePath.match(/\.([^.]+)$/);
      if (match) return match[1].toLowerCase();
    }
    if (documentUrl) {
      // URL'den query parametrelerini temizle
      const urlWithoutQuery = documentUrl.split('?')[0];
      const match = urlWithoutQuery.match(/\.([^.]+)$/);
      if (match) return match[1].toLowerCase();
    }
    return null;
  };

  const fileExtension = getFileExtension();
  const isImage = fileExtension && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  
  // Debug için (geliştirme aşamasında)
  useEffect(() => {
    if (documentUrl && fileExtension) {
      console.log('Belge formatı:', fileExtension, 'URL:', documentUrl);
    }
  }, [documentUrl, fileExtension]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {documentType && DOCUMENT_LABELS[documentType]}
          </DialogTitle>
          <DialogDescription>Belge görüntüleme</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-red-600">{error}</p>
            </div>
          ) : documentUrl ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
              {isImage ? (
                <img
                  src={documentUrl}
                  alt={documentType ? DOCUMENT_LABELS[documentType] : "Belge"}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    // Resim yüklenemezse iframe ile dene
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const iframe = document.createElement('iframe');
                    iframe.src = documentUrl;
                    iframe.className = 'w-full h-[70vh] border rounded-lg';
                    iframe.title = documentType ? DOCUMENT_LABELS[documentType] : 'Belge';
                    target.parentElement?.appendChild(iframe);
                  }}
                />
              ) : (
                <iframe
                  src={documentUrl}
                  className="w-full h-[70vh] border rounded-lg"
                  title={documentType ? DOCUMENT_LABELS[documentType] : "Belge"}
                />
              )}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
