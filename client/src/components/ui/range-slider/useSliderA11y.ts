export function useSliderA11y({ ariaLabelMin, ariaLabelMax, ariaLabelledBy, isSingle }: {
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  ariaLabelledBy?: string;
  isSingle: boolean;
}) {
  const thumb0AriaLabel = ariaLabelledBy ? undefined : (isSingle ? (ariaLabelMax ?? 'Value') : (ariaLabelMin || 'Minimum'));
  const thumb1AriaLabel = ariaLabelledBy ? undefined : (ariaLabelMax || 'Maximum');
  return { thumb0AriaLabel, thumb1AriaLabel };
}


