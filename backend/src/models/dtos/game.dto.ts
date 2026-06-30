import { Game } from "../game.model.js";

export type CreateGameDTO = Omit<Game, 'id'>;
export type UpdateGameDTO = Partial<CreateGameDTO>;