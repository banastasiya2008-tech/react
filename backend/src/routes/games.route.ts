import { Router, Request, Response } from 'express';
import { GameRepository } from '../repositories/game.repository.js';

const router = Router();
const gameRepo = new GameRepository();

// router.use(authMiddleware);

function getUserId(req: Request): number {
  return (req as any).user?.id;
}

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await gameRepo.getAll(getUserId(req), page, limit);
  res.json(result);
});

router.get('/search', async (req: Request, res: Response) => {
  const q = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!q) {
    const result = await gameRepo.getAll(getUserId(req), page, limit);
    return res.json(result);
  }

  const result = await gameRepo.search(getUserId(req), q, page, limit);
  res.json(result);
});

router.get('/:id', async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.id as string, 10);
  if (isNaN(gameId)) {
    res.status(400).json({ error: 'Invalid game ID' });
    return;
  }

  const result = await gameRepo.getById(gameId);
  if (!result) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  res.json(result);
});

router.post('/new', async (req: Request, res: Response) => {
  try {
    const result = await gameRepo.create(getUserId(req), req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const gameId = parseInt(req.params.id as string, 10);
    if (isNaN(gameId)) {
      res.status(400).json({ error: 'Invalid game ID' });
      return;
    }

    const result = await gameRepo.update(gameId, getUserId(req), req.body);
    if (!result) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.id as string, 10);
  if (isNaN(gameId)) {
    res.status(400).json({ error: 'Invalid game ID' });
    return;
  }

  const success = await gameRepo.delete(gameId, getUserId(req));
  if (!success) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  res.json({ message: 'Game deleted' });
});

export default router;