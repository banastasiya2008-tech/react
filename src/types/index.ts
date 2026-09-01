// ========== USER TYPES ==========

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// ========== GAME TYPE (FRONTEND) ==========

export interface Game {
  id: number;
  name: string;
  genre: string;
  score: number;
  dev: string;
  year: number | null;
  pub: string;
  plat: string[];
  cover: string;
  tags: string[];
  desc: string;
  price: number;
}

// ========== PAGINATION ==========

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ========== FILTERS / SORT ==========

export type SortOption = 'name-a' | 'name-z' | 'score-d' | 'score-a' | 'year-d' | 'year-a';

export interface FilterState {
  query: string;
  genre: string;
  minScore: number;
  sort: SortOption;
}

// ========== GAME TYPE (API / BACKEND) ==========

export interface ApiGame {
  id: number;
  userId: number;
  title: string;
  genre: string;
  platform: string[];
  releaseYear: number | null;
  developer: string;
  publisher: string;
  rating: number;
  coverImage: string;
  tags: string[];
  description: string;
  inStock: boolean;
  price: number;
  createdAt: string;
}

// ========== FORM DATA ==========

export interface GameFormData {
  name: string;
  genre: string;
  score: number;
  dev: string;
  pub: string;
  year: number | null;
  plat: string[];
  cover: string;
  tags: string[];
  desc: string;
  price: number;
}

// ========== ADAPTER: ApiGame → Game ==========

export function adaptApiGame(apiGame: ApiGame): Game {
  return {
    id: apiGame.id,
    name: apiGame.title,
    genre: apiGame.genre,
    score: Number(apiGame.rating) || 0,
    dev: apiGame.developer,
    year: apiGame.releaseYear,
    pub: apiGame.publisher,
    plat: apiGame.platform || [],
    cover: apiGame.coverImage || '',
    tags: apiGame.tags || [],
    desc: apiGame.description || '',
    price: Number(apiGame.price) || 0,
  };
}

// ========== ADAPTER: GameFormData → ApiGame ==========

export function adaptGameToApi(game: GameFormData): Omit<ApiGame, 'id' | 'userId' | 'createdAt'> {
  return {
    title: game.name,
    genre: game.genre,
    releaseYear: game.year,
    developer: game.dev,
    publisher: game.pub,
    rating: game.score,
    platform: game.plat,
    coverImage: game.cover,
    tags: game.tags,
    description: game.desc,
    inStock: true,
    price: game.price ?? 0,
  };
}