import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository.js';

const userRepo = new UserRepository();

// user опциональный, но middleware всегда его ставит если проходит
export interface AuthRequest extends Request {
  user?: { id: number; username: string; email: string };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);
  const user = await userRepo.getByToken(token);

  if (!user) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.user = user;
  next();
}