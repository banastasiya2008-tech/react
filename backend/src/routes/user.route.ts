import { Router, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const userRepo = new UserRepository();

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  const user = await userRepo.getById(userId);
  res.json(user);
});

export default router;