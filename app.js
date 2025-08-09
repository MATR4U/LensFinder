// --- OPTICS & RECOMMENDER MODULES ---
const optics = {
  fovDeg(sensor, focal_mm) {
    const h = 2 * (180 / Math.PI) * Math.atan(sensor.width_mm / (2 * focal_mm));
    const v = 2 * (180 / Math.PI) * Math.atan(sensor.height_mm / (2 * focal_mm));
    const d = 2 * (180 / Math.PI) * Math.atan(Math.hypot(sensor.width_mm, sensor.height_mm) / (2 * focal_mm));
    return { h, v, d };
  },
  hyperfocalMm(focal_mm, f_number, coc_mm) {
    return (focal_mm * focal_mm) / (f_number * coc_mm) + focal_mm;
  },
  depthOfFieldMm(focal_mm, f_number, coc_mm, subject_distance_mm) {
    const H = this.hyperfocalMm(focal_mm, f_number, coc_mm);
    const s = subject_distance_mm;
    const f = focal_mm;
    if (s <= f) return { near: 0, far: 0, total: 0 };
    const near = (H * s) / (H + (s - f));
    const far = H > s - f ? (H * s) / (H - (s - f)) : Infinity;
    const total = far !== Infinity ? far - near : Infinity;
    return { near, far, total };
  },
  equivFocalFf(focal_mm, sensor) {
    return focal_mm * sensor.crop;
  },
  lightGatheringScore(focal_mm, f_number) {
    if (f_number <= 0) return 0;
    const diameter = focal_mm / f_number;
    return Math.PI * Math.pow(diameter / 2, 2);
  },
  stabilizationBonus(stops) {
    return 1.0 + (Math.pow(2, stops) - 1.0) * 0.2;
  }
};

const recommender = {
  DEFAULT_STOPS_IF_OIS: 3.5,
  PRESETS: {
    Balanced: {
      low_light: 0.5,
      background_blur: 0.5,
      reach: 0.5,
      wide: 0.5,
      portability: 0.5,
      value: 0.5,
      distortion_control: 0.3,
      video_excellence: 0.3
    },
    Portrait: {
      low_light: 0.8,
      background_blur: 1.0,
      reach: 0.2,
      wide: 0.0,
      portability: 0.2,
      value: 0.2,
      distortion_control: 0.4,
      video_excellence: 0.1
    },
    Landscape: {
      low_light: 0.2,
      background_blur: 0.1,
      reach: 0.0,
      wide: 1.0,
      portability: 0.3,
      value: 0.3,
      distortion_control: 0.8,
      video_excellence: 0.1
    },
    Architecture: {
      low_light: 0.2,
      background_blur: 0.0,
      reach: 0.0,
      wide: 1.0,
      portability: 0.2,
      value: 0.2,
      distortion_control: 1.0,
      video_excellence: 0.1
    },
    Sports: {
      low_light: 0.5,
      background_blur: 0.5,
      reach: 1.0,
      wide: 0.0,
      portability: 0.1,
      value: 0.2,
      distortion_control: 0.2,
      video_excellence: 0.4
    },
    Travel: {
      low_light: 0.4,
      background_blur: 0.3,
      reach: 0.4,
      wide: 0.4,
      portability: 1.0,
      value: 0.5,
      distortion_control: 0.5,
      video_excellence: 0.3
    },
    Street: {
      low_light: 0.7,
      background_blur: 0.5,
      reach: 0.1,
      wide: 0.5,
      portability: 1.0,
      value: 0.4,
      distortion_control: 0.6,
      video_excellence: 0.2
    },
    'Video/Vlog': {
      low_light: 0.4,
      background_blur: 0.3,
      reach: 0.1,
      wide: 1.0,
      portability: 0.8,
      value: 0.4,
      distortion_control: 0.5,
      video_excellence: 1.0
    },
    Astrophotography: {
      low_light: 1.0,
      background_blur: 0.1,
      reach: 0.0,
      wide: 1.0,
      portability: 0.1,
      value: 0.3,
      distortion_control: 0.7,
      video_excellence: 0.0
    },
    'Low Light': {
      low_light: 1.0,
      background_blur: 0.7,
      reach: 0.1,
      wide: 0.1,
      portability: 0.2,
      value: 0.2,
      distortion_control: 0.3,
      video_excellence: 0.1
    }
  },
  isZoom(lens) {
    return lens.focal_min_mm !== lens.focal_max_mm;
  },
  maxApertureAt(lens, focal_mm) {
    if (!this.isZoom(lens) || Math.abs(lens.aperture_min - lens.aperture_max) < 1e-6) {
      return lens.aperture_min;
    }
    const ratio = (focal_mm - lens.focal_min_mm) / (lens.focal_max_mm - lens.focal_min_mm);
    const clampedRatio = Math.min(Math.max(ratio, 0.0), 1.0);
    return lens.aperture_min + clampedRatio * (lens.aperture_max - lens.aperture_min);
  },
  scoreLens(lens, camera, goal_weights, focal_choice_mm) {
    const maxAperture = this.maxApertureAt(lens, focal_choice_mm);
    let low_light = optics.lightGatheringScore(focal_choice_mm, maxAperture);
    if (lens.ois || camera.ibis) {
      low_light *= optics.stabilizationBonus(this.DEFAULT_STOPS_IF_OIS);
    }
    const background_blur = optics.lightGatheringScore(focal_choice_mm, maxAperture);
    const equiv_wide = optics.equivFocalFf(lens.focal_min_mm, camera.sensor);
    const equiv_tele = optics.equivFocalFf(lens.focal_max_mm, camera.sensor);
    const reach = Math.max(0.0, equiv_tele - 100);
    const wide = Math.max(0.0, 35 - equiv_wide);
    const portability = 1000 / (lens.weight_g + 100);
    const value = 5000 / (lens.price_chf + 200);
    const distortion_control = 10 / (Math.abs(lens.distortion_pct) + 1);
    const video_excellence = lens.focus_breathing_score;
    const raw = {
      low_light,
      background_blur,
      reach,
      wide,
      portability,
      value,
      distortion_control,
      video_excellence
    };
    let total = 0;
    for (const key in raw) {
      total += (raw[key] || 0) * (goal_weights[key] || 0.0);
    }
    raw.total = total;
    return raw;
  }
};

// --- MAIN APP LOGIC ---
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
    newbieLabel: document.getElementById('newbie-label'),
    proLabel: document.getElementById('pro-label'),
    proSections: document.getElementById('pro-sections'),
    camera_body: document.getElementById('camera_body'),
    brand: document.getElementById('brand'),
    lens_type: document.getElementById('lens_type'),
    price: document.getElementById('price'),
    priceMinLabel: document.getElementById('price-min-label'),
    priceMaxLabel: document.getElementById('price-max-label'),
    weight: document.getElementById('weight'),
    weightMinLabel: document.getElementById('weight-min-label'),
    weightMaxLabel: document.getElementById('weight-max-label'),
    weather_sealed: document.getElementById('weather_sealed'),
    is_macro: document.getElementById('is_macro'),
    focalChoice: document.getElementById('focal_choice'),
    subjectDistance: document.getElementById('subject_distance'),
    goalPreset: document.getElementById('goal_preset'),
    customWeights: document.getElementById('custom-weights'),
    customWeightsDetails: document.getElementById('custom-weights-details'),
    resultsHeader: document.getElementById('results-header'),
    resultsBody: document.getElementById('results-body'),
    resultsContainer: document.getElementById('results-container'),
    noResults: document.getElementById('no-results'),
    downloadCsv: document.getElementById('download-csv'),
    systemCameraName: document.getElementById('system-camera-name'),
    systemLensName: document.getElementById('system-lens-name'),
    systemWeight: document.getElementById('system-weight'),
    systemCost: document.getElementById('system-cost'),
    cameraIcon: document.getElementById('camera-icon'),
    sidebar: document.getElementById('sidebar'),
    sidebarOpen: document.getElementById('sidebar-open'),
    sidebarClose: document.getElementById('sidebar-close')
  };

  function populateSelect(el, options, selectedValue) {
    const hasAny = options.includes('Any');
    const sortedOptions = hasAny ? ['Any', ...options.filter((o) => o !== 'Any').sort()] : [...options].sort();
    el.innerHTML = sortedOptions
      .map((opt) => `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`)
      .join('');
  }

  function setupRangeSlider(el, data, minLabel, maxLabel, filterKey) {
    const min = 0;
    const max = Math.ceil(Math.max(...data, 1000) / 100) * 100;
    el.min = min;
    el.max = max;
    el.value = max;
    state.filters[filterKey] = { min: min, max: max };

    let minSlider = el.parentNode.querySelector('.min-slider');
    if (!minSlider) {
      minSlider = document.createElement('input');
      minSlider.type = 'range';
      minSlider.className = el.className + ' min-slider';
      const refNode = el.nextElementSibling;
      if (refNode) {
        el.parentNode.insertBefore(minSlider, refNode);
      } else {
        el.parentNode.appendChild(minSlider);
      }
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
      state.filters[filterKey].min = parseInt(minSlider.value);
      updateLabels();
      update();
    };

    el.oninput = () => {
      if (parseInt(el.value) < parseInt(minSlider.value)) el.value = minSlider.value;
      state.filters[filterKey].max = parseInt(el.value);
      updateLabels();
      update();
    };
    updateLabels();
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
      slider.min = 0;
      slider.max = 1;
      slider.step = 0.05;
      slider.value = weights[key];
      slider.dataset.key = key;
      slider.className = 'w-full';
      container.appendChild(label);
      container.appendChild(slider);
      elements.customWeights.appendChild(container);
    }
  }

  function handleUIModeChange(e) {
    state.filters.isProMode = e.target.checked;
    updateUIMode();
  }

  function addEventListeners() {
    elements.uiModeToggle.addEventListener('change', handleUIModeChange);
    elements.camera_body.addEventListener('change', handleFilterChange);
    elements.brand.addEventListener('change', handleFilterChange);
    elements.lens_type.addEventListener('change', handleFilterChange);
    document.getElementById('weather_sealed').addEventListener('change', handleFilterChange);
    document.getElementById('is_macro').addEventListener('change', handleFilterChange);
    elements.focalChoice.addEventListener('input', handleFilterChange);
    document.getElementById('subject_distance').addEventListener('input', handleFilterChange);
    elements.goalPreset.addEventListener('change', handlePresetChange);
    elements.customWeights.addEventListener('input', handleWeightChange);
    if (elements.downloadCsv) elements.downloadCsv.addEventListener('click', downloadCSV);
    elements.sidebarOpen.addEventListener('click', () => elements.sidebar.classList.remove('hidden-mobile'));
    elements.sidebarClose.addEventListener('click', () => elements.sidebar.classList.add('hidden-mobile'));
  }

  function updateUIMode() {
    const isPro = elements.uiModeToggle.checked;
    state.filters.isProMode = isPro;
    elements.proSections.style.display = isPro ? 'block' : 'none';
    elements.proLabel.classList.toggle('text-white', isPro);
    elements.proLabel.classList.toggle('text-gray-400', !isPro);
    elements.newbieLabel.classList.toggle('text-white', !isPro);
    elements.newbieLabel.classList.toggle('text-gray-400', isPro);
  }

  function handleFilterChange(e) {
    const { id, value, type, checked } = e.target;
    if (id === 'camera_body') {
      state.filters.camera = state.cameras.find((c) => c.name === value);
    } else if (type === 'checkbox') {
      state.filters[id.replace('-', '_')] = checked;
    } else if (type === 'number') {
      state.filters[id.replace('-', '_')] = parseFloat(value);
    } else {
      state.filters[id.replace('-', '_')] = value;
    }
    update();
  }

  function handlePresetChange(e) {
    const presetName = e.target.value;
    if (recommender.PRESETS[presetName]) {
      state.filters.goal_weights = { ...recommender.PRESETS[presetName] };
      createWeightSliders();
      update();
    }
  }

  function handleWeightChange(e) {
    if (e.target.type === 'range') {
      const { key } = e.target.dataset;
      state.filters.goal_weights[key] = parseFloat(e.target.value);
      if (!elements.goalPreset.querySelector('option[value="Custom"]')) {
        const customOption = document.createElement('option');
        customOption.value = 'Custom';
        customOption.textContent = 'Custom';
        elements.goalPreset.appendChild(customOption);
      }
      elements.goalPreset.value = 'Custom';
      update();
    }
  }

  async function loadDataThenInit() {
    try {
      const [camerasRes, lensesRes] = await Promise.all([
        fetch('/api/cameras'),
        fetch('/api/lenses')
      ]);
      const [cameras, lenses] = await Promise.all([
        camerasRes.json(),
        lensesRes.json()
      ]);
      state.cameras = cameras;
      state.lenses = lenses;
      state.filters.camera = state.cameras.find((c) => c.name === 'Sony a7 IV') || state.cameras[0] || null;
      if (!state.filters.camera) {
        console.error('No cameras loaded');
        return;
      }
      init();
    } catch (err) {
      console.error('Failed to load data JSON files', err);
    }
  }

  function init() {
    populateSelect(elements.camera_body, state.cameras.map((c) => c.name), state.filters.camera.name);
    populateSelect(elements.lens_type, ['Any', 'Prime', 'Zoom']);
    populateSelect(elements.goalPreset, Object.keys(recommender.PRESETS), 'Balanced');
    setupRangeSlider(
      elements.price,
      state.lenses.map((l) => l.price_chf),
      elements.priceMinLabel,
      elements.priceMaxLabel,
      'price'
    );
    setupRangeSlider(
      elements.weight,
      state.lenses.map((l) => l.weight_g),
      elements.weightMinLabel,
      elements.weightMaxLabel,
      'weight'
    );
    createWeightSliders();
    addEventListeners();
    updateUIMode();
    update();
  }

  function update() {
    const compatibleLenses = state.lenses.filter((lens) => lens.mount === state.filters.camera.mount);
    const compatibleBrands = ['Any', ...new Set(compatibleLenses.map((l) => l.brand))].sort();
    populateSelect(elements.brand, compatibleBrands, state.filters.brand);
    if (!compatibleBrands.includes(state.filters.brand)) {
      state.filters.brand = 'Any';
      elements.brand.value = 'Any';
    }

    const filteredLenses = compatibleLenses.filter((lens) => {
      if (state.filters.brand !== 'Any' && lens.brand !== state.filters.brand) return false;
      const lensType = recommender.isZoom(lens) ? 'Zoom' : 'Prime';
      if (state.filters.lens_type !== 'Any' && lensType !== state.filters.lens_type) return false;
      if (document.getElementById('weather_sealed').checked && !lens.weather_sealed) return false;
      if (document.getElementById('is_macro').checked && !lens.is_macro) return false;
      return true;
    });

    state.results = filteredLenses
      .map((lens) => {
        const fc = state.filters.isProMode
          ? Math.max(lens.focal_min_mm, Math.min(state.filters.focal_choice, lens.focal_max_mm))
          : (lens.focal_min_mm + lens.focal_max_mm) / 2;
        const scores = recommender.scoreLens(lens, state.filters.camera, state.filters.goal_weights, fc);
        const { h } = optics.fovDeg(state.filters.camera.sensor, fc);
        const { total } = optics.depthOfFieldMm(
          fc,
          recommender.maxApertureAt(lens, fc),
          state.filters.camera.sensor.coc_mm,
          state.filters.subject_distance * 1000
        );

        return {
          ...lens,
          ...scores,
          focal_used_mm: fc,
          max_aperture_at_focal: recommender.maxApertureAt(lens, fc),
          eq_focal_ff_mm: optics.equivFocalFf(fc, state.filters.camera.sensor),
          fov_h_deg: h,
          dof_total_m: total / 1000,
          stabilization: lens.ois || state.filters.camera.ibis ? '✅' : '❌',
          score_total: scores.total
        };
      })
      .sort((a, b) => b.score_total - a.score_total);

    updateSystemCard();
    renderTable();
    renderCharts();
  }

  function updateSystemCard(lens = null) {
    state.selectedLens = lens;
    const camera = state.filters.camera;
    elements.systemCameraName.textContent = camera.name;
    elements.cameraIcon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>';
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

  function renderTable() {
    if (state.results.length === 0) {
      elements.resultsContainer.classList.add('hidden');
      elements.noResults.classList.remove('hidden');
      return;
    }
    elements.resultsContainer.classList.remove('hidden');
    elements.noResults.classList.add('hidden');

    const headers = [
      'Name',
      'Focal',
      'Aperture',
      'Eq. Focal',
      'Horiz. FoV',
      'DoF Total',
      'Weight',
      'Price',
      'Stab.',
      'Sealed',
      'Macro',
      'Score'
    ];
    elements.resultsHeader.innerHTML = headers
      .map(
        (h) =>
          `<th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">${h}</th>`
      )
      .join('');

    elements.resultsBody.innerHTML = state.results
      .map(
        (res, index) => `
        <tr class="hover:bg-gray-700/50 cursor-pointer" data-lens-index="${index}">
          <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-white"><a href="${res.source_url}" target="_blank" rel="noopener noreferrer" class="hover:text-blue-400 transition-colors" onclick="event.stopPropagation()">${res.name}</a></td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${res.focal_used_mm.toFixed(0)}mm</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">f/${res.max_aperture_at_focal.toFixed(1)}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${res.eq_focal_ff_mm.toFixed(1)}mm</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${res.fov_h_deg.toFixed(1)}°</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${res.dof_total_m === Infinity ? '∞' : res.dof_total_m.toFixed(2)}m</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">${res.weight_g}g</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">CHF ${res.price_chf}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-300">${res.stabilization}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-300">${res.weather_sealed ? '✅' : '❌'}</td>
          <td class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-300">${res.is_macro ? '✅' : '❌'}</td>
          <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-400">${res.score_total.toFixed(0)}</td>
        </tr>`
      )
      .join('');

    elements.resultsBody.querySelectorAll('tr').forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
          const lensIndex = parseInt(row.dataset.lensIndex);
          const lens = state.results[lensIndex];
          updateSystemCard(lens);
        }
      });
    });
  }

  function renderCharts() {
    const plotlyLayout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#d1d5db' },
      xaxis: {
        gridcolor: 'rgba(255,255,255,0.1)',
        linecolor: 'rgba(255,255,255,0.2)',
        zerolinecolor: 'rgba(255,255,255,0.2)'
      },
      yaxis: {
        gridcolor: 'rgba(255,255,255,0.1)',
        linecolor: 'rgba(255,255,255,0.2)',
        zerolinecolor: 'rgba(255,255,255,0.2)'
      },
      legend: { bgcolor: 'rgba(0,0,0,0.5)', bordercolor: '#4b5563' },
      margin: { l: 50, r: 20, b: 40, t: 20, pad: 4 }
    };

    if (state.results.length > 0) {
      const fovTrace = {
        x: state.results.map((r) => optics.equivFocalFf(r.focal_used_mm, state.filters.camera.sensor)),
        y: state.results.map((r) => optics.fovDeg(state.filters.camera.sensor, r.focal_used_mm).h),
        text: state.results.map((r) => `${r.name}<br>Score: ${r.score_total.toFixed(0)}`),
        hoverinfo: 'text',
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: state.results.map((r) => Math.max(8, 25 - recommender.maxApertureAt(r, r.focal_used_mm) * 3)),
          color: state.results.map((r) => r.score_total),
          colorscale: 'Viridis',
          showscale: true,
          colorbar: { title: 'Score', thickness: 10 }
        }
      };
      const fovLayout = {
        ...plotlyLayout,
        xaxis: { ...plotlyLayout.xaxis, title: 'Equivalent Focal (mm, FF)' },
        yaxis: { ...plotlyLayout.yaxis, title: 'Horizontal FOV (deg)' }
      };
      Plotly.newPlot('chart-fov', [fovTrace], fovLayout, { responsive: true });
    } else {
      Plotly.purge('chart-fov');
    }

    if (state.results.length > 0) {
      const sortedResults = [...state.results].sort((a, b) => a.score_total - b.score_total).slice(-15);
      const scoreTrace = {
        x: sortedResults.map((r) => r.score_total),
        y: sortedResults.map((r) => r.name),
        type: 'bar',
        orientation: 'h',
        marker: { color: sortedResults.map((r) => r.score_total), colorscale: 'Blues' }
      };
      const scoreLayout = {
        ...plotlyLayout,
        yaxis: { ...plotlyLayout.yaxis, automargin: true },
        xaxis: { ...plotlyLayout.xaxis, title: 'Weighted Score' }
      };
      Plotly.newPlot('chart-score', [scoreTrace], scoreLayout, { responsive: true });
    } else {
      Plotly.purge('chart-score');
    }
  }

  function downloadCSV() {
    if (state.results.length === 0) return;
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
    const rows = state.results.map((r) => [
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
    const csv = [headers, ...rows]
      .map((line) => line.map((v) => (typeof v === 'string' && v.includes(',') ? '"' + v + '"' : v)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lens_results.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Start
  loadDataThenInit();
});


