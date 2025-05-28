// App.tsx
import { useEffect } from 'react';
import { ensureWhisperModelDownloaded } from './utils/whisperModel';
import Whisper from 'react-native-whisper';
import WhisperDownloadScreen from './screens/WhisperDownloadScreen';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        const modelPath = await ensureWhisperModelDownloaded();
        console.log('📦 모델 저장 위치:', modelPath);

        // ✅ Whisper 객체에 어떤 메서드가 있는지 확인
        console.log('📦 Whisper 메서드 목록:', Object.keys(Whisper));
      } catch (err) {
        console.error('❌ 모델 다운로드 실패:', err);
      }
    })();
  }, []);

  return <WhisperDownloadScreen />;
}
