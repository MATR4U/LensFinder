import React from 'react';
import { useStageBaseline } from './useStageBaseline';

type Options = {
  resetOnEntry?: boolean;
  onEnterAnalytics?: () => void;
};

export function useStageLifecycle(stageNumber: number, opts: Options = {}) {
  const { capture, reset, hasBaseline } = useStageBaseline(stageNumber);

  const onEnter = React.useCallback(() => {
    if (!hasBaseline && opts.resetOnEntry) {
      capture({ resetOnEntry: true });
    }
    if (opts.onEnterAnalytics) opts.onEnterAnalytics();
  }, [capture, hasBaseline, opts]);

  return { onEnter, reset } as const;
}


