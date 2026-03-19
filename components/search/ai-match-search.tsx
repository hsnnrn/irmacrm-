"use client";

import { useState, useCallback, useRef } from "react";
import {
  Sparkles, Search, Loader2, Mail, Phone, ExternalLink,
  Globe, X, AlertCircle, ChevronDown, ChevronUp, Brain,
  Truck, Building2, MapPin, Calendar, Package, Route,
  ShieldCheck, Snowflake, Flame, Maximize2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CompanyData {
  type?: "SHIPPER" | "CARRIER" | string;
  company_name?: string;
  country?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  source?: string;
  added_at?: string;
  // Carrier
  transport_modes?: string[];
  special_services?: string[];
  route_focus?: string;
  vehicle_types?: string[];
  customs_clearance?: boolean;
  // Shipper
  cargo_type?: string;
  export_destinations?: string[];
  transport_needs?: string[];
  // Catch-all for any extra fields
  [key: string]: unknown;
}

interface MatchResult {
  match_score?: number;
  match_reason?: string;
  company_data?: CompanyData;
  // Backward compat: flat structure
  type?: string;
  company_name?: string;
  score?: number;
  [key: string]: unknown;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "CARRIER", label: "Nakliyeci" },
  { value: "SHIPPER", label: "Gönderi" },
];

const SUGGESTIONS = [
  "Almanya'ya donuk gıda taşıyacak frigo tır",
  "Tekstil ihracatı yapan İstanbul firması",
  "Avrupa rotasında tehlikeli madde taşıyan nakliyeci",
  "Gaziantep'ten tekstil gönderecek müşteri",
];

const TRANSPORT_MODE_COLORS: Record<string, string> = {
  ROAD: "bg-emerald-100 text-emerald-700 border-emerald-200",
  SEA: "bg-blue-100 text-blue-700 border-blue-200",
  AIR: "bg-sky-100 text-sky-700 border-sky-200",
  RAIL: "bg-amber-100 text-amber-700 border-amber-200",
  MULTIMODAL: "bg-violet-100 text-violet-700 border-violet-200",
};

const SPECIAL_SERVICE_COLORS: Record<string, string> = {
  REFRIGERATED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  HAZMAT: "bg-red-100 text-red-700 border-red-200",
  OVERSIZE: "bg-orange-100 text-orange-700 border-orange-200",
  STANDARD: "bg-gray-100 text-gray-600 border-gray-200",
};

// Human-readable labels for known fields
const FIELD_LABELS: Record<string, string> = {
  country: "Ülke",
  city: "Şehir",
  email: "E-posta",
  phone: "Telefon",
  website: "Web Sitesi",
  source: "Kaynak",
  added_at: "Eklenme Tarihi",
  route_focus: "Ana Rota",
  cargo_type: "Yük Tipi",
  customs_clearance: "Gümrükleme",
  vehicle_types: "Araç Tipleri",
  transport_modes: "Taşıma Modları",
  special_services: "Özel Hizmetler",
  export_destinations: "İhracat Hedefleri",
  transport_needs: "Taşıma İhtiyacı",
};

// Fields rendered in the header / dedicated sections — skip in generic grid
const SKIP_IN_GRID = new Set([
  "type", "company_name", "email", "phone", "website", "source",
  "transport_modes", "special_services", "export_destinations",
  "transport_needs", "vehicle_types",
]);

// ─── Small helpers ────────────────────────────────────────────────────────────

function Tag({ label, colorMap, fallback }: { label: string; colorMap: Record<string, string>; fallback: string }) {
  const cls = colorMap[label.toUpperCase()] ?? fallback;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function TagList({ items, colorMap, fallback }: { items: string[]; colorMap: Record<string, string>; fallback: string }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => <Tag key={i} label={item} colorMap={colorMap} fallback={fallback} />)}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 300 ? "bg-emerald-500" :
    score >= 200 ? "bg-blue-500" :
    score >= 100 ? "bg-amber-500" :
    "bg-gray-400";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(100, (score / 400) * 100)}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums ${
        score >= 300 ? "text-emerald-600" : score >= 200 ? "text-blue-600" : "text-amber-600"
      }`}>
        {score}
      </span>
    </div>
  );
}

function formatFieldValue(key: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${value ? "text-emerald-600" : "text-red-500"}`}>
        {value ? <ShieldCheck className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {value ? "Evet" : "Hayır"}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-xs font-medium">
            {String(v)}
          </span>
        ))}
      </div>
    );
  }

  if (key === "added_at") {
    const d = new Date(String(value));
    if (!isNaN(d.getTime())) {
      return <span className="text-xs text-gray-600">{d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</span>;
    }
  }

  if ((key === "source" || key === "website") && typeof value === "string" && value.startsWith("http")) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate max-w-[200px]">
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
        {value.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
      </a>
    );
  }

  return <span className="text-xs text-gray-700">{String(value)}</span>;
}

// ─── Main Card ────────────────────────────────────────────────────────────────

function MatchCard({ result, rank }: { result: MatchResult; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  // Normalise: support both new { match_score, company_data } and old flat shape
  const data: CompanyData = result.company_data ?? (result as CompanyData);
  const score = result.match_score ?? (typeof result.score === "number" ? result.score : undefined);
  const reason = result.match_reason;
  const type = (data.type ?? "").toUpperCase();
  const isCarrier = type === "CARRIER";

  const accentBorder = isCarrier ? "border-emerald-200" : "border-blue-200";
  const accentBg = isCarrier ? "bg-emerald-50" : "bg-blue-50";
  const typeBadge = isCarrier
    ? "bg-emerald-100 text-emerald-700"
    : "bg-blue-100 text-blue-700";

  // Extra/unknown fields for the generic grid
  const extraEntries = Object.entries(data).filter(([k, v]) => {
    if (SKIP_IN_GRID.has(k)) return false;
    if (v === null || v === undefined || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });

  return (
    <div className={`rounded-2xl border ${accentBorder} bg-white shadow-sm overflow-hidden`}>
      {/* ── Header ── */}
      <div className={`${accentBg} px-5 pt-4 pb-3`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-lg p-2 ${isCarrier ? "bg-emerald-100" : "bg-blue-100"}`}>
            {isCarrier
              ? <Truck className="h-4 w-4 text-emerald-700" />
              : <Building2 className="h-4 w-4 text-blue-700" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${typeBadge}`}>
                {isCarrier ? "NAKLİYECİ" : "GÖNDERİ"}
              </span>
              <span className="text-xs text-gray-400 font-medium">#{rank}</span>
            </div>
            <h3 className="mt-1 text-base font-bold text-gray-900 leading-tight">
              {data.company_name || "—"}
            </h3>
            {(data.city || data.country) && (
              <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {[data.city, data.country].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
          {score !== undefined && (
            <div className="flex-shrink-0 text-right">
              <p className="text-xs text-gray-400 font-medium mb-1">Eşleşme Puanı</p>
              <ScoreBar score={score} />
            </div>
          )}
        </div>
      </div>

      {/* ── AI Reason ── */}
      {reason && (
        <div className="mx-4 mt-3 rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3 flex gap-2">
          <Brain className="h-4 w-4 text-violet-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-violet-800 leading-relaxed">{reason}</p>
        </div>
      )}

      {/* ── Key Details ── */}
      <div className="px-5 py-4 space-y-3">
        {/* Transport Modes / Transport Needs */}
        {isCarrier && data.transport_modes && data.transport_modes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">Taşıma Modları</span>
            <TagList items={data.transport_modes} colorMap={TRANSPORT_MODE_COLORS} fallback="bg-slate-100 text-slate-600 border-slate-200" />
          </div>
        )}
        {!isCarrier && data.transport_needs && data.transport_needs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">Taşıma İhtiyacı</span>
            <TagList items={data.transport_needs} colorMap={TRANSPORT_MODE_COLORS} fallback="bg-slate-100 text-slate-600 border-slate-200" />
          </div>
        )}

        {/* Special Services */}
        {isCarrier && data.special_services && data.special_services.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">Özel Hizmetler</span>
            <TagList items={data.special_services} colorMap={SPECIAL_SERVICE_COLORS} fallback="bg-slate-100 text-slate-600 border-slate-200" />
          </div>
        )}

        {/* Export Destinations */}
        {!isCarrier && data.export_destinations && data.export_destinations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">İhracat Hedefi</span>
            <div className="flex flex-wrap gap-1">
              {data.export_destinations.map((d, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-medium">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle Types */}
        {data.vehicle_types && data.vehicle_types.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 w-28 flex-shrink-0">Araç Tipleri</span>
            <TagList items={data.vehicle_types} colorMap={{}} fallback="bg-slate-100 text-slate-600 border-slate-200" />
          </div>
        )}

        {/* Expandable: extra fields */}
        {extraEntries.length > 0 && (
          <>
            {expanded && (
              <div className="pt-2 border-t border-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {extraEntries.map(([key, value]) => {
                  const rendered = formatFieldValue(key, value);
                  if (!rendered) return null;
                  return (
                    <div key={key} className="space-y-0.5">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {FIELD_LABELS[key] ?? key.replace(/_/g, " ")}
                      </p>
                      {rendered}
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition mt-1"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Daha az göster" : `${extraEntries.length} alan daha`}
            </button>
          </>
        )}
      </div>

      {/* ── Contact Footer ── */}
      <div className="px-5 pb-4 pt-0 flex flex-wrap items-center gap-4 border-t border-gray-50">
        {data.email && (
          <a href={`mailto:${data.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline truncate max-w-[200px]">
            <Mail className="h-3 w-3 flex-shrink-0" /> {data.email}
          </a>
        )}
        {data.phone && (
          <a href={`tel:${data.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800">
            <Phone className="h-3 w-3 flex-shrink-0" /> {data.phone}
          </a>
        )}
        {data.website && (
          <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Globe className="h-3 w-3 flex-shrink-0" /> Web
          </a>
        )}
        {data.source && (
          <a href={data.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-400 hover:underline">
            <ExternalLink className="h-3 w-3 flex-shrink-0" /> Kaynak
          </a>
        )}
        {data.added_at && (
          <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            {(() => {
              const d = new Date(data.added_at);
              return isNaN(d.getTime())
                ? data.added_at
                : d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
            })()}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AiMatchSearch() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [limit, setLimit] = useState("5");
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = new URLSearchParams({ q: searchQuery });
      if (type) params.set("type", type);
      if (limit) params.set("limit", limit);

      const res = await fetch(`/api/match?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      const arr: MatchResult[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setResults(arr);
    } catch (err: any) {
      setError(err?.message ?? "Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, [query, type, limit]);

  const handleSuggestion = useCallback((s: string) => {
    setQuery(s);
    handleSearch(s);
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults(null);
    setError(null);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 to-blue-50/40 p-5 space-y-4">
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-violet-100 p-1.5">
          <Sparkles className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">AI Semantik Eşleştirme</h2>
          <p className="text-xs text-gray-500">Düz Türkçe ile ara — AI anlamı okur, en iyi eşleşmeleri puanlayarak getirir</p>
        </div>
      </div>

      {/* Arama Formu */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Örn: Almanya donuk gıda frigo tır lazım..."
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm placeholder:text-gray-400"
          />
          {query && (
            <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm"
          >
            {["3", "5", "10", "20"].map((n) => (
              <option key={n} value={n}>{n} sonuç</option>
            ))}
          </select>

          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Eşleştir
          </button>
        </div>
      </div>

      {/* Öneri Chipleri */}
      {!results && !loading && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 self-center">Örnek:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="h-7 w-7 animate-spin text-violet-500" />
            <p className="text-sm">Vektörel eşleştirme yapılıyor...</p>
          </div>
        </div>
      )}

      {/* Hata */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Sonuçlar */}
      {!loading && results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {results.length} eşleşme bulundu
            </p>
            <button onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="h-3 w-3" /> Temizle
            </button>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm rounded-xl border border-dashed border-gray-200 bg-white">
              Eşleşen firma bulunamadı.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {results.map((r, i) => (
                <MatchCard
                  key={`${(r.company_data?.company_name ?? r.company_name ?? "")}-${i}`}
                  result={r}
                  rank={i + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
