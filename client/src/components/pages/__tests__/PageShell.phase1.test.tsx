import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageShell from '../PageShell';

vi.mock('../../ui/GLBackground', () => ({ default: () => null }));

function renderShell(ui?: React.ReactNode, props?: Partial<Parameters<typeof PageShell>[0]>) {
  return render(
    <PageShell
      title="Phase1"
      headerSlot={<div data-testid="hdr">H</div>}
      topbarSlot={<div data-testid="topbar">T</div>}
      sidebarSlot={<div data-testid="sidebar">S</div>}
      breadcrumbSlot={<div data-testid="crumbs">C</div>}
      {...props}
    >
      {ui ?? <div data-testid="content">Body</div>}
    </PageShell>
  );
}

describe('PageShell Phase 1 additions', () => {
  it('renders topbar, breadcrumb, and content', () => {
    renderShell();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByTestId('crumbs')).toBeInTheDocument();
    expect(screen.getByText('Phase1')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('accepts sidebar in inline mode by default', () => {
    renderShell();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders without sidebar when not provided', () => {
    renderShell(undefined, { sidebarSlot: undefined });
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('renders sidebar as overlay when sidebarMode="overlay"', () => {
    renderShell(undefined, { sidebarMode: 'overlay', sidebarOpen: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('overlay backdrop click calls onRequestCloseSidebar', async () => {
    const onClose = vi.fn();
    renderShell(undefined, { sidebarMode: 'overlay', sidebarOpen: true, onRequestCloseSidebar: onClose });
    const backdrop = screen.getByRole('button', { hidden: true });
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('overlay close button and Escape call onRequestCloseSidebar', async () => {
    const onClose = vi.fn();
    renderShell(undefined, { sidebarMode: 'overlay', sidebarOpen: true, onRequestCloseSidebar: onClose });
    await userEvent.click(screen.getByRole('button', { name: /close sidebar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('applies container-aware sizing when containerAware is true', () => {
    const { container } = renderShell(undefined, { containerAware: true });
    expect(container.querySelector('.container')).toBeTruthy();
  });

  it('preserves error boundary behavior', () => {
    const Boom: React.FC = () => {
      throw new Error('boom');
    };
    render(
      <PageShell errorFallback={<div data-testid="err">E</div>}>
        <Boom />
      </PageShell>
    );
    expect(screen.getByTestId('err')).toBeInTheDocument();
  });
});
