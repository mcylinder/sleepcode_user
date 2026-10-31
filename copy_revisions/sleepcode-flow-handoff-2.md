# SleepCode: Flow & Clarity Handoff (Round 2)

Follow-up to `sleepcode-site-copy-decisions.md`. Round 1 copy is implemented. This round covers the user flow and player clarity. Copy in quote blocks is final unless marked DRAFT.

---

## 1. First visit: play first, account later

**Decision:** A first-time visitor can play the free session with **no account**. An account is only for saving settings and coming back.

- `Hear a free session` (home hero CTA) → goes straight to the Open Door · Optimism player. No login wall.
- The player must work fully when signed out (playback, blend, repeats, session length, night shade, volume).
- Signed-out settings (blend, repeats, length, volume) persist locally (cookie/localStorage) for that browser.
- The free session must also be reachable signed out from the library (`/application`) and the script page.
- Nav when signed out: show `Sign in` in place of `Account`.

### Account prompt: when settings are saved
- Show a quiet, non-blocking prompt **after the visitor adjusts a setting or finishes a session**. Never interrupt playback, and never show it while Night shade is on.
- Show it at most once per visit; after a dismissal, don't show it again for a while (e.g. 7 days).
- Copy (DRAFT):
  > **Save your settings.**
  > Create a free account to keep your blend, repeats and length, and pick up where you left off.
  > [Create free account] · Not now

### FAQ update
- **What is free?** Replace:
  > Open Door · Optimism is free, with no account needed. Create a free account to save your settings. More sessions are coming soon.

---

## 2. Player help: first-time overlay

**Decision:** Replace the current `?` behavior (it opens `/how-to-listen` in a new tab, pulling the user out of the player) with an **in-player overlay**.

- Show it automatically **on the first player visit only**. Set a cookie (e.g. `sc_player_intro_seen=1`, 1-year expiry) when dismissed.
- Returning visitors don't see it automatically. The `?` button reopens it any time.
- Don't navigate away and don't stop audio. Dismiss with `Got it`, a tap outside, or Esc.
- Copy (may be revisited):
  > **Before you start**
  > **Set a length.** Choose how long it runs, up to 10 hours. It stops on its own.
  > **Find your balance.** Slide toward Instruction to hear the words more, toward Pulse to hear the beat more.
  > **Choose repeats.** Hear each statement once, twice or four times.
  > **Keep it low.** A quiet, comfortable volume is enough.
  > **Go dark.** Night shade blacks out the screen. Tap anywhere to wake it.
  >
  > [Got it] · Full listening guide
- `Full listening guide` opens `/how-to-listen` in the **same tab**.

---

## 3. Home: sleep-line duplication

The not-a-sleep-aid line appears twice within one scroll. Keep both, but make them different:

- **Hero note under the CTA** (replace "SleepCode isn't a sleep aid. Sleep is just when you listen."):
  > For your goals, not your sleep. Bedtime is just when you listen.
- **How it works opening line:** keep as is:
  > SleepCode isn't a sleep aid. You listen as you fall asleep because that's when your mind is quietest. The goal is the one you choose.

---

## 4. Player & library quick fixes

- **Hide the library filter chips during beta.** Render them only when 2 or more sessions are playable.
- **Relabel the repeat control:** `Repeat` → `Each statement` (options stay 1× / 2× / 4×).
- **Player subtitle:** replace `Optimism · ready when you are` (it repeats the goal already in the title) with:
  > Ready when you are

---

## Not in this round
- Session scripts and new session content (a separate writing session).
- Real Optimism lines for the home sample and the script page (placeholders remain).
- Contact details are still unverified (South Portland ME PO box, 207 phone number).
