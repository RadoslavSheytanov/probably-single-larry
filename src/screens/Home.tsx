import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';

const QUOTE = 'The little things are infinitely the most important.';
const QUOTE_WORDS = QUOTE.split(' ');
const WORD_EASE = [0.4, 0, 0.2, 1] as const;

function textSymbol(symbol: string): string {
  return `${symbol}\uFE0E`;
}

export default function Home() {
  const setScreen = useStore((s) => s.setScreen);
  const history = useStore((s) => s.history);
  const settings = useStore((s) => s.settings);

  const lastReading = history[0] ?? null;
  const ntfyEnabled = settings.ntfyEnabled;
  const ntfyConfigured = settings.ntfyTopic.trim().length > 0;
  const requiresNtfySetup = ntfyEnabled && !ntfyConfigured;
  const hasSupplementaryPanel = requiresNtfySetup || Boolean(lastReading);

  function lastReadingLabel() {
    if (!lastReading?.resolvedDate) return null;
    const { day, month, sign } = lastReading.resolvedDate;
    return `${textSymbol(sign.symbol)} ${MONTH_NAMES[month - 1]} ${day} · ${sign.name}`;
  }

  function primaryActionLabel() {
    if (requiresNtfySetup) return 'Configure Notifications';
    return 'Start Performance';
  }

  function handlePrimaryAction() {
    if (requiresNtfySetup) {
      setScreen('settings');
      return;
    }
    setScreen('stealth');
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#0a0a0a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex-1 overflow-y-auto">
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_62%)] pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center pt-safe-header px-6 pb-0">
          <p className="text-[11px] tracking-[8px] uppercase font-medium text-white/62">
            Singularis
          </p>
          <div className="mt-5 w-10 border-t border-white/[10%]" />
        </div>

        {/* Hero */}
        <div className="px-6 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: WORD_EASE }}
          >
            <p
              className="font-display text-[28px] leading-[1.35] tracking-[0.01em] text-white/82 text-center"
              aria-label={QUOTE}
            >
              {QUOTE_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  style={{ display: 'inline-block', marginRight: '0.28em' }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.05,
                    duration: 0.5,
                    ease: WORD_EASE,
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </p>

            <motion.div
              className="mt-5 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.4 }}
            >
              <div className="h-px w-5 bg-white/[12%]" />
              <p className="text-[9px] tracking-[3px] uppercase text-white/35">
                Arthur Conan Doyle
              </p>
              <div className="h-px w-5 bg-white/[12%]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className={`px-6 flex flex-col gap-3 ${hasSupplementaryPanel ? 'pt-8' : 'pt-[72px]'}`}>
          <motion.button
            className="w-full py-[18px] rounded-[24px] border border-white/[12%] bg-white/[6%] text-white/90 text-xs tracking-[5px] uppercase active:bg-white/[10%]"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
            whileTap={{ scale: 0.97 }}
            onTouchStart={(e) => { e.preventDefault(); handlePrimaryAction(); }}
            onClick={handlePrimaryAction}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: WORD_EASE }}
          >
            {primaryActionLabel()}
          </motion.button>
        </div>

        {/* Guidance */}
        <div className={`px-6 pb-6 flex flex-col gap-3 ${hasSupplementaryPanel ? 'pt-5' : 'pt-0'}`}>
          {requiresNtfySetup && (
            <motion.div
              className="rounded-[24px] border border-amber-500/22 bg-amber-500/[5%] px-5 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24, duration: 0.4 }}
            >
              <p className="text-[10px] tracking-[3px] uppercase text-amber-500/70 mb-2">
                Before you perform
              </p>
              <p className="font-light text-[13px] leading-[1.7] text-amber-100/75">
                Your watch delivery is still offline. Add your private ntfy topic in Settings
                before using this live.
              </p>
            </motion.div>
          )}

          {lastReading && (
            <motion.div
              className="px-5 py-4 rounded-[24px] border border-white/[8%] bg-black/20"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4, ease: WORD_EASE }}
            >
              <p className="text-[10px] tracking-[4px] uppercase text-white/40 mb-1.5">
                Last reading
              </p>
              <p className="font-light text-white/80 text-[15px]">
                {lastReadingLabel()}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-6 pb-safe-nav pt-3 border-t border-white/[8%] bg-[#0a0a0a]/95">
        <motion.button
          className="flex min-w-[72px] flex-col items-center gap-1.5 text-white/48 active:text-white/78"
          whileTap={{ scale: 0.94 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('history'); }}
          onClick={() => setScreen('history')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          <span className="text-[20px]">◷</span>
          <span className="text-[10px] tracking-[2.5px] uppercase font-medium">
            History
          </span>
        </motion.button>

        <motion.button
          className="flex min-w-[72px] flex-col items-center gap-1.5 text-white/48 active:text-white/78"
          whileTap={{ scale: 0.94 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('instructions'); }}
          onClick={() => setScreen('instructions')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          <span className="text-[20px]">✦</span>
          <span className="text-[10px] tracking-[2.5px] uppercase font-medium">
            Guide
          </span>
        </motion.button>

        <motion.button
          className="flex min-w-[72px] flex-col items-center gap-1.5 text-white/48 active:text-white/78"
          whileTap={{ scale: 0.94 }}
          onTouchStart={(e) => { e.preventDefault(); setScreen('settings'); }}
          onClick={() => setScreen('settings')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.36, duration: 0.4 }}
        >
          <span className="text-[20px]">⚙</span>
          <span className="text-[10px] tracking-[2.5px] uppercase font-medium">
            Settings
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
