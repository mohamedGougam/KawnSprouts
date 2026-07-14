import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { VillageChatMessage } from '../../models';

interface ChatBubbleOverlayProps {
  messages: VillageChatMessage[];
  showIndicator?: boolean;
  labelScale?: number;
}

export function ChatBubbleOverlay({ messages, showIndicator, labelScale = 1 }: ChatBubbleOverlayProps) {
  if (!messages.length && !showIndicator) return null;

  const latest = messages[messages.length - 1];
  const fontSize = Math.max(9, 11 * labelScale);
  const iconSize = Math.max(10, 12 * labelScale);

  return (
    <div className="pointer-events-none relative z-30 mb-1 w-max max-w-[min(150px,40vw)]">
      {showIndicator && messages.length > 0 && (
        <div
          className="absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-sky-400 text-white shadow-md"
          style={{ width: iconSize + 8, height: iconSize + 8 }}
        >
          <MessageCircle size={iconSize} aria-hidden="true" />
        </div>
      )}
      {latest && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-white px-2.5 py-2 leading-snug text-gray-800 shadow-md ring-1 ring-gray-100"
          style={{ fontSize: `${fontSize}px` }}
        >
          <span className="block font-semibold text-mint-600">{latest.senderName}</span>
          <span className="line-clamp-2">{latest.text}</span>
        </motion.div>
      )}
    </div>
  );
}
