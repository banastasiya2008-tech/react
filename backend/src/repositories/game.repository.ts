import { query, queryOne, exec } from '../utils/db.utils.js';

export class GameRepository {
  async getAll(userId: number, page = 1, limit = 10) {
    const countResult = await queryOne(
      'SELECT COUNT(*) as count FROM games WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult?.count || '0');
    
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const rows = await query(
      'SELECT * FROM games ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return {
      data: rows.map(this._parseGame),
      meta: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      }
    };
  }

  async getById(id: number) {
    const row = await queryOne(
      'SELECT * FROM games WHERE id = $1',
      [id]
    );
    return row ? this._parseGame(row) : null;
  }

  async create(userId: number, data: any) {
    const result = await exec(
      `INSERT INTO games (title, genre, release_year, developer, publisher, rating, platform, cover_image, tags, description, in_stock, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        userId,
        data.title,
        data.genre,
        data.releaseYear || null,
        data.developer || '',
        data.publisher || '',
        data.rating || 0,
        JSON.stringify(data.platform || []),
        data.coverImage || '',
        JSON.stringify(data.tags || []),
        data.description || '',
        data.inStock ?? true,
        data.price ?? 0,
      ]
    );

    return this.getById(result.lastID!);
  }

  async update(id: number, userId: number, data: any) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const add = (col: string, val: any) => {
      fields.push(`${col} = $${idx}`);
      values.push(val);
      idx++;
    };

    if (data.title !== undefined) add('title', data.title);
    if (data.genre !== undefined) add('genre', data.genre);
    if (data.releaseYear !== undefined) add('release_year', data.releaseYear);
    if (data.developer !== undefined) add('developer', data.developer);
    if (data.publisher !== undefined) add('publisher', data.publisher);
    if (data.rating !== undefined) add('rating', data.rating);
    if (data.platform !== undefined) add('platform', JSON.stringify(data.platform));
    if (data.coverImage !== undefined) add('cover_image', data.coverImage);
    if (data.tags !== undefined) add('tags', JSON.stringify(data.tags));
    if (data.description !== undefined) add('description', data.description);
    if (data.inStock !== undefined) add('in_stock', data.inStock);
    if (data.price !== undefined) add('price', data.price);

    if (fields.length === 0) return existing;

    values.push(id);
    await exec(`UPDATE games SET ${fields.join(', ')} WHERE id = $${idx}`, values);

    return this.getById(id);
  }

  async delete(id: number, userId: number) {
    const result = await exec(
      'DELETE FROM games WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount > 0;
  }

  async search(userId: number, searchTerm: string, page = 1, limit = 10) {
    const term = `%${searchTerm.toLowerCase()}%`;
    
    const countResult = await queryOne(
      `SELECT COUNT(*) as count FROM games WHERE user_id = $1 AND (
        LOWER(title) LIKE $2 OR LOWER(genre) LIKE $2 OR LOWER(developer) LIKE $2
      )`,
      [userId, term]
    );
    const total = parseInt(countResult?.count || '0');
    
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const rows = await query(
      `SELECT * FROM games WHERE user_id = $1 AND (
        LOWER(title) LIKE $2 OR LOWER(genre) LIKE $2 OR LOWER(developer) LIKE $2
      ) ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
      [userId, term, limit, offset]
    );

    return {
      data: rows.map(this._parseGame),
      meta: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
      }
    };
  }

  _parseGame(row: any) {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      genre: row.genre,
      platform: Array.isArray(row.platform) ? row.platform : JSON.parse(row.platform || '[]'),
      releaseYear: row.release_year,
      developer: row.developer,
      publisher: row.publisher,
      rating: row.rating,
      coverImage: row.cover_image,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
      description: row.description,
      inStock: row.in_stock,
      price: row.price,
      createdAt: row.created_at,
    };
  }
}