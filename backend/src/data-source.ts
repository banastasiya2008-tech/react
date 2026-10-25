import 'reflect-metadata';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entities/User.js';
import { Game } from './entities/Game.js';
import { RefreshToken } from './entities/RefreshToken.js';
import { CartItem } from './entities/CartItem.js';
import { Rating } from './entities/Rating.js';
import { UserLibrary } from './entities/UserLibrary.js';

dotenv.config();


export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Game, RefreshToken, CartItem, Rating, UserLibrary],

  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});