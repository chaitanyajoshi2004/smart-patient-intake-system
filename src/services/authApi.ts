import { apiClient } from "../api/client";
import type { CreateUserPayload, LoginPayload, LoginResponse, User } from "../types/api";

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: CreateUserPayload) {
    const { data } = await apiClient.post<User>("/auth/register", payload);
    return data;
  },
};
