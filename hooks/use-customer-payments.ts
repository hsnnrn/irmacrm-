import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CustomerMovementType = "BORC" | "ALACAK";

export type CustomerPayment = {
  id: string;
  customer_id: string;
  movement_type: CustomerMovementType;
  description: string | null;
  invoice_no: string | null;
  amount: number;
  currency: "TRY" | "USD" | "EUR" | "RUB";
  payment_date: string;
  created_at: string;
  updated_at: string;
};

type CustomerPaymentInsert = {
  id?: string;
  customer_id: string;
  movement_type?: CustomerMovementType;
  description?: string | null;
  invoice_no?: string | null;
  amount: number;
  currency?: "TRY" | "USD" | "EUR" | "RUB";
  payment_date: string;
  created_at?: string;
  updated_at?: string;
};

type CustomerPaymentUpdate = Partial<CustomerPaymentInsert> & { id: string };

export function useCustomerPayments(customerId: string | undefined) {
  return useQuery<CustomerPayment[]>({
    queryKey: ["customer-payments", customerId],
    queryFn: async () => {
      if (!customerId) return [];

      const { data, error } = await supabase
        .from("customer_payments")
        .select("*")
        .eq("customer_id", customerId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return (data || []) as CustomerPayment[];
    },
    enabled: !!customerId,
  });
}

export function useCreateCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation<CustomerPayment, Error, CustomerPaymentInsert>({
    mutationFn: async (payment: CustomerPaymentInsert) => {
      const { data, error } = await supabase
        .from("customer_payments")
        // @ts-ignore - Supabase type inference issue
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      return data as CustomerPayment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-payments", variables.customer_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-ledger", variables.customer_id],
      });
    },
  });
}

export function useDeleteCustomerPayment() {
  const queryClient = useQueryClient();

  return useMutation<string | undefined, Error, string>({
    mutationFn: async (id: string) => {
      const { data: payment } = await supabase
        .from("customer_payments")
        .select("customer_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("customer_payments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return (payment as { customer_id: string } | null)?.customer_id;
    },
    onSuccess: (customerId) => {
      if (customerId) {
        queryClient.invalidateQueries({
          queryKey: ["customer-payments", customerId],
        });
        queryClient.invalidateQueries({
          queryKey: ["customer-ledger", customerId],
        });
      }
    },
  });
}

