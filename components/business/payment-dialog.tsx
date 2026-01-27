"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { PAYMENT_TYPE_LABELS, type PaymentType } from "@/hooks/use-payments";
import { Loader2 } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positionId: string;
  onSave: () => void | Promise<void>;
  formData?: {
    payment_type: PaymentType;
    description: string;
    amount: string;
    currency: "TRY" | "USD" | "EUR" | "RUB";
    exchange_rate: string;
    payment_date: string;
  };
  onFormDataChange?: (data: {
    payment_type: PaymentType;
    description: string;
    amount: string;
    currency: "TRY" | "USD" | "EUR" | "RUB";
    exchange_rate: string;
    payment_date: string;
  }) => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  positionId,
  onSave,
  formData: externalFormData,
  onFormDataChange,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const { data: exchangeRates } = useExchangeRates();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalFormData, setInternalFormData] = useState({
    payment_type: "FUEL" as PaymentType,
    description: "",
    amount: "",
    currency: "TRY" as "TRY" | "USD" | "EUR" | "RUB",
    exchange_rate: "",
    payment_date: new Date().toISOString().split("T")[0],
  });

  // Use external formData if provided, otherwise use internal
  const currentFormData = externalFormData || internalFormData;
  const updateFormData = onFormDataChange || setInternalFormData;

  // Get exchange rate for currency
  const getExchangeRate = (currency: string): number => {
    if (currency === "TRY") return 1;
    if (!exchangeRates) return 0;
    const rate = (exchangeRates as any)[currency]?.selling || 0;
    return rate;
  };

  // Update exchange rate when currency changes
  useEffect(() => {
    if (currentFormData.currency && currentFormData.currency !== "TRY") {
      const rate = getExchangeRate(currentFormData.currency);
      updateFormData({ ...currentFormData, exchange_rate: rate.toString() });
    } else {
      updateFormData({ ...currentFormData, exchange_rate: "1" });
    }
  }, [currentFormData.currency, exchangeRates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFormData.amount || !currentFormData.payment_date) {
      toast({
        title: "Hata!",
        description: "Lütfen tüm gerekli alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave();
      onOpenChange(false);
      
      // Reset form
      const resetData = {
        payment_type: "FUEL" as PaymentType,
        description: "",
        amount: "",
        currency: "TRY" as "TRY" | "USD" | "EUR" | "RUB",
        exchange_rate: "1",
        payment_date: new Date().toISOString().split("T")[0],
      };
      updateFormData(resetData);
    } catch (error) {
      toast({
        title: "Hata!",
        description: "Ödeme eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ödeme Ekle</DialogTitle>
          <DialogDescription>
            Pozisyon için yapılan ödemeyi kaydedin (yakıt, harcırah, avans vb.)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_type">Ödeme Tipi</Label>
            <Select
              value={currentFormData.payment_type}
              onValueChange={(value) =>
                updateFormData({ ...currentFormData, payment_type: value as PaymentType })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
            <Input
              id="description"
              value={currentFormData.description}
              onChange={(e) =>
                updateFormData({ ...currentFormData, description: e.target.value })
              }
              placeholder="Örn: Yakıt parası - İstanbul-Ankara"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={currentFormData.amount}
                onChange={(e) =>
                  updateFormData({ ...currentFormData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Para Birimi</Label>
              <Select
                value={currentFormData.currency}
                onValueChange={(value) =>
                  updateFormData({
                    ...currentFormData,
                    currency: value as "TRY" | "USD" | "EUR" | "RUB",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentFormData.currency !== "TRY" && (
            <div className="space-y-2">
              <Label htmlFor="exchange_rate">Kur</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.0001"
                value={currentFormData.exchange_rate}
                onChange={(e) =>
                  updateFormData({ ...currentFormData, exchange_rate: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                Otomatik kur: {getExchangeRate(currentFormData.currency).toFixed(4)} ₺
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment_date">Ödeme Tarihi</Label>
            <Input
              id="payment_date"
              type="date"
              value={currentFormData.payment_date}
              onChange={(e) =>
                updateFormData({ ...currentFormData, payment_date: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
