import { apiClient } from "../api/client";
import type {
  MedicalHistory,
  MedicalHistoryPayload,
  Patient,
  PatientDetails,
  PatientListResponse,
  PatientPayload,
} from "../types/api";

export interface PatientQuery {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  blood_group?: string;
}

export const patientApi = {
  async list(params: PatientQuery) {
    const { data } = await apiClient.get<PatientListResponse>("/patients/", { params });
    return data;
  },

  async create(payload: PatientPayload) {
    const { data } = await apiClient.post<Patient>("/patients/", payload);
    return data;
  },

  async details(patientId: number) {
    const { data } = await apiClient.get<PatientDetails>(`/patients/${patientId}`);
    return data;
  },

  async update(patientId: number, payload: Partial<PatientPayload>) {
    const { data } = await apiClient.put<Patient>(`/patients/${patientId}`, payload);
    return data;
  },

  async remove(patientId: number) {
    await apiClient.delete(`/patients/${patientId}`);
  },

  async history(patientId: number) {
    const { data } = await apiClient.get<MedicalHistory[]>(`/patients/${patientId}/history`);
    return data;
  },

  async addHistory(patientId: number, payload: MedicalHistoryPayload) {
    const { data } = await apiClient.post<MedicalHistory>(`/patients/${patientId}/history`, payload);
    return data;
  },
};
