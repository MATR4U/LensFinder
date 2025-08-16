export function useTickLabels({
  min,
  max,
  ticks,
  showTickLabels,
}: {
  min: number;
  max: number;
  ticks?: number[];
  showTickLabels?: boolean;
}) {
  const ticksPresent = Array.isArray(ticks) && ticks.length > 0;
  const includesExtremes = ticksPresent && (
    (ticks as number[]).some((t) => Math.abs(t - min) < 1e-6) &&
    (ticks as number[]).some((t) => Math.abs(t - max) < 1e-6)
  );
  const shouldRenderTickLabels = !!showTickLabels && ticksPresent;
  return { ticksPresent, includesExtremes, shouldRenderTickLabels };
}


