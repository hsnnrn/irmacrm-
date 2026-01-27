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
      // Mevcut kullanıcı (varsa)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = uploadedBy ?? user?.id ?? null;

      // Upload file to Supabase Storage first
      const uploadResult = await uploadDocument(file, positionId, type);
      
      if (!uploadResult) {
        throw new Error("Belge yüklenirken bir hata oluştu");
      }

      // Get existing document to delete old file if exists
      const { data: existingDoc } = await supabase
        .from("documents")
        .select("id, file_path")
        .eq("position_id", positionId)
        .eq("type", type)
        .maybeSingle();

      const existingDocTyped = existingDoc as { id: string; file_path: string | null } | null;

      // Delete old file from storage if exists
      if (existingDocTyped?.file_path) {
        try {
          await deleteDocumentFile(existingDocTyped.file_path);
        } catch (error) {
          console.warn("Failed to delete old document file:", error);
          // Continue anyway
        }
      }

      // Delete existing document from database FIRST (await to ensure it completes)
      if (existingDocTyped?.id) {
        const { error: deleteError } = await supabase
          .from("documents")
          .delete()
          .eq("id", existingDocTyped.id);
        
        if (deleteError) {
          console.warn("Failed to delete existing document:", deleteError);
          // Continue anyway - we'll try insert/update
        }
      }

      // Prepare document data
      const documentData: DocumentInsert = {
        position_id: positionId,
        type,
        file_url: uploadResult.url,
        file_path: uploadResult.path,
        uploaded_by: userId,
        is_verified: false,
      };

      // Now insert the new document (should not conflict since we deleted it)
      const { data, error } = await supabase
        .from("documents")
        // @ts-ignore - Supabase type inference issue with Database types
        .insert([documentData])
        .select()
        .single();

      // If we have data, return it (success)
      if (data) return data;

      // If getting 409 or any error, check if document was actually created
      // This handles the case where Supabase returns 409 but document was created
      if (error) {
        console.log('Insert returned error, checking if document was actually created...', error);
        
        // Wait a bit for database to sync (in case of eventual consistency)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch the document that might have been created
        const { data: existingDocAfterInsert, error: fetchError } = await supabase
          .from("documents")
          .select("*")
          .eq("position_id", positionId)
          .eq("type", type)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingDocAfterInsert && !fetchError) {
          // Document was created! Return it even though we got error
          console.log('✅ Document was created despite error, returning it:', existingDocAfterInsert);
          return existingDocAfterInsert as Document;
        }

        // If document doesn't exist and we have a conflict error, try to update
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('409') || error.code === 'PGRST116') {
          console.log('Document not found after insert error, trying update approach...');
          const { data: conflictDoc } = await supabase
            .from("documents")
            .select("id")
            .eq("position_id", positionId)
            .eq("type", type)
            .maybeSingle();

          const conflictDocTyped = conflictDoc as { id: string } | null;
          if (conflictDocTyped?.id) {
            // Update it
            const updateResult = await supabase
              .from("documents")
              // @ts-expect-error - Supabase type inference issue
              .update({
                file_url: uploadResult.url,
                file_path: uploadResult.path,
                uploaded_by: userId,
                is_verified: false,
              })
              .eq("id", conflictDocTyped.id)
              .select()
              .single();
            
            if (updateResult.error) {
              console.error('Update also failed:', updateResult.error);
              throw updateResult.error;
            }
            console.log('✅ Document updated successfully:', updateResult.data);
            return updateResult.data;
          }
        }

        // If we couldn't recover, throw the original error
        console.error('❌ Could not recover from insert error:', error);
        throw error;
      }
      
      throw new Error("Belge yüklenirken beklenmeyen bir hata oluştu");
    },
    onSuccess: (_, variables) => {
      // Force refetch documents to ensure UI is updated
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.positionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["position", variables.positionId],
      });
      // Also refetch immediately
      queryClient.refetchQueries({
        queryKey: ["documents", variables.positionId],
      });
    },
    onError: (error, variables) => {
      // Even on error, try to refetch in case document was created
      console.log('Mutation error, but refetching documents anyway:', error);
      queryClient.invalidateQueries({
        queryKey: ["documents", variables.positionId],
      });
      queryClient.refetchQueries({
        queryKey: ["documents", variables.positionId],
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
        // @ts-expect-error - Supabase type inference issue with Update types
        .update(updateData)
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

