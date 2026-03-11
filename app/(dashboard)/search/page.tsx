"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { parseLeads, ParsedLeads } from "@/lib/lead-parser";
import { SummaryCards } from "@/components/search/summary-cards";
import { ShippersTable } from "@/components/search/shippers-table";
import { CarriersTable } from "@/components/search/carriers-table";
import { Loader2, RefreshCw, Building2, Truck, Map } from "lucide-react";

const MapView = dynamic(
  () => import("@/components/search/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => <div className="h-[520px] flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-gray-100">Loading map...</div> }
);

const EMPTY_DATA: ParsedLeads = { shippers: [], carriers: [], all: [] };
const REFRESH_INTERVAL_MS = 60_000;

type Tab = "shippers" | "carriers" | "map";

export default function SearchPage() {
  const [data, setData] = useState<ParsedLeads>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("shippers");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("http://127.0.0.1:3050/api/leads");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseLeads(text);
      setData(parsed);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch leads");
      setData(EMPTY_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    intervalRef.current = setInterval(fetchLeads, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLeads]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "shippers",
      label: "Shippers",
      icon: <Building2 className="h-4 w-4" />,
      count: data.shippers.length,
    },
    {
      id: "carriers",
      label: "Carriers",
      icon: <Truck className="h-4 w-4" />,
      count: data.carriers.length,
    },
    {
      id: "map",
      label: "Map View",
      icon: <Map className="h-4 w-4" />,
    },
  ];

  const isEmpty = !loading && data.all.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SEARCH</h1>
          <p className="text-sm text-gray-500 mt-1">AI Discovered Shippers &amp; Carriers</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchLeads(); }}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={data} lastUpdated={lastUpdated} />

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm">Fetching intelligence data...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-sm text-red-600 font-medium">Failed to connect to AI agent: {error}</p>
          <p className="text-xs text-red-400 mt-1">Auto-retry in {REFRESH_INTERVAL_MS / 1000}s</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-20 text-center">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <Building2 className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No data found yet.</p>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            AI agent is still researching potential logistics companies.
          </p>
        </div>
      )}

      {/* Tabs + Content */}
      {!loading && !isEmpty && (
        <div className="space-y-4">
          {/* Tab Bar */}
          <div className="flex gap-1 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div>
            {activeTab === "shippers" && <ShippersTable shippers={data.shippers} />}
            {activeTab === "carriers" && <CarriersTable carriers={data.carriers} />}
            {activeTab === "map" && <MapView data={data} />}
          </div>
        </div>
      )}
    </div>
  );
}
