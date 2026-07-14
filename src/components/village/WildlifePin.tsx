import { motion } from 'framer-motion';
import type { WildlifeAnimal, VillageMessage } from '../../models';
import { AnimatedWildlife } from './AnimatedWildlife';
import { ZoomLabel } from './ZoomLabel';
import { WorldEntityAnchor } from './WorldEntityAnchor';
import { HeadMessageBubble } from './HeadMessageBubble';
import { playBlobPop, playWorldSound, unlockAudio } from '../../services/audioService';
import type { WorldPosition } from '../../models';

interface WildlifePinProps {
  animal: WildlifeAnimal;
  headMessage: VillageMessage | null;
  onMessageTap?: (message: VillageMessage) => void;
  onTap: () => void;
  labelScale: number;
  soundEnabled: boolean;
  listenerPos?: WorldPosition;
  viewerId: string;
}

export function WildlifePin({
  animal,
  headMessage,
  onMessageTap,
  onTap,
  labelScale,
  soundEnabled,
  listenerPos,
  viewerId,
}: WildlifePinProps) {
  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    if (soundEnabled) {
      if (listenerPos) playWorldSound('blob', animal.position, listenerPos);
      else playBlobPop();
    }
    onTap();
  };

  const canReply = headMessage && headMessage.senderId !== viewerId;

  return (
    <div
      className="absolute z-15"
      style={{ left: animal.position.x, top: animal.position.y }}
      data-world-entity="true"
    >
      <WorldEntityAnchor>
        <HeadMessageBubble
          message={headMessage}
          labelScale={labelScale}
          tappable={!!canReply}
          hintReply={!!canReply}
          onTap={onMessageTap}
        />
        <motion.button
          type="button"
          onClick={handleTap}
          className="focus-ring pointer-events-auto flex flex-col items-center"
          whileTap={{ scale: 0.88 }}
          aria-label={`${animal.name}: ${animal.thought}`}
        >
          <AnimatedWildlife animal={animal} labelScale={1} />
          <ZoomLabel labelScale={labelScale} className="mt-0.5">
            <span className="block truncate rounded-full bg-white/90 px-2 py-0.5 font-semibold text-gray-800 shadow-sm">
              {animal.name}
            </span>
          </ZoomLabel>
        </motion.button>
      </WorldEntityAnchor>
    </div>
  );
}
