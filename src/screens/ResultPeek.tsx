import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';
import type { ResolvedDate } from '../utils/types';

function textSymbol(symbol: string): string {
  return `${symbol}\uFE0E`;
}

export default function ResultPeek() {
  const setScreen = useStore((s) => s.setScreen);
  const resetStealth = useStore((s) => s.resetStealth);
  const addReading = useStore((s) => s.addReading);
  const resolvedDate = useStore((s) => s.stealth.resolvedDate);
  const engineResult = useStore((s) => s.stealth.engineResult);

  const date: ResolvedDate | null = resolvedDate;

  // Record to history on mount (only once)
  useEffect(() => {
    if (!date || !engineResult) return;
    addReading({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      result: engineResult,
      resolvedDate: date,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Intentional: records exactly once on mount — component only mounts when result is fresh
  }, []);

  const handleNewReading = useCallback(() => {
    resetStealth();
    setScreen('stealth');
  }, [resetStealth, setScreen]);

  const handleHome = useCallback(() => {
    resetStealth();
    setScreen('home');
  }, [resetStealth, setScreen]);

  if (!date) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <button className="text-white/34 text-sm tracking-[3px] uppercase" onClick={handleHome}>Back</button>
      </div>
    );
  }

  const { sign } = date;

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_62%)] pointer-events-none" />

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6"
        initial={{ y: 30, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8, delay: 0.15 }}
      >
        <div className="mb-6 rounded-full border border-white/[8%] bg-white/[3%] px-4 py-2.5">
          <span className="block text-white/40 text-[18px] leading-none text-center">
            {textSymbol(sign.symbol)}
          </span>
        </div>

        <p className="text-white text-[52px] font-thin mb-2 text-center leading-none">
          {MONTH_NAMES[date.month - 1]} {date.day}
        </p>

        <p className="font-display-upright text-white/72 text-[20px] tracking-[6px] uppercase mt-5">
          {sign.name}
        </p>

        <div className="mt-5 h-px w-14 bg-white/[8%]" />

        <p className="text-white/[16%] text-[11px] tracking-[4px] uppercase mt-5">
          {sign.element} · {sign.dateRange}
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 px-6 pb-safe-nav"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="w-full py-[18px] rounded-[24px] border border-white/[12%] bg-white/[6%] text-white/88 text-xs tracking-[5px] uppercase font-light"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => { e.preventDefault(); handleNewReading(); }}
          onClick={handleNewReading}
        >
          New Reading
        </motion.button>

        <motion.button
          className="w-full py-[18px] rounded-[24px] border border-white/[8%] bg-black/20 text-white/46 text-xs tracking-[4px] uppercase"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => { e.preventDefault(); handleHome(); }}
          onClick={handleHome}
        >
          Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
