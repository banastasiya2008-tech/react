import { create } from 'zustand';
import type { Game } from '../types';

export type ViewName = 'catalog' | 'cart' | 'detail';
export type OverlayName = 'form';

interface UiState {
  view: ViewName;
  activeOverlay: OverlayName | null;
  selectedGame: Game | null;
  editingGame: Game | null;

  openCart: () => void;
  openDetail: (game: Game) => void;
  backToCatalog: () => void;
  openCreate: () => void;
  openEdit: (game: Game) => void;
  closeOverlay: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  view: 'catalog',
  activeOverlay: null,
  selectedGame: null,
  editingGame: null,

  openCart: () => set({ view: 'cart' }),
  openDetail: (game) => set({ selectedGame: game, view: 'detail' }),
  backToCatalog: () => set({ view: 'catalog', selectedGame: null }),
  openCreate: () => set({ editingGame: null, activeOverlay: 'form' }),
  openEdit: (game) => set({ editingGame: game, activeOverlay: 'form', view: 'catalog' }),
  closeOverlay: () => set({ activeOverlay: null, editingGame: null }),
}));