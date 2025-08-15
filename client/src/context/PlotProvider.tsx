import React from 'react';

type PlotConfig = {
  layoutDefaults: any;
  configDefaults: any;
};

const defaultConfig: PlotConfig = {
  layoutDefaults: {
    paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
    margin: { l: 60, r: 20, t: 10, b: 50 },
    font: { color: 'var(--plot-font)' },
    xaxis: { gridcolor: 'var(--plot-grid)' },
    yaxis: { gridcolor: 'var(--plot-grid)' },
  },
  configDefaults: { displayModeBar: false },
};

const PlotContext = React.createContext<PlotConfig>(defaultConfig);

export function PlotProvider({ children, value }: { children: React.ReactNode; value?: Partial<PlotConfig> }) {
  const merged: PlotConfig = {
    layoutDefaults: { ...defaultConfig.layoutDefaults, ...(value?.layoutDefaults || {}) },
    configDefaults: { ...defaultConfig.configDefaults, ...(value?.configDefaults || {}) },
  };
  return <PlotContext.Provider value={merged}>{children}</PlotContext.Provider>;
}

export function usePlotConfig() {
  return React.useContext(PlotContext);
}


