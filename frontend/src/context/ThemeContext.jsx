import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);

const THEMES = {
  light: {
    name: 'Light',
    icon: '☀️',
    class: '',
    colors: {
      primary: '#6366f1',
      accent: '#8b5cf6',
    },
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    class: 'dark',
    colors: {
      primary: '#818cf8',
      accent: '#a78bfa',
    },
  },
  midnight: {
    name: 'Midnight',
    icon: '🌑',
    class: 'midnight',
    colors: {
      primary: '#7c7cff',
      accent: '#9d9dc8',
    },
  },
  aurora: {
    name: 'Aurora',
    icon: '🌌',
    class: 'aurora',
    colors: {
      primary: '#06b6d4',
      accent: '#7dd3fc',
    },
  },
  glass: {
    name: 'Glass',
    icon: '💎',
    class: 'glass-theme',
    colors: {
      primary: '#6366f1',
      accent: '#818cf8',
    },
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('marsana-theme') || 'light';
    } catch {
      return 'light';
    }
  });

  const [isSystemDark, setIsSystemDark] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsSystemDark(mediaQuery.matches);

    const handler = (e) => setIsSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    Object.values(THEMES).forEach((t) => {
      if (t.class) {
        root.classList.remove(t.class);
      }
    });

    const currentTheme = THEMES[theme] || THEMES.light;
    if (currentTheme.class) {
      root.classList.add(currentTheme.class);
    }

    try {
      localStorage.setItem('marsana-theme', theme);
    } catch {}
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    cycleTheme,
    themes: THEMES,
    currentTheme: THEMES[theme] || THEMES.light,
    isDark: theme === 'dark' || theme === 'midnight' || theme === 'aurora',
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
