import type { UserRole } from "../types/api";

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: [
    "/dashboard", "/users", "/patients", "/visits", "/medical-history", "/vitals",
    "/prescriptions", "/reports", "/ai-triage", "/analytics", "/billing", "/pharmacy",
    "/laboratory", "/inventory", "/notifications", "/settings", "/reception", "/portal",
  ],
  doctor: [
    "/dashboard", "/doctor", "/patients", "/visits", "/medical-history", "/vitals",
    "/prescriptions", "/reports", "/ai-triage", "/analytics", "/portal",
  ],
  nurse: [
    "/dashboard", "/patients", "/visits", "/medical-history", "/vitals", "/reports", "/portal",
  ],
  staff: ["/dashboard", "/reception", "/patients", "/visits", "/medical-history", "/portal"],
};

export function canAccess(role: UserRole, path: string) {
  return ROLE_ACCESS[role].some(route => path === route || path.startsWith(`${route}/`));
}
