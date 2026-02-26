import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase";

type Customer = Tables<"customers">;
type Position = Tables<"positions">;
type Invoice = {
  id: string;
  position_id: string;
  invoice_type: string;
  amount: number;
  currency: string;
  invoice_date: string;
  due_date: string | null;
  is_paid: boolean;
  created_at: string;
};

export type PositionWithInvoices = Position & {
  invoices: Invoice[];
};

export type CustomerLedgerData = {
  customer: Customer | null;
  positions: PositionWithInvoices[];
  allInvoices: Invoice[];
};

export function useCustomerLedger(customerId: string | null) {
  return useQuery<CustomerLedgerData>({
    queryKey: ["customer-ledger", customerId],
    queryFn: async () => {
      if (!customerId) {
        return { customer: null, positions: [], allInvoices: [] };
      }

      // Fetch customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();

      if (customerError && customerError.code !== "PGRST116") throw customerError;

      // Fetch positions for this customer
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (positionsError) throw positionsError;

      const positions = (positionsData || []) as Position[];

      if (positions.length === 0) {
        return {
          customer: customer as Customer | null,
          positions: [],
          allInvoices: [],
        };
      }

      const positionIds = positions.map((p) => p.id);

      // Fetch all invoices for these positions
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .in("position_id", positionIds)
        .order("invoice_date", { ascending: true });

      if (invoicesError) throw invoicesError;

      const invoiceList = (invoices || []) as Invoice[];

      // Group invoices by position and attach to positions
      const positionsWithInvoices: PositionWithInvoices[] = positions.map(
        (pos) => ({
          ...pos,
          invoices: invoiceList.filter((inv) => inv.position_id === pos.id),
        })
      );

      return {
        customer: customer as Customer | null,
        positions: positionsWithInvoices,
        allInvoices: invoiceList,
      };
    },
    enabled: !!customerId,
  });
}
