import express from 'express';
import AuthController from '../controllers/auth/AuthController';
import { authMiddleware } from '../middlewares/auth.middleware';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleLogin);

// Protected routes
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// Google OAuth - import passport only when these routes are called
router.get('/google', (req, res, next) => {
  // Lazy load passport to ensure env vars are loaded
  const passport = require('../config/passport').default;
  
  const accountType = req.query.type || 'individual';
  req.session = req.session || {} as any;
  (req.session as any).accountType = accountType;
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback', 
  (req, res, next) => {
    // Lazy load passport to ensure env vars are loaded
    const passport = require('../config/passport').default;
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' })(req, res, next);
  },
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: (req.user as any)._id, role: (req.user as any).role },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?token=${token}`);
  }
);

export default router;