export interface ShipperLead {
  type: "SHIPPER";
  company_name: string;
  country: string;
  city: string;
  region: string;
  category: string;
  cargo_type: string;
  email: string;
  phone: string;
  source: string;
}

export interface CarrierLead {
  type: "CARRIER";
  company_name: string;
  country: string;
  city: string;
  region: string;
  category: string;
  transport_scope: string;
  email: string;
  phone: string;
  source: string;
}

export type Lead = ShipperLead | CarrierLead;

export interface ParsedLeads {
  shippers: ShipperLead[];
  carriers: CarrierLead[];
  all: Lead[];
}

function parseBlock(block: string): Lead | null {
  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const typeRaw = lines[0].toUpperCase();
  if (typeRaw !== "SHIPPER" && typeRaw !== "CARRIER") return null;

  const fields: Record<string, string> = {};
  for (let i = 1; i < lines.length; i++) {
    const colonIdx = lines[i].indexOf(":");
    if (colonIdx === -1) continue;
    const key = lines[i].slice(0, colonIdx).trim().toLowerCase().replace(/\s+/g, "_");
    const value = lines[i].slice(colonIdx + 1).trim();
    fields[key] = value;
  }

  // Backward compat: old schema used "contact" for email
  const legacyContact = fields["contact"] ?? "";
  const emailVal = fields["email"] || (legacyContact.includes("@") ? legacyContact : "");
  const phoneVal = fields["phone"] || (legacyContact.includes("@") ? "" : legacyContact);

  if (typeRaw === "SHIPPER") {
    return {
      type: "SHIPPER",
      company_name: fields["company_name"] ?? "",
      country: fields["country"] ?? "",
      city: fields["city"] ?? "",
      region: fields["region"] ?? "",
      category: fields["category"] ?? "",
      cargo_type: fields["cargo_type"] ?? "",
      email: emailVal,
      phone: phoneVal,
      source: fields["source"] ?? "",
    };
  } else {
    return {
      type: "CARRIER",
      company_name: fields["company_name"] ?? "",
      country: fields["country"] ?? "",
      city: fields["city"] ?? "",
      region: fields["region"] ?? "",
      category: fields["category"] ?? "",
      transport_scope: fields["transport_scope"] ?? "",
      email: emailVal,
      phone: phoneVal,
      source: fields["source"] ?? "",
    };
  }
}

export function parseLeads(rawText: string): ParsedLeads {
  const blocks = rawText.split(/\n---\n/);
  const all: Lead[] = [];
  const shippers: ShipperLead[] = [];
  const carriers: CarrierLead[] = [];

  for (const block of blocks) {
    const lead = parseBlock(block.trim());
    if (!lead) continue;
    all.push(lead);
    if (lead.type === "SHIPPER") shippers.push(lead);
    else carriers.push(lead as CarrierLead);
  }

  return { all, shippers, carriers };
}
