import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { AUTH_CONFIG } from '../config/auth';
import db from '../db';

class AuthService {
  async findUserByEmail(email: string) {
    console.log('📧 [findUserByEmail] 이메일로 사용자 조회 시도:', email);
    const user = await User.findOne({ where: { email } });
    if (user) {
      console.log('✅ 사용자 발견:', user.user_id);
    } else {
      console.warn('❌ 이메일로 사용자 없음:', email);
    }
    return user;
  }

  async findUserById(user_id: string) {
    console.log('🔍 [findUserById] 아이디로 사용자 조회 시도:', user_id);
    const user = await User.findOne({ where: { user_id } });
    if (user) {
      console.log('✅ 사용자 발견:', user.user_id);
    } else {
      console.warn('❌ user_id로 사용자 없음:', user_id);
    }
    return user;
  }

  async validateUser(email: string, password: string) {
    console.log('🔐 [validateUser] 사용자 인증 시도 - 이메일:', email);
    const user = await this.findUserByEmail(email);
    if (!user) {
      console.warn('❌ 사용자 존재하지 않음');
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log('✅ 비밀번호 일치 여부:', isValid);
    return isValid ? user : null;
  }

  async createUser({
    id,
    password,
    name,
    birth,
    email = undefined,
    provider = 'local',
  }: {
    id: string;
    password: string;
    name: string;
    birth: string;
    email?: string;
    provider?: 'google' | 'kakao' | 'facebook' | 'local' | 'yahoo' | 'naver' | 'line';
  }) {
    console.log('🆕 [createUser] 회원가입 요청 수신:', { id, name, birth, email, provider });

    try {
      const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);
      const userPayload = {
        user_id: id,
        name: name || '사용자',
        birth: new Date(birth),
        email,
        password: hashedPassword,
        provider,
        profile_image: '', // 기본 값
        trial_start_at: new Date(),
      };

      console.log('💾 DB에 저장할 유저 정보:', userPayload);

      const newUser = await User.create(userPayload);
      console.log('[createUser] DB 저장 완료:', newUser.user_id);
      return newUser;
    } catch (err) {
      console.error('🔥 [createUser] 사용자 생성 실패:', err);
      throw err;
    }
  }

  async findOrCreateSNSUser({ provider, snsId, name, email }: {
    provider: 'google' | 'kakao' | 'facebook' | 'local' | 'yahoo' | 'naver' | 'line';
    snsId: string;
    name: string;
    email?: string;
  }) {
    console.log('🌐 [findOrCreateSNSUser] SNS 로그인 시도:', { provider, snsId });

    try {
      const user = await User.findOne({ where: { provider, provider_id: snsId } });
      if (user) {
        console.log('📎 기존 SNS 사용자 로그인:', user.user_id);
        return user;
      }

      const newUser = await User.create({
        user_id: `user_${Date.now()}`,
        name,
        email,
        birth: new Date('2000-01-01'),
        provider,
        provider_id: snsId,
        password: `${provider}_${snsId}`,
        trial_start_at: new Date(),
      });

      console.log('✅ 신규 SNS 사용자 생성:', newUser.user_id);
      return newUser;
    } catch (err) {
      console.error('❌ [findOrCreateSNSUser] SNS 사용자 처리 실패:', err);
      throw err;
    }
  }
}

export default new AuthService();