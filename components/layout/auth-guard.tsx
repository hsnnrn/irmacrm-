"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { checkRoutePermission } from "@/lib/rbac";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();

  const loading = authLoading || (!!user && profileLoading);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (!profile) return;

    const allowed = checkRoutePermission(pathname, profile.role);
    if (!allowed) {
      router.replace("/403");
    }
  }, [user, profile, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-logistics-blue" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (profile && !checkRoutePermission(pathname, profile.role)) {
    return null;
  }

  return <>{children}</>;
}
