"use client";

import { useState, useMemo, memo, useCallback } from "react";
import { ShipperLead } from "@/lib/lead-parser";
import { ExternalLink, Mail, Phone, ChevronLeft, ChevronRight, Search, Globe } from "lucide-react";

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
  europe: "🇪🇺",
  sweden: "🇸🇪",
  uk: "🇬🇧",
  "united kingdom": "🇬🇧",
  "united states": "🇺🇸",
  usa: "🇺🇸",
  russia: "🇷🇺",
  ukraine: "🇺🇦",
  georgia: "🇬🇪",
  azerbaijan: "🇦🇿",
  iran: "🇮🇷",
};

function getFlag(name: string): string {
  return COUNTRY_FLAGS[name.toLowerCase()] ?? "";
}

const TRANSPORT_NEED_STYLES: Record<string, string> = {
  ROAD: "bg-emerald-100 text-emerald-700 border-emerald-200",
  SEA: "bg-blue-100 text-blue-700 border-blue-200",
  AIR: "bg-sky-100 text-sky-700 border-sky-200",
  RAIL: "bg-amber-100 text-amber-700 border-amber-200",
  MULTIMODAL: "bg-violet-100 text-violet-700 border-violet-200",
};

const DestinationBadge = memo(function DestinationBadge({ dest }: { dest: string }) {
  const flag = getFlag(dest);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap">
      {flag && <span>{flag}</span>}
      {dest}
    </span>
  );
});

const TransportNeedBadge = memo(function TransportNeedBadge({ mode }: { mode: string }) {
  const cls = TRANSPORT_NEED_STYLES[mode.toUpperCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {mode}
    </span>
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

const ShipperRow = memo(function ShipperRow({ s }: { s: ShipperLead }) {
  return (
    <tr className="hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{s.company_name || "—"}</td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.city || "—"}</td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
        {s.cargo_type || <span className="text-gray-400">—</span>}
      </td>
      <td className="px-4 py-3 max-w-[240px]">
        {s.export_destinations.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {s.export_destinations.map((d, i) => (
              <DestinationBadge key={i} dest={d} />
            ))}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 max-w-[180px]">
        {s.transport_needs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {s.transport_needs.map((m, i) => (
              <TransportNeedBadge key={i} mode={m} />
            ))}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <ContactCell email={s.email} phone={s.phone} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          {s.website ? (
            <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs whitespace-nowrap">
              <Globe className="h-3.5 w-3.5" /> Web
            </a>
          ) : null}
          {s.source ? (
            <a href={s.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap text-xs">
              <ExternalLink className="h-3.5 w-3.5" /> Kaynak
            </a>
          ) : null}
          {!s.website && !s.source && <span className="text-gray-400">—</span>}
        </div>
      </td>
    </tr>
  );
});

const PAGE_SIZE = 15;

interface ShippersTableProps {
  shippers: ShipperLead[];
}

export function ShippersTable({ shippers }: ShippersTableProps) {
  const [search, setSearch] = useState("");
  const [destFilter, setDestFilter] = useState("ALL");
  const [needFilter, setNeedFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const allDestinations = useMemo(() => {
    const set = new Set<string>();
    shippers.forEach((s) => s.export_destinations.forEach((d) => set.add(d)));
    return ["ALL", ...Array.from(set).sort()];
  }, [shippers]);

  const allNeeds = useMemo(() => {
    const set = new Set<string>();
    shippers.forEach((s) => s.transport_needs.forEach((n) => set.add(n.toUpperCase())));
    return ["ALL", ...Array.from(set).sort()];
  }, [shippers]);

  const filtered = useMemo(() => {
    let list = shippers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.company_name.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.cargo_type.toLowerCase().includes(q)
      );
    }
    if (destFilter !== "ALL")
      list = list.filter((s) => s.export_destinations.includes(destFilter));
    if (needFilter !== "ALL")
      list = list.filter((s) => s.transport_needs.some((n) => n.toUpperCase() === needFilter));
    return [...list].sort((a, b) => {
      const cmp = a.company_name.localeCompare(b.company_name);
      return sortAsc ? cmp : -cmp;
    });
  }, [shippers, search, destFilter, needFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);
  const handleDest = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDestFilter(e.target.value);
    setPage(1);
  }, []);
  const handleNeed = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setNeedFilter(e.target.value);
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
            placeholder="Firma, şehir veya yük ara..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={destFilter}
          onChange={handleDest}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {allDestinations.map((d) => (
            <option key={d} value={d}>{d === "ALL" ? "Tüm İhracat Hedefleri" : d}</option>
          ))}
        </select>
        <select
          value={needFilter}
          onChange={handleNeed}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {allNeeds.map((n) => (
            <option key={n} value={n}>{n === "ALL" ? "Tüm Taşıma İhtiyaçları" : n}</option>
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
                "Yük Tipi",
                "İhracat Hedefleri",
                "Taşıma İhtiyacı",
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
                  Gönderi firması bulunamadı.
                </td>
              </tr>
            ) : (
              paginated.map((s, i) => <ShipperRow key={`${s.company_name}-${i}`} s={s} />)
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
                      ? "bg-blue-600 text-white border-blue-600"
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
