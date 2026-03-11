"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  DollarSign,
  Settings,
  TrendingUp,
  UserCog,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/use-user-profile";
import { ROLE_LABELS } from "@/lib/rbac";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    requiresFinance: false,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Pozisyonlar",
    href: "/positions",
    icon: Package,
    requiresFinance: false,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Müşteriler",
    href: "/customers",
    icon: Users,
    requiresFinance: false,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    icon: Truck,
    requiresFinance: false,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
    requiresFinance: false,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Finans",
    href: "/finance",
    icon: DollarSign,
    requiresFinance: true,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Raporlar",
    href: "/reports",
    icon: TrendingUp,
    requiresFinance: true,
    requiresSettings: false,
    requiresUserMgmt: false,
  },
  {
    name: "Ayarlar",
    href: "/settings",
    icon: Settings,
    requiresFinance: false,
    requiresSettings: true,
    requiresUserMgmt: false,
  },
  {
    name: "Kullanıcılar",
    href: "/settings/users",
    icon: UserCog,
    requiresFinance: false,
    requiresSettings: false,
    requiresUserMgmt: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const { permissions, role } = useUserProfile();

  const visibleNavigation = navigation.filter((item) => {
    if (item.requiresFinance && !permissions?.canViewFinance) return false;
    if (item.requiresSettings && !permissions?.canAccessSettings) return false;
    if (item.requiresUserMgmt && !permissions?.canManageUsers) return false;
    return true;
  });

  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-to-b from-logistics-red to-logistics-lightRed text-white shadow-xl">
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-center border-b border-white/10 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-wide">İrma Global</h1>
          <p className="text-xs text-white/70">Forwarding CRM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {visibleNavigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-logistics-red shadow-md font-semibold"
                  : "text-white/90 hover:bg-white/10 hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-logistics-red"
                    : "text-white/80 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Role Badge + Footer */}
      <div className="border-t border-white/10 p-4 space-y-2">
        {role && (
          <div className="flex justify-center">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white/90">
              {ROLE_LABELS[role]}
            </span>
          </div>
        )}
        <div className="text-center text-xs text-white/60">
          v1.0.0 | © {currentYear} İrma Global
        </div>
      </div>
    </div>
  );
}
