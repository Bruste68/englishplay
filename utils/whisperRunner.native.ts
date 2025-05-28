import { loadModel } from './whisperModel';
import * as Whisper from 'react-native-whisper';

let whisperInstance: typeof Whisper | null = null;

export async function initWhisper(): Promise<typeof Whisper> {
  if (whisperInstance) return whisperInstance;

  const modelPath = await loadModel();
  console.log('📦 Whisper 모델 경로:', modelPath);

  try {
    await Whisper.loadModel(modelPath);
    console.log('✅ Whisper 모델 로드 완료');
    whisperInstance = Whisper;
    return whisperInstance;
  } catch (err) {
    console.error('❌ Whisper 모델 초기화 실패:', err);
    throw err;
  }
}
