import { motion } from 'framer-motion';
import { useStore } from '../state/store';
import { MONTH_NAMES } from '../utils/constants';
import BottomNav from '../components/BottomNav';

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
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_62%)] pointer-events-none" />
        <div className="absolute inset-x-0 top-24 h-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_72%)] pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center pt-safe-header px-6 pb-0">
          <p className="font-ui-medium text-[11px] tracking-[8px] uppercase text-white/58">
            Singularis
          </p>
          <div className="mt-5 w-10 border-t border-white/[10%]" />
        </div>

        {/* Hero */}
        <div className="px-6 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: WORD_EASE }}
          >
            <p
              className="font-display text-[29px] leading-[1.32] tracking-[0.005em] text-white/82 text-center"
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
              className="mt-6 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.4 }}
            >
              <div className="h-px w-5 bg-white/[12%]" />
              <p className="font-ui-medium text-[9px] tracking-[3px] uppercase text-white/35">
                Arthur Conan Doyle
              </p>
              <div className="h-px w-5 bg-white/[12%]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className={`px-6 flex flex-col gap-4 ${hasSupplementaryPanel ? 'pt-12' : 'pt-[104px]'}`}>
          {requiresNtfySetup ? (
            <motion.button
              className="w-full rounded-[30px] border border-amber-500/14 bg-[linear-gradient(180deg,rgba(255,159,10,0.07),rgba(255,159,10,0.02))] px-6 py-5 text-left active:border-amber-500/24 active:bg-amber-500/[0.09]"
              whileTap={{ scale: 0.985 }}
              onTouchStart={(e) => { e.preventDefault(); handlePrimaryAction(); }}
              onClick={handlePrimaryAction}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4, ease: WORD_EASE }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-[252px]">
                  <p className="font-ui-medium text-[10px] tracking-[3.5px] uppercase text-amber-500/60">
                    Notifications
                  </p>
                  <p className="font-ui-light mt-3 text-[15px] leading-[1.7] text-amber-50/84">
                    To set up push notifications, open Settings.
                  </p>
                </div>
                <span className="mt-5 text-[18px] text-amber-500/42" aria-hidden="true">
                  →
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.button
              className="w-full rounded-[32px] border border-white/[10%] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-6 py-6 text-left active:bg-white/[10%]"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.985 }}
              onTouchStart={(e) => { e.preventDefault(); handlePrimaryAction(); }}
              onClick={handlePrimaryAction}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4, ease: WORD_EASE }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-ui-medium text-[11px] uppercase tracking-[4px] text-white/28">
                    Begin
                  </p>
                  <p className="font-ui-light mt-2 text-[17px] tracking-[0.02em] text-white/82">
                    Performance
                  </p>
                </div>
                <span className="text-[18px] text-white/38" aria-hidden="true">
                  →
                </span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Guidance */}
        <div className={`px-6 pb-6 flex flex-col gap-3 ${hasSupplementaryPanel ? 'pt-6' : 'pt-0'}`}>
          {lastReading && (
            <motion.div
              className="rounded-[28px] border border-white/[7%] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-5 py-4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4, ease: WORD_EASE }}
            >
              <p className="font-ui-medium mb-2 text-[10px] tracking-[4px] uppercase text-white/34">
                Last reading
              </p>
              <p className="font-ui-light text-[15px] leading-[1.5] text-white/80">
                {lastReadingLabel()}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  );
}
