import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import { copyCurrentUrlToClipboard } from '../components/report/share';

export function useShareableState() {
  const copy = React.useCallback(async () => {
    return await copyCurrentUrlToClipboard();
  }, []);

  const restoreFromUrl = React.useCallback(() => {
    // Reuse existing URL sync hook to set store from current URL
    // Trigger by toggling a noop setter to cause effects to run
    const s = useFilterStore.getState();
    // no-op: reading triggers nothing; URL sync runs on mount in useUrlFiltersSync
    return true;
  }, []);

  return { copy, restoreFromUrl } as const;
}


