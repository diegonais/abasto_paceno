export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryActive: string;
    cream: string;
    creamAlt: string;
    surface: string;
    surfaceSoft: string;
    success: string;
    warning: string;
    text: string;
    muted: string;
    border: string;
    overlay: string;
    tabBar: string;
    tabActive: string;
    tabInactive: string;
    tabTextActive: string;
    tabTextInactive: string;
    mapHeader: string;
    errorBg: string;
    badgeBg: string;
  };
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: '#7b1835',
    primaryActive: '#aa2950',
    cream: '#fffaf3',
    creamAlt: '#fff4ed',
    surface: '#ffffff',
    surfaceSoft: 'rgba(255, 255, 255, 0.82)',
    success: '#0f7d50',
    warning: '#c77913',
    text: '#2f1e24',
    muted: '#776267',
    border: '#ead9d2',
    overlay: 'rgba(48, 17, 27, 0.42)',
    tabBar: 'rgba(255, 250, 243, 0.94)',
    tabActive: 'rgba(123, 24, 53, 0.12)',
    tabInactive: '#7b1835',
    tabTextActive: '#7b1835',
    tabTextInactive: '#776267',
    mapHeader: 'rgba(255, 250, 243, 0.94)',
    errorBg: 'rgba(170, 41, 80, 0.1)',
    badgeBg: 'rgba(123, 24, 53, 0.08)',
  },
  shadow: {
    shadowColor: '#7b1835',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    primary: '#7fdca9',
    primaryActive: '#a8efc4',
    cream: '#101722',
    creamAlt: '#18212e',
    surface: '#18212e',
    surfaceSoft: 'rgba(24, 33, 46, 0.9)',
    success: '#78d8ad',
    warning: '#f6c071',
    text: '#f8f0df',
    muted: '#c7b89f',
    border: 'rgba(248, 240, 223, 0.16)',
    overlay: 'rgba(6, 10, 16, 0.68)',
    tabBar: 'rgba(24, 33, 46, 0.94)',
    tabActive: 'rgba(0, 121, 52, 0.36)',
    tabInactive: '#f8f0df',
    tabTextActive: '#7fdca9',
    tabTextInactive: '#f8f0df',
    mapHeader: 'rgba(16, 23, 34, 0.94)',
    errorBg: 'rgba(0, 121, 52, 0.26)',
    badgeBg: 'rgba(127, 220, 169, 0.12)',
  },
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 6,
  },
};
