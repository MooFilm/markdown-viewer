import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'md-viewer-theme';

export function getTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateTheme = (next: Theme) => {
    setTheme(next);
    setThemeState(next);
  };

  const toggleTheme = () => updateTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, setTheme: updateTheme, toggleTheme };
}
