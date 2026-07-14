import { motion } from 'framer-motion';
import { SCATTER_PROPS } from '../../../config/worldPropsConfig';
import type { ScatterProp } from '../../../config/worldPropsConfig';
import { depthZIndex } from '../../../services/worldNavService';
import type { CameraState } from '../../../hooks/useCozyCamera';

const PROP_ICONS: Record<ScatterProp['type'], string> = {
  flower: '🌼',
  mushroom: '🍄',
  pebble: '·',
  stick: '/',
  leaf: '🍃',
  fence: '🪵',
  nest: '🪺',
  'watering-can': '🪣',
  log: '🪵',
  sign: '🪧',
  lantern: '🏮',
  bush: '🌿',
  reed: '|',
  lilypad: '🍃',
};

interface ScatterPropsLayerProps {
  layer: 'foreground' | 'midground';
  camera: CameraState;
}

function PropItem({ prop, parallax }: { prop: ScatterProp; parallax: number }) {
  const icon = PROP_ICONS[prop.type];
  const isTiny = prop.type === 'pebble' || prop.type === 'stick' || prop.type === 'reed';

  return (
    <motion.div
      className="absolute"
      style={{
        left: prop.position.x,
        top: prop.position.y,
        zIndex: depthZIndex(prop.position.y, prop.layer === 'foreground' ? 'fg' : 'mid'),
        transform: `translate(-50%, -50%) rotate(${prop.rotation ?? 0}deg) scale(${prop.scale ?? 1})`,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: prop.scale ?? 1 }}
      transition={{ duration: 0.8 }}
    >
      <span
        className={isTiny ? 'text-xs text-stone-600/80' : 'text-base drop-shadow-sm'}
        style={{ transform: `translateX(${parallax}px)` }}
      >
        {icon}
      </span>
    </motion.div>
  );
}

export function ScatterPropsLayer({ layer, camera }: ScatterPropsLayerProps) {
  const parallax = layer === 'foreground' ? -camera.x * 0.03 : -camera.x * 0.015;
  const props = SCATTER_PROPS.filter((p) => p.layer === layer);

  return (
    <>
      {props.map((prop) => (
        <PropItem key={prop.id} prop={prop} parallax={parallax} />
      ))}
    </>
  );
}
