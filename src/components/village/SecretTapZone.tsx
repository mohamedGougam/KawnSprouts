import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SecretDiscovery } from '../../config/worldPropsConfig';
import { depthZIndex } from '../../services/worldNavService';

interface SecretTapZoneProps {
  secret: SecretDiscovery;
  discovered: boolean;
  onDiscover: (secret: SecretDiscovery) => void;
}

export function SecretTapZone({ secret, discovered, onDiscover }: SecretTapZoneProps) {
  const [showReveal, setShowReveal] = useState(false);

  if (discovered && !showReveal) return null;

  return (
    <div
      className="absolute"
      style={{
        left: secret.position.x,
        top: secret.position.y,
        zIndex: depthZIndex(secret.position.y),
      }}
    >
      <button
        type="button"
        className="focus-ring -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 transition hover:opacity-90"
        style={{ width: secret.radius * 2, height: secret.radius * 2 }}
        onClick={(e) => {
          e.stopPropagation();
          onDiscover(secret);
          setShowReveal(true);
          setTimeout(() => setShowReveal(false), 3000);
        }}
        aria-label="Discover something special"
        data-world-entity="true"
      >
        <span className="text-lg">{secret.icon}</span>
      </button>

      <AnimatePresence>
        {showReveal && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-none absolute -top-12 left-1/2 w-max max-w-[140px] -translate-x-1/2 rounded-xl bg-white/95 px-3 py-2 text-center text-[10px] font-medium text-gray-800 shadow-lg"
          >
            {secret.reveal}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
