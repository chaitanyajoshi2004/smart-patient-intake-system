import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  FileClock,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Pill,
  Settings,
  Shield,
  ShieldPlus,
  Stethoscope,
  Users,
} from "lucide-react";
import type { UserRole } from "../types/api";

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
  children?: NavigationItem[];
}

const all: UserRole[] = ["admin", "doctor", "nurse", "staff"];
const clinical: UserRole[] = ["admin", "doctor", "nurse"];

export const navigation: NavigationItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: all },
  {
    label: "Patients",
    path: "/patients",
    icon: Users,
    roles: all,
    children: [
      { label: "Patient List", path: "/patients", icon: Users, roles: all },
      { label: "Add Patient", path: "/patients?action=add", icon: ShieldPlus, roles: all },
    ],
  },
  {
    label: "Visits",
    path: "/visits",
    icon: CalendarDays,
    roles: all,
    children: [
      { label: "Today's Visits", path: "/visits?date=today", icon: CalendarDays, roles: all },
      { label: "All Visits", path: "/visits", icon: ClipboardList, roles: all },
      { label: "Schedule Visit", path: "/visits?action=create", icon: ShieldPlus, roles: all },
    ],
  },
  {
    label: "Medical",
    path: "/medical-history",
    icon: HeartPulse,
    roles: clinical,
    children: [
      { label: "Medical History", path: "/medical-history", icon: FileClock, roles: clinical },
      { label: "Vitals", path: "/vitals", icon: Activity, roles: clinical },
      { label: "Prescriptions", path: "/prescriptions", icon: Pill, roles: clinical },
      { label: "Reports", path: "/reports", icon: FileText, roles: clinical },
    ],
  },
  {
    label: "AI & Analytics",
    path: "/analytics",
    icon: BarChart3,
    roles: ["admin", "doctor"],
    children: [
      { label: "AI Triage", path: "/ai-triage", icon: Stethoscope, roles: ["admin", "doctor"] },
      { label: "Analytics", path: "/analytics", icon: BarChart3, roles: ["admin", "doctor"] },
    ],
  },
  {
    label: "Administration",
    path: "/users",
    icon: Shield,
    roles: ["admin"],
    children: [
      { label: "Users", path: "/users", icon: ShieldPlus, roles: ["admin"] },
      { label: "Notifications", path: "/notifications", icon: Bell, roles: ["admin"] },
      { label: "Settings", path: "/settings", icon: Settings, roles: ["admin"] },
    ],
  },
  { label: "Patient Portal", path: "/portal", icon: HeartPulse, roles: all },
];
