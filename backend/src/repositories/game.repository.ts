import { AppDataSource } from '../data-source.js';
import { Game } from '../entities/Game.js';
import { Rating } from '../entities/Rating.js';
import { toApiGame } from '../utils/game.mapper.js';
import { buildPaginationMeta, getOffset } from '../utils/pagination.js';

const gameRepository = AppDataSource.getRepository(Game);

export class GameRepository {
  async getAll(page = 1, limit = 10) {
    const total = await gameRepository.count();
    const meta = buildPaginationMeta(page, limit, total);

    const games = await gameRepository.find({
      order: { createdAt: 'DESC' },
      skip: getOffset(meta.page, limit),
      take: limit,
    });
    return { data: games.map(toApiGame), meta };
  }

  async getById(id: number) {
    const game = await gameRepository.findOneBy({ id });
    return game ? toApiGame(game) : null;
  }

  async create(userId: number, data: any) {
    const game = gameRepository.create({
      userId,
      title: data.title,
      genre: data.genre,
      releaseYear: data.releaseYear || null,
      developer: data.developer || '',
      publisher: data.publisher || '',
      rating: data.rating || 0,
      platform: data.platform || [],
      coverImage: data.coverImage || '',
      tags: data.tags || [],
      description: data.description || '',
      inStock: data.inStock ?? true,
      price: data.price ?? 0,
    });
    const saved = await gameRepository.save(game);
    return this.getById(saved.id);
  }

  async update(id: number, userId: number, data: any) {
    const existing = await gameRepository.findOneBy({ id });
    if (!existing) return null;
    
    const patch: Partial<Game> = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.genre !== undefined) patch.genre = data.genre;
    if (data.releaseYear !== undefined) patch.releaseYear = data.releaseYear;
    if (data.developer !== undefined) patch.developer = data.developer;
    if (data.publisher !== undefined) patch.publisher = data.publisher;
    if (data.rating !== undefined) patch.rating = data.rating;
    if (data.platform !== undefined) patch.platform = data.platform;
    if (data.coverImage !== undefined) patch.coverImage = data.coverImage;
    if (data.tags !== undefined) patch.tags = data.tags;
    if (data.description !== undefined) patch.description = data.description;
    if (data.inStock !== undefined) patch.inStock = data.inStock;
    if (data.price !== undefined) patch.price = data.price;

    if (Object.keys(patch).length > 0) {
      await gameRepository.update(id, patch);
    }
    return this.getById(id);
  }

  async delete(id: number, userId: number) {
    const result = await gameRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async search(searchTerm: string, page = 1, limit = 10) {
    const term = `%${searchTerm.toLowerCase()}%`;
    const qb = gameRepository
      .createQueryBuilder('game')
      .where(
        'LOWER(game.title) LIKE :term OR LOWER(game.genre) LIKE :term OR LOWER(game.developer) LIKE :term',
        { term }
      );

    const total = await qb.getCount();
    const meta = buildPaginationMeta(page, limit, total);

    const games = await qb
      .orderBy('game.createdAt', 'DESC')
      .skip(getOffset(meta.page, limit))
      .take(limit)
      .getMany();
    return { data: games.map(toApiGame), meta };
  }

  async rateGame(userId: number, gameId: number, rating: number) {
    return AppDataSource.transaction(async (manager) => {
      await manager.upsert(Rating, { userId, gameId, rating, createdAt: new Date() }, ['userId', 'gameId']);

      const agg = await manager
        .createQueryBuilder(Rating, 'r')
        .select('AVG(r.rating)', 'avg')
        .addSelect('COUNT(*)', 'count')
        .where('r.gameId = :gameId', { gameId })
        .getRawOne<{ avg: string | null; count: string }>();

      const average = parseFloat(agg?.avg ?? '0');
      await manager.update(Game, gameId, { rating: average });
      return { average, count: parseInt(agg?.count ?? '0', 10) };
    });
  }
}