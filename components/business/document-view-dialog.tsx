"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { DOCUMENT_LABELS } from "@/lib/position-utils";
import type { DocumentType } from "@/lib/position-utils";
import { getSignedUrl } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

interface Document {
  id: string;
  file_url: string;
  file_path: string | null;
  created_at?: string;
}

interface DocumentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  documents: Document[]; // Array of documents to display
}

export function DocumentViewDialog({
  open,
  onOpenChange,
  documentType,
  documents,
}: DocumentViewDialogProps) {
  const [documentUrls, setDocumentUrls] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [activeTab, setActiveTab] = useState<string>("0");

  useEffect(() => {
    if (open && documents.length > 0) {
      setLoading(true);
      setErrors(new Map());
      setDocumentUrls(new Map());
      if (documents.length > 0) {
        setActiveTab("0");
      }

      const loadDocuments = async () => {
        const urlMap = new Map<string, string>();
        const errorMap = new Map<string, string>();

        for (const doc of documents) {
          try {
            // Eğer file_path varsa signed URL kullan (private bucket için)
            if (doc.file_path) {
              const signedUrl = await getSignedUrl(doc.file_path);
              if (signedUrl) {
                urlMap.set(doc.id, signedUrl);
                continue;
              }
            }

            // Public URL kullan
            if (doc.file_url) {
              urlMap.set(doc.id, doc.file_url);
            } else {
              errorMap.set(doc.id, "Belge URL'i bulunamadı.");
            }
          } catch (err) {
            errorMap.set(doc.id, "Belge yüklenirken bir hata oluştu.");
          }
        }

        setDocumentUrls(urlMap);
        setErrors(errorMap);
        setLoading(false);
      };

      loadDocuments();
    } else if (!open) {
      // Dialog kapandığında state'i temizle
      setDocumentUrls(new Map());
      setErrors(new Map());
      setLoading(true);
      setActiveTab("0");
    }
  }, [open, documents]);

  // Dosya formatını belirle
  const getFileExtension = (doc: Document) => {
    if (doc.file_path) {
      const match = doc.file_path.match(/\.([^.]+)$/);
      if (match) return match[1].toLowerCase();
    }
    if (doc.file_url) {
      const urlWithoutQuery = doc.file_url.split('?')[0];
      const match = urlWithoutQuery.match(/\.([^.]+)$/);
      if (match) return match[1].toLowerCase();
    }
    return null;
  };

  const isImage = (doc: Document) => {
    const ext = getFileExtension(doc);
    return ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {documentType && DOCUMENT_LABELS[documentType]}
            {documents.length > 1 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({documents.length} adet)
              </span>
            )}
          </DialogTitle>
          <DialogDescription>Belge görüntüleme</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : documents.length === 1 ? (
            // Single document view
            (() => {
              const doc = documents[0];
              const docUrl = documentUrls.get(doc.id);
              const docError = errors.get(doc.id);
              
              if (docError) {
                return (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-red-600">{docError}</p>
                  </div>
                );
              }
              
              if (!docUrl) {
                return (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-red-600">Belge yüklenemedi.</p>
                  </div>
                );
              }

              return (
                <div className="flex flex-col items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
                  {isImage(doc) ? (
                    <img
                      src={docUrl}
                      alt={documentType ? DOCUMENT_LABELS[documentType] : "Belge"}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const iframe = document.createElement('iframe');
                        iframe.src = docUrl;
                        iframe.className = 'w-full h-[70vh] border rounded-lg';
                        iframe.title = documentType ? DOCUMENT_LABELS[documentType] : 'Belge';
                        target.parentElement?.appendChild(iframe);
                      }}
                    />
                  ) : (
                    <iframe
                      src={docUrl}
                      className="w-full h-[70vh] border rounded-lg"
                      title={documentType ? DOCUMENT_LABELS[documentType] : "Belge"}
                    />
                  )}
                </div>
              );
            })()
          ) : (
            // Multiple documents - use tabs
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${documents.length}, minmax(0, 1fr))` }}>
                {documents.map((doc, index) => (
                  <TabsTrigger key={doc.id} value={index.toString()}>
                    {index === 0 ? "Ana Belge" : `Ek Evrak ${index}`}
                    {doc.created_at && (
                      <span className="ml-1 text-xs opacity-70">
                        ({formatDate(doc.created_at)})
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {documents.map((doc, index) => {
                const docUrl = documentUrls.get(doc.id);
                const docError = errors.get(doc.id);
                
                return (
                  <TabsContent key={doc.id} value={index.toString()} className="mt-4">
                    {docError ? (
                      <div className="flex items-center justify-center h-96">
                        <p className="text-red-600">{docError}</p>
                      </div>
                    ) : !docUrl ? (
                      <div className="flex items-center justify-center h-96">
                        <p className="text-red-600">Belge yüklenemedi.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center min-h-[400px] max-h-[70vh] overflow-auto">
                        {isImage(doc) ? (
                          <img
                            src={docUrl}
                            alt={`${documentType ? DOCUMENT_LABELS[documentType] : "Belge"} ${index + 1}`}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const iframe = document.createElement('iframe');
                              iframe.src = docUrl;
                              iframe.className = 'w-full h-[70vh] border rounded-lg';
                              iframe.title = `${documentType ? DOCUMENT_LABELS[documentType] : 'Belge'} ${index + 1}`;
                              target.parentElement?.appendChild(iframe);
                            }}
                          />
                        ) : (
                          <iframe
                            src={docUrl}
                            className="w-full h-[70vh] border rounded-lg"
                            title={`${documentType ? DOCUMENT_LABELS[documentType] : "Belge"} ${index + 1}`}
                          />
                        )}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
