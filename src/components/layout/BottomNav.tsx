import { Link, useLocation } from 'react-router-dom';
import { Flower2, Heart, Home, Map, User } from 'lucide-react';
import { myKawniee } from '../../config/terminology';

const NAV_ITEMS = [
  { to: '/', label: 'Village', icon: Map },
  { to: '/home', label: myKawniee(), icon: Home },
  { to: '/activities', label: 'Activities', icon: Flower2 },
  { to: '/friends', label: 'Friends', icon: Heart },
  { to: '/profile', label: 'Profile', icon: User },
];

import { useVisualViewportInsets } from '../../hooks/useVisualViewportInsets';

export function BottomNav() {
  const location = useLocation();
  const { keyboardOpen } = useVisualViewportInsets();

  if (keyboardOpen) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-white/50 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <ul className="flex items-center justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={`focus-ring flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-xs transition-colors ${
                  active
                    ? 'font-semibold text-mint-500'
                    : 'text-gray-500 hover:text-mint-400'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={22} aria-hidden="true" />
                <span>{label}</span>
                <span className="sr-only">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
