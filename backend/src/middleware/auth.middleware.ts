import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.service.js';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; email: string; role: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    req.user = { 
      id: decoded.userId, 
      username: decoded.username,
      email: decoded.email,
      role: decoded.role 
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}