import { Router } from "express";
import { gameService } from "../services/game.service.js";

const router = Router();

router.get("/", async (_req, res) => {
	const result = await gameService.getAll();
	if (!result) {
		res.status(404).json({ error: "Game not found" });
		return;
	}
	res.json(result);
});

router.get("/search", async (req, res) => {
	const query = req.query.q as string;
	const result = await gameService.search(query);
	res.json(result);
});

router.get("/filter", async (req, res) => {
	const genre = req.query.genre as string;
	const result = await gameService.filterByGenre(genre);
	res.json(result);
});

router.get("/:id", async (req, res) => {
	const gameId = req.params.id;
	const result = await gameService.getById(parseInt(gameId));
	if (!result) {
		res.status(404).json({ error: "Game not found" });
		return;
	}
	res.json(result);
});

router.post("/new", async (_req, res) => {
	try {
		const result = await gameService.create(_req.body);
		res.status(201).json(result);
	} catch (error) {
		res.status(400).json({ error: "Failed to create game" });
	}
});

router.put("/:id", async (req, res) => {
	const gameId = req.params.id;
	try {
		const result = await gameService.update(parseInt(gameId), req.body);
		if (!result) {
			res.status(404).json({ error: "Game not found" });
			return;
		}
		res.json(result);
	} catch (error) {
		res.status(400).json({ error: "Failed to update game" });
	}
});

router.delete("/:id", async (req, res) => {
	const gameId = req.params.id;
	try {
		const result = await gameService.delete(parseInt(gameId));
		
		if (!result) {
			res.status(404).json({ error: "Game not found" });
			return;
		}

		res.json({ message: "Game deleted successfully" });
	} catch (error) {
		res.status(400).json({ error: "Failed to delete game" });
	}
});

export default router;