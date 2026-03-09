import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { compute } from '../engine/singularis';
import { MONTH_NAMES, DAYS_IN_MONTH } from '../utils/constants';

function randomDate(): { day: number; month: number } {
  let day: number, month: number;
  do {
    month = Math.floor(Math.random() * 12) + 1;
    const maxDay = DAYS_IN_MONTH[month - 1];
    day = Math.floor(Math.random() * maxDay) + 1;
  } while (day + month < 5);
  return { day, month };
}

function EdgeFlag({ label }: { label: string }) {
  return (
    <span
      className="text-xs tracking-wide px-2 py-0.5 rounded-md mr-2"
      style={{ background: 'rgba(255,159,10,0.12)', color: 'rgba(255,159,10,0.7)' }}
    >
      {label}
    </span>
  );
}

export default function PracticeMode() {
  const setScreen = useStore((s) => s.setScreen);
  const [date, setDate] = useState(() => randomDate());
  const [revealed, setRevealed] = useState(false);

  const { day, month } = date;
  const A = day + month;
  const D = Math.abs(day - month);
  const result = compute(A, D);

  const isAmbiguous = result.kind === 'ambiguous';
  const isDZero = D === 0;
  const isAnchorLow = A < 5; // won't happen due to randomDate guard, but defensive

  const nextDate = useCallback(() => {
    setDate(randomDate());
    setRevealed(false);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-safe-header pb-6">
        <p
          className="uppercase tracking-[6px] text-xs"
          style={{ color: 'rgba(255,159,10,0.5)' }}
        >
          Drill Mode
        </p>
        <button
          className="text-white/20 text-xs tracking-[3px] uppercase"
          onTouchStart={(e) => { e.preventDefault(); setScreen('home'); }}
          onClick={() => setScreen('home')}
        >
          Close
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Target date */}
        <p className="text-white/20 text-[10px] tracking-[5px] uppercase mb-3">Target Date</p>
        <p className="text-white font-light mb-1" style={{ fontSize: 52 }}>
          {MONTH_NAMES[month - 1]} {day}
        </p>
        <p className="text-white/20 text-xs tracking-widest uppercase mb-10">
          Work out A and D mentally, then check
        </p>

        {/* Edge case flags (before reveal to hint at difficulty) */}
        {(isAmbiguous || isDZero || isAnchorLow) && (
          <div className="flex flex-wrap mb-6">
            {isAmbiguous && <EdgeFlag label="Ambiguous" />}
            {isDZero && <EdgeFlag label="D = 0" />}
            {isAnchorLow && <EdgeFlag label="Anchor too low" />}
          </div>
        )}

        {/* Reveal / Answer */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.button
                key="reveal"
                className="w-full py-4 rounded-2xl border border-white/10 text-white/40 text-sm tracking-[3px] uppercase font-light"
                whileTap={{ scale: 0.97 }}
                onTouchStart={(e) => { e.preventDefault(); setRevealed(true); }}
                onClick={() => setRevealed(true)}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                Reveal Answer
              </motion.button>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5"
              >
                {/* A and D */}
                <div className="flex justify-around mb-5">
                  <div className="text-center">
                    <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-1">A</p>
                    <p className="text-white text-3xl font-light">{A}</p>
                  </div>
                  <div className="w-px bg-white/[0.06]" />
                  <div className="text-center">
                    <p className="text-white/20 text-[10px] tracking-[4px] uppercase mb-1">D</p>
                    <p className="text-white text-3xl font-light">{D}</p>
                  </div>
                </div>

                {/* Calculation steps */}
                <div className="mb-5 space-y-1">
                  <p className="text-white/30 text-xs font-mono">
                    (A − D) / 2 = ({A} − {D}) / 2 = {(A - D) / 2}
                  </p>
                  <p className="text-white/30 text-xs font-mono">
                    A − smaller = {A} − {(A - D) / 2} = {A - (A - D) / 2}
                  </p>
                </div>

                {/* Result */}
                {result.kind === 'ok' && (
                  <div className="flex items-center gap-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-3xl">{result.primary.sign.symbol}</span>
                    <div>
                      <p className="text-white/80 text-base font-light">
                        {MONTH_NAMES[result.primary.month - 1]} {result.primary.day}
                      </p>
                      <p className="text-white/25 text-xs">{result.primary.sign.name}</p>
                    </div>
                  </div>
                )}

                {result.kind === 'ambiguous' && (
                  <div className="pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{result.primary.sign.symbol}</span>
                      <div>
                        <p className="text-white/80 text-base font-light">
                          {MONTH_NAMES[result.primary.month - 1]} {result.primary.day}
                        </p>
                        <p className="text-white/25 text-xs">{result.primary.sign.name}</p>
                      </div>
                    </div>
                    <p className="text-white/15 text-xs tracking-widest uppercase mb-3">or</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{result.alternate.sign.symbol}</span>
                      <div>
                        <p className="text-white/80 text-base font-light">
                          {MONTH_NAMES[result.alternate.month - 1]} {result.alternate.day}
                        </p>
                        <p className="text-white/25 text-xs">{result.alternate.sign.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {result.kind === 'error' && (
                  <p className="text-xs pt-3 border-t border-white/[0.04]" style={{ color: 'rgba(255,90,90,0.6)' }}>
                    Error: {result.reason.replace(/_/g, ' ')}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Next Date */}
      <div className="px-8 pb-safe-nav pt-4">
        <motion.button
          className="w-full py-4 rounded-2xl border text-sm tracking-[3px] uppercase font-light"
          style={{ borderColor: 'rgba(255,159,10,0.3)', color: 'rgba(255,159,10,0.6)' }}
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => { e.preventDefault(); nextDate(); }}
          onClick={nextDate}
        >
          Next Date
        </motion.button>
      </div>
    </motion.div>
  );
}
