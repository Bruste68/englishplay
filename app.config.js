import 'dotenv/config';

const { withDangerousMod } = require('@expo/config-plugins');
const { withBuildProperties } = require('expo-build-properties');
const fs = require('fs');
const path = require('path');

// 환경 설정
const ENV = process.env.ENV || 'development';
const IS_DEV = ENV === 'development';

const withGoogleServicesJson = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      const appPath = path.resolve('./android/app');
      const gsPath = path.join(appPath, 'google-services.json');
      if (!fs.existsSync(appPath)) fs.mkdirSync(appPath, { recursive: true });

      const base64 = process.env.GOOGLE_SERVICES_JSON;
      if (base64) {
        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(gsPath, buffer);
        console.log('✅ google-services.json created');
      } else {
        console.warn('⚠️ GOOGLE_SERVICES_JSON not set');
      }
      return config;
    }
  ]);
};

module.exports = ({ config }) => {
  config = withGoogleServicesJson(config);
  config = withBuildProperties(config, {
    android: {
      minSdkVersion: 24,
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      kotlinVersion: '1.8.22',
    },
  });

  return {
    ...config,
    name: IS_DEV ? 'SamSpeakDev' : 'SamSpeakEn',
    slug: IS_DEV ? 'englishplay-ondevice' : 'englishplay-ondevice',
    scheme: IS_DEV ? 'englishplay' : 'englishplay',
    android: {
      package: IS_DEV
        ? 'com.bruste68.englishplayondevice'
        : 'com.bruste68.englishplayondevice.play',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      permissions: [],
      googleServicesFile: './google-services.json',
    },
    extra: {
      eas: { projectId: '3c63c36b-05ee-41fb-aa8e-1d8c56077f3b' },
      ENV,
      EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      EXPO_PUBLIC_WHISPER_URL: process.env.EXPO_PUBLIC_WHISPER_URL,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      GOOGLE_APP_REDIRECT_URI: process.env.GOOGLE_APP_REDIRECT_URI,
    },
  };
};
