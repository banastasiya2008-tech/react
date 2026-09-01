import { query, queryOne, exec } from '../utils/db.utils.js';

export class TokenRepository {
  async create(userId: number, token: string, expiresAt: Date) {
    await exec(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );
  }

  async findByToken(token: string) {
    return queryOne('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
  }

  async deleteByToken(token: string) {
    await exec('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  }

  async deleteAllByUser(userId: number) {
    await exec('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }

  async deleteExpired() {
    await exec('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
  }
}