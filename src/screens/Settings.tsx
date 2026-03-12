import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { getStoredEmail } from '../services/license';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      className="relative flex-shrink-0"
      style={{ width: 44, height: 26, borderRadius: 13, background: on ? 'rgba(255,159,10,0.7)' : 'rgba(255,255,255,0.08)' }}
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
    <div className="flex items-center justify-between py-4 border-b border-white/[0.04]">
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

  const storedEmail = getStoredEmail();

  function handleNtfyBlur() {
    updateSettings({ ntfyTopic: ntfyInput.trim() });
  }

  function handleClearHistory() {
    if (confirmClear) {
      clearHistory();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
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
      <div className="flex items-center justify-between px-6 pt-safe-header pb-4">
        <h2
          className="uppercase tracking-[6px] text-white/70 font-light"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22 }}
        >
          Settings
        </h2>
        <button
          className="text-white/25 text-xs tracking-[3px] uppercase"
          onTouchStart={(e) => { e.preventDefault(); handleClose(); }}
          onClick={handleClose}
        >
          Close
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">

        {/* ntfy Topic */}
        <div className="py-4 border-b border-white/[0.04]">
          <p className="text-white/50 text-sm font-light mb-2">ntfy Topic</p>
          <input
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white/60 text-sm font-light placeholder-white/15 outline-none focus:border-white/20"
            placeholder="your-secret-topic"
            value={ntfyInput}
            onChange={(e) => setNtfyInput(e.target.value)}
            onBlur={handleNtfyBlur}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="text-white/15 text-xs mt-2">Used for watch notifications via ntfy.sh</p>
        </div>

        <Row label="Haptic Feedback">
          <Toggle
            on={settings.hapticFeedback}
            onToggle={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
          />
        </Row>

        {/* Clear History */}
        <div className="py-4 border-b border-white/[0.04]">
          <AnimatePresence mode="wait">
            {confirmClear ? (
              <motion.button
                key="confirm"
                className="text-sm font-light tracking-wide"
                style={{ color: 'rgba(255,90,90,0.8)' }}
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
        <div className="py-4 border-b border-white/[0.04]">
          <p className="text-white/50 text-sm font-light mb-2">License</p>
          {storedEmail ? (
            <>
              <p className="text-white/25 text-xs mb-3">{storedEmail}</p>
              <button
                className="text-xs tracking-wide font-light"
                style={{ color: 'rgba(255,90,90,0.5)' }}
                onTouchStart={(e) => { e.preventDefault(); onDeactivate?.(); }}
                onClick={() => onDeactivate?.()}
              >
                Deactivate
              </button>
            </>
          ) : (
            <p className="text-white/15 text-xs">Not activated</p>
          )}
        </div>

        {/* Version */}
        <div className="py-4">
          <p className="text-white/15 text-xs tracking-widest uppercase">
            Singularis v2.0.0 · PWA
          </p>
        </div>
      </div>
    </motion.div>
  );
}
