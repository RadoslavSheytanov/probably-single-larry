import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Screen,
  Phase,
  EngineResult,
  ResolvedDate,
  Reading,
  AppSettings,
} from '../utils/types';

interface StealthState {
  phase: Phase;
  anchorValue: number;
  differenceValue: number;
  lastAdded: number;
  engineResult: EngineResult | null;
  resolvedDate: ResolvedDate | null;
}

interface AppState {
  // Navigation
  screen: Screen;
  setScreen: (screen: Screen) => void;

  // Stealth input state
  stealth: StealthState;
  incrementAnchor: (amount: number) => void;
  incrementDifference: (amount: number) => void;
  undoLast: () => void;
  resetCurrentPhase: () => void;
  confirmAnchor: () => void;
  confirmDifference: (result: EngineResult) => void;
  resolveAmbiguous: (date: ResolvedDate) => void;
  resetStealth: () => void;

  // History
  history: Reading[];
  addReading: (reading: Reading) => void;
  clearHistory: () => void;

  // Settings (persisted)
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  ntfyTopic: '',
  autoSaveCalendar: false,
  watchPeekPreview: true,
  hapticFeedback: true,
};

const DEFAULT_STEALTH: StealthState = {
  phase: 'ANCHOR',
  anchorValue: 0,
  differenceValue: 0,
  lastAdded: 0,
  engineResult: null,
  resolvedDate: null,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ── Navigation ──────────────────────────────────────────────────────
      screen: 'home',
      setScreen: (screen) => set({ screen }),

      // ── Stealth input ───────────────────────────────────────────────────
      stealth: { ...DEFAULT_STEALTH },

      incrementAnchor: (amount) =>
        set((s) => ({
          stealth: {
            ...s.stealth,
            anchorValue: s.stealth.anchorValue + amount,
            lastAdded: amount,
          },
        })),

      incrementDifference: (amount) =>
        set((s) => ({
          stealth: {
            ...s.stealth,
            differenceValue: s.stealth.differenceValue + amount,
            lastAdded: amount,
          },
        })),

      undoLast: () =>
        set((s) => {
          const { phase, anchorValue, differenceValue, lastAdded } = s.stealth;
          if (phase === 'ANCHOR') {
            return {
              stealth: {
                ...s.stealth,
                anchorValue: Math.max(0, anchorValue - lastAdded),
                lastAdded: 0,
              },
            };
          }
          return {
            stealth: {
              ...s.stealth,
              differenceValue: Math.max(0, differenceValue - lastAdded),
              lastAdded: 0,
            },
          };
        }),

      resetCurrentPhase: () =>
        set((s) => {
          if (s.stealth.phase === 'ANCHOR') {
            return { stealth: { ...s.stealth, anchorValue: 0, lastAdded: 0 } };
          }
          return { stealth: { ...s.stealth, differenceValue: 0, lastAdded: 0 } };
        }),

      confirmAnchor: () =>
        set((s) => ({
          stealth: { ...s.stealth, phase: 'DIFFERENCE', lastAdded: 0 },
        })),

      confirmDifference: (result) =>
        set((s) => ({
          stealth: {
            ...s.stealth,
            phase: result.kind === 'ambiguous' ? 'RESOLVING' : 'COMPUTED',
            engineResult: result,
            resolvedDate: result.kind === 'ok' ? result.primary : null,
          },
        })),

      resolveAmbiguous: (date) => {
        set((s) => ({
          stealth: { ...s.stealth, phase: 'COMPUTED', resolvedDate: date },
        }));
      },

      resetStealth: () =>
        set({ stealth: { ...DEFAULT_STEALTH } }),

      // ── History ─────────────────────────────────────────────────────────
      history: [],

      addReading: (reading) =>
        set((s) => ({
          history: [reading, ...s.history].slice(0, 100),
        })),

      clearHistory: () => set({ history: [] }),

      // ── Settings ────────────────────────────────────────────────────────
      settings: { ...DEFAULT_SETTINGS },

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: 'singularis-settings',
      // Only persist settings and history, not transient stealth state
      partialize: (s) => ({ settings: s.settings, history: s.history }),
    }
  )
);
