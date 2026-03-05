import { NextResponse } from "next/server";
import { createAdminClient, verifyAdminRequest } from "@/lib/supabase-server";
import { normalizeRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const verified = await verifyAdminRequest(request);
  if (!verified) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const { id } = params;

  if (verified.userId === id) {
    return NextResponse.json(
      { error: "Kendi hesabınızı bu şekilde güncelleyemezsiniz" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { role, is_active, full_name } = body;
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    if (typeof is_active === "boolean") {
      const { error } = await admin.auth.admin.updateUserById(id, {
        ban_duration: is_active ? "none" : "876600h",
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const profileUpdate: Record<string, unknown> = {};
    if (role) profileUpdate.role = normalizeRole(role);
    if (full_name !== undefined) profileUpdate.full_name = full_name;

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await db
        .from("profiles")
        .update(profileUpdate)
        .eq("id", id);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const verified = await verifyAdminRequest(request);
  if (!verified) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const { id } = params;

  if (verified.userId === id) {
    return NextResponse.json(
      { error: "Kendi hesabınızı silemezsiniz" },
      { status: 400 }
    );
  }

  try {
    const admin = createAdminClient();

    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Sunucu hatası" },
      { status: 500 }
    );
  }
}
