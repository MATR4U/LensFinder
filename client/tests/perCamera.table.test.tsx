import React from 'react';
import { render, screen } from '@testing-library/react';
import PerCameraTable from '../src/components/PerCameraTable';

it('renders per-camera rows', () => {
  render(<PerCameraTable counts={{ A: 3, B: 1 }} />);
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();
});


