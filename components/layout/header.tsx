"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, User, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { formatExchangeRate } from "@/lib/exchange-rates";
import { TCMBRatesDialog } from "@/components/business/tcmb-rates-dialog";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { data: rates, isLoading: ratesLoading } = useExchangeRates();
  const { signOut } = useAuth();
  const [tcmbDialogOpen, setTcmbDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Lojistik Yönetim Paneli
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Exchange Rates */}
            <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-red-50 to-green-50 px-4 py-2 border border-red-200">
              <TrendingUp className="h-4 w-4 text-red-600" />
              {ratesLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
              ) : rates ? (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">USD:</span>
                    <span className="font-mono text-green-600">
                      {formatExchangeRate(rates.USD.selling)}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">EUR:</span>
                    <span className="font-mono text-green-600">
                      {formatExchangeRate(rates.EUR.selling)}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">RUB:</span>
                    <span className="font-mono text-green-600">
                      {formatExchangeRate(rates.RUB.selling)}
                    </span>
                  </div>
                  {rates.source === 'TCMB' && (
                    <>
                      <div className="h-4 w-px bg-gray-300" />
                      <button
                        onClick={() => setTcmbDialogOpen(true)}
                        className="text-xs text-red-600 font-medium hover:text-red-800 hover:underline cursor-pointer transition-colors"
                        title="Tüm TCMB kurlarını görüntüle"
                      >
                        TCMB
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-xs text-red-600">Kur servisi bağlanıyor...</span>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profil & Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => signOut()}
                >
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* TCMB Rates Dialog */}
      <TCMBRatesDialog
        open={tcmbDialogOpen}
        onOpenChange={setTcmbDialogOpen}
      />
    </>
  );
}

