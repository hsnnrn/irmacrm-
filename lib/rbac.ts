export const USER_ROLES = ["SUPER_ADMIN", "EMPLOYEE", "READ_ONLY"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type Permission = {
  canViewFinance: boolean;
  canViewReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canWrite: boolean;
  canViewCustomerFinance: boolean;
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
      };
    case "EMPLOYEE":
      return {
        canViewFinance: false,
        canViewReports: false,
        canAccessSettings: false,
        canManageUsers: false,
        canWrite: true,
        canViewCustomerFinance: false,
      };
    case "READ_ONLY":
      return {
        canViewFinance: true,
        canViewReports: true,
        canAccessSettings: true,
        canManageUsers: false,
        canWrite: false,
        canViewCustomerFinance: true,
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
