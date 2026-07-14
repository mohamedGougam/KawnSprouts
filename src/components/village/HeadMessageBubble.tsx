import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { VillageMessage } from '../../models';

interface HeadMessageBubbleProps {
  message: VillageMessage | null;
  labelScale?: number;
  tappable?: boolean;
  onTap?: (message: VillageMessage) => void;
  hintReply?: boolean;
}

export function HeadMessageBubble({
  message,
  labelScale = 1,
  tappable = false,
  onTap,
  hintReply = false,
}: HeadMessageBubbleProps) {
  if (!message) return null;

  const fontSize = Math.max(9, 11 * labelScale);
  const iconSize = Math.max(10, 12 * labelScale);

  const content = (
    <>
      {hintReply && (
        <div
          className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-sky-400 text-white shadow-md"
          style={{ width: iconSize + 8, height: iconSize + 8 }}
        >
          <MessageCircle size={iconSize} aria-hidden="true" />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl bg-white px-2.5 py-2 leading-snug text-gray-800 shadow-md ring-1 ring-gray-100 ${
          message.kind === 'thread' ? 'ring-sky-200' : ''
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <span className="block font-semibold text-mint-600">{message.senderName}</span>
        <span className="line-clamp-2">{message.text}</span>
        {hintReply && message.kind === 'shout' && (
          <span className="mt-0.5 block text-[0.85em] text-sky-500">Tap to reply</span>
        )}
      </motion.div>
    </>
  );

  return (
    <div className="relative z-30 mb-1 w-max max-w-[min(150px,40vw)]">
      {tappable && onTap ? (
        <button
          type="button"
          className="focus-ring pointer-events-auto text-left"
          onClick={(e) => {
            e.stopPropagation();
            onTap(message);
          }}
          data-world-entity="true"
          aria-label={`Reply to ${message.senderName}: ${message.text}`}
        >
          {content}
        </button>
      ) : (
        <div className="pointer-events-none">{content}</div>
      )}
    </div>
  );
}
