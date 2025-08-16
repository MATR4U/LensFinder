import React from 'react';
import { render, screen } from '@testing-library/react';
import FinalVerdict from '../src/components/report/FinalVerdict';

it('renders Final Verdict list items when provided', () => {
  render(<FinalVerdict topPerformer={{ name: 'Lens X' }} bestValue={{ name: 'Lens Y' }} lightest={{ name: 'Lens Z' }} />);
  expect(screen.getByText(/Final Verdict/)).toBeInTheDocument();
  expect(screen.getByText('Top Performer:')).toBeInTheDocument();
  expect(screen.getByText('Lens X')).toBeInTheDocument();
});
