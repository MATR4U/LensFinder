import { optics } from './optics.js';
import { recommender } from './recommender.js';
import { fetchCameras, fetchLenses } from './api.js';
import { populateSelect, setupDualRange, downloadCSV } from './ui.js';
import { renderTable } from './table.js';
import { renderCharts } from './charts.js';

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    cameras: [],
    lenses: [],
    results: [],
    selectedLens: null,
    filters: {
      camera: null,
      brand: 'Any',
      lens_type: 'Any',
      weather_sealed: false,
      is_macro: false,
      price: { min: 0, max: 5000 },
      weight: { min: 0, max: 2000 },
      focal_choice: 50,
      subject_distance: 3.0,
      goal_weights: recommender.PRESETS['Balanced'],
      isProMode: true
    }
  };

  const elements = {
    uiModeToggle: document.getElementById('ui-mode-toggle'),
    proSections: document.getElementById('pro-sections'),
    proLabel: document.getElementById('pro-label'),
    newbieLabel: document.getElementById('newbie-label'),
    camera_body: document.getElementById('camera_body'),
    brand: document.getElementById('brand'),
    lens_type: document.getElementById('lens_type'),
    price: document.getElementById('price'),
    priceMinLabel: document.getElementById('price-min-label'),
    priceMaxLabel: document.getElementById('price-max-label'),
    weight: document.getElementById('weight'),
    weightMinLabel: document.getElementById('weight-min-label'),
    weightMaxLabel: document.getElementById('weight-max-label'),
    goalPreset: document.getElementById('goal_preset'),
    customWeights: document.getElementById('custom-weights'),
    resultsHeader: document.getElementById('results-header'),
    resultsBody: document.getElementById('results-body'),
    resultsContainer: document.getElementById('results-container'),
    noResults: document.getElementById('no-results'),
    focalChoice: document.getElementById('focal_choice'),
    subjectDistance: document.getElementById('subject_distance'),
    systemCameraName: document.getElementById('system-camera-name'),
    systemLensName: document.getElementById('system-lens-name'),
    systemWeight: document.getElementById('system-weight'),
    systemCost: document.getElementById('system-cost'),
    cameraIcon: document.getElementById('camera-icon'),
    downloadCsv: document.getElementById('download-csv')
  };

  function updateUIMode() {
    const isPro = elements.uiModeToggle.checked;
    state.filters.isProMode = isPro;
    elements.proSections.style.display = isPro ? 'block' : 'none';
    elements.proLabel.classList.toggle('text-white', isPro);
    elements.proLabel.classList.toggle('text-gray-400', !isPro);
    elements.newbieLabel.classList.toggle('text-white', !isPro);
    elements.newbieLabel.classList.toggle('text-gray-400', isPro);
  }

  function createWeightSliders() {
    const weights = state.filters.goal_weights;
    elements.customWeights.innerHTML = '';
    for (const key in weights) {
      const container = document.createElement('div');
      const label = document.createElement('label');
      label.className = 'block text-sm font-medium text-gray-400 mb-1 capitalize';
      label.textContent = key.replace(/_/g, ' ');
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = 0; slider.max = 1; slider.step = 0.05; slider.value = weights[key];
      slider.dataset.key = key; slider.className = 'w-full';
      container.appendChild(label); container.appendChild(slider);
      elements.customWeights.appendChild(container);
    }
  }

  function updateSystemCard(lens = null) {
    state.selectedLens = lens;
    const camera = state.filters.camera;
    elements.systemCameraName.textContent = camera.name;
    elements.cameraIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
    if (lens) {
      elements.systemLensName.textContent = lens.name;
      elements.systemWeight.textContent = `${camera.weight_g + lens.weight_g} g`;
      elements.systemCost.textContent = `CHF ${camera.price_chf + lens.price_chf}`;
    } else {
      elements.systemLensName.textContent = 'No lens selected';
      elements.systemWeight.textContent = `${camera.weight_g} g`;
      elements.systemCost.textContent = `CHF ${camera.price_chf}`;
    }
  }

  function recalcResults() {
    const compatibleLenses = state.lenses.filter((lens) => lens.mount === state.filters.camera.mount);
    const compatibleBrands = ['Any', ...new Set(compatibleLenses.map((l) => l.brand))].sort();
    populateSelect(elements.brand, compatibleBrands, state.filters.brand);
    if (!compatibleBrands.includes(state.filters.brand)) {
      state.filters.brand = 'Any'; elements.brand.value = 'Any';
    }
    const filtered = compatibleLenses.filter((lens) => {
      if (state.filters.brand !== 'Any' && lens.brand !== state.filters.brand) return false;
      const lensType = recommender.isZoom(lens) ? 'Zoom' : 'Prime';
      if (state.filters.lens_type !== 'Any' && lensType !== state.filters.lens_type) return false;
      if (document.getElementById('weather_sealed').checked && !lens.weather_sealed) return false;
      if (document.getElementById('is_macro').checked && !lens.is_macro) return false;
      return true;
    });
    state.results = filtered.map((lens) => {
      const fc = state.filters.isProMode ? Math.max(lens.focal_min_mm, Math.min(state.filters.focal_choice, lens.focal_max_mm)) : (lens.focal_min_mm + lens.focal_max_mm) / 2;
      const scores = recommender.scoreLens(lens, state.filters.camera, state.filters.goal_weights, fc);
      const { h } = optics.fovDeg(state.filters.camera.sensor, fc);
      const { total } = optics.depthOfFieldMm(fc, recommender.maxApertureAt(lens, fc), state.filters.camera.sensor.coc_mm, state.filters.subject_distance * 1000);
      return { ...lens, ...scores, focal_used_mm: fc, max_aperture_at_focal: recommender.maxApertureAt(lens, fc), eq_focal_ff_mm: optics.equivFocalFf(fc, state.filters.camera.sensor), fov_h_deg: h, dof_total_m: total / 1000, stabilization: lens.ois || state.filters.camera.ibis ? '✅' : '❌', score_total: scores.total };
    }).sort((a, b) => b.score_total - a.score_total);
  }

  function update() {
    recalcResults();
    updateSystemCard();
    renderTable(elements, state, updateSystemCard);
    renderCharts(state);
  }

  function addEventListeners() {
    elements.uiModeToggle.addEventListener('change', () => { state.filters.isProMode = elements.uiModeToggle.checked; updateUIMode(); update(); });
    elements.camera_body.addEventListener('change', (e) => { state.filters.camera = state.cameras.find((c) => c.name === e.target.value); update(); });
    elements.brand.addEventListener('change', (e) => { state.filters.brand = e.target.value; update(); });
    elements.lens_type.addEventListener('change', (e) => { state.filters.lens_type = e.target.value; update(); });
    document.getElementById('weather_sealed').addEventListener('change', (e) => { state.filters.weather_sealed = e.target.checked; update(); });
    document.getElementById('is_macro').addEventListener('change', (e) => { state.filters.is_macro = e.target.checked; update(); });
    elements.focalChoice.addEventListener('input', (e) => { state.filters.focal_choice = parseFloat(e.target.value); update(); });
    elements.subjectDistance.addEventListener('input', (e) => { state.filters.subject_distance = parseFloat(e.target.value); update(); });
    elements.goalPreset.addEventListener('change', (e) => { const p = e.target.value; if (recommender.PRESETS[p]) { state.filters.goal_weights = { ...recommender.PRESETS[p] }; createWeightSliders(); update(); } });
    elements.customWeights.addEventListener('input', (e) => { if (e.target.type === 'range') { const { key } = e.target.dataset; state.filters.goal_weights[key] = parseFloat(e.target.value); if (!elements.goalPreset.querySelector('option[value="Custom"]')) { const opt = document.createElement('option'); opt.value = 'Custom'; opt.textContent = 'Custom'; elements.goalPreset.appendChild(opt); } elements.goalPreset.value = 'Custom'; update(); } });
    if (elements.downloadCsv) elements.downloadCsv.addEventListener('click', () => downloadCSV(state.results));
  }

  async function init() {
    const [cameras, lenses] = await Promise.all([fetchCameras(), fetchLenses()]);
    state.cameras = cameras; state.lenses = lenses;
    state.filters.camera = state.cameras.find((c) => c.name === 'Sony a7 IV') || state.cameras[0] || null;
    populateSelect(elements.camera_body, state.cameras.map((c) => c.name), state.filters.camera?.name);
    populateSelect(elements.lens_type, ['Any', 'Prime', 'Zoom']);
    populateSelect(elements.goalPreset, Object.keys(recommender.PRESETS), 'Balanced');
    setupDualRange(elements.price, state.lenses.map((l) => l.price_chf), elements.priceMinLabel, elements.priceMaxLabel, (range) => { state.filters.price = range; update(); });
    setupDualRange(elements.weight, state.lenses.map((l) => l.weight_g), elements.weightMinLabel, elements.weightMaxLabel, (range) => { state.filters.weight = range; update(); });
    createWeightSliders();
    addEventListeners();
    updateUIMode();
    update();
  }

  init();
});


