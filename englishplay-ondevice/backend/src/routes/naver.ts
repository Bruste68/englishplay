import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';

const router = express.Router();

// 네이버 로그인 시작
router.get('/oauth/naver', passport.authenticate('naver', { scope: ['profile'] }));

// 콜백 처리
router.get(
  '/oauth/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/login', session: false }),
  (req, res): void => {
    const user = req.user as any;

    if (!AUTH_CONFIG.JWT_SECRET) {
      console.error('❌ JWT_SECRET이 설정되지 않았습니다.');
      res.status(500).json({ error: '서버 설정 오류(JWT_SECRET)' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      AUTH_CONFIG.JWT_SECRET as string,
      {
        expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN as `${number}s` | `${number}d` | `${number}h` | `${number}m`
      }
    );

    res.redirect(`https://samspeakgo.com/login-success?token=${token}`);
  }
);

export default router;
