import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const user = await userService.getUserById(uid); res.json(user); } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  async getLibrary(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const lib = await userService.getLibrary(uid); res.json(lib); } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  async addToLibrary(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const gid = parseInt(req.params.gameId as string, 10); await userService.addToLibrary(uid, gid); res.json({ message: 'Added to library' }); } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  async removeFromLibrary(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const gid = parseInt(req.params.gameId as string, 10); await userService.removeFromLibrary(uid, gid); res.json({ message: 'Removed' }); } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  // CART
  async getCart(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const cart = await userService.getCart(uid); res.json(cart); } catch (e: any) { res.status(500).json({ error: e.message }); }
  }

  async addToCart(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const gid = parseInt(req.params.gameId as string, 10); if (isNaN(gid)) { res.status(400).json({ error: 'Invalid game ID' }); return; } await userService.addToCart(uid, gid); res.json({ message: 'Added to cart' }); } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  async removeFromCart(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; const gid = parseInt(req.params.gameId as string, 10); if (isNaN(gid)) { res.status(400).json({ error: 'Invalid game ID' }); return; } await userService.removeFromCart(uid, gid); res.json({ message: 'Removed from cart' }); } catch (e: any) { res.status(400).json({ error: e.message }); }
  }

  async clearCart(req: Request, res: Response) {
    try { const uid = (req as any).user?.id; await userService.clearCart(uid); res.json({ message: 'Cart cleared' }); } catch (e: any) { res.status(500).json({ error: e.message }); }
  }
}