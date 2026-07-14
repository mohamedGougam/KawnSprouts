import { X } from 'lucide-react';
import type { VillageMessage } from '../../models';
import { useVisualViewportInsets } from '../../hooks/useVisualViewportInsets';

interface VillageThreadPanelProps {
  open: boolean;
  title: string;
  messages: VillageMessage[];
  viewerId: string;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
  inputPlaceholder?: string;
}

export function VillageThreadPanel({
  open,
  title,
  messages,
  viewerId,
  input,
  onInputChange,
  onSend,
  onClose,
  inputPlaceholder = 'Reply…',
}: VillageThreadPanelProps) {
  const { keyboardOpen, bottomInset } = useVisualViewportInsets();

  if (!open) return null;

  const panelBottom = keyboardOpen ? bottomInset + 8 : 16;

  return (
    <div
      className="pointer-events-auto fixed right-2 z-[60] flex w-[min(18rem,calc(100vw-1rem))] flex-col rounded-2xl bg-white/95 shadow-xl ring-1 ring-gray-200 backdrop-blur-sm"
      style={{ top: '3.5rem', bottom: `${panelBottom}px` }}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-[10px] text-gray-500">Private thread · others see bubbles only</p>
        </div>
        <button type="button" onClick={onClose} className="focus-ring rounded-full p-1" aria-label="Close chat">
          <X size={16} />
        </button>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
        {messages.map((m) => {
          const isMine = m.senderId === viewerId;
          return (
            <li key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  isMine ? 'bg-mint-400 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {!isMine && <span className="mb-0.5 block text-[10px] font-semibold opacity-80">{m.senderName}</span>}
                {m.text}
              </div>
            </li>
          );
        })}
      </ul>

      <form
        className="flex gap-2 border-t border-gray-100 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={inputPlaceholder}
          maxLength={120}
          className="focus-ring min-h-[40px] flex-1 rounded-xl border border-gray-200 px-3 text-sm"
          onFocus={(e) => {
            window.setTimeout(() => e.target.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300);
          }}
        />
        <button type="submit" className="focus-ring rounded-xl bg-mint-400 px-3 text-sm font-semibold text-white">
          Send
        </button>
      </form>
    </div>
  );
}
