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
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex flex-col items-center pt-safe-header px-8 pb-0">
        <p
          className="text-[9px] tracking-[8px] uppercase text-white/30"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
        >
          Singularis
        </p>
        <div className="mt-5 w-10 border-t border-white/[0.09]" />
      </div>

      {/* Quote — hero element */}
      <div className="flex flex-col items-center justify-center px-10 pt-12 pb-6">
        <p
          className="text-center leading-relaxed text-white/65"
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 20,
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: '0.01em',
            lineHeight: 1.65,
          }}
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
          <div className="h-px w-4 bg-white/[0.06]" />
          <p
            className="text-[7px] tracking-[3px] uppercase text-white/[0.10]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            Arthur Conan Doyle
          </p>
          <div className="h-px w-4 bg-white/[0.06]" />
        </motion.div>
      </div>

      {/* Status cards */}
      <div className="px-5 flex flex-col gap-2">
        {lastReading && (
          <motion.div
            className="px-5 py-4 rounded-2xl border border-white/[0.07] bg-white/[0.035]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: WORD_EASE }}
          >
            <p
              className="text-[9px] tracking-[4px] uppercase text-white/25 mb-1.5"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
            >
              Last reading
            </p>
            <p
              className="text-white/60 text-[15px]"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              {lastReadingLabel()}
            </p>
          </motion.div>
        )}

        {!ntfyConfigured && (
          <motion.div
            className="px-5 py-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <p
              className="text-[11px] text-amber-500/60"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              ntfy topic not configured — watch notifications disabled
            </p>
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex-1 flex flex-col items-center justify-end gap-2.5 px-6 pb-4">
        <motion.button
          className="w-full py-[18px] rounded-2xl border border-white/[0.14] text-white/80 text-xs tracking-[5px] uppercase active:bg-white/[0.06]"
          style={{
            background: 'rgba(255,255,255,0.05)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
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
          className="w-full py-[14px] rounded-2xl border border-white/[0.08] text-white/35 text-xs tracking-[4px] uppercase active:bg-white/[0.02]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
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
      <div className="flex items-center justify-between px-10 pb-safe-nav pt-3 border-t border-white/[0.06]">
        <motion.button
          className="flex flex-col items-center gap-1.5 text-white/25 active:text-white/55"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('history'); }}
          onClick={() => setScreen('history')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <span className="text-lg">◷</span>
          <span
            className="text-[8px] tracking-[2.5px] uppercase"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            History
          </span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center gap-1.5 text-white/25 active:text-white/55"
          whileTap={{ scale: 0.92 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('settings'); }}
          onClick={() => setScreen('settings')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
        >
          <span className="text-lg">⚙</span>
          <span
            className="text-[8px] tracking-[2.5px] uppercase"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            Settings
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
