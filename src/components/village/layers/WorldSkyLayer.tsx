import { motion } from 'framer-motion';
import type { AtmosphereState } from '../../../services/atmosphereService';
import { getSkyGradient } from '../../../services/atmosphereService';
import { WORLD_SIZE } from '../../../config/worldConstants';
import type { CameraState } from '../../../hooks/useCozyCamera';

interface WorldSkyLayerProps {
  atmosphere: AtmosphereState;
  camera: CameraState;
  viewportW: number;
  viewportH: number;
}

export function WorldSkyLayer({ atmosphere, camera, viewportW, viewportH }: WorldSkyLayerProps) {
  const sky = getSkyGradient(atmosphere.theme, atmosphere.season);
  const parallax = 0.15;
  const offsetX = -camera.x * parallax;
  const offsetY = -camera.y * parallax * 0.5;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: sky }}
      aria-hidden="true"
    >
      {atmosphere.mistOpacity > 0 && (
        <div
          className="absolute inset-0 bg-white/30"
          style={{ opacity: atmosphere.mistOpacity }}
        />
      )}

      {/* Parallax clouds */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/70 blur-sm"
          style={{
            width: 80 + i * 30,
            height: 30 + i * 8,
            left: offsetX + (i * 420) % (WORLD_SIZE * 0.6) + i * 100,
            top: offsetY + 40 + i * 35,
          }}
          animate={{ x: [0, 30 + i * 10, 0] }}
          transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Distant mountains */}
      <div
        className="absolute opacity-60"
        style={{
          left: offsetX * 0.4 + viewportW * 0.3,
          top: offsetY * 0.3 + 60,
          transform: `translateX(${-camera.x * 0.08}px)`,
        }}
      >
        <span className="text-6xl">⛰️</span>
      </div>
      <div
        className="absolute opacity-50"
        style={{
          left: offsetX * 0.4 + viewportW * 0.6,
          top: offsetY * 0.3 + 100,
          transform: `translateX(${-camera.x * 0.06}px)`,
        }}
      >
        <span className="text-5xl">🏔️</span>
      </div>

      {atmosphere.showRainbow && (
        <div
          className="absolute left-1/2 top-16 h-24 w-64 -translate-x-1/2 rounded-t-full opacity-40"
          style={{
            background: 'linear-gradient(180deg, rgba(255,0,0,0.3), rgba(255,165,0,0.2), rgba(255,255,0,0.2), rgba(0,128,0,0.2), rgba(0,0,255,0.2), rgba(75,0,130,0.2))',
          }}
        />
      )}

      {atmosphere.weather === 'rain' && (
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-4 w-px bg-sky-300/80"
              style={{ left: `${(i * 17) % 100}%`, top: -10 }}
              animate={{ y: [0, viewportH + 20] }}
              transition={{ duration: 0.8 + (i % 5) * 0.1, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      )}

      {atmosphere.weather === 'snow' && (
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-white/90"
              style={{ left: `${(i * 23) % 100}%`, top: -5 }}
              animate={{ y: [0, viewportH], x: [0, (i % 3) * 10 - 10] }}
              transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
