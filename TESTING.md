# Singularis — Testing Guide

## Running Tests

### Run all tests once
```
npx vitest run
```

### Watch mode (re-runs on file save)
```
npx vitest
```

### Run a specific test file
```
npx vitest run src/engine/engine.test.ts
npx vitest run src/integration/flow.test.ts
```

### Run with coverage
`@vitest/coverage-v8` is not installed by default. To enable:
```
npm install --save-dev @vitest/coverage-v8
npx vitest run --coverage
```

---

## Test Files

| File | Scope |
|------|-------|
| `src/engine/engine.test.ts` | Reference cases from SPEC.md (A=24/D=10→July 17, Christmas, leap day, etc.) plus all error conditions and ambiguous result handling |
| `src/engine/exhaustive.test.ts` | All 365 calendar dates round-trip through the engine; sign boundary dates; ambiguous pairs |
| `src/state/store.test.ts` | All Zustand store actions: incrementAnchor, incrementDifference, undoLast, goBackPhase, resetCurrentPhase, confirmAnchor, confirmDifference, resolveAmbiguous, resetStealth, addReading, clearHistory, updateSettings |
| `src/services/license.test.ts` | HMAC validation logic, localStorage read/write/clear operations (activateLicense, validateStoredLicense, clearLicense, getStoredEmail) |
| `src/services/ntfy.test.ts` | Push notification formatting (ASCII-only title, plain-text body), send to ntfy.sh, ambiguous date formatting |
| `src/services/haptics.test.ts` | Vibration pattern dispatch for each haptic event (tapOne, tapTen, confirm, error, result, ambiguous, undo, back, exit, resolved) |
| `src/components/components.test.tsx` | PhaseIndicator: renders 4 dots, accepts all phase values. ScreenHeader: title text, rightElement slot, back arrow rendering, onBack callback |
| `src/screens/screens.test.tsx` | Home, History, and ResultPeek: renders key elements, navigation actions, conditional content (last reading, ntfy warning, empty history) |
| `src/integration/flow.test.ts` | Full store-level performance flows without rendering React: unambiguous performance, undo, three-finger reset, go-back, ambiguous resolution, error states, history accumulation, 100-entry cap |

---

## Pre-Ship Checklist

Run these before every production deploy:

```
npx vitest run
```

All 9 test files, 188 tests must pass. Pay particular attention to:

1. **Engine tests** — verify the reference case A=24, D=10 → July 17, Cancer still passes
2. **Integration flows** — confirm the full performance flow (Flow 1) produces correct output
3. **License tests** — confirm HMAC validation logic matches the deployed worker secret

---

## Interpreting Test Output

```
✓ src/engine/engine.test.ts (30 tests) 44ms
✓ src/integration/flow.test.ts (13 tests) 57ms
...
Test Files  9 passed (9)
      Tests  188 passed (188)
```

- A green `✓` means the file passed all tests.
- A red `✗` means at least one test in the file failed.
- The number in parentheses is the test count for that file.
- Failing tests print the expected vs received values and a stack trace pointing to the assertion.

When a test fails, the output includes:
- The test name (e.g. `Flow 1: Complete unambiguous performance`)
- The file and line number of the failing assertion
- The diff between expected and actual values

---

## What Is NOT Tested

The following require manual testing on a real device:

- **Touch gesture simulation** — long-press, double-tap, three-finger tap, and swipe gestures on `StealthInput.tsx` cannot be reliably simulated with `fireEvent` in jsdom. Test manually on iPhone and Android.
- **Framer Motion animations** — all animation props (`initial`, `animate`, `exit`, `transition`, `whileTap`) are stripped by the framer-motion mock in test files. Verify animations visually in the browser.
- **Wake Lock API** — mocked in tests. Verify the screen stays on during a performance on a real device.
- **ntfy push delivery** — unit tests verify the fetch call is made with correct parameters. Verify end-to-end delivery to a real watch/phone in a full integration test environment.
- **PWA install / service worker** — verify offline behaviour and install prompt manually in Chrome and Safari.
- **iOS safe-area insets** — verify `pt-safe-header` and `pb-safe-nav` render correctly on iPhone with a home indicator.
