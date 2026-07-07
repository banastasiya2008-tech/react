export interface Game {
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