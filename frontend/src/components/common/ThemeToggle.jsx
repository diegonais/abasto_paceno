import { useEffect, useState } from 'react';

const STORAGE_KEY = 'abasto-theme';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 14.4A7.7 7.7 0 0 1 9.6 3.5a8.7 8.7 0 1 0 10.9 10.9Z" />
    </svg>
  );
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return localStorage.getItem(STORAGE_KEY) ?? 'light';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function handleToggle() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-pressed={isDark}
      onClick={handleToggle}
    >
      <span className={`theme-icon${!isDark ? ' active' : ''}`}>
        <SunIcon />
      </span>
      <span className={`theme-icon${isDark ? ' active' : ''}`}>
        <MoonIcon />
      </span>
    </button>
  );
}
