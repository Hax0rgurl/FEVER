/* FEVER — bottom bar player (entrance + deck)
 *
 * Self-hosted audio. No YouTube, no ads, no third-party player, nothing
 * to clear. Plays "Artist - Music Name" in numbered order, 01 → 16.
 *
 * Two behaviours are deliberate and worth not undoing:
 *
 *  1. It never starts on its own. An earlier YouTube-backed build auto-
 *     resumed from sessionStorage on load, which meant every open tab and
 *     every reload layered another song on top of the last one. Playback
 *     begins on a click, full stop.
 *
 *  2. A BroadcastChannel lock keeps exactly one tab audible. If a second
 *     tab starts playing, the first pauses itself.
 *
 * Position carries from the entrance into the deck via sessionStorage, so
 * pressing play on the deck picks the track back up where it left off.
 */
(function () {
  var TRACKS = window.FEVER_TRACKS || [];
  var DIR = window.FEVER_AUDIO_DIR || 'music/audio/';
  if (!TRACKS.length) return;

  var K = { on: 'fever.music.on', idx: 'fever.music.idx', t: 'fever.music.t' };
  var idx = parseInt(sessionStorage.getItem(K.idx) || '0', 10) || 0;
  if (idx < 0 || idx >= TRACKS.length) idx = 0;
  var seeking = false;

  /* ---------- chrome ---------- */
  var css = document.createElement('style');
  css.textContent = [
    ':root{--fvbar:56px}',
    '#fv-bar{position:fixed;left:0;right:0;bottom:0;height:var(--fvbar);z-index:2147483000;',
    'display:flex;align-items:center;gap:clamp(.5rem,1.4vw,1.1rem);',
    'padding:0 clamp(.6rem,1.8vw,1.3rem);',
    'background:rgba(6,5,7,.92);backdrop-filter:blur(10px);',
    'border-top:1px solid rgba(239,233,222,.16);',
    'font-family:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;',
    'color:#efe9de;transform:translateY(100%);transition:transform .45s cubic-bezier(.2,.7,.2,1)}',
    '#fv-bar.up{transform:none}',

    '.fv-b{appearance:none;background:none;border:0;color:#efe9de;cursor:pointer;',
    'padding:.4rem;line-height:0;flex:none;transition:color .15s;opacity:.85}',
    '.fv-b:hover{color:#ff3b14;opacity:1}',
    '.fv-b svg{width:15px;height:15px;display:block;fill:currentColor}',
    '#fv-play svg{width:20px;height:20px}',

    '#fv-id{flex:none;font-size:.62rem;letter-spacing:.18em;color:#ff3b14;',
    'min-width:3.4em;text-align:right}',
    '#fv-name{flex:1 1 auto;min-width:0;font-size:.64rem;letter-spacing:.1em;',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgba(239,233,222,.92)}',

    '#fv-seek{flex:2 1 260px;min-width:90px;display:flex;align-items:center;gap:.6rem}',
    '#fv-rail{position:relative;flex:1;height:16px;display:flex;align-items:center;cursor:pointer}',
    '#fv-rail::before{content:"";position:absolute;left:0;right:0;height:2px;',
    'background:rgba(239,233,222,.2)}',
    '#fv-fill{position:relative;height:2px;width:0;background:#ff3b14;pointer-events:none}',
    '#fv-fill::after{content:"";position:absolute;right:-3px;top:-2px;width:6px;height:6px;',
    'background:#ff3b14;opacity:0;transition:opacity .15s}',
    '#fv-rail:hover #fv-fill::after{opacity:1}',
    '#fv-time{flex:none;font-size:.56rem;letter-spacing:.1em;color:rgba(239,233,222,.45);',
    'font-variant-numeric:tabular-nums;min-width:8.4em;text-align:right}',

    '#fv-vol{flex:none;display:flex;align-items:center;gap:.4rem}',
    '#fv-vol input{width:64px;accent-color:#ff3b14;height:2px;cursor:pointer}',
    '@media (max-width:900px){#fv-vol,#fv-name{display:none}}',
    '@media (max-width:560px){#fv-time{min-width:0;font-size:.5rem}}',

    /* make room so nothing sits under the bar */
    '#fv-bar.up ~ * .hud, body.fv-on .hud{bottom:calc(var(--fvbar) + 14px) !important}',
    'body.fv-on .foot{padding-bottom:calc(var(--fvbar) - 10px)}',
    'body.fv-on .scrollcue{bottom:calc(var(--fvbar) + 12px)}',
    'body.fv-on .deck{height:calc(100svh - var(--fvbar))}',
    'body.fv-on .sec{min-height:calc(100svh - var(--fvbar))}',
    '@media print{#fv-bar{display:none}body.fv-on .deck,body.fv-on .sec{height:auto;min-height:auto}}'
  ].join('');
  document.head.appendChild(css);

  var ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M7 5h2v14H7zM20 5v14L9.5 12z"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M15 5h2v14h-2zM4 5l10.5 7L4 19z"/></svg>',
    spk: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/></svg>'
  };

  var bar = document.createElement('div');
  bar.id = 'fv-bar';
  bar.innerHTML =
    '<button class="fv-b" id="fv-prev" type="button" aria-label="Previous track">' + ICON.prev + '</button>' +
    '<button class="fv-b" id="fv-play" type="button" aria-label="Play">' + ICON.play + '</button>' +
    '<button class="fv-b" id="fv-next" type="button" aria-label="Next track">' + ICON.next + '</button>' +
    '<span id="fv-id">01</span>' +
    '<span id="fv-name">—</span>' +
    '<span id="fv-seek"><span id="fv-rail" role="slider" aria-label="Seek" tabindex="0">' +
      '<span id="fv-fill"></span></span><span id="fv-time">0:00 / 0:00</span></span>' +
    '<span id="fv-vol">' + ICON.spk +
      '<input type="range" min="0" max="100" value="80" aria-label="Volume"></span>';
  document.body.appendChild(bar);
  document.body.classList.add('fv-on');
  requestAnimationFrame(function () { bar.classList.add('up'); });

  var audio = new Audio();
  audio.preload = 'none';           // nothing downloads until someone presses play
  audio.volume = 0.8;

  var playBtn = bar.querySelector('#fv-play');
  var nameEl = bar.querySelector('#fv-name');
  var idEl = bar.querySelector('#fv-id');
  var fill = bar.querySelector('#fv-fill');
  var timeEl = bar.querySelector('#fv-time');
  var rail = bar.querySelector('#fv-rail');
  var vol = bar.querySelector('#fv-vol input');

  function fmt(s) {
    if (!isFinite(s) || s < 0) s = 0;
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  var pendingSeek = 0;
  var wantPlay = false;      // what the listener asked for, not what the element is doing

  function load(n, at) {
    idx = (n + TRACKS.length) % TRACKS.length;
    audio.src = DIR + TRACKS[idx].f;
    audio.preload = 'auto';
    // currentTime can't be set until duration is known, so hold it.
    pendingSeek = at || 0;
    idEl.textContent = String(idx + 1).padStart(2, '0');
    nameEl.textContent = TRACKS[idx].t;
    try { sessionStorage.setItem(K.idx, String(idx)); } catch (e) {}
    paint();
  }

  function paint() {
    // Show the *intent*, not the instantaneous element state. Changing src
    // pauses the element while the next file buffers; without this the button
    // flickers back to Play mid-skip and reads as a dead control.
    var playing = wantPlay || (!audio.paused && !audio.ended);
    playBtn.innerHTML = playing ? ICON.pause : ICON.play;
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    var d = audio.duration;
    if (!seeking) fill.style.width = (isFinite(d) && d ? (audio.currentTime / d) * 100 : 0) + '%';
    timeEl.textContent = fmt(audio.currentTime) + ' / ' + (isFinite(d) ? fmt(d) : '0:00');
    idEl.style.opacity = (wantPlay && audio.paused) ? '.45' : '1';   // buffering
  }

  /* ---------- one tab at a time ---------- */
  var ME = Math.random().toString(36).slice(2);
  var chan = null;
  try { chan = new BroadcastChannel('fever-music'); } catch (e) {}
  function claim() {
    try { localStorage.setItem('fever.music.owner', ME + ':' + Date.now()); } catch (e) {}
    if (chan) { try { chan.postMessage({ t: 'claim', id: ME }); } catch (e) {} }
  }
  function standDown() {
    wantPlay = false;
    audio.pause();
    try { sessionStorage.setItem(K.on, '0'); } catch (e) {}
    paint();
  }
  if (chan) {
    chan.onmessage = function (e) {
      if (e && e.data && e.data.t === 'claim' && e.data.id !== ME) standDown();
    };
  }
  window.addEventListener('storage', function (e) {
    if (e.key === 'fever.music.owner' && e.newValue && e.newValue.indexOf(ME + ':') !== 0) standDown();
  });

  /* ---------- controls ----------
   * Skipping swaps audio.src, which pauses the element while several MB of
   * the next file arrive. A single play() call at that moment can be rejected
   * ("interrupted by a new load request") and the track sits there silent.
   * So intent is tracked separately and re-asserted every time the element
   * says it has enough data.
   */
  function attempt() {
    if (!wantPlay) return;
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* retried on canplay below */ });
  }

  function play() {
    wantPlay = true;
    claim();
    if (!audio.src) load(idx, parseFloat(sessionStorage.getItem(K.t) || '0') || 0);
    try { sessionStorage.setItem(K.on, '1'); } catch (e) {}
    attempt();
    paint();
  }

  function pause() {
    wantPlay = false;
    audio.pause();
    try { sessionStorage.setItem(K.on, '0'); } catch (e) {}
    paint();
  }

  ['canplay', 'loadeddata', 'canplaythrough'].forEach(function (ev) {
    audio.addEventListener(ev, function () { attempt(); paint(); });
  });
  audio.addEventListener('waiting', paint);
  audio.addEventListener('stalled', paint);

  playBtn.onclick = function () { if (wantPlay) pause(); else play(); };
  bar.querySelector('#fv-next').onclick = function () { load(idx + 1, 0); attempt(); paint(); };
  bar.querySelector('#fv-prev').onclick = function () {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }   // restart before skipping back
    load(idx - 1, 0); attempt(); paint();
  };

  // Seeking only lands if the browser can do byte-range requests AND knows the
  // duration. Guard on `seekable` so a drag on an unseekable stream doesn't
  // silently do nothing while the fill bar pretends otherwise.
  function canSeek() {
    return isFinite(audio.duration) && audio.duration > 0 &&
           audio.seekable && audio.seekable.length > 0;
  }
  function seekTo(ev) {
    var r = rail.getBoundingClientRect();
    var cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
    var x = Math.max(0, Math.min(1, (cx - r.left) / r.width));
    fill.style.width = x * 100 + '%';
    if (canSeek()) {
      try { audio.currentTime = x * audio.duration; } catch (e) {}
    }
  }
  rail.addEventListener('pointerdown', function (e) {
    seeking = true; seekTo(e);
    try { rail.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });
  rail.addEventListener('pointermove', function (e) { if (seeking) seekTo(e); });
  rail.addEventListener('pointerup', function (e) { if (seeking) { seekTo(e); seeking = false; attempt(); } });
  rail.addEventListener('pointercancel', function () { seeking = false; });
  rail.addEventListener('keydown', function (e) {
    if (!isFinite(audio.duration)) return;
    if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
  });

  vol.oninput = function () { audio.volume = vol.value / 100; };

  audio.addEventListener('timeupdate', function () {
    paint();
    try { sessionStorage.setItem(K.t, String(audio.currentTime || 0)); } catch (e) {}
  });
  audio.addEventListener('loadedmetadata', function () {
    if (pendingSeek > 0 && isFinite(audio.duration)) {
      try { audio.currentTime = Math.min(pendingSeek, Math.max(0, audio.duration - 1)); } catch (e) {}
    }
    pendingSeek = 0;
    paint();
  });
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);
  // A missing or unplayable file steps to the next rather than stalling.
  audio.addEventListener('error', function () { if (audio.src) { load(idx + 1, 0); attempt(); } });
  audio.addEventListener('ended', function () { load(idx + 1, 0); wantPlay = true; attempt(); paint(); });

  // Space toggles playback, unless the deck is using it to advance a slide
  // or the user is typing in a field.
  window.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.code !== 'Space') return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (document.querySelector('.deck')) return;      // deck already owns Space
    e.preventDefault();
    playBtn.onclick();
  });

  idEl.textContent = String(idx + 1).padStart(2, '0');
  nameEl.textContent = TRACKS[idx].t;
  paint();

  // Carry playback across entrance → deck, so the music doesn't stop at the
  // door. Only ever when the listener explicitly started it earlier in this
  // session — never on a cold load — and the tab lock still guarantees one
  // audible tab. If the browser declines the autoplay, the bar just shows
  // Play and nothing is lost.
  if (sessionStorage.getItem(K.on) === '1') {
    load(idx, parseFloat(sessionStorage.getItem(K.t) || '0') || 0);
    wantPlay = true;
    claim();
    attempt();
    paint();
  }

  // Diagnostic handle. Cheap to keep, and the alternative is being unable to
  // inspect the element at all when something misbehaves in the wild.
  window.FEVER_PLAYER = {
    audio: audio,
    next: function () { load(idx + 1, 0); attempt(); paint(); },
    state: function () {
      return {
        track: idx + 1, src: (audio.src || '').split('/').pop(),
        wantPlay: wantPlay, paused: audio.paused,
        currentTime: +audio.currentTime.toFixed(2),
        duration: isFinite(audio.duration) ? +audio.duration.toFixed(2) : null,
        readyState: audio.readyState, networkState: audio.networkState,
        seekableRanges: audio.seekable ? audio.seekable.length : 0,
        buffered: audio.buffered && audio.buffered.length
          ? +audio.buffered.end(audio.buffered.length - 1).toFixed(1) : 0,
        error: audio.error ? audio.error.code : null
      };
    }
  };
})();
