import { getGames, getGameById, createGame, updateGame, deleteGame } from "./api";
import type { Game, GameFormData } from "../types";

export class GameStorage {
  async getAll(): Promise<Game[]> {
    return getGames();
  }

  async getById(id: number): Promise<Game | undefined> {
    return getGameById(id);
  }

  async add(data: GameFormData): Promise<Game> {
    const apiData = {
      title: data.name,
      genre: data.genre,
      releaseYear: data.year,
      developer: data.dev,
      publisher: data.pub,
      rating: data.score,
      platform: data.plat,
      coverImage: data.cover,
      tags: data.tags,
      description: data.desc,
    };
    return createGame(apiData);
  }

  async update(id: number, data: GameFormData): Promise<Game> {
    const apiData = {
      title: data.name,
      genre: data.genre,
      releaseYear: data.year,
      developer: data.dev,
      publisher: data.pub,
      rating: data.score,
      platform: data.plat,
      coverImage: data.cover,
      tags: data.tags,
      description: data.desc,
    };
    return updateGame(id, apiData);
  }

  async delete(id: number): Promise<void> {
    return deleteGame(id);
  }
}
