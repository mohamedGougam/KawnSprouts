import { useGameStore } from '../../app/store/gameStore';

const DECORATION_EMOJI: Record<string, string> = {
  bench: '🪑',
  'flower-pot': '🪴',
  'mushroom-lamp': '🍄',
  'tiny-pond': '💧',
  'wooden-sign': '🪧',
  'heart-stone': '💗',
  lantern: '🏮',
  'picnic-blanket': '🧺',
  'mini-windmill': '🌀',
  birdhouse: '🏠',
  'cloud-cushion': '☁️',
  'tiny-mailbox': '📬',
};

export function GardenDecorationsLayer() {
  const garden = useGameStore((s) => s.garden);
  const decorations = useGameStore((s) => s.decorations);
  const pendingLayout = useGameStore((s) => s.pendingGardenLayout);
  const layout = pendingLayout ?? garden.placements;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 h-32" aria-hidden="true">
      {layout.map((p) => {
        const dec = decorations.find((d) => d.id === p.decorationId);
        if (!dec) return null;
        return (
          <span
            key={p.id}
            className="absolute text-2xl"
            style={{
              left: `${(p.position.x / garden.gridWidth) * 100}%`,
              bottom: `${(p.position.y / garden.gridHeight) * 60}%`,
            }}
          >
            {DECORATION_EMOJI[dec.id] ?? '✨'}
          </span>
        );
      })}
    </div>
  );
}
