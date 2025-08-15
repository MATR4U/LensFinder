export type EventMap = {
  stage_enter: { stage: number; name: string };
  selection_change: { key: string; value: string };
};

export function useAnalytics() {
  function track<T extends keyof EventMap>(event: T, payload: EventMap[T]) {
    // no-op placeholder; wire to real analytics later
    void event; void payload;
  }
  return { track } as const;
}


