# SleepCode: Site Copy Revision Handoff

Instructions for updating the SleepCode site copy (local dev: http://localhost:3100). Apply the changes page by page below. Copy in quote blocks is final and should be used verbatim unless marked PLACEHOLDER.

---

## Global rules (apply everywhere)

1. **SleepCode is NOT a sleep aid.** Never describe sleep, rest or falling asleep as an outcome. Falling asleep is only *when* people listen (the "delivery window").
2. **The voice is not the listener's.** It's one instructor's voice speaking first-person ("I…") statements. Remove any copy saying it's "your own internal dialogue," "your own words," or that it "sounds like it's yours."
3. **"Supraliminal"** stays as the hook, and is always defined nearby (nothing hidden, every word audible, the opposite of subliminal).
4. **Pulse:** remove all mentions of "111 Hz" and "hypnotic." Describe it as a steady pulse that gives attention somewhere to rest, with a short pause after each statement.
5. **Control label:** always "Instruction / Pulse" (not "Voice", not "blend" alone).
6. **No blend numbers** in marketing or guide copy (no "60/40" or "76/24"). Guidance: start with the voice clearly on top, then adjust.
7. **Repeats:** the 1× / 2× / 4× control repeats *each statement*, not the whole session. Mention it only in the listening guide and player, not in marketing copy.
8. **Session naming:** `Title · Goal` (e.g. "Open Door · Optimism"). No Sleep category.
9. **Beta scope:** free tier only. Open Door · Optimism is playable; the other sessions are listed as "Coming soon" with **no price**. Hide the pricing page and all SleepCode+ prices and upgrade buttons (home, library, account, nav).
10. Remove "our most-played session" everywhere.
11. Remove the founder note ("Why this exists" / "Peter D.") entirely.

---

## Home ( `/` )

### Hero
- Eyebrow: `SUPRALIMINAL AUDIO FOR SPECIFIC GOALS` (unchanged)
- H1: `Attitudes are habits. Habits can be recoded.` (unchanged)
- Subhead (replace):
  > Supraliminal means nothing is hidden. Pick a goal, press play as you drift off, and one calm voice speaks clear statements about it, set to a steady pulse.
- CTA button (replace "Open your library"): `Hear a free session` → links to the Open Door · Optimism player
- Small note directly under the CTA (new):
  > SleepCode isn't a sleep aid. Sleep is just when you listen.

### How it works
- Opening line, above step 01 (new):
  > SleepCode isn't a sleep aid. You listen as you fall asleep because that's when your mind is quietest. The goal is the one you choose.
- **01 Choose one goal.** Keep the existing body copy.
- **02 Hear it in the first person.** Replace the body:
  > Each statement is phrased with "I" ("I finish what I start") so you hear it as a statement about yourself, not a command to follow.
- **03 Follow the pulse.** Replace the title ("Listen, and repeat.") and body:
  > A steady pulse gives your attention somewhere to rest, so the statements land without you analyzing them. Each one is followed by a short pause.
- Keep the "Read the full listening guide" link.

### Sample section (replaces "Why this exists" / founder note)
- Eyebrow: `A SAMPLE`
- Heading suggestion: `Every word, in plain sight.`
- Lines from Open Door · Optimism (**PLACEHOLDER**; swap for real script lines later):
  > I wake up glad to be here.
  > I choose my first thought.
  > Good things can happen today.
  > I let a bad mood pass.
  > When something goes wrong, I recover.
- Link: `Read the full script` → Optimism script page (see Scripts below)

### Pricing section
- Remove for beta. Replace it with a sessions list: Open Door · Optimism (Free, playable) and the four Coming soon sessions (see Sessions).

---

## Sessions (library `/application`, player, anywhere sessions are listed)

| # | Title · Goal | Status | Description |
|---|---|---|---|
| 01 | Open Door · Optimism | Free | For a more hopeful default: expecting good things and recovering quickly when they don't happen. |
| 02 | Quiet Abundance · Gratitude | Coming soon | (no description yet; hide the placeholder text) |
| 03 | Loosening the Grip · Calm | Coming soon | (no description yet) |
| 04 | Steady Ground · Confidence | Coming soon | (no description yet) |
| 05 | Clear Signal · Focus | Coming soon | (no description yet) |

- Remove **Deep Rest** and the **Sleep** category.
- Rename the goal tag **Anxiety → Calm**.
- Fix Optimism's tag: currently "Confidence," should be **Optimism**. The player subtitle currently reads "Confidence · ready when you are."
- Library filter chips: All, Optimism, Gratitude, Calm, Confidence, Focus.
- Remove "Placeholder. Replace with the real session." text.
- Remove the "5 more sessions with SleepCode+ / $49 a year" block for beta.

### Scripts (new)
- Each session gets a readable full script. Add a `Read the script` link on each library card and on the player.
- Suggested route: `/application/script?session=<id>` (or `/sessions/<slug>/script`).
- Only Optimism needs a script page for beta. Content comes later (Phase 3).

---

## How to listen ( `/how-to-listen` )

- **02 Find your blend:** remove "Start around 60/40." Replace the body:
  > The Instruction / Pulse slider sets how the voice sits against the pulse. Start with the voice clearly on top, then adjust until the words are easy to follow.
- **03 Repeat or set a length:** clarify that repeats apply per statement, and add the 10-hour max:
  > Choose whether each statement plays once, twice or four times (1×, 2×, 4×). Set a session length in hours and minutes, up to 10 hours. The countdown appears once a length is set.
- Keep 01, 04, 05 and "A note on care."
- Check the whole page for any sleep-as-outcome wording.

---

## FAQ ( `/faq` )

### Add these
- **Is SleepCode a sleep aid?**
  > No. It isn't designed to help you fall asleep, and it doesn't treat sleep problems. Bedtime is simply when most people listen: as you drift off, your mind is quiet enough to hear the statements without arguing back.
- **Does it work?**
  > Repetition shapes how we talk to ourselves. We can't promise results. Try Open Door free for a few weeks and judge for yourself.
- **Is the voice real or AI?**
  > It's a synthesized voice, chosen and directed for clarity and calm. We use it so the delivery stays even across hours of audio. Every statement is written by a person.
- **Can I use headphones?**
  > Yes, or a speaker. Keep the volume low. If you wear headphones in bed, choose a comfortable pair made for sleeping.
- **How long is a session?**
  > As long as you like, up to 10 hours. Set a length in the player and it stops on its own.
- **Can I read what's said?**
  > Yes. Every session's full script is linked from the library. Nothing is spoken that isn't written there.

### Edit these
- **How often should I listen?** Replace "Choose how many repeats you want in the player" with wording that makes clear repeats are per statement, e.g.:
  > Daily works best, because repetition does the work. In the player you can hear each statement more than once, or set a session length and let it run.
- **What is free?** For beta:
  > Open Door · Optimism is free to keep with a free account, with no time limit. More sessions are coming soon.
- Remove the **Membership / Can I cancel?** questions for beta (or hide them with the pricing page).

---

## Pricing ( `/pricing` )
- Hide for beta: remove it from the nav, the footer and all internal links. Keep the code for later.

## Account ( `/account` )
- Remove the upgrade block ("Add 5 more sessions for $49 a year…", Monthly/Yearly toggle, Upgrade button) for beta.
- "Instruction / pulse blend" label → `Instruction / Pulse`.

## About ( `/about` )
- Remove: "The sentence has to sound like it's yours before your mind will believe it enough to release."
- Check the rest against the Global rules (instructor's voice, not a sleep aid).
- Keep the "An instrument, not an appliance" headline and the "How we build it" principles.

## Contact ( `/contact` )
- ⚠️ **Unverified:** the phone (207-358-9026) and PO box (South Portland, ME 04116). Confirm they're real before launch, or remove them.

---

## Not yet decided (do not implement)
- Real Optimism script lines for the sample and the script page.
- Descriptions and scripts for Gratitude, Calm, Confidence and Focus.
