import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Authentication routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);
router.get('/user', authController.getUser);
router.post('/refresh', authController.refreshSession);
router.post('/reset-password', authController.resetPassword);

// Health check for auth service
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Authentication Service',
    timestamp: new Date().toISOString(),
    supabase: {
      configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
    }
  });
});

export default router;
