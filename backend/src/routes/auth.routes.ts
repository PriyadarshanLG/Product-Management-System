import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { requireAdmin } from '../middleware/admin-auth.middleware';

const router = Router();
const controller = new AuthController();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sign-in attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, (req, res) => controller.login(req, res));
router.get('/session', requireAdmin, (req, res) => controller.session(req, res));

export default router;