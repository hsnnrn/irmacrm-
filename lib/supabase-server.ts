import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { normalizeRole } from "./rbac";
import type { UserRole } from "./rbac";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://a4c25270-bb57-4bcc-bc65-7605e1c573ca.supabase.co";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient() {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function verifyAdminRequest(
  request: Request
): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");

  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(token);

    if (error || !user) return null;

    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = normalizeRole(profile?.role) as UserRole;
    if (role !== "SUPER_ADMIN") return null;

    return { userId: user.id };
  } catch {
    return null;
  }
}
