import { Request, Response } from 'express';
import { AUTH_CONFIG } from '../config/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service';

export class OAuthController {
  static async handleGoogleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        res.status(400).json({ error: 'Access token is required' });
        return;
      }

      // 구글 API로 사용자 정보 요청
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      console.log('📡 Google API 응답:', response.data);
      const { email, name, id: googleId, picture } = response.data;

      if (!email || !googleId) {
        res.status(401).json({ error: 'Failed to fetch user info from Google' });
        return;
      }

      // 사용자 DB에 없으면 생성
      const user = await AuthService.findOrCreateSNSUser({
        provider: 'google',
        snsId: googleId,
        name: name || 'Google User',
        email,
      });

      // JWT 발급
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        AUTH_CONFIG.JWT_SECRET as string,
        {
          expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN as `${number}s` | `${number}d`,
        }
      );

      // 응답 반환
      res.json({
        token,
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name,
          avatar: user.profile_image,
          trialExpired: !!user.trial_start_at,
        },
      });
    } catch (error) {  // 여기에 닫는 중괄호 추가
      console.error('Google OAuth error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
      res.status(500).json({ 
        error: 'OAuth authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}