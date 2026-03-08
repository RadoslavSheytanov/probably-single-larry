import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../state/store';
import { haptics } from '../services/haptics';
import { compute } from '../engine/singularis';
import { LONG_PRESS_MS, DOUBLE_TAP_MS } from '../utils/constants';
import type { Phase } from '../utils/types';

interface Options {
  onAnchorTooLow?: () => void;
  onError?: (reason: string) => void;
  onResult?: () => void;
  onAmbiguous?: () => void;
  onExit?: () => void;
}

export function useStealthInput(containerRef: React.RefObject<HTMLElement | null>, opts: Options = {}) {
  const store = useStore();
  const phase = useStore((s) => s.stealth.phase);
  const anchorValue = useStore((s) => s.stealth.anchorValue);
  const differenceValue = useStore((s) => s.stealth.differenceValue);

  // Refs for gesture tracking (avoids stale closures in event handlers)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef<number>(0);
  const lastTapCount = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const swipeStartTime = useRef<number>(0);
  const didLongPress = useRef(false);
  const fingerCount = useRef(0);

  const phaseRef = useRef<Phase>(phase);
  const anchorRef = useRef(anchorValue);
  const differenceRef = useRef(differenceValue);

  // Keep refs in sync with store
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { anchorRef.current = anchorValue; }, [anchorValue]);
  useEffect(() => { differenceRef.current = differenceValue; }, [differenceValue]);

  const handleTap = useCallback((isTopZone: boolean) => {
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;

    const amount = isTopZone ? 10 : 1;

    if (currentPhase === 'ANCHOR') {
      store.incrementAnchor(amount);
    } else {
      store.incrementDifference(amount);
    }

    if (isTopZone) {
      haptics.tapTen();
    } else {
      haptics.tapOne();
    }
  }, [store]);

  const handleConfirm = useCallback(() => {
    const currentPhase = phaseRef.current;

    if (currentPhase === 'ANCHOR') {
      const a = anchorRef.current;
      if (a < 5) {
        haptics.error();
        opts.onAnchorTooLow?.();
        return;
      }
      haptics.confirm();
      store.confirmAnchor();
      return;
    }

    if (currentPhase === 'DIFFERENCE') {
      const a = anchorRef.current;
      const d = differenceRef.current;
      const result = compute(a, d);

      if (result.kind === 'error') {
        haptics.error();
        opts.onError?.(result.reason);
        return;
      }

      store.confirmDifference(result);

      if (result.kind === 'ambiguous') {
        haptics.error(); // warning pattern — two options
        opts.onAmbiguous?.();
      } else {
        haptics.result();
        opts.onResult?.();
      }
    }
  }, [store, opts]);

  const handleUndo = useCallback(() => {
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;
    haptics.undo();
    store.undoLast();
  }, [store]);

  const handleReset = useCallback(() => {
    const currentPhase = phaseRef.current;
    if (currentPhase !== 'ANCHOR' && currentPhase !== 'DIFFERENCE') return;
    haptics.error();
    store.resetCurrentPhase();
  }, [store]);

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

      // Double-tap detection
      const now = Date.now();
      const gap = now - lastTapTime.current;
      if (gap < DOUBLE_TAP_MS) {
        lastTapCount.current++;
      } else {
        lastTapCount.current = 1;
      }
      lastTapTime.current = now;

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

      // Swipe down to exit (> 80px downward, fast)
      if (deltaY > 80 && Math.abs(deltaX) < 60 && elapsed < 500) {
        opts.onExit?.();
        return;
      }

      if (didLongPress.current) return;

      // Three-finger tap = reset
      if (fingerCount.current >= 3) {
        handleReset();
        return;
      }

      // Double-tap = undo
      if (lastTapCount.current >= 2) {
        lastTapCount.current = 0;
        handleUndo();
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
  }, [containerRef, handleTap, handleConfirm, handleUndo, handleReset, opts]);

  // Keyboard shortcuts for desktop testing
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const currentPhase = phaseRef.current;
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
          opts.onExit?.();
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTap, handleConfirm, handleUndo, handleReset, opts]);
}
