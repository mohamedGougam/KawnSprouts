import type { ReactNode } from 'react';

interface WorldEntityAnchorProps {
  children: ReactNode;
  className?: string;
}

/** Centers map entities on a world point; keeps labels aligned when the map is zoomed */
export function WorldEntityAnchor({ children, className = '' }: WorldEntityAnchorProps) {
  return (
    <div
      className={`pointer-events-none absolute left-0 top-0 flex w-max min-w-[72px] -translate-x-1/2 -translate-y-full flex-col items-center ${className}`}
    >
      {children}
    </div>
  );
}
