import React from 'react';
import PageShell from './PageShell';
import { PAGE_BASE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';

type Props = {
  title?: string;
  metaDescription?: string;
  headerSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  bannerSlot?: React.ReactNode;
  subheaderSlot?: React.ReactNode;
  children: React.ReactNode;
  footerSlot?: React.ReactNode;
  errorFallback?: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  onView?: (path: string) => void;
  showHistoryControls?: boolean;
};

export default function PageBase({
  title,
  metaDescription,
  headerSlot,
  actionsSlot,
  bannerSlot,
  subheaderSlot,
  children,
  footerSlot,
  errorFallback,
  suspenseFallback,
  onView,
  showHistoryControls = false,
}: Props) {
  const { historyLength, redoLength, undo, redo } = useFilterBindings(PAGE_BASE_BINDINGS);
  const canUndo = historyLength > 0;
  const canRedo = redoLength > 0;

  return (
    <PageShell
      title={title}
      metaDescription={metaDescription}
      headerSlot={headerSlot}
      actionsSlot={actionsSlot}
      bannerSlot={bannerSlot}
      subheaderSlot={subheaderSlot}
      errorFallback={errorFallback}
      suspenseFallback={suspenseFallback}
      onView={onView}
      footerSlot={footerSlot}
      historyControls={showHistoryControls ? { canUndo, canRedo, onUndo: undo, onRedo: redo } : undefined}
    >
      {children}
    </PageShell>
  );
}


