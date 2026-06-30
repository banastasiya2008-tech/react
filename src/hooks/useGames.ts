import { useState, useEffect, useCallback } from "react";
import type { Game, GameFormData } from "../types";
import { GameStorage } from "../api/storage";

const storage = new GameStorage();

export function useGames() {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const games = await storage.getAll();
      console.log("Games from API:", games);  // ← проверь cover поле
      setAllGames(games);
    } catch (err) {
      setError("Failed to load games. Is the server running?");
      console.error(err);
      setAllGames([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  const addGame = useCallback(async (data: GameFormData) => {
    const game = await storage.add(data);
    setAllGames((prev) => [...prev, game]);
    return game;
  }, []);

  const updateGame = useCallback(async (id: number, data: GameFormData) => {
    const game = await storage.update(id, data);
    setAllGames((prev) => prev.map((g) => (g.id === id ? game : g)));
    return game;
  }, []);

  const deleteGame = useCallback(async (id: number) => {
    await storage.delete(id);
    setAllGames((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const getGameById = useCallback(async (id: number) => {
    return storage.getById(id);
  }, []);

  return { allGames, loading, error, loadGames, addGame, updateGame, deleteGame, getGameById };
}