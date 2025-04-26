import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const getInitialTheme = () => { /* ... logic to get theme ... */ const storedTheme = localStorage.getItem('theme'); if (storedTheme) return storedTheme; if (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) return 'dark'; return 'light'; };

const ThemeContext = createContext();

// ** VERIFIED EXPORT **
export const useTheme = () => {
  return useContext(ThemeContext);
};

// ** VERIFIED EXPORT **
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    const currentTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(currentTheme);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    console.log(`ThemeProvider: Theme changed to ${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};