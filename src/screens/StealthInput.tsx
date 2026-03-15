import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { useStealthInput } from '../hooks/useStealthInput';
import PhaseIndicator from '../components/PhaseIndicator';
import { ntfySend } from '../services/ntfy';
import { acquireWakeLock, releaseWakeLock, setupWakeLockReacquire } from '../services/wakeLock';
import { MONTH_NAMES } from '../utils/constants';
import type { DominantDatePart, EngineResult, ResolvedDate } from '../utils/types';

type OkResult = Extract<EngineResult, { kind: 'ok' }>;
type AmbiguousResult = Extract<EngineResult, { kind: 'ambiguous' }>;

function textSymbol(symbol: string): string {
  return `${symbol}\uFE0E`;
}

function resolveAmbiguousFromChoice(result: AmbiguousResult, dominantPart: DominantDatePart) {
  const { primary, alternate } = result;
  const primaryMatches = dominantPart === 'DAY'
    ? primary.day > primary.month
    : primary.month > primary.day;

  return primaryMatches ? primary : alternate;
}

export default function StealthInput() {
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useStore();
  const phase = useStore((s) => s.stealth.phase);
  const dominantPart = useStore((s) => s.stealth.dominantPart);
  const anchorValue = useStore((s) => s.stealth.anchorValue);
  const differenceValue = useStore((s) => s.stealth.differenceValue);
  const setScreen = useStore((s) => s.setScreen);

  const settings = useStore((s) => s.settings);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [startupOverlayVisible, setStartupOverlayVisible] = useState(settings.displayMode === 'fade-out');

  // Wake lock — keep screen on while in performance mode
  useEffect(() => {
    acquireWakeLock();
    // Always re-acquire on visibility change — this component only mounts
    // during active performance mode (screen === 'stealth')
    const isActive = () => true;
    const cleanup = setupWakeLockReacquire(isActive);
    return () => {
      releaseWakeLock();
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (settings.displayMode !== 'fade-out') {
      setStartupOverlayVisible(false);
      return;
    }

    setStartupOverlayVisible(true);
    const timer = window.setTimeout(() => setStartupOverlayVisible(false), 1700);
    return () => window.clearTimeout(timer);
  }, [settings.displayMode]);

  const displayValue = phase === 'ANCHOR' || phase === 'DIFFERENCE'
    ? (phase === 'ANCHOR' ? anchorValue : differenceValue)
    : null;

  const comparisonPrompt = dominantPart === null
    ? 'Which number is bigger?'
    : dominantPart === 'DAY'
      ? 'Day selected'
      : 'Month selected';

  const phaseLabel = phase === 'ANCHOR' ? 'ANCHOR'
    : phase === 'DIFFERENCE' ? 'DIFFERENCE'
    : phase === 'COMPARISON' ? 'COMPARE'
    : '';

  // Flash number briefly on tap — called via onTap from the hook
  const triggerFlash = useCallback((isTopZone: boolean) => {
    if (phase !== 'ANCHOR' && phase !== 'DIFFERENCE') return;
    const target = isTopZone ? 0.15 : 0.12;
    setFlashOpacity(target);
    window.setTimeout(() => setFlashOpacity(0), 260);
  }, [phase]);

  const handleExit = useCallback(() => {
    store.resetStealth();
    setScreen('home');
  }, [store, setScreen]);

  const handleAnchorTooLow = useCallback(() => {
    setWarningMessage('Anchor too low\nAbort gracefully — try another spectator');
    setShowWarning(true);
  }, []);

  const handleError = useCallback((reason: string) => {
    const messages: Record<string, string> = {
      odd_difference: 'Input error — odd difference\nCheck your numbers',
      d_exceeds_a: 'D cannot exceed A\nCheck your numbers',
      invalid_day: 'Invalid date result\nCheck your numbers',
      invalid_month: 'Invalid month result\nCheck your numbers',
    };
    setWarningMessage(messages[reason] ?? 'Input error');
    setShowWarning(true);
  }, []);

  const handleResult = useCallback((result: OkResult) => {
    if (settings.ntfyEnabled) {
      ntfySend(settings.ntfyTopic, result.primary, null);
    }
    setScreen('result');
  }, [settings.ntfyEnabled, settings.ntfyTopic, setScreen]);

  const handleAmbiguous = useCallback((result: AmbiguousResult) => {
    const chosen = resolveAmbiguousFromChoice(result, dominantPart ?? 'DAY');
    store.resolveAmbiguous(chosen);
    if (settings.ntfyEnabled) {
      ntfySend(settings.ntfyTopic, chosen, null);
    }
    setScreen('result');
  }, [dominantPart, settings.ntfyEnabled, settings.ntfyTopic, setScreen, store]);

  useStealthInput(containerRef as React.RefObject<HTMLElement | null>, {
    onComparisonChoice: () => {
      setFlashOpacity(0);
    },
    onAnchorTooLow: handleAnchorTooLow,
    onError: handleError,
    onResult: handleResult,
    onAmbiguous: handleAmbiguous,
    onExit: handleExit,
    onTap: triggerFlash,
  });

  function dismissWarning() {
    setShowWarning(false);
    store.resetStealth();
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black"
      style={{ touchAction: 'none' }}
    >
      {phase === 'COMPARISON' && (
        <motion.div
          className="absolute inset-0 flex flex-col select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute inset-x-0 top-safe-header px-8 text-center">
            <p className="text-[10px] uppercase tracking-[4px] text-white/22">Final Date Logic</p>
            <p className="mt-4 text-[22px] leading-[1.5] text-white/74">{comparisonPrompt}</p>
            <p className="mt-3 text-[12px] uppercase tracking-[3px] text-white/24">
              Top for day, bottom for month
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center border-b border-white/[7%]">
            <ComparisonChoiceLabel
              title="DAY is bigger"
              subtitle="Tap the top half"
              accent={dominantPart === 'DAY'}
            />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <ComparisonChoiceLabel
              title="MONTH is bigger"
              subtitle="Tap the bottom half"
              accent={dominantPart === 'MONTH'}
            />
          </div>
        </motion.div>
      )}

      {/* Subtle number display */}
      {displayValue !== null && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
          animate={{ opacity: flashOpacity }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="text-white tabular-nums"
            style={{ fontSize: 80, fontWeight: 100, lineHeight: 1 }}
          >
            {displayValue}
          </div>
          <div
            className="text-white mt-4 tracking-[6px] uppercase"
            style={{ fontSize: 11, fontWeight: 300, opacity: 0.06 }}
          >
            {phaseLabel}
          </div>
        </motion.div>
      )}

      {startupOverlayVisible && settings.displayMode === 'fade-out' && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black text-center pointer-events-none select-none"
          initial={{ opacity: 0.82 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] uppercase tracking-[6px] text-white/40">Performance Mode</p>
          <p className="mt-5 max-w-[240px] text-[16px] leading-[1.8] text-white/72">
            The screen will fade to black while input stays active.
          </p>
        </motion.div>
      )}

      {/* Phase indicator dots */}
      <div className="absolute bottom-safe left-0 right-0 flex justify-center">
        <PhaseIndicator phase={phase} />
      </div>

      {/* Warning overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onTouchEnd={(e) => { e.preventDefault(); dismissWarning(); }}
            onClick={dismissWarning}
          >
            <div className="mx-8 w-full max-w-[320px] rounded-[30px] border border-white/[8%] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-7 py-8 text-center">
              <p className="mb-4 text-[10px] uppercase tracking-[4px] text-white/22">
                Performance interrupted
              </p>
              {warningMessage.split('\n').map((line, i) => (
                <p
                  key={i}
                  className={`px-2 text-center ${i === 0 ? 'text-[20px] text-white/76' : 'mt-2 text-[13px] leading-[1.75] text-white/38'}`}
                >
                  {line}
                </p>
              ))}
              <div className="mx-auto mt-6 h-px w-12 bg-white/[8%]" />
              <p className="mt-6 text-[10px] uppercase tracking-[4px] text-white/18">Tap to dismiss</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComparisonChoiceLabel({
  title,
  subtitle,
  accent,
}: {
  title: string;
  subtitle: string;
  accent: boolean;
}) {
  return (
    <div className={`rounded-[30px] border px-8 py-7 text-center transition-colors ${accent ? 'border-white/18 bg-white/[0.04]' : 'border-white/[7%] bg-white/[0.015]'}`}>
      <p className="text-[13px] uppercase tracking-[4px] text-white/32">{subtitle}</p>
      <p className="mt-3 text-[28px] font-light tracking-[0.08em] text-white/82">{title}</p>
    </div>
  );
}

export function ResolvedDateLabel({ date }: { date: ResolvedDate }) {
  return (
    <div className="text-center opacity-55">
      <div className="text-white text-[28px] leading-none mb-2">{textSymbol(date.sign.symbol)}</div>
      <div className="text-white text-[32px] font-thin tracking-wide">
        {MONTH_NAMES[date.month - 1]} {date.day}
      </div>
      <div className="font-display-upright text-white/46 uppercase tracking-[4px] text-[14px] mt-2">
        {date.sign.name}
      </div>
    </div>
  );
}
