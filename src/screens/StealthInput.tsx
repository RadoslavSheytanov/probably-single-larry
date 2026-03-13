import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../state/store';
import { useStealthInput } from '../hooks/useStealthInput';
import PhaseIndicator from '../components/PhaseIndicator';
import { ntfySend } from '../services/ntfy';
import { acquireWakeLock, releaseWakeLock, setupWakeLockReacquire } from '../services/wakeLock';
import { MONTH_NAMES } from '../utils/constants';

export default function StealthInput() {
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Flash number briefly on tap
  const triggerFlash = useCallback((isTopZone: boolean) => {
    const target = isTopZone ? 0.15 : 0.12;
    setFlashOpacity(target);
    setTimeout(() => setFlashOpacity(0.08), isTopZone ? 200 : 150);
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
    // Fire ntfy with confirmed single date
    const result = store.stealth.engineResult;
    if (result?.kind === 'ok') {
      ntfySend(settings.ntfyTopic, result.primary, null);
    }
    setScreen('result');
  }, [store, settings.ntfyTopic, setScreen]);

  const handleAmbiguous = useCallback(() => {
    // Stay in RESOLVING phase — ntfy fires only after performer confirms the date
  }, []);

  // Wrap handleTap to also trigger flash — we intercept via a custom wrapper
  // The hook handles the actual logic; we patch flash via a proxy ref
  const flashRef = useRef(triggerFlash);
  flashRef.current = triggerFlash;

  const stealthOpts = useMemo(() => ({
    onAnchorTooLow: handleAnchorTooLow,
    onError: handleError,
    onResult: handleResult,
    onAmbiguous: handleAmbiguous,
    onExit: handleExit,
  }), [handleAnchorTooLow, handleError, handleResult, handleAmbiguous, handleExit]);

  useStealthInput(containerRef as React.RefObject<HTMLElement | null>, stealthOpts);

  // Resolve ambiguous via top/bottom tap when in RESOLVING phase
  function handleResolveTap(e: React.TouchEvent | React.MouseEvent) {
    if (phase !== 'RESOLVING') return;
    if (engineResult?.kind !== 'ambiguous') return;

    const clientY = 'touches' in e
      ? (e as React.TouchEvent).changedTouches?.[0]?.clientY ?? 0
      : (e as React.MouseEvent).clientY;

    const isTop = clientY < window.innerHeight * 0.5;

    // Sort: primary = earlier in calendar year, alternate = later
    const { primary, alternate } = engineResult;
    const primaryOrdinal = primary.month * 31 + primary.day;
    const alternateOrdinal = alternate.month * 31 + alternate.day;

    const earlier = primaryOrdinal <= alternateOrdinal ? primary : alternate;
    const later = primaryOrdinal <= alternateOrdinal ? alternate : primary;

    const chosen = isTop ? earlier : later;
    store.resolveAmbiguous(chosen);
    // Fire second ntfy with the confirmed single date
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
        const pOrd = primary.month * 31 + primary.day;
        const aOrd = alternate.month * 31 + alternate.day;
        const earlier = pOrd <= aOrd ? primary : alternate;
        const later   = pOrd <= aOrd ? alternate : primary;
        return (
          <motion.div
            className="absolute inset-0 flex flex-col pointer-events-none select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Top half — earlier date (tap this half to select) */}
            <div className="flex-1 flex items-center justify-center">
              <ResolvedDateLabel date={earlier} />
            </div>

            {/* Hairline divider */}
            <div className="w-full" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

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
        className="absolute top-safe right-6 text-white/15 text-xs tracking-widest uppercase"
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
            <div className="text-4xl mb-6" style={{ opacity: 0.4 }}>⚠</div>
            {warningMessage.split('\n').map((line, i) => (
              <p
                key={i}
                className="text-white text-center px-12"
                style={{
                  fontSize: i === 0 ? 18 : 13,
                  fontWeight: i === 0 ? 300 : 200,
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
    <div className="text-center" style={{ opacity: 0.55 }}>
      <div className="text-white" style={{ fontSize: 28, lineHeight: 1, marginBottom: 8 }}>{date.sign.symbol}</div>
      <div className="text-white" style={{ fontSize: 32, fontWeight: 100, letterSpacing: 1 }}>
        {MONTH_NAMES[date.month - 1]} {date.day}
      </div>
      <div className="text-white/40 uppercase tracking-widest" style={{ fontSize: 11, fontWeight: 300, marginTop: 6 }}>
        {date.sign.name}
      </div>
    </div>
  );
}
