import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { darkTheme, lightTheme, type AppTheme, type ThemeMode } from '../constants/theme';

type ThemeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const value = useMemo<ThemeContextValue>(() => {
    const theme = mode === 'dark' ? darkTheme : lightTheme;

    return {
      mode,
      theme,
      toggleTheme: () => setMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark')),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useAppTheme debe usarse dentro de ThemeProvider.');
  }

  return value;
}
