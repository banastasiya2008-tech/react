import { client } from './client';

export class GameStorage {
  async getAll(page = 1, limit = 100) {
    const response = await client(`/games?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch games');
    return response.json();
  }

  async search(query: string, page = 1, limit = 100) {
    const response = await client(
      `/games/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to search games');
    return response.json();
  }

  async getById(id: number) {
    const response = await client(`/games/${id}`);
    if (!response.ok) throw new Error('Game not found');
    return response.json();
  }

  async create(data: any) {
    const response = await client(`/games/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create game');
    return response.json();
  }

  async update(id: number, data: any) {
    const response = await client(`/games/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update game');
    return response.json();
  }

  async delete(id: number) {
    const response = await client(`/games/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete game');
    return response.json();
  }
}