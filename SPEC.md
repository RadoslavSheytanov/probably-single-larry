# Singularis PWA — Feature Specification v2

## 1. Core Algorithm

### Inputs
- **A** (Anchor Number): spectator's birth DAY + birth MONTH. Spoken aloud by spectator, secretly entered by performer.
- **D** (Difference Number): |birth DAY - birth MONTH|. Peeked from billet, secretly entered by performer.

### Formula
```
smaller = (A - D) / 2
larger  = A - smaller
```

### Day/Month Resolution
- One value > 12: that's the DAY, the other is the MONTH
- Both values <= 12: AMBIGUOUS. Show both possibilities. Performer resolves verbally.
- D == 0: day and month are identical. Both equal A/2.

### Validation
- A < 5: ABORT. Warn performer: "Anchor too low. Switch to another effect."
- (A - D) must be even. If odd: input error.
- Month must be 1-12.
- Day must be valid for that month (1-28/29/30/31).
- A cannot exceed 43 (max possible: 31 + 12).
- D cannot exceed A.

### Star Sign Lookup
Standard Western astrology date boundaries. Return name, Unicode symbol, element (Fire/Earth/Air/Water), and date range string.

### Reference Test Cases
| Spectator | Day | Month | A  | D  | Result          | Sign       |
|-----------|-----|-------|----|----|-----------------|------------|
| Jessica   | 17  | 7     | 24 | 10 | July 17         | Cancer ♋   |
| Christmas | 25  | 12    | 37 | 13 | December 25     | Capricorn ♑|
| Leap baby | 29  | 2     | 31 | 27 | February 29     | Pisces ♓   |
| NYE       | 31  | 12    | 43 | 19 | December 31     | Capricorn ♑|
| Same d/m  | 6   | 6     | 12 | 0  | June 6          | Gemini ♊   |
| Ambiguous | 8   | 5     | 13 | 3  | May 8 OR Aug 5  | Taurus/Leo |
| Too low   | 2   | 1     | 3  | 1  | ABORT           | -          |

---

## 2. Screens

### 2.1 Home Dashboard
Clean dark dashboard (`#0a0a0a`). No decoy calculator — stealth is in how the phone is used (pocket/blind input), not what the app looks like.

**Content:**
- Last reading card (zodiac symbol, date, sign name) if history exists
- Warning banner if ntfy topic is not configured
- "Start Performance" button → Stealth Input
- "Practice" button → Practice Mode
- Bottom nav: History, Settings

**Stealth:**
- Tab/PWA title: "Calculator"
- Favicon: calculator icon
- No Singularis branding on installed home screen icon

### 2.2 Stealth Input (THE CORE SCREEN)

Pure black (#000) screen. The performer's phone is in their pocket. All input happens through the fabric via touch zones.

#### Layout: Invisible Touch Zones
The screen is divided into invisible regions. No visual boundaries. The only visible element is a very subtle (opacity 0.08) number display and phase dots.

```
+----------------------------+
|                            |
|       TOP ZONE             |
|       tap = +10            |
|                            |
|                            |
+----------------------------+  <- invisible boundary at 50% height
|                            |
|       BOTTOM ZONE          |
|       tap = +1             |
|                            |
|                            |
+----------------------------+

Long press (anywhere, 600ms) = CONFIRM current number
Double-tap (anywhere)        = UNDO last increment (subtract last added value)
Three-finger tap             = RESET to zero
Swipe down (full screen)     = EXIT to home dashboard
```

**Haptic Feedback Patterns (via navigator.vibrate):**
- +1 tap: single short pulse [10]
- +10 tap: double pulse [10, 30, 10]
- Confirm: triple pulse [15, 40, 15, 40, 15]
- Undo: single long pulse [50]
- Error/warning: three sharp pulses [30, 50, 30, 50, 30]
- Result computed: ascending pattern [8, 30, 12, 30, 20]

**Visual Feedback (subtle, for glanceable confirmation):**
- Current value displayed center-screen at opacity 0.08
- Font: 80px, weight 100, tabular-nums
- On +10 tap: brief flash to opacity 0.15, then back to 0.08 over 200ms
- On +1 tap: brief flash to opacity 0.12, then back to 0.08 over 150ms
- Phase label below number: "ANCHOR" or "DIFFERENCE" at opacity 0.06

**Phase Indicator:**
- Three dots at very bottom of screen, 4px diameter
- Active phase dot: opacity 0.25 with subtle glow
- Inactive dots: opacity 0.06
- Phases: ANCHOR -> DIFFERENCE -> COMPUTED

**Input Flow:**
1. Screen opens in ANCHOR phase
2. Performer taps zones to build the anchor number
3. Long press confirms A -> haptic triple-pulse -> phase shifts to DIFFERENCE
4. Performer taps zones to build the difference number
5. Long press confirms D -> engine computes -> result screen appears

**Edge Case: Anchor < 5**
- On confirm, if A < 5: show warning overlay
- Warning: warning icon, "Anchor too low", "Abort gracefully - try another spectator"
- Haptic: error pattern
- Tap to dismiss, resets to ANCHOR phase


### 2.3 Result / Peek View

Full-screen overlay. This is what the performer glances at when they look at their phone.

**Layout (centered vertically):**
- Zodiac symbol: 96px, white
- Sign name: serif font, letter-spacing 10px, opacity 0.4, uppercase
- Date: 40px, weight 100, white
- If ambiguous: divider line, "OR" label, alternate date at 24px opacity 0.5
- Element + date range: opacity 0.15
- Action buttons: "Save to Calendar" (amber outline), "New Reading" (white outline)

**Animations:**
- Overlay fades in over 600ms
- Content slides up 30px + scales from 0.94 to 1.0 over 1s (spring easing)
- Zodiac symbol has subtle glow: drop-shadow(0 0 60px rgba(255,255,255,0.08))

**Ambiguous Case:**
- Both possible dates shown with "OR" divider
- Performer uses verbal technique to determine correct date
- Tapping a date selects it as the final answer (updates history, updates ntfy notification)

### 2.4 Settings

Slide-up panel from bottom. Dark surface (#0a0a0a).

**Settings Items:**
| Setting | Type | Default | Notes |
|---------|------|---------|-------|
| ntfy Topic | Text input | empty | The secret topic URL suffix |
| Auto-save Calendar | Toggle | OFF | Auto-downloads .ics on result |
| Watch Peek Preview | Toggle | ON | Shows simulated watch card |
| Haptic Feedback | Toggle | ON | Disable on iOS (not supported anyway) |
| Clear History | Button | - | Confirms before clearing |
| Deactivate session | Button | - | Logs out current session → LicenseGate |
| Version | Display | - | "SINGULARIS v2.0.0 - PWA" |

**Typography:**
- Panel title: Cormorant Garamond, 26px, weight 300, letter-spacing 6px, uppercase
- Labels: system font, 14px, weight 300
- Values: system font, 13px, opacity 0.35
- Close button: top-right, "CLOSE", letter-spacing 3px

### 2.5 History

Slide-up panel. Chronological list of past readings.

**Each Entry:**
- Zodiac symbol (30px)
- Date (16px, weight 300)
- Sign name (12px, opacity 0.35, right-aligned)
- Separated by 1px line at opacity 0.04

**Storage:**
- Stored in memory during session
- Optionally persisted to encrypted localStorage (AES-256 via Web Crypto API)
- Max 100 entries, FIFO
- "Clear History" in settings wipes all

### 2.6 Practice Mode

Accessible from stealth screen (book icon, top-right, opacity 0.15).

**Layout:**
- Header bar: "DRILL MODE" in amber at opacity 0.4
- Target date displayed prominently: "August 14"
- Instruction: "Work out A and D mentally, then check"
- "REVEAL ANSWER" button
- On reveal, show:
  - A (Anchor) value
  - D (Difference) value
  - (A-D)/2 result
  - A - result
  - Star sign
  - Edge case flags: "Ambiguous" or "Anchor too low" or "D = 0"
- "NEXT DATE" button generates new random valid date

**Random Date Generation:**
- Month: random 1-12
- Day: random 1-{max days for that month}
- Ensure A >= 5 (skip dates where day + month < 5)
- Show the date, NOT the A/D values initially

---

## 3. Output Channels

### 3.1 ntfy.sh Push Notification

**On result computation:**
```javascript
fetch(`https://ntfy.sh/${userTopic}`, {
  method: 'POST',
  headers: {
    'Title': `${sign.symbol} ${sign.name}`,
    'Priority': '2',
    'Tags': 'crystal_ball',
  },
  body: `${monthName} ${day}`
});
```

- If ambiguous: body includes both dates with "OR"
- If offline: fail silently, no error shown, no retry
- Topic is user-configured in Settings (random string, e.g., "s1ng-x7k9m2p")
- Performer subscribes to this topic in the ntfy mobile app on their phone
- Notification mirrors to Apple Watch / Wear OS automatically

### 3.2 .ics Calendar File Generation

**On "Save to Calendar" tap:**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Singularis//EN
BEGIN:VEVENT
DTSTART;VALUE=DATE:{YYYY}{MM}{DD}
DTEND;VALUE=DATE:{YYYY}{MM}{DD}
SUMMARY:{symbol} Prediction: {monthName} {day}
DESCRIPTION:Star Sign: {signName} {symbol}\nElement: {element}\n\nSingularis
STATUS:CONFIRMED
UID:singularis-{timestamp}@prediction
DTSTAMP:{now in UTC}
END:VEVENT
END:VCALENDAR
```

- Year = current year
- Downloaded as prediction-{month}-{day}.ics
- On iOS: opening the .ics file prompts "Add to Calendar"
- On Android: opens default calendar app

### 3.3 Simulated Watch Preview

**Appearance:**
- Positioned: absolute, top-right corner, 160px wide
- Background: #1c1c1e, border-radius 22px, 1px border at opacity 0.08
- Box shadow: 0 12px 40px rgba(0,0,0,0.7)
- Entrance: slideInRight animation, 350ms spring
- Auto-dismiss: fade out after 5 seconds
- Content: "WATCH PEEK" label, zodiac symbol, sign name, date

---

## 4. PWA Configuration

### manifest.json
```json
{
  "name": "Calculator",
  "short_name": "Calc",
  "description": "Calculator",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### iOS Meta Tags (in index.html head)
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#000000">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

---

## 5. Mobile Platform Support

### Target Platforms
- **iOS Safari** (PWA installed via "Add to Home Screen") — primary target
- **Android Chrome** (PWA installed via browser install prompt) — primary target
- **Desktop Chrome** — secondary (for testing only)

### Safe Area & Viewport
- All screens use `env(safe-area-inset-*)` padding to avoid notch / home indicator
- `pt-safe` = `padding-top: env(safe-area-inset-top)` — applied to all fixed headers
- `pb-safe` = `padding-bottom: env(safe-area-inset-bottom)` — applied to all bottom bars
- Viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`
- `position: fixed; inset: 0; overflow: hidden` on every screen — no scroll, no bounce

### Touch Targets
- Minimum 44×44px for all interactive elements (Apple HIG + Material guidelines)
- All tap zones fill the full half-screen — naturally exceed minimum
- `onTouchStart` + `onClick` on every button (touch fires before click; `e.preventDefault()` blocks ghost click)

### iOS-Specific Behaviour
- `apple-mobile-web-app-capable: yes` → runs in standalone mode (no Safari chrome)
- `apple-mobile-web-app-status-bar-style: black-translucent` → status bar overlays app
- No rubber-band scroll: `overscroll-behavior: none` globally
- No text selection, callout, or tap highlight: set globally in CSS
- Haptics: `navigator.vibrate` not supported on iOS — haptic calls must fail silently
- Web Speech API: not available in iOS PWA — not applicable (voice removed)
- Wake Lock: supported on iOS 16.4+ — acquire on stealth entry, release on exit

### Android-Specific Behaviour
- Chrome install banner appears automatically when PWA criteria met
- Haptics: `navigator.vibrate` fully supported
- Wake Lock: fully supported
- Theme color `#000000` applies to system status bar and task switcher card

### Responsive Layout
- All layouts are single-column, full-bleed — no breakpoints needed
- Font sizes specified in px (not rem) for precise control on small screens
- Tested viewport: 375×812 (iPhone SE/13 mini), 390×844 (iPhone 14), 360×800 (Android mid-range)

---

## 6. Sales & Distribution

### Storefront: Gumroad
- Sell at a fixed one-time price (suggested: $49–$99 USD)
- Gumroad handles: payment processing, VAT, receipt email, automatic license key generation
- Each purchase generates one unique license key (Gumroad's built-in license system)
- Key is shown on the receipt page and emailed to the buyer
- Refund window: 7 days (Gumroad default)
- No subscription — one-time payment, lifetime access

### What the Buyer Receives
1. Purchase confirmation email containing their Gumroad license key
2. Short instruction: "Open singularis.app on your phone → enter your email + license key → tap Activate → tap Share → Add to Home Screen"
3. Activation is per-device and works offline after first activation

### License Key Format
Gumroad-generated key entered by the user on first activation.
- Stored in localStorage after successful activation (alongside email and HMAC token)
- Offline validation on every subsequent launch — no network required
- One activation can be used on multiple devices (acceptable trade-off for zero server cost)

---

## 7. Security & Anti-Piracy

### Authentication Architecture
Cloudflare Worker (free tier) + localStorage HMAC model. Requires internet once per device; fully offline after first activation.

```
FIRST ACTIVATION (requires internet, one-time per device):
  User enters email + Gumroad license key in LicenseGate
       ↓
  POST /validate to Cloudflare Worker
       ↓
  Worker verifies key against Gumroad License API
       ↓
  If valid: Worker computes HMAC-SHA256(email:key, HMAC_SECRET) → token
       ↓
  App stores { email, key, token } in localStorage (sg_e, sg_k, sg_t)
       ↓
  App unlocks

SUBSEQUENT LAUNCHES (fully offline):
  validateStoredLicense() reads localStorage
       ↓
  Recomputes HMAC-SHA256(email:key, VITE_LICENSE_SALT) locally
  (VITE_LICENSE_SALT must equal HMAC_SECRET — set before deploy)
       ↓
  If match → unlocked immediately, zero network calls

DEACTIVATE:
  clearLicense() removes localStorage items → LicenseGate shown on next launch
```

### License Server (singularis-worker/)
- Cloudflare Worker (free tier — 100,000 req/day, zero cost)
- `POST /validate`: verifies email + key against Gumroad License API, rejects refunded/chargebacked purchases, returns HMAC-SHA256 token
- No database, no Redis, no recurring server costs

### Key Revocation
- Disable key in Gumroad dashboard → all future fresh activations rejected
- Existing activated devices continue to work (no remote kill switch — acceptable trade-off for zero server cost)
- Refunded purchases: Gumroad marks key as refunded → Worker rejects it on any new activation attempt

### LicenseGate Screen
- Shown on first launch, after deactivation, or if localStorage is cleared/tampered
- Two inputs: email address + Gumroad license key
- "Activate" button → calls Cloudflare Worker → spinner → success or error
- On success: stores credentials, fades into app
- On failure: red error (invalid key, refunded, network error)
- No skip option, no demo mode — gate is absolute

### Code Protection (Production Build)
- Vite Terser minification: mangle toplevel, drop console, drop debugger, 3 passes
- Post-build obfuscation via javascript-obfuscator:
  - `controlFlowFlattening: true`
  - `deadCodeInjection: true`
  - `stringArray: true, stringArrayEncoding: ['rc4']`
  - `selfDefending: true`
  - `debugProtection: true`
  - `domainLock: ['singularis.app', 'www.singularis.app']`

### Anti-Debugging
- Periodic `debugger` statement timing check in a `setInterval`
- If DevTools detected (timing delta > 100ms): silently blank the app (set root innerHTML to empty string)
- No error message — app just goes black

### Domain Lock
- On load: check `window.location.hostname` against allowlist
- If mismatch: silently blank the app
- Allowlist: `['singularis.app', 'www.singularis.app', 'localhost']` (localhost for dev only — removed in prod build)

---

## 8. Design System

### Typography
- Display/zodiac/headings: Cormorant Garamond (Google Fonts, 300/400/500)
- Body/UI/numbers: -apple-system, BlinkMacSystemFont, SF Pro Display, Helvetica Neue, sans-serif
- Numbers: font-variant-numeric: tabular-nums

### Color Palette (Tailwind config)
```
black:   #000000
surface: #0a0a0a
subtle:  rgba(255,255,255,0.04)
muted:   rgba(255,255,255,0.08)
dim:     rgba(255,255,255,0.15)
soft:    rgba(255,255,255,0.25)
text:    rgba(255,255,255,0.5)
bright:  rgba(255,255,255,0.8)
white:   #ffffff
amber:   #FF9F0A
warn:    rgba(255,180,80,0.6)
err:     rgba(255,90,90,0.5)
```

### Framer Motion Animation Presets
- Result reveal: spring, damping 25, stiffness 120, mass 0.8
- Watch notification: spring, damping 20, stiffness 200
- Panel slide-up: spring, damping 30, stiffness 300
- Number bump on tap: spring, damping 15, stiffness 400, mass 0.3

### Touch Behavior (global CSS)
- overscroll-behavior: none
- user-select: none
- -webkit-touch-callout: none
- -webkit-tap-highlight-color: transparent
- touch-action: none
- position: fixed; inset: 0; overflow: hidden

### Screen Wake Lock
- Acquire navigator.wakeLock.request('screen') on entering stealth mode
- Release on returning to decoy calculator
- Re-acquire on visibilitychange if stealth mode is active

---

## 9. Keyboard Shortcuts (Desktop Testing)
| Key | Action |
|-----|--------|
| Up Arrow | +1 (same as bottom zone tap) |
| Shift + Up | +10 (same as top zone tap) |
| Enter / Space | Confirm (same as long press) |
| Backspace | Undo last increment |
| R | Reset current number to 0 |
| Escape | Exit stealth -> decoy |

---

## 10. Performance Targets
- First Contentful Paint: < 400ms
- Time to Interactive: < 800ms
- Total bundle (gzipped): < 80KB
- Lighthouse PWA score: 100
- Offline: full functionality except ntfy notifications
