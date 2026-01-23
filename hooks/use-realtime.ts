import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Global Real-time subscription hook
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;
  const retryDelay = 3000; // 3 seconds

  useEffect(() => {
    let isMounted = true;

    const setupChannel = () => {
      // Clean up existing channel if any
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      // Single channel for all public schema changes to minimize connections
      const channel = supabase
        .channel("global-db-changes", {
          config: {
            // Add presence and broadcast config for better connection handling
            presence: {
              key: "",
            },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
          },
          (payload) => {
            const { table, eventType } = payload;
            if (process.env.NODE_ENV === "development") {
              console.log(`Realtime update: ${eventType} on ${table}`);
            }

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
        .subscribe((status) => {
          if (!isMounted) return;

          if (status === "SUBSCRIBED") {
            // Successfully subscribed, reset retry count
            retryCountRef.current = 0;
            if (process.env.NODE_ENV === "development") {
              console.log("Realtime subscription active");
            }
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            // Connection failed, retry with exponential backoff
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current += 1;
              const delay = retryDelay * Math.pow(2, retryCountRef.current - 1);
              
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  `Realtime connection failed (${status}), retrying in ${delay}ms... (${retryCountRef.current}/${maxRetries})`
                );
              }

              retryTimeoutRef.current = setTimeout(() => {
                if (isMounted) {
                  setupChannel();
                }
              }, delay);
            } else {
              // Max retries reached, give up silently in production
              if (process.env.NODE_ENV === "development") {
                console.error("Realtime subscription failed after max retries");
              }
            }
          }
        });

      channelRef.current = channel;
    };

    // Initial setup
    setupChannel();

    return () => {
      isMounted = false;
      
      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Remove channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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
