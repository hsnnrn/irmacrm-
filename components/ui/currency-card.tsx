"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { convertCurrency } from "@/lib/exchange-rates";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CurrencyCardProps {
  title: string;
  description?: string;
  amount: number;
  originalCurrency?: string;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  valueClassName?: string;
}

export function CurrencyCard({
  title,
  description,
  amount,
  originalCurrency = "EUR",
  icon,
  className,
  titleClassName,
  valueClassName,
}: CurrencyCardProps) {
  const { currency, cycleCurrency } = useCurrencyStore();
  const { data: exchangeRates, isLoading } = useExchangeRates();

  const convertedAmount = exchangeRates
    ? convertCurrency(amount, originalCurrency, currency, exchangeRates)
    : amount;

  const handleClick = () => {
    cycleCurrency();
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-lg hover:scale-105 active:scale-95",
        className
      )}
      onClick={handleClick}
      title="Kuru değiştirmek için tıklayın (EUR → USD → RUB → TRY)"
    >
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {icon}
          {description || title}
        </CardDescription>
        <CardTitle className={cn("text-3xl", titleClassName)}>
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              {formatCurrency(convertedAmount, currency)}
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500">
          {originalCurrency !== currency && (
            <>Orijinal: {formatCurrency(amount, originalCurrency)} • </>
          )}
          Kuru değiştirmek için tıklayın
        </p>
      </CardContent>
    </Card>
  );
}

