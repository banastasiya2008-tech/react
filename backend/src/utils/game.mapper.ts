import type { Game } from '../entities/Game.js';

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function toApiGame(game: Game) {
  return {
    id: game.id,
    userId: game.userId,
    title: game.title,
    genre: game.genre,
    platform: toArray(game.platform),
    releaseYear: game.releaseYear,
    developer: game.developer,
    publisher: game.publisher,
    rating: Number(game.rating) || 0,
    coverImage: game.coverImage,
    tags: toArray(game.tags),
    description: game.description,
    inStock: game.inStock,
    price: Number(game.price) || 0,
    createdAt: game.createdAt,
  };
}