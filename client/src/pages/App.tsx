import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Camera, Lens, Result } from '../types';

const fetchJSON = async <T,>(path: string): Promise<T> => {
  const res = await fetch(path);
  return res.json();
};

export default function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [cameraName, setCameraName] = useState<string>('');
  const [isPro, setIsPro] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchJSON<Camera[]>('/api/cameras'),
      fetchJSON<Lens[]>('/api/lenses')
    ]).then(([cams, lens]) => {
      setCameras(cams);
      setLenses(lens);
      setCameraName(cams.find((c) => c.name === 'Sony a7 IV')?.name || cams[0]?.name || '');
    });
  }, []);

  const camera = useMemo(() => cameras.find((c) => c.name === cameraName), [cameras, cameraName]);

  const results: Result[] = useMemo(() => {
    if (!camera) return [] as Result[];
    return lenses.filter((l) => l.mount === camera.mount).map((l) => ({
      ...l,
      focal_used_mm: (l.focal_min_mm + l.focal_max_mm) / 2,
      max_aperture_at_focal: l.aperture_min,
      eq_focal_ff_mm: ((l.focal_min_mm + l.focal_max_mm) / 2) * camera.sensor.crop,
      fov_h_deg: 0,
      dof_total_m: 0,
      stabilization: l.ois || camera.ibis ? '✅' : '❌',
      score_total: 1
    }));
  }, [camera, lenses]);

  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-200">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Camera System Builder</h1>
          <div className="flex items-center space-x-3">
            <span className={isPro ? 'text-white' : 'text-gray-400'}>Pro</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isPro} onChange={(e) => setIsPro(e.target.checked)} />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800"></div>
            </label>
            <span className={!isPro ? 'text-white' : 'text-gray-400'}>Beginner</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <aside className="md:col-span-1 bg-gray-900/60 rounded-xl border border-gray-800 p-4 space-y-4">
            <label className="block text-sm font-medium text-gray-400">Camera Body</label>
            <select value={cameraName} onChange={(e) => setCameraName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2">
              {cameras.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </aside>

          <main className="md:col-span-2 space-y-6">
            <section className="bg-gray-900/60 rounded-xl border border-gray-800 p-4">
              <h2 className="text-lg font-semibold mb-2">Results</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      {['Name', 'Focal', 'Aperture', 'Eq. Focal', 'Weight', 'Price', 'Stab.', 'Score'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {results.map((r) => (
                      <tr key={r.name} className="hover:bg-gray-800/70">
                        <td className="px-4 py-3 text-sm font-medium text-white">{r.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{Math.round(r.focal_used_mm)}mm</td>
                        <td className="px-4 py-3 text-sm text-gray-300">f/{r.max_aperture_at_focal.toFixed(1)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{r.eq_focal_ff_mm.toFixed(1)}mm</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{r.weight_g}g</td>
                        <td className="px-4 py-3 text-sm text-gray-300">CHF {r.price_chf}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{r.stabilization}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-400">{Math.round(r.score_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-2">FoV vs Eq. Focal</h3>
                <Plot data={[]} layout={{ paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }} />
              </div>
              <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-4">
                <h3 className="font-semibold mb-2">Scores</h3>
                <Plot data={[]} layout={{ paper_bgcolor: 'transparent', plot_bgcolor: 'transparent' }} />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}


