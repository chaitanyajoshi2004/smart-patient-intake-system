import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export function normalizeErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map(item => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const location = "loc" in item && Array.isArray(item.loc)
            ? item.loc.join(".")
            : "request";
          return `${location}: ${String(item.msg)}`;
        }
        return JSON.stringify(item);
      })
      .join("; ");
  }

  if (detail && typeof detail === "object") {
    if ("msg" in detail) return String(detail.msg);
    if ("message" in detail) return String(detail.message);
    return JSON.stringify(detail);
  }

  return "Request failed";
}

export function safeToastMessage(message: unknown): string {
  if (typeof message === "string") return message;
  return normalizeErrorDetail(message);
}

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("spi_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.detail
      ? normalizeErrorDetail(error.response.data.detail)
      : error.message || "Request failed";

    if (status === 401) {
      localStorage.removeItem("spi_token");
      localStorage.removeItem("spi_user");
      if (!window.location.pathname.includes("/login")) {
        toast.error("Session expired. Please sign in again.");
        window.location.assign("/login");
      }
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again.");
    } else if (status !== 404) {
      toast.error(safeToastMessage(message));
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    return error.response?.data?.detail
      ? normalizeErrorDetail(error.response.data.detail)
      : error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}
