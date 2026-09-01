import { Router, Request, Response } from 'express';
import { UserRepository } from '../repositories/user.repository.js';
import { TokenRepository } from '../repositories/token.repository.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../services/token.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const userRepo = new UserRepository();
const tokenRepo = new TokenRepository();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await userRepo.register(req.body);
    
    const payload = { userId: user.id, username: user.username, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepo.create(user.id, refreshToken, expiresAt);
    
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    
    res.status(201).json({ user, accessToken });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const user = await userRepo.login(req.body);
    
    const payload = { userId: user.id, username: user.username, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepo.create(user.id, refreshToken, expiresAt);
    
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    
    res.json({ user, accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }
    
    const payload = verifyToken(refreshToken);
    
    const storedToken = await tokenRepo.findByToken(refreshToken);
    if (!storedToken) {
      res.clearCookie('refreshToken');
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    
    await tokenRepo.deleteByToken(refreshToken);
    
    const user = await userRepo.getById(payload.userId);
    if (!user) {
      res.clearCookie('refreshToken');
      res.status(401).json({ error: 'User not found' });
      return;
    }
    
    const newPayload = { userId: user.id, username: user.username, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await tokenRepo.create(user.id, newRefreshToken, expiresAt);
    
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    
    res.json({ user, accessToken: newAccessToken });
  } catch (error: any) {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await tokenRepo.deleteByToken(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json(user);
});

export default router;