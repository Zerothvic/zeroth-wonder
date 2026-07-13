import { create } from "zustand";
import { api } from "../api/client.js";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchProfile: async () => {
    try {
      const { data } = await api.get("/profile");
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (identifier, password) => {
    await api.post("/auth/login", { identifier, password });
    const { data } = await api.get("/profile");
    set({ user: data.user });
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },
}));