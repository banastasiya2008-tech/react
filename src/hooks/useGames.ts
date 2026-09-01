import { useState, useEffect, useCallback } from "react";
import type { Game, GameFormData } from "../types";
import { adaptApiGame, adaptGameToApi } from "../types";
import { GameStorage } from "../api/storage";

const storage = new GameStorage();

export function useGames() {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadGames = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await storage.getAll(p, 10);
      const games = result.data.map(adaptApiGame);
      setAllGames(games);
      setTotalPages(result.meta.totalPages);
      setPage(result.meta.page);
    } catch (err: any) {
      setError(err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchGames = useCallback(async (query: string, p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await storage.search(query, p, 10);
      const games = result.data.map(adaptApiGame);
      setAllGames(games);
      setTotalPages(result.meta.totalPages);
      setPage(result.meta.page);
    } catch (err: any) {
      setError(err.message || 'Failed to search games');
    } finally {
      setLoading(false);
    }
  }, []);

  const addGame = useCallback(async (gameData: GameFormData) => {
    const apiData = adaptGameToApi(gameData);
    const result = await storage.create(apiData);
    const newGame = adaptApiGame(result);
    setAllGames(prev => [newGame, ...prev]);
    return newGame;
  }, []);

  const updateGame = useCallback(async (id: number, gameData: GameFormData) => {
    const apiData = adaptGameToApi(gameData);
    const result = await storage.update(id, apiData);
    const updatedGame = adaptApiGame(result);
    setAllGames(prev => prev.map(g => g.id === id ? updatedGame : g));
    return updatedGame;
  }, []);

  const deleteGame = useCallback(async (id: number) => {
    await storage.delete(id);
    setAllGames(prev => prev.filter(g => g.id !== id));
  }, []);

  const getGameById = useCallback(async (id: number): Promise<Game | null> => {
    try {
      const result = await storage.getById(id);
      return adaptApiGame(result);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return {
    allGames,
    loading,
    error,
    page,
    totalPages,
    loadGames,
    searchGames,
    addGame,
    updateGame,
    deleteGame,
    getGameById,
    setPage,
  };
}