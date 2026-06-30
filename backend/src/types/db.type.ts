import { Game } from "../models/game.model.js";

export interface DB {
	games: Game[];
}