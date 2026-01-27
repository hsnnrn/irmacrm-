import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Manual type definitions for position_payments table
type Payment = {
  id: string;
  position_id: string;
  payment_type: PaymentType;
  description: string | null;
  amount: number;
  currency: "TRY" | "USD" | "EUR" | "RUB";
  exchange_rate: number | null;
  payment_date: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

type PaymentInsert = {
  id?: string;
  position_id: string;
  payment_type: PaymentType;
  description?: string | null;
  amount: number;
  currency?: "TRY" | "USD" | "EUR" | "RUB";
  exchange_rate?: number | null;
  payment_date: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
};

type PaymentUpdate = Partial<PaymentInsert> & { id: string };

export type PaymentType = "FUEL" | "DRIVER_EXPENSE" | "ADVANCE" | "TOLL" | "PARKING" | "OTHER";

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  FUEL: "Yakıt",
  DRIVER_EXPENSE: "Şoför Harcırahı",
  ADVANCE: "Avans",
  TOLL: "Köprü/Otoyol",
  PARKING: "Otopark",
  OTHER: "Diğer",
};

export function usePositionPayments(positionId: string) {
  return useQuery<Payment[]>({
    queryKey: ["position-payments", positionId],
    queryFn: async () => {
      if (!positionId) return [];
      
      const { data, error } = await supabase
        .from("position_payments")
        .select("*")
        .eq("position_id", positionId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!positionId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation<Payment, Error, PaymentInsert>({
    mutationFn: async (payment: PaymentInsert) => {
      const { data, error } = await supabase
        .from("position_payments")
        // @ts-ignore - Supabase type inference issue
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["position-payments", variables.position_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["position", variables.position_id],
      });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation<Payment, Error, PaymentUpdate & { id: string }>({
    mutationFn: async ({ id, ...payment }) => {
      const { data, error } = await supabase
        .from("position_payments")
        // @ts-expect-error - Supabase type inference issue
        .update({ ...payment, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["position-payments", data.position_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["position", data.position_id],
      });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation<string | undefined, Error, string>({
    mutationFn: async (id: string) => {
      // Get position_id before deleting
      const { data: payment } = await supabase
        .from("position_payments")
        .select("position_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("position_payments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return (payment as { position_id: string } | null)?.position_id;
    },
    onSuccess: (positionId) => {
      if (positionId) {
        queryClient.invalidateQueries({
          queryKey: ["position-payments", positionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["position", positionId],
        });
      }
    },
  });
}
