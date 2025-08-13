import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RangeSlider from '../src/components/ui/RangeSlider';

function getThumbs(container: HTMLElement) {
  return container.querySelectorAll('[role="slider"]');
}

describe('RangeSlider', () => {
  test('renders with provided values and clamps on interaction', async () => {
    const user = userEvent.setup();
    const handle = vi.fn();
    const { container } = render(
      <RangeSlider
        min={100}
        max={500}
        step={50}
        value={{ min: 150, max: 450 }}
        onChange={handle}
      />
    );

    // There should be two thumbs
    const thumbs = getThumbs(container);
    expect(thumbs.length).toBe(2);

    // Move the first thumb to below min; onChange should clamp to min
    await user.keyboard('[Tab]'); // focus first thumb
    await user.keyboard('{ArrowLeft>10/}');
    // Radix emits changes via onValueChange; assert last call clamps >= min
    const last = handle.mock.calls.at(-1)?.[0];
    expect(last.min).toBeGreaterThanOrEqual(100);
    expect(last.max).toBe(450);

    // Try crossing handles: set min above current max, it should not surpass max
    await user.keyboard('{ArrowRight>20/}');
    const last2 = handle.mock.calls.at(-1)?.[0];
    expect(last2.min).toBeLessThanOrEqual(last2.max);
  });

  test('exposes aria-labelledby and aria-valuetext for accessibility', () => {
    const { container } = render(
      <div>
        <label id="zoom-lbl">Zoom range</label>
        <RangeSlider
          min={10}
          max={100}
          step={5}
          value={{ min: 20, max: 80 }}
          onChange={() => { }}
          ariaLabelledBy="zoom-lbl"
          format={(v) => `${v} mm`}
        />
      </div>
    );

    const root = container.querySelector('[data-radix-slider]') || container.querySelector('[role="group"]');
    // Radix doesn't set data-radix-slider on Root; fallback: ensure presence of thumbs and labelledby on group
    const group = container.querySelector('[aria-labelledby="zoom-lbl"]');
    expect(group).toBeTruthy();

    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs.length).toBe(2);
    // aria-valuetext should be formatted
    const vt1 = thumbs[0]?.getAttribute('aria-valuetext');
    const vt2 = thumbs[1]?.getAttribute('aria-valuetext');
    expect(vt1?.endsWith(' mm')).toBe(true);
    expect(vt2?.endsWith(' mm')).toBe(true);
  });

  test('disabled state sets aria-disabled', () => {
    const { container } = render(
      <RangeSlider
        min={0}
        max={10}
        value={{ min: 2, max: 8 }}
        onChange={() => { }}
        disabled
      />
    );
    const group = container.querySelector('[aria-disabled="true"]');
    expect(group).toBeTruthy();
  });

  test('single-thumb mode exposes labelledby and formatted aria-valuetext', () => {
    const { container } = render(
      <div>
        <label id="aperture-lbl">Aperture</label>
        <RangeSlider
          min={1.4}
          max={16}
          step={0.1}
          singleValue={2.8}
          onChangeSingle={() => { }}
          ariaLabelledBy="aperture-lbl"
          format={(v) => `f/${v.toFixed(1)}`}
          density="sm"
        />
      </div>
    );
    const group = container.querySelector('[aria-labelledby="aperture-lbl"]');
    expect(group).toBeTruthy();
    const thumbs = container.querySelectorAll('[role="slider"]');
    expect(thumbs.length).toBe(1);
    const vt = thumbs[0]?.getAttribute('aria-valuetext');
    expect(vt?.startsWith('f/')).toBe(true);
  });
});


