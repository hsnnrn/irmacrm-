import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Global Real-time subscription hook
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Single channel for all public schema changes to minimize connections
    const channel = supabase
      .channel("global-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
        },
        (payload) => {
          const { table, eventType } = payload;
          console.log(`Realtime update: ${eventType} on ${table}`);

          // Invalidate queries based on the table changed
          switch (table) {
            case "positions":
              queryClient.invalidateQueries({ queryKey: ["positions"] });
              if (payload.new && "id" in payload.new) {
                queryClient.invalidateQueries({
                  queryKey: ["position", (payload.new as any).id],
                });
              }
              break;
            
            case "customers":
              queryClient.invalidateQueries({ queryKey: ["customers"] });
              if (payload.new && "id" in payload.new) {
                // If we had single customer query
                queryClient.invalidateQueries({
                  queryKey: ["customer", (payload.new as any).id],
                });
              }
              break;

            case "suppliers":
              queryClient.invalidateQueries({ queryKey: ["suppliers"] });
              if (payload.new && "id" in payload.new) {
                queryClient.invalidateQueries({
                  queryKey: ["supplier", (payload.new as any).id],
                });
              }
              break;

            case "invoices":
              queryClient.invalidateQueries({ queryKey: ["invoices"] });
              if (payload.new && "position_id" in payload.new) {
                queryClient.invalidateQueries({
                  queryKey: ["invoices", (payload.new as any).position_id],
                });
                queryClient.invalidateQueries({
                  queryKey: ["position", (payload.new as any).position_id],
                });
              }
              break;

            case "documents":
              if (payload.new && "position_id" in payload.new) {
                queryClient.invalidateQueries({
                  queryKey: ["documents", (payload.new as any).position_id],
                });
                // Documents affect position status checks
                queryClient.invalidateQueries({
                  queryKey: ["position", (payload.new as any).position_id],
                });
              }
              break;

            case "route_stops":
              if (payload.new && "position_id" in payload.new) {
                queryClient.invalidateQueries({
                  queryKey: ["position", (payload.new as any).position_id],
                });
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// Deprecated: Individual hooks are replaced by the global one above for efficiency
// Keeping exports if they are used elsewhere specifically, but updating them to be no-ops or simple wrappers if needed.
// For now, we'll leave them but recommend using the global provider.

export function usePositionsRealtime() { useRealtimeSubscriptions(); }
export function useCustomersRealtime() { useRealtimeSubscriptions(); }
export function useSuppliersRealtime() { useRealtimeSubscriptions(); }
export function useInvoicesRealtime() { useRealtimeSubscriptions(); }
export function useDocumentsRealtime() { useRealtimeSubscriptions(); }
