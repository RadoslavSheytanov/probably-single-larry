import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { getStoredEmail } from '../services/license';
import { haptics } from '../services/haptics';
import ScreenHeader from '../components/ScreenHeader';

const REVIEW_MODE_ENABLED = import.meta.env.VITE_REVIEW_MODE === 'true';

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
      className={`relative flex-shrink-0 rounded-full border transition-colors ${on ? 'border-white/[12%] bg-white/70' : 'border-white/[8%] bg-white/[6%]'}`}
      style={{ width: 44, height: 26 }}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <motion.div
        className="absolute top-1 rounded-full bg-[#0b0b0d]"
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
      <span className="font-ui-light text-sm text-white/60">{label}</span>
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
            className="font-ui-medium text-white/34 text-[11px] tracking-[3px] uppercase"
            onTouchStart={(e) => { e.preventDefault(); handleClose(); }}
            onClick={handleClose}
          >
            Close
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-safe-nav">
        <div className="mb-4 rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-5">
          <p className="font-ui-medium mb-2 text-[10px] uppercase tracking-[4px] text-white/34">Notifications</p>
          <p className="font-ui-light mb-5 max-w-[260px] text-[14px] leading-[1.7] text-white/44">
            Silent delivery stays invisible when the setup feels calm and deliberate.
          </p>
          <Row label="Push Notifications">
            <div className="flex items-center justify-center" style={{ minHeight: 44, minWidth: 44 }}>
              <Toggle
                on={settings.ntfyEnabled}
                label="Toggle push notifications"
                onToggle={() => updateSettings({ ntfyEnabled: !settings.ntfyEnabled })}
              />
            </div>
          </Row>
          <p className="font-ui-light mb-3 mt-5 text-sm text-white/60">ntfy Topic</p>
          <input
            className="font-ui-light w-full rounded-[22px] border border-white/[7%] bg-black/20 px-4 py-4 text-sm text-white/82 placeholder-white/[16%] outline-none focus:border-white/16"
            placeholder="your-secret-topic"
            value={ntfyInput}
            onChange={(e) => setNtfyInput(e.target.value)}
            onBlur={handleNtfyBlur}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="font-ui-light mt-3 text-xs leading-[1.75] text-white/[18%]">
            {settings.ntfyEnabled
              ? 'Used for silent delivery through ntfy.sh.'
              : 'Disabled — results stay on your screen only.'}
          </p>
        </div>

        <div className="mb-4 rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-2">
          <p className="font-ui-medium pt-4 text-[10px] uppercase tracking-[4px] text-white/34">Behaviour</p>
          <Row label="Haptic Feedback (Android Only)">
            <div className="flex items-center justify-center" style={{ minHeight: 44, minWidth: 44 }}>
              <Toggle
                on={settings.hapticFeedback}
                label="Toggle haptic feedback"
                onToggle={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
              />
            </div>
          </Row>
        </div>

        <div className="mb-4 rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-5">
          <p className="font-ui-medium mb-3 text-[10px] uppercase tracking-[4px] text-white/34">History</p>
          <AnimatePresence mode="wait">
            {confirmClear ? (
              <motion.button
                key="confirm"
                className="font-ui-light text-sm tracking-wide text-err"
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
                className="font-ui-light text-sm text-white/60"
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

        <div className="rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-5 py-5">
          <p className="font-ui-medium mb-3 text-[10px] uppercase tracking-[4px] text-white/34">License</p>
          {REVIEW_MODE_ENABLED ? (
            <p className="font-ui-light text-xs text-white/42">Review build enabled</p>
          ) : null}
          {storedEmail ? (
            <>
              <p className="font-ui-light mb-3 text-xs text-white/42">{storedEmail}</p>
              <button
                className="font-ui-light text-xs tracking-wide text-err"
                onTouchStart={(e) => { e.preventDefault(); haptics.error(); onDeactivate?.(); }}
                onClick={() => { haptics.error(); onDeactivate?.(); }}
              >
                Deactivate
              </button>
            </>
          ) : REVIEW_MODE_ENABLED ? (
            <p className="font-ui-light mt-3 text-xs text-white/[18%]">
              License activation is bypassed for this deployment.
            </p>
          ) : (
            <p className="font-ui-light text-xs text-white/[18%]">Not activated</p>
          )}
        </div>

        <div className="py-5">
          <p className="font-ui-medium text-[10px] uppercase tracking-[4px] text-white/[12%]">
            Singularis v2.0.0 · PWA
          </p>
        </div>
      </div>
    </motion.div>
  );
}
