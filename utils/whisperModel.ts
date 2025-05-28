// utils/whisperModel.ts

export type WhisperModelType = 'tiny' | 'small' | 'base';

interface WhisperModelInfo {
  type: WhisperModelType;
  filename: string;
  url: string;
}

const BASE_URL = 'https://whisper-english-app.oss-ap-southeast-1.aliyuncs.com';

export const getWhisperModelInfo = (modelType: WhisperModelType): WhisperModelInfo => {
  const filename = `ggml-${modelType}.bin`;
  return {
    type: modelType,
    filename,
    url: `${BASE_URL}/${filename}`,
  };
};