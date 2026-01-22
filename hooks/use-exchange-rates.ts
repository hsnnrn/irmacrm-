import { useQuery } from "@tanstack/react-query";
import { fetchExchangeRates, type ExchangeRates } from "@/lib/exchange-rates";

/**
 * Hook to fetch and cache exchange rates
 * Refetches every 5 minutes
 */
export function useExchangeRates() {
  return useQuery<ExchangeRates>({
    queryKey: ["exchange-rates"],
    queryFn: fetchExchangeRates,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });
}

