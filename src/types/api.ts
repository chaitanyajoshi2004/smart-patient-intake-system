export type UserRole = "admin" | "doctor" | "nurse" | "staff";

export interface AuthUser {
  id: number;
  full_name: string;
  role: UserRole;
}

export interface User extends AuthUser {
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface Patient {
  id: number;
  patient_code: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age?: number | null;
  gender: string;
  blood_group?: string | null;
  phone: string;
  email?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  profile_image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientListResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
}

export interface PatientPayload {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
}

export interface MedicalHistory {
  id: number;
  patient_id: number;
  condition_name: string;
  diagnosis?: string | null;
  description?: string | null;
  diagnosed_date?: string | null;
  created_at: string;
}

export interface MedicalHistoryPayload {
  condition_name: string;
  diagnosis?: string;
  description?: string;
  diagnosed_date?: string;
}

export type VisitStatus = "scheduled" | "checked_in" | "in_progress" | "completed" | "cancelled";

export interface Visit {
  id: number;
  patient_id: number;
  doctor_id?: number | null;
  visit_date: string;
  visit_type: string;
  reason?: string | null;
  notes?: string | null;
  status: VisitStatus;
  created_at: string;
}

export interface VisitPayload {
  patient_id: number;
  doctor_id?: number;
  visit_date: string;
  visit_type: string;
  reason?: string;
  notes?: string;
  status: VisitStatus;
}

export interface PatientDetails extends Patient {
  medical_history: MedicalHistory[];
  visits: Visit[];
  prescriptions: unknown[];
  vitals: unknown[];
  reports: unknown[];
}
