import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables, Inserts, Updates } from "@/lib/supabase";

type PositionTrip = Tables<"position_trips">;
type PositionTripInsert = Inserts<"position_trips">;
type PositionTripUpdate = Updates<"position_trips">;

export type { PositionTrip };

export function usePositionTrips(positionId: string) {
  return useQuery<PositionTrip[]>({
    queryKey: ["position-trips", positionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_trips")
        .select("*")
        .eq("position_id", positionId)
        .order("trip_no", { ascending: true });

      if (error) throw error;
      return data as PositionTrip[];
    },
    enabled: !!positionId,
  });
}

export function useCreatePositionTrip() {
  const queryClient = useQueryClient();

  return useMutation<PositionTrip, Error, PositionTripInsert>({
    mutationFn: async (trip: PositionTripInsert) => {
      const { data, error } = await supabase
        .from("position_trips")
        // @ts-ignore - Supabase type inference issue
        .insert([trip])
        .select()
        .single();

      if (error) throw error;
      return data as PositionTrip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["position-trips", data.position_id] });
    },
  });
}

export function useUpdatePositionTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...trip }: PositionTripUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("position_trips")
        // @ts-expect-error - Supabase type inference issue with Update types
        .update(trip)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PositionTrip;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["position-trips", data.position_id] });
    },
  });
}

export function useDeletePositionTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, positionId }: { id: string; positionId: string }) => {
      const { error } = await supabase
        .from("position_trips")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { positionId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["position-trips", variables.positionId] });
    },
  });
}
