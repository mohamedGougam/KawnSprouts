import { motion } from 'framer-motion';
import { WATER_FEATURES } from '../../../config/worldPropsConfig';
import type { CameraState } from '../../../hooks/useCozyCamera';

interface WaterLayerProps {
  camera: CameraState;
}

export function WaterLayer({ camera }: WaterLayerProps) {
  const parallax = 0.5;
  const offsetX = -camera.x * parallax * 0.05;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {WATER_FEATURES.map((wf) => {
        if (wf.type === 'ripple') {
          return (
            <div
              key={wf.id}
              className="absolute overflow-hidden rounded-3xl"
              style={{ left: wf.position.x, top: wf.position.y, width: wf.width, height: wf.height }}
            >
              <motion.div
                className="absolute inset-0 opacity-25"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                  transform: `translateX(${offsetX}px)`,
                }}
                animate={{ x: [-60, 60, -60] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 opacity-15"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
              />
              {/* Fish shadows */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-5 rounded-full bg-sky-900/20"
                  style={{ top: 40 + i * 80, left: 60 + i * 120 }}
                  animate={{ x: [0, 80, 0], opacity: [0.2, 0.35, 0.2] }}
                  transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.5 }}
                />
              ))}
            </div>
          );
        }
        if (wf.type === 'lilypad') {
          return (
            <motion.div
              key={wf.id}
              className="absolute"
              style={{ left: wf.position.x, top: wf.position.y }}
              animate={{ rotate: [-3, 3, -3], y: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="h-8 w-10 rounded-full bg-green-500/70 shadow-sm" />
            </motion.div>
          );
        }
        if (wf.type === 'reed') {
          return (
            <motion.div
              key={wf.id}
              className="absolute w-1 bg-green-700/60"
              style={{ left: wf.position.x, top: wf.position.y, height: wf.height }}
              animate={{ rotate: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          );
        }
        if (wf.type === 'sparkle') {
          return (
            <motion.div
              key={wf.id}
              className="absolute h-2 w-2 rounded-full bg-white/80"
              style={{ left: wf.position.x, top: wf.position.y }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
