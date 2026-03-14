import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateStoredLicense,
  clearLicense,
  getStoredEmail,
} from './license';

// Known HMAC-SHA256('test@test.com:TEST-KEY-1234', 'k9x2mP7qR4vL8nJ1')
// Pre-computed using Node.js crypto to match the Web Crypto implementation
const KNOWN_EMAIL = 'test@test.com';
const KNOWN_KEY = 'TEST-KEY-1234';
const KNOWN_TOKEN = '0de0623f1d02e25545808f3e69316ac3cf38871353b27a43ed51525a34a0aa35';

const LS_EMAIL = 'sg_e';
const LS_KEY = 'sg_k';
const LS_TOKEN = 'sg_t';

beforeEach(() => {
  localStorage.clear();
});

// ── validateStoredLicense ─────────────────────────────────────────────────────

describe('validateStoredLicense', () => {
  it('returns false when localStorage is empty', async () => {
    expect(await validateStoredLicense()).toBe(false);
  });

  it('returns false when only email is present', async () => {
    localStorage.setItem(LS_EMAIL, KNOWN_EMAIL);
    expect(await validateStoredLicense()).toBe(false);
  });

  it('returns false when only key is present', async () => {
    localStorage.setItem(LS_KEY, KNOWN_KEY);
    expect(await validateStoredLicense()).toBe(false);
  });

  it('returns false when only token is present', async () => {
    localStorage.setItem(LS_TOKEN, KNOWN_TOKEN);
    expect(await validateStoredLicense()).toBe(false);
  });

  it('returns false when email and key are set but token is missing', async () => {
    localStorage.setItem(LS_EMAIL, KNOWN_EMAIL);
    localStorage.setItem(LS_KEY, KNOWN_KEY);
    expect(await validateStoredLicense()).toBe(false);
  });

  it('returns false when token does not match computed HMAC', async () => {
    localStorage.setItem(LS_EMAIL, KNOWN_EMAIL);
    localStorage.setItem(LS_KEY, KNOWN_KEY);
    localStorage.setItem(LS_TOKEN, 'deadbeefdeadbeef');
    expect(await validateStoredLicense()).toBe(false);
  });

  it('returns true when token matches computed HMAC for known email:key pair', async () => {
    localStorage.setItem(LS_EMAIL, KNOWN_EMAIL);
    localStorage.setItem(LS_KEY, KNOWN_KEY);
    localStorage.setItem(LS_TOKEN, KNOWN_TOKEN);
    expect(await validateStoredLicense()).toBe(true);
  });
});

// ── clearLicense ──────────────────────────────────────────────────────────────

describe('clearLicense', () => {
  it('removes all three localStorage keys', () => {
    localStorage.setItem(LS_EMAIL, KNOWN_EMAIL);
    localStorage.setItem(LS_KEY, KNOWN_KEY);
    localStorage.setItem(LS_TOKEN, KNOWN_TOKEN);
    clearLicense();
    expect(localStorage.getItem(LS_EMAIL)).toBeNull();
    expect(localStorage.getItem(LS_KEY)).toBeNull();
    expect(localStorage.getItem(LS_TOKEN)).toBeNull();
  });

  it('does not throw when keys are not present', () => {
    expect(() => clearLicense()).not.toThrow();
  });
});

// ── getStoredEmail ────────────────────────────────────────────────────────────

describe('getStoredEmail', () => {
  it('returns null when not set', () => {
    expect(getStoredEmail()).toBeNull();
  });

  it('returns stored email after setting it', () => {
    localStorage.setItem(LS_EMAIL, KNOWN_EMAIL);
    expect(getStoredEmail()).toBe(KNOWN_EMAIL);
  });
});
