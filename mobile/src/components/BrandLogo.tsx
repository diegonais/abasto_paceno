import { Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

const logoSource = require('../../assets/abasto-paceno.png');

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.frame,
        compact ? styles.compactFrame : styles.frameDefault,
        {
          backgroundColor: colors.cream,
        },
      ]}
    >
      <Image
        source={logoSource}
        resizeMode="contain"
        style={[
          compact ? styles.compactLogo : styles.logo,
          theme.mode === 'dark' && styles.darkLogo,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  frameDefault: {
    width: 128,
    height: 96,
  },
  compactFrame: {
    width: 92,
    height: 68,
  },
  logo: {
    width: 120,
    height: 88,
  },
  compactLogo: {
    width: 86,
    height: 62,
  },
  darkLogo: {
    tintColor: '#ffffff',
  },
});
