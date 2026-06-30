import type { Game } from '../models/game.model.js';
import { CreateGameDTO, UpdateGameDTO } from '../models/dtos/game.dto.js';
import { readDB, writeDB } from '../utils/db.utils.js';
import { returnPaginatedResults } from '../utils/pagination.js';
import { PaginatedResult } from '../types/pagination.type.js';

export const gameService = {
	// Read the database and return paginated results
	async getAll(page?: number, limit?: number): Promise<PaginatedResult<Game>> {
		const db = await readDB();
		return returnPaginatedResults(db.games, page || 1, limit || 10);
	},

	async getById(id: number): Promise<Game | undefined> {
		const db = await readDB();
		return db.games.find((g) => g.id === id);
	},

	async create(dto: CreateGameDTO): Promise<Game> {
		const db = await readDB();
		const newGame: Game = {
			...dto,
			id: Math.max(0, ...db.games.map((g) => g.id)) + 1, // Simple ID generation
		};
		db.games.push(newGame);
		await writeDB(db);
		return newGame;
	},

	async update(id: number, dto: UpdateGameDTO): Promise<Game | undefined> {
		const db = await readDB();
		const index = db.games.findIndex((g) => g.id === id);
		if (index === -1) return undefined;

		db.games[index] = { ...db.games[index], ...dto };
		await writeDB(db);
		return db.games[index];
	},

	async delete(id: number): Promise<boolean> {
		const db = await readDB();
		const index = db.games.findIndex((g) => g.id === id);
		if (index === -1) return false;

		db.games.splice(index, 1);
		await writeDB(db);
		return true;
	},

	async search(query: string, page?: number, limit?: number): Promise<PaginatedResult<Game>> {
		const db = await readDB();
		const lowerQuery = query.toLowerCase();
		const result =  db.games.filter((g) =>
			g.title.toLowerCase().includes(lowerQuery) ||
			g.genre.toLowerCase().includes(lowerQuery) ||
			g.platform.some((p) => p.toLowerCase().includes(lowerQuery))
		);
		return returnPaginatedResults(result, page || 1, limit || 10);
	},

	async filterByGenre(genre: string, page?: number, limit?: number): Promise<PaginatedResult<Game>> {
		const db = await readDB();
		const result = db.games.filter((g) => g.genre.toLowerCase() === genre.toLowerCase());
		return returnPaginatedResults(result, page || 1, limit || 10);
	}
};