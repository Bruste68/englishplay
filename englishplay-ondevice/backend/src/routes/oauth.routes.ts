import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { OAuthController } from '../controllers/oauth.controller';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';

const router = express.Router();

// ✅ Google OAuth 핸들러
router.post('/google', asyncHandler(OAuthController.handleGoogleAuth));

// ✅ Facebook OAuth 시작
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// ✅ Facebook OAuth 콜백
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login', session: false }),
  (req: Request, res: Response): void => {
    const user = req.user as any;

    if (!AUTH_CONFIG.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined');
      res.status(500).json({ error: 'JWT_SECRET 설정 누락' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      AUTH_CONFIG.JWT_SECRET as string,
      {
        expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN as `${number}s` | `${number}d` | `${number}h` | `${number}m`
      }
    );

    res.redirect(`https://samspeakgo.com/oauth/success?token=${token}`);
  }
);

export default router;
