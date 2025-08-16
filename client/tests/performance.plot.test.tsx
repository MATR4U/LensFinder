import React from 'react';
import { render, screen } from '@testing-library/react';
import PerformancePlot from '../src/components/report/PerformancePlot';
import { PlotProvider } from '../src/context/PlotProvider';

describe('PerformancePlot', () => {
  it('renders heading', () => {
    render(
      <PlotProvider>
        <PerformancePlot data={[{ name: 'X', price_chf: 1000, score: 80, rank: 1 }]} />
      </PlotProvider>
    );
    expect(screen.getByText('Performance vs. Price')).toBeInTheDocument();
  });
});


