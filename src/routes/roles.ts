import type { UserRole } from "../types/api";

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/users", "/patients", "/visits", "/medical-history", "/settings"],
  doctor: ["/dashboard", "/patients", "/visits", "/medical-history"],
  nurse: ["/dashboard", "/patients", "/visits", "/medical-history"],
  staff: ["/dashboard", "/patients", "/visits"],
};

export function canAccess(role: UserRole, path: string) {
  return ROLE_ACCESS[role].some(route => path === route || path.startsWith(`${route}/`));
}
