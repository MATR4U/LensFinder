import { describe, it, expect, beforeEach, vi } from 'vitest';

function resetUrl(search: string) {
  const url = new URL(window.location.href);
  url.search = search;
  window.history.replaceState(null, '', url.toString());
}

describe('URL sync (hydrate and write-back)', () => {
  beforeEach(() => {
    // fresh page state
    resetUrl('');
  });

  it('hydrates store from URL params on load', async () => {
    resetUrl('?cameraName=Test&isPro=0&brand=Any&lensType=Any&sealed=1&isMacro=0&pmin=100&pmax=200&wmin=50&wmax=100&goal=Portrait');
    // Ensure fresh module load runs hydration block
    vi.resetModules();
    const mod = await import('../src/stores/filterStore');
    const store = mod.useFilterStore;
    const s = store.getState();
    // trigger debounced setters synchronously by setting to same value
    s.setPriceRange({ min: s.priceRange.min, max: s.priceRange.max });
    s.setWeightRange({ min: s.weightRange.min, max: s.weightRange.max });
    expect(store.getState().cameraName).toBe('Test');
    expect(store.getState().isPro).toBe(false);
    expect(store.getState().sealed).toBe(true);
  });

  it('writes to URL when store changes', async () => {
    const mod = await import('../src/stores/filterStore');
    const s = mod.useFilterStore.getState();
    s.setCameraName('FooCam');
    s.setIsPro(true);
    const params = new URLSearchParams(window.location.search);
    expect(params.get('cameraName')).toBe('FooCam');
    expect(params.get('isPro')).toBe('1');
  });

  it('clears URL when full reset is called', async () => {
    const mod = await import('../src/stores/filterStore');
    const s = mod.useFilterStore.getState();
    s.setCameraName('FooCam');
    s.setIsPro(false);
    // ensure params present first
    expect(new URLSearchParams(window.location.search).get('cameraName')).toBe('FooCam');
    // move to stage > 0 to allow URL writing
    s.setStage(1);
    // Now reset all
    s.resetAll();
    // Stage 0 with defaults should clear URL per subscription logic
    const params = new URLSearchParams(window.location.search);
    expect(params.toString()).toBe('');
  });
});


