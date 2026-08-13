# FEVER — Pitch Deck

A limited series. Miami, 1994–1997.

**Live:** https://hax0rgurl.github.io/FEVER/ — entrance
**Deck:** https://hax0rgurl.github.io/FEVER/deck.html — the 19 slides

All 19 slides as a single self-contained web page. Every image, style and script is
inlined — the page makes **zero network requests**, so it works from a web server, a
USB stick, or a double-clicked file with no internet at all.

---

## Viewing

| | |
|---|---|
| `←` `→` `↑` `↓` `space` | previous / next slide |
| `G` | index of all 19 slides |
| `Home` / `End` | first / last slide |
| `Esc` | close the index |

Scroll works too. Responsive down to phones, and **⌘P prints one slide per page**
if you need a PDF.

## Deck contents

1. Cover · 2. The Setting · 3. Pre-Social Media · 4. About Fever · 5. Logline ·
6. The Pitch · 7–8. Season One: The Ascent (Ep 1–8) · 9–10. Season Two: The Descent
(Ep 9–16) · 11. Main Characters — Fever Crew · 12. Desired Main Cast ·
13–14. Desired Supporting Cast · 15. The Published Book · 16. Photos ·
17. Mood Board — Colour · 18. Miami Nightlife 1995 · 19. Can't Stop Fever

## The entrance video slots

`index.html` cycles four full-bleed clips behind the wordmark, crossfading
between them. Drop files in and they just work — nothing to wire up. To add a
fifth, copy one `.bg` block in `index.html`; the tick indicators count
themselves.

```
video/01.mp4   +  video/01.jpg   ← poster, shown before the clip paints
video/02.mp4   +  video/02.jpg
video/03.mp4   +  video/03.jpg
video/04.mp4   +  video/04.jpg
```

**Spec**

| | |
|---|---|
| Container | `.mp4`, H.264, `yuv420p`, `+faststart` |
| Size | **1920×1080** (16:9). Anything else is cropped to fill. |
| Duration | **5s.** The page reads each clip's real duration and holds for it, so other lengths work — 5s just gives the even cadence. |
| Audio | none needed; the videos play muted |
| Loop | seamless is nicer but not required — the crossfade covers the seam |

A **missing clip silently falls back to its poster** and keeps cycling, so the
page never looks broken while you're still generating. That's why `02` and `03`
ship as stills.

Footage is graded in-page (`saturate(.72) contrast(1.08) brightness(.82)`) so it
sits behind the type — render clips brighter than you want them to look.

Current state — all four are below 1080p, so they soften when blown up
full-bleed; worth re-rendering at 1920×1080 when convenient:

| | | |
|---|---|---|
| `01` | Runway Gen-3, 960×576 | 10.5s |
| `02` | Magnific i2v, 864×496 | 5.0s |
| `03` | Magnific i2v, 864×496 | 5.0s |
| `04` | montage, 864×496 | 10.0s |

Generated audio tracks are stripped from all of them — the clips play muted
and the score comes from the bar player.

To re-encode anything to spec:

```bash
ffmpeg -i in.mov -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" \
  -an -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -movflags +faststart video/01.mp4
ffmpeg -y -ss 2 -i video/01.mp4 -frames:v 1 -q:v 6 video/01.jpg
```

## Music

A bar player pinned to the bottom of both the entrance and the deck.
**"Anything to Anything" — 16 original tracks, 1h41m, played in numbered
order.** Self-hosted, so there are no ads, no third-party player, and
nothing to clear.

```
music/audio/01.mp3 … 16.mp3   the tracks (your MP3s, copied, not re-encoded)
music/tracks.js               order + titles — edit this
music/player.js               the bar
```

Titles in `tracks.js` are placeholders (`Anything to Anything · I …`).
Drop the real ones in; nothing else needs to change.

**Behaviour worth not undoing:**

*It never starts on a cold load.* An earlier YouTube-backed build auto-
resumed from `sessionStorage` on every page load, which meant each open tab
and each reload layered another song on top of the last. Playback now begins
on a click. It *does* carry from the entrance into the deck — but only when
the listener already pressed play in that session, so the music doesn't stop
at the door.

*One tab at a time.* A `BroadcastChannel` lock means a second tab starting
playback pauses the first.

*Nothing downloads until play is pressed* (`preload="none"`), so the entrance
stays fast for anyone who never turns the sound on.

The bar reserves 56px at the bottom; the deck's slide height and its HUD are
offset to match, so no slide is ever cut off.

### Why not YouTube

An earlier version streamed a period playlist through YouTube's embed. It
worked — full tracks, driven by explicit video IDs because the `list=`
parameter refuses to embed — but those uploads are monetised, so **ads played
over the cover slide**, and no player parameter disables that. Original music
removes the problem entirely.

## Editing

`index.html` at the repo root is the built artifact — don't hand-edit it, it's
one 1.9 MB line of bundled JavaScript. Edit the source instead:

```
source/src/data.ts     all deck copy — episodes, characters, cast, palette
source/src/App.tsx     slide layout and order
source/src/index.css   the design system (type, colour, texture, chrome)
source/src/assets.ts   every image, base64-encoded (generated)
```

To rebuild:

```bash
cd source
npm install
npm run dev          # live preview at localhost:5173
npx parcel build index.html --no-source-maps --dist-dir dist
npx html-inline -i dist/index.html > ../index.html
```

## Notes on the copy

Transcribed from the original 19-slide deck. Two typos were corrected —
"ephiphany" → epiphany (Ep 2) and "think abou" → about (Ep 3). One inconsistency
was left intact because it exists in the source: the book's back cover says a Fever
hour cost you *"a week off of your life"*, while the closing Humberto Guida quote
says *"a day off your life."*

Photography in the Photos slide is a mix of deck material and period placeholders;
swap entries in the `gallery` array in `App.tsx`.
