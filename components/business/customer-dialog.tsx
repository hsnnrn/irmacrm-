"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const CURRENCY_OPTIONS = ["TRY", "USD", "EUR", "RUB"] as const;
type AccountCurrency = (typeof CURRENCY_OPTIONS)[number];

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any;
  onSave: () => void;
}

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerDialogProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company_name: "",
    tax_id: "",
    contact_person: "",
    email: "",
    phone: "",
    risk_limit: 0,
    current_balance: 0,
    account_currency: "TRY" as AccountCurrency,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        account_currency: (customer.account_currency || "TRY") as AccountCurrency,
      });
    } else {
      setFormData({
        company_name: "",
        tax_id: "",
        contact_person: "",
        email: "",
        phone: "",
        risk_limit: 0,
        current_balance: 0,
        account_currency: "TRY" as AccountCurrency,
      });
    }
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (customer) {
        // Update existing customer
        await updateCustomer.mutateAsync({ id: customer.id, ...formData });
        toast({
          title: "Başarılı!",
          description: "Müşteri başarıyla güncellendi.",
        });
      } else {
        // Create new customer
        await createCustomer.mutateAsync(formData);
        toast({
          title: "Başarılı!",
          description: "Müşteri başarıyla oluşturuldu.",
        });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const isLoading = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Müşteri Düzenle" : "Yeni Müşteri"}
          </DialogTitle>
          <DialogDescription>
            Müşteri bilgilerini girin. Tüm alanların doldurulması önemlidir.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Firma Adı *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">Vergi No</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_id: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Yetkili Kişi</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact_person: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Cari Döviz Cinsi</Label>
              <Select
                value={formData.account_currency || "TRY"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    account_currency: value as AccountCurrency,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Para birimi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Risk limiti ve bakiye bu para biriminde girilir.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk_limit">
                  Risk Limiti ({formData.account_currency || "TRY"})
                </Label>
                <Input
                  id="risk_limit"
                  type="number"
                  value={formData.risk_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      risk_limit: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_balance">
                  Mevcut Bakiye ({formData.account_currency || "TRY"})
                </Label>
                <Input
                  id="current_balance"
                  type="number"
                  value={formData.current_balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_balance: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

