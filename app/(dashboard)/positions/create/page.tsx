"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { translateSupabaseError } from "@/lib/utils";
import { useCustomers } from "@/hooks/use-customers";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useCreatePosition } from "@/hooks/use-positions";
import { CityAutocomplete } from "@/components/business/city-autocomplete";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { Combobox } from "@/components/ui/combobox";

interface RouteStop {
  id: string;
  location_name: string;
  stop_type: "PICKUP" | "DROP" | "CUSTOMS" | "TRANSFER";
  stop_order: number;
}

export default function CreatePositionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: exchangeRates } = useExchangeRates();
  const createPosition = useCreatePosition();
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    supplier_id: "",
    loading_point: "",
    unloading_point: "",
    cargo_description: "",
    vehicle_plate: "",
    sales_price: 0,
    sales_currency: "EUR",
    sales_exchange_rate: 0,
    cost_price: 0,
    cost_currency: "EUR",
    cost_exchange_rate: 0,
  });

  // Exchange Rate Logic
  // When currency changes, try to fetch the default rate from API
  const getExchangeRate = (currency: string) => {
    if (currency === "TRY") return 1;
    if (!exchangeRates) return 0;
    
    // Assuming exchangeRates has structure like { USD: { selling: 34.50 }, ... }
    const rate = (exchangeRates as any)[currency]?.selling || 0;
    return rate;
  };

  // Initialize exchange rates when exchangeRates data loads or currencies change
  useEffect(() => {
    if (!exchangeRates) return;
    
    // Update sales exchange rate if it's 0 or currency is EUR (default)
    if (formData.sales_currency && formData.sales_currency !== "TRY") {
      const rate = getExchangeRate(formData.sales_currency);
      if (rate > 0 && (formData.sales_exchange_rate === 0 || formData.sales_currency === "EUR")) {
        setFormData(prev => ({ ...prev, sales_exchange_rate: rate }));
      }
    }
    
    // Update cost exchange rate if it's 0 or currency is EUR (default)
    if (formData.cost_currency && formData.cost_currency !== "TRY") {
      const rate = getExchangeRate(formData.cost_currency);
      if (rate > 0 && (formData.cost_exchange_rate === 0 || formData.cost_currency === "EUR")) {
        setFormData(prev => ({ ...prev, cost_exchange_rate: rate }));
      }
    }
  }, [exchangeRates, formData.sales_currency, formData.cost_currency]);

  // Update rates when currency changes
  const handleCurrencyChange = (type: "sales" | "cost", currency: string) => {
    const rate = getExchangeRate(currency);
    if (type === "sales") {
      setFormData(prev => ({ ...prev, sales_currency: currency, sales_exchange_rate: rate }));
    } else {
      setFormData(prev => ({ ...prev, cost_currency: currency, cost_exchange_rate: rate }));
    }
  };

  // Calculate profit in a base currency (e.g. TRY) then convert to Sales Currency for display
  const calculateProfit = () => {
    const salesRate = formData.sales_currency === "TRY" ? 1 : formData.sales_exchange_rate || getExchangeRate(formData.sales_currency);
    const costRate = formData.cost_currency === "TRY" ? 1 : formData.cost_exchange_rate || getExchangeRate(formData.cost_currency);

    const salesInTry = (formData.sales_price || 0) * salesRate;
    const costInTry = (formData.cost_price || 0) * costRate;
    const profitInTry = salesInTry - costInTry;

    // Convert back to sales currency for display
    if (salesRate === 0) return 0;
    return profitInTry / salesRate;
  };

  const addRouteStop = () => {
    const newStop: RouteStop = {
      id: Math.random().toString(),
      location_name: "",
      stop_type: "PICKUP",
      stop_order: routeStops.length + 1,
    };
    setRouteStops([...routeStops, newStop]);
  };

  const removeRouteStop = (id: string) => {
    setRouteStops(routeStops.filter((stop) => stop.id !== id));
  };

  const updateRouteStop = (
    id: string,
    field: keyof RouteStop,
    value: any
  ) => {
    setRouteStops(
      routeStops.map((stop) => (stop.id === id ? { ...stop, [field]: value } : stop))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Calculate estimated profit
      const estimatedProfit = calculateProfit();

      // Prepare exchange rates snapshot (including custom rates)
      const exchangeRatesSnapshot = {
        ...(exchangeRates ? {
        USD_TRY: exchangeRates.USD.selling,
        EUR_TRY: exchangeRates.EUR.selling,
        RUB_TRY: exchangeRates.RUB.selling,
        } : {}),
        sales_rate: formData.sales_exchange_rate,
        cost_rate: formData.cost_exchange_rate,
        snapshot_date: new Date().toISOString(),
      };

      // Create position data — supplier_ref_no is auto-generated by DB trigger
      const positionData = {
        customer_id: formData.customer_id,
        supplier_id: formData.supplier_id,
        loading_point: formData.loading_point,
        unloading_point: formData.unloading_point,
        cargo_description: formData.cargo_description,
        vehicle_plate: formData.vehicle_plate || null,
        sales_price: formData.sales_price,
        sales_currency: formData.sales_currency,
        sales_exchange_rate: formData.sales_exchange_rate,
        cost_price: formData.cost_price,
        cost_currency: formData.cost_currency,
        cost_exchange_rate: formData.cost_exchange_rate,
        estimated_profit: estimatedProfit,
        exchange_rates_snapshot: exchangeRatesSnapshot,
        status: "DRAFT",
      };

      const newPosition = await createPosition.mutateAsync(positionData);

      toast({
        title: "Pozisyon oluşturuldu!",
        description: `Pozisyon #${newPosition.position_no} başarıyla kaydedildi.`,
      });

      router.push(`/positions/${newPosition.id}`);
    } catch (error) {
      toast({
        title: "Hata!",
        description: translateSupabaseError(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link href="/positions">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
            Yeni Pozisyon Oluştur
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Operasyon kartı detaylarını girin ve kaydedin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-full">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form - Left Side */}
          <div className="space-y-6 lg:col-span-2 min-w-0">
            {/* Customer & Supplier */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Müşteri ve Tedarikçi Bilgileri</CardTitle>
                <CardDescription className="text-sm">
                  Pozisyon için müşteri ve tedarikçi seçin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="customer">Müşteri *</Label>
                    {customersLoading ? (
                      <div className="flex items-center justify-center h-10 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <Combobox
                        options={
                          customers?.map((customer) => ({
                            value: customer.id,
                            label: customer.company_name,
                          })) || []
                        }
                        value={formData.customer_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, customer_id: value })
                        }
                        placeholder="Müşteri seçin"
                        searchPlaceholder="Müşteri ara..."
                        emptyText="Müşteri bulunamadı."
                        className="w-full"
                      />
                    )}
                  </div>
                  <div className="space-y-2 min-w-0 w-full">
                    <Label htmlFor="supplier">Tedarikçi / Nakliyeci *</Label>
                    {suppliersLoading ? (
                      <div className="flex items-center justify-center h-10 border rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <Combobox
                        options={
                          suppliers?.map((supplier) => ({
                            value: supplier.id,
                            label: supplier.company_name,
                          })) || []
                        }
                        value={formData.supplier_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, supplier_id: value })
                        }
                        placeholder="Tedarikçi seçin"
                        searchPlaceholder="Tedarikçi ara..."
                        emptyText="Tedarikçi bulunamadı."
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Route Information */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Rota Bilgileri</CardTitle>
                <CardDescription className="text-sm">
                  Yükleme ve boşaltma noktalarını belirleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="min-w-0 w-full">
                    <CityAutocomplete
                      id="loading_point"
                      label="Yükleme Noktası *"
                      value={formData.loading_point}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          loading_point: value,
                        })
                      }
                      placeholder="Örn: İstanbul"
                      required
                    />
                  </div>
                  <div className="min-w-0 w-full">
                    <CityAutocomplete
                      id="unloading_point"
                      label="Boşaltma Noktası *"
                      value={formData.unloading_point}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          unloading_point: value,
                        })
                      }
                      placeholder="Örn: Berlin"
                      required
                    />
                  </div>
                </div>

                {/* Intermediate Stops */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <Label className="text-sm font-medium">Ara Duraklar (Opsiyonel)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRouteStop}
                      className="w-full sm:w-auto shrink-0"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Ara Durak Ekle
                    </Button>
                  </div>
                  <div className="space-y-2 max-w-full">
                    {routeStops.map((stop) => (
                      <div key={stop.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end w-full">
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          <CityAutocomplete
                            id={`route_stop_${stop.id}`}
                            label=""
                            value={stop.location_name || ""}
                            onChange={(value) =>
                              updateRouteStop(stop.id, "location_name", value)
                            }
                            placeholder="Durak yeri"
                          />
                        </div>
                        <div className="w-full sm:w-[160px] shrink-0">
                          <Select
                            value={stop.stop_type || "PICKUP"}
                            onValueChange={(value) =>
                              updateRouteStop(stop.id, "stop_type", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[100]">
                              <SelectItem value="PICKUP">Alım</SelectItem>
                              <SelectItem value="DROP">Bırakım</SelectItem>
                              <SelectItem value="CUSTOMS">Gümrük</SelectItem>
                              <SelectItem value="TRANSFER">Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRouteStop(stop.id)}
                          className="shrink-0 self-end sm:self-auto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cargo Information */}
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Yük ve Araç Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo_description">Yük Açıklaması</Label>
                  <Input
                    id="cargo_description"
                    placeholder="Örn: 24 Palet Tekstil Malzemesi"
                    value={formData.cargo_description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cargo_description: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_plate">Araç Plakası</Label>
                  <Input
                    id="vehicle_plate"
                    placeholder="Örn: 34 ABC 123"
                    value={formData.vehicle_plate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicle_plate: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full font-mono uppercase"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Information - Right Side */}
          <div className="space-y-6 lg:col-span-1 min-w-0">
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Finansal Bilgiler</CardTitle>
                <CardDescription className="text-sm">
                  Satış fiyatı ve maliyet bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible">
                {/* Sales Price */}
                <div className="space-y-2">
                  <Label className="text-sm">Satış Fiyatı (Navlun)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5 min-w-0">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.sales_price || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sales_price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-3 min-w-0">
                      <Select
                        value={formData.sales_currency || "EUR"}
                        onValueChange={(value) =>
                          handleCurrencyChange("sales", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-[100]">
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-4 min-w-0 w-full">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Kur"
                          value={formData.sales_exchange_rate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sales_exchange_rate: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={formData.sales_currency === "TRY"}
                          className="w-full pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                          ₺
                        </span>
                      </div>
                    </div>
                  </div>
                  {formData.sales_currency !== "TRY" && (
                    <p className="text-xs text-gray-500 break-words">
                      Otomatik Kur: {getExchangeRate(formData.sales_currency).toFixed(4)} ₺
                    </p>
                  )}
                </div>

                {/* Cost Price */}
                <div className="space-y-2">
                  <Label className="text-sm">Maliyet (Tedarikçi Ödemesi)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5 min-w-0">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.cost_price || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cost_price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="sm:col-span-3 min-w-0">
                      <Select
                        value={formData.cost_currency || "EUR"}
                        onValueChange={(value) =>
                          handleCurrencyChange("cost", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-[100]">
                          <SelectItem value="TRY">TRY</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="RUB">RUB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-4 min-w-0 w-full">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Kur"
                          value={formData.cost_exchange_rate || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cost_exchange_rate: parseFloat(e.target.value) || 0,
                            })
                          }
                          disabled={formData.cost_currency === "TRY"}
                          className="w-full pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                          ₺
                        </span>
                      </div>
                    </div>
                  </div>
                  {formData.cost_currency !== "TRY" && (
                    <p className="text-xs text-gray-500 break-words">
                      Otomatik Kur: {getExchangeRate(formData.cost_currency).toFixed(4)} ₺
                    </p>
                  )}
                </div>

                {/* Estimated Profit */}
                <div className="rounded-lg bg-green-50 p-4 overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-600">Tahmini Kar</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                        {calculateProfit().toFixed(2)} {formData.sales_currency}
                      </p>
                    </div>
                    {formData.sales_currency !== "TRY" && (
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-xs text-gray-500">TRY Karşılığı</p>
                        <p className="text-sm font-semibold text-green-700 break-words">
                          {(
                            calculateProfit() * 
                            (formData.sales_exchange_rate || getExchangeRate(formData.sales_currency))
                          ).toFixed(2)} ₺
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-red-200 bg-red-50 overflow-hidden">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={createPosition.isPending}
                  >
                    {createPosition.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Pozisyon Oluştur
                  </Button>
                  <Link href="/positions" className="block w-full">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                    >
                      İptal
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 text-xs text-gray-600 break-words">
                  * Pozisyon oluşturulduktan sonra otomatik olarak TASLAK
                  durumunda olacaktır. Belgeler yüklenene kadar yola
                  çıkarılamaz.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

