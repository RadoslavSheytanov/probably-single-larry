import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';

const QUOTE = 'The little things are infinitely the most important.';
const QUOTE_WORDS = QUOTE.split(' ');

const WORD_EASE = [0.4, 0, 0.2, 1] as const;

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
      <div className="flex flex-col items-center pt-safe-header px-6 pb-0">
        <p className="text-[11px] tracking-[8px] uppercase font-medium text-white/50">
          Singularis
        </p>
        <div className="mt-5 w-10 border-t border-white/[8%]" />
      </div>

      {/* Quote — hero element */}
      <div className="flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <p
          className="font-display text-[20px] leading-[1.65] tracking-[0.01em] text-center text-white/70"
          aria-label={QUOTE}
        >
          {QUOTE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              style={{ display: 'inline-block', marginRight: '0.28em' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.35 + i * 0.06,
                duration: 0.55,
                ease: WORD_EASE,
              }}
            >
              {word}
            </motion.span>
          ))}
        </p>

        <motion.div
          className="mt-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 + QUOTE_WORDS.length * 0.06 + 0.15, duration: 0.4 }}
        >
          <div className="h-px w-4 bg-white/[8%]" />
          <p className="text-[9px] tracking-[3px] uppercase text-white/30">
            Arthur Conan Doyle
          </p>
          <div className="h-px w-4 bg-white/[8%]" />
        </motion.div>
      </div>

      {/* Status cards */}
      <div className="px-6 flex flex-col gap-2">
        {lastReading && (
          <motion.div
            className="px-5 py-4 rounded-2xl border border-white/[8%] bg-white/[4%]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: WORD_EASE }}
          >
            <p className="text-[9px] tracking-[4px] uppercase text-white/30 mb-1.5">
              Last reading
            </p>
            <p className="font-light text-white/70 text-[15px]">
              {lastReadingLabel()}
            </p>
          </motion.div>
        )}

        {!ntfyConfigured && (
          <motion.div
            className="px-5 py-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/[4%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <p className="font-light text-[11px] text-amber-500/50">
              ntfy topic not configured — watch notifications disabled
            </p>
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex-1 flex flex-col items-center justify-end gap-2.5 px-6 pb-4">
        <motion.button
          className="w-full py-[18px] rounded-2xl border border-white/[8%] bg-white/[4%] text-white/80 text-xs tracking-[5px] uppercase active:bg-white/[8%]"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('stealth'); }}
          onClick={() => setScreen('stealth')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4, ease: WORD_EASE }}
        >
          Start Performance
        </motion.button>

        <motion.button
          className="font-light w-full py-[14px] rounded-2xl border border-white/[8%] text-white/30 text-xs tracking-[4px] uppercase active:bg-white/[4%]"
          whileTap={{ scale: 0.97 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('practice'); }}
          onClick={() => setScreen('practice')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          Practice
        </motion.button>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-6 pb-safe-nav pt-3 border-t border-white/[8%]">
        <motion.button
          className="flex flex-col items-center gap-1.5 text-white/30 active:text-white/50"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('history'); }}
          onClick={() => setScreen('history')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <span className="text-lg">◷</span>
          <span className="text-[8px] tracking-[2.5px] uppercase">
            History
          </span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center gap-1.5 text-white/30 active:text-white/50"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('instructions'); }}
          onClick={() => setScreen('instructions')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <span className="text-lg">✦</span>
          <span className="text-[8px] tracking-[2.5px] uppercase">
            Guide
          </span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center gap-1.5 text-white/30 active:text-white/50"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('settings'); }}
          onClick={() => setScreen('settings')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <span className="text-lg">⚙</span>
          <span className="text-[8px] tracking-[2.5px] uppercase">
            Settings
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
