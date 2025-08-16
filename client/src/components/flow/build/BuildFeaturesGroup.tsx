import React from 'react';
import BuildFeatures from '../../ui/BuildFeatures';

export default function BuildFeaturesGroup({
  sealed,
  setSealed,
  canRequireSealed,
  isMacro,
  setIsMacro,
  canRequireMacro,
  requireOIS,
  setRequireOIS,
  canRequireOIS,
  isPro,
}: {
  sealed: boolean;
  setSealed: (v: boolean) => void;
  canRequireSealed: boolean;
  isMacro: boolean;
  setIsMacro: (v: boolean) => void;
  canRequireMacro: boolean;
  requireOIS?: boolean;
  setRequireOIS?: (v: boolean) => void;
  canRequireOIS?: boolean;
  isPro: boolean;
}) {
  return (
    <BuildFeatures
      sealed={sealed}
      setSealed={setSealed}
      canRequireSealed={canRequireSealed}
      isMacro={isMacro}
      setIsMacro={setIsMacro}
      canRequireMacro={canRequireMacro}
      {...(isPro ? { requireOIS, setRequireOIS, canRequireOIS } : {})}
    />
  );
}


