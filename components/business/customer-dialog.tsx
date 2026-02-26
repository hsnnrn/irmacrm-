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
import {
  useCustomerPayments,
  useCreateCustomerPayment,
  useDeleteCustomerPayment,
} from "@/hooks/use-customer-payments";
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

  const { data: payments } = useCustomerPayments(customer?.id);
  const createPayment = useCreateCustomerPayment();
  const deletePayment = useDeleteCustomerPayment();
  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    amount: "",
    currency: "TRY" as AccountCurrency,
    invoice_no: "",
    description: "",
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

  const handleAddPayment = async () => {
    if (!customer) return;
    const amount = parseFloat(paymentForm.amount || "0");
    if (!amount || amount <= 0) {
      toast({
        title: "Uyarı",
        description: "Ödeme tutarı sıfırdan büyük olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPayment.mutateAsync({
        customer_id: customer.id,
        amount,
        currency: paymentForm.currency,
        invoice_no: paymentForm.invoice_no || null,
        description: paymentForm.description || null,
        payment_date:
          paymentForm.payment_date ||
          new Date().toISOString().slice(0, 10),
      });
      setPaymentForm((prev) => ({
        ...prev,
        amount: "",
        invoice_no: "",
        description: "",
      }));
      toast({
        title: "Ödeme eklendi",
        description: "Müşteri ödemesi başarıyla kaydedildi.",
      });
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deletePayment.mutateAsync(id);
      toast({
        title: "Silindi",
        description: "Ödeme kaydı silindi.",
      });
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

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

            {customer && (
              <div className="mt-2 border-t pt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">
                    Cari Ödeme Girişi (Müşteriden Tahsilat)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bu alandan müşteriden alınan ödemeleri girebilirsiniz. Girdiğiniz
                    ödemeler cari ekstresine <strong>Alacak</strong> (tahsilat) olarak
                    yansır.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor="payment_date">Tarih</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          payment_date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="amount">
                      Tutar ({paymentForm.currency})
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Ödeme Dövizi</Label>
                    <Select
                      value={paymentForm.currency}
                      onValueChange={(value) =>
                        setPaymentForm({
                          ...paymentForm,
                          currency: value as AccountCurrency,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="invoice_no">Fatura / Makbuz No</Label>
                    <Input
                      id="invoice_no"
                      value={paymentForm.invoice_no}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          invoice_no: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment_description">Açıklama</Label>
                  <Input
                    id="payment_description"
                    value={paymentForm.description}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Cari hareketlere daha detaylı bakmak için müşterinin{" "}
                    <span className="font-semibold">Cari Hesap</span> sayfasını
                    kullanabilirsiniz.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddPayment}
                    disabled={createPayment.isPending}
                  >
                    {createPayment.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ödeme Ekle
                  </Button>
                </div>

                {payments && payments.length > 0 && (
                  <div className="mt-2 rounded-md border bg-muted/40">
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                      Son Ödemeler
                    </div>
                    <div className="max-h-40 overflow-auto text-xs">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-3 py-1 text-left">Tarih</th>
                            <th className="px-3 py-1 text-left">Fatura No</th>
                            <th className="px-3 py-1 text-right">Tutar</th>
                            <th className="px-3 py-1 text-left">Döviz</th>
                            <th className="px-3 py-1 text-left">Açıklama</th>
                            <th className="px-3 py-1 text-right"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => (
                            <tr key={p.id} className="border-b last:border-0">
                              <td className="px-3 py-1">
                                {p.payment_date}
                              </td>
                              <td className="px-3 py-1">
                                {p.invoice_no || "-"}
                              </td>
                              <td className="px-3 py-1 text-right">
                                {p.amount.toLocaleString("tr-TR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-1">{p.currency}</td>
                              <td className="px-3 py-1 truncate max-w-[160px]">
                                {p.description || "-"}
                              </td>
                              <td className="px-3 py-1 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-xs"
                                  onClick={() => handleDeletePayment(p.id)}
                                  disabled={deletePayment.isPending}
                                  title="Sil"
                                >
                                  ×
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

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

