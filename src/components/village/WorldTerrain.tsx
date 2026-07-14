import type { WorldRegion } from '../../models';
import { WORLD_SIZE } from '../../config/villageConfig';

interface WorldTerrainProps {
  regions: WorldRegion[];
}

export function WorldTerrain({ regions }: WorldTerrainProps) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          width: WORLD_SIZE,
          height: WORLD_SIZE,
          background: 'linear-gradient(180deg,#bbf7d0,#86efac)',
        }}
        aria-hidden="true"
      />
      {regions.map((r) => (
        <div
          key={r.id}
          className="absolute overflow-hidden rounded-3xl opacity-90"
          style={{
            left: r.x,
            top: r.y,
            width: r.width,
            height: r.height,
            background: r.gradient,
          }}
          aria-hidden="true"
        >
          <span className="absolute left-3 top-2 text-[10px] font-semibold text-white/80 drop-shadow">
            {r.name}
          </span>
        </div>
      ))}
      {/* River shimmer */}
      <div
        className="absolute animate-pulse opacity-40"
        style={{ left: 180, top: 500, width: 120, height: 400, background: 'linear-gradient(90deg,transparent,#fff,transparent)' }}
        aria-hidden="true"
      />
      {/* Mountain peaks */}
      <div className="absolute" style={{ left: 1700, top: 120 }} aria-hidden="true">
        <span className="text-5xl">⛰️</span>
      </div>
      <div className="absolute" style={{ left: 2050, top: 200 }} aria-hidden="true">
        <span className="text-4xl">🏔️</span>
      </div>
    </>
  );
}
