import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DOCUMENT_LABELS, type DocumentType } from "@/lib/position-utils";

export interface DocumentTypeConfig {
  id: string;
  /**
   * Teknik kod / enum değeri.
   * Supabase tarafında document_types.tablosunda "type" kolonu ile eşleşir.
   */
  type: string;
  label: string;
  is_required_for_departure: boolean;
  is_required_for_close: boolean;
  is_active: boolean;
  created_at: string;
}

// Varsayılan (dahili) evrak türleri - DB olmasa da bunları her zaman göster
const BASE_DOCUMENT_TYPE_CODES = Object.keys(DOCUMENT_LABELS) as DocumentType[];

function buildBaseDocumentTypes(): DocumentTypeConfig[] {
  return BASE_DOCUMENT_TYPE_CODES.map((code) => {
    const isRequiredForDeparture = [
      "DRIVER_LICENSE",
      "VEHICLE_LICENSE",
      "INSURANCE",
      "TRANSPORT_CONTRACT",
    ].includes(code);

    const isRequiredForClose = [
      "CMR",
      "SALES_INVOICE",
      "PURCHASE_INVOICE",
    ].includes(code);

    return {
      id: `builtin-${code}`,
      type: code,
      label: DOCUMENT_LABELS[code],
      is_required_for_departure: isRequiredForDeparture,
      is_required_for_close: isRequiredForClose,
      is_active: true,
      created_at: "1970-01-01T00:00:00.000Z",
    };
  });
}

export function useDocumentTypes() {
  return useQuery<DocumentTypeConfig[]>({
    queryKey: ["document-types"],
    queryFn: async () => {
      let dbTypes: DocumentTypeConfig[] = [];

      try {
        const { data, error } = await (supabase as any)
          .from("document_types")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          // Tablo yoksa veya başka bir hata varsa logla ama UI'yi düşürme
          console.warn("document_types tablosu okunurken hata:", error);
        } else if (data) {
          dbTypes = data as DocumentTypeConfig[];
        }
      } catch (err) {
        console.warn("document_types sorgusu sırasında beklenmeyen hata:", err);
      }

      const baseTypes = buildBaseDocumentTypes();

      // DB'den gelen kayıtları dahili tiplerle birleştir:
      // - Dahili tipler her zaman listelensin
      // - Aynı type için DB kaydı varsa, DB kaydı öncelikli olsun
      const dbByCode = new Map<string, DocumentTypeConfig>();
      for (const t of dbTypes) {
        dbByCode.set(t.type, t);
      }

      const merged: DocumentTypeConfig[] = [];

      for (const base of baseTypes) {
        const fromDb = dbByCode.get(base.type);
        merged.push(fromDb || base);
      }

      // DB'de olup dahili listede olmayan (yeni eklenen) kodlar
      for (const t of dbTypes) {
        if (!BASE_DOCUMENT_TYPE_CODES.includes(t.type as DocumentType)) {
          merged.push(t);
        }
      }

      return merged;
    },
  });
}

interface CreateDocumentTypeInput {
  type: string;
  label: string;
  is_required_for_departure?: boolean;
  is_required_for_close?: boolean;
}

interface UpdateDocumentTypeInput {
  id: string;
  label?: string;
  is_required_for_departure?: boolean;
  is_required_for_close?: boolean;
  is_active?: boolean;
}

export function useCreateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDocumentTypeInput) => {
      const payload = {
        // Supabase tarafında document_types(type, ...) kolonlarına yazıyoruz
        type: input.type.trim().toUpperCase(),
        label: input.label.trim(),
        is_required_for_departure: !!input.is_required_for_departure,
        is_required_for_close: !!input.is_required_for_close,
      };

      const { data, error } = await (supabase as any)
        .from("document_types")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data as DocumentTypeConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });
}

export function useUpdateDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDocumentTypeInput) => {
      const { id, ...updates } = input;

      const { data, error } = await (supabase as any)
        .from("document_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as DocumentTypeConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });
}

export function useDeleteDocumentType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await (supabase as any)
        .from("document_types")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
    },
  });
}

