import { create } from 'zustand';
import { getCart, addToCart, removeFromCart } from '../api/api';
import type { ApiGame } from '../types';

interface CartState {
  items: ApiGame[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (gameId: number) => Promise<void>;
  removeItem: (gameId: number) => Promise<void>;
  isInCart: (gameId: number) => boolean;
  getCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const items = await getCart();
      set({ items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (gameId: number) => {
    await addToCart(gameId);
    await get().fetchCart();
  },

  removeItem: async (gameId: number) => {
    await removeFromCart(gameId);
    set({ items: get().items.filter((i) => i.id !== gameId) });
  },

  isInCart: (gameId: number) => get().items.some((i) => i.id === gameId),
  getCount: () => get().items.length,
}));