import type { WorldRegion } from '../../../models';
import type { AtmosphereState } from '../../../services/atmosphereService';
import { getSeasonGrassGradient } from '../../../services/atmosphereService';
import { WORLD_SIZE } from '../../../config/worldConstants';
import type { CameraState } from '../../../hooks/useCozyCamera';

interface WorldTerrainLayerProps {
  regions: WorldRegion[];
  atmosphere: AtmosphereState;
  camera: CameraState;
}

export function WorldTerrainLayer({ regions, atmosphere, camera }: WorldTerrainLayerProps) {
  const grass = getSeasonGrassGradient(atmosphere.season);
  const parallax = 0.35;
  const offsetX = -camera.x * parallax;
  const offsetY = -camera.y * parallax;

  return (
    <div
      className="absolute"
      style={{
        width: WORLD_SIZE,
        height: WORLD_SIZE,
        transform: `translate(${offsetX * 0.1}px, ${offsetY * 0.1}px)`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-0" style={{ background: grass }} />
      {regions.map((r) => (
        <div
          key={r.id}
          className="absolute overflow-hidden rounded-3xl opacity-92"
          style={{
            left: r.x,
            top: r.y,
            width: r.width,
            height: r.height,
            background: r.gradient,
            filter: atmosphere.goldenHour ? 'sepia(0.15) brightness(1.05)' : undefined,
          }}
        >
          {r.id !== 'river' && r.id !== 'lake' && r.id !== 'wetlands' && (
            <span className="absolute left-3 top-2 text-[10px] font-semibold text-white/70 drop-shadow">
              {r.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
