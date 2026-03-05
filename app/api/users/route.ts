import { NextResponse } from "next/server";
import { createAdminClient, verifyAdminRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const verified = await verifyAdminRequest(request);
  if (!verified) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const {
      data: { users },
      error: usersError,
    } = await admin.auth.admin.listUsers({ perPage: 1000 });

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const { data: profiles, error: profilesError } = await db
      .from("profiles")
      .select("*");

    if (profilesError) {
      return NextResponse.json(
        { error: profilesError.message },
        { status: 500 }
      );
    }

    const result = users.map((u) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = (profiles as any[])?.find((p: any) => p.id === u.id);
      const isBanned =
        u.banned_until && new Date(u.banned_until) > new Date();
      return {
        id: u.id,
        email: u.email ?? "",
        full_name:
          profile?.full_name || u.user_metadata?.full_name || "",
        role: profile?.role ?? "EMPLOYEE",
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at ?? null,
        is_active: !isBanned,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Sunucu hatası" },
      { status: 500 }
    );
  }
}
