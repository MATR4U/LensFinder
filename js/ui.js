export function populateSelect(el, options, selectedValue) {
  const hasAny = options.includes('Any');
  const sortedOptions = hasAny ? ['Any', ...options.filter((o) => o !== 'Any').sort()] : [...options].sort();
  el.innerHTML = sortedOptions
    .map((opt) => `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`)
    .join('');
}

export function setupDualRange(el, data, minLabel, maxLabel, onChange) {
  const min = 0;
  const max = Math.ceil(Math.max(...data, 1000) / 100) * 100;
  el.min = min;
  el.max = max;
  el.value = max;
  let minSlider = el.parentNode.querySelector('.min-slider');
  if (!minSlider) {
    minSlider = document.createElement('input');
    minSlider.type = 'range';
    minSlider.className = el.className + ' min-slider';
    const refNode = el.nextElementSibling;
    if (refNode) el.parentNode.insertBefore(minSlider, refNode);
    else el.parentNode.appendChild(minSlider);
  }
  minSlider.min = min;
  minSlider.max = max;
  minSlider.value = min;
  const updateLabels = () => {
    minLabel.textContent = minSlider.value;
    maxLabel.textContent = el.value;
  };
  minSlider.oninput = () => {
    if (parseInt(minSlider.value) > parseInt(el.value)) minSlider.value = el.value;
    updateLabels();
    onChange({ min: parseInt(minSlider.value), max: parseInt(el.value) });
  };
  el.oninput = () => {
    if (parseInt(el.value) < parseInt(minSlider.value)) el.value = minSlider.value;
    updateLabels();
    onChange({ min: parseInt(minSlider.value), max: parseInt(el.value) });
  };
  updateLabels();
}

export function downloadCSV(rows) {
  if (!rows || rows.length === 0) return;
  const headers = [
    'Name',
    'Focal(mm)',
    'Aperture(f/)',
    'Eq.Focal(mm)',
    'FoV H(deg)',
    'DoF Total(m)',
    'Weight(g)',
    'Price(CHF)',
    'Stabilized',
    'Sealed',
    'Macro',
    'Score'
  ];
  const lines = rows.map((r) => [
    r.name,
    r.focal_used_mm.toFixed(0),
    r.max_aperture_at_focal.toFixed(1),
    r.eq_focal_ff_mm.toFixed(1),
    r.fov_h_deg.toFixed(1),
    r.dof_total_m === Infinity ? '∞' : r.dof_total_m.toFixed(2),
    r.weight_g,
    r.price_chf,
    r.stabilization,
    r.weather_sealed ? '✅' : '❌',
    r.is_macro ? '✅' : '❌',
    r.score_total.toFixed(0)
  ]);
  const csv = [headers, ...lines]
    .map((line) => line.map((v) => (typeof v === 'string' && v.includes(',') ? '"' + v + '"' : v)).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lens_results.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


