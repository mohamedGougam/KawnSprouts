import { motion } from 'framer-motion';
import type { InteriorFurniture } from '../../../config/houseInteriorConfig';
import { playHouseSound } from '../../../services/houseAudioService';

interface InteractiveFurnitureProps {
  item: InteriorFurniture;
  theme: 'day' | 'evening' | 'night';
  onDoorExit?: () => void;
  onShopOpen?: () => void;
  shopUnlocked?: boolean;
  extraOwned?: boolean;
}

export function InteractiveFurniture({
  item,
  theme,
  onDoorExit,
  onShopOpen,
  shopUnlocked,
  extraOwned,
}: InteractiveFurnitureProps) {
  const handleTap = () => {
    switch (item.kind) {
      case 'window':
        playHouseSound('wind-window');
        playHouseSound('bird-outside');
        break;
      case 'chair':
        playHouseSound('wood-bounce');
        break;
      case 'table':
        playHouseSound('wood-knock');
        break;
      case 'bookshelf':
        playHouseSound('page-turn');
        break;
      case 'plant':
        playHouseSound('leaf-rustle');
        break;
      case 'fireplace':
        playHouseSound('fire-crackle');
        break;
      case 'clock':
        playHouseSound('clock-tick');
        break;
      case 'bed':
        playHouseSound('cushion');
        break;
      case 'teacup':
      case 'teapot':
        playHouseSound('steam');
        playHouseSound('spoon');
        break;
      case 'door':
        playHouseSound('door-creak');
        onDoorExit?.();
        break;
      case 'chest':
        playHouseSound('wood-knock');
        break;
      case 'lamp':
        playHouseSound('chime-soft');
        break;
      case 'shop':
        if (shopUnlocked) onShopOpen?.();
        break;
      default:
        playHouseSound('wood-knock');
    }
  };

  if (item.kind === 'shop' && !shopUnlocked) return null;
  if (item.kind === 'chair' && item.id !== 'chair-1' && !extraOwned) return null;

  const glow =
    theme === 'night'
      ? 'drop-shadow(0 0 6px rgba(253,186,116,0.5))'
      : theme === 'evening'
        ? 'drop-shadow(0 0 4px rgba(251,191,36,0.4))'
        : undefined;

  return (
    <motion.button
      type="button"
      className="absolute focus-ring"
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation ?? 0}deg) scale(${item.scale ?? 1})`,
        zIndex: Math.round(item.y) + (item.z ?? 0),
        filter: glow,
      }}
      whileTap={{ scale: (item.scale ?? 1) * 0.92 }}
      onClick={(e) => {
        e.stopPropagation();
        handleTap();
      }}
      aria-label={item.label}
    >
      <FurnitureVisual kind={item.kind} icon={item.icon} theme={theme} />
    </motion.button>
  );
}

function FurnitureVisual({
  kind,
  icon,
  theme,
}: {
  kind: InteriorFurniture['kind'];
  icon?: string;
  theme: 'day' | 'evening' | 'night';
}) {
  const lampGlow = theme !== 'day';

  switch (kind) {
    case 'window':
      return (
        <motion.div
          className="h-10 w-12 rounded-md border-[3px] border-amber-900/25 bg-sky-200/90 shadow-inner"
          whileTap={{ x: [0, 2, -2, 0] }}
        >
          <div className="absolute inset-y-1 left-1/2 w-px bg-amber-900/15" />
        </motion.div>
      );
    case 'chair':
      return (
        <motion.div whileTap={{ y: [0, -3, 0] }}>
          <div className="h-7 w-6 rounded-t-lg bg-amber-700 shadow-md" />
          <div className="mx-auto h-2 w-7 rounded-sm bg-amber-900/80" />
        </motion.div>
      );
    case 'table':
      return (
        <motion.div
          className="h-11 w-11 rounded-full bg-amber-600 shadow-lg ring-2 ring-amber-800/20"
          whileTap={{ scale: [1, 0.97, 1] }}
        />
      );
    case 'bookshelf':
      return (
        <motion.div
          className="h-14 w-9 rounded-sm bg-amber-900/85 shadow-md"
          whileTap={{ x: [0, 1, 0] }}
        >
          <div className="m-1 space-y-0.5">
            <div className="h-1 rounded-sm bg-sky-300" />
            <div className="h-1 rounded-sm bg-rose-300" />
            <div className="h-1 rounded-sm bg-lime-300" />
          </div>
        </motion.div>
      );
    case 'plant':
      return (
        <motion.span className="text-xl" whileTap={{ rotate: [0, -8, 8, 0] }} aria-hidden="true">
          {icon ?? '🪴'}
        </motion.span>
      );
    case 'fireplace':
      return (
        <motion.div
          className="relative h-12 w-14 rounded-t-lg bg-stone-700 shadow-lg"
          whileTap={{ scale: [1, 1.04, 1] }}
        >
          <motion.div
            className="absolute bottom-1 left-1/2 h-5 w-8 -translate-x-1/2 rounded-full bg-orange-400/80 blur-[1px]"
            animate={{ opacity: [0.6, 1, 0.7], scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
          />
        </motion.div>
      );
    case 'clock':
      return (
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-800 bg-amber-50 text-[10px] shadow"
          whileTap={{ rotate: [0, 6, -6, 0] }}
          aria-hidden="true"
        >
          🕰️
        </motion.div>
      );
    case 'bed':
      return (
        <motion.div whileTap={{ y: [0, 2, 0] }}>
          <div className="h-10 w-16 rounded-2xl bg-sky-200 shadow-md ring-1 ring-amber-900/10" />
          <div className="absolute -left-1 top-1 h-6 w-5 rounded-lg bg-amber-100" />
        </motion.div>
      );
    case 'teacup':
      return (
        <motion.span className="text-base" whileTap={{ y: [0, -2, 0] }} aria-hidden="true">
          ☕
        </motion.span>
      );
    case 'teapot':
      return (
        <motion.span className="text-lg" whileTap={{ rotate: [0, -5, 0] }} aria-hidden="true">
          🫖
        </motion.span>
      );
    case 'door':
      return (
        <motion.div
          className="h-12 w-10 rounded-sm border-2 border-amber-900/40 bg-amber-800 shadow-lg"
          whileTap={{ rotateY: [0, -55] }}
          style={{ transformOrigin: 'left center' }}
        >
          <div className="absolute right-1 top-1/2 h-1.5 w-1.5 rounded-full bg-yellow-300" />
        </motion.div>
      );
    case 'chest':
      return (
        <motion.div
          className="h-7 w-10 rounded-sm bg-amber-900 shadow-md"
          whileTap={{ y: [0, -2, 0] }}
        >
          <span className="flex justify-center text-[10px]">{icon ?? '📦'}</span>
        </motion.div>
      );
    case 'lamp':
      return (
        <motion.div
          className="relative"
          animate={lampGlow ? { opacity: [0.85, 1, 0.85] } : undefined}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <span className="text-lg" aria-hidden="true">
            💡
          </span>
          {lampGlow && (
            <div className="absolute -inset-2 rounded-full bg-amber-200/40 blur-md" />
          )}
        </motion.div>
      );
    case 'rug':
      return (
        <div
          className="h-8 w-16 rounded-full shadow-inner ring-1 ring-rose-400/30"
          style={{ background: 'radial-gradient(circle, #fda4af, #fb7185)' }}
        />
      );
    case 'painting':
      return (
        <div className="flex h-9 w-8 items-center justify-center rounded border-2 border-amber-900/25 bg-yellow-100 shadow">
          <span className="text-sm">{icon ?? '🖼️'}</span>
        </div>
      );
    case 'vase':
      return (
        <span className="text-base" aria-hidden="true">
          {icon ?? '🏺'}
        </span>
      );
    case 'shelf':
      return (
        <div className="h-8 w-12 rounded-sm bg-amber-800/70 shadow">
          <span className="flex justify-center text-xs">{icon ?? '📚'}</span>
        </div>
      );
    case 'shop':
      return (
        <div className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-md">
          🏪 Shop
        </div>
      );
    default:
      return null;
  }
}
