import { apiRequest } from "../lib/api";
import type { Patient, TriageResult } from "../types/patient";

export interface PatientSearchParams {
  query?: string;
  urgency?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PatientListResponse {
  data: Patient[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalPatients: number;
  todaysPatients: number;
  highRiskPatients: number;
  pendingReviews: number;
}

export const patientService = {
  list(params: PatientSearchParams = {}) {
    return apiRequest<PatientListResponse>("/patients", { params });
  },

  get(patientId: string) {
    return apiRequest<Patient>(`/patients/${patientId}`);
  },

  create(patient: Omit<Patient, "id">) {
    return apiRequest<Patient>("/patients", {
      method: "POST",
      body: JSON.stringify(patient),
    });
  },

  update(patientId: string, patient: Partial<Patient>) {
    return apiRequest<Patient>(`/patients/${patientId}`, {
      method: "PATCH",
      body: JSON.stringify(patient),
    });
  },

  remove(patientId: string) {
    return apiRequest<void>(`/patients/${patientId}`, { method: "DELETE" });
  },

  analyzeSymptoms(symptoms: string) {
    return apiRequest<TriageResult>("/ai-analysis", {
      method: "POST",
      body: JSON.stringify({ symptoms }),
    });
  },

  dashboardStats() {
    return apiRequest<DashboardStats>("/dashboard/statistics");
  },
};
