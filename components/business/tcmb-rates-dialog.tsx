/**
 * TCMB All Exchange Rates Dialog Component
 * Shows all currencies from TCMB today.xml
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { formatExchangeRate } from "@/lib/exchange-rates";

interface TCMBCurrency {
  CurrencyCode: string;
  Isim: string;
  ForexBuying: string;
  ForexSelling: string;
  BanknoteBuying: string;
  BanknoteSelling: string;
  Unit: string;
}

interface TCMBRatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TCMBRatesDialog({ open, onOpenChange }: TCMBRatesDialogProps) {
  const [currencies, setCurrencies] = useState<TCMBCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchAllTCMBRates();
    }
  }, [open]);

  const fetchAllTCMBRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/exchange-rates/all', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TCMB rates');
      }

      const data = await response.json();
      setCurrencies(data.currencies || []);
      setLastUpdate(data.lastUpdate || '');
    } catch (error) {
      console.error('Error fetching TCMB rates:', error);
      setCurrencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCurrencies = currencies.filter((currency) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      currency.CurrencyCode.toLowerCase().includes(searchLower) ||
      currency.Isim.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>TCMB Döviz Kurları</DialogTitle>
          <DialogDescription>
            Türkiye Cumhuriyet Merkez Bankası güncel döviz kurları
            {lastUpdate && (
              <span className="block mt-1 text-xs text-gray-500">
                Son güncelleme: {new Date(lastUpdate).toLocaleString('tr-TR')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Para birimi ara (USD, EUR, İngiliz Sterlini...)"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                <span className="ml-2 text-gray-600">Kurlar yükleniyor...</span>
              </div>
            ) : filteredCurrencies.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Kur verisi bulunamadı'}
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">Kod</TableHead>
                    <TableHead>Para Birimi</TableHead>
                    <TableHead className="text-right">Birim</TableHead>
                    <TableHead className="text-right">Forex Alış</TableHead>
                    <TableHead className="text-right">Forex Satış</TableHead>
                    <TableHead className="text-right">Efektif Alış</TableHead>
                    <TableHead className="text-right">Efektif Satış</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCurrencies.map((currency) => {
                    const unit = parseInt(currency.Unit || '1', 10);
                    const buying = parseFloat(currency.ForexBuying || '0');
                    const selling = parseFloat(currency.ForexSelling || '0');
                    const banknoteBuying = parseFloat(currency.BanknoteBuying || '0');
                    const banknoteSelling = parseFloat(currency.BanknoteSelling || '0');
                    
                    // Adjust for unit
                    const buyingRate = unit > 1 ? buying / unit : buying;
                    const sellingRate = unit > 1 ? selling / unit : selling;
                    const banknoteBuyingRate = unit > 1 ? banknoteBuying / unit : banknoteBuying;
                    const banknoteSellingRate = unit > 1 ? banknoteSelling / unit : banknoteSelling;

                    return (
                      <TableRow key={currency.CurrencyCode}>
                        <TableCell className="font-mono font-semibold">
                          {currency.CurrencyCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {currency.Isim}
                        </TableCell>
                        <TableCell className="text-right">
                          {unit}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatExchangeRate(buyingRate)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatExchangeRate(sellingRate)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {banknoteBuying > 0 ? formatExchangeRate(banknoteBuyingRate) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {banknoteSelling > 0 ? formatExchangeRate(banknoteSellingRate) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Toplam {filteredCurrencies.length} para birimi gösteriliyor
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
