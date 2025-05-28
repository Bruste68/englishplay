import React, { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // ✅ 인증 토큰 처리 예시
      console.log('✅ 구글 accessToken:', authentication?.accessToken);
    }
  }, [response]);

  return { promptAsync };
};
