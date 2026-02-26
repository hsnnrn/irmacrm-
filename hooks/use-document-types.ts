import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DocumentTypeConfig {
  id: string;
  code: string;
  label: string;
  is_required_for_departure: boolean;
  is_required_for_close: boolean;
  is_active: boolean;
  created_at: string;
}

export function useDocumentTypes() {
  return useQuery<DocumentTypeConfig[]>({
    queryKey: ["document-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as DocumentTypeConfig[];
    },
  });
}

interface CreateDocumentTypeInput {
  code: string;
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
        code: input.code.trim().toUpperCase(),
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

