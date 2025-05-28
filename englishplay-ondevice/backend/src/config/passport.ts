import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';
import { AUTH_CONFIG } from './auth';
import AuthService from '../services/auth.service';
import { Strategy as NaverStrategy } from 'passport-naver-v2';
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from 'passport-facebook';
import { Request } from 'express';

// ✅ JWT 전략 설정
if (!AUTH_CONFIG.JWT_SECRET) {
  throw new Error('❌ JWT_SECRET이 정의되지 않았습니다.');
}

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: AUTH_CONFIG.JWT_SECRET as string,
  },
  async (payload: any, done: VerifiedCallback) => {
    try {
      const user = await AuthService.findUserById(payload.userId);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
));

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
  async function (
    req: Request,
    email: string,
    password: string,
    done: (error: any, user?: Express.User | false, options?: IVerifyOptions) => void
  ) {
    try {
      const user = await AuthService.validateUser(email, password);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new NaverStrategy(
  {
    clientID: process.env.NAVER_CLIENT_ID!,
    clientSecret: process.env.NAVER_CLIENT_SECRET!,
    callbackURL: process.env.NAVER_CALLBACK_URL!,
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifiedCallback
  ) => {
    const userData = {
      provider: 'naver' as const,
      snsId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
    };

    const user = await AuthService.findOrCreateSNSUser(userData);
    return done(null, user);
  }
));

passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
    profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: FacebookProfile,
    done: VerifiedCallback
  ) => {
    try {
      const userData = {
        provider: 'facebook' as const,
        snsId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value || '',
      };

      const user = await AuthService.findOrCreateSNSUser(userData);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

export default passport;
