import { GameRepository } from '../repositories/game.repository.js';
const gameRepo = new GameRepository();

export class GameService {
  async getAllGames(page: number, limit: number) { return gameRepo.getAll(page, limit); }
  async getGameById(id: number) { const g = await gameRepo.getById(id); if (!g) throw new Error('Game not found'); return g; }
  async createGame(userId: number, data: any) { if (!data.title || !data.genre) throw new Error('Title and genre required'); return gameRepo.create(userId, data); }
  async updateGame(id: number, userId: number, data: any) { const g = await gameRepo.getById(id); if (!g) throw new Error('Game not found'); return gameRepo.update(id, userId, data); }
  async deleteGame(id: number, userId: number) { const s = await gameRepo.delete(id, userId); if (!s) throw new Error('Game not found'); return { message: 'Deleted' }; }
  async searchGames(term: string, page: number, limit: number) { return gameRepo.search(term, page, limit); }
  async rateGame(userId: number, gameId: number, rating: number) { if (rating < 1 || rating > 10) throw new Error('Rating 1-10'); return gameRepo.rateGame(userId, gameId, rating); }
}