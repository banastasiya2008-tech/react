import { create } from 'zustand';
import type { Game, GameFormData } from '../types';
import { adaptApiGame, adaptGameToApi } from '../types';
import { GameStorage } from '../api/storage';

const storage = new GameStorage();

interface GamesState {
  allGames: Game[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;

  loadGames: (page?: number) => Promise<void>;
  searchGames: (query: string, page?: number) => Promise<void>;
  addGame: (data: GameFormData) => Promise<Game>;
  updateGame: (id: number, data: GameFormData) => Promise<Game>;
  deleteGame: (id: number) => Promise<void>;
  getGameById: (id: number) => Promise<Game | null>;
  setPage: (page: number) => void;
}

export const useGamesStore = create<GamesState>((set) => ({
  allGames: [],
  loading: true,
  error: null,
  page: 1,
  totalPages: 1,

  loadGames: async (p = 1) => {
    set({ loading: true, error: null });
    try {
      const result = await storage.getAll(p, 100);
      set({
        allGames: result.data.map(adaptApiGame),
        totalPages: result.meta.totalPages,
        page: result.meta.page,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load games' });
    } finally {
      set({ loading: false });
    }
  },

  searchGames: async (query, p = 1) => {
    set({ loading: true, error: null });
    try {
      const result = await storage.search(query, p, 100);
      set({
        allGames: result.data.map(adaptApiGame),
        totalPages: result.meta.totalPages,
        page: result.meta.page,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to search games' });
    } finally {
      set({ loading: false });
    }
  },

  addGame: async (gameData) => {
    const result = await storage.create(adaptGameToApi(gameData));
    const game = adaptApiGame(result);
    set((s) => ({ allGames: [game, ...s.allGames] }));
    return game;
  },

  updateGame: async (id, gameData) => {
    const result = await storage.update(id, adaptGameToApi(gameData));
    const game = adaptApiGame(result);
    set((s) => ({ allGames: s.allGames.map((g) => (g.id === id ? game : g)) }));
    return game;
  },

  deleteGame: async (id) => {
    await storage.delete(id);
    set((s) => ({ allGames: s.allGames.filter((g) => g.id !== id) }));
  },

  getGameById: async (id) => {
    try {
      return adaptApiGame(await storage.getById(id));
    } catch {
      return null;
    }
  },

  setPage: (page) => set({ page }),
}));