import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PageShell from '../PageShell';

vi.mock('../../ui/GLBackground', () => ({ default: () => null }));

function renderShell(ui?: React.ReactNode, props?: Partial<Parameters<typeof PageShell>[0]>) {
  return render(
    <PageShell
      title="Test Title"
      metaDescription="Meta description here"
      headerSlot={<div data-testid="header-slot">Header</div>}
      subheaderSlot={<div data-testid="subheader-slot">Subheader</div>}
      actionsSlot={<div data-testid="actions-slot">Actions</div>}
      footerSlot={<div data-testid="footer-slot">Footer</div>}
      {...props}
    >
      {ui ?? <div data-testid="content">Content</div>}
    </PageShell>
  );
}

describe('PageShell', () => {
  it('renders title, header/subheader/actions, and children', () => {
    renderShell();
    expect(screen.getByRole('heading', { level: 1, name: 'Test Title' })).toBeInTheDocument();
    expect(screen.getByTestId('header-slot')).toBeInTheDocument();
    expect(screen.getByTestId('subheader-slot')).toBeInTheDocument();
    expect(screen.getByTestId('actions-slot')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('sets document title and meta description', () => {
    renderShell();
    expect(document.title).toContain('Test Title');
    const meta = document.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute('content')).toBe('Meta description here');
  });

  it('exposes skip link', () => {
    renderShell();
    const skip = screen.getByText('Skip to content');
    expect(skip).toBeInTheDocument();
    expect(skip).toHaveAttribute('href', '#content');
  });

  it('renders history controls when provided and toggles disabled state', () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    renderShell(undefined, { historyControls: { canUndo: true, canRedo: false, onUndo, onRedo } });
    const undo = screen.getByRole('button', { name: 'Undo' });
    const redo = screen.getByRole('button', { name: 'Redo' });
    expect(undo).toBeInTheDocument();
    expect(redo).toBeInTheDocument();
    redo.click();
    expect(onRedo).not.toHaveBeenCalled();
    undo.click();
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('wraps children with Suspense and Error boundary', () => {
    const Boom: React.FC = () => {
      throw new Error('boom');
    };
    renderShell(<Boom />, { errorFallback: <div data-testid="error-fallback">Error</div> });
    expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
  });
});
