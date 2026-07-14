import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface GameLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function GameLayout({ children, hideNav = false }: GameLayoutProps) {
  return (
    <div className="game-container flex flex-col">
      <main className={`flex-1 ${hideNav ? '' : 'pb-20'}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
