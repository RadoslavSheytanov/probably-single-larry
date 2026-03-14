import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import type { Screen } from '../utils/types';

type NavItem = {
  screen: Extract<Screen, 'history' | 'instructions' | 'settings'>;
  label: string;
  icon: ReactNode;
};

function NavIcon({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        active
          ? 'border-white/[16%] bg-white/[7%] text-white/88'
          : 'border-white/[5%] bg-white/[2%] text-white/40'
      }`}
    >
      {children}
    </span>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <NavIcon active={active}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="5.8" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 5.8V9.4L11.6 10.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </NavIcon>
  );
}

function GuideIcon({ active }: { active: boolean }) {
  return (
    <NavIcon active={active}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M9 2.7L10.6 6.4L14.6 8L10.6 9.6L9 13.3L7.4 9.6L3.4 8L7.4 6.4L9 2.7Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      </svg>
    </NavIcon>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <NavIcon active={active}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 2.5V4.1M9 13.9V15.5M13.6 4.4L12.5 5.5M5.5 12.5L4.4 13.6M15.5 9H13.9M4.1 9H2.5M13.6 13.6L12.5 12.5M5.5 5.5L4.4 4.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </NavIcon>
  );
}

const ITEMS: NavItem[] = [
  { screen: 'history', label: 'History', icon: <HistoryIcon active={false} /> },
  { screen: 'instructions', label: 'Guide', icon: <GuideIcon active={false} /> },
  { screen: 'settings', label: 'Settings', icon: <SettingsIcon active={false} /> },
];

export default function BottomNav() {
  const screen = useStore((s) => s.screen);
  const setScreen = useStore((s) => s.setScreen);

  return (
    <div className="px-6 pb-safe-nav pt-3">
      <div className="rounded-[28px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-3 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          {ITEMS.map((item) => {
            const active = screen === item.screen;
            const icon = item.screen === 'history'
              ? <HistoryIcon active={active} />
              : item.screen === 'instructions'
                ? <GuideIcon active={active} />
                : <SettingsIcon active={active} />;

            return (
              <motion.button
                key={item.screen}
                className={`flex min-w-[84px] flex-1 flex-col items-center gap-2 rounded-[22px] py-2 ${
                  active ? 'text-white/86' : 'text-white/46'
                }`}
                whileTap={{ scale: 0.96 }}
                onTouchStart={(e) => { e.preventDefault(); setScreen(item.screen); }}
                onClick={() => setScreen(item.screen)}
              >
                {icon}
                <span className={`font-ui-medium text-[10px] uppercase tracking-[2.8px] ${active ? 'text-white/78' : 'text-white/34'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
