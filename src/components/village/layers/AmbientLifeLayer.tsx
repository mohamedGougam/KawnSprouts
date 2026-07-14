import { motion } from 'framer-motion';
import type { AtmosphereState } from '../../../services/atmosphereService';
import type { CameraState } from '../../../hooks/useCozyCamera';

interface AmbientLifeLayerProps {
  atmosphere: AtmosphereState;
  camera: CameraState;
  viewportW: number;
  viewportH: number;
}

export function AmbientLifeLayer({ atmosphere, camera, viewportW, viewportH }: AmbientLifeLayerProps) {
  const worldLeft = camera.x;
  const worldTop = camera.y;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Butterflies */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`bf-${i}`}
          className="absolute text-sm"
          style={{
            left: ((worldLeft + i * 200) % 800) + 50,
            top: ((worldTop + i * 150) % 600) + 100,
          }}
          animate={{
            x: [0, 60, 30, 80, 0],
            y: [0, -30, 20, -10, 0],
          }}
          transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🦋
        </motion.div>
      ))}

      {/* Birds */}
      <motion.div
        className="absolute text-xs opacity-70"
        animate={{ x: [viewportW * 0.2, viewportW * 0.8], y: [40, 60, 40] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        🐦
      </motion.div>

      {/* Fireflies at night */}
      {atmosphere.fireflies &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`ff-${i}`}
            className="absolute h-1.5 w-1.5 rounded-full bg-yellow-200 shadow-[0_0_6px_#fef08a]"
            style={{
              left: `${15 + (i * 19) % 70}%`,
              top: `${20 + (i * 13) % 60}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

      {/* Falling leaves in autumn */}
      {atmosphere.season === 'autumn' &&
        Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            className="absolute text-xs"
            style={{ left: `${(i * 25) % 100}%`, top: -10 }}
            animate={{ y: [0, viewportH + 20], rotate: [0, 360], x: [0, 30] }}
            transition={{ duration: 6 + i, repeat: Infinity, delay: i * 0.8 }}
          >
            🍂
          </motion.div>
        ))}

      {/* Dragonflies near water */}
      <motion.div
        className="absolute text-[10px] opacity-80"
        style={{ left: '30%', top: '45%' }}
        animate={{ x: [0, 40, -20, 30, 0], y: [0, -15, 10, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        🪰
      </motion.div>
    </div>
  );
}
