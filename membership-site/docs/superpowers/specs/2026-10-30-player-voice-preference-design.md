# Player voice preference

**Date:** 2026-10-30  
**Status:** Approved  
**App:** `sleepcode_user/membership-site`

## Goal

Let listeners choose a global voice (Owen, Clara, …), save that preference, and load session audio from the matching S3 prefix. Fix catalog parsing so `sessions.json` can carry both voices and sessions.

## Media layout

Uploaded objects use:

```text
s3://slpcd-media/session/{voiceId}/{sessionId}/…
```

Example:

```text
s3://slpcd-media/session/VU16byTywsWv5JpI8rbc/let-it-in/manifest.json
s3://slpcd-media/session/VU16byTywsWv5JpI8rbc/let-it-in/c01_v1.m4a
s3://slpcd-media/session/VU16byTywsWv5JpI8rbc/let-it-in/pulse.m4a
```

`voiceId` is the ElevenLabs id from the catalog (same as Statement Studio `output/{voiceId}/`).  
`sessionId` is the session `id` in `sessions.json` (script stem).

## Catalog

`src/data/sessions.json` shape:

```json
{
  "voices": [
    { "id": "…", "name": "Owen", "description": "…" }
  ],
  "sessions": [
    { "id": "let-it-in", "title": "…", "theme": "…", "description": "…", "free": true }
  ]
}
```

`catalog.ts` must:

- Export `Voice` type and `VOICES` from `voices`
- Export `SESSIONS` from `sessions` (not the root object)
- Export `findVoice(id)` alongside `findSession(id)`

Studio **Export sessions** already emits this document shape; keep the membership copy in sync when publishing.

## Preference

Extend `PlayerPrefs` in `playerPrefs.ts`:

- Add `voiceId: string | null`
- Default: `null` (no silent fallback to the first voice)
- Persist in the existing `sleepcode_player_prefs` localStorage key
- Ignore unknown / removed voice ids on load → treat as `null`

Same store as Instruction/Pulse and repeat; Account → Defaults and the player both read/write it.

## Media signing

`POST /api/media/session` body:

```json
{ "sessionId": "let-it-in", "voiceId": "VU16byTywsWv5JpI8rbc" }
```

Behavior:

1. Resolve session via `findSession`; 404 if missing
2. Resolve voice via `findVoice`; 404 if missing
3. Enforce free / membership rules on the session (unchanged)
4. Sign CloudFront prefix `session/{voiceId}/{sessionId}/`

`fetchSessionMedia` passes the saved (or just-chosen) `voiceId`.

## Player UX

1. Resolve session from the query string (unchanged).
2. If `prefs.voiceId` is set and still in `VOICES`, load media with that voice.
3. If not, show a voice-choice sheet **before** fetching audio:
   - List every catalog voice: **name** + **description**
   - On select: `savePlayerPrefs({ …prefs, voiceId })`, dismiss sheet, load media
4. No in-session voice switcher in this work; changing voice is via Defaults (or clearing prefs and reopening).

## Account → Defaults

Add a **Voice** expandable row in `DefaultsSection`:

- Value: selected voice name, or a short “Not set” if `voiceId` is null
- Body: same listing (name + description); tap saves `voiceId`

## Out of scope

- Per-session voice memory
- Switching voice mid-playback without leaving the player
- S3 upload scripts / CI sync
- Migrating old flat `session/{sessionId}/` objects (new layout only)

## Testing

- Catalog: `SESSIONS` is an array of sessions; `VOICES` matches JSON
- Prefs: round-trip `voiceId`; unknown id clears to null
- API: missing/invalid voice or session → 404; valid pair → prefix includes both ids
- Player: no pref → sheet blocks load; after choose → requests include `voiceId`; with pref → no sheet
- Defaults: changing voice updates localStorage used by the next player open
