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

`index.html` cycles three full-bleed clips behind the wordmark, crossfading
between them. Drop files in and they just work — nothing to wire up.

```
video/01.mp4   +  video/01.jpg   ← poster, shown before the clip paints
video/02.mp4   +  video/02.jpg
video/03.mp4   +  video/03.jpg
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

Current state: `01.mp4` is a Runway Gen-3 clip (960×576, 24fps, 10.5s) built
from the foam-night photograph. It's below 1080p so it softens when blown up
full-bleed; worth re-rendering at 1920×1080 when convenient. `02` and `03` are
posters awaiting clips.

To re-encode anything to spec:

```bash
ffmpeg -i in.mov -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" \
  -an -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -movflags +faststart video/01.mp4
ffmpeg -y -ss 2 -i video/01.mp4 -frames:v 1 -q:v 6 video/01.jpg
```

## Music

A **Sound** button, bottom right of both the entrance and the deck. Eleven
tracks, ~74 minutes, in a fixed order — Seashell opens, always. No shuffle.

```
music/tracks.js   the set — edit this to change songs or order
music/player.js   the widget (shared by index.html and deck.html)
```

Three things about the implementation that are deliberate:

**Explicit video IDs, not `list=<playlistId>`.** The source playlist refuses to
embed — the player returns "This video is unavailable" — even though all 100
videos in it are public and play fine individually. Driving the player from an
array of IDs sidesteps that entirely, and means one rotted upload can't take
the whole set down.

**It never autoplays.** Music starts only when someone presses the button. An
earlier version resumed automatically from `sessionStorage`, which meant every
open tab and every reload layered another song on top of the last one. If a
previous page in the session had music running, the button reads **Resume** and
picks the track back up on click — but a human still has to click. A
`BroadcastChannel` lock backs this up: if a second tab starts playing, the first
stands down.

**The player stays visible.** YouTube's terms don't permit hiding the player and
using the audio alone. Since these uploads are static record-label shots, the
small frame reads as sleeve art rather than video.

Every track was verified playable on `https://hax0rgurl.github.io` — note that
the same check run against `http://127.0.0.1` reports spurious error 150s, so
test embedding on the real origin, not locally.

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
