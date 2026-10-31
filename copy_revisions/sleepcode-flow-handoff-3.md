# SleepCode: Flow & Clarity Handoff (Round 3)

Follow-up to Round 2 (`sleepcode-flow-handoff-2.md`). Found while walking the site signed out as a first-time visitor on 2026-10-22. Copy in quote blocks is final.

---

## 1. Account prompt: timing and copy

**Problem:** The prompt appears on the first setting tap, before anything has played, and covers the controls being adjusted. It also says "Save your settings," but signed-out settings already save to the device (`sleepcode_player_prefs` in localStorage).

**Timing:**
- Show it only **after the visitor's first session ends** (the timer finishes, or playback stops after real listening). If they leave mid-session, show it on their next player visit instead.
- Never before playback, never during playback, and never while Night shade is on.
- Never cover the player controls (position it above them, or as a centered card shown only once playback has stopped).
- After "Not now," don't show it again for 7 days. Once per visit at most.

**Copy (replace):**
> **Pick up where you left off.**
> A free account keeps your settings and progress wherever you listen.
> [Create free account] · Not now

## 2. Signup page ( `/login?mode=signup` )

**Problem:** "A free account includes Open Door. No card needed." contradicts "no account needed."

- Subhead (replace):
  > Free, no card needed. Keep your settings and progress wherever you listen.
- Keep the `next=` return so signup goes back to the player.

## 3. Sign in / Sign out, everywhere

Use **Sign in** and **Sign out** consistently:
- Login page eyebrow `LOG IN` → `SIGN IN`; button `Log in` → `Sign in`.
- Signup page: `Already have an account? Log in` → `Already have an account? Sign in`.
- Account page: `Log out` → `Sign out`.
- Search the codebase for any remaining "Log in" / "Login" / "Log out" in user-facing copy (route names can stay).

## 4. Library: hide "Continue" in beta

- Hide the `CONTINUE` row while only one session is playable (it repeats the only session listed right below it).
- When it returns: record a session as "last played" only after real playback (e.g. 1+ minute), not when the player page merely loads. Currently, opening the player sets `sleepcode_last_session` and shows "Last played today" without anything having played.

## 5. Default blend: one value

**Problem:** Signed-out default is 60 / 40; the signed-in account default is 76 / 24.
- Use a single default for both. **Proposed: 76 / 24** (the existing player/account default). Confirm with Peter before shipping.
- No number appears in marketing or guide copy (unchanged rule).

## 6. Account page label

- `Default repeats` → `Each statement` (matches the player).

## 7. Player fits one screen

**Problem:** On a laptop-height viewport (~1512×796) the Each statement and Volume controls sit below the fold.
- Tighten the vertical spacing (orb size, gaps) so all controls fit without scrolling at ≥ 760px viewport height. Mobile can scroll.

## 8. Minor

- **FAQ › Is my data private?** Remove the card/Stripe clause for beta:
  > We keep only what we need to run your account. No ads and no third-party trackers.
- **Analytics check:** Google Analytics cookies (`_ga*`) exist on localhost. They're likely from other local projects, but confirm SleepCode loads no GA or other trackers, since the cookie banner says "No ads, no trackers."

---

## Verified working (from Round 2)
Hero note · "Hear a free session" plays with no account · first-time overlay plus the `sc_player_intro_seen` cookie · ? reopens it, Esc closes · filter chips hidden · "Each statement" in the player · "Ready when you are" · "What is free?" FAQ · "Sign in" in the signed-out nav.
