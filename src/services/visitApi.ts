import { apiClient } from "../api/client";
import type { Visit, VisitPayload, VisitStatus } from "../types/api";

export interface VisitQuery {
  doctor_id?: number;
  patient_id?: number;
  date?: string;
  status?: VisitStatus | "";
}

export const visitApi = {
  async list(params: VisitQuery) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
    );
    const { data } = await apiClient.get<Visit[]>("/visits/", { params: cleanParams });
    return data;
  },

  async create(payload: VisitPayload) {
    const { data } = await apiClient.post<Visit>("/visits/", payload);
    return data;
  },
};
