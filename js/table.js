export function renderTable(elements, state, onRowSelect) {
  if (state.results.length === 0) {
    elements.resultsContainer.classList.add('hidden');
    elements.noResults.classList.remove('hidden');
    return;
  }
  elements.resultsContainer.classList.remove('hidden');
  elements.noResults.classList.add('hidden');

  const headers = ['Name','Focal','Aperture','Eq. Focal','Horiz. FoV','DoF Total','Weight','Price','Stab.','Sealed','Macro','Score'];
  elements.resultsHeader.innerHTML = headers
    .map((h) => `<th class="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">${h}</th>`) 
    .join('');

  elements.resultsBody.innerHTML = state.results.map((res, index) => `
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
  ).join('');

  elements.resultsBody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('click', () => {
      const lensIndex = parseInt(row.dataset.lensIndex);
      const lens = state.results[lensIndex];
      onRowSelect(lens);
    });
  });
}


