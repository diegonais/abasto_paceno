import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { mode, theme, toggleTheme } = useAppTheme();
  const { colors } = theme;

  return (
    <Pressable
      accessibilityLabel="Cambiar tema"
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surfaceSoft,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: mode === 'light' ? colors.primary : 'transparent',
          },
        ]}
      >
        <Ionicons name="sunny" color={mode === 'light' ? colors.surface : colors.muted} size={14} />
      </View>
      <View
        style={[
          styles.icon,
          {
            backgroundColor: mode === 'dark' ? '#007934' : 'transparent',
          },
        ]}
      >
        <Ionicons name="moon" color={mode === 'dark' ? '#ffffff' : colors.muted} size={14} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 58,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: 4,
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
