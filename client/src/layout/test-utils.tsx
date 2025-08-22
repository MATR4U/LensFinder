import React from 'react';
import { render } from '@testing-library/react';
import PageShell from '../components/pages/PageShell';

export function renderWithLayout(ui: React.ReactNode, shellProps: Partial<React.ComponentProps<typeof PageShell>> = {}) {
  return render(
    <PageShell title="Test" {...shellProps}>
      {ui}
    </PageShell>
  );
}
