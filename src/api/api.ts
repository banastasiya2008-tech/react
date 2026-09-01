import { Game, PaginatedResult, ApiGame, LoginDTO, RegisterDTO, AuthResponse } from "../types";
import { client } from "./client";

const API_BASE_URL = 'http://localhost:5003/api';
const AUTH_URL = `${API_BASE_URL}/auth`;

export function getCoverImage(coverImage: string | undefined, title: string): string {
  if (coverImage && coverImage.startsWith('http')) {
    return coverImage;
  }
  return `https://placehold.co/300x400/1a1510/c9842b?text=${encodeURIComponent(title)}`;
}

const mapApiGame = (g: ApiGame): Game => ({
  id: g.id,
  name: g.title,
  genre: g.genre,
  year: g.releaseYear,
  dev: g.developer,
  pub: g.publisher,
  score: Number(g.rating) || 0,
  plat: g.platform,
  cover: getCoverImage(g.coverImage, g.title),
  tags: g.tags,
  desc: g.description,
  price: Number(g.price) || 0,
});

export const getGames = async (page = 1, limit = 10): Promise<PaginatedResult<ApiGame>> => {
  const response = await client(`/games?page=${page}&limit=${limit}`);
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return response.json();
};

export const getGameById = async (id: number): Promise<Game | undefined> => {
  const response = await client(`/games/${id}`);
  if (!response.ok) return undefined;
  const g = await response.json() as ApiGame;
  return mapApiGame(g);
};

export async function login(data: LoginDTO): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function register(data: RegisterDTO): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${AUTH_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export const createGame = async (data: Record<string, unknown>): Promise<Game> => {
  const response = await client(`/games/new`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create");
  const g = await response.json() as ApiGame;
  return mapApiGame(g);
};

export const updateGame = async (id: number, data: Record<string, unknown>): Promise<Game> => {
  const response = await client(`/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update");
  const g = await response.json() as ApiGame;
  return mapApiGame(g);
};

export const deleteGame = async (id: number): Promise<void> => {
  const response = await client(`/games/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete");
};

// ===== RATINGS =====
export const rateGame = async (id: number, rating: number): Promise<{ average: number; count: number }> => {
  const response = await client(`/games/${id}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  if (!response.ok) throw new Error('Failed to rate game');
  return response.json();
};

// ===== CART =====
export const getCart = async (): Promise<ApiGame[]> => {
  const response = await client('/user/cart');
  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json();
};

export const addToCart = async (gameId: number): Promise<void> => {
  const response = await client(`/user/cart/${gameId}`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to add to cart');
};

export const removeFromCart = async (gameId: number): Promise<void> => {
  const response = await client(`/user/cart/${gameId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to remove from cart');
};

export const clearCart = async (): Promise<void> => {
  const response = await client('/user/cart', { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to clear cart');
};