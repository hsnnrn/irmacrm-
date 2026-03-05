export const USER_ROLES = ["SUPER_ADMIN", "EMPLOYEE", "READ_ONLY"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Süper Admin",
  EMPLOYEE: "Çalışan",
  READ_ONLY: "Salt Okunur",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800 border-red-200",
  EMPLOYEE: "bg-blue-100 text-blue-800 border-blue-200",
  READ_ONLY: "bg-gray-100 text-gray-700 border-gray-200",
};

export type Permission = {
  canViewFinance: boolean;
  canViewReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canWrite: boolean;
  canViewCustomerFinance: boolean;
  canEditCustomers: boolean;
};

export function normalizeRole(role: unknown): UserRole {
  if (role === "SUPER_ADMIN" || role === "EMPLOYEE" || role === "READ_ONLY") return role;
  if (role === "ADMIN") return "SUPER_ADMIN";
  if (role === "OPERATOR") return "EMPLOYEE";
  if (role === "VIEWER") return "READ_ONLY";
  return "EMPLOYEE";
}

export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        canViewFinance: true,
        canViewReports: true,
        canAccessSettings: true,
        canManageUsers: true,
        canWrite: true,
        canViewCustomerFinance: true,
        canEditCustomers: true,
      };
    case "EMPLOYEE":
      return {
        canViewFinance: false,
        canViewReports: false,
        canAccessSettings: false,
        canManageUsers: false,
        canWrite: true,
        canViewCustomerFinance: false,
        canEditCustomers: false,
      };
    case "READ_ONLY":
      return {
        canViewFinance: true,
        canViewReports: true,
        canAccessSettings: true,
        canManageUsers: false,
        canWrite: false,
        canViewCustomerFinance: true,
        canEditCustomers: false,
      };
  }
}

export function isDashboardPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/positions") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/suppliers") ||
    pathname.startsWith("/finance") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile")
  );
}

export function isFinanceRestrictedPath(pathname: string) {
  return pathname.startsWith("/finance") || pathname.startsWith("/reports");
}

export function isCustomerFinancePath(pathname: string) {
  return pathname.includes("/customers/") && pathname.includes("/cari");
}

export function isSettingsPath(pathname: string) {
  return pathname.startsWith("/settings");
}

export function isUserManagementPath(pathname: string) {
  return pathname.startsWith("/settings/users");
}

export function checkRoutePermission(
  pathname: string,
  role: UserRole
): boolean {
  const permissions = getPermissions(role);

  if (isUserManagementPath(pathname) && !permissions.canManageUsers) return false;
  if (isFinanceRestrictedPath(pathname) && !permissions.canViewFinance) return false;
  if (isCustomerFinancePath(pathname) && !permissions.canViewCustomerFinance) return false;
  if (isSettingsPath(pathname) && !permissions.canAccessSettings) return false;

  return true;
}
