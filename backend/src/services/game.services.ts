import { GameRepository } from '../repositories/game.repository.js';
import { cached, invalidateGames, TTL } from '../redis/cache.js';
const gameRepo = new GameRepository();

export class GameService {
  async getAllGames(page: number, limit: number) { return cached(`games:list:${page}:${limit}`, TTL.list, () => gameRepo.getAll(page, limit)); }
  async getGameById(id: number) { const g = await cached(`game:${id}`, TTL.game, () => gameRepo.getById(id)); if (!g) throw new Error('Game not found'); return g; }
  async createGame(userId: number, data: any) { if (!data.title || !data.genre) throw new Error('Title and genre required'); const g = await gameRepo.create(userId, data); await invalidateGames(); return g; }
  async updateGame(id: number, userId: number, data: any) { const g = await gameRepo.getById(id); if (!g) throw new Error('Game not found'); const r = await gameRepo.update(id, userId, data); await invalidateGames(id); return r; }
  async deleteGame(id: number, userId: number) { const s = await gameRepo.delete(id, userId); if (!s) throw new Error('Game not found'); await invalidateGames(id); return { message: 'Deleted' }; }
  async searchGames(term: string, page: number, limit: number) { return cached(`games:search:${encodeURIComponent(term.toLowerCase())}:${page}:${limit}`, TTL.list, () => gameRepo.search(term, page, limit)); }
  async rateGame(userId: number, gameId: number, rating: number) { if (rating < 1 || rating > 10) throw new Error('Rating 1-10'); const r = await gameRepo.rateGame(userId, gameId, rating); await invalidateGames(gameId); return r; }
}