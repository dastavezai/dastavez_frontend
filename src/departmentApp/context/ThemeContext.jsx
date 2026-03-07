import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { themes, defaultTheme, themeList } from '../theme';

const STORAGE_KEY = 'dastavez-theme';

const ThemeContext = createContext(null);

export const AppThemeProvider = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState(
    () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && themes[stored] ? stored : defaultTheme;
    }
  );

  const setTheme = useCallback((key) => {
    if (!themes[key]) return;
    localStorage.setItem(STORAGE_KEY, key);
    setActiveThemeState(key);
  }, []);

  const chakraTheme = useMemo(() => themes[activeTheme] || themes[defaultTheme], [activeTheme]);
  const themeInfo = useMemo(() => themeList.find((t) => t.key === activeTheme) || themeList[0], [activeTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, chakraTheme, themeInfo, themeList }}>
      <ColorModeScript initialColorMode={chakraTheme.config?.initialColorMode || 'dark'} />
      <ChakraProvider theme={chakraTheme}>
        {children}
      </ChakraProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used inside <AppThemeProvider>');
  return ctx;
};

export default ThemeContext;
