import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * One-time setup endpoint to create the initial SUPER_ADMIN user.
 * Only works if no SUPER_ADMIN exists in the system yet.
 * Protect with SETUP_SECRET env variable.
 *
 * Usage: POST /api/setup/create-admin
 * Body: { secret: "your_setup_secret" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;

    const setupSecret = process.env.SETUP_SECRET;
    if (setupSecret && secret !== setupSecret) {
      return NextResponse.json({ error: "Geçersiz kurulum kodu" }, { status: 403 });
    }

    const admin = createAdminClient();
    // Use explicit any for raw DB operations on the admin client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const { data: existingAdmins } = await db
      .from("profiles")
      .select("id")
      .eq("role", "SUPER_ADMIN")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: "Sistemde zaten bir SUPER_ADMIN mevcut" },
        { status: 409 }
      );
    }

    const adminEmail =
      process.env.DEFAULT_ADMIN_EMAIL || "admin@irmaglobal.com";
    const adminPassword =
      process.env.DEFAULT_ADMIN_PASSWORD || "Admin@2024!";
    const adminName =
      process.env.DEFAULT_ADMIN_NAME || "Sistem Yöneticisi";

    const {
      data: { user },
      error: createError,
    } = await admin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: adminName },
    });

    if (createError || !user) {
      if (createError?.message?.includes("already registered")) {
        const {
          data: { users },
        } = await admin.auth.admin.listUsers();
        const existingUser = users.find((u) => u.email === adminEmail);
        if (existingUser) {
          await db.from("profiles").upsert({
            id: existingUser.id,
            full_name: adminName || null,
            role: "SUPER_ADMIN",
          });
          return NextResponse.json({
            message: "Mevcut kullanıcı SUPER_ADMIN olarak güncellendi",
            email: adminEmail,
          });
        }
      }
      return NextResponse.json(
        { error: createError?.message ?? "Kullanıcı oluşturulamadı" },
        { status: 400 }
      );
    }

    const { error: profileError } = await db.from("profiles").insert({
      id: user.id,
      full_name: adminName || null,
      role: "SUPER_ADMIN",
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: "Profil oluşturulamadı: " + profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "SUPER_ADMIN başarıyla oluşturuldu",
      email: adminEmail,
      note: "Lütfen ilk girişten sonra şifrenizi değiştirin",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Sunucu hatası" },
      { status: 500 }
    );
  }
}
