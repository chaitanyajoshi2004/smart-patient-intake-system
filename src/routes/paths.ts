import type { Screen } from "../types/patient";

export const APP_ROUTES: Record<Screen, string> = {
  login: "/login",
  dashboard: "/dashboard",
  registration: "/patients/new",
  records: "/patients",
  details: "/patients/:patientId",
  triage: "/ai-triage",
  reports: "/analytics",
  settings: "/settings",
};

export const PRIVATE_SCREENS = Object.keys(APP_ROUTES).filter(
  screen => screen !== "login",
) as Exclude<Screen, "login">[];
