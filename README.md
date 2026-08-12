# FEVER — Pitch Deck

A limited series. Miami, 1994–1997.

**Live:** https://hax0rgurl.github.io/FEVER/

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
