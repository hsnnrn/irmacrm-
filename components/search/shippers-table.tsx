"use client";

import { useState, useMemo, memo, useCallback } from "react";
import { ShipperLead } from "@/lib/lead-parser";
import { ExternalLink, Mail, Phone, ChevronLeft, ChevronRight, Search } from "lucide-react";

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  EU_EXPORTER: { label: "EU İhracatçı", className: "bg-blue-100 text-blue-700 border-blue-200" },
  GLOBAL_EXPORTER: { label: "Global İhracatçı", className: "bg-violet-100 text-violet-700 border-violet-200" },
  LOCAL: { label: "Yerel", className: "bg-gray-100 text-gray-700 border-gray-200" },
  REGIONAL: { label: "Bölgesel", className: "bg-amber-100 text-amber-700 border-amber-200" },
};

const CategoryBadge = memo(function CategoryBadge({ category }: { category: string }) {
  const key = category?.toUpperCase();
  const style = CATEGORY_STYLES[key] ?? {
    label: category || "—",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.className}`}>
      {style.label}
    </span>
  );
});

const ContactCell = memo(function ContactCell({ email, phone }: { email: string; phone: string }) {
  const hasEmail = email && email !== "unknown";
  const hasPhone = phone && phone !== "unknown";
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
      <td className="px-4 py-3 text-gray-600">{s.cargo_type || "—"}</td>
      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.country || "—"}</td>
      <td className="px-4 py-3 text-gray-600">{s.city || "—"}</td>
      <td className="px-4 py-3 text-gray-600">{s.region || "—"}</td>
      <td className="px-4 py-3">
        <CategoryBadge category={s.category} />
      </td>
      <td className="px-4 py-3">
        <ContactCell email={s.email} phone={s.phone} />
      </td>
      <td className="px-4 py-3">
        {s.source ? (
          <a href={s.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 whitespace-nowrap text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> Link
          </a>
        ) : "—"}
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
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set(shippers.map((s) => s.category?.toUpperCase()).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [shippers]);

  const countries = useMemo(() => {
    const set = new Set(shippers.map((s) => s.country).filter(Boolean));
    return ["ALL", ...Array.from(set).sort()];
  }, [shippers]);

  const filtered = useMemo(() => {
    let list = shippers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.company_name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "ALL")
      list = list.filter((s) => s.category?.toUpperCase() === categoryFilter);
    if (countryFilter !== "ALL")
      list = list.filter((s) => s.country === countryFilter);
    return [...list].sort((a, b) => {
      const cmp = a.company_name.localeCompare(b.company_name);
      return sortAsc ? cmp : -cmp;
    });
  }, [shippers, search, categoryFilter, countryFilter, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);
  const handleCategory = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  }, []);
  const handleCountry = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountryFilter(e.target.value);
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
            placeholder="Firma ara..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={handleCategory}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "Tüm Kategoriler" : c}</option>
          ))}
        </select>
        <select
          value={countryFilter}
          onChange={handleCountry}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c === "ALL" ? "Tüm Ülkeler" : c}</option>
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
                "Yük Tipi",
                "Ülke",
                "Şehir",
                "Bölge",
                "Kategori",
                "İletişim",
                "Kaynak",
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
                <td colSpan={8} className="text-center py-10 text-gray-400">
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
