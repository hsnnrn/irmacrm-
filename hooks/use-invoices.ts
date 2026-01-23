import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Inserts, Updates } from "@/lib/supabase";

type InvoiceInsert = Inserts<"invoices">;
type InvoiceUpdate = Updates<"invoices">;

interface Invoice {
  id: string;
  position_id: string;
  invoice_type: "SALES" | "PURCHASE";
  amount: number;
  currency: string;
  invoice_date: string;
  due_date: string | null;
  is_paid: boolean;
  created_at: string;
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          positions:position_id (
            position_no,
            loading_point,
            unloading_point,
            customers:customer_id (
              company_name
            )
          )
        `)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function usePositionInvoices(positionId: string) {
  return useQuery({
    queryKey: ["invoices", positionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("position_id", positionId)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!positionId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: InvoiceInsert) => {
      const { data, error } = await supabase
        .from("invoices")
        // @ts-ignore - Supabase type inference issue with Database types
        .insert([invoice])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...invoice }: InvoiceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("invoices")
        .update(invoice as Omit<InvoiceUpdate, "id">)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invoices").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

