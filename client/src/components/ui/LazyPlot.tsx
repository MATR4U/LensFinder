import React from 'react';

const LazyPlot = React.lazy(async () => {
  const [plotlyMod, factoryMod] = await Promise.all([
    import('plotly.js-dist-min'),
    import('react-plotly.js/factory')
  ]);
  const createPlotlyComponent = (factoryMod as any).default || (factoryMod as any);
  const Plot = createPlotlyComponent((plotlyMod as any).default || (plotlyMod as any));
  return { default: Plot } as any;
});

export default LazyPlot;


