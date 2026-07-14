import type { ReactNode } from 'react';

interface ZoomLabelProps {
  children: ReactNode;
  labelScale: number;
  className?: string;
  baseSize?: number;
}

/** Keeps on-map text the same screen size when the world is zoomed in/out */
export function ZoomLabel({ children, labelScale, className = '', baseSize = 11 }: ZoomLabelProps) {
  const fontSize = Math.max(9, baseSize * labelScale);

  return (
    <div
      className={`w-max max-w-[min(120px,38vw)] text-center ${className}`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.25 }}
    >
      {children}
    </div>
  );
}
