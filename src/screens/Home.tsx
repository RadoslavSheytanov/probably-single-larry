import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';

export default function Home() {
  const setScreen = useStore((s) => s.setScreen);
  const history = useStore((s) => s.history);
  const settings = useStore((s) => s.settings);

  const lastReading = history[0] ?? null;
  const ntfyConfigured = settings.ntfyTopic.trim().length > 0;

  function lastReadingLabel() {
    if (!lastReading?.resolvedDate) return null;
    const { day, month, sign } = lastReading.resolvedDate;
    return `${sign.symbol} ${MONTH_NAMES[month - 1]} ${day} · ${sign.name}`;
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-8">
        <p className="text-[10px] tracking-[6px] uppercase text-white/20 mb-2">
          Singularis
        </p>
        <h1
          className="text-4xl font-light tracking-widest uppercase text-white/80"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Ready
        </h1>
      </div>

      {/* Last reading (if any) */}
      {lastReading && (
        <motion.div
          className="mx-8 mb-6 px-5 py-4 rounded-2xl border border-white/[0.04] bg-white/[0.02]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-[10px] tracking-[4px] uppercase text-white/20 mb-1">Last reading</p>
          <p className="text-white/60 text-base font-light">{lastReadingLabel()}</p>
        </motion.div>
      )}

      {/* ntfy warning */}
      {!ntfyConfigured && (
        <motion.div
          className="mx-8 mb-6 px-5 py-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[11px] text-amber-500/60">
            ntfy topic not configured — watch notifications disabled
          </p>
        </motion.div>
      )}

      {/* Start performance */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
        <motion.button
          className="w-full py-5 rounded-2xl border border-white/10 text-white/80 text-sm tracking-[4px] uppercase font-light active:bg-white/[0.06]"
          style={{ background: 'rgba(255,255,255,0.03)' }}
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => {
            e.preventDefault();
            setScreen('stealth');
          }}
          onClick={() => setScreen('stealth')}
        >
          Start Performance
        </motion.button>

        <motion.button
          className="w-full py-4 rounded-2xl border border-white/[0.06] text-white/40 text-sm tracking-[3px] uppercase font-light active:bg-white/[0.03]"
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => {
            e.preventDefault();
            setScreen('practice');
          }}
          onClick={() => setScreen('practice')}
        >
          Practice
        </motion.button>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-10 pb-12 pt-4">
        <motion.button
          className="flex flex-col items-center gap-1 text-white/25 active:text-white/50"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => {
            e.preventDefault();
            setScreen('history');
          }}
          onClick={() => setScreen('history')}
        >
          <span className="text-xl">◷</span>
          <span className="text-[9px] tracking-[2px] uppercase">History</span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center gap-1 text-white/25 active:text-white/50"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => {
            e.preventDefault();
            setScreen('settings');
          }}
          onClick={() => setScreen('settings')}
        >
          <span className="text-xl">⚙</span>
          <span className="text-[9px] tracking-[2px] uppercase">Settings</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
