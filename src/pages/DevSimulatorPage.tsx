import { useState } from 'react';
import { useGameStore } from '../app/store/gameStore';
import { getKawnEventTypes } from '../features/integration/kawnIntegration';
import { KAWN_EVENT_MAPPINGS } from '../config/gameConfig';
import type { KawnActivityEventType } from '../models';

export function DevSimulatorPage() {
  const simulateKawnActivity = useGameStore((s) => s.simulateKawnActivity);
  const sprout = useGameStore((s) => s.sprout);
  const [selected, setSelected] = useState<KawnActivityEventType>('POST_CREATED');
  const [result, setResult] = useState('');

  const events = getKawnEventTypes();

  const handleSimulate = () => {
    simulateKawnActivity(selected);
    const mapping = KAWN_EVENT_MAPPINGS[selected];
    setResult(`Simulated: ${mapping.description}. Growth: ${sprout.growthPoints}, Happiness: ${sprout.status.happiness}`);
  };

  return (
    <div className="p-4">
      <h1 className="mb-2 text-xl font-bold">Kawn Event Simulator</h1>
      <p className="mb-4 text-sm text-gray-500">Development only — access via ?dev query parameter</p>

      <label className="mb-4 block">
        <span className="text-sm font-medium">Event type</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as KawnActivityEventType)}
          className="focus-ring mt-1 w-full rounded-xl border px-3 py-2"
        >
          {events.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </label>

      <button type="button" onClick={handleSimulate} className="focus-ring w-full rounded-full bg-mint-400 py-3 font-semibold text-white">
        Simulate event
      </button>

      {result && <p className="mt-4 text-sm text-gray-600" role="status">{result}</p>}
    </div>
  );
}
