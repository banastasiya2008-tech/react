import { query, queryOne, exec } from '../utils/db.utils.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class UserRepository {
  // Регистрация
  async register(data: any) {
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const result = await exec(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [data.username, data.email, hashedPassword]
    );

    return this.getById(result.lastID!);
  }

  // Логин — возвращает простой токен (случайная строка)
  async login(data: any) {
    const user = await queryOne('SELECT * FROM users WHERE email = $1', [data.email]);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    return this.getById(user.id);
  }

  async getById(id: number) {
    return queryOne('SELECT id, username, email, role, created_at as "createdAt" FROM users WHERE id = $1', [id]);
  }

  async getLibrary(userId: number) {
    const rows = await query('SELECT game_id FROM user_library WHERE user_id = $1', [userId]);
    return rows.map((r: any) => r.game_id);
  }

  async addToLibrary(userId: number, gameId: number) {
    const ex = await queryOne('SELECT 1 FROM user_library WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
    if (ex) throw new Error('Already in library');
    await exec('INSERT INTO user_library (user_id, game_id) VALUES ($1,$2)', [userId, gameId]);
  }

  async removeFromLibrary(userId: number, gameId: number) {
    await exec('DELETE FROM user_library WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
  }

  // Выход — удаляем токен
  async logout(userId: number) {
    await exec('UPDATE users SET token = NULL WHERE id = $1', [userId]);
  }

  // CART
  async addToCart(userId: number, gameId: number) {
    const ex = await queryOne('SELECT 1 FROM cart_items WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
    if (ex) throw new Error('Already in cart');
    await exec('INSERT INTO cart_items (user_id, game_id) VALUES ($1,$2)', [userId, gameId]);
  }

  async removeFromCart(userId: number, gameId: number) {
    await exec('DELETE FROM cart_items WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
  }

  async getCart(userId: number) {
    const rows = await query(
      `SELECT g.* FROM games g JOIN cart_items c ON g.id = c.game_id WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      genre: row.genre,
      platform: Array.isArray(row.platform) ? row.platform : JSON.parse(row.platform || '[]'),
      releaseYear: row.release_year,
      developer: row.developer,
      publisher: row.publisher,
      rating: Number(row.rating) || 0,
      coverImage: row.cover_image,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
      description: row.description,
      inStock: row.in_stock,
      price: Number(row.price) || 0,
      createdAt: row.created_at,
    }));
  }

  async clearCart(userId: number) {
    await exec('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  }

  // Проверить токен 
  async getByToken(token: string) {
    return queryOne(
      'SELECT id, username, email FROM users WHERE token = $1',
      [token]
    );
  }
}