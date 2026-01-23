import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadDocument, deleteDocument as deleteDocumentFile } from "@/lib/storage";
import type { DocumentType } from "@/lib/position-utils";
import type { Inserts, Updates } from "@/lib/supabase";

type DocumentInsert = Inserts<"documents">;
type DocumentUpdate = Updates<"documents">;

interface Document {
  id: string;
  position_id: string;
  type: DocumentType;
  file_url: string;
  file_path: string | null;
  uploaded_by: string | null;
  is_verified: boolean;
  created_at: string;
}

interface UploadDocumentParams {
  positionId: string;
  type: DocumentType;
  file: File;
  uploadedBy?: string;
}

export function useDocuments(positionId: string) {
  return useQuery({
    queryKey: ["documents", positionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("position_id", positionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!positionId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
      type,
      file,
      uploadedBy,
    }: UploadDocumentParams) => {
      // Upload file to Supabase Storage
      const uploadResult = await uploadDocument(file, positionId, type);

      // Mevcut kullanıcı (varsa)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = uploadedBy ?? user?.id ?? null;

      // Save document metadata to database
      const documentData: DocumentInsert = {
        position_id: positionId,
        type,
        file_url: uploadResult.url,
        file_path: uploadResult.path,
        uploaded_by: userId,
        is_verified: false,
      };
      
      const { data, error } = await supabase
        .from("documents")
        .insert(documentData as DocumentInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.positionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["position", variables.positionId],
      });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      positionId,
    }: {
      id: string;
      positionId: string;
    }) => {
      const updateData: DocumentUpdate = { is_verified: true };
      const { data, error } = await supabase
        .from("documents")
        .update(updateData as DocumentUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.positionId],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      positionId,
      filePath,
    }: {
      id: string;
      positionId: string;
      filePath: string;
    }) => {
      // Delete file from storage
      await deleteDocumentFile(filePath);

      // Delete from database
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.positionId],
      });
    },
  });
}

