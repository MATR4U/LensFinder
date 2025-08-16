import React from 'react';
import { render, screen } from '@testing-library/react';
import ReportHowTo from '../src/components/report/ReportHowTo';

describe('ReportHowTo', () => {
  it('renders info title', () => {
    render(<ReportHowTo />);
    expect(screen.getByText('How to read this report')).toBeInTheDocument();
  });
});


