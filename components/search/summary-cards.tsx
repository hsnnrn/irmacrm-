"use client";

import { memo } from "react";
import { Building2, Truck, Globe, Snowflake, Sparkles } from "lucide-react";
import { ParsedLeads } from "@/lib/lead-parser";

interface SummaryCardsProps {
  data: ParsedLeads;
  lastUpdated: Date | null;
}

interface CardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}

const StatCard = memo(function StatCard({ label, value, icon, bgColor }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`${bgColor} rounded-xl p-3 flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
});

export const SummaryCards = memo(function SummaryCards({ data, lastUpdated }: SummaryCardsProps) {
  const euShippers = data.shippers.filter((s) =>
    s.export_destinations.some((d) =>
      ["europe", "germany", "netherlands", "france", "belgium", "austria", "italy", "spain", "poland"]
        .includes(d.toLowerCase())
    )
  ).length;

  const frigCarriers = data.carriers.filter((c) =>
    c.special_services.some((s) => s.toUpperCase() === "REFRIGERATED")
  ).length;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Toplam Gönderi"
          value={data.shippers.length}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Toplam Nakliyeci"
          value={data.carriers.length}
          icon={<Truck className="h-5 w-5 text-emerald-600" />}
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Avrupa İhracatçısı"
          value={euShippers}
          icon={<Globe className="h-5 w-5 text-violet-600" />}
          bgColor="bg-violet-50"
        />
        <StatCard
          label="Frigofirik Nakliyeci"
          value={frigCarriers}
          icon={<Snowflake className="h-5 w-5 text-cyan-600" />}
          bgColor="bg-cyan-50"
        />
        <StatCard
          label="Toplam Keşfedilen"
          value={data.all.length}
          icon={<Sparkles className="h-5 w-5 text-rose-600" />}
          bgColor="bg-rose-50"
        />
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-400 text-right">
          Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
        </p>
      )}
    </div>
  );
});
