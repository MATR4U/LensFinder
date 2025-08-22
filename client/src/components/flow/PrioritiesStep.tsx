import { useFilterStore } from '../../stores/filterStore';

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-gray-500">{value} / 5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Don’t care</span>
        <span>Neutral</span>
        <span>Essential</span>
      </div>
    </div>
  );
}

export default function PrioritiesStep() {
  const { goalWeights, setGoalWeights, advance } = useFilterStore();
  const portability = Math.round((goalWeights?.portability ?? 0.33) * 5) || 3;
  const lowLight = Math.round((goalWeights?.lowLight ?? 0.33) * 5) || 3;
  const zoom = Math.round((goalWeights?.zoom ?? 0.33) * 5) || 3;

  const update = (p: number, l: number, z: number) => {
    const total = p + l + z;
    const norm = total > 0 ? { portability: p / total, lowLight: l / total, zoom: z / total } : { portability: 1/3, lowLight: 1/3, zoom: 1/3 };
    setGoalWeights(norm as any);
  };

  const canContinue = true;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500 mb-1">Step 2 of 4</div>
        <h2 className="text-xl font-semibold">Priorities</h2>
      </div>

      <Slider label="Portability (Lightweight)" value={portability} onChange={(v) => update(v, lowLight, zoom)} />
      <Slider label="Low-Light Performance (Bright Aperture)" value={lowLight} onChange={(v) => update(portability, v, zoom)} />
      <Slider label="Zoom Versatility" value={zoom} onChange={(v) => update(portability, lowLight, v)} />

      <div className="pt-2">
        <button
          type="button"
          disabled={!canContinue}
          className={`px-4 py-2 rounded bg-blue-600 text-white`}
          onClick={() => advance(1)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
