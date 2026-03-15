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

  useEffect(() => {
    if (!date || !engineResult) return;
    addReading({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      result: engineResult,
      resolvedDate: date,
    });
  }, [addReading, date, engineResult]);

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
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_62%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-24 h-44 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_74%)] pointer-events-none" />

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6"
        initial={{ y: 30, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8, delay: 0.15 }}
      >
        <p className="font-ui-medium mb-6 text-[10px] uppercase tracking-[4px] text-white/24">
          Reading complete
        </p>

        <span className="mb-6 block text-center text-[34px] leading-none text-white/46">
          {textSymbol(sign.symbol)}
        </span>

        <p className="font-ui-light mb-2 text-center text-[56px] leading-none text-white">
          {MONTH_NAMES[date.month - 1]} {date.day}
        </p>

        <p className="mt-5 font-display-upright text-[22px] uppercase tracking-[6px] text-white/72">
          {sign.name}
        </p>

        <div className="mt-5 h-px w-14 bg-white/[8%]" />

        <p className="font-ui-medium mt-5 text-[11px] uppercase tracking-[4px] text-white/[16%]">
          {sign.element} · {sign.dateRange}
        </p>
      </motion.div>

      <motion.div
        className="px-6 pb-safe-nav"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-3">
          <motion.button
            className="w-full rounded-[24px] border border-white/[10%] bg-white/[6%] px-5 py-4 text-left"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.985 }}
            onTouchStart={(e) => { e.preventDefault(); handleNewReading(); }}
            onClick={handleNewReading}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-ui-medium text-[10px] uppercase tracking-[3.5px] text-white/34">Continue</p>
                <p className="font-ui-light mt-2 text-[17px] text-white/88">Begin another reading</p>
              </div>
              <span className="text-[18px] text-white/40" aria-hidden="true">→</span>
            </div>
          </motion.button>

          <motion.button
            className="font-ui-medium w-full px-5 py-4 text-[11px] uppercase tracking-[3.5px] text-white/34"
            whileTap={{ scale: 0.985 }}
            onTouchStart={(e) => { e.preventDefault(); handleHome(); }}
            onClick={handleHome}
          >
            Return Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
