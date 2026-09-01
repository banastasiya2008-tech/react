import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();
const c = new UserController();

router.get('/', authMiddleware, c.getProfile);
router.get('/library', authMiddleware, c.getLibrary);
router.post('/library/:gameId', authMiddleware, c.addToLibrary);
router.delete('/library/:gameId', authMiddleware, c.removeFromLibrary);

// CART
router.get('/cart', authMiddleware, c.getCart);
router.post('/cart/:gameId', authMiddleware, c.addToCart);
router.delete('/cart/:gameId', authMiddleware, c.removeFromCart);
router.delete('/cart', authMiddleware, c.clearCart);

export default router;