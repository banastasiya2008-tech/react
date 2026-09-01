import { query, queryOne, exec } from '../src/utils/db.utils.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { await exec(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`); } catch (e) {}

    await exec(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(512) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        release_year INTEGER,
        developer VARCHAR(255),
        publisher VARCHAR(255),
        rating FLOAT DEFAULT 0,
        platform JSON DEFAULT '[]',
        cover_image TEXT,
        tags JSON DEFAULT '[]',
        description TEXT,
        in_stock BOOLEAN DEFAULT true,
        price FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        UNIQUE(user_id, game_id)
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      )
    `);

    await exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, game_id)
      )
    `);

    console.log('Tables checked/created');

    const users = [
      { username: 'admin', email: 'admin@test.com', password: 'admin123', role: 'admin' },
      { username: 'moderator', email: 'mod@test.com', password: 'mod123', role: 'moderator' },
      { username: 'user', email: 'user@test.com', password: 'user123', role: 'user' },
    ];

    for (const u of users) {
      const existing = await queryOne('SELECT id FROM users WHERE username = $1', [u.username]);
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        await exec(
          'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
          [u.username, u.email, hashed, u.role]
        );
        console.log(`Created ${u.role}: ${u.username}`);
      } else {
        await exec('UPDATE users SET role = $1 WHERE id = $2', [u.role, existing.id]);
        console.log(`${u.username} updated to ${u.role}`);
      }
    }

    console.log('Seed complete!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

seed();