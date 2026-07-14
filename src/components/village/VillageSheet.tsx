import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface VillageSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function VillageSheet({ open, onClose, title, children }: VillageSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[100] mx-auto flex max-h-[55vh] max-w-[480px] flex-col rounded-t-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="village-sheet-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="shrink-0 p-5 pb-2">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" aria-hidden="true" />
              <h2 id="village-sheet-title" className="text-lg font-bold text-gray-900">
                {title}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5 text-gray-800">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
