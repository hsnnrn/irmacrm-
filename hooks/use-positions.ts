import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, Inserts, Updates } from "@/lib/supabase";

type Position = Tables<"positions">;
type PositionInsert = Inserts<"positions">;
type PositionUpdate = Updates<"positions">;
type Customer = Tables<"customers">;
type Supplier = Tables<"suppliers">;

// Position with joined relations - exported for use in position detail page
export type PositionWithRelations = Position & {
  customers: Customer | null;
  suppliers: Supplier | null;
};

export function usePositions() {
  return useQuery<PositionWithRelations[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select(`
          *,
          customers:customer_id (
            id,
            company_name,
            contact_person,
            email,
            phone
          ),
          suppliers:supplier_id (
            id,
            company_name,
            payment_term_days
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PositionWithRelations[];
    },
  });
}

export function usePosition(id: string) {
  return useQuery<PositionWithRelations>({
    queryKey: ["position", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select(`
          *,
          customers:customer_id (
            id,
            company_name,
            contact_person,
            email,
            phone,
            tax_id
          ),
          suppliers:supplier_id (
            id,
            company_name,
            tax_id,
            payment_term_days
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PositionWithRelations;
    },
    enabled: !!id,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation<Position, Error, PositionInsert>({
    mutationFn: async (position: PositionInsert) => {
      const { data, error } = await supabase
        .from("positions")
        .insert(position)
        .select()
        .single();

      if (error) throw error;
      return data as Position;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...position }: PositionUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("positions")
        .update(position)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["position", variables.id] });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("positions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

