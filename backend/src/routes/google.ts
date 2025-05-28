import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service'; // ← 유저 조회/생성 로직 필요
import { AUTH_CONFIG } from '../config/auth';

const router = express.Router();

router.post('/google-token', async (req, res) => {
  const { token } = req.body;

  try {
    const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { email, name, id: googleId, picture } = userRes.data;

    // DB에 SNS 사용자 조회/생성
    const user = await AuthService.findOrCreateSNSUser({
      provider: 'google',
      snsId: googleId,
      name: name || 'Google User',
      email,
    });

    const jwtToken = jwt.sign(
      { userId: user.user_id, email: user.email },
      AUTH_CONFIG.JWT_SECRET as string,
      { 
         expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN as `${number}s` | `${number}m` | `${number}h` | `${number}d`,
      }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.profile_image,
      },
    });
  } catch (error: any) {
    const msg = error?.response?.data || error?.message || 'Google login error';
    console.error('Google OAuth error:', msg);
    res.status(400).json({ error: 'Google login failed', detail: msg });
  }
});

export default router;
