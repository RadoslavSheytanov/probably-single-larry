import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { getStoredEmail } from '../services/license';
import { haptics } from '../services/haptics';
import ScreenHeader from '../components/ScreenHeader';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className={`relative flex-shrink-0 rounded-full transition-colors ${on ? 'bg-amber-500/70' : 'bg-white/[8%]'}`}
      style={{ width: 44, height: 26 }}
      role="switch"
      aria-checked={on}
      aria-label="Toggle haptic feedback"
      onTouchStart={(e) => { e.preventDefault(); onToggle(); }}
      onClick={onToggle}
    >
      <motion.div
        className="absolute top-1 rounded-full bg-white"
        style={{ width: 18, height: 18 }}
        animate={{ left: on ? 23 : 5 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      />
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[4%]">
      <span className="text-white/50 text-sm font-light">{label}</span>
      {children}
    </div>
  );
}

interface Props {
  onDeactivate?: () => void;
}

export default function Settings({ onDeactivate }: Props) {
  const setScreen = useStore((s) => s.setScreen);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const clearHistory = useStore((s) => s.clearHistory);

  const [confirmClear, setConfirmClear] = useState(false);
  const [ntfyInput, setNtfyInput] = useState(settings.ntfyTopic);
  const clearHistoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearHistoryTimer.current !== null) {
        clearTimeout(clearHistoryTimer.current);
      }
    };
  }, []);

  const storedEmail = getStoredEmail();

  function handleNtfyBlur() {
    updateSettings({ ntfyTopic: ntfyInput.trim() });
  }

  function handleClearHistory() {
    if (clearHistoryTimer.current !== null) {
      clearTimeout(clearHistoryTimer.current);
      clearHistoryTimer.current = null;
    }
    if (confirmClear) {
      haptics.error();
      clearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      clearHistoryTimer.current = setTimeout(() => setConfirmClear(false), 2000);
    }
  }

  function handleClose() {
    updateSettings({ ntfyTopic: ntfyInput.trim() });
    setScreen('home');
  }

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-[#0a0a0a]"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Header */}
      <ScreenHeader
        title="Settings"
        rightElement={
          <button
            className="text-white/30 text-xs tracking-[3px] uppercase"
            onTouchStart={(e) => { e.preventDefault(); handleClose(); }}
            onClick={handleClose}
          >
            Close
          </button>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">

        {/* ntfy Topic */}
        <div className="py-4 border-b border-white/[4%]">
          <p className="text-white/50 text-sm font-light mb-2">ntfy Topic</p>
          <input
            className="w-full bg-white/[4%] border border-white/[8%] rounded-xl px-4 py-3 text-white/70 text-sm font-light placeholder-white/[12%] outline-none focus:border-white/20"
            placeholder="your-secret-topic"
            value={ntfyInput}
            onChange={(e) => setNtfyInput(e.target.value)}
            onBlur={handleNtfyBlur}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="text-white/[12%] text-xs mt-2">Used for watch notifications via ntfy.sh</p>
        </div>

        <Row label="Haptic Feedback">
          <div className="flex items-center justify-center" style={{ minHeight: 44, minWidth: 44 }}>
            <Toggle
              on={settings.hapticFeedback}
              onToggle={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
            />
          </div>
        </Row>

        {/* Clear History */}
        <div className="py-4 border-b border-white/[4%]">
          <AnimatePresence mode="wait">
            {confirmClear ? (
              <motion.button
                key="confirm"
                className="text-sm font-light tracking-wide"
                style={{ color: 'rgba(255,90,90,0.6)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onTouchStart={(e) => { e.preventDefault(); handleClearHistory(); }}
                onClick={handleClearHistory}
              >
                Tap again to confirm — this cannot be undone
              </motion.button>
            ) : (
              <motion.button
                key="clear"
                className="text-white/30 text-sm font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onTouchStart={(e) => { e.preventDefault(); handleClearHistory(); }}
                onClick={handleClearHistory}
              >
                Clear History
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* License */}
        <div className="py-4 border-b border-white/[4%]">
          <p className="text-white/50 text-sm font-light mb-2">License</p>
          {storedEmail ? (
            <>
              <p className="text-white/30 text-xs mb-3">{storedEmail}</p>
              <button
                className="text-xs tracking-wide font-light"
                style={{ color: 'rgba(255,90,90,0.6)' }}
                onTouchStart={(e) => { e.preventDefault(); haptics.error(); onDeactivate?.(); }}
                onClick={() => { haptics.error(); onDeactivate?.(); }}
              >
                Deactivate
              </button>
            </>
          ) : (
            <p className="text-white/[12%] text-xs">Not activated</p>
          )}
        </div>

        {/* Version */}
        <div className="py-4">
          <p className="text-white/[12%] text-xs tracking-widest uppercase">
            Singularis v2.0.0 · PWA
          </p>
        </div>
      </div>
    </motion.div>
  );
}
