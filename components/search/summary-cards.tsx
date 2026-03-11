"use client";

import { Building2, Truck, Globe, Route, Sparkles } from "lucide-react";
import { ParsedLeads } from "@/lib/lead-parser";

interface SummaryCardsProps {
  data: ParsedLeads;
  lastUpdated: Date | null;
}

interface CardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`${bgColor} rounded-xl p-3 flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function SummaryCards({ data, lastUpdated }: SummaryCardsProps) {
  const euExporters = data.shippers.filter(
    (s) => s.category?.toUpperCase() === "EU_EXPORTER"
  ).length;

  const trEuCarriers = data.carriers.filter((c) =>
    c.category?.toUpperCase().includes("TR_EU")
  ).length;

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const newlyDiscovered = data.all.length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Shippers"
          value={data.shippers.length}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Total Carriers"
          value={data.carriers.length}
          icon={<Truck className="h-5 w-5 text-emerald-600" />}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="EU Exporters"
          value={euExporters}
          icon={<Globe className="h-5 w-5 text-violet-600" />}
          color="text-violet-600"
          bgColor="bg-violet-50"
        />
        <StatCard
          label="TR-EU Carriers"
          value={trEuCarriers}
          icon={<Route className="h-5 w-5 text-orange-600" />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="Newly Discovered"
          value={newlyDiscovered}
          icon={<Sparkles className="h-5 w-5 text-rose-600" />}
          color="text-rose-600"
          bgColor="bg-rose-50"
        />
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-400 text-right">
          Last refreshed: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
