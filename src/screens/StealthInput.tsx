import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { useStealthInput } from '../hooks/useStealthInput';
import PhaseIndicator from '../components/PhaseIndicator';
import { ntfySend } from '../services/ntfy';
import { haptics } from '../services/haptics';
import { acquireWakeLock, releaseWakeLock, setupWakeLockReacquire } from '../services/wakeLock';
import { MONTH_NAMES, LONG_PRESS_MS } from '../utils/constants';

// Correct ordinal using cumulative days — avoids fragile month*31+day formula
const DAYS_BEFORE_MONTH = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] as const;
function dateOrd(month: number, day: number): number {
  return DAYS_BEFORE_MONTH[month] + day;
}

// Guard: ignore finger-lift from the long press that triggers RESOLVING.
// Must be slightly longer than LONG_PRESS_MS so the lift is always absorbed.
const RESOLVE_GUARD_MS = LONG_PRESS_MS + 200;

export default function StealthInput() {
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvingAt = useRef<number>(0);
  const hasResolvedRef = useRef<boolean>(false); // prevents double ntfy send
  const store = useStore();
  const phase = useStore((s) => s.stealth.phase);
  const anchorValue = useStore((s) => s.stealth.anchorValue);
  const differenceValue = useStore((s) => s.stealth.differenceValue);
  const engineResult = useStore((s) => s.stealth.engineResult);
  const setScreen = useStore((s) => s.setScreen);

  const settings = useStore((s) => s.settings);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [flashOpacity, setFlashOpacity] = useState(0.08);

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

  const displayValue = phase === 'ANCHOR' || phase === 'DIFFERENCE'
    ? (phase === 'ANCHOR' ? anchorValue : differenceValue)
    : null;

  const phaseLabel = phase === 'ANCHOR' ? 'ANCHOR'
    : phase === 'DIFFERENCE' ? 'DIFFERENCE'
    : phase === 'RESOLVING' ? 'RESOLVING'
    : '';

  // Flash number briefly on tap — called via onTap from the hook
  const triggerFlash = useCallback((isTopZone: boolean) => {
    const target = isTopZone ? 0.15 : 0.12;
    setFlashOpacity(target);
    setTimeout(() => setFlashOpacity(0.08), 200);
  }, []);

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

  const handleResult = useCallback(() => {
    const result = store.stealth.engineResult;
    if (result?.kind === 'ok') {
      ntfySend(settings.ntfyTopic, result.primary, null);
    }
    setScreen('result');
  }, [store, settings.ntfyTopic, setScreen]);

  const handleAmbiguous = useCallback(() => {
    // Stamp entry time so finger-lift from the long press is ignored
    resolvingAt.current = Date.now();
    // Reset double-send guard for this resolution session
    hasResolvedRef.current = false;
  }, []);

  useStealthInput(containerRef as React.RefObject<HTMLElement | null>, {
    onAnchorTooLow: handleAnchorTooLow,
    onError: handleError,
    onResult: handleResult,
    onAmbiguous: handleAmbiguous,
    onExit: handleExit,
    onTap: triggerFlash,
  });

  // Resolve ambiguous via top/bottom tap when in RESOLVING phase
  function handleResolveTap(e: React.TouchEvent | React.MouseEvent) {
    if (phase !== 'RESOLVING') return;
    if (engineResult?.kind !== 'ambiguous') return;
    if (Date.now() - resolvingAt.current < RESOLVE_GUARD_MS) return;
    if (hasResolvedRef.current) return; // prevent double-send on rapid taps

    const clientY = 'touches' in e
      ? (e as React.TouchEvent).changedTouches?.[0]?.clientY ?? 0
      : (e as React.MouseEvent).clientY;

    const isTop = clientY < window.innerHeight * 0.5;

    const { primary, alternate } = engineResult;
    const earlier = dateOrd(primary.month, primary.day) <= dateOrd(alternate.month, alternate.day)
      ? primary : alternate;
    const later = earlier === primary ? alternate : primary;

    const chosen = isTop ? earlier : later;
    hasResolvedRef.current = true;
    haptics.resolved();
    store.resolveAmbiguous(chosen);
    ntfySend(settings.ntfyTopic, chosen, null);
    setScreen('result');
  }

  function dismissWarning() {
    setShowWarning(false);
    store.resetStealth();
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black"
      style={{ touchAction: 'none' }}
      onTouchEnd={phase === 'RESOLVING' ? handleResolveTap : undefined}
      onClick={phase === 'RESOLVING' ? handleResolveTap : undefined}
    >
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

      {/* RESOLVING state — full-screen split, earlier on top, later on bottom */}
      {phase === 'RESOLVING' && engineResult?.kind === 'ambiguous' && (() => {
        const { primary, alternate } = engineResult;
        const earlier = dateOrd(primary.month, primary.day) <= dateOrd(alternate.month, alternate.day)
          ? primary : alternate;
        const later = earlier === primary ? alternate : primary;
        return (
          <motion.div
            className="absolute inset-0 flex flex-col pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Top half — earlier date */}
            <div className="flex-1 flex items-center justify-center">
              <ResolvedDateLabel date={earlier} />
            </div>

            {/* Hairline divider */}
            <div className="w-full h-px bg-white/[8%]" />

            {/* Bottom half — later date */}
            <div className="flex-1 flex items-center justify-center">
              <ResolvedDateLabel date={later} />
            </div>
          </motion.div>
        );
      })()}

      {/* Phase indicator dots */}
      <div className="absolute bottom-safe left-0 right-0 flex justify-center">
        <PhaseIndicator phase={phase} />
      </div>

      {/* Practice mode shortcut (top-right, very subtle) */}
      <button
        className="absolute top-safe right-6 text-white/15 text-xs tracking-widest uppercase min-h-[44px] min-w-[44px] flex items-center justify-center"
        style={{ touchAction: 'none' }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setScreen('practice');
        }}
        onClick={(e) => {
          e.stopPropagation();
          setScreen('practice');
        }}
      >
        ◎
      </button>

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
            <div className="text-4xl mb-6 opacity-40">⚠</div>
            {warningMessage.split('\n').map((line, i) => (
              <p
                key={i}
                className="text-white text-center px-12"
                style={{
                  fontSize: i === 0 ? 18 : 13,
                  fontWeight: i === 0 ? 300 : 300,
                  opacity: i === 0 ? 0.7 : 0.35,
                  letterSpacing: 2,
                  marginBottom: 6,
                }}
              >
                {line}
              </p>
            ))}
            <p className="text-white/20 text-xs tracking-widest uppercase mt-10">tap to dismiss</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResolvedDateLabel({ date }: { date: { day: number; month: number; sign: { name: string; symbol: string } } }) {
  return (
    <div className="text-center opacity-55">
      <div className="text-white text-[28px] leading-none mb-2">{date.sign.symbol}</div>
      <div className="text-white text-[32px] font-thin tracking-wide">
        {MONTH_NAMES[date.month - 1]} {date.day}
      </div>
      <div className="text-white/40 uppercase tracking-widest text-[11px] font-light mt-1.5">
        {date.sign.name}
      </div>
    </div>
  );
}
