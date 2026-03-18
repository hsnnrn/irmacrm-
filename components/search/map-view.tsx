"use client";

import { useEffect, useRef } from "react";
import { ParsedLeads } from "@/lib/lead-parser";

const CITY_COORDS: Record<string, [number, number]> = {
  istanbul: [41.0082, 28.9784],
  ankara: [39.9334, 32.8597],
  izmir: [38.4189, 27.1287],
  bursa: [40.1826, 29.0665],
  antalya: [36.8969, 30.7133],
  konya: [37.871, 32.4846],
  adana: [37.0, 35.3213],
  gaziantep: [37.0662, 37.3833],
  mersin: [36.8, 34.6333],
  kayseri: [38.7312, 35.4787],
  berlin: [52.52, 13.405],
  hamburg: [53.5753, 10.0153],
  munich: [48.1351, 11.582],
  frankfurt: [50.1109, 8.6821],
  cologne: [50.938, 6.957],
  paris: [48.8566, 2.3522],
  lyon: [45.7640, 4.8357],
  amsterdam: [52.3676, 4.9041],
  rotterdam: [51.9244, 4.4777],
  brussels: [50.8503, 4.3517],
  vienna: [48.2082, 16.3738],
  warsaw: [52.2297, 21.0122],
  rome: [41.9028, 12.4964],
  milan: [45.4654, 9.1859],
  madrid: [40.4168, -3.7038],
  sofia: [42.6977, 23.3219],
  bucharest: [44.4268, 26.1025],
  athens: [37.9838, 23.7275],
  budapest: [47.4979, 19.0402],
  prague: [50.0755, 14.4378],
  london: [51.5074, -0.1278],
  moscow: [55.7558, 37.6176],
  kyiv: [50.4501, 30.5234],
  tbilisi: [41.7151, 44.8271],
  baku: [40.4093, 49.8671],
  tehran: [35.6892, 51.389],
};

function getCityCoords(city: string, country: string): [number, number] | null {
  const key = city.toLowerCase();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  const countryKey = country.toLowerCase();
  const countryDefaults: Record<string, [number, number]> = {
    turkey: [39.9199, 32.8543],
    germany: [51.1657, 10.4515],
    france: [46.2276, 2.2137],
    netherlands: [52.1326, 5.2913],
    belgium: [50.5039, 4.4699],
    austria: [47.5162, 14.5501],
    italy: [41.8719, 12.5674],
    spain: [40.4637, -3.7492],
    poland: [51.9194, 19.1451],
    romania: [45.9432, 24.9668],
    bulgaria: [42.7339, 25.4858],
    greece: [39.0742, 21.8243],
    hungary: [47.1625, 19.5033],
  };
  return countryDefaults[countryKey] ?? null;
}

interface MapViewProps {
  data: ParsedLeads;
}

export function MapView({ data }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (!isMounted || !mapRef.current) return;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = L.map(mapRef.current, {
          center: [45.0, 20.0],
          zoom: 4,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        const shipperIcon = L.divIcon({
          html: `<div style="
            width:12px;height:12px;border-radius:50%;
            background:#3b82f6;border:2px solid #fff;
            box-shadow:0 1px 4px rgba(0,0,0,0.3)">
          </div>`,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const carrierIcon = L.divIcon({
          html: `<div style="
            width:12px;height:12px;border-radius:50%;
            background:#10b981;border:2px solid #fff;
            box-shadow:0 1px 4px rgba(0,0,0,0.3)">
          </div>`,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        for (const s of data.shippers) {
          const coords = getCityCoords(s.city, s.country);
          if (!coords) continue;
          L.marker(coords, { icon: shipperIcon })
            .bindTooltip(
              `<strong>${s.company_name || "Unknown"}</strong><br/>${s.city}, ${s.country}<br/>${s.cargo_type || ""}${s.export_destinations.length ? " → " + s.export_destinations.join(", ") : ""}`,
              { permanent: false, direction: "top" }
            )
            .addTo(map);
        }

        for (const c of data.carriers) {
          const coords = getCityCoords(c.city, c.country);
          if (!coords) continue;
          L.marker(coords, { icon: carrierIcon })
            .bindTooltip(
              `<strong>${c.company_name || "Unknown"}</strong><br/>${c.city}, ${c.country}<br/>${c.route_focus || ""}${c.transport_modes.length ? " · " + c.transport_modes.join(", ") : ""}`,
              { permanent: false, direction: "top" }
            )
            .addTo(map);
        }

        mapInstanceRef.current = map;
      } catch (e) {
        console.error("Map init error", e);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
          Shippers ({data.shippers.length})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
          Carriers ({data.carriers.length})
        </span>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[520px] rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-gray-100"
      />
    </div>
  );
}
