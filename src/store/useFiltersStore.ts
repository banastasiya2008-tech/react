import { create } from 'zustand';
import type { FilterState, SortOption } from '../types';

const initialFilters: FilterState = {
  query: '',
  genre: 'all',
  minScore: 0,
  sort: 'score-d',
};

interface FiltersState {
  filters: FilterState;
  setQuery: (query: string) => void;
  setGenre: (genre: string) => void;
  setMinScore: (minScore: number) => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: initialFilters,
  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  setGenre: (genre) => set((s) => ({ filters: { ...s.filters, genre } })),
  setMinScore: (minScore) => set((s) => ({ filters: { ...s.filters, minScore } })),
  setSort: (sort) => set((s) => ({ filters: { ...s.filters, sort } })),
  resetFilters: () => set({ filters: initialFilters }),
}));