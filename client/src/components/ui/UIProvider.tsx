import React from 'react';

type Theme = 'system' | 'light' | 'dark';
type Density = 'sm' | 'md' | 'lg';

type UIContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  density: Density;
  setDensity: (d: Density) => void;
  rtl: boolean;
  setRtl: (v: boolean) => void;
};

const UIContext = React.createContext<UIContextValue | null>(null);

type Props = {
  initialTheme?: Theme;
  initialDensity?: Density;
  initialRtl?: boolean;
  children: React.ReactNode;
};

export function UIProvider({ initialTheme = 'system', initialDensity = 'md', initialRtl = false, children }: Props) {
  const [theme, setTheme] = React.useState<Theme>(initialTheme);
  const [density, setDensity] = React.useState<Density>(initialDensity);
  const [rtl, setRtl] = React.useState<boolean>(initialRtl);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dir = rtl ? 'rtl' : 'ltr';
    root.dataset.density = density;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    root.dataset.theme = mode;
  }, [theme, density, rtl]);

  const value = React.useMemo<UIContextValue>(() => ({ theme, setTheme, density, setDensity, rtl, setRtl }), [theme, density, rtl]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = React.useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}


