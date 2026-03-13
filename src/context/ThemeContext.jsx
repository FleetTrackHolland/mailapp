import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/** Auto-detects dark vs light based on hour of day.
 *  Dark: 20:00 – 06:59  |  Light: 07:00 – 19:59
 */
function getAutoTheme() {
  const h = new Date().getHours();
  return h >= 20 || h < 7 ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Honour saved manual choice
    const saved = localStorage.getItem('fk-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // 2. Fall back to time-based auto
    return getAutoTheme();
  });

  // Apply `.dark` class to <html> for Tailwind's dark: variants
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('fk-theme', theme);
  }, [theme]);

  // Re-check auto-theme every minute (for the 20:00 / 07:00 transitions)
  useEffect(() => {
    const id = setInterval(() => {
      const saved = localStorage.getItem('fk-theme');
      // Only auto-switch if the user hasn't manually overridden
      if (!saved) setTheme(getAutoTheme());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const toggle = () => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
