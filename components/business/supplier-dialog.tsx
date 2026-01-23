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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any;
  onSave: () => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSave,
}: SupplierDialogProps) {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    company_name: "",
    tax_id: "",
    payment_term_days: 30,
    is_blacklisted: false,
  });

  useEffect(() => {
    if (supplier) {
      setFormData(supplier);
    } else {
      setFormData({
        company_name: "",
        tax_id: "",
        payment_term_days: 30,
        is_blacklisted: false,
      });
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (supplier) {
        // Update existing supplier
        await updateSupplier.mutateAsync({ id: supplier.id, ...formData });
        toast({
          title: "Başarılı!",
          description: "Tedarikçi başarıyla güncellendi.",
        });
      } else {
        // Create new supplier
        await createSupplier.mutateAsync(formData);
        toast({
          title: "Başarılı!",
          description: "Tedarikçi başarıyla oluşturuldu.",
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

  const isLoading = createSupplier.isPending || updateSupplier.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Tedarikçi Düzenle" : "Yeni Tedarikçi"}
          </DialogTitle>
          <DialogDescription>
            Tedarikçi bilgilerini girin. Vade günü ödeme sürecini belirler.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Firma Adı *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Vergi No / TC No</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) =>
                  setFormData({ ...formData, tax_id: e.target.value })
                }
                placeholder="Şahıs şirketi için TC no girebilirsiniz"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_term_days">
                Vade Günü (Ödeme Vadesi)
              </Label>
              <Input
                id="payment_term_days"
                type="number"
                value={formData.payment_term_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_term_days: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-gray-500">
                CMR tarihinden sonra kaç gün içinde ödeme yapılacak
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_blacklisted"
                checked={formData.is_blacklisted}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_blacklisted: !!checked })
                }
              />
              <Label
                htmlFor="is_blacklisted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Kara Listeye Ekle (Çalışılmayacak)
              </Label>
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

