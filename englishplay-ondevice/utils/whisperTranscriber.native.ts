// utils/whisperTranscriber.native.ts
import { initWhisper } from './whisperRunner.native';

export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const whisper = await initWhisper();
    const result = await whisper.transcribe({ audio: audioPath });

    if (!result || !result.text) {
      throw new Error('텍스트 결과가 비어 있습니다.');
    }

    console.log('📝 인식 결과:', result.text);
    return result.text;
  } catch (error) {
    console.error('❌ Whisper 변환 실패:', error);
    throw error;
  }
} 