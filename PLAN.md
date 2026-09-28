# Plan: Chromesthesia

Chromesthesia is an optical synth in the browser. Sixteen scan points move along
editable formulas over an image, a video, the webcam or generated art. Each point's
pixel (brightness, hue, saturation, lightness, position) plays a Web Audio voice: its
pitch, amplitude, filter, pan and envelope. Around the scanner sit a four-voice drone
with sub-oscillators and an LFO, a four-track, sixteen-step probabilistic sequencer,
twelve effect slots, a master bus, preset banks, "I'm Feeling Lucky", the scan visuals
and a recorder. It is a static React 19 + Vite + Tailwind 4 page on Firebase Hosting,
and nearly all of it is one 9,000-line `src/App.tsx`.

This plan was written on 2026-09-28 from a review of the code. Where a finding was
measured, it was rendered through an `OfflineAudioContext` in headless Chromium the same
day; the rest is read in the code. Line numbers are as of `4f3e03f` and will drift, so
each item also names the function.

## Running order

| | Item | State |
|---|---|---|
| 1 | Reset leaves the app silent | Open |
| 2 | One bad formula stops the scanner | Open |
| 3 | The sequencer's envelopes throw, and notes never release | Open |
| 4 | Patches play their effects' defaults, not their settings | Open |
| 5 | The drone's saturation is silent at 0 and a square wave above | Open |
| 6 | The limiter lets the output clip | Open |
| 7 | Timing on animation frames, with no lookahead | Open |
| 8 | Starting and resuming the audio | Open |
| 9 | Recordings named for a format they are not | Open |
| 10 | Controls that do nothing | Open |
| 11 | The server, the keys and the hosting | Open |
| 12 | The workflows | Open |
| 13 | One file, and almost no type checking | Open |
| 14 | Features | Proposed |

Items 1 to 5 are what someone playing it hears first. Item 13 makes every later fix
safer, so it can be taken in small steps alongside them rather than all at once.

## 1. Reset leaves the app silent until a reload

**Read in the code.** `stopAllAudio` (about line 3081) calls `.stop()` on every scanner
oscillator and its noise source, and on the drone's, the subs' and the sequencer's
oscillators, then suspends the context. `handleReset` calls it. On the next Play,
`initAudio` (about line 2759) sees a suspended context, resumes it and returns. The
oscillators are made only when the context is first built (about lines 2957, 3022 and
3074), and an `OscillatorNode` that has been stopped can never start again. So after
Reset nothing sounds until the page is reloaded.

*Fix:* either fade the gains and suspend without stopping, or `close()` the context and
clear every ref so that `initAudio` builds the graph again. *Measure:* a Playwright
script: Play, Reset, Play, and the output's RMS is above silence.

## 2. One bad formula stops the scanner

**Read in the code.** The scan path is the text of two textareas compiled with ``new
Function(…, `return ${formulaX}`)`` (about line 4694) and called in the animation loop
(`evalX`/`evalY`, about line 4861) outside any `try`. The loop is started once on mount
and asks for its next frame only at its end. A formula that compiles but throws, such as
`wi` on the way to typing `width` (a ReferenceError), stops the loop for good.

*Fix:* try a new formula once before swapping it in (it must return finite numbers for
a few `t`), keep the last good one, catch per frame, and show the error beside the
textarea. `new Function` on the user's own text is only self-XSS today; it becomes real
once patches can be shared by link (14a), so a small expression parser should replace it
then. *Measure:* type `wi` into the X formula: the scan keeps moving on the last good
formula, and the error is shown.

## 3. The sequencer's envelopes throw, and notes never release

**Measured.** The step envelope (about line 5352, with a copy in `playStep` at about
4686) ends with:

```ts
voice.gain.gain.setValueAtTime(stepVol * adsr.sustain, audioNow + noteDuration - adsr.release);
```

- Right after the first Play, while `currentTime` is less than `release − noteDuration`,
  that time is negative. With the long-release presets (Dreamy Arp, release 1.0 and 1.2)
  it throws `RangeError: Time must be a finite non-negative number` inside `tick`,
  before `requestAnimationFrame(tick)`, so the sequencer stops until something it
  depends on changes. This is a likely cause of the "sequencer not audible" fixes in the
  history.
- When attack plus decay is longer than the note, the events sort out of order. On
  Minimal Pulse the bass note is 24 ms, but its gain is still 0.144 at 1.9 s; the lead
  holds at 0.16. Notes never release, and each retrigger (`cancelScheduledValues`, then
  `setValueAtTime(0)`) clicks. The kick is a 12 ms click.

*Fix:* `gateOff = now + max(noteDuration, attack + decay)`, the release as
`setTargetAtTime(0, gateOff, release / 4)`, every time clamped to at least `now`,
`cancelAndHoldAtTime` for a retrigger, and a `try` round each voice. *Measure:* render
Dreamy Arp and Minimal Pulse offline from `currentTime = 0`: no exception, and each note's
gain back under −60 dB within its release.

## 4. Patches play their effects' defaults, not their settings

**Read in the code; not run.** An effect at about line 2489 calls
`setter(getDefaultParams(effect))` whenever an effect slot's *type* changes. `applyPatch`
(about line 2636) sets the type and its tuned parameters in the same batch, so after the
commit this effect overwrites them. Patches tuned to `characterParams: { drive: 0.35,
tone: 0.7, mix: 0.5 }` play the defaults (`drive 0.5 … mix 1.0`), on first load and on
every patch change that changes an effect's type. Most of the March patch audit
(`bc3d6bb`, `0e34d06`) therefore never reaches the audio.

*Fix:* reset to defaults in the effect selector's `onChange`, not in an effect; or have
`applyPatch` update `prevEffectsRef` as it sets the type. *Measure:* after loading a
patch, the character slot's `drive` is the patch's 0.35.

## 5. The drone's saturation is silent at 0 and a square wave above

**Measured.** The drone's shaper is `makeDistortionCurve(droneSaturation * 100)`, that
is `tanh(k·x)` with k from 0 to 100 (about lines 2967 and 5198), placed after the
drone's level (the chain at about 2971–2981). The slider goes to 0, and presets use 0.05
to 0.3, so k is 5 to 30, which the audit commit itself calls harsh. On Deep Space Drone,
saturation 0 gives a peak of 0: silence. At 0.2, taking the drone's volume from 0.6 to
0.1 (−15.6 dB) moves the output's RMS only from −0.4 to −2.2 dBFS, at a constant peak of
1.0: a full-scale square wave. That is the likely real cause of "drone too loud at
start" (`35f07e5`).

*Fix:* k = 1 + 4 × saturation with a dry/wet mix, bypassed at 0, and the level after the
shaper. *Measure:* the same render: at 0 the drone sounds; at 0.2, −15.6 dB of volume is
about −15.6 dB of RMS.

## 6. The "safety limiter" lets the output clip

**Measured.** The limiter (about line 2800) is a compressor: threshold −6 dB, ratio 8,
knee 6, attack 10 ms, feeding the speakers and the recorder. A signal at twice full
scale peaks at 1.01, with 3,600 samples a second over; three times, 1.07 with 11,240. The
buses reach that easily: the scanner is 16 voices × 2.5/16 × `ampMod` (whose slider goes
to 5); the sequencer's `droneSeqGain` is 1.2, outside its 0–1 slider; the drone is near
1.0 after item 5's clipper. The drone LFO's depth is 0 to 1000 raw units on every
target, so on the volume target it swings `voice.gain.gain` by ±1000 (about line 5176).

*Fix:* a headroom budget per bus (the buses' maxima summing to at most 1), the LFO's
depth scaled to its target, and a real limiter (ratio 20, knee 0, attack under 1 ms,
−1 dB) with a soft clip, or an AudioWorklet lookahead limiter. *Measure:* every preset at
its sliders' maxima renders with no sample over full scale.

## 7. Timing on animation frames, with no lookahead

**Read in the code.** The sequencer (about lines 5257–5361) adds up `performance.now()`
deltas and fires each note at `audioNow` on whichever frame it lands on, so notes jitter
by up to a frame (about 16 ms). It fires at most one step a frame, and animation frames
stop in a background tab, so on return the backlog drains at 60 steps a second against
8 at 120 bpm: a burst at about seven times the tempo. Swing reads the parity of the step
before. The scanner's step quantisation (about 4829) runs on its own `performance.now()`
clock, so "sync to global" drifts from the sequencer.

*Fix:* the standard lookahead scheduler (a 25 ms timer, or a Worker, scheduling about
100 ms ahead on `ctx.currentTime`), with the UI's step read from a queue in the animation
frame. *Measure:* an offline render of 64 steps at 120 bpm with the notes' onsets within
1 ms of the grid; a hidden tab for 10 s makes no burst.

## 8. Starting and resuming the audio

**Read in the code.**

- `initAudio` is `useCallback(…, [])` and reads first-render state (`isPlaying`,
  `droneSaturation`, `droneVoices`, …); later effects mostly paper over it.
- It handles only `'suspended'`. On iOS Safari a context that is `'interrupted'` (after a
  call or a screen lock) falls through to `if (audioContextRef.current) return;` and is
  never resumed.
- Space (about line 5551) toggles `isPlaying` without calling `initAudio`, so before any
  click the UI says "playing" and nothing sounds.
- Uploads call `initAudio()` from `FileReader.onload` (about line 4022), outside the
  user's gesture.

*Fix:* one `ensureAudio()`, called synchronously in every gesture handler (keydown
included), that resumes an `'interrupted'` context too, with `ctx.onstatechange` shown
in the UI.

## 9. Recordings named for a format they are not

**Read in the code.** The recorder (about lines 4209–4221) asks for `audio/mpeg`, `wav`
or `flac`, which Chrome's and Firefox's MediaRecorder do not make, and falls back to
`audio/webm`; but the file is named from the UI's choice (`const ext = isVideo ?
videoFormat : audioFormat;`, about line 4265). The default is FLAC, so a user gets Opus in
WebM saved as `.flac`, and the same for MP4 as WebM. "Lossless" is 512 kbps Opus.
`URL.revokeObjectURL` right after `a.click()` (about lines 4268 and 4298) can cancel the
download in Safari and Firefox.

*Fix:* the extension from `recorder.mimeType`, the formats labelled for what they are,
WAV from PCM captured by an AudioWorklet, and the URL revoked on a timeout.

## 10. Controls that do nothing

**Read in the code.**

- The drone's per-voice ADSR sliders (about lines 6908–6926) are never read; the drone
  fades in 0.8 s and out in 0.3 s whatever they say.
- `droneReverbGain` is made (about line 2963) and never connected, so Drone Reverb does
  nothing.
- The scanner's sustain (about lines 5017–5020) calls `setTargetAtTime` the frame after
  the gate opens, over the attack and decay ramps still pending, so the attack and decay
  sliders barely shape the note.
- `playStep` uses the scanner's `bpm` (about line 4675), not the sequencer's.
- `getBackgroundFilter` has no case for `'subtle'`, and its `'subtle-blur'`,
  `'high-contrast'` and `'dreamy'` cases can never match (about lines 2294–2309).
- Only the first `<video>` gets a `MediaElementSource` (`if (!videoAudioSourceRef.current)`,
  about line 5491). The element is rendered conditionally, so a later video is never
  routed and the route toggle does nothing; the unrouted path goes straight to
  `ctx.destination`, past the limiter.
- Uploads are read with `readAsDataURL` (about line 4024), so a large video becomes a
  base64 string in React state, and the image cache key (about line 4792) builds and
  compares a string of several hundred KB every frame.

*Fix:* wire or remove each; `URL.createObjectURL` for uploads, a counter for the cache
key, and one source per element.

## 11. The server, the keys and the hosting

**Read in the code.**

- Hosting is static (`firebase.json`: `dist` plus the SPA rewrite), and nothing in
  `src/` calls `/api/youtube`. So `server.ts`'s YouTube proxy is dead code, and
  `express`, `cors`, `dotenv` (never imported) and `@distube/ytdl-core` ship nothing.
  Proxying YouTube's streams is also against YouTube's terms. If it were ever deployed:
  its CORS lets through any request with no Origin (so it protects nothing) and answers
  a refused origin with a 500; the rate limit keys on `req.ip` without `trust proxy`, so
  behind a proxy everyone shares one bucket of 30 a minute; a range starting past the
  end gives a negative `Content-Length` rather than a 416; `getInfo` runs twice.
  *Do:* delete it, and make `dev` plain `vite`.
- No AI key is exposed today. Until `f0f2181` (2026-03-28), `vite.config.ts`'s `define`
  inlined `process.env.GEMINI_API_KEY` and `API_KEY` into the client bundle. CI never set
  them, but a key in a local `.env` used for a deployed build should be rotated.
- `src/lib/firebase.ts` holds the Firebase web config. That is public by design; restrict
  the key by HTTP referrer and API in Google Cloud.
- GA4 starts with no consent prompt (`main.tsx`); there is no CSP (and `new Function`
  would need `'unsafe-eval'` under one); `index.html` sets `user-scalable=no,
  maximum-scale=1.0`, which stops zoom; the page's description still says "AI-powered".
- `npm audit` reports 14 issues (2 critical, 6 high), mostly through firebase and the
  build tools; the direct one is vite 6.4.1's dev-server file read, and the dev server
  listens only on localhost.

## 12. The workflows

**Read in the code.**

- `npm-publish.yml` runs `npm test`, which does not exist, and then `npm publish` on a
  package marked `"private": true`, which npm refuses. It can never succeed, and an app
  is not an npm package. *Do:* delete it and the `npm_token` secret.
- `firebase-hosting-merge.yml` has no `permissions:` block, uses a `FIREBASE_TOKEN` from
  the deprecated `login:ci`, runs an unpinned `npx firebase-tools` on Node 20 (end of
  life since April 2026), and deploys without `npm run lint` or any test. The preview
  workflow asks for `checks` and `pull-requests: write`, which the CLI does not need,
  never posts the preview's URL, and cancels nothing it supersedes.
- *Do:* one CI job on pull requests (install, `tsc`, build, the tests of item 13); deploy
  through a service account or Workload Identity Federation (`google-github-actions/auth`,
  or `FirebaseExtended/action-hosting-deploy` pinned to a commit); `firebase-tools`
  pinned; `permissions: contents: read`.

## 13. One file, and almost no type checking

**Read in the code; the type check was run.**

- `App.tsx` is one component: 134 `useState`, 82 `useRef`, 24 `useEffect`. About 2,060
  lines are preset data (lines 67–2125), about 3,300 audio, about 3,600 JSX, and the
  effect chain's wiring is written out three times (about 2780–2995). Every sequencer
  step (`setCurrentDroneStep`) and every sixth frame in auto-palette mode re-renders the
  whole tree.
- `tsconfig.json` has no `strict`, and `@types/react` and `@types/react-dom` are not
  installed, so React and JSX are untyped: a file with `useState<number>(0); setN('x');`
  and `<div bogusProp/>` passes `tsc`. `--strict` gives 2,113 errors, 1,857 of them
  "JSX element implicitly has type any" (TS7026), which the two type packages remove.
- Leftovers from the template: `experimentalDecorators`, `useDefineForClassFields:
  false`, `allowJs`, an unused `@` alias to the root, `metadata.json`.
- No tests and no ESLint (though the code has `eslint-disable` comments); `lint` is
  `tsc`.
- `vite` is in both dependencies and devDependencies, the build plugins are in
  dependencies, and `autoprefixer` is unused with Tailwind 4.
- The `vendor-react` chunk is 3.6 kB because `react-dom/client` is not matched, so
  react-dom lands in the 508 kB main chunk, and the chunk warning's limit was raised to
  hide it. `drop_console` strips `console.error` too, so production has no diagnostics.

*Do, in this order:* install the two type packages and fix what they find; move the
preset data into `src/presets/`; move the audio graph into `src/audio/` (the scanner, the
drone, the sequencer, the effects and the master bus, each building its own nodes and
exposing a small API); `strict` one directory at a time; a first test per audio module
through `OfflineAudioContext`, beginning with items 1, 3 and 5.

## 14. Features

*Proposed 2026-09-28.* Each fits what the app already is.

- **14a. Save and share a patch.** JSON import and export, `localStorage`, and a link
  that carries the patch, with the formulas run through a safe expression parser rather
  than `new Function` (item 2).
- **14b. Web MIDI.** CCs to the scan's speed, centre and scale and to the effects; a
  keyboard that sets the root and the scale; and the sixteen scan voices sent out as MIDI
  notes to a DAW, which makes the image a MIDI sequencer.
- **14c. Drawn scan paths.** Draw the path with a pointer or a finger (a spline made into
  a formula), several scan heads, and multi-touch on a phone.
- **14d. Colour to pitch.** Hue mapped to a pitch class on a chosen colour wheel
  (Scriabin's, for one), and palette regions found by k-means, each given a voice and a
  timbre.
- **14e. An offline bounce.** An image or a loop rendered through `OfflineAudioContext`
  to WAV faster than real time and the same every time, beside honest WebM and MP4
  capture (item 9).
- **14f. Tempo.** Tap tempo, MIDI clock in and out, and the scan's loop locked to N
  bars, on item 7's scheduler.
- **14g. A mixer per module.** Meters, solo and mute for the scanner, the drone and the
  sequencer, and stems recorded apart.
- **14h. Installable and offline.** It needs no server, so a PWA with its build
  precached plays anywhere.

## Beside ChromaGlass

ChromaGlass (`jstevoh/chromaglass`) is this app's successor for the picture: its drone,
`src/lib/plateDrone.ts`, says it was "lifted in spirit from Chromesthesia". No code is
shared. Three of its modules would fix items here if copied across: `plateDrone.ts`
(typed parameters, glides, no clipper) for items 5 and 6, `midi.ts` (bindings and soft
takeover) for 14b, and its WebM and MP4 muxers for item 9. In the other direction,
this app's sixteen-point scanner could become a ChromaGlass sound source that plays the
plate.
