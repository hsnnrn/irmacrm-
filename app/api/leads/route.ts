import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const UPSTREAM_URL = "http://136.114.69.218:3050/api/leads";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM_URL, {
      next: { revalidate: 0 },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const text = await res.text();

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Proxy error" },
      { status: 502 }
    );
  }
}
