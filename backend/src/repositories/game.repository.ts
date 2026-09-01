import { query, queryOne, exec } from '../utils/db.utils.js';

export class GameRepository {
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
      rating: Number(row.rating) || 0,
      coverImage: row.cover_image,
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
      description: row.description,
      inStock: row.in_stock,
      price: Number(row.price) || 0,
      createdAt: row.created_at,
    };
  }

  async getAll(page = 1, limit = 10) {
    const countResult = await queryOne('SELECT COUNT(*) as count FROM games');
    const total = parseInt(countResult?.count || '0');
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const rows = await query('SELECT * FROM games ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return { data: rows.map(this._parseGame), meta: { page: safePage, limit, total, totalPages, hasNext: safePage < totalPages, hasPrev: safePage > 1 } };
  }

  async getById(id: number) {
    const row = await queryOne('SELECT * FROM games WHERE id = $1', [id]);
    return row ? this._parseGame(row) : null;
  }

  async create(userId: number, data: any) {
    const result = await exec(
      `INSERT INTO games (user_id, title, genre, release_year, developer, publisher, rating, platform, cover_image, tags, description, in_stock, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [userId, data.title, data.genre, data.releaseYear||null, data.developer||'', data.publisher||'', data.rating||0, JSON.stringify(data.platform||[]), data.coverImage||'', JSON.stringify(data.tags||[]), data.description||'', data.inStock??true, data.price??0]
    );
    return this.getById(result.lastID!);
  }

  async update(id: number, userId: number, data: any) {
    const existing = await this.getById(id);
    if (!existing) return null;
    // Владельческая проверка убрана: доступ к этому методу уже ограничен
    // ролью на уровне роута (requireRole('admin', 'moderator')), поэтому
    // admin/moderator должны иметь возможность редактировать ЛЮБУЮ игру,
    // а не только созданные ими самими.

    const fields: string[] = []; const values: any[] = []; let idx = 1;
    const add = (col: string, val: any) => { fields.push(`${col} = $${idx}`); values.push(val); idx++; };
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
    const existing = await this.getById(id);
    if (!existing) return false;
    // Аналогично update(): владельческая проверка убрана, т.к. удаление
    // разрешено только роли 'admin' на уровне роута.
    const result = await exec('DELETE FROM games WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async search(searchTerm: string, page = 1, limit = 10) {
    const term = `%${searchTerm.toLowerCase()}%`;
    const countResult = await queryOne(`SELECT COUNT(*) as count FROM games WHERE LOWER(title) LIKE $1 OR LOWER(genre) LIKE $1 OR LOWER(developer) LIKE $1`, [term]);
    const total = parseInt(countResult?.count || '0');
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const rows = await query(`SELECT * FROM games WHERE LOWER(title) LIKE $1 OR LOWER(genre) LIKE $1 OR LOWER(developer) LIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [term, limit, offset]);
    return { data: rows.map(this._parseGame), meta: { page: safePage, limit, total, totalPages, hasNext: safePage < totalPages, hasPrev: safePage > 1 } };
  }

  async rateGame(userId: number, gameId: number, rating: number) {
    await exec(
      `INSERT INTO ratings (user_id, game_id, rating) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, game_id) DO UPDATE SET rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP`,
      [userId, gameId, rating]
    );
    const avgResult = await queryOne(`SELECT AVG(rating)::float as avg_rating, COUNT(*) as count FROM ratings WHERE game_id = $1`, [gameId]);
    const average = parseFloat(avgResult?.avg_rating || '0');
    await exec('UPDATE games SET rating = $1 WHERE id = $2', [average, gameId]);
    return { average, count: parseInt(avgResult?.count || '0') };
  }
}