export type Phase = 'ANCHOR' | 'DIFFERENCE' | 'COMPUTED';

export type Screen = 'calculator' | 'stealth' | 'result' | 'settings' | 'history' | 'practice';

export type InputMethod = 'touch' | 'voice' | 'both';

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
  inputMethod: InputMethod;
  ntfyTopic: string;
  autoSaveCalendar: boolean;
  watchPeekPreview: boolean;
  hapticFeedback: boolean;
  activationTaps: 3 | 5 | 7;
  licenseKey: string;
  licenseEmail: string;
}
