import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useVisualViewportInsets } from '../../hooks/useVisualViewportInsets';

interface GameLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function GameLayout({ children, hideNav = false }: GameLayoutProps) {
  const { keyboardOpen } = useVisualViewportInsets();

  return (
    <div className="game-container flex flex-col">
      <main className={`flex-1 ${hideNav || keyboardOpen ? '' : 'pb-20'}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
