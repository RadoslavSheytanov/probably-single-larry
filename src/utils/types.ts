export type DominantDatePart = 'DAY' | 'MONTH';

export type Phase = 'COMPARISON' | 'ANCHOR' | 'DIFFERENCE' | 'COMPUTED';

export type Screen = 'home' | 'stealth' | 'result' | 'settings' | 'history' | 'instructions';


export interface StarSign {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dateRange: string;
}

export interface ResolvedDate {
  day: number;
  month: number;
  sign: StarSign;
}

export type EngineResult =
  | { kind: 'ok'; primary: ResolvedDate; alternate: null }
  | { kind: 'ambiguous'; primary: ResolvedDate; alternate: ResolvedDate }
  | { kind: 'error'; reason: 'anchor_too_low' | 'odd_difference' | 'invalid_day' | 'invalid_month' | 'd_exceeds_a' };

export interface Reading {
  id: string;
  timestamp: number;
  result: EngineResult;
  resolvedDate: ResolvedDate | null;
}

export interface AppSettings {
  ntfyTopic: string;
  ntfyEnabled: boolean;
  hapticFeedback: boolean;
  displayMode: 'fade-out' | 'muted-black';
  iosHaptics: boolean;
}
