import React from 'react';
import { render, screen } from '@testing-library/react';
import SimpleHowTo from '../src/components/flow/simple/HowTo';

it('renders Simple HowTo title', () => {
  render(<SimpleHowTo />);
  expect(screen.getByText('How to use these filters')).toBeInTheDocument();
});
