import { create } from "zustand";
import { persist } from "zustand/middleware";

type Currency = "TRY" | "USD" | "EUR" | "RUB";

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  cycleCurrency: () => void;
}

const currencyOrder: Currency[] = ["EUR", "USD", "RUB", "TRY"];

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: "TRY",
      setCurrency: (currency) => set({ currency }),
      cycleCurrency: () =>
        set((state) => {
          const currentIndex = currencyOrder.indexOf(state.currency);
          const nextIndex = (currentIndex + 1) % currencyOrder.length;
          return { currency: currencyOrder[nextIndex] };
        }),
    }),
    {
      name: "currency-storage",
    }
  )
);

