import 'dotenv/config';

export default {
  name: 'englishplay-ondevice',
  slug: 'englishplay-ondevice',
  version: '1.0.0',
  scheme: 'englishplayondevice',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.bruste68.englishplayondevice'
  },
  android: {
    package: 'com.bruste68.englishplayondevice',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [],
    googleServicesFile: './google-services.json',
    buildProperties: {
      kotlinVersion: "1.8.10"
    }
  },
  plugins: [
    'expo-dev-client',
  ],
  extra: {
    eas: {
      projectId: '3c63c36b-05ee-41fb-aa8e-1d8c56077f3b'
    },
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_APP_REDIRECT_URI: process.env.GOOGLE_APP_REDIRECT_URI,
    NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
    NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
    NAVER_CALLBACK_URL: process.env.NAVER_CALLBACK_URL,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL,
    API_BASE_URL: 'https://samspeakgo.com/api'
  }
};
