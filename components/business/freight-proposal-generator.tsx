"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown } from "lucide-react";
import { generateFreightProposal } from "@/lib/pdf-generator";

interface FreightProposalGeneratorProps {
  position?: any;
  customer?: any;
}

export function FreightProposalGenerator({
  position,
  customer,
}: FreightProposalGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    validityDays: 7,
  });

  const handleGenerate = () => {
    const proposalData = {
      proposalNo: `TKL-${Date.now()}`,
      date: new Date().toLocaleDateString("tr-TR"),
      customerName: customer?.company_name || "Müşteri Adı",
      customerAddress: customer?.address,
      loadingPoint: position?.loading_point || "",
      unloadingPoint: position?.unloading_point || "",
      cargoDescription: position?.cargo_description || "",
      price: position?.sales_price || 0,
      currency: position?.sales_currency || "EUR",
      validityDays: formData.validityDays,
    };

    generateFreightProposal(proposalData);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <FileDown className="mr-2 h-4 w-4" />
        Navlun Teklifi Oluştur
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Navlun Teklifi Oluştur</DialogTitle>
            <DialogDescription>
              PDF formatında navlun teklifi oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Geçerlilik Süresi (Gün)</Label>
              <Input
                type="number"
                value={formData.validityDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validityDays: parseInt(e.target.value) || 7,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleGenerate}>
              <FileDown className="mr-2 h-4 w-4" />
              PDF Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

