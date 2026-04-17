import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/client';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');

  // Load from local storage immediately to prevent flicker
  useEffect(() => {
    const saved = localStorage.getItem('ff_theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  // Sync with user preference when user loads
  useEffect(() => {
    if (user?.theme_preference) {
      setTheme(user.theme_preference as Theme);
      localStorage.setItem('ff_theme', user.theme_preference);
    }
  }, [user]);

  // Apply class to HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('ff_theme', newTheme);
    
    if (user) {
      try {
        await api.patch('auth/me/', { theme_preference: newTheme });
      } catch (err) {
        console.error('Failed to save theme preference', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
