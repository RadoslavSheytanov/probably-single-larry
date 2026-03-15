import React from 'react';
import { vi } from 'vitest';
import { useStore } from '../state/store';

// Mock framer-motion so animations don't interfere with tests
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      // Return a simple div/button/span forwarder for motion.div, motion.button, etc.
      const tag = String(prop);
      return ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
        // Remove framer-motion-specific props
        const {
          initial,
          animate,
          exit,
          transition,
          whileTap,
          variants,
          ...domProps
        } = props as Record<string, unknown>;
        void initial;
        void animate;
        void exit;
        void transition;
        void whileTap;
        void variants;
        return React.createElement(tag, domProps, children);
      };
    }
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  },
}));

// Mock navigator.vibrate
export function mockVibrate() {
  const vibrateMock = vi.fn();
  Object.defineProperty(navigator, 'vibrate', {
    value: vibrateMock,
    configurable: true,
    writable: true,
  });
  return vibrateMock;
}

// Mock fetch
export function mockFetch(response: object = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

// Helper: reset store to clean state
export function resetStore() {
  useStore.setState({
    screen: 'home',
    stealth: {
      phase: 'COMPARISON',
      dominantPart: null,
      anchorValue: 0,
      differenceValue: 0,
      lastAdded: 0,
      engineResult: null,
      resolvedDate: null,
    },
    history: [],
    settings: { ntfyTopic: '', ntfyEnabled: true, hapticFeedback: true, displayMode: 'fade-out', iosHaptics: true },
  });
}
