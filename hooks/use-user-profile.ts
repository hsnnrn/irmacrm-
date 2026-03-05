import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase";
import { useAuth } from "./use-auth";
import { normalizeRole, getPermissions } from "@/lib/rbac";
import type { UserRole, Permission } from "@/lib/rbac";

type ProfileRow = Tables<"profiles">;

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: profile,
    isLoading: profileLoading,
    refetch,
  } = useQuery<UserProfile>({
    queryKey: ["profile", user?.id],
    queryFn: async (): Promise<UserProfile> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const row = data as ProfileRow | null;

      if (error || !row) {
        return {
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          role: "EMPLOYEE" as UserRole,
          created_at: new Date().toISOString(),
        };
      }

      return {
        id: row.id,
        full_name: row.full_name,
        role: normalizeRole(row.role),
        created_at: row.created_at,
      };
    },
    enabled: !!user && !authLoading,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const permissions: Permission | null = profile
    ? getPermissions(profile.role)
    : null;

  return {
    profile: profile ?? null,
    loading: authLoading || (!!user && profileLoading),
    permissions,
    role: profile?.role ?? null,
    refetch,
  };
}
