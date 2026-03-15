import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { haptics } from '../services/haptics';
import { compute } from '../engine/singularis';
import { LONG_PRESS_MS } from '../utils/constants';
import type { DominantDatePart, EngineResult, Phase } from '../utils/types';

type OkResult = Extract<EngineResult, { kind: 'ok' }>;
type AmbiguousResult = Extract<EngineResult, { kind: 'ambiguous' }>;

interface Options {
  onComparisonChoice?: (part: DominantDatePart) => void;
  onAnchorTooLow?: () => void;
  onError?: (reason: string) => void;
  onResult?: (result: OkResult) => void;
  onAmbiguous?: (result: AmbiguousResult) => void;
  onExit?: () => void;
  onGoBack?: () => void;
  /** Called on every single tap — use for flash/visual feedback */
  onTap?: (isTopZone: boolean) => void;
}

export function useStealthInput(containerRef: React.RefObject<HTMLElement | null>, opts: Options = {}) {
  const store = useStore();
  const phase = useStore((s) => s.stealth.phase);
  const anchorValue = useStore((s) => s.stealth.anchorValue);
  const differenceValue = useStore((s) => s.stealth.differenceValue);
  const hapticEnabled = useStore((s) => s.settings.hapticFeedback);

  // Refs for gesture tracking (avoids stale closures in native event handlers)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const swipeStartTime = useRef<number>(0);
  const didLongPress = useRef(false);
  const fingerCount = useRef(0);

  const phaseRef = useRef<Phase>(phase);
  const anchorRef = useRef(anchorValue);
  const differenceRef = useRef(differenceValue);
  const hapticRef = useRef(hapticEnabled);

  // Keep refs in sync with store values
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { anchorRef.current = anchorValue; }, [anchorValue]);
  useEffect(() => { differenceRef.current = differenceValue; }, [differenceValue]);
  useEffect(() => { hapticRef.current = hapticEnabled; }, [hapticEnabled]);

  // Stable refs for opts callbacks — prevents opts from being a useEffect dependency
  // (which would cause touch listeners to detach/reattach on every render)
  const onComparisonChoiceRef = useRef(opts.onComparisonChoice);
  const onAnchorTooLowRef = useRef(opts.onAnchorTooLow);
  const onErrorRef = useRef(opts.onError);
  const onResultRef = useRef(opts.onResult);
  const onAmbiguousRef = useRef(opts.onAmbiguous);
  const onExitRef = useRef(opts.onExit);
  const onGoBackRef = useRef(opts.onGoBack);
  const onTapRef = useRef(opts.onTap);

  // Update refs every render so callbacks are always current
  onComparisonChoiceRef.current = opts.onComparisonChoice;
  onAnchorTooLowRef.current = opts.onAnchorTooLow;
  onErrorRef.current = opts.onError;
  onResultRef.current = opts.onResult;
  onAmbiguousRef.current = opts.onAmbiguous;
  onExitRef.current = opts.onExit;
  onGoBackRef.current = opts.onGoBack;
  onTapRef.current = opts.onTap;

  // Conditional haptic helper — respects the hapticFeedback setting
  const h = useCallback((fn: () => void) => {
    if (hapticRef.current) fn();
  }, []);

  const handleTap = useCallback((isTopZone: boolean) => {
    const currentPhase = phaseRef.current;
    if (currentPhase === 'COMPARISON') {
      const part: DominantDatePart = isTopZone ? 'DAY' : 'MONTH';
      store.chooseDominantPart(part);
      h(() => haptics.comparison());
      onComparisonChoiceRef.current?.(part);
      return;
    }

    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;

    const amount = isTopZone ? 10 : 1;
    if (currentPhase === 'ANCHOR') {
      store.incrementAnchor(amount);
    } else {
      store.incrementDifference(amount);
    }

    h(() => isTopZone ? haptics.tapTen() : haptics.tapOne());
    onTapRef.current?.(isTopZone);
  }, [store, h]);

  const handleConfirm = useCallback(() => {
    const currentPhase = phaseRef.current;

    if (currentPhase === 'ANCHOR') {
      const a = anchorRef.current;
      if (a < 5) {
        h(() => haptics.error());
        onAnchorTooLowRef.current?.();
        return;
      }
      h(() => haptics.confirm());
      store.confirmAnchor();
      return;
    }

    if (currentPhase === 'DIFFERENCE') {
      const a = anchorRef.current;
      const d = differenceRef.current;
      const result = compute(a, d);

      if (result.kind === 'error') {
        h(() => haptics.error());
        onErrorRef.current?.(result.reason);
        return;
      }

      store.confirmDifference(result);

      if (result.kind === 'ambiguous') {
        h(() => haptics.ambiguous());
        onAmbiguousRef.current?.(result);
      } else {
        h(() => haptics.result());
        onResultRef.current?.(result);
      }
    }
  }, [store, h]);

  const handleUndo = useCallback(() => {
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;
    h(() => haptics.undo());
    store.undoLast();
  }, [store, h]);

  const handleReset = useCallback(() => {
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;
    h(() => haptics.error());
    store.resetCurrentPhase();
  }, [store, h]);

  const handleGoBack = useCallback(() => {
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;
    h(() => haptics.back());
    store.goBackPhase();
    onGoBackRef.current?.();
  }, [store, h]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      fingerCount.current = e.touches.length;
      didLongPress.current = false;

      const touch = e.touches[0];
      touchStartY.current = touch.clientY;
      touchStartX.current = touch.clientX;
      swipeStartTime.current = Date.now();

      // Three-finger tap = reset
      if (e.touches.length >= 3) {
        clearLongPressTimer();
        return;
      }

      // Long press timer
      longPressTimer.current = setTimeout(() => {
        didLongPress.current = true;
        handleConfirm();
      }, LONG_PRESS_MS);
    }

    function onTouchEnd(e: TouchEvent) {
      e.preventDefault();
      clearLongPressTimer();

      const touch = e.changedTouches[0];
      const deltaY = touch.clientY - touchStartY.current;
      const deltaX = touch.clientX - touchStartX.current;
      const elapsed = Date.now() - swipeStartTime.current;

      const currentPhase = phaseRef.current;

      // Two-finger swipe down exits performance mode.
      if (fingerCount.current === 2 && deltaY > 80 && Math.abs(deltaX) < 80 && elapsed < 500) {
        hapticRef.current && haptics.exit();
        onExitRef.current?.();
        return;
      }

      // Swipe left resets numeric input while preserving the day/month choice.
      if (-deltaX > 80 && Math.abs(deltaY) < 60 && elapsed < 500) {
        if (currentPhase === 'ANCHOR' || currentPhase === 'DIFFERENCE') {
          handleGoBack();
        }
        return;
      }

      if (didLongPress.current) return;

      // Three-finger tap = reset
      if (fingerCount.current >= 3) {
        if (currentPhase === 'ANCHOR' || currentPhase === 'DIFFERENCE') {
          handleReset();
        }
        return;
      }

      // Single tap — determine zone
      const screenHeight = window.innerHeight;
      const isTopZone = touch.clientY < screenHeight * 0.5;
      handleTap(isTopZone);
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      // Cancel long press if finger moves significantly
      const touch = e.touches[0];
      const dy = Math.abs(touch.clientY - touchStartY.current);
      const dx = Math.abs(touch.clientX - touchStartX.current);
      if (dy > 15 || dx > 15) {
        clearLongPressTimer();
      }
    }

    function clearLongPressTimer() {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchmove', onTouchMove);
      clearLongPressTimer();
    };
    // opts callbacks are now refs — removed from deps to prevent listener re-attach on every render
  }, [containerRef, handleTap, handleConfirm, handleUndo, handleReset, handleGoBack]);

  // Keyboard shortcuts for desktop testing
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const currentPhase = phaseRef.current;
      if (currentPhase === 'COMPARISON') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            handleTap(true);
            break;
          case 'ArrowDown':
            e.preventDefault();
            handleTap(false);
            break;
        }
        return;
      }

      if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleTap(e.shiftKey); // Shift+Up = top zone (+10), Up = bottom zone (+1)
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleConfirm();
          break;
        case 'Backspace':
          e.preventDefault();
          handleUndo();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case 'Escape':
          onExitRef.current?.();
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTap, handleConfirm, handleUndo, handleReset]);
}
