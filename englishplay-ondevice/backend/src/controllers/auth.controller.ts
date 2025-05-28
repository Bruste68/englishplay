// ✅ 디버깅 로그 추가된 auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AUTH_CONFIG } from '../config/auth';
import AuthService from '../services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  console.log("🚀 [login controller] 호출됨");
  try {
    console.log('📥 로그인 요청 수신:', req.body);

    const { id, password } = req.body;

    if (!id || !password) {
      console.warn('⚠️ 필수 항목 누락:', { id, password });
      res.status(400).json({ success: false, message: '아이디와 비밀번호는 필수입니다.' });
      return;
    }

    const user = await AuthService.findUserById(id);
    console.log('🔍 사용자 조회 결과:', user);

    if (!user) {
      res.status(401).json({ success: false, message: '존재하지 않는 사용자입니다.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 비밀번호 비교 결과:', passwordMatch);

    if (!passwordMatch) {
      res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    const payload = { userId: user.user_id, email: user.email };
    const secret = AUTH_CONFIG.JWT_SECRET as string;
    const options: SignOptions = {
      expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN as StringValue
    };

    const token = jwt.sign(payload, secret, options);
    console.log('✅ JWT 생성 완료:', token);

    res.json({
      success: true,
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.profile_image,
        trialExpired: !!user.trial_start_at,
      },
    });
  } catch (error: any) {
    console.error('❌ 로그인 실패:', error.message);
    console.error('📛 상세 정보:', error);
    res.status(500).json({ error: '내부 서버 오류', details: error.message });
  }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 회원가입 요청 수신:', req.body);

    const { id, password, name, birth } = req.body;

    if (!id || !password || !name || !birth) {
      console.warn('⚠️ 필수 필드 누락');
      res.status(400).json({ success: false, message: '모든 항목을 입력해주세요' });
      return;
    }

    const existingUser = await AuthService.findUserById(id);
    console.log('🔎 기존 사용자 조회:', existingUser);

    if (existingUser) {
      console.warn('⚠️ 이미 존재하는 아이디:', id);
      res.status(400).json({ success: false, message: '이미 사용 중인 아이디입니다' });
      return;
    }

    if (!/\d{4}-\d{2}-\d{2}/.test(birth)) {
      console.warn('⚠️ 생일 포맷 오류:', birth);
      res.status(400).json({ success: false, message: '생년월일은 YYYY-MM-DD 형식으로 입력해주세요' });
      return;
    }

    console.log('🔐 비밀번호 해싱 시작...');
    const newUser = await AuthService.createUser({
      id,
      password,
      name,
      birth,
      provider: 'local', // ✅ 수정된 부분
    });
    console.log('🆕 사용자 생성 완료:', newUser);

    const payload = { userId: newUser.user_id, email: newUser.email };
    const secret = AUTH_CONFIG.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET 누락') })();
    const options: SignOptions = {
      expiresIn: AUTH_CONFIG.JWT_EXPIRES_IN as StringValue
    };
    const token = jwt.sign(payload, secret, options);
    console.log('✅ 회원가입 토큰 생성 완료:', token);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.user_id,
        name: newUser.name,
        trialExpired: !!newUser.trial_start_at,
      },
    });
  } catch (error: any) {
    console.error('🔥 회원가입 실패:', error.message);
    console.error('📛 상세 정보:', error);
    res.status(500).json({ success: false, message: '회원가입 처리 중 오류가 발생했습니다', error: error.message });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    console.log('🙋‍♂️ /api/me 요청 - userId:', userId);

    if (!userId) {
      console.warn('❌ userId 누락 - 인증되지 않은 요청');
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await AuthService.findUserById(userId);
    console.log('🧾 사용자 정보:', user);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        avatar: user.profile_image,
        trialExpired: !!user.trial_start_at,
      },
    });
  } catch (error) {
    console.error('🔥 /api/me 처리 중 에러:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkId = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 이메일 중복 확인 요청:', req.body);
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: '이메일이 필요합니다.' });
      return;
    }

    const user = await AuthService.findUserByEmail(email);
    console.log('📧 이메일 존재 여부:', !!user);
    res.json({ exists: !!user });
  } catch (error) {
    console.error('이메일 확인 실패:', error);
    res.status(500).json({ message: '서버 오류' });
  }
};
