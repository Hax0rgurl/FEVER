import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import * as img from "./assets";
import {
  ABOUT, BOOK_COPY, BOOK_URL, CHARACTERS, CREED, MAIN_CAST, PALETTE, SECTIONS,
  SEASON_ONE_A, SEASON_ONE_B, SEASON_TWO_A, SEASON_TWO_B, SETTING_LINES, STATEMENT,
  SUPPORTING_1, SUPPORTING_2, type Ep,
} from "./data";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.42'/%3E%3C/svg%3E\")";

const FACES: Record<string, string> = {
  manny: img.face_manny, frankie: img.face_frankie, hector: img.face_hector,
  marcello: img.face_marcello, diego: img.face_diego, xolo: img.face_xolo,
  jose: img.face_jose, vanessa: img.face_vanessa, jenny: img.face_jenny,
  ivan: img.face_ivan, mendoza: img.face_mendoza, pino: img.face_pino,
  fmom: img.face_fmom, fgrand: img.face_fgrand, kiera: img.face_kiera,
};

const ACCENT: Record<string, string> = {
  ember: "var(--ember)", amber: "var(--amber)", teal: "var(--teal)",
  rose: "var(--rose)", sand: "var(--sand)",
};

/* ---------- shells ---------- */

function Section({
  i, className = "", children, style,
}: { i: number; className?: string; children: ReactNode; style?: CSSProperties }) {
  const s = SECTIONS[i];
  return (
    <section
      id={s.id}
      className={`sec ${className}`}
      style={{ ...(style ?? {}), ["--accent" as never]: ACCENT[s.accent] }}
    >
      <div className="sec__tag">
        <b>{String(i + 1).padStart(2, "0")}</b>
        <span>{s.label}</span>
        <hr />
        <span>Fever · Limited Series</span>
      </div>
      {children}
    </section>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`rv ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Frame({ src, cap, duo = false }: { src: string; cap: string; duo?: boolean }) {
  return (
    <figure className={`photo-frame ${duo ? "duo" : ""}`} style={{ margin: 0 }}>
      <img src={src} alt={cap} />
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

function Avatar({ k, size = "md", ring }: { k: string; size?: "md" | "lg"; ring?: string }) {
  return (
    <div className={`avatar avatar--${size}`} style={{ ["--ring" as never]: ring ?? "var(--line)" }}>
      <img src={FACES[k]} alt="" />
    </div>
  );
}

function Episodes({ eps, accent }: { eps: Ep[]; accent: string }) {
  return (
    <div className="eps__list">
      {eps.map((e, n) => (
        <Reveal key={e.n} delay={n * 70} className="ep">
          <div className="ep__n" style={{ ["--accent" as never]: accent }}>
            {String(e.n).padStart(2, "0")}
          </div>
          <div>
            <h3 className="ep__t">{e.title}</h3>
            <p className="ep__b">{e.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* ---------- app ---------- */

export default function App() {
  const deckRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const [index, setIndex] = useState(false);

  const goto = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(SECTIONS.length - 1, i));
    document.getElementById(SECTIONS[clamped].id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    setIndex(false);
  }, []);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const onScroll = () => {
      const max = deck.scrollHeight - deck.clientHeight;
      setPct(max > 0 ? (deck.scrollTop / max) * 100 : 0);
      const mid = deck.scrollTop + deck.clientHeight * 0.4;
      let cur = 0;
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= mid) cur = i;
      });
      setActive(cur);
    };
    onScroll();
    deck.addEventListener("scroll", onScroll, { passive: true });
    return () => deck.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setIndex(false);
      if (e.key.toLowerCase() === "g") return setIndex((v) => !v);
      if (index) return;
      const next = ["ArrowDown", "ArrowRight", "PageDown", " "];
      const prev = ["ArrowUp", "ArrowLeft", "PageUp"];
      if (next.includes(e.key)) { e.preventDefault(); goto(active + 1); }
      else if (prev.includes(e.key)) { e.preventDefault(); goto(active - 1); }
      else if (e.key === "Home") { e.preventDefault(); goto(0); }
      else if (e.key === "End") { e.preventDefault(); goto(SECTIONS.length - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goto, index]);

  // 12-column x 3-row mosaic; each row sums to 12.
  const gallery = useMemo(
    () => [
      { src: img.crew, cap: "Fever Crew", col: 4, row: 2 },
      { src: img.tex_dj, cap: "Decks · analog", col: 5 },
      { src: img.girls, cap: "Front room", col: 3, row: 2 },
      { src: img.tex_floor, cap: "Checkerboard", col: 3 },
      { src: img.crowd5, cap: "After hours", col: 2 },
      { src: img.foam, cap: "Foam night", col: 3 },
      { src: img.tex_pile, cap: "Chill-out", col: 3 },
      { src: img.pervert, cap: "Fever Crew", col: 3 },
      { src: img.cosmos, cap: "Cosmos II · Orlando · 3.2.96", col: 3 },
    ],
    [],
  );

  return (
    <>
      <div className="grain" style={{ ["--noise" as never]: NOISE }} />
      <div className="vignette" />
      <div className="progress" style={{ width: `${pct}%` }} />

      <nav className="rail" aria-label="Slides">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goto(i)} aria-current={i === active} aria-label={s.label}>
            <i />
            <span>{String(i + 1).padStart(2, "0")} — {s.label}</span>
          </button>
        ))}
      </nav>

      <div className="hud">
        <button onClick={() => goto(active - 1)} disabled={active === 0} aria-label="Previous">←</button>
        <button className="hud__count" onClick={() => setIndex(true)} aria-label="All slides">
          <b>{String(active + 1).padStart(2, "0")}</b> / {SECTIONS.length}
        </button>
        <button onClick={() => goto(active + 1)} disabled={active === SECTIONS.length - 1} aria-label="Next">→</button>
      </div>

      {index && (
        <div className="index" role="dialog" aria-label="All slides">
          <div className="index__head">
            <span>Fever — {SECTIONS.length} slides</span>
            <button onClick={() => setIndex(false)}>Close ✕</button>
          </div>
          <div className="index__grid">
            {SECTIONS.map((s, i) => (
              <button key={s.id} className="index__card" onClick={() => goto(i)} aria-current={i === active}>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="deck" ref={deckRef}>
        {/* 01 — COVER */}
        <Section i={0} className="cover">
          <div className="heat cover__heat" />
          <div className="cover__scan" />
          <div className="cover__grid">
            <div>
              <h1 className="wordmark">Fever</h1>
              <div className="cover__rule">
                <span>Miami</span><span>·</span><span>1994 — 1997</span><span>·</span><span>Limited Series</span>
              </div>
              <p className="cover__tag">
                <span>Back in the day,</span>
                <span>the rave scene was beautiful…</span>
                <i>until things got out of hand.</i>
              </p>
              <div className="cover__meta">
                <span>2 Seasons</span><span>16 Episodes</span><span>Crime · Coming-of-Age</span>
              </div>
            </div>
            <div className="cover__art">
              <img src={img.book_front} alt="Fever — original book cover" />
            </div>
          </div>
          <div className="scrollcue">Scroll · or press G for all slides</div>
        </Section>

        {/* 02 — SETTING */}
        <Section i={1}>
          <div className="setting__grid">
            <div>
              <Reveal>
                <h2 className="setting__year">Miami,<br /><b>1994—1997</b></h2>
              </Reveal>
              <div className="setting__list" role="list">
                {SETTING_LINES.map((l, i) => (
                  <Reveal key={l} delay={i * 80} className="row">
                    <em>{String(i + 1).padStart(2, "0")}</em>
                    <span>{l}</span>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal delay={160}>
              <Frame src={img.warsaw} cap="Warsaw Ballroom · Miami Beach" />
            </Reveal>
          </div>
        </Section>

        {/* 03 — STATEMENT */}
        <Section i={2} className="creed">
          <div className="statement">
            {STATEMENT.map((l, i) => (
              <Reveal key={l} delay={i * 120} className="statement__row">
                <span>
                  {l.split("*").map((part, n) =>
                    n % 2 ? <em key={n}>{part}</em> : part,
                  )}
                </span>
              </Reveal>
            ))}
          </div>
          <div className="creed__lines">
            {CREED.map((l, i) => (
              <Reveal key={l} delay={420 + i * 110} className="line">
                <span>{l}</span>
                <span>{String(i + 1).padStart(2, "0")}</span>
              </Reveal>
            ))}
          </div>
          <Reveal delay={760}>
            <p className="creed__post">
              For first-generation Cuban-American youth, these nights are not rebellion —
              they are <i>reinvention</i>.
            </p>
          </Reveal>
        </Section>

        {/* 04 — ABOUT */}
        <Section i={3}>
          <h2 className="h2">About Fever</h2>
          <div className="about__grid">
            <Reveal className="about__art">
              <img src={img.flyer_wall} alt="Fever flyer wall, mid-1990s" />
            </Reveal>
            <div className="about__blocks">
              {ABOUT.map((p, i) => (
                <Reveal key={i} delay={i * 90}>
                  <p data-n={String(i + 1).padStart(2, "0")}>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* 05 — LOGLINE */}
        <Section i={4} className="logline">
          <div className="logline__bg"><img src={img.crew} alt="" /></div>
          <div className="logline__wash" />
          <Reveal>
            <p className="kicker">Logline</p>
            <h2>Before it burned down Miami, <i>it burned through them.</i></h2>
          </Reveal>
        </Section>

        {/* 06 — PITCH */}
        <Section i={5}>
          <h2 className="h2">The Pitch</h2>
          <Reveal>
            <p className="lede pitch__intro">
              The series unfolds in two seasons of movement.
            </p>
          </Reveal>
          <div className="pitch__grid">
            <Reveal>
              <div className="season season--rise">
                <div className="season__no">Season One</div>
                <h3 className="season__name">The Rise</h3>
                <div className="season__eps">Episodes 1 — 8</div>
                <div className="season__keys">
                  {["Music", "Brotherhood", "Identity", "Power"].map((k) => <span key={k}>{k}</span>)}
                </div>
              </div>
            </Reveal>
            <Reveal delay={110}>
              <div className="season season--fall">
                <div className="season__no">Season Two</div>
                <h3 className="season__name">The Fall</h3>
                <div className="season__eps">Episodes 9 — 16</div>
                <div className="season__keys">
                  {["Paranoia", "Betrayal", "Consequence", "Silence"].map((k) => <span key={k}>{k}</span>)}
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* 07–10 — EPISODES */}
        {([
          [6, "Season One · The Ascent", "Episodes 1 — 4", SEASON_ONE_A, img.warsaw, "Warsaw Ballroom", "var(--amber)"],
          [7, "Season One · The Ascent", "Episodes 5 — 8", SEASON_ONE_B, img.warsaw, "Warsaw Ballroom", "var(--amber)"],
          [8, "Season Two · The Descent", "Episodes 9 — 12", SEASON_TWO_A, img.flyer_feb24, "Fever · Friday, February 24", "var(--teal)"],
          [9, "Season Two · The Descent", "Episodes 13 — 16", SEASON_TWO_B, img.flyer_feb24, "Fever · Friday, February 24", "var(--teal)"],
        ] as const).map(([i, title, eps, list, art, cap, accent]) => (
          <Section key={i} i={i}>
            <div className="eps__grid">
              <Reveal className="eps__art">
                <Frame src={art} cap={cap} />
              </Reveal>
              <div>
                <div className="eps__head">
                  <p className="kicker" style={{ color: accent }}>{eps}</p>
                  <h2 className="h2" style={{ marginBottom: 0 }}>{title}</h2>
                </div>
                <Episodes eps={list} accent={accent} />
              </div>
            </div>
          </Section>
        ))}

        {/* 11 — CHARACTERS */}
        <Section i={10}>
          <h2 className="h2">Main Characters — Fever Crew</h2>
          <div className="chars">
            {CHARACTERS.map((c, i) => (
              <Reveal key={c.key} delay={i * 100} className="char">
                <div className="char__top">
                  <Avatar k={c.key} size="lg" ring="var(--ember)" />
                  <div>
                    <h3 className="char__name">{c.name}</h3>
                    <div className="char__role">{c.role}</div>
                  </div>
                </div>
                <p className="char__body">{c.body}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 12 — MAIN CAST */}
        <Section i={11}>
          <h2 className="h2">Desired Main Cast</h2>
          <div className="cast cast--3">
            {MAIN_CAST.map((c, i) => (
              <Reveal key={c.key} delay={i * 100} className="cast__card">
                <Avatar k={c.key} size="lg" ring="var(--rose)" />
                <p className="cast__actor--big">{c.actor}</p>
                <p className="cast__actor">{c.role}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 13 — SUPPORTING */}
        <Section i={12}>
          <h2 className="h2">Desired Supporting Cast</h2>
          <div className="cast cast--6">
            {SUPPORTING_1.map((c, i) => (
              <Reveal key={c.key} delay={i * 70} className="cast__card">
                <Avatar k={c.key} ring="var(--rose)" />
                <h3 className="cast__role">{c.role}</h3>
                <p className="cast__actor">{c.actor}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 14 — SUPPORTING II */}
        <Section i={13}>
          <h2 className="h2">Desired Supporting Cast <span style={{ color: "var(--dimmer)" }}>(cont.)</span></h2>
          <div className="cast cast--3">
            {SUPPORTING_2.map((c, i) => (
              <Reveal key={c.key} delay={i * 90} className="cast__card">
                <Avatar k={c.key} size="lg" ring="var(--rose)" />
                <h3 className="cast__role">{c.role}</h3>
                <p className="cast__actor">{c.actor}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* 15 — BOOK */}
        <Section i={14}>
          <h2 className="h2">The Published Book</h2>
          <div className="book__grid">
            <Reveal>
              <div className="book__covers">
                <img src={img.book_front} alt="Fever — front cover" />
                <img src={img.book_back} alt="Fever — back cover" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="book__copy">
                {BOOK_COPY.map((p, i) => <p key={i}>{p}</p>)}
                <a className="book__link" href={BOOK_URL} target="_blank" rel="noreferrer">
                  Read it on Amazon ↗
                </a>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* 16 — PHOTOS */}
        <Section i={15}>
          <h2 className="h2">Photos</h2>
          <div className="gallery">
            {gallery.map((g, i) => (
              <figure
                key={i}
                style={{ gridColumn: `span ${g.col}`, gridRow: g.row ? `span ${g.row}` : undefined }}
              >
                <img src={g.src} alt={g.cap} />
              </figure>
            ))}
          </div>
          <p className="gallery__note">Archive · Miami · 1994—1997</p>
        </Section>

        {/* 17 — MOOD */}
        <Section i={16}>
          <h2 className="h2">Mood Board — Colour</h2>
          <div className="mood__grid">
            <Reveal>
              <img src={img.moodboard} alt="Mood board" />
            </Reveal>
            <Reveal delay={120}>
              <div className="swatches">
                {PALETTE.map((p) => (
                  <div key={p.hex} className="swatch">
                    <i style={{ background: p.hex }} />
                    <div>
                      <b>{p.name}</b>
                      <small>{p.hex}</small>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Section>

        {/* 18 — NIGHTLIFE */}
        <Section i={17}>
          <h2 className="h2">Miami Nightlife — 1995</h2>
          <div className="night__grid">
            <Reveal>
              <div>
                <p className="lede" style={{ marginBottom: "1.4rem" }}>
                  Neon, chrome and salt air. The look of the show lives between the
                  Deco strip and the warehouse floor.
                </p>
                <Frame src={img.clipping} cap="Miami Herald · the other side of the night" />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <img src={img.nightlife95} alt="Miami nightlife aesthetics, 1995" />
            </Reveal>
          </div>
        </Section>

        {/* 19 — CLOSE */}
        <Section i={18}>
          <div className="close__grid">
            <div>
              <Reveal>
                <p className="kicker">Can't Stop Fever</p>
                <blockquote className="quote">
                  “They used to say that for every hour spent at a Fever party,
                  you took a day off your life. <span>For many, the trade-off was worth it.</span>”
                </blockquote>
                <div className="quote__by">— Humberto Guida</div>
              </Reveal>
              <Reveal delay={200}>
                <div className="endcard">
                  <span>Fever</span><span>2 Seasons · 16 Episodes</span><span>Miami 1994—1997</span>
                </div>
              </Reveal>
            </div>
            <Reveal delay={140} className="close__sign">
              <img src={img.stopsign} alt="Can't Stop Fever" />
            </Reveal>
          </div>
        </Section>
      </div>
    </>
  );
}
