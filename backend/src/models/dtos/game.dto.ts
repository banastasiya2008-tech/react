import { Game } from '../game.model.js';

export type CreateGameDTO = Omit<Game, 'id' | 'userId' | 'createdAt'>;
export type UpdateGameDTO = Partial<CreateGameDTO>;