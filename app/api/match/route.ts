import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const UPSTREAM_BASE = "http://136.114.69.218:3050";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const q = searchParams.get("q");
    if (!q) {
      return NextResponse.json(
        { error: "Parametre eksik: 'q' zorunludur." },
        { status: 400 }
      );
    }

    const upstream = new URL(`${UPSTREAM_BASE}/api/match`);
    upstream.searchParams.set("q", q);

    const type = searchParams.get("type");
    if (type) upstream.searchParams.set("type", type);

    const limit = searchParams.get("limit");
    if (limit) upstream.searchParams.set("limit", limit);

    const res = await fetch(upstream.toString(), {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Proxy error" },
      { status: 502 }
    );
  }
}
