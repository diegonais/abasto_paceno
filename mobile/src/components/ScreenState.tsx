import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

type ScreenStateProps = {
  title: string;
  description?: string;
  loading?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ScreenState({
  title,
  description,
  loading = false,
  actionLabel,
  onActionPress,
}: ScreenStateProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: colors.muted }]}>{description}</Text> : null}
      {actionLabel && onActionPress ? (
        <TouchableOpacity activeOpacity={0.82} onPress={onActionPress} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={[styles.buttonText, { color: colors.surface }]}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
  },
  buttonText: {
    fontWeight: '800',
  },
});
