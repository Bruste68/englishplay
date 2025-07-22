import Constants from 'expo-constants';

let extra: Record<string, any> = {};
try {
  extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
  if (__DEV__) {
    console.log('🌍 [env.ts] extra 확인:', extra);
  }
} catch (err) {
  console.error('❌ Constants 접근 중 에러 발생:', err);
}

// 환경 변수 추출
export const API_BASE_URL =
  extra.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  'http://localhost:5100/api'; // fallback

export const WHISPER_URL =
  extra.EXPO_PUBLIC_WHISPER_URL ||
  process.env.EXPO_PUBLIC_WHISPER_URL ||
  'http://localhost:5100/whisper';

export const ENV = extra.ENV || process.env.ENV || 'development';

export const GOOGLE_CLIENT_ID =
  extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  '';

export const GOOGLE_REDIRECT_URI =
  extra.GOOGLE_APP_REDIRECT_URI ||
  process.env.GOOGLE_APP_REDIRECT_URI ||
  'com.googleusercontent.apps.XXXX:/oauth2redirect';
