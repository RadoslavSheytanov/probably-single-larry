import { describe, it, expect, vi, beforeEach } from 'vitest';
import { haptics } from './haptics';

beforeEach(() => {
  Object.defineProperty(navigator, 'vibrate', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  });
});

describe('haptics', () => {
  it('comparison calls navigator.vibrate with 12', () => {
    haptics.comparison();
    expect(navigator.vibrate).toHaveBeenCalledWith(12);
  });

  it('tapOne calls navigator.vibrate with 10', () => {
    haptics.tapOne();
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('tapTen calls navigator.vibrate with [10, 30, 10]', () => {
    haptics.tapTen();
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
  });

  it('confirm calls navigator.vibrate with [15, 40, 15, 40, 15]', () => {
    haptics.confirm();
    expect(navigator.vibrate).toHaveBeenCalledWith([15, 40, 15, 40, 15]);
  });

  it('error calls navigator.vibrate with [30, 50, 30, 50, 30]', () => {
    haptics.error();
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 50, 30, 50, 30]);
  });

  it('resolved calls navigator.vibrate with [15, 30, 15]', () => {
    haptics.resolved();
    expect(navigator.vibrate).toHaveBeenCalledWith([15, 30, 15]);
  });

  it('undo calls navigator.vibrate with 50', () => {
    haptics.undo();
    expect(navigator.vibrate).toHaveBeenCalledWith(50);
  });

  it('back calls navigator.vibrate with [10, 40, 10]', () => {
    haptics.back();
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 40, 10]);
  });

  it('exit calls navigator.vibrate with 30', () => {
    haptics.exit();
    expect(navigator.vibrate).toHaveBeenCalledWith(30);
  });

  it('ambiguous calls navigator.vibrate with [20, 80, 20]', () => {
    haptics.ambiguous();
    expect(navigator.vibrate).toHaveBeenCalledWith([20, 80, 20]);
  });

  it('result calls navigator.vibrate with [8, 30, 12, 30, 20]', () => {
    haptics.result();
    expect(navigator.vibrate).toHaveBeenCalledWith([8, 30, 12, 30, 20]);
  });

  it('configureIosFallback updates the fallback toggle without throwing', () => {
    expect(() => haptics.configureIosFallback(false)).not.toThrow();
    expect(() => haptics.configureIosFallback(true)).not.toThrow();
  });
});

describe('haptics without navigator.vibrate', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  it('tapOne does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.tapOne()).not.toThrow();
  });

  it('comparison does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.comparison()).not.toThrow();
  });

  it('tapTen does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.tapTen()).not.toThrow();
  });

  it('confirm does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.confirm()).not.toThrow();
  });

  it('error does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.error()).not.toThrow();
  });

  it('resolved does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.resolved()).not.toThrow();
  });

  it('undo does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.undo()).not.toThrow();
  });

  it('back does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.back()).not.toThrow();
  });

  it('exit does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.exit()).not.toThrow();
  });

  it('ambiguous does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.ambiguous()).not.toThrow();
  });

  it('result does not throw when navigator.vibrate is undefined', () => {
    expect(() => haptics.result()).not.toThrow();
  });
});
