import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage, translations } from '../hooks/useLanguage';
import type { Message, FeedbackItem, DialogState, LanguageCode, PracticeScene, TopicType, LevelType } from '../types';


const languages = [
  { code: 'en', label: 'English', emoji: '🇺🇸' },
  { code: 'ko', label: '한국어', emoji: '🇰🇷' },
  { code: 'zh', label: '中文', emoji: '🇨🇳' },
  { code: 'ja', label: '日本語', emoji: '🇯🇵' },
  { code: 'vi', label: 'Tiếng Việt', emoji: '🇻🇳' },
];

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { setLanguage, t, isReady } = useLanguage();

  const checkTrialExpired = async (): Promise<boolean> => {
    const startDate = await AsyncStorage.getItem('trialStartDate');
    if (startDate) {
      const start = new Date(startDate);
      const now = new Date();
      const diff = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 30;
    }
    return false;
  };  

  useEffect(() => {
    const initTrialDateIfNotExists = async () => {
      const existing = await AsyncStorage.getItem('trialStartDate');
      if (!existing) {
        const now = new Date().toISOString();
        await AsyncStorage.setItem('trialStartDate', now);
        console.log('📆 trialStartDate 초기화됨:', now);
      } else {
        console.log('📆 기존 trialStartDate:', existing);
      }
    };

    initTrialDateIfNotExists();
  }, []);

  const selectLanguage = async (code: string) => {
    try {
      console.log('📌 언어 선택됨:', code);

      await setLanguage(code as LanguageCode);
      console.log('✅ 언어 상태 업데이트 완료');

      const tByCode = translations[code as LanguageCode];
      if (!tByCode) throw new Error(`translations[${code}] is undefined`);

      const isExpired = await checkTrialExpired();
      console.log('⏰ 체험 만료 상태:', isExpired);

      if (isExpired) {
        console.log('⚠️ Alert 실행 시도');
        Alert.alert(
          tByCode.trialExpiredTitle,
          tByCode.trialExpiredMessage,
          [
            {
              text: tByCode.cancelPurchase,
              onPress: () => {
                console.log('❌ 구매 취소 클릭됨');
                router.replace('/language');
              },
              style: 'cancel',
            },
            {
              text: tByCode.purchaseNow,
              onPress: () => {
                console.log('💳 구매 시도 클릭됨');

                // ✅ setLanguage의 상태 반영을 기다릴 시간 확보
                  if (code.startsWith('zh')) {
                     router.push('/purchase/china');
                  } else {
                     router.push('/purchase');
                  }
              },
            },
          ]
        );
      } else {
        console.log('➡️ 체험중 - 로그인 화면으로 이동');
        router.replace('/login');
      }
    } catch (error) {
      console.error('Language selection error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>🌍 {t.selectLanguage || 'Select Language'}</Text>

        {languages.map(({ code, label, emoji }) => (
          <TouchableOpacity
            key={code}
            style={styles.cardButton}
            onPress={() => selectLanguage(code)}
          >
            <Text style={styles.cardText}>{emoji} {label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.noticeBox}>
        <Text style={styles.noticeTitle}>☞ {t.noticeTitle || 'Notice'}</Text>
        <Text style={styles.noticeText}>  -. {t.notice1 || 'Speak loudly near the microphone.'}</Text>
        <Text style={styles.noticeText}>  -. {t.notice2 || 'AI response may be delayed in case of traffic surge.'}</Text>
        <Text style={styles.noticeText}>  -. {t.notice3 || 'You need to repurchase after one year.'}</Text>
        <Text style={styles.noticeText}>  -. {t.notice4 || 'Free talk mode may change later.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfaf5',
    paddingHorizontal: 20,
    paddingTop: 65,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3e3e3e',
    marginBottom: 20,
  },
  cardButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  noticeBox: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
});
