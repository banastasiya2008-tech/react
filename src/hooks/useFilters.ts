import { useMemo, useCallback } from "react";
import type { Game } from "../types";
import { useFiltersStore } from "../store/useFiltersStore";


export function useFilters(allGames: Game[]) {
  const filters = useFiltersStore((s) => s.filters);
  const setQuery = useFiltersStore((s) => s.setQuery);
  const setGenre = useFiltersStore((s) => s.setGenre);
  const setMinScore = useFiltersStore((s) => s.setMinScore);
  const setSort = useFiltersStore((s) => s.setSort);
  const resetFilters = useFiltersStore((s) => s.resetFilters);

  const matchQuery = useCallback((g: Game, q: string): boolean => {
    if (!q) return true;
    return (
      g.name.toLowerCase().includes(q) ||
      (g.dev ?? "").toLowerCase().includes(q) ||
      (g.genre ?? "").toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, []);

  const filteredGames = useMemo(() => {
    const list = allGames.filter(
      (g) =>
        matchQuery(g, filters.query) &&
        (filters.genre === "all" || g.genre === filters.genre) &&
        g.score >= filters.minScore
    );

    list.sort((a, b) => {
      switch (filters.sort) {
        case "name-a": return a.name.localeCompare(b.name);
        case "name-z": return b.name.localeCompare(a.name);
        case "score-d": return b.score - a.score;
        case "score-a": return a.score - b.score;
        case "year-d": return (b.year ?? 0) - (a.year ?? 0);
        case "year-a": return (a.year ?? 0) - (b.year ?? 0);
        default: return 0;
      }
    });

    return list;
  }, [allGames, filters, matchQuery]);

  const genres = useMemo(
    () => [...new Set(allGames.map((g) => g.genre).filter(Boolean))].sort(),
    [allGames]
  );

  const genreCounts = useMemo(() => {
    const base = allGames.filter(
      (g) => matchQuery(g, filters.query) && g.score >= filters.minScore
    );
    const counts = new Map<string, number>();
    genres.forEach((g) => {
      counts.set(g, base.filter((game) => game.genre === g).length);
    });
    return counts;
  }, [allGames, filters.query, filters.minScore, genres, matchQuery]);

  return {
    filters,
    setQuery,
    setGenre,
    setMinScore,
    setSort,
    resetFilters,
    filteredGames,
    genres,
    genreCounts,
  };

}