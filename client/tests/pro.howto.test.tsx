import React from 'react';
import { render, screen } from '@testing-library/react';
import ProHowTo from '../src/components/flow/pro/HowTo';

it('renders Pro HowTo title', () => {
  render(<ProHowTo />);
  expect(screen.getByText('Tune your requirements')).toBeInTheDocument();
});
