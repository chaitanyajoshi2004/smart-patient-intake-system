import { apiClient } from "../api/client";
import type { AITriageRecord, ClinicSettings, MedicalReport, NotificationItem, Prescription, PrescriptionPayload, Vital, VitalPayload } from "../types/api";

async function listResource<T>(endpoint: string) {
  const { data } = await apiClient.get<unknown>(endpoint);

  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }

  return [];
}

export const resourceApi = {
  vitals: () => listResource<Vital>("/vitals/"),
  createVital: async (payload: VitalPayload) => {
    const { data } = await apiClient.post<Vital>("/vitals/", payload);
    return data;
  },
  updateVital: async (id: number, payload: VitalPayload) => {
    const { data } = await apiClient.put<Vital>(`/vitals/${id}`, payload);
    return data;
  },
  deleteVital: async (id: number) => {
    await apiClient.delete(`/vitals/${id}`);
  },
  prescriptions: () => listResource<Prescription>("/prescriptions/"),
  createPrescription: async (payload: PrescriptionPayload) => {
    const { data } = await apiClient.post<Prescription>("/prescriptions/", payload);
    return data;
  },
  updatePrescription: async (id: number, payload: PrescriptionPayload) => {
    const { data } = await apiClient.put<Prescription>(`/prescriptions/${id}`, payload);
    return data;
  },
  deletePrescription: async (id: number) => {
    await apiClient.delete(`/prescriptions/${id}`);
  },
  reports: () => listResource<MedicalReport>("/reports/"),
  uploadReport: async (formData: FormData) => {
    const { data } = await apiClient.post<MedicalReport>("/reports/", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
  },
  deleteReport: async (id: number) => {
    await apiClient.delete(`/reports/${id}`);
  },
  aiTriage: () => listResource<AITriageRecord>("/triage/"),
  notifications: () => listResource<NotificationItem>("/notifications/"),
  markNotificationRead: async (id: number) => {
    const { data } = await apiClient.put<NotificationItem>(`/notifications/${id}`, { is_read: true });
    return data;
  },
  markAllNotificationsRead: async () => {
    const { data } = await apiClient.put<NotificationItem[]>("/notifications/mark-all-read", {});
    return data;
  },
  settings: async () => {
    const { data } = await apiClient.get<unknown>("/settings/");
    if (Array.isArray(data)) return data[0] as ClinicSettings | undefined;
    if (data && typeof data === "object" && "data" in data) {
      const nested = (data as { data?: unknown }).data;
      return Array.isArray(nested) ? nested[0] as ClinicSettings | undefined : nested as ClinicSettings | undefined;
    }
    return data as ClinicSettings | undefined;
  },
  analytics: async () => {
    const { data } = await apiClient.get<Record<string, unknown>>("/analytics/");
    return data;
  },
};
