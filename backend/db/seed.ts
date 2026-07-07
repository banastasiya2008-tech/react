import { query, queryOne, exec } from '../src/utils/db.utils.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Таблица users
    await exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        token VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Таблица games
    await exec(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        release_year INTEGER,
        developer VARCHAR(255),
        publisher VARCHAR(255),
        rating DECIMAL(3,1) DEFAULT 0,
        platform JSONB DEFAULT '[]',
        cover_image TEXT,
        tags JSONB DEFAULT '[]',
        description TEXT,
        in_stock BOOLEAN DEFAULT true,
        price DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created');

    // Создаём админа
    const existingUser = await queryOne('SELECT id FROM users WHERE username = $1', ['admin']);
    let userId: number;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const result = await exec(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
        ['admin', 'admin@test.com', hashedPassword]
      );
      userId = result.lastID!;
      console.log('Created admin user (password: admin123)');
    } else {
      userId = existingUser.id;
      console.log('Admin user already exists');
    }

    // Проверяем игры
    const existingGames = await queryOne('SELECT COUNT(*) as count FROM games');
    if (parseInt(existingGames?.count || '0') > 0) {
      console.log('Games already seeded');
      return;
    }

    // 9 игр
    const games = [
      {
        title: 'The Witcher 3',
        genre: 'RPG',
        release_year: 2015,
        developer: 'CD Projekt Red',
        publisher: 'CD Projekt',
        rating: 9.5,
        platform: ['PC', 'PS4', 'Xbox One'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
        tags: ['open world', 'fantasy', 'story rich'],
        description: 'An epic open-world RPG following Geralt of Rivia.',
        in_stock: true,
        price: 29.99,
      },
      {
        title: 'Red Dead Redemption 2',
        genre: 'Action',
        release_year: 2018,
        developer: 'Rockstar Games',
        publisher: 'Rockstar Games',
        rating: 9.8,
        platform: ['PC', 'PS4', 'Xbox One'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg',
        tags: ['western', 'open world', 'story rich'],
        description: 'Epic western adventure.',
        in_stock: true,
        price: 39.99,
      },
      {
        title: 'Cyberpunk 2077',
        genre: 'RPG',
        release_year: 2020,
        developer: 'CD Projekt Red',
        publisher: 'CD Projekt',
        rating: 8.5,
        platform: ['PC', 'PS5', 'Xbox Series X'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
        tags: ['sci-fi', 'cyberpunk', 'open world'],
        description: 'Open-world RPG in Night City.',
        in_stock: true,
        price: 49.99,
      },
      {
        title: 'Elden Ring',
        genre: 'RPG',
        release_year: 2022,
        developer: 'FromSoftware',
        publisher: 'Bandai Namco',
        rating: 9.6,
        platform: ['PC', 'PS5', 'Xbox Series X'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/5/51/Elden_Ring_Boxart.jpg',
        tags: ['souls-like', 'fantasy', 'difficult'],
        description: 'Open-world soulslike.',
        in_stock: true,
        price: 59.99,
      },
      {
        title: 'Hades',
        genre: 'Roguelike',
        release_year: 2020,
        developer: 'Supergiant Games',
        publisher: 'Supergiant Games',
        rating: 9.3,
        platform: ['PC', 'Switch', 'PS4'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/6/6e/Hades_cover_art.jpg',
        tags: ['roguelike', 'mythology', 'action'],
        description: 'Roguelike dungeon crawler.',
        in_stock: true,
        price: 24.99,
      },
      {
        title: 'Hollow Knight',
        genre: 'Metroidvania',
        release_year: 2017,
        developer: 'Team Cherry',
        publisher: 'Team Cherry',
        rating: 9.4,
        platform: ['PC', 'PS4', 'Xbox', 'Switch'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/0/04/Hollow_Knight_cover.jpg',
        tags: ['indie', 'metroidvania', 'difficult'],
        description: '2D metroidvania in Hallownest.',
        in_stock: true,
        price: 14.99,
      },
      {
        title: 'God of War Ragnarök',
        genre: 'Action',
        release_year: 2022,
        developer: 'Santa Monica Studio',
        publisher: 'Sony',
        rating: 9.6,
        platform: ['PS5', 'PS4'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/0/00/God_of_War_Ragnarök_cover.jpg',
        tags: ['story', 'mythology', 'action'],
        description: 'Kratos in Nine Realms.',
        in_stock: false,
        price: 49.99,
      },
      {
        title: "Baldur's Gate 3",
        genre: 'RPG',
        release_year: 2023,
        developer: 'Larian Studios',
        publisher: 'Larian Studios',
        rating: 9.7,
        platform: ['PC', 'PS5', 'Xbox Series X'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Baldur%27s_Gate_3_cover_art.jpg',
        tags: ['D&D', 'turn-based', 'story rich'],
        description: 'Masterpiece CRPG.',
        in_stock: true,
        price: 59.99,
      },
      {
        title: 'Hades II',
        genre: 'Roguelike',
        release_year: 2024,
        developer: 'Supergiant Games',
        publisher: 'Supergiant Games',
        rating: 9.1,
        platform: ['PC'],
        cover_image: 'https://upload.wikimedia.org/wikipedia/en/7/7e/Hades_II_cover_art.jpg',
        tags: ['roguelike', 'mythology', 'early access'],
        description: 'Sequel to Hades.',
        in_stock: true,
        price: 29.99,
      },
    ];

    for (const game of games) {
      await exec(
        `INSERT INTO games (user_id, title, genre, release_year, developer, publisher, rating, platform, cover_image, tags, description, in_stock, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId,
          game.title,
          game.genre,
          game.release_year,
          game.developer,
          game.publisher,
          game.rating,
          JSON.stringify(game.platform),
          game.cover_image,
          JSON.stringify(game.tags),
          game.description,
          game.in_stock,
          game.price,
        ]
      );
    }

    console.log(`Seeded ${games.length} games!`);
  } catch (err) {
    console.error('Seed error:', err);
  }
}

seed();