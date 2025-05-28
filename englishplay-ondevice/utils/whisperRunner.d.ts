declare module 'react-native-whisper' {
  export function transcribe(audioPath: string): Promise<{ text: string }>;
  export function loadModel(path: string): Promise<any>;
}
