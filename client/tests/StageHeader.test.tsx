import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StageHeader from '../src/components/ui/StageHeader';

describe('StageHeader', () => {
  it('renders title and matches badge', () => {
    render(<StageHeader title="Tune" resultsCount={7} />);
    expect(screen.getByText('Tune')).toBeTruthy();
    expect(screen.getByText(/Showing 7 matches/)).toBeTruthy();
  });
});


