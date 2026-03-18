export interface ShipperLead {
  type: "SHIPPER";
  company_name: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  added_at: string;
  cargo_type: string;
  export_destinations: string[];
  transport_needs: string[];
}

export interface CarrierLead {
  type: "CARRIER";
  company_name: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  added_at: string;
  transport_modes: string[];
  special_services: string[];
  route_focus: string;
}

export type Lead = ShipperLead | CarrierLead;

export interface ParsedLeads {
  shippers: ShipperLead[];
  carriers: CarrierLead[];
  all: Lead[];
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string");
  if (typeof val === "string" && val.length > 0) return [val];
  return [];
}

function mapShipper(raw: Record<string, unknown>): ShipperLead {
  return {
    type: "SHIPPER",
    company_name: String(raw.company_name ?? ""),
    country: String(raw.country ?? ""),
    city: String(raw.city ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    website: String(raw.website ?? ""),
    source: String(raw.source ?? ""),
    added_at: String(raw.added_at ?? ""),
    cargo_type: String(raw.cargo_type ?? ""),
    export_destinations: toStringArray(raw.export_destinations),
    transport_needs: toStringArray(raw.transport_needs),
  };
}

function mapCarrier(raw: Record<string, unknown>): CarrierLead {
  return {
    type: "CARRIER",
    company_name: String(raw.company_name ?? ""),
    country: String(raw.country ?? ""),
    city: String(raw.city ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    website: String(raw.website ?? ""),
    source: String(raw.source ?? ""),
    added_at: String(raw.added_at ?? ""),
    transport_modes: toStringArray(raw.transport_modes),
    special_services: toStringArray(raw.special_services),
    route_focus: String(raw.route_focus ?? ""),
  };
}

export function parseLeads(json: unknown[]): ParsedLeads {
  const all: Lead[] = [];
  const shippers: ShipperLead[] = [];
  const carriers: CarrierLead[] = [];

  if (!Array.isArray(json)) return { all, shippers, carriers };

  for (const item of json) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const type = String(raw.type ?? "").toUpperCase();

    if (type === "SHIPPER") {
      const lead = mapShipper(raw);
      all.push(lead);
      shippers.push(lead);
    } else if (type === "CARRIER") {
      const lead = mapCarrier(raw);
      all.push(lead);
      carriers.push(lead);
    }
  }

  return { all, shippers, carriers };
}
