export type Screen =
  | "login"
  | "dashboard"
  | "registration"
  | "records"
  | "details"
  | "triage"
  | "reports"
  | "settings";

export type Urgency = "routine" | "priority" | "urgent";

export type Department =
  | "General"
  | "Cardiology"
  | "Neurology"
  | "Orthopedics"
  | "Emergency"
  | "Pediatrics"
  | "ENT"
  | "Dermatology";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  symptoms: string;
  notes: string;
  department: Department;
  urgency: Urgency;
  date: string;
  status: "Waiting" | "In Progress" | "Completed";
  confidence: number;
  conditions: string[];
  aiSummary: string;
}

export interface TriageResult {
  urgency: Urgency;
  department: Department;
  confidence: number;
  conditions: string[];
  recommendation: string;
  notes: string;
}
