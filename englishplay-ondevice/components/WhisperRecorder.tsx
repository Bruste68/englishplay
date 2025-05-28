// components/WhisperRecorder.tsx
import React, { useState, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { transcribeAudio } from '../utils/whisperRunner';

export default function WhisperRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('🎙️ 마이크 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      recordingRef.current = newRecording;
    } catch (err) {
      console.error('녹음 시작 실패:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      console.log('🎧 녹음 저장 위치:', uri);
      setRecording(null);

      if (uri) {
        setIsProcessing(true);
        const result = await transcribeAudio(uri);
        setTranscript(result);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('녹음 종료 실패:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={recording ? '⏹️ 녹음 종료' : '🎙️ 녹음 시작'}
        onPress={recording ? stopRecording : startRecording}
      />
      {isProcessing && <Text>Whisper 변환 중...</Text>}
      {transcript !== '' && (
        <View style={styles.result}>
          <Text style={styles.label}>📝 변환 결과:</Text>
          <Text style={styles.text}>{transcript}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  result: { marginTop: 20 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  text: { fontSize: 16, color: '#333' },
});
