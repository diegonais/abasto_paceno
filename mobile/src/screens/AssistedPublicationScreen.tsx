import { Ionicons } from '@expo/vector-icons';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { transcribePublicationAudio } from '../api/aiPublication';
import { BrandLogo } from '../components/BrandLogo';
import { ThemeToggle } from '../components/ThemeToggle';
import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

function buildAudioFileName(uri: string) {
  const extension = uri.split('.').pop()?.split('?')[0] || 'm4a';
  return `publicacion-audio.${extension}`;
}

function buildAudioMimeType(uri: string) {
  const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase();

  if (extension === 'webm') {
    return 'audio/webm';
  }

  if (extension === 'wav') {
    return 'audio/wav';
  }

  if (extension === 'mp3') {
    return 'audio/mpeg';
  }

  if (extension === 'ogg') {
    return 'audio/ogg';
  }

  return 'audio/mp4';
}

export function AssistedPublicationScreen() {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [description, setDescription] = useState('');
  const [detectedText, setDetectedText] = useState('');
  const [submittingAudio, setSubmittingAudio] = useState(false);
  const [error, setError] = useState('');

  const startRecording = async () => {
    setError('');
    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      setError('Necesitamos permiso de microfono para grabar el audio.');
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecordingAndTranscribe = async () => {
    setError('');
    setSubmittingAudio(true);

    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });

      const audioUri = recorder.uri;

      if (!audioUri) {
        throw new Error('No se pudo obtener el archivo de audio grabado.');
      }

      const { transcription } = await transcribePublicationAudio({
        uri: audioUri,
        name: buildAudioFileName(audioUri),
        type: buildAudioMimeType(audioUri),
      });

      setDetectedText(transcription);
      setDescription(transcription);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo transcribir el audio.');
    } finally {
      setSubmittingAudio(false);
    }
  };

  const showManualReviewMessage = () => {
    Alert.alert(
      'Revision pendiente',
      'La transcripcion solo preparo el texto. Revisa, edita y completa los datos antes de publicar la oferta.',
    );
  };

  const recordingSeconds = Math.round(recorderState.durationMillis / 1000);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.cream }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <BrandLogo />
            <ThemeToggle />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Publicar con ayuda de audio</Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            Graba una oferta corta. El texto detectado se coloca en el formulario para que lo revises antes de publicar.
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Audio de la oferta</Text>
          <Pressable
            accessibilityRole="button"
            disabled={submittingAudio}
            onPress={recorderState.isRecording ? stopRecordingAndTranscribe : startRecording}
            style={({ pressed }) => [
              styles.recordButton,
              {
                backgroundColor: recorderState.isRecording ? colors.primaryActive : colors.primary,
                opacity: pressed || submittingAudio ? 0.82 : 1,
              },
            ]}
          >
            {submittingAudio ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Ionicons name={recorderState.isRecording ? 'stop' : 'mic'} color="#ffffff" size={24} />
            )}
            <Text style={styles.recordButtonText}>
              {submittingAudio
                ? 'Transcribiendo...'
                : recorderState.isRecording
                  ? `Detener y transcribir (${recordingSeconds}s)`
                  : 'Grabar audio'}
            </Text>
          </Pressable>
          <Text style={[styles.helper, { color: colors.muted }]}>
            La grabacion no crea ofertas automaticamente.
          </Text>
          {error ? <Text style={[styles.error, { backgroundColor: colors.errorBg, color: colors.primary }]}>{error}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Texto detectado por audio</Text>
          <TextInput
            multiline
            value={detectedText}
            onChangeText={setDetectedText}
            placeholder="Aqui aparecera la transcripcion del audio."
            placeholderTextColor={colors.muted}
            style={[
              styles.textArea,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Descripcion de la oferta</Text>
          <TextInput
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="Edita el texto antes de publicar. Ej: Tengo huevo a 28 bolivianos el maple..."
            placeholderTextColor={colors.muted}
            style={[
              styles.textArea,
              styles.largeTextArea,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={showManualReviewMessage}
          style={({ pressed }) => [
            styles.reviewButton,
            {
              backgroundColor: colors.success,
              opacity: pressed ? 0.82 : 1,
            },
          ]}
        >
          <Text style={styles.reviewButtonText}>Revisar datos antes de publicar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 124,
  },
  header: {
    gap: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
  },
  panel: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '900',
  },
  recordButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    padding: spacing.md,
    borderRadius: 8,
    fontWeight: '700',
  },
  formGroup: {
    gap: spacing.sm,
  },
  textArea: {
    minHeight: 112,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  largeTextArea: {
    minHeight: 156,
  },
  reviewButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
