import { useFilterStore } from '../../stores/filterStore';
import { useMemo } from 'react';

const DEFAULT_USE_CASES = ['Portraits', 'Landscape', 'Sports & Wildlife', 'Travel', 'Video', 'Macro', 'Everyday'];

export default function EssentialsStep() {
  const {
    cameraName, setCameraName,
    useCases, setUseCases,
    budgetTarget, setBudgetTarget,
    budgetFlexible, setBudgetFlexible,
  } = useFilterStore();

  const canContinue = useMemo(() => Boolean(cameraName) && (useCases?.length || 0) > 0, [cameraName, useCases]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500 mb-1">Step 1 of 4</div>
        <h2 className="text-xl font-semibold">The Essentials</h2>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Camera body</label>
        {/* Placeholder simple input; can be replaced by AvailabilitySelect or autocomplete */}
        <input
          value={cameraName}
          onChange={(e) => setCameraName(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          placeholder="Type your camera name"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Use cases</label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_USE_CASES.map((uc) => {
            const active = useCases.includes(uc);
            return (
              <button
                key={uc}
                type="button"
                onClick={() => setUseCases(active ? useCases.filter(u => u !== uc) : [...useCases, uc])}
                className={`px-3 py-1 rounded border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
              >
                {uc}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Target budget (CHF)</label>
        <input
          type="number"
          min={0}
          value={budgetTarget}
          onChange={(e) => setBudgetTarget(Number(e.target.value || 0))}
          className="border rounded px-3 py-2 w-40"
        />
        <label className="inline-flex items-center ml-4 gap-2 text-sm">
          <input
            type="checkbox"
            checked={budgetFlexible}
            onChange={(e) => setBudgetFlexible(e.target.checked)}
          />
          <span>Show options slightly above my budget if they offer exceptional value</span>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="button"
          disabled={!canContinue}
          className={`px-4 py-2 rounded ${canContinue ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          onClick={() => useFilterStore.getState().advance(1)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
