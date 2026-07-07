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
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    // Создаём случайный токен
    const token = crypto.randomBytes(32).toString('hex');
    
    // Сохраняем токен в БД
    await exec(
      'UPDATE users SET token = $1 WHERE id = $2',
      [token, user.id]
    );

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // Выход — удаляем токен
  async logout(userId: number) {
    await exec('UPDATE users SET token = NULL WHERE id = $1', [userId]);
  }

  // Получить пользователя по ID
  async getById(id: number) {
    return queryOne(
      'SELECT id, username, email, created_at as "createdAt" FROM users WHERE id = $1',
      [id]
    );
  }

  // Проверить токен 
  async getByToken(token: string) {
    return queryOne(
      'SELECT id, username, email FROM users WHERE token = $1',
      [token]
    );
  }
}