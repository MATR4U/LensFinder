import React from 'react';
import { render, screen } from '@testing-library/react';
import ReportBadges from '../src/components/report/ReportBadges';

describe('ReportBadges', () => {
  it('renders provided badges', () => {
    render(<ReportBadges topPerformer={{ name: 'Lens A' }} bestValue={{ name: 'Lens B' } as any} lightest={{ name: 'Lens C' }} />);
    expect(screen.getByText(/Top performer: Lens A/)).toBeInTheDocument();
    expect(screen.getByText(/Best value: Lens B/)).toBeInTheDocument();
    expect(screen.getByText(/Best portability: Lens C/)).toBeInTheDocument();
  });
});


