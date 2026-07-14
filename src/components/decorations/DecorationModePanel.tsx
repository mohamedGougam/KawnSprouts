import { useGameStore } from '../../app/store/gameStore';
import { GARDEN_GRID } from '../../config/gameConfig';
import { canPlaceDecoration, getDecorationById } from '../../services/gardenService';

export function DecorationModePanel() {
  const decorations = useGameStore((s) => s.decorations);
  const pendingLayout = useGameStore((s) => s.pendingGardenLayout);
  const garden = useGameStore((s) => s.garden);
  const selectedDecorationId = useGameStore((s) => s.selectedDecorationId);
  const selectDecoration = useGameStore((s) => s.selectDecoration);
  const placeDecoration = useGameStore((s) => s.placeDecoration);
  const removePlacement = useGameStore((s) => s.removePlacement);
  const exitDecorationMode = useGameStore((s) => s.exitDecorationMode);
  const player = useGameStore((s) => s.player);

  const layout = pendingLayout ?? garden.placements;
  const available = decorations.filter((d) => d.inventoryCount > 0 && d.unlockLevel <= player.level);

  const handleCellClick = (x: number, y: number) => {
    const existing = layout.find((p) => p.position.x === x && p.position.y === y);
    if (existing) {
      removePlacement(existing.id);
      return;
    }
    if (selectedDecorationId) {
      placeDecoration({ x, y });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] rounded-t-3xl bg-white p-4 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Decorate garden</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => exitDecorationMode(false)} className="focus-ring rounded-full px-4 py-2 text-sm text-gray-500">
            Cancel
          </button>
          <button type="button" onClick={() => exitDecorationMode(true)} className="focus-ring rounded-full bg-mint-400 px-4 py-2 text-sm font-semibold text-white">
            Save
          </button>
        </div>
      </div>

      <div
        className="mb-4 grid gap-1 rounded-xl bg-green-100 p-2"
        style={{
          gridTemplateColumns: `repeat(${GARDEN_GRID.width}, 1fr)`,
        }}
        role="grid"
        aria-label="Garden placement grid"
      >
        {Array.from({ length: GARDEN_GRID.height * GARDEN_GRID.width }).map((_, i) => {
          const x = i % GARDEN_GRID.width;
          const y = Math.floor(i / GARDEN_GRID.width);
          const placement = layout.find((p) => {
            const dec = getDecorationById(decorations, p.decorationId);
            if (!dec) return false;
            return (
              x >= p.position.x &&
              x < p.position.x + dec.width &&
              y >= p.position.y &&
              y < p.position.y + dec.height
            );
          });
          const canPlace =
            selectedDecorationId &&
            canPlaceDecoration(
              { x, y },
              getDecorationById(decorations, selectedDecorationId)!,
              layout,
              decorations,
            );

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleCellClick(x, y)}
              className={`aspect-square rounded text-xs ${placement ? 'bg-green-300' : canPlace ? 'bg-green-200 hover:bg-green-250' : 'bg-green-50'}`}
              aria-label={`Grid cell ${x}, ${y}`}
            >
              {placement ? '✓' : ''}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {available.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => selectDecoration(selectedDecorationId === d.id ? null : d.id)}
            className={`focus-ring shrink-0 rounded-xl px-3 py-2 text-xs ${selectedDecorationId === d.id ? 'bg-mint-400 text-white' : 'bg-gray-100'}`}
          >
            {d.name} (×{d.inventoryCount})
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-gray-400">Tap grid to place · Tap placed item to remove</p>
    </div>
  );
}
