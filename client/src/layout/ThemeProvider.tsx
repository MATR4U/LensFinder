import React from 'react';

type Theme = {
  mode: 'light' | 'dark';
};

const ThemeContext = React.createContext<Theme>({ mode: 'light' });

export function ThemeProvider({ children, mode = 'light' }: { children: React.ReactNode; mode?: 'light' | 'dark' }) {
  React.useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);
  return <ThemeContext.Provider value={{ mode }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
