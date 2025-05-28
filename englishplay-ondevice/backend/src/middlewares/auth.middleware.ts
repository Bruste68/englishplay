import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model';

dotenv.config();

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🛡️ JWT 인증 요청:');
  console.log('📌 Authorization 헤더:', authHeader);
  console.log('🔐 추출된 토큰:', token);

  if (!token) {
    console.warn('🚫 토큰 없음 - 인증 실패');
    res.status(401).json({ message: '토큰 없음' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log('✅ 토큰 디코딩 성공:', decoded);

    // 👉 앱/웹 모두에서 필요한 정보
    (req as any).user = decoded;

    next();
  } catch (err) {
    console.error('❌ 토큰 검증 실패:', err);
    res.status(403).json({ message: '토큰 오류' });
  }
}
