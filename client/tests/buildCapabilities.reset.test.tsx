import { beforeEach, describe, expect, test } from 'vitest';
import { act } from 'react';
import { useFilterStore } from '../src/stores/filterStore';

describe('Build & Capabilities reset', () => {
  beforeEach(() => {
    // Ensure clean defaults
    act(() => {
      const s = useFilterStore.getState();
      s.setCameraName('Any');
      s.setBrand('Any');
      s.setLensType('Any');
      s.setSealed(false);
      s.setIsMacro(false);
      s.setProCoverage('Any');
      s.setProRequireOIS(false);
    });
  });

  test('resetFilters resets cameraName and dropdowns to defaults', () => {
    act(() => {
      const s = useFilterStore.getState();
      s.setCameraName('Sony a7 IV');
      s.setBrand('Sony');
      s.setLensType('Prime');
      s.setProCoverage('Full Frame');
      s.setSealed(true);
      s.setIsMacro(true);
      s.setProRequireOIS(true);
      s.resetFilters();
    });

    const s = useFilterStore.getState();
    expect(s.cameraName).toBe('Any');
    expect(s.brand).toBe('Any');
    expect(s.lensType).toBe('Any');
    expect(s.proCoverage).toBe('Any');
    expect(s.sealed).toBe(false);
    expect(s.isMacro).toBe(false);
    expect(s.proRequireOIS).toBe(false);
  });

  test('resetToStageBaseline(1) restores captured values including cameraName', () => {
    act(() => {
      const s = useFilterStore.getState();
      // Baseline: set some non-defaults and capture
      s.setCameraName('Sony a7 IV');
      s.setBrand('Sony');
      s.setLensType('Zoom');
      s.setProCoverage('Any');
      s.captureStageBaseline(1);
      // Change values
      s.setCameraName('Any');
      s.setBrand('Any');
      s.setLensType('Prime');
      s.setProCoverage('Full Frame');
      // Reset back to baseline
      s.resetToStageBaseline(1);
    });

    const s = useFilterStore.getState();
    expect(s.cameraName).toBe('Sony a7 IV');
    expect(s.brand).toBe('Sony');
    expect(s.lensType).toBe('Zoom');
    expect(s.proCoverage).toBe('Any');
  });
});


