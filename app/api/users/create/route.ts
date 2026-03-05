import { NextResponse } from "next/server";
import { createAdminClient, verifyAdminRequest } from "@/lib/supabase-server";
import { normalizeRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const verified = await verifyAdminRequest(request);
  if (!verified) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "E-posta, şifre ve rol zorunludur" },
        { status: 400 }
      );
    }

    const normalizedRole = normalizeRole(role);
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const {
      data: { user },
      error: createError,
    } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "" },
    });

    if (createError || !user) {
      return NextResponse.json(
        { error: createError?.message ?? "Kullanıcı oluşturulamadı" },
        { status: 400 }
      );
    }

    const { error: profileError } = await db.from("profiles").upsert({
      id: user.id,
      full_name: full_name || null,
      role: normalizedRole,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: "Profil oluşturulamadı: " + profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: full_name || null,
      role: normalizedRole,
      created_at: user.created_at,
      is_active: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Sunucu hatası" },
      { status: 500 }
    );
  }
}
