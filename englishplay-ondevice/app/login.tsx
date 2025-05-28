// app/login.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLanguage } from '../hooks/useLanguage';
import { useSocialLogin } from '../hooks/useSocialLogin';
import { API_BASE_URL } from '../lib/api';

const getSNSOptions = (lang: string) => {
  switch (lang) {
    case 'ko':
      return [
        { id: 'google', icon: require('../assets/icons/ko/google.png') },
        { id: 'kakao', icon: require('../assets/icons/ko/kakao.png') },
        { id: 'naver', icon: require('../assets/icons/ko/naver.png') },
        { id: 'facebook', icon: require('../assets/icons/ko/facebook.png') },
      ];
    case 'zh':
      return [
        { id: 'wechat', icon: require('../assets/icons/zh/wechat.png') },
        { id: 'alipay', icon: require('../assets/icons/zh/alipay.png') },
      ];
    case 'ja':
      return [
        { id: 'google', icon: require('../assets/icons/ja/google.png') },
        { id: 'apple', icon: require('../assets/icons/ja/apple.png') },
        { id: 'line', icon: require('../assets/icons/ja/line.png') },
        { id: 'yahoo', icon: require('../assets/icons/ja/yahoo.png') },
      ];
    case 'vi':
      return [
        { id: 'google', icon: require('../assets/icons/vi/google.png') },
        { id: 'facebook', icon: require('../assets/icons/vi/facebook.png') },
        { id: 'line', icon: require('../assets/icons/ja/line.png') },
      ];
    case 'en':
    default:
      return [
        { id: 'google', icon: require('../assets/icons/en/google.png') },
        { id: 'facebook', icon: require('../assets/icons/en/facebook.png') },
      ];
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { loginWithGoogle } = useSocialLogin();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const snsOptions = useMemo(() => getSNSOptions(language), [language]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ /health 응답:', res.data);
      } catch (err) {
        console.error('❌ /health 실패:', err.message);
      }
    };

    testConnection();
  }, []);

  const handleLogin = async () => {
    console.log('🚀 로그인 버튼 클릭됨');
    console.log('📡 로그인 요청 준비');
    console.log('📡 로그인 요청 주소:', API_BASE_URL);
    if (!userId || !password) {
      Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        id: userId,
        password,
      });

      console.log('✅ 로그인 성공 응답:', response.data);

      if (rememberMe) {
        await AsyncStorage.setItem('savedUserId', userId);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedUserId');
        await AsyncStorage.removeItem('savedPassword');
      }

      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.data.user));

      if (response.data.user.trialExpired) {
        router.replace('/purchase');
      } else {
        // whisper 모델이 필요한 경우
        router.replace('/whisper-download');
      }
    } catch (error) {
      const err = error as any;
      console.error('❌ 로그인 요청 실패:', error.message);
      Alert.alert(
        '로그인 실패',
        err.response?.data?.message || '로그인에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSNSLogin = async (providerId: string) => {
    if (providerId === 'google') await loginWithGoogle();
    else Linking.openURL(`https://samspeakgo.com/oauth/${providerId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🗣️ SamSpeak</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="아이디"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>로그인</Text>}
      </TouchableOpacity>

      <View style={styles.linkRow}>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>회원가입</Text>
        </TouchableOpacity>
        <Text style={styles.linkDivider}>|</Text>
        <TouchableOpacity onPress={() => router.push('/forgot')}>
          <Text style={styles.linkText}>비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checkboxRow}>
        <TouchableOpacity style={styles.checkbox} onPress={() => setRememberMe(!rememberMe)}>
          <View style={styles.checkboxBox}>{rememberMe && <View style={styles.checkboxChecked} />}</View>
          <Text style={styles.checkboxLabel}>아이디와 비밀번호 저장</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.snsContainer}>
        <Text style={styles.snsText}>SNS 로그인</Text>
        <View style={styles.snsRow}>
          {snsOptions.map((sns) => (
            <TouchableOpacity
              key={sns.id}
              style={styles.snsButton}
              onPress={() => handleSNSLogin(sns.id)}
              disabled={googleLoading && sns.id === 'google'}
            >
              {googleLoading && sns.id === 'google' ? (
                <ActivityIndicator size="small" />
              ) : (
                <Image source={sns.icon} style={styles.snsIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.footerButton} onPress={() => router.replace('/language')}>
        <View style={styles.footerButtonContent}>
          <Image source={require('../assets/images/language.png')} style={styles.footerIcon} />
          <Text style={styles.footerText}>언어 선택 화면으로 돌아가기</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 60, justifyContent: 'space-between', backgroundColor: '#fff' },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoText: { fontSize: 28, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
  loginButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8 },
  loginButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  linkText: { color: '#007AFF', marginHorizontal: 6 },
  linkDivider: { color: '#999' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { flexDirection: 'row', alignItems: 'center' },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { width: 12, height: 12, backgroundColor: '#007AFF' },
  checkboxLabel: { fontSize: 14, color: '#333' },
  snsContainer: { marginTop: 32, alignItems: 'center' },
  snsText: { marginBottom: 8, color: '#444' },
  snsRow: { flexDirection: 'row', gap: 16 },
  snsButton: { padding: 10 },
  snsIcon: { width: 28, height: 28, resizeMode: 'contain' },
  footerButton: { marginTop: 24, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  footerButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerIcon: { width: 20, height: 20, resizeMode: 'contain' },
  footerText: { fontSize: 14, color: '#555' },
});
