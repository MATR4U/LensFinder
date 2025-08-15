import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StageNav from '../src/components/ui/StageNav';

describe('StageNav', () => {
  it('fires callbacks for Back/Reset/Continue', () => {
    const onBack = vi.fn();
    const onReset = vi.fn();
    const onContinue = vi.fn();
    render(<StageNav onBack={onBack} onReset={onReset} onContinue={onContinue} continueLabel="Next" useFlowState={false} />);
    fireEvent.click(screen.getByText('Back'));
    fireEvent.click(screen.getByText('Reset'));
    fireEvent.click(screen.getByText('Next'));
    expect(onBack).toHaveBeenCalled();
    expect(onReset).toHaveBeenCalled();
    expect(onContinue).toHaveBeenCalled();
  });
});


