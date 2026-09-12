'use strict';
/* ══════════════════════════════════════════════════════════════
   A LITTLE UNIVERSE MADE FOR YOU — script.js
   Markup lives in index.html · styling lives in style.css

   ✏️  CUSTOMIZE EVERYTHING BELOW — her name, memories, captions,
       photos (images/ folder), the letter, and the final message.
   🎵  MUSIC: place birthday-music.mp3 in the sounds/ folder.
   ══════════════════════════════════════════════════════════════ */
const birthdayData = {

  // ✏️ HER NAME — used in scene 2 and the finale
  name: "My Bebi",

  // ✏️ MEMORIES — one per floating bubble.
  //    Plain strings work, or use { title, text, photo:"images/photo2.jpg" }
  memories: [
    "That moment when you made me laugh until I couldn't breathe...",
    "One of those days I never wanted to end...",
    "Another little moment I'll always keep with me."
  ],

  // ✏️ CAPTIONS — under each polaroid (cycles if there are fewer than photos)
  captions: [
    "A little memory ❤️",
    "One of my favorite days",
    "Forever worth remembering",
    "You, glowing",
    "Us ✨"
  ],

  // ✏️ PHOTOS — drop these files into the images/ folder
  photos: [
    "images/photo1.jpg",
    "images/photo2.jpg",
    "images/photo3.jpg",
    "images/photo4.jpg",
    "images/photo5.jpg"
  ],

  // ✏️ THE LETTER — each entry becomes a handwritten line
  letter: [
    "Happy Birthday, bebi. ❤️",
    "I hope today reminds you of just how special you are.",
    "You deserve moments that make you smile, people who appreciate you, and dreams that make you excited for tomorrow.",
    "Thank you for being part of my life and for making so many ordinary moments feel special.",
    "I hope this new chapter brings you countless reasons to smile.",
    "Happy Birthday. ❤️"
  ],

  // ✏️ FINAL HIDDEN MESSAGE — revealed by the "Tap me ❤️" button ({name} is replaced)
  finalMessage:
    "You mean more to me than I can put into words.\nHappy Birthday, {name}. ❤️"
};

/* ══════════════ tiny helpers ══════════════ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isNarrow = () => window.innerWidth < 700;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NAME = birthdayData.name;
const FINAL_MSG = birthdayData.finalMessage.replaceAll('{name}', NAME);

const TL = { // per-scene timeline of timeouts
  t: [], after(ms, fn) { this.t.push(setTimeout(fn, ms)); }, clear() { this.t.forEach(clearTimeout); this.t = []; }
};

const state = {
  scene: 1, visited: new Set([1]), candlesLeft: 5, celebrated: false,
  musicUnlocked: false, constDone: false, memOpened: new Set(), phOpened: new Set(),
  finaleDone: false, letterOpened: false
};

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ══════════════ STARFIELD (scene 1 birth, warp travel, ambient) ══════════════ */
const sky = (() => {
  const cv = $('#sky'), cx = cv.getContext('2d');
  let W, H, stars = [], warp = false, warpT = 0, warpCb = null, t0 = performance.now();
  const COLORS = ['#ffffff', '#ffffff', '#ffffff', '#ffd7ea', '#e2d6ff', '#ffe6c4'];
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars(0);
  }
  function birthTime(i) {
    if (i === 0) return 500;               // one tiny star...
    if (i === 1) return 1500;              // ...then another
    if (i < 26) return 2200 + (i - 2) * 95;     // then dozens, slowly
    return 4600 + Math.random() * 2400;     // the rest of the sky
  }
  function makeStars(allVisible) {
    const n = Math.min(300, Math.round(W * H / (REDUCED ? 15000 : 8500)));
    stars = Array.from({ length: n }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      z: .35 + Math.random() * .65, r: .5 + Math.random() * 1.4,
      ph: Math.random() * 6.283, ts: .5 + Math.random() * 1.6,
      c: pick(COLORS), birth: allVisible ? 0 : birthTime(i)
    }));
  }
  function startWarp(cb) {
    warp = true; warpT = 0; warpCb = cb;
    for (const s of stars) { s.dx = s.x - W / 2; s.dy = s.y - H / 2; s.pz = .2 + Math.random() * .9; }
    setTimeout(() => { warp = false; makeStars(true); cb && cb(); warpCb = null; }, REDUCED ? 450 : 1650);
  }
  let shoot = null;
  function frame(now, dt, px, py) {
    const t = now - t0;
    cx.clearRect(0, 0, W, H);
    if (warp) {
      warpT += dt;
      const sp = (REDUCED ? 2.4 : 1.15) * Math.min(1, warpT / 850);
      cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = 1;
      for (const s of stars) {
        const step = dt * 0.0011 * sp * (0.55 + 1.5 * (1 - Math.min(1, s.pz)));
        const npz = Math.max(.045, s.pz - step);
        const x1 = W / 2 + s.dx / s.pz, y1 = H / 2 + s.dy / s.pz;
        const x2 = W / 2 + s.dx / npz, y2 = H / 2 + s.dy / npz;
        s.pz = npz;
        if (s.pz <= .046) { s.dx = (Math.random() - .5) * W * 1.2; s.dy = (Math.random() - .5) * H * 1.2; s.pz = 1.15; continue; }
        cx.strokeStyle = s.c; cx.globalAlpha = clamp((1.15 - s.pz), 0, 1) * s.z;
        cx.lineWidth = s.z * 2.1;
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
      }
      cx.globalCompositeOperation = 'source-over';
      return;
    }
    // calm twinkling sky + pointer parallax
    for (const s of stars) {
      const ap = clamp((t - s.birth) / 900, 0, 1); if (ap <= 0) continue;
      const tw = .55 + .45 * Math.sin(t * .001 * s.ts + s.ph);
      cx.globalAlpha = s.z * tw * ap;
      cx.fillStyle = s.c;
      const ox = px * 15 * s.z, oy = py * 15 * s.z;
      cx.beginPath(); cx.arc(s.x + ox, s.y + oy, s.r, 0, 6.283); cx.fill();
      if (s.z > .86) { cx.globalAlpha *= .25; cx.beginPath(); cx.arc(s.x + ox, s.y + oy, s.r * 3.4, 0, 6.283); cx.fill(); }
    }
    cx.globalAlpha = 1;
    // occasional shooting star
    if (!shoot && Math.random() < dt / 11000 && !REDUCED)
      shoot = { x: W * .1 + Math.random() * W * .7, y: Math.random() * H * .35, vx: 8 + Math.random() * 5, vy: 2.5 + Math.random() * 2, life: 1 };
    if (shoot) {
      shoot.x += shoot.vx * dt * .06; shoot.y += shoot.vy * dt * .06; shoot.life -= dt / 750;
      if (shoot.life <= 0 || shoot.x > W + 60) shoot = null;
      else {
        const g = cx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9);
        g.addColorStop(0, `rgba(255,255,255,${.85 * shoot.life})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        cx.strokeStyle = g; cx.lineWidth = 1.6;
        cx.beginPath(); cx.moveTo(shoot.x, shoot.y); cx.lineTo(shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9); cx.stroke();
      }
    }
  }
  return { resize, frame, startWarp };
})();

/* ══════════════ FX CANVAS — bursts, confetti, fireworks ══════════════ */
const fx = (() => {
  const cv = $('#fx'), c = cv.getContext('2d');
  let W, H; const P = [];
  const CS = ['#ff9cc7', '#c3a6ff', '#ffd9a3', '#fff3e2', '#9be0ff'];
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function add(p) { if (P.length < 620) P.push(p); }
  function burst(x, y, o = {}) {
    const n = o.n || 24;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, sp = (o.sp || 3) * (.25 + Math.random());
      add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g ?? .05, dr: o.dr ?? .985,
        life: 1, dc: o.dc || (.012 + Math.random() * .02), sz: o.sz || (1.4 + Math.random() * 2.4),
        c: pick(o.cs || CS), sh: o.sh || 'dot', rot: Math.random() * 6.28, vr: (Math.random() - .5) * .25
      });
    }
  }
  function firework(x, y) {
    burst(x, y, { n: REDUCED ? 26 : 64, sp: 5.4, g: .045, dr: .975, dc: .011, sz: 2, cs: ['#ffd9a3', '#ff9cc7', '#fff3e2', '#c3a6ff'] });
    add({ x, y, vx: 0, vy: 0, life: 1, dc: .07, sz: 70, sh: 'flash', c: '#ffe6c4' });
  }
  function confetti(n) {
    for (let i = 0; i < n; i++)
      add({
        x: Math.random() * W, y: -20 - Math.random() * H * .3, vx: (Math.random() - .5) * 1.6, vy: 1.4 + Math.random() * 2.2,
        g: .028, dr: .996, dc: .0038, sz: 3.5 + Math.random() * 4, c: pick(CS), sh: 'rect', rot: Math.random() * 6.28,
        vr: (Math.random() - .5) * .3, fl: Math.random() * 6.28
      });
  }
  function heartBurst(x, y, n = 18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, sp = 1.2 + Math.random() * 2.6;
      add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, g: .03, dr: .988, life: 1, dc: .009,
        sz: 2.4 + Math.random() * 3, c: pick(['#ff9cc7', '#ff5fa2', '#ffd7ea']), sh: 'heart', rot: (Math.random() - .5) * .8, vr: (Math.random() - .5) * .06
      });
    }
  }
  function drawHeart(x, y, s, rot, col, a) {
    c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.fillStyle = col;
    c.beginPath();
    c.moveTo(0, s * .25);
    c.bezierCurveTo(0, 0, -s * .5, 0, -s * .5, s * .25);
    c.bezierCurveTo(-s * .5, s * .5, -s * .15, s * .7, 0, s);
    c.bezierCurveTo(s * .15, s * .7, s * .5, s * .5, s * .5, s * .25);
    c.bezierCurveTo(s * .5, 0, 0, 0, 0, s * .25);
    c.fill(); c.restore();
  }
  function frame(dt) {
    c.clearRect(0, 0, W, H);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.life -= p.dc; if (p.life <= 0) { P.splice(i, 1); continue; }
      p.vx *= p.dr; p.vy = p.vy * p.dr + p.g; p.x += p.vx; p.y += p.vy; p.rot += (p.vr || 0);
      if (p.sh === 'rect') p.x += Math.sin(p.life * 9 + p.fl) * .9;
      c.globalAlpha = clamp(p.life, 0, 1);
      if (p.sh === 'dot') {
        c.globalCompositeOperation = 'lighter'; c.fillStyle = p.c;
        c.beginPath(); c.arc(p.x, p.y, p.sz, 0, 6.283); c.fill();
        c.globalCompositeOperation = 'source-over';
      } else if (p.sh === 'rect') {
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.c;
        c.fillRect(-p.sz, -p.sz * .45, p.sz * 2, p.sz * .9); c.restore();
      } else if (p.sh === 'heart') {
        c.globalCompositeOperation = 'lighter';
        drawHeart(p.x, p.y, p.sz * 2.6, p.rot, p.c, clamp(p.life, 0, 1));
        c.globalCompositeOperation = 'source-over';
      } else if (p.sh === 'flash') {
        c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz);
        g.addColorStop(0, `rgba(255,240,210,${.5 * p.life})`); g.addColorStop(1, 'rgba(255,240,210,0)');
        c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, p.sz, 0, 6.283); c.fill();
        c.globalCompositeOperation = 'source-over';
      }
    }
    c.globalAlpha = 1;
  }
  return { resize, frame, burst, firework, confetti, heartBurst };
})();

/* ══════════════ parallax + main loop ══════════════ */
let tpx = 0, tpy = 0, px = 0, py = 0;
addEventListener('pointermove', e => { tpx = (e.clientX / innerWidth - .5) * 2; tpy = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
const depthEls = () => $$('[data-depth]');
function applyParallax() {
  for (const el of depthEls()) {
    const d = parseFloat(el.dataset.depth) || .1;
    const x = px * d * 70, y = py * d * 70;
    el.style.transform = el.dataset.center
      ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
      : `translate3d(${x}px,${y}px,0)`;
  }
}
let last = performance.now(), running = true;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(loop); } });
function loop(now) {
  if (!running) return;
  const dt = Math.min(50, now - last); last = now;
  px += (tpx - px) * .045; py += (tpy - py) * .045;
  sky.frame(now, dt, px, py);
  fx.frame(dt);
  if (!REDUCED) applyParallax();
  requestAnimationFrame(loop);
}

/* ══════════════ scene routing ══════════════ */
const scenes = $$('.scene');
const enterFns = { 1: enter1, 2: enter2, 3: enter3, 4: enter4, 5: enter5, 6: enter6, 7: enter7, 8: enter8 };
let enterTimer;
function showScene(n) {
  if (n === state.scene) return;
  TL.clear();
  const cur = scenes[state.scene - 1], nxt = scenes[n - 1];
  cur.classList.remove('active');
  nxt.classList.add('active');
  state.scene = n; state.visited.add(n);
  document.body.dataset.scene = n;
  $('#dots').classList.toggle('show', n >= 2);
  updateDots();
  clearTimeout(enterTimer);
  enterTimer = setTimeout(() => enterFns[n](), 380);
}
$$('[data-next]').forEach(b => b.addEventListener('click', () => showScene(+b.dataset.next)));
function showNext(n) { $('#next-' + n).classList.add('show'); }

/* dots navigation */
const DOT_NAMES = ['The Night Sky', 'Her Name', 'Little Moments', 'The Letter', 'The Constellation', 'The Cake', 'Photo Universe', 'The Finale'];
function buildDots() {
  const d = $('#dots');
  DOT_NAMES.forEach((name, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Scene ' + (i + 1) + ': ' + name);
    b.innerHTML = '<i></i>';
    b.addEventListener('click', () => { if (state.visited.has(i + 1)) showScene(i + 1); });
    d.appendChild(b);
  });
  updateDots();
}
function updateDots() {
  $$('#dots button').forEach((b, i) => {
    b.classList.toggle('visited', state.visited.has(i + 1));
    b.classList.toggle('current', state.scene === i + 1);
  });
}

/* ══════════════ SCENE 1 · night sky ══════════════ */
function enter1() {
  TL.after(2100, () => $('#s1-line1').classList.add('show'));
  TL.after(4100, () => $('#s1-line2').classList.add('show'));
  TL.after(5400, () => $('#enter-btn').classList.add('show'));
}
let traveling = false;
$('#enter-btn').addEventListener('click', e => {
  if (traveling) return; traveling = true;
  const r = e.currentTarget.getBoundingClientRect();
  fx.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 20, sp: 2.4, cs: ['#ffd9a3', '#ff9cc7', '#fff'] });
  $('#s1-inner').classList.add('gone');
  sky.startWarp(() => { showScene(2); traveling = false; });
});

/* ══════════════ SCENE 2 · name reveal ══════════════ */
function buildName() {
  const el = $('#s2-name'); el.innerHTML = '';
  const txt = NAME.toUpperCase();
  for (const ch of txt) {
    const s = document.createElement('span');
    s.className = 'nl' + (ch === ' ' ? ' sp' : ''); s.textContent = ch === ' ' ? '' : ch;
    el.appendChild(s);
  }
  const h = document.createElement('span');
  h.className = 'nl hrt'; h.textContent = '❤️'; el.appendChild(h);
}
function enter2() {
  TL.after(400, () => $('#s2-pre').classList.add('show'));
  const letters = $$('#s2-name .nl');
  letters.forEach((l, i) => TL.after(1350 + i * 95, () => l.classList.add('show')));
  const after = 1350 + letters.length * 95;
  TL.after(after + 350, () => $('#s2-sub').classList.add('show'));
  TL.after(after + 250, spawnNameHearts);
  TL.after(after + 1100, () => showNext(2));
}
function spawnNameHearts() {
  const wrap = $('#s2-hearts');
  if (wrap.children.length) return;
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('span');
    s.className = 'fh'; s.textContent = pick(['❤', '♡', '✦']);
    s.style.left = (8 + Math.random() * 84) + '%';
    s.style.top = (Math.random() * 90) + '%';
    s.style.fontSize = (11 + Math.random() * 13) + 'px';
    s.style.animationDuration = (5 + Math.random() * 4).toFixed(2) + 's,1.2s';
    s.style.animationDelay = (Math.random() * 2).toFixed(2) + 's,' + (Math.random() * .8).toFixed(2) + 's';
    s.style.color = pick(['#ff9cc7', '#c3a6ff', '#ffd9a3']);
    wrap.appendChild(s);
  }
}

/* ══════════════ SCENE 3 · memory path ══════════════ */
const memories = birthdayData.memories.map(m => typeof m === 'string' ? { text: m } : m);
function buildBubbles() {
  const field = $('#bubble-field');
  field.querySelectorAll('.bubble-pos').forEach(e => e.remove());
  const svg = $('#bubbles-svg'); svg.innerHTML = '';
  const narrow = isNarrow();
  const n = memories.length;
  const r = field.getBoundingClientRect();
  const anchors = [];
  if (narrow) {
    field.style.height = (n * 178 + 70) + 'px';
    for (let i = 0; i < n; i++)
      anchors.push([r.width * (i % 2 ? .68 : .3) + (Math.random() * 16 - 8), 78 + i * 176]);
  } else {
    field.style.height = '';
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? r.width / 2 : 92 + (r.width - 184) * (i / (n - 1));
      anchors.push([x, r.height * .5 + Math.sin(i * 2.15 + 1) * r.height * .26]);
    }
  }
  // dotted path threading the bubbles
  let d = `M ${anchors[0][0]} ${anchors[0][1]}`;
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1], [x1, y1] = anchors[i];
    d += ` Q ${(x0 + x1) / 2} ${(y0 + y1) / 2 + (i % 2 ? -38 : 38)}, ${x1} ${y1}`;
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d); svg.appendChild(path);

  anchors.forEach(([x, y], i) => {
    const pos = document.createElement('div');
    pos.className = 'bubble-pos';
    pos.style.left = x + 'px'; pos.style.top = y + 'px';
    pos.dataset.depth = (0.05 + Math.random() * .08).toFixed(3);
    pos.dataset.center = '1';
    pos.style.transform = 'translate(-50%, -50%)';
    const b = document.createElement('div');
    b.className = 'bubble' + (state.memOpened.has(i) ? ' opened' : '');
    b.style.setProperty('--dur', (6.5 + Math.random() * 3).toFixed(2) + 's');
    b.style.setProperty('--del', (-Math.random() * 5).toFixed(2) + 's');
    b.setAttribute('role', 'button');
    b.setAttribute('aria-label', 'Open memory ' + (i + 1));
    b.innerHTML = `<span class="b-num">${String(i + 1).padStart(2, '0')}</span>
                 <span class="b-label">${memories[i].title || 'a little moment'}</span>`;
    b.addEventListener('click', () => openMemory(i));
    pos.appendChild(b); field.appendChild(pos);
    setTimeout(() => b.classList.add('in'), 250 + i * 180);
  });
  updateMemHint();
}
function updateMemHint() {
  const h = $('#s3-hint');
  const got = state.memOpened.size, n = memories.length;
  if (got >= n) h.textContent = 'you found them all ✨';
  else if (got > 0) h.textContent = `${got} of ${n} memories found`;
  else h.textContent = 'tap a floating bubble to open a memory';
}
function openMemory(i) {
  const m = memories[i];
  state.memOpened.add(i);
  $$('.bubble')[i]?.classList.add('opened');
  $('#mem-tag').textContent = 'Memory ' + String(i + 1).padStart(2, '0');
  const titleEl = $('#mem-title');
  if (m.title) { titleEl.hidden = false; titleEl.textContent = m.title; } else titleEl.hidden = true;
  $('#mem-text').textContent = m.text;
  const ph = $('#mem-photo');
  if (m.photo) { ph.hidden = false; ph.src = m.photo; ph.onerror = () => ph.hidden = true; } else ph.hidden = true;
  $('#memory-overlay').classList.add('show');
  fx.burst(innerWidth / 2, innerHeight / 2, { n: 18, sp: 1.8, g: .01, dr: .99, cs: ['#ffd9a3', '#ff9cc7', '#c3a6ff'], sz: 1.8 });
  updateMemHint();
  if (state.memOpened.size >= memories.length) showNext(3);
}
$('#mem-close').addEventListener('click', () => $('#memory-overlay').classList.remove('show'));
$('#memory-overlay').addEventListener('click', e => { if (e.target.id === 'memory-overlay') e.currentTarget.classList.remove('show'); });
function enter3() { buildBubbles(); }

/* ══════════════ SCENE 4 · the letter ══════════════ */
function buildLetter() {
  const paper = $('#letter-paper'); paper.innerHTML = '';
  birthdayData.letter.forEach((line, i) => {
    const p = document.createElement('p');
    p.className = 'l-line' + (i === 0 ? ' salutation' : '');
    p.textContent = line; paper.appendChild(p);
  });
  const sign = document.createElement('p');
  sign.className = 'l-line sign'; sign.textContent = '— always yours';
  paper.appendChild(sign);
}
function enter4() {
  TL.after(450, () => $('#s4-pre').classList.add('show'));
  TL.after(1050, () => $('#envelope-zone').classList.add('show'));
}
$('#open-letter').addEventListener('click', () => {
  if (state.letterOpened) return; state.letterOpened = true;
  $('#envelope').classList.add('open');
  TL.after(520, () => $('#env-flap').classList.add('behind'));
  TL.after(1500, () => {
    $('#envelope-zone').classList.add('away');
    $('#s4-pre').classList.add('away');
    $('#s4').classList.add('warm-lit');
    $('#letter-card').classList.add('show');
    const lines = $$('#letter-paper .l-line');
    lines.forEach((l, i) => TL.after(1950 + i * 640, () => l.classList.add('show')));
    TL.after(1950 + lines.length * 640 + 500, () => showNext(4));
  });
});

/* ══════════════ SCENE 5 · constellation ══════════════ */
const constellation = (() => {
  const wrap = $('#constellation'), svg = $('#const-lines');
  const N = 12; let pts = [], starEls = [], expected = 0;
  const heartPt = t => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [x, y];
  };
  function build() {
    wrap.querySelectorAll('.cstar,.astar').forEach(e => e.remove());
    svg.innerHTML = ''; expected = 0; starEls = [];
    const r = wrap.getBoundingClientRect();
    const cxp = r.width / 2, cyp = r.height / 2;
    const s = Math.min(r.width / 40, r.height / 42);
    pts = [];
    for (let i = 0; i < N; i++) {
      const t = Math.PI / 2 + (i / N) * 2 * Math.PI;
      const [hx, hy] = heartPt(t);
      pts.push([cxp + hx * s + (Math.random() * 8 - 4), cyp - hy * s + (Math.random() * 8 - 4)]);
    }
    // dim decoy stars for ambience
    for (let i = 0; i < 22; i++) {
      let x, y, ok = false, tries = 0;
      while (!ok && tries++ < 8) {
        x = 20 + Math.random() * (r.width - 40); y = 20 + Math.random() * (r.height - 40);
        ok = pts.every(p => Math.hypot(p[0] - x, p[1] - y) > 34);
      }
      const a = document.createElement('i');
      a.className = 'astar';
      a.style.left = x + 'px'; a.style.top = y + 'px';
      a.style.setProperty('--d', (2.4 + Math.random() * 3).toFixed(2) + 's');
      a.style.setProperty('--del', (-Math.random() * 3).toFixed(2) + 's');
      wrap.appendChild(a);
    }
    pts.forEach(([x, y], i) => {
      const b = document.createElement('button');
      b.className = 'cstar'; b.style.left = x + 'px'; b.style.top = y + 'px';
      b.setAttribute('aria-label', 'Star ' + (i + 1) + ' of ' + N);
      b.innerHTML = '<i class="halo"></i><i class="core"></i>';
      b.addEventListener('click', () => tap(i, b));
      wrap.appendChild(b); starEls.push(b);
    });
    if (state.constDone) restoreDone();
    else starEls[0].classList.add('hint');
    updateHint();
  }
  function updateHint() {
    const h = $('#s5-hint');
    if (state.constDone) h.textContent = 'written in the stars ✨';
    else if (expected === 0) h.textContent = 'tap the glowing star to begin';
    else h.textContent = `keep going — ${N - expected} to go`;
  }
  function drawLine(i, animate) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % N];
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    svg.appendChild(l);
    if (animate) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      l.style.strokeDasharray = len; l.style.strokeDashoffset = len;
      requestAnimationFrame(() => { l.style.transition = 'stroke-dashoffset .38s ease'; l.style.strokeDashoffset = 0; });
    }
  }
  function tap(i, el) {
    if (state.constDone) return;
    if (i === expected) {
      el.classList.remove('hint'); el.classList.add('lit');
      drawLine(i, true);
      const wr = wrap.getBoundingClientRect();
      fx.burst(wr.left + pts[i][0], wr.top + pts[i][1], { n: 10, sp: 1.6, cs: ['#fff', '#ffd7ea', '#c3a6ff'], sz: 1.6, g: .02 });
      expected++;
      if (expected >= N) complete();
      else starEls[expected].classList.add('hint');
      updateHint();
    } else {
      el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope');
    }
  }
  function complete() {
    state.constDone = true;
    const poly = pts.map(p => p.join(',')).join(' ');
    const edge = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    edge.setAttribute('points', poly); edge.setAttribute('class', 'edge');
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    fill.setAttribute('points', poly);
    svg.appendChild(edge); svg.appendChild(fill);
    requestAnimationFrame(() => svg.classList.add('glow'));
    const wr = wrap.getBoundingClientRect();
    const cxr = wr.left + wr.width / 2, cyr = wr.top + wr.height / 2;
    pts.forEach((p, i) => TL.after(i * 60, () => fx.burst(wr.left + p[0], wr.top + p[1], { n: 12, sp: 2.4, cs: ['#ff9cc7', '#ffd9a3', '#fff'] })));
    TL.after(500, () => fx.heartBurst(cxr, cyr, REDUCED ? 10 : 26));
    TL.after(700, () => fx.firework(cxr, cyr - 40));
    TL.after(900, () => $('#c5-reveal').classList.add('show'));
    TL.after(1500, () => showNext(5));
    updateHint();
  }
  function restoreDone() {
    starEls.forEach(el => el.classList.add('lit'));
    for (let i = 0; i < N; i++) drawLine(i, false);
    const poly = pts.map(p => p.join(',')).join(' ');
    const edge = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    edge.setAttribute('points', poly); edge.setAttribute('class', 'edge');
    const fill = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    fill.setAttribute('points', poly);
    svg.appendChild(edge); svg.appendChild(fill); svg.classList.add('glow');
    $('#c5-reveal').classList.add('show'); showNext(5); updateHint();
  }
  return { build };
})();
function enter5() { constellation.build(); }

/* ══════════════ SCENE 6 · the cake ══════════════ */
function enter6() {
  const done = state.celebrated;
  if (done) {
    $('#s6-pre').classList.add('show');
    $('#s6-shout').classList.add('show');
    $$('#candles .candle').forEach(c => c.classList.add('out'));
    $('#s6-hint').textContent = 'all blown out ✨';
    $('#s6-wish').classList.add('show');
    showNext(6); return;
  }
  TL.after(350, () => $('#s6-pre').classList.add('show'));
  TL.after(1500, () => $('#s6-shout').classList.add('show'));
}
$$('#candles .candle').forEach(c => {
  c.addEventListener('pointerdown', () => {
    if (c.classList.contains('out') || state.celebrated) return;
    c.classList.add('out');
    const r = c.getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top, { n: 8, sp: 1.2, g: -.01, cs: ['#ffd9a3', '#fff', '#c3a6ff'], sz: 1.3, dc: .03 });
    state.candlesLeft--;
    if (state.candlesLeft > 0) {
      $('#s6-hint').textContent = state.candlesLeft === 1 ? 'one more...' : state.candlesLeft + ' flames left...';
    } else celebrate();
  });
});
function celebrate() {
  state.celebrated = true;
  $('#s6-hint').textContent = 'all blown out ✨';
  // screen glow
  const f = $('#flash'); f.style.transition = 'none'; f.style.opacity = .6;
  requestAnimationFrame(() => { f.style.transition = 'opacity 1.6s ease'; f.style.opacity = 0; });
  // confetti + fireworks + hearts
  fx.confetti(REDUCED ? 40 : 150);
  for (let i = 0; i < 5; i++)
    TL.after(250 + i * 340, () => fx.firework(innerWidth * (.2 + Math.random() * .6), innerHeight * (.14 + Math.random() * .3)));
  TL.after(900, () => fx.confetti(REDUCED ? 24 : 80));
  rainHearts(REDUCED ? 8 : 22);
  fx.heartBurst(innerWidth / 2, innerHeight * .45, REDUCED ? 8 : 20);
  // music unlocks 🎶
  unlockMusic();
  TL.after(800, () => $('#s6-wish').classList.add('show'));
  TL.after(1600, () => showNext(6));
}

/* ══════════════ SCENE 7 · photo universe ══════════════ */
function buildPolaroids() {
  const field = $('#pola-field'); field.innerHTML = '';
  const narrow = isNarrow();
  const photos = birthdayData.photos, caps = birthdayData.captions;
  const n = photos.length;
  const r = field.getBoundingClientRect();
  const slots = [];
  if (narrow) {
    field.style.height = (n * 248 + 360) + 'px';
    const w = clamp(r.width * .44, 150, 210);
    for (let i = 0; i < n; i++)
      slots.push([i % 2 ? r.width - w - 14 : 14, 30 + i * 248]);
  } else {
    field.style.height = '';
    const w = clamp(r.width * .17, 150, 220);
    const xs = [.03, .24, .45, .66, .84];
    const ys = [.12, .5, .06, .44, .16];
    for (let i = 0; i < n; i++)
      slots.push([xs[i % n] * (r.width - w), ys[i % n] * (r.height - 260)]);
  }
  photos.forEach((src, i) => {
    const fig = document.createElement('figure');
    fig.className = 'polaroid';
    fig.style.left = slots[i][0] + 'px'; fig.style.top = slots[i][1] + 'px';
    fig.dataset.depth = (0.08 + (i % 3) * 0.07).toFixed(2);
    fig.style.setProperty('--r', ((i % 2 ? -1 : 1) * (3 + Math.random() * 5)).toFixed(1) + 'deg');
    fig.style.setProperty('--dur', (8 + Math.random() * 4).toFixed(1) + 's');
    fig.style.setProperty('--del', (-Math.random() * 6).toFixed(1) + 's');
    const cap = caps[i % caps.length];
    fig.innerHTML = `
      <div class="pola-float"><div class="pola-inner">
        <div class="pola-frame">
          <img src="${src}" alt="${cap}" loading="lazy">

        </div>
        <figcaption>${cap}</figcaption>
      </div></div>`;
    const img = fig.querySelector('img');
    img.addEventListener('error', () => fig.querySelector('.pola-frame').classList.add('no-img'));
    fig.addEventListener('click', () => openLightbox(src, cap));
    field.appendChild(fig);
    setTimeout(() => fig.classList.add('in'), 300 + i * 220);
  });
}
function openLightbox(src, cap) {
  state.phOpened.add(src);
  const img = $('#lb-img');
  img.hidden = false; img.style.display = 'block';
  img.alt = cap; $('#lb-cap').textContent = cap;
  img.src = src;
  $('#lightbox').classList.add('show');
  fx.burst(innerWidth / 2, innerHeight / 2, { n: 14, sp: 1.6, g: .01, dr: .99, cs: ['#ff9cc7', '#ffd9a3', '#c3a6ff'], sz: 1.6 });
  if (state.phOpened.size >= 1) showNext(7);
}
$('#lb-close').addEventListener('click', () => $('#lightbox').classList.remove('show'));
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') e.currentTarget.classList.remove('show'); });
addEventListener('keydown', e => {
  if (e.key === 'Escape') { $('#lightbox').classList.remove('show'); $('#memory-overlay').classList.remove('show'); }
});
function enter7() { buildPolaroids(); }

/* ══════════════ SCENE 8 · the finale ══════════════ */
function enter8() {
  $('#s8-name').textContent = 'HAPPY BIRTHDAY, ' + NAME.toUpperCase() + ' ❤️';
  if (state.finaleDone) { finishFinale(true); return; }
  const g = id => $(id);
  TL.after(500, () => g('#s8-heart').classList.add('show'));
  TL.after(1500, () => g('#s8 .f-line:nth-child(1)').classList.add('show'));
  TL.after(3200, () => g('#s8 .f-line:nth-child(2)').classList.add('show'));
  TL.after(4900, () => g('#s8 .f-line:nth-child(3)').classList.add('show'));
  TL.after(6500, () => g('#s8-name').classList.add('show'));
  TL.after(7600, () => g('#s8-sub').classList.add('show'));
  TL.after(8600, () => finishFinale(false));
}
$('#s8-heart').addEventListener('click', () => { if (!state.finaleDone) { TL.clear(); finishFinale(true); } });
function finishFinale(instant) {
  state.finaleDone = true;
  ['#s8-heart', '#s8-name', '#s8-sub', '#last-thing'].forEach(id => $(id).classList.add('show'));
  $$('#s8 .f-line').forEach(l => l.classList.add('show'));
  startRain();
}
let typing = false;
$('#tap-me').addEventListener('click', async e => {
  if (typing) return; typing = true;
  e.currentTarget.style.opacity = .35; e.currentTarget.style.pointerEvents = 'none';
  const el = $('#type-line');
  await typewriter(el, FINAL_MSG, 34);
  rainHearts(REDUCED ? 12 : 34);
  fx.heartBurst(innerWidth / 2, innerHeight * .4, REDUCED ? 10 : 24);
  for (let i = 0; i < 3; i++) TL.after(i * 420, () => fx.firework(innerWidth * (.25 + Math.random() * .5), innerHeight * (.2 + Math.random() * .25)));
  const f = $('#flash'); f.style.transition = 'none'; f.style.opacity = .4;
  requestAnimationFrame(() => { f.style.transition = 'opacity 2s ease'; f.style.opacity = 0; });
});
function typewriter(el, text, speed) {
  return new Promise(res => {
    el.textContent = ''; el.classList.add('typing');
    let i = 0;
    (function tick() {
      if (i < text.length) {
        el.textContent += text[i];
        const pause = text[i] === '\n' ? 240 : 0; i++;
        setTimeout(tick, speed + pause + (REDUCED ? 0 : Math.random() * 26));
      } else { el.classList.remove('typing'); res(); }
    })();
  });
}

/* heart rain */
const RAIN_CHARS = ['❤', '♡', '✦', '✧', '⋆'];
function spawnRain() {
  const wrap = $('#heart-rain');
  if (wrap.children.length > 60) return;
  const s = document.createElement('span');
  s.textContent = pick(RAIN_CHARS);
  s.style.left = Math.random() * 100 + '%';
  s.style.fontSize = (10 + Math.random() * 18) + 'px';
  s.style.color = pick(['#ff9cc7', '#c3a6ff', '#ffd9a3', '#ff5fa2']);
  s.style.textShadow = '0 0 12px currentColor';
  s.style.setProperty('--sway', ((Math.random() - .5) * 130).toFixed(0) + 'px');
  s.style.setProperty('--rot', ((Math.random() - .5) * 140).toFixed(0) + 'deg');
  s.style.setProperty('--o', (.35 + Math.random() * .5).toFixed(2));
  s.style.animationDuration = (7 + Math.random() * 7) + 's';
  s.addEventListener('animationend', () => s.remove());
  wrap.appendChild(s);
}
function rainHearts(n) { for (let i = 0; i < n; i++) setTimeout(spawnRain, i * 140); }
let rainInt = null;
function startRain() {
  if (rainInt) return;
  rainInt = setInterval(() => { if (state.scene === 8) spawnRain(); }, REDUCED ? 900 : 430);
}

/* ══════════════ music ══════════════ */
const audio = $('#music'), musicBtn = $('#music-btn');
let playing = false;
function unlockMusic() {
  if (state.musicUnlocked) return;
  state.musicUnlocked = true;
  musicBtn.classList.remove('locked');
  musicBtn.classList.add('invite');
  musicBtn.setAttribute('aria-label', 'Play birthday music');
  // auto-start music when cake is blown
  audio.play()
    .then(() => { playing = true; musicBtn.classList.add('playing'); })
    .catch(() => toast('Add "birthday-music.mp3" to the sounds/ folder 💫'));
}
musicBtn.addEventListener('click', () => {
  if (!state.musicUnlocked) { toast('The song unlocks after the cake 🎂'); return; }
  if (playing) { audio.pause(); playing = false; musicBtn.classList.remove('playing'); }
  else {
    audio.play()
      .then(() => { playing = true; musicBtn.classList.add('playing'); })
      .catch(() => toast('Add "birthday-music.mp3" to the sounds/ folder 💫'));
  }
});

/* ══════════════ init + resize ══════════════ */
sky.resize(); fx.resize(); buildDots(); buildName(); buildLetter();
enter1();
requestAnimationFrame(loop);

let rz;
addEventListener('resize', () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    sky.resize(); fx.resize();
    if (state.scene === 3) buildBubbles();
    if (state.scene === 5) constellation.build();
    if (state.scene === 7) buildPolaroids();
  }, 220);
});
