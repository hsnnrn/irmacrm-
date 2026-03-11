"use client";

import { useState, useMemo } from "react";
import { CarrierLead } from "@/lib/lead-parser";
import { ExternalLink, Mail, ChevronLeft, ChevronRight, Search } from "lucide-react";

const COUNTRY_FLAGS: Record<string, string> = {
  turkey: "🇹🇷",
  germany: "🇩🇪",
  france: "🇫🇷",
  netherlands: "🇳🇱",
  belgium: "🇧🇪",
  austria: "🇦🇹",
  italy: "🇮🇹",
  spain: "🇪🇸",
  poland: "🇵🇱",
  romania: "🇷🇴",
  bulgaria: "🇧🇬",
  greece: "🇬🇷",
  hungary: "🇭🇺",
  czechia: "🇨🇿",
  slovakia: "🇸🇰",
  sweden: "🇸🇪",
  uk: "🇬🇧",
  "united kingdom": "🇬🇧",
  russia: "🇷🇺",
  ukraine: "🇺🇦",
  georgia: "🇬🇪",
  azerbaijan: "🇦🇿",
  iran: "🇮🇷",
};

function getFlag(countryName: string): string {
  return COUNTRY_FLAGS[countryName.toLowerCase()] ?? "🏳";
}

function parseRoute(scope: string): { from: string; to: string } | null {
  const sep = scope.includes("→") ? "→" : scope.includes("->") ? "->" : scope.includes("-") ? "-" : null;
  if (!sep) return null;
  const [from, to] = scope.split(sep).map((s) => s.trim());
  if (!from || !to) return null;
  return { from, to };
}

function RouteBadge({ scope }: { scope: string }) {
  if (!scope) return <span className="text-gray-400">—</span>;
  const routes = scope.split(",").map((r) => r.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1">
      {routes.map((r, i) => {
        const parsed = parseRoute(r);
        if (!parsed) return (
          <span key={i} className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
            {r}
          </span>
        );
        return (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
            {getFlag(parsed.from)} {parsed.from} → {getFlag(parsed.to)} {parsed.to}
          </span>
        );
      })}
    </div>
  );
}

const CATEGORY_STYLES: Record<string, string> = {
  TR_EU: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EU_CARRIER: "bg-blue-100 text-blue-700 border-blue-200",
  LOCAL: "bg-gray-100 text-gray-700 border-gray-200",
  INTERNATIONAL: "bg-violet-100 text-violet-700 border-violet-200",
};

function CategoryBadge({ category }: { category: string }) {
  const key = category?.toUpperCase();
  const cls = CATEGORY_STYLES[key] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {category || "—"}
    </span>
  );
}

const PAGE_SIZE = 10;

interface CarriersTableProps {
  carriers: CarrierLead[];
}

export function CarriersTable({ carriers }: CarriersTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set(carriers.map((c) => c.category?.toUpperCase()).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [carriers]);

  const countries = useMemo(() => {
    const set = new Set(carriers.map((c) => c.country).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [carriers]);

  const filtered = useMemo(() => {
    let list = carriers;
    if (search)
      list = list.filter((c) =>
        c.company_name.toLowerCase().includes(search.toLowerCase())
      );
    if (categoryFilter !== "ALL")
      list = list.filter((c) => c.category?.toUpperCase() === categoryFilter);
    if (countryFilter !== "ALL")
      list = list.filter((c) => c.country === countryFilter);
    list = [...list].sort((a, b) => {
      const cmp = a.company_name.localeCompare(b.company_name);
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [carriers, search, categoryFilter, countryFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handlePageChange = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "All Countries" : c}</option>
          ))}
        </select>
        <button
          onClick={() => setSortAsc((v) => !v)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition"
        >
          Company {sortAsc ? "A→Z" : "Z→A"}
        </button>
        <span className="ml-auto text-sm text-gray-400">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["Company", "Transport Scope", "Country", "City", "Region", "Category", "Contact", "Source"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">No carriers found.</td>
              </tr>
            ) : (
              paginated.map((c, i) => (
                <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.company_name || "—"}</td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <RouteBadge scope={c.transport_scope} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.country || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.city || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.region || "—"}</td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={c.category} />
                  </td>
                  <td className="px-4 py-3">
                    {c.contact ? (
                      c.contact.includes("@") ? (
                        <a href={`mailto:${c.contact}`} className="text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />{c.contact}
                        </a>
                      ) : (
                        <span className="text-gray-600">{c.contact}</span>
                      )
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.source ? (
                      <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap">
                        <ExternalLink className="h-3.5 w-3.5" /> Link
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + idx;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                    p === page
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
