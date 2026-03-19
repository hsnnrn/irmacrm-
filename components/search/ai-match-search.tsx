"use client";

import { useState, useCallback, useRef } from "react";
import { Sparkles, Search, Loader2, Mail, Phone, ExternalLink, Globe, X, AlertCircle } from "lucide-react";

interface MatchResult {
  type: "SHIPPER" | "CARRIER";
  company_name: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  website?: string;
  source?: string;
  cargo_type?: string;
  export_destinations?: string[];
  transport_needs?: string[];
  transport_modes?: string[];
  special_services?: string[];
  route_focus?: string;
  score?: number;
}

const TYPE_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "CARRIER", label: "Nakliyeci" },
  { value: "SHIPPER", label: "Gönderi" },
];

const TRANSPORT_MODE_COLORS: Record<string, string> = {
  ROAD: "bg-emerald-100 text-emerald-700",
  SEA: "bg-blue-100 text-blue-700",
  AIR: "bg-sky-100 text-sky-700",
  RAIL: "bg-amber-100 text-amber-700",
  MULTIMODAL: "bg-violet-100 text-violet-700",
};

const SPECIAL_SERVICE_COLORS: Record<string, string> = {
  REFRIGERATED: "bg-cyan-100 text-cyan-700",
  HAZMAT: "bg-red-100 text-red-700",
  OVERSIZE: "bg-orange-100 text-orange-700",
  STANDARD: "bg-gray-100 text-gray-600",
};

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    pct >= 60 ? "bg-blue-100 text-blue-700 border-blue-200" :
    "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {pct}% eşleşme
    </span>
  );
}

function TagBadge({ label, colorMap, fallback }: { label: string; colorMap: Record<string, string>; fallback: string }) {
  const cls = colorMap[label.toUpperCase()] ?? fallback;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

function MatchCard({ result }: { result: MatchResult }) {
  const isCarrier = result.type === "CARRIER";

  return (
    <div className={`rounded-xl border p-4 bg-white hover:shadow-md transition-shadow ${
      isCarrier ? "border-emerald-100" : "border-blue-100"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            isCarrier ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
          }`}>
            {isCarrier ? "NAKLİYECİ" : "GÖNDERİ"}
          </span>
          <h3 className="font-semibold text-gray-900 truncate">{result.company_name || "—"}</h3>
        </div>
        {result.score !== undefined && <ScoreBadge score={result.score} />}
      </div>

      <p className="text-sm text-gray-500 mt-1">
        {[result.city, result.country].filter(Boolean).join(", ") || "—"}
      </p>

      {isCarrier && (
        <div className="mt-3 space-y-2">
          {result.route_focus && (
            <p className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">Rota:</span> {result.route_focus}
            </p>
          )}
          {result.transport_modes && result.transport_modes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.transport_modes.map((m, i) => (
                <TagBadge key={i} label={m} colorMap={TRANSPORT_MODE_COLORS} fallback="bg-slate-100 text-slate-600" />
              ))}
            </div>
          )}
          {result.special_services && result.special_services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.special_services.map((s, i) => (
                <TagBadge key={i} label={s} colorMap={SPECIAL_SERVICE_COLORS} fallback="bg-slate-100 text-slate-600" />
              ))}
            </div>
          )}
        </div>
      )}

      {!isCarrier && (
        <div className="mt-3 space-y-2">
          {result.cargo_type && (
            <p className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">Yük:</span> {result.cargo_type}
            </p>
          )}
          {result.export_destinations && result.export_destinations.length > 0 && (
            <p className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">İhracat:</span>{" "}
              {result.export_destinations.join(" · ")}
            </p>
          )}
          {result.transport_needs && result.transport_needs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.transport_needs.map((n, i) => (
                <TagBadge key={i} label={n} colorMap={TRANSPORT_MODE_COLORS} fallback="bg-slate-100 text-slate-600" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 flex-wrap">
        {result.email && (
          <a href={`mailto:${result.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Mail className="h-3 w-3" /> {result.email}
          </a>
        )}
        {result.phone && (
          <a href={`tel:${result.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800">
            <Phone className="h-3 w-3" /> {result.phone}
          </a>
        )}
        {result.website && (
          <a href={result.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
            <Globe className="h-3 w-3" /> Web
          </a>
        )}
        {result.source && (
          <a href={result.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-gray-500 hover:underline">
            <ExternalLink className="h-3 w-3" /> Kaynak
          </a>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Almanya'ya donuk gıda taşıyacak frigo tır",
  "Tekstil ihracatı yapan İstanbul firması",
  "Avrupa rotasında tehlikeli madde taşıyan nakliyeci",
  "Gaziantep'ten tekstil gönderecek müşteri",
];

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
      setResults(Array.isArray(data) ? data : data?.results ?? []);
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
          <p className="text-xs text-gray-500">Düz Türkçe ile ara — AI anlamı okur, en iyi eşleşmeleri getirir</p>
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
            placeholder="Örn: Almanya'ya donuk gıda taşıyacak frigo tır lazım..."
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-sm placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
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
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
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
        <div className="flex items-center justify-center py-10">
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {results.length} eşleşme bulundu
            </p>
            <button onClick={handleClear} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="h-3 w-3" /> Temizle
            </button>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Eşleşen firma bulunamadı.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((r, i) => (
                <MatchCard key={`${r.company_name}-${i}`} result={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
