/* FEVER — shared music widget (entrance + deck)
 *
 * Plays the RAVE DAYS 1993–96 playlist full-length through YouTube's IFrame
 * player. Two things to know about the implementation:
 *
 *  1. It is driven by an explicit array of video IDs, not `list=<playlistId>`.
 *     The playlist parameter fails to embed ("This video is unavailable")
 *     even though every video in it is public and playable on its own.
 *
 *  2. The player stays visible whenever audio is playing. YouTube's terms
 *     prohibit hiding the player to use it as an invisible audio bed, so the
 *     panel is small but never display:none while a track runs.
 *
 * State rides in sessionStorage so music survives the jump from the entrance
 * into the deck and resumes mid-track.
 */
(function () {
  var TRACKS = window.FEVER_TRACKS || [];
  if (!TRACKS.length) return;

  var K = { on: 'fever.music.on', order: 'fever.music.order', idx: 'fever.music.idx', t: 'fever.music.t' };
  var player = null, ready = false, order = [], idx = 0, saveTimer = null;
  // Music never starts on its own. If a previous page in this session had it
  // running, the button offers to pick the track back up — but a human still
  // has to press it. Auto-starting meant every open tab and every reload
  // layered another song on top of the last one.
  var pendingResume = false;

  /* ---------- order ----------
   * Deliberately not shuffled. The set is sequenced, and Seashell opens.
   */
  order = TRACKS.map(function (_, n) { return n; });
  idx = parseInt(sessionStorage.getItem(K.idx) || '0', 10) || 0;
  if (idx < 0 || idx >= order.length) idx = 0;

  /* ---------- chrome ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '#fv-music{position:fixed;right:14px;bottom:14px;z-index:2147483000;',
    'font-family:ui-monospace,"SF Mono",SFMono-Regular,Menlo,monospace;}',
    '#fv-btn{display:flex;align-items:center;gap:.6rem;cursor:pointer;appearance:none;',
    'background:rgba(8,7,10,.82);border:1px solid rgba(239,233,222,.42);color:#efe9de;',
    'font:inherit;font-size:.62rem;letter-spacing:.24em;text-transform:uppercase;',
    'padding:.62rem .9rem;backdrop-filter:blur(6px);transition:border-color .2s,color .2s,background .2s;}',
    '#fv-btn:hover{border-color:#ff3b14;color:#ff3b14}',
    '#fv-btn b{font-weight:400;letter-spacing:.24em}',
    '#fv-eq{display:inline-flex;align-items:flex-end;gap:2px;height:10px}',
    '#fv-eq i{width:2px;background:#ff3b14;height:3px;display:block}',
    '#fv-music.playing #fv-eq i{animation:fvbar .9s ease-in-out infinite}',
    '#fv-music.playing #fv-eq i:nth-child(2){animation-delay:.15s}',
    '#fv-music.playing #fv-eq i:nth-child(3){animation-delay:.3s}',
    '#fv-music.playing #fv-eq i:nth-child(4){animation-delay:.45s}',
    '@keyframes fvbar{0%,100%{height:3px}50%{height:10px}}',
    '#fv-panel{display:none;width:212px;background:rgba(8,7,10,.92);',
    'border:1px solid rgba(239,233,222,.24);backdrop-filter:blur(8px);margin-bottom:.5rem}',
    '#fv-music.open #fv-panel{display:block}',
    // The uploads are static label shots, so this reads as sleeve art rather
    // than video. It stays visible regardless — YouTube's terms do not allow
    // hiding the player and using the audio alone.
    '#fv-frame{width:212px;height:119px;display:block;background:#000}',
    '#fv-frame iframe{width:100%;height:100%;border:0;display:block}',
    '#fv-meta{padding:.55rem .65rem;border-top:1px solid rgba(239,233,222,.14)}',
    '#fv-title{font-size:.58rem;line-height:1.45;color:#efe9de;letter-spacing:.04em;',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#fv-sub{font-size:.5rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(239,233,222,.4);margin-top:.2rem}',
    '#fv-ctl{display:flex;gap:.3rem;padding:.4rem .5rem .5rem}',
    '#fv-ctl button{flex:1;cursor:pointer;appearance:none;background:none;color:#efe9de;',
    'border:1px solid rgba(239,233,222,.2);font:inherit;font-size:.55rem;letter-spacing:.14em;',
    'text-transform:uppercase;padding:.42rem .2rem;transition:border-color .15s,color .15s}',
    '#fv-ctl button:hover{border-color:#ff3b14;color:#ff3b14}',
    '@media (max-width:640px){#fv-panel,#fv-frame{width:180px}#fv-frame{height:101px}}',
    '@media print{#fv-music{display:none}}'
  ].join('');
  document.head.appendChild(css);

  var wrap = document.createElement('div');
  wrap.id = 'fv-music';
  wrap.innerHTML =
    '<div id="fv-panel">' +
      '<div id="fv-frame"><div id="fv-yt"></div></div>' +
      '<div id="fv-meta"><div id="fv-title">—</div>' +
      '<div id="fv-sub">Rave Days · Miami · 1993—1996</div></div>' +
      '<div id="fv-ctl">' +
        '<button type="button" data-a="prev">Prev</button>' +
        '<button type="button" data-a="toggle">Pause</button>' +
        '<button type="button" data-a="next">Next</button>' +
      '</div>' +
    '</div>' +
    '<button id="fv-btn" type="button">' +
      '<span id="fv-eq"><i></i><i></i><i></i><i></i></span><b>Sound</b>' +
    '</button>';
  document.body.appendChild(wrap);

  // The deck has its own bottom-right HUD (slide counter + arrows). Step it
  // aside so the two never stack. Injected unconditionally rather than behind
  // a querySelector guard: the deck renders its HUD with React, well after
  // this script runs, so the element is not there to detect yet. `.hud` only
  // exists on the deck, so the rule is inert on the entrance.
  var nudge = document.createElement('style');
  nudge.textContent =
    '@media (min-width:760px){.hud{right:246px !important}}' +
    '@media (max-width:759px){.hud{bottom:62px !important}}';
  document.head.appendChild(nudge);

  var btn = wrap.querySelector('#fv-btn');
  var label = wrap.querySelector('#fv-btn b');
  var titleEl = wrap.querySelector('#fv-title');
  var toggleBtn = wrap.querySelector('[data-a="toggle"]');

  function vid() { return TRACKS[order[idx % order.length]]; }

  function paint() {
    var t = vid();
    if (t) titleEl.textContent = t.t;
    var playing = false;
    try { playing = !!(player && player.getPlayerState && player.getPlayerState() === 1); } catch (e) {}
    wrap.classList.toggle('playing', playing);
    label.textContent = playing ? 'Playing'
      : wrap.classList.contains('open') ? 'Paused'
      : pendingResume ? 'Resume' : 'Sound';
    toggleBtn.textContent = playing ? 'Pause' : 'Play';
  }

  function persist() {
    try {
      sessionStorage.setItem(K.idx, String(idx));
      if (player && player.getCurrentTime) sessionStorage.setItem(K.t, String(player.getCurrentTime() || 0));
    } catch (e) {}
  }

  function go(n) {
    idx = (n + order.length) % order.length;
    try { sessionStorage.setItem(K.t, '0'); } catch (e) {}
    persist();
    if (ready) player.loadVideoById(vid().i);
    paint();
  }

  function build(startAt) {
    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player('fv-yt', {
        videoId: vid().i,
        playerVars: {
          origin: location.origin, autoplay: 1, playsinline: 1,
          rel: 0, modestbranding: 1, start: Math.floor(startAt || 0)
        },
        events: {
          onReady: function (e) { ready = true; e.target.playVideo(); paint(); },
          // A dead or embedding-disabled upload just advances. The playlist is
          // 30 years of other people's uploads; some will rot. Never stall.
          onError: function () { go(idx + 1); },
          onStateChange: function (e) {
            if (e.data === 0) go(idx + 1);     // ended
            paint();
          }
        }
      });
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
    clearInterval(saveTimer);
    saveTimer = setInterval(persist, 2000);
  }

  /* ---------- one tab at a time ----------
   * sessionStorage is copied into a tab opened from this one, and the resume
   * block below fires on every load — so without a lock, two open tabs means
   * two songs playing over each other. Whichever tab starts most recently
   * owns the audio; the others stand down.
   */
  var ME = Math.random().toString(36).slice(2);
  var chan = null;
  try { chan = new BroadcastChannel('fever-music'); } catch (e) {}

  function claim() {
    try { localStorage.setItem('fever.music.owner', ME + ':' + Date.now()); } catch (e) {}
    if (chan) { try { chan.postMessage({ t: 'claim', id: ME }); } catch (e) {} }
  }

  function standDown() {
    if (player && player.pauseVideo) { try { player.pauseVideo(); } catch (e) {} }
    wrap.classList.remove('open');
    try { sessionStorage.setItem(K.on, '0'); } catch (e) {}
    paint();
  }

  if (chan) {
    chan.onmessage = function (e) {
      if (e && e.data && e.data.t === 'claim' && e.data.id !== ME) standDown();
    };
  }
  // Safari and anything without BroadcastChannel still gets the storage event.
  window.addEventListener('storage', function (e) {
    if (e.key === 'fever.music.owner' && e.newValue && e.newValue.indexOf(ME + ':') !== 0) standDown();
  });

  function start(resumeAt) {
    claim();
    wrap.classList.add('open');
    try { sessionStorage.setItem(K.on, '1'); } catch (e) {}
    if (!player) build(resumeAt);
    else { player.playVideo(); }
    paint();
  }

  function stop() {
    try { sessionStorage.setItem(K.on, '0'); } catch (e) {}
    if (player && player.pauseVideo) player.pauseVideo();
    wrap.classList.remove('open');
    paint();
  }

  btn.addEventListener('click', function () {
    if (wrap.classList.contains('open')) { stop(); return; }
    var at = 0;
    if (pendingResume) {
      at = parseFloat(sessionStorage.getItem(K.t) || '0') || 0;
      pendingResume = false;
    }
    start(at);
  });

  wrap.querySelector('#fv-ctl').addEventListener('click', function (ev) {
    var a = ev.target.getAttribute && ev.target.getAttribute('data-a');
    if (!a || !ready) return;
    if (a === 'next') go(idx + 1);
    else if (a === 'prev') go(idx - 1);
    else if (a === 'toggle') {
      if (player.getPlayerState() === 1) player.pauseVideo(); else player.playVideo();
      setTimeout(paint, 120);
    }
  });

  window.addEventListener('pagehide', persist);
  window.addEventListener('beforeunload', persist);

  // Carry the music across the entrance → deck navigation, but never start it
  // unasked — the button just offers to pick up where the last page left off.
  pendingResume = sessionStorage.getItem(K.on) === '1' &&
                  (parseFloat(sessionStorage.getItem(K.t) || '0') || 0) > 1;
  paint();
})();
