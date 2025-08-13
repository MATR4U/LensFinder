import React from 'react';
import type { ReportResponse } from '../../lib/api';

/**
 * Minimal lifecycle hook for reports. In a real app this would push to analytics.
 */
export function useReportLifecycle(title: string, report: ReportResponse | null) {
  const startedRef = React.useRef(false);
  React.useEffect(() => {
    if (!startedRef.current && report) {
      startedRef.current = true;
      try { (window as any)?.dataLayer?.push?.({ event: 'report_start', title }); } catch { /* noop */ }
    }
    if (report) {
      try { (window as any)?.dataLayer?.push?.({ event: 'report_complete', title, items: report.items?.length ?? 0 }); } catch { /* noop */ }
    }
  }, [title, report]);
}


