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

export type CustomerMovementType = "BORC" | "ALACAK";

type CustomerPayment = {
  id: string;
  customer_id: string;
  movement_type: CustomerMovementType;
  description: string | null;
  invoice_no: string | null;
  amount: number;
  currency: string;
  payment_date: string;
  created_at: string;
};

export type PositionWithInvoices = Position & {
  invoices: Invoice[];
};

type PositionTrip = {
  id: string;
  position_id: string;
  trip_no: number;
  loading_point: string;
  unloading_point: string;
  sales_price: number | null;
  sales_currency: string | null;
  cost_price: number | null;
  cost_currency: string | null;
  sales_exchange_rate: number | null;
  cost_exchange_rate: number | null;
  departure_date: string | null;
  created_at: string;
};

export type CustomerLedgerData = {
  customer: Customer | null;
  positions: PositionWithInvoices[];
  allInvoices: Invoice[];
  payments: CustomerPayment[];
  trips: PositionTrip[];
};

export function useCustomerLedger(customerId: string | null) {
  return useQuery<CustomerLedgerData>({
    queryKey: ["customer-ledger", customerId],
    queryFn: async () => {
      if (!customerId) {
        return { customer: null, positions: [], allInvoices: [], payments: [], trips: [] };
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

      const positionIds = positions.map((p) => p.id);

      // Fetch all invoices for these positions
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .in("position_id", positionIds)
        .order("invoice_date", { ascending: true });

      if (invoicesError) throw invoicesError;

      const invoiceList = (invoices || []) as Invoice[];

      // Fetch customer payments
      const { data: payments, error: paymentsError } = await supabase
        .from("customer_payments")
        .select("*")
        .eq("customer_id", customerId)
        .order("payment_date", { ascending: true });

      if (paymentsError) throw paymentsError;

      const paymentList = (payments || []) as CustomerPayment[];

      // Fetch position trips (with financial data) for all positions
      let tripList: PositionTrip[] = [];
      if (positionIds.length > 0) {
        const { data: tripsData, error: tripsError } = await supabase
          .from("position_trips")
          .select("id, position_id, trip_no, loading_point, unloading_point, sales_price, sales_currency, cost_price, cost_currency, sales_exchange_rate, cost_exchange_rate, departure_date, created_at")
          .in("position_id", positionIds)
          .order("created_at", { ascending: true });

        if (!tripsError) {
          tripList = (tripsData || []) as PositionTrip[];
        }
      }

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
        payments: paymentList,
        trips: tripList,
      };
    },
    enabled: !!customerId,
  });
}
