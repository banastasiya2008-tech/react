export interface Game {
  id: number;
  name: string;
  genre: string;
  year: number | null;
  dev: string;
  pub: string;
  score: number;
  plat: string[];
  cover: string;
  tags: string[];
  desc: string;
}

export interface GameCardData {
  id: number;
  name: string;
  genre: string;
  year: number | null;
  dev: string;
  score: number;
  plat: string[];
  cover: string;
  desc: string;
}

export interface GameDetailsData {
  id: number;
  name: string;
  genre: string;
  year: number | null;
  dev: string;
  pub: string;
  score: number;
  plat: string[];
  cover: string;
  tags: string[];
  desc: string;
}

export interface GameFormData {
  name: string;
  genre: string;
  year: number | null;
  dev: string;
  pub: string;
  score: number;
  plat: string[];
  cover: string;
  tags: string[];
  desc: string;
}

export type SortOption =
  | "name-a" | "name-z"
  | "score-d" | "score-a"
  | "year-d" | "year-a";

export interface FilterState {
  query: string;
  genre: string;
  minScore: number;
  sort: SortOption;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API raw game type (fields from backend)
export interface ApiGame {
  id: number;
  title: string;
  genre: string;
  releaseYear: number | null;
  developer: string;
  publisher: string;
  rating: number;
  platform: string[];
  coverImage: string;
  tags: string[];
  description: string;
}
