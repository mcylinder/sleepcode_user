# Player Voice Preference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Global voice preference with S3 path `session/{voiceId}/{sessionId}/`, first-play picker, and Account Defaults; all sessions free for local development.

**Architecture:** Catalog exposes `VOICES` + `SESSIONS`. Prefs store `voiceId`. Media API signs the voice-scoped prefix. Player gates on missing voice; Defaults edits the same pref.

**Tech Stack:** Next.js App Router, TypeScript, localStorage prefs, CloudFront signed prefixes.

**Spec:** `docs/superpowers/specs/2026-10-30-player-voice-preference-design.md`

## Global Constraints

- S3 prefix: `session/{voiceId}/{sessionId}/`
- No silent default voice (`voiceId` starts null)
- Dev: every session `free: true` so membership does not block play
- Reuse existing Sheet / Defaults patterns

---

### Task 1: Catalog + free sessions

**Files:**
- Modify: `src/lib/catalog.ts`
- Modify: `src/data/sessions.json` (all `free: true`)

- [x] Parse `{ voices, sessions }`; export `Voice`, `VOICES`, `findVoice`, `SESSIONS`
- [x] Keep `isComingSoon` based on `!free` (all free ⇒ none coming soon)

### Task 2: Prefs + media API + client fetch

**Files:**
- Modify: `src/lib/playerPrefs.ts`
- Modify: `src/app/api/media/session/route.ts`
- Modify: `src/lib/authedFetch.ts`

- [x] Add `voiceId: string | null` to prefs; validate against known voices on load
- [x] Require `voiceId` in POST body; sign `session/{voiceId}/{sessionId}/`
- [x] `fetchSessionMedia(sessionId, voiceId)`

### Task 3: Player voice sheet + Defaults

**Files:**
- Create: `src/components/ui/VoicePicker.tsx` (shared list UI)
- Modify: `src/app/application/player/page.tsx`
- Modify: `src/components/account/DefaultsSection.tsx`

- [x] Gate audio load until voice chosen; save pref then load
- [x] Defaults Voice row uses same picker list
