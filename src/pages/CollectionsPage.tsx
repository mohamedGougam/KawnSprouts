import { useState } from 'react';
import { useGameStore } from '../app/store/gameStore';

export function CollectionsPage() {
  const flowers = useGameStore((s) => s.flowers);
  const butterflies = useGameStore((s) => s.butterflies);
  const openCollectionAction = useGameStore((s) => s.openCollection);
  const [tab, setTab] = useState<'flowers' | 'butterflies'>('flowers');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const handleOpen = () => openCollectionAction();

  const discoveredButterflies = butterflies.filter((b) => b.discovered);
  const completionPct = Math.round((discoveredButterflies.length / butterflies.length) * 100);

  const filteredButterflies =
    rarityFilter === 'all'
      ? butterflies
      : butterflies.filter((b) => b.rarity === rarityFilter);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Collections</h1>

      <div className="mb-4 flex gap-2">
        <TabButton active={tab === 'flowers'} onClick={() => { setTab('flowers'); handleOpen(); }}>
          Flowers
        </TabButton>
        <TabButton active={tab === 'butterflies'} onClick={() => { setTab('butterflies'); handleOpen(); }}>
          Butterflies
        </TabButton>
      </div>

      {tab === 'flowers' && (
        <div className="grid grid-cols-3 gap-3">
          {flowers.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelected(f.id)}
              className="focus-ring rounded-2xl bg-white p-3 shadow-sm"
            >
              <div className="text-3xl">{f.discovered ? '🌸' : '❓'}</div>
              <p className="mt-1 text-xs font-medium">{f.discovered ? f.name : '???'}</p>
              {!f.discovered && (
                <p className="mt-1 text-[9px] text-gray-400">{f.unlockCondition}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {tab === 'butterflies' && (
        <>
          <p className="mb-3 text-sm text-gray-600">{completionPct}% complete</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {['all', 'common', 'uncommon', 'rare', 'special'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRarityFilter(r)}
                className={`focus-ring rounded-full px-3 py-1 text-xs capitalize ${rarityFilter === r ? 'bg-mint-400 text-white' : 'bg-gray-100'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredButterflies.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b.id)}
                className="focus-ring rounded-2xl bg-white p-3 text-left shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{b.discovered ? '🦋' : '❓'}</span>
                  {b.discovered && b.collectedCount === 1 && (
                    <span className="rounded-full bg-peach-100 px-2 text-[10px] text-peach-400">New</span>
                  )}
                </div>
                <p className="font-medium">{b.discovered ? b.name : '???'}</p>
                <p className="text-xs capitalize text-gray-400">{b.rarity}</p>
                {b.discovered && <p className="text-xs text-gray-500">Collected: {b.collectedCount}</p>}
              </button>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="max-w-sm rounded-3xl bg-white p-6">
            {(() => {
              const flower = flowers.find((f) => f.id === selected);
              const butterfly = butterflies.find((b) => b.id === selected);
              const item = flower ?? butterfly;
              if (!item) return null;
              return (
                <>
                  <h3 className="text-lg font-bold">{item.discovered ? item.name : 'Undiscovered'}</h3>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  <p className="mt-1 text-xs capitalize text-gray-400">{item.rarity}</p>
                  <button type="button" onClick={() => setSelected(null)} className="focus-ring mt-4 w-full rounded-full bg-mint-400 py-2 text-white">
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-mint-400 text-white' : 'bg-white text-gray-600'}`}
    >
      {children}
    </button>
  );
}
