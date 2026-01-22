"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { useRealtimeSubscriptions } from "@/hooks/use-realtime";

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to all real-time changes
  useRealtimeSubscriptions();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeProvider>
        {children}
        <Toaster />
      </RealtimeProvider>
    </QueryClientProvider>
  );
}

