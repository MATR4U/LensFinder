import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import FocalRange from '../src/components/flow/FocalRange';
import { useFilterStore } from '../src/stores/filterStore';

describe('FocalRange', () => {
  it('renders with default bounds and label', () => {
    const s = useFilterStore.getState();
    s.setProFocalMin(24);
    s.setProFocalMax(70);
    render(<FocalRange />);
    expect(screen.getByText('Desired focal range (mm)')).toBeTruthy();
  });
});


