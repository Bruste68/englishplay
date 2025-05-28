// config/auth.ts
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || (() => {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.');
  })(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
};

export const GOOGLE_CONFIG = {
  WEB: {
    CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_WEB_CLIENT_SECRET,
    REDIRECT_URI: process.env.GOOGLE_WEB_REDIRECT_URI,
  },
  ANDROID: {
    CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
    REDIRECT_URI: process.env.GOOGLE_APP_REDIRECT_URI,
  },
  EXPO: {
    CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID,
    REDIRECT_URI: process.env.GOOGLE_APP_REDIRECT_URI,
  },
};