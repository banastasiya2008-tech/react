import { Router } from 'express';
import { GameController } from '../controllers/game.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
const router = Router();
const c = new GameController();

router.get('/', c.getAll);
router.get('/search', c.search);
router.get('/:id', c.getById);
router.post('/new', authMiddleware, requireRole('admin','moderator'), c.create);
router.put('/:id', authMiddleware, requireRole('admin','moderator'), c.update);
router.delete('/:id', authMiddleware, requireRole('admin'), c.delete);
router.post('/:id/rate', authMiddleware, c.rate);

export default router;