import { Router, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository.js';
// import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userRepo = new UserRepository();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = await userRepo.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await userRepo.login(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  
  await userRepo.logout(userId);
  res.json({ message: 'Logged out' });
});

export default router;