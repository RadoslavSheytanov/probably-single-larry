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

### 2.1 Decoy Calculator
A pixel-perfect iOS calculator clone. Dark theme. Fully functional arithmetic.

**Requirements:**
- All four operations: +, -, x, /
- Percentage, sign toggle (+/-), clear (AC)
- Display truncates and scales font for long numbers
- Button layout matches iOS exactly (zero button double-width)
- Smooth button press animation (opacity change on press)

**Secret Activation:**
- 5 rapid taps anywhere on the calculator screen within 2 seconds
- Each tap must be within 400ms of the previous tap
- On activation: smooth crossfade to Stealth Input screen (300ms fade)
- No visual indicator that activation is possible

**Stealth:**
- Tab/PWA title: "Calculator"
- Favicon: calculator icon
- No Singularis branding anywhere on this screen

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
Swipe down (full screen)     = EXIT to decoy calculator
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

#### Alternative Input: Voice Capture
Selectable in settings. Uses Web Speech API.

**How it works for Anchor (A):**
1. App begins listening when stealth mode activates
2. Spectator says their number aloud: "Twenty-four"
3. Performer naturally repeats: "Twenty-four! That's wonderful..."
4. App extracts the first integer it hears
5. Number appears on screen at low opacity, haptic confirms
6. App auto-advances to DIFFERENCE phase after 2-second silence

**How it works for Difference (D):**
1. App continues listening
2. Performer weaves D into their reading: "I sense the number ten holds significance..."
3. App captures the integer, haptic confirms
4. Auto-computes and shows result

**Speech Parsing Requirements:**
- Handle word-form numbers: "twenty-four" -> 24, "thirteen" -> 13
- Handle digit-form: "24" -> 24
- Handle split digits: "two four" -> interpret as 24 (two-digit number, not 2 and 4)
- Ignore filler words: "um", "uh", "like", "so"
- Ignore non-number speech entirely
- Timeout: if no number detected in 30 seconds, show subtle prompt

**Voice Confidence Indicator:**
- When a number is captured, briefly show it at opacity 0.2 with a checkmark
- If confidence is low (< 0.7), show number at opacity 0.15 with a question mark
- Performer can long-press to confirm, or double-tap to reject and re-listen

**Fallback:**
- If Web Speech API unavailable (iOS Safari restrictions), auto-switch to touch zones
- Show brief subtle message: "Voice unavailable - using touch" at opacity 0.1

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
| Input Method | Selector: Touch Zones / Voice / Both | Touch Zones | "Both" uses voice for A, touch for D |
| ntfy Topic | Text input | empty | The secret topic URL suffix |
| Auto-save Calendar | Toggle | OFF | Auto-downloads .ics on result |
| Watch Peek Preview | Toggle | ON | Shows simulated watch card |
| Haptic Feedback | Toggle | ON | Disable on iOS (not supported anyway) |
| Stealth Activation Taps | Selector: 3/5/7 | 5 | Number of rapid taps to enter stealth |
| Clear History | Button | - | Confirms before clearing |
| License Key | Display + input | - | Shows current key, allows re-entry |
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

## 5. Security & Anti-Piracy

### License Key Validation
- First launch shows activation screen (email + license key inputs)
- Key format: SNG-XXXX-XXXX-XXXX-XXXX (alphanumeric, uppercase)
- Validation: SHA256("SINGULARIS:" + email.toLowerCase().trim() + ":" + SALT) -> first 16 chars, formatted with dashes
- SALT is a hardcoded constant in the obfuscated source (e.g., "k9x2mP7qR4vL8nJ1")
- Valid key + email stored in localStorage (only localStorage use in the app)
- On subsequent launches: auto-validate stored key
- If invalid or missing: only the activation screen is accessible

### Code Protection (Production Build)
- Vite Terser minification: mangle toplevel, drop console, drop debugger, 3 passes
- Post-build obfuscation via javascript-obfuscator with:
  - control-flow-flattening
  - dead-code-injection
  - string-array with rc4 encoding
  - self-defending
  - debug-protection
  - domain-lock to production domain

### Anti-Debugging
- Periodic debugger statement timing check
- If DevTools detected (timing > 100ms), silently blank the app

### Domain Lock
- Check window.location.hostname against allowed domains
- If mismatch, silently blank the app (no error message)

---

## 6. Design System

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

## 7. Keyboard Shortcuts (Desktop Testing)
| Key | Action |
|-----|--------|
| Up Arrow | +1 (same as bottom zone tap) |
| Shift + Up | +10 (same as top zone tap) |
| Enter / Space | Confirm (same as long press) |
| Backspace | Undo last increment |
| R | Reset current number to 0 |
| Escape | Exit stealth -> decoy |

---

## 8. Performance Targets
- First Contentful Paint: < 400ms
- Time to Interactive: < 800ms
- Total bundle (gzipped): < 80KB
- Lighthouse PWA score: 100
- Offline: full functionality except ntfy notifications
