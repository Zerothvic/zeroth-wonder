import { create } from "zustand";
import { api } from "../api/client.js";

export const useCartStore = create((set) => ({
  items: [],
  fetchCart: async () => {
    const { data } = await api.get("/cart");
    set({ items: data });
  },
  addToCart: async (productId) => {
    await api.post("/cart", { productId });
    const { data } = await api.get("/cart");
    set({ items: data });
  },
  removeFromCart: async (productId) => {
    await api.delete(`/cart/${productId}`);
    const { data } = await api.get("/cart");
    set({ items: data });
  },
}));