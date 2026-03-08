import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import WatchPreview from '../components/WatchPreview';
import { downloadICS } from '../services/ics';
import { MONTH_NAMES } from '../utils/constants';
import type { ResolvedDate } from '../utils/types';

export default function ResultPeek() {
  const setScreen = useStore((s) => s.setScreen);
  const resetStealth = useStore((s) => s.resetStealth);
  const addReading = useStore((s) => s.addReading);
  const resolvedDate = useStore((s) => s.stealth.resolvedDate);
  const engineResult = useStore((s) => s.stealth.engineResult);
  const settings = useStore((s) => s.settings);

  const [watchVisible, setWatchVisible] = useState(settings.watchPeekPreview);
  const [saved, setSaved] = useState(false);

  // The date we're displaying — resolved single date
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
  }, []); // intentionally only on mount

  // Auto-save calendar if enabled
  useEffect(() => {
    if (settings.autoSaveCalendar && date) {
      downloadICS(date);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewReading = useCallback(() => {
    resetStealth();
    setScreen('stealth');
  }, [resetStealth, setScreen]);

  const handleHome = useCallback(() => {
    resetStealth();
    setScreen('home');
  }, [resetStealth, setScreen]);

  const handleSaveCalendar = useCallback(() => {
    if (!date) return;
    downloadICS(date);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [date]);

  if (!date) {
    // Fallback — should not happen in normal flow
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <button className="text-white/30 text-sm" onClick={handleHome}>Back</button>
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
      transition={{ duration: 0.6 }}
    >
      {/* Watch preview — top right */}
      <WatchPreview
        date={date}
        visible={watchVisible}
        onDismiss={() => setWatchVisible(false)}
      />

      {/* Main content */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-8"
        initial={{ y: 30, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120, mass: 0.8, delay: 0.15 }}
      >
        {/* Zodiac symbol */}
        <div
          className="text-white mb-4"
          style={{
            fontSize: 96,
            lineHeight: 1,
            filter: 'drop-shadow(0 0 60px rgba(255,255,255,0.08))',
          }}
        >
          {sign.symbol}
        </div>

        {/* Sign name */}
        <p
          className="uppercase text-white/40 mb-3 tracking-[10px]"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15, fontWeight: 300 }}
        >
          {sign.name}
        </p>

        {/* Date */}
        <p className="text-white mb-2" style={{ fontSize: 40, fontWeight: 100 }}>
          {MONTH_NAMES[date.month - 1]} {date.day}
        </p>

        {/* Element + date range */}
        <p className="text-white/15 text-xs tracking-widest uppercase mt-1">
          {sign.element} · {sign.dateRange}
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex flex-col gap-3 px-8 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="w-full py-4 rounded-2xl border text-sm tracking-[3px] uppercase font-light"
          style={{
            borderColor: saved ? 'rgba(255,159,10,0.5)' : 'rgba(255,159,10,0.3)',
            color: saved ? 'rgba(255,159,10,0.9)' : 'rgba(255,159,10,0.6)',
          }}
          onClick={handleSaveCalendar}
        >
          {saved ? 'Saved ✓' : 'Save to Calendar'}
        </button>

        <button
          className="w-full py-4 rounded-2xl border border-white/10 text-white/50 text-sm tracking-[3px] uppercase font-light"
          onClick={handleNewReading}
        >
          New Reading
        </button>

        <button
          className="w-full py-3 text-white/20 text-xs tracking-widest uppercase"
          onClick={handleHome}
        >
          Home
        </button>
      </motion.div>
    </motion.div>
  );
}
