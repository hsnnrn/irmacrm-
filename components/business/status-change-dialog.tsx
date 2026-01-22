"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/position-utils";
import type { PositionStatus } from "@/lib/position-utils";
import { useState } from "react";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: PositionStatus;
  allowedStatuses: PositionStatus[];
  onStatusChange: (newStatus: PositionStatus) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  currentStatus,
  allowedStatuses,
  onStatusChange,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<PositionStatus | null>(
    null
  );

  const handleSubmit = () => {
    if (selectedStatus) {
      onStatusChange(selectedStatus);
      setSelectedStatus(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Durum Değiştir</DialogTitle>
          <DialogDescription>
            Pozisyon durumunu değiştirmek için yeni durum seçin
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-600">
              Mevcut Durum:
            </p>
            <Badge
              variant={
                STATUS_COLORS[currentStatus] as
                  | "success"
                  | "warning"
                  | "danger"
                  | "default"
              }
            >
              {STATUS_LABELS[currentStatus]}
            </Badge>
          </div>

          {allowedStatuses.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">
                Geçilebilecek Durumlar:
              </p>
              <div className="space-y-2">
                {allowedStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedStatus === status
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-red-300"
                    }`}
                  >
                    <Badge
                      variant={
                        STATUS_COLORS[status] as
                          | "success"
                          | "warning"
                          | "danger"
                          | "default"
                      }
                    >
                      {STATUS_LABELS[status]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    Durum Değiştirilemez
                  </p>
                  <p className="text-sm text-yellow-700">
                    Gerekli belgeler yüklenmediği veya işlemler tamamlanmadığı
                    için durum değiştirilemez.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedStatus || allowedStatuses.length === 0}
          >
            Durumu Değiştir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

