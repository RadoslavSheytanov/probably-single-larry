import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ntfySend } from './ntfy';
import type { ResolvedDate } from '../utils/types';

const cancerSign = {
  name: 'Cancer',
  symbol: '♋',
  element: 'Water' as const,
  dateRange: 'Jun 21 – Jul 22',
};

const mockDate: ResolvedDate = {
  day: 17,
  month: 7,
  sign: cancerSign,
};

const altDate: ResolvedDate = {
  day: 15,
  month: 1,
  sign: {
    name: 'Capricorn',
    symbol: '♑',
    element: 'Earth' as const,
    dateRange: 'Dec 22 – Jan 19',
  },
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ntfySend', () => {
  it('does nothing when topic is empty string', async () => {
    await ntfySend('', mockDate, null);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does nothing when topic is whitespace only', async () => {
    await ntfySend('   ', mockDate, null);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls fetch with correct URL when topic is set', async () => {
    await ntfySend('my-topic', mockDate, null);
    expect(fetch).toHaveBeenCalledOnce();
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://ntfy.sh/my-topic');
  });

  it('sets Title header to the sign name', async () => {
    await ntfySend('my-topic', mockDate, null);
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Title']).toBe('Cancer');
  });

  it('sets body to "Month Day" format for a single date (no alternate)', async () => {
    await ntfySend('my-topic', mockDate, null);
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('July 17');
  });

  it('sets body with both dates separated by "or" when alternate is provided', async () => {
    await ntfySend('my-topic', mockDate, altDate);
    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe('July 17 or January 15');
  });

  it('trims whitespace from topic before using it in URL', async () => {
    await ntfySend('  my-topic  ', mockDate, null);
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://ntfy.sh/my-topic');
  });

  it('does not throw when fetch rejects (fail silently)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
    await expect(ntfySend('my-topic', mockDate, null)).resolves.toBeUndefined();
  });
});
