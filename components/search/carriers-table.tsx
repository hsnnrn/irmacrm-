"use client";

import { useState, useMemo, memo, useCallback } from "react";
import { CarrierLead } from "@/lib/lead-parser";
import { ExternalLink, Mail, Phone, ChevronLeft, ChevronRight, Search, Globe } from "lucide-react";

const TRANSPORT_MODE_STYLES: Record<string, string> = {
  ROAD: "bg-emerald-100 text-emerald-700 border-emerald-200",
  SEA: "bg-blue-100 text-blue-700 border-blue-200",
  AIR: "bg-sky-100 text-sky-700 border-sky-200",
  RAIL: "bg-amber-100 text-amber-700 border-amber-200",
  MULTIMODAL: "bg-violet-100 text-violet-700 border-violet-200",
};

const SPECIAL_SERVICE_STYLES: Record<string, string> = {
  REFRIGERATED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  HAZMAT: "bg-red-100 text-red-700 border-red-200",
  OVERSIZE: "bg-orange-100 text-orange-700 border-orange-200",
  STANDARD: "bg-gray-100 text-gray-600 border-gray-200",
};

const TagBadge = memo(function TagBadge({
  label,
  styleMap,
  fallback,
}: {
  label: string;
  styleMap: Record<string, string>;
  fallback: string;
}) {
  const cls = styleMap[label.toUpperCase()] ?? fallback;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
});

const TagList = memo(function TagList({
  items,
  styleMap,
  fallback,
  empty = "—",
}: {
  items: string[];
  styleMap: Record<string, string>;
  fallback: string;
  empty?: string;
}) {
  if (!items || items.length === 0) return <span className="text-gray-400">{empty}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <TagBadge key={i} label={item} styleMap={styleMap} fallback={fallback} />
      ))}
    </div>
  );
});

const ContactCell = memo(function ContactCell({ email, phone }: { email: string; phone: string }) {
  const hasEmail = !!email;
  const hasPhone = !!phone;
  if (!hasEmail && !hasPhone) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      {hasEmail && (
        <a href={`mailto:${email}`} className="text-blue-600 hover:underline flex items-center gap-1 text-xs">
          <Mail className="h-3 w-3 flex-shrink-0" />
          <span className="truncate max-w-[160px]">{email}</span>
        </a>
      )}
      {hasPhone && (
        <a href={`tel:${phone}`} className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-xs">
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span>{phone}</span>
        </a>
      )}
    </div>
  );
});

const CarrierRow = memo(function CarrierRow({ c }: { c: CarrierLead }) {
  return (
    <tr className="hover:bg-emerald-50/30 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.company_name || "—"}</td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.city || "—"}</td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
        {c.route_focus || <span className="text-gray-400">—</span>}
      </td>
      <td className="px-4 py-3 max-w-[200px]">
        <TagList
          items={c.transport_modes}
          styleMap={TRANSPORT_MODE_STYLES}
          fallback="bg-slate-100 text-slate-600 border-slate-200"
        />
      </td>
      <td className="px-4 py-3 max-w-[220px]">
        <TagList
          items={c.special_services}
          styleMap={SPECIAL_SERVICE_STYLES}
          fallback="bg-slate-100 text-slate-600 border-slate-200"
        />
      </td>
      <td className="px-4 py-3">
        <ContactCell email={c.email} phone={c.phone} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          {c.website ? (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs whitespace-nowrap">
              <Globe className="h-3.5 w-3.5" /> Web
            </a>
          ) : null}
          {c.source ? (
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1 whitespace-nowrap text-xs">
              <ExternalLink className="h-3.5 w-3.5" /> Kaynak
            </a>
          ) : null}
          {!c.website && !c.source && <span className="text-gray-400">—</span>}
        </div>
      </td>
    </tr>
  );
});

const PAGE_SIZE = 15;

interface CarriersTableProps {
  carriers: CarrierLead[];
}

export function CarriersTable({ carriers }: CarriersTableProps) {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const allModes = useMemo(() => {
    const set = new Set<string>();
    carriers.forEach((c) => c.transport_modes.forEach((m) => set.add(m.toUpperCase())));
    return ["ALL", ...Array.from(set).sort()];
  }, [carriers]);

  const allServices = useMemo(() => {
    const set = new Set<string>();
    carriers.forEach((c) => c.special_services.forEach((s) => set.add(s.toUpperCase())));
    return ["ALL", ...Array.from(set).sort()];
  }, [carriers]);

  const filtered = useMemo(() => {
    let list = carriers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.route_focus.toLowerCase().includes(q)
      );
    }
    if (modeFilter !== "ALL")
      list = list.filter((c) => c.transport_modes.some((m) => m.toUpperCase() === modeFilter));
    if (serviceFilter !== "ALL")
      list = list.filter((c) => c.special_services.some((s) => s.toUpperCase() === serviceFilter));
    return [...list].sort((a, b) => {
      const cmp = a.company_name.localeCompare(b.company_name);
      return sortAsc ? cmp : -cmp;
    });
  }, [carriers, search, modeFilter, serviceFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);
  const handleMode = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setModeFilter(e.target.value);
    setPage(1);
  }, []);
  const handleService = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setServiceFilter(e.target.value);
    setPage(1);
  }, []);
  const handlePage = useCallback((p: number) => setPage(Math.min(Math.max(1, p), totalPages)), [totalPages]);

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Firma, şehir veya rota ara..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={modeFilter}
          onChange={handleMode}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {allModes.map((m) => (
            <option key={m} value={m}>{m === "ALL" ? "Tüm Taşıma Modları" : m}</option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={handleService}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {allServices.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? "Tüm Özel Hizmetler" : s}</option>
          ))}
        </select>
        <button
          onClick={() => setSortAsc((v) => !v)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition"
        >
          Firma {sortAsc ? "A→Z" : "Z→A"}
        </button>
        <span className="ml-auto text-sm text-gray-400">{filtered.length} kayıt</span>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {[
                "Firma",
                "Şehir",
                "Ana Rota",
                "Taşıma Modları",
                "Özel Hizmetler",
                "İletişim",
                "Bağlantılar",
              ].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  Nakliyeci bulunamadı.
                </td>
              </tr>
            ) : (
              paginated.map((c, i) => <CarrierRow key={`${c.company_name}-${i}`} c={c} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-gray-400">
            Sayfa {page} / {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handlePage(page - 1)}
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
                  onClick={() => handlePage(p)}
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
              onClick={() => handlePage(page + 1)}
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
