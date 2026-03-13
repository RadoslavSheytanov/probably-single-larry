import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { getStoredEmail } from '../services/license';
import { haptics } from '../services/haptics';
import ScreenHeader from '../components/ScreenHeader';

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const touchHandled = useRef(false);

  function handleTouchStart(e: React.TouchEvent<HTMLButtonElement>) {
    e.preventDefault();
    touchHandled.current = true;
    onToggle();
  }

  function handleClick() {
    if (touchHandled.current) {
      touchHandled.current = false;
      return;
    }
    onToggle();
  }

  return (
    <button
      className={`relative flex-shrink-0 rounded-full transition-colors ${on ? 'bg-white/70' : 'bg-white/[10%]'}`}
      style={{ width: 44, height: 26 }}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
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
    <div className="flex items-center justify-between py-4 border-b border-white/[5%] last:border-b-0">
      <span className="text-white/60 text-sm font-light">{label}</span>
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
      <ScreenHeader
        title="Settings"
        rightElement={
          <button
            className="text-white/34 text-[11px] tracking-[3px] uppercase"
            onTouchStart={(e) => { e.preventDefault(); handleClose(); }}
            onClick={handleClose}
          >
            Close
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">
        <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5 py-5 mb-4">
          <p className="text-white/38 text-[10px] tracking-[4px] uppercase mb-3">Notifications</p>
          <Row label="Push Notifications">
            <div className="flex items-center justify-center" style={{ minHeight: 44, minWidth: 44 }}>
              <Toggle
                on={settings.ntfyEnabled}
                label="Toggle push notifications"
                onToggle={() => updateSettings({ ntfyEnabled: !settings.ntfyEnabled })}
              />
            </div>
          </Row>
          <p className="text-white/62 text-sm font-light mb-3">ntfy Topic</p>
          <input
            className="w-full bg-white/[3%] border border-white/[8%] rounded-2xl px-4 py-3.5 text-white/78 text-sm font-light placeholder-white/[14%] outline-none focus:border-white/18"
            placeholder="your-secret-topic"
            value={ntfyInput}
            onChange={(e) => setNtfyInput(e.target.value)}
            onBlur={handleNtfyBlur}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="text-white/[18%] text-xs mt-3 leading-[1.7]">
            {settings.ntfyEnabled
              ? 'Used for silent delivery through ntfy.sh.'
              : 'Disabled — results stay on your screen only.'}
          </p>
        </div>

        <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5 py-2 mb-4">
          <p className="pt-4 text-white/38 text-[10px] tracking-[4px] uppercase">Behaviour</p>
          <Row label="Haptic Feedback">
            <div className="flex items-center justify-center" style={{ minHeight: 44, minWidth: 44 }}>
              <Toggle
                on={settings.hapticFeedback}
                label="Toggle haptic feedback"
                onToggle={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
              />
            </div>
          </Row>
        </div>

        <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5 py-5 mb-4">
          <p className="text-white/38 text-[10px] tracking-[4px] uppercase mb-3">History</p>
          <AnimatePresence mode="wait">
            {confirmClear ? (
              <motion.button
                key="confirm"
                className="text-sm font-light tracking-wide text-err"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onTouchStart={(e) => { e.preventDefault(); handleClearHistory(); }}
                onClick={handleClearHistory}
              >
                Tap again to confirm
              </motion.button>
            ) : (
              <motion.button
                key="clear"
                className="text-white/60 text-sm font-light"
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

        <div className="rounded-[24px] border border-white/[8%] bg-black/20 px-5 py-5">
          <p className="text-white/38 text-[10px] tracking-[4px] uppercase mb-3">License</p>
          {storedEmail ? (
            <>
              <p className="text-white/42 text-xs mb-3">{storedEmail}</p>
              <button
                className="text-xs tracking-wide font-light text-err"
                onTouchStart={(e) => { e.preventDefault(); haptics.error(); onDeactivate?.(); }}
                onClick={() => { haptics.error(); onDeactivate?.(); }}
              >
                Deactivate
              </button>
            </>
          ) : (
            <p className="text-white/[18%] text-xs">Not activated</p>
          )}
        </div>

        <div className="py-5">
          <p className="text-white/[12%] text-[10px] tracking-[4px] uppercase">
            Singularis v2.0.0 · PWA
          </p>
        </div>
      </div>
    </motion.div>
  );
}
