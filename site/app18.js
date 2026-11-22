/* Tickerwise app18: 20 new motion banners, all drawn live from real Tickerwise data.
   Market Weather, Stock Galaxy, Market Globe, Money River, Bar Chart Race, Split-Flap Board, Market City, Earnings Ripple Pond,
   Terrain Flyover, Score DNA, Data Rain, Holographic Cards, Market Aurora, Magnetic Candles, Scroll Story, AI Scanner,
   Living Cells, Orbiting Legends, Odometer, Volume Glow. Each pauses off-screen and respects reduced motion.
   A gallery of all of them lives at #/showcase. */
(function () {
if (window.TWB2) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, dfmt } = X, TW = window.TW || {}, MK = TW.MK || {}, app = $('#app'); if (!app || !S) return;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PC = {}, ser = t => PC[t] || (PC[t] = (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => nz(p.c) && p.c > 0));
const day = t => { const z = ser(t), a = z[z.length - 1], b = z[z.length - 2]; return a && b ? (a.c / b.c - 1) * 100 : 0; };
const pct = (v, d = 1) => !nz(v) ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';
const G = '#10B981', R = '#EF4444', B = '#2F6BFF', V = '#7C3AED';
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const col = (v, m = 10) => { const t = clamp(v / m, -1, 1); return t >= 0 ? `rgba(16,185,129,${.35 + .65 * t})` : `rgba(239,68,68,${.35 - .65 * t})`; };
const SEC = (() => { const o = {}; S.forEach(s => { if (!s.sec) return; const x = o[s.sec] = o[s.sec] || { n: s.sec, L: [], r1m: 0, d: 0, ws: 0, beta: 0 }; x.L.push(s); }); return Object.values(o).map(x => { const n = x.L.length; x.r1m = x.L.reduce((a, s) => a + ((s.ret || {}).r1m || 0), 0) / n; x.d = x.L.reduce((a, s) => a + day(s.t), 0) / n; x.ws = x.L.reduce((a, s) => a + (s.ws || 0), 0) / n; x.beta = x.L.reduce((a, s) => a + (s.beta || 1), 0) / n; return x; }).sort((a, b) => b.L.length - a.L.length); })();

const css = document.createElement('style'); css.textContent = `
.bx{position:relative;border-radius:22px;overflow:hidden;background:radial-gradient(120% 140% at 0% 0%,#0E2A6B 0%,#071334 55%,#050B22 100%);color:#fff;box-shadow:0 24px 60px rgba(7,19,52,.28);isolation:isolate}
.bx canvas{display:block;width:100%;height:100%}
.bx .bx-c{position:relative;height:340px}
.bx .bx-o{position:absolute;left:24px;top:20px;right:24px;pointer-events:none;z-index:2;max-width:560px}
.bx .bx-e{font:800 11.5px Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5EEAD4;display:flex;gap:8px;align-items:center}.bx .bx-e i{width:8px;height:8px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 0 rgba(34,197,94,.7);animation:bxp 2s infinite}
@keyframes bxp{70%{box-shadow:0 0 0 10px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}
.bx h3{margin:8px 0 4px;font:800 26px/1.15 'Space Grotesk',sans-serif;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.5)}.bx h3 em{font-style:normal;background:linear-gradient(90deg,#34D399,#38BDF8);-webkit-background-clip:text;background-clip:text;color:transparent}
.bx p.bx-d{margin:0;font-size:13.5px;line-height:1.5;color:#CBD5E1;max-width:460px;text-shadow:0 1px 10px rgba(0,0,0,.6)}
.bx .bx-l{position:absolute;right:16px;bottom:12px;z-index:2;font:600 11.5px Inter,sans-serif;color:#94A3B8;background:rgba(5,11,34,.6);padding:5px 10px;border-radius:999px;backdrop-filter:blur(4px);pointer-events:none}
.bx .bx-tip{position:absolute;z-index:3;pointer-events:none;background:#fff;color:#0B1B3F;border-radius:10px;padding:6px 10px;font:600 12.5px Inter,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);transform:translate(-50%,-120%);white-space:nowrap;display:none}
@media(max-width:640px){.bx .bx-c{height:300px}.bx h3{font-size:20px}.bx p.bx-d{font-size:12.5px;max-width:92%}.bx .bx-o{left:16px;right:16px;top:14px}}
.bx-flap{display:grid;gap:5px;padding:104px 18px 24px;font:800 18px ui-monospace,'SF Mono',Menlo,monospace}
.bx-flap .row{display:flex;gap:3px;align-items:center}.bx-flap .ch{width:1.15em;height:1.6em;display:grid;place-items:center;background:linear-gradient(#1F2937 50%,#111827 50%);border-radius:4px;color:#F8FAFC;position:relative;box-shadow:inset 0 -1px 0 rgba(255,255,255,.05)}
.bx-flap .ch::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.6)}
.bx-flap .ch.f{animation:flip .09s linear}@keyframes flip{50%{transform:scaleY(.1)}}
.bx-flap .sp{width:.6em}.bx-flap .up{color:#34D399}.bx-flap .dn{color:#F87171}
@media(max-width:640px){.bx-flap{font-size:13px;padding-top:92px}}
.bx-holo{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;padding:110px 22px 26px;perspective:900px}
.bx-holo a{position:relative;display:block;border-radius:18px;padding:16px;text-decoration:none;color:#fff;background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.18);transform-style:preserve-3d;transition:transform .12s ease-out;overflow:hidden;min-height:150px}
.bx-holo a::before{content:'';position:absolute;inset:-50%;background:conic-gradient(from var(--a,0deg),rgba(255,0,128,.0),rgba(56,189,248,.35),rgba(52,211,153,.35),rgba(250,204,21,.3),rgba(255,0,128,.0));mix-blend-mode:screen;opacity:var(--o,.35);transform:translate(var(--x,0),var(--y,0))}
.bx-holo a::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,255,255,.45),transparent 45%);mix-blend-mode:overlay}
.bx-holo b{position:relative;display:block;font:800 26px 'Space Grotesk',sans-serif}.bx-holo span{position:relative;display:block;font-size:12px;color:#CBD5E1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bx-holo .sc{position:relative;font:800 44px 'Space Grotesk',sans-serif;margin-top:10px;background:linear-gradient(90deg,#34D399,#38BDF8,#A78BFA);-webkit-background-clip:text;background-clip:text;color:transparent}
@media(max-width:640px){.bx-holo{grid-template-columns:repeat(2,minmax(0,1fr));padding-top:104px;gap:10px}.bx-holo a{min-height:120px;padding:12px}.bx-holo .sc{font-size:34px}}
.bx-odo{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;padding:104px 22px 28px}.bx-odo>div{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:14px}
.bx-odo .num{display:flex;font:800 38px 'Space Grotesk',sans-serif;height:1.15em;overflow:hidden;line-height:1.15}.bx-odo .num .d{display:flex;flex-direction:column;transition:transform 2.2s cubic-bezier(.2,.8,.2,1)}.bx-odo .num .d span{height:1.15em}
.bx-odo small{display:block;color:#94A3B8;font-size:12px;margin-top:4px}
@media(max-width:640px){.bx-odo{grid-template-columns:repeat(2,minmax(0,1fr));padding-top:100px}.bx-odo .num{font-size:28px}}
.bx-scan{display:grid;grid-template-columns:1.1fr 1fr;gap:16px;padding:100px 22px 24px;position:relative}
.bx-scan .ls{position:relative;font:600 13px ui-monospace,Menlo,monospace;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px;overflow:hidden;height:190px}
.bx-scan .ls div{display:flex;justify-content:space-between;padding:3px 6px;border-radius:6px;color:#CBD5E1;transition:background .3s}.bx-scan .ls div.hit{background:rgba(52,211,153,.18);color:#fff}
.bx-scan .ln{position:absolute;left:0;right:0;height:26px;background:linear-gradient(180deg,transparent,rgba(56,189,248,.35),transparent);border-bottom:1px solid #38BDF8;box-shadow:0 0 20px #38BDF8}
.bx-scan .ty{font:500 14px/1.6 ui-monospace,Menlo,monospace;color:#E2E8F0;min-height:190px;white-space:pre-wrap}.bx-scan .ty b{color:#34D399}.bx-scan .cur{display:inline-block;width:8px;height:16px;background:#38BDF8;vertical-align:middle;animation:bk 1s steps(1) infinite}@keyframes bk{50%{opacity:0}}
@media(max-width:640px){.bx-scan{grid-template-columns:1fr}.bx-scan .ty{min-height:120px;font-size:12.5px}.bx-scan .ls{height:150px}}
.bx-gal{display:grid;gap:22px}.bx-gal h4{margin:0 0 -12px;font:700 13px Inter,sans-serif;color:var(--mut);text-transform:uppercase;letter-spacing:.08em}
`; document.head.appendChild(css);

/* ---------- frame + animation host ---------- */
function frame(id, eye, title, desc, legend, inner) {
  const el = document.createElement('div'); el.className = 'bx'; el.dataset.bx = id;
  el.innerHTML = `<div class="bx-c"${inner ? ' style="height:auto;min-height:300px"' : ''}>${inner || '<canvas></canvas>'}<div class="bx-o"><div class="bx-e"><i></i>${eye}</div><h3>${title}</h3>${desc ? `<p class="bx-d">${desc}</p>` : ''}</div>${legend ? `<div class="bx-l">${legend}</div>` : ''}<div class="bx-tip"></div></div>`; return el;
}
function host(el, draw, opt) {
  const cv = $('canvas', el); if (!cv) return; const g = cv.getContext('2d'); let W = 0, H = 0, vis = true, t0 = performance.now(), mouse = { x: -1e4, y: -1e4, on: 0 };
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); if (opt && opt.init) opt.init(W, H); };
  size(); new ResizeObserver(size).observe(cv);
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = 1; }); cv.addEventListener('pointerleave', () => { mouse.on = 0; mouse.x = mouse.y = -1e4; const tp = $('.bx-tip', el); if (tp) tp.style.display = 'none'; });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(el);
  const tip = (txt, x, y) => { const tp = $('.bx-tip', el); if (!tp) return; if (!txt) { tp.style.display = 'none'; return; } tp.innerHTML = txt; tp.style.display = 'block'; tp.style.left = x + 'px'; tp.style.top = y + 'px'; };
  const loop = now => { if (!el.isConnected) return; if (vis && W) { draw(g, W, H, (now - t0) / 1000, mouse, tip); } if (!RM) requestAnimationFrame(loop); };
  requestAnimationFrame(loop); if (RM) setTimeout(() => draw(g, W, H, 4, mouse, tip), 60);
}

/* =========== 1. MARKET WEATHER =========== */
function weather() {
  const L = SEC.slice(0, 12), el = frame('weather', 'Market weather · live', 'Today\'s <em>market weather</em>.', 'Each region is a sector. Wind blows right when it rose, left when it fell; faster wind = bigger move. Storms swirl where stocks swing the most.', 'wind = sector move · storms = high beta');
  let P = [], cells = [];
  host(el, (g, W, H, t, m, tip) => {
    const cols = W < 600 ? 3 : 4, rows = Math.ceil(L.length / cols), cw = W / cols, ch = (H - 120) / rows;
    if (!cells.length || cells.W !== W) { cells = L.map((s, i) => ({ s, x: (i % cols) * cw, y: 120 + Math.floor(i / cols) * ch, w: cw, h: ch })); cells.W = W; P = Array.from({ length: W < 600 ? 500 : 1100 }, () => ({ x: Math.random() * W, y: 120 + Math.random() * (H - 120), a: Math.random() * 200 })); g.fillStyle = '#050B22'; g.fillRect(0, 0, W, H); }
    g.fillStyle = 'rgba(5,11,34,.10)'; g.fillRect(0, 0, W, H);
    cells.forEach(c => { g.strokeStyle = 'rgba(148,163,184,.08)'; g.strokeRect(c.x + .5, c.y + .5, c.w - 1, c.h - 1); g.fillStyle = 'rgba(203,213,225,.55)'; g.font = '700 11px Inter'; g.fillText(c.s.n.toUpperCase().slice(0, 22), c.x + 8, c.y + 16); g.fillStyle = c.s.d >= 0 ? '#34D399' : '#F87171'; g.font = '800 13px Inter'; g.fillText(pct(c.s.d), c.x + 8, c.y + 32); });
    P.forEach(p => { const ci = Math.min(L.length - 1, Math.floor((p.y - 120) / ch) * cols + Math.floor(p.x / cw)), c = cells[ci] || cells[0], s = c.s, sp = .6 + Math.min(4, Math.abs(s.d) * 1.1), cx = c.x + c.w / 2, cy = c.y + c.h / 2, dx = p.x - cx, dy = p.y - cy, r = Math.hypot(dx, dy) + 1, storm = Math.max(0, s.beta - 1.15) * 2.2;
      let vx = Math.sign(s.d || .01) * sp + Math.sin((p.y + t * 40) / 37) * .5, vy = Math.cos((p.x + t * 30) / 53) * .5 - Math.sign(s.d) * .25; if (storm) { vx += -dy / r * storm * 2; vy += dx / r * storm * 2; }
      if (m.on) { const mx = p.x - m.x, my = p.y - m.y, d = Math.hypot(mx, my); if (d < 90) { vx += mx / d * 2.5; vy += my / d * 2.5; } }
      const nx = p.x + vx, ny = p.y + vy; g.strokeStyle = s.d >= 0 ? `rgba(52,211,153,${.25 + Math.min(.6, Math.abs(s.d) / 6)})` : `rgba(248,113,113,${.25 + Math.min(.6, Math.abs(s.d) / 6)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(nx, ny); g.stroke();
      p.x = nx; p.y = ny; p.a++; if (p.x < 0 || p.x > W || p.y < 120 || p.y > H || p.a > 260) { p.x = Math.random() * W; p.y = 120 + Math.random() * (H - 120); p.a = 0; } });
    if (m.on) { const ci = Math.floor((m.y - 120) / ch) * cols + Math.floor(m.x / cw), c = cells[ci]; tip(c && m.y > 120 ? `<b>${esc(c.s.n)}</b> · today ${pct(c.s.d)} · 1M ${pct(c.s.r1m)} · beta ${c.s.beta.toFixed(1)}` : '', m.x, m.y); }
  }); return el;
}

/* =========== 2. STOCK GALAXY =========== */
function galaxy() {
  const el = frame('galaxy', 'Stock galaxy', `${S.length} stocks, <em>one universe</em>.`, 'Every star is a stock we score. Brighter = higher score, green or red = last month. Sectors form constellations. Move your mouse to pull the stars.', 'size = score · color = 1-month move');
  const sec = SEC.map(s => s.n), stars = S.map((s, i) => { const k = Math.max(0, sec.indexOf(s.sec)), a0 = k / sec.length * Math.PI * 2; return { s, a0, rr: .12 + (1 - (s.ws || 5) / 10) * .9 + Math.random() * .3, sp: (Math.random() * .5 + .5) * .05, ph: Math.random() * 6, jit: (Math.random() - .5) * .55, x: 0, y: 0, vx: 0, vy: 0 }; });
  let bg = null; host(el, (g, W, H, t, m, tip) => {
    if (!bg || bg.W !== W) { bg = Array.from({ length: 220 }, () => [Math.random() * W, Math.random() * H, Math.random()]); bg.W = W; }
    g.fillStyle = '#040A1F'; g.fillRect(0, 0, W, H); bg.forEach(b => { g.fillStyle = `rgba(255,255,255,${.15 + .35 * Math.abs(Math.sin(t + b[2] * 9))})`; g.fillRect(b[0], b[1], 1.2, 1.2); });
    const cx = W * (W < 600 ? .5 : .62), cy = H * .58, R0 = Math.min(W * .42, H * .62); const neb = g.createRadialGradient(cx, cy, 0, cx, cy, R0 * 1.1); neb.addColorStop(0, 'rgba(124,58,237,.35)'); neb.addColorStop(.5, 'rgba(47,107,255,.12)'); neb.addColorStop(1, 'transparent'); g.fillStyle = neb; g.fillRect(0, 0, W, H);
    let hov = null; stars.forEach(st => { const a = st.a0 + st.jit + t * st.sp, tx = cx + Math.cos(a) * st.rr * R0 * 1.25, ty = cy + Math.sin(a) * st.rr * R0 * .62;
      if (!st.x) { st.x = tx; st.y = ty; } st.vx += (tx - st.x) * .02; st.vy += (ty - st.y) * .02; if (m.on) { const dx = m.x - st.x, dy = m.y - st.y, d = Math.hypot(dx, dy); if (d < 160) { st.vx += dx / d * 1.6 * (1 - d / 160); st.vy += dy / d * 1.6 * (1 - d / 160); } } st.vx *= .86; st.vy *= .86; st.x += st.vx; st.y += st.vy;
      const r1 = (st.s.ret || {}).r1m || 0, rad = 1 + (st.s.ws || 1) * .45, tw = .7 + .3 * Math.sin(t * 3 + st.ph), c = r1 >= 0 ? [52, 211, 153] : [248, 113, 113];
      const gl = g.createRadialGradient(st.x, st.y, 0, st.x, st.y, rad * 4); gl.addColorStop(0, `rgba(${c},${.9 * tw})`); gl.addColorStop(1, 'transparent'); g.fillStyle = gl; g.beginPath(); g.arc(st.x, st.y, rad * 4, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(st.x, st.y, rad * .6, 0, 7); g.fill();
      if (m.on && Math.hypot(m.x - st.x, m.y - st.y) < rad * 3 + 4) hov = st; if ((st.s.ws || 0) >= 9 && W > 600) { g.fillStyle = 'rgba(226,232,240,.75)'; g.font = '700 10px Inter'; g.fillText(st.s.t, st.x + 6, st.y - 6); } });
    tip(hov ? `<b>${esc(hov.s.t)}</b> ${esc(hov.s.n || '')} · score ${hov.s.ws}/10 · 1M ${pct((hov.s.ret || {}).r1m)}` : '', m.x, m.y); el.style.cursor = hov ? 'pointer' : ''; el.__hov = hov;
  }); el.addEventListener('click', () => { if (el.__hov) location.hash = '#/stock/' + el.__hov.s.t; }); return el;
}

/* =========== 3. MARKET GLOBE =========== */
function globe() {
  const IDX = {}; (MK.glob || []).forEach(g => g[1].forEach(r => { IDX[r[0]] = r; }));
  const C = [['New York', 40.7, -74, '^GSPC', -5, 9.5, 16], ['Toronto', 43.6, -79.4, null, -5, 9.5, 16], ['São Paulo', -23.5, -46.6, null, -3, 10, 17], ['London', 51.5, -.1, '^FTSE', 0, 8, 16.5], ['Frankfurt', 50.1, 8.7, '^GDAXI', 1, 9, 17.5], ['Paris', 48.9, 2.35, '^FCHI', 1, 9, 17.5], ['Tel Aviv', 32.1, 34.8, '^TA125.TA', 2, 9.9, 17.25], ['Mumbai', 19.1, 72.9, '^BSESN', 5.5, 9.25, 15.5], ['Shanghai', 31.2, 121.5, '000001.SS', 8, 9.5, 15], ['Hong Kong', 22.3, 114.2, '^HSI', 8, 9.5, 16], ['Taipei', 25, 121.5, '^TWII', 8, 9, 13.5], ['Seoul', 37.6, 127, '^KS11', 9, 9, 15.5], ['Tokyo', 35.7, 139.7, '^N225', 9, 9, 15.5], ['Sydney', -33.9, 151.2, null, 10, 10, 16]];
  const open = c => { const now = new Date(), h = (now.getUTCHours() + now.getUTCMinutes() / 60 + c[4] + 24) % 24, wd = new Date(now.getTime() + c[4] * 36e5).getUTCDay(); return wd > 0 && wd < 6 && h >= c[5] && h < c[6]; };
  const el = frame('globe', 'Around the world', 'The market <em>never sleeps</em>.', 'Exchanges light up as they open. Arcs carry each market\'s last move back to Wall Street. Drag to spin.', '● open · ○ closed · arc = last day move');
  const pts = []; for (let la = -80; la <= 80; la += 6) for (let lo = -180; lo < 180; lo += 6 / Math.max(.2, Math.cos(la * Math.PI / 180))) pts.push([la, lo]);
  let rot = -40, drag = null; el.addEventListener('pointerdown', e => { drag = e.clientX; }); addEventListener('pointerup', () => { drag = null; }); el.addEventListener('pointermove', e => { if (drag != null) { rot += (e.clientX - drag) * .4; drag = e.clientX; } });
  host(el, (g, W, H, t, m, tip) => {
    g.clearRect(0, 0, W, H); const r = Math.min(H * .42, W * .3), cx = W < 600 ? W / 2 : W * .68, cy = H * .56 + (W < 600 ? 20 : 0); if (drag == null) rot += .12; const rr = rot * Math.PI / 180, tilt = .85, LB = [];
    const pr = (la, lo) => { const a = la * Math.PI / 180, b = lo * Math.PI / 180 + rr, x = Math.cos(a) * Math.sin(b), y0 = Math.sin(a), z0 = Math.cos(a) * Math.cos(b), y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt); return [cx + x * r, cy - y * r, z]; };
    const halo = g.createRadialGradient(cx, cy, r * .8, cx, cy, r * 1.35); halo.addColorStop(0, 'rgba(56,189,248,.25)'); halo.addColorStop(1, 'transparent'); g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, r * 1.35, 0, 7); g.fill();
    g.fillStyle = 'rgba(8,22,60,.9)'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    pts.forEach(p => { const q = pr(p[0], p[1]); if (q[2] > 0) { g.fillStyle = `rgba(148,197,255,${.12 + q[2] * .55})`; g.fillRect(q[0] - .9, q[1] - .9, 1.8, 1.8); } });
    const ny = pr(C[0][1], C[0][2]); let hov = null;
    C.forEach((c, i) => { const q = pr(c[1], c[2]); if (q[2] < -.05) return; const ix = c[3] && IDX[c[3]], mv = ix ? ix[2][0] : null, o = open(c);
      if (i && mv != null && ny[2] > -.2) { const mx = (q[0] + ny[0]) / 2, my = Math.min(q[1], ny[1]) - 40 - Math.abs(q[0] - ny[0]) * .25, ph = (t * .35 + i * .13) % 1; g.strokeStyle = mv >= 0 ? 'rgba(52,211,153,.55)' : 'rgba(248,113,113,.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(q[0], q[1]); g.quadraticCurveTo(mx, my, ny[0], ny[1]); g.stroke();
        const bx = (1 - ph) ** 2 * q[0] + 2 * (1 - ph) * ph * mx + ph * ph * ny[0], by = (1 - ph) ** 2 * q[1] + 2 * (1 - ph) * ph * my + ph * ph * ny[1]; g.fillStyle = '#fff'; g.beginPath(); g.arc(bx, by, 2.2, 0, 7); g.fill(); }
      const pul = o ? 6 + 4 * Math.sin(t * 4 + i) : 0; if (o) { g.fillStyle = 'rgba(52,211,153,.25)'; g.beginPath(); g.arc(q[0], q[1], 6 + pul, 0, 7); g.fill(); }
      g.fillStyle = o ? '#34D399' : 'rgba(0,0,0,0)'; g.strokeStyle = o ? '#34D399' : '#94A3B8'; g.lineWidth = 1.5; g.beginPath(); g.arc(q[0], q[1], 4, 0, 7); g.fill(); g.stroke();
      if (q[2] > .25 && W > 600 && !LB.some(b => Math.abs(b[0] - q[0]) < 70 && Math.abs(b[1] - q[1]) < 14)) { LB.push([q[0], q[1]]); g.fillStyle = '#E2E8F0'; g.font = '700 10.5px Inter'; g.fillText(c[0] + (mv != null ? ' ' + pct(mv) : ''), q[0] + 7, q[1] + 3); }
      if (m.on && Math.hypot(m.x - q[0], m.y - q[1]) < 10) hov = [c, mv, o]; });
    tip(hov ? `<b>${hov[0][0]}</b> · ${hov[2] ? '🟢 open now' : 'closed'}${hov[1] != null ? ' · last day ' + pct(hov[1]) : ''}` : '', m.x, m.y);
  }); return el;
}

/* =========== 4. MONEY RIVER =========== */
function river() {
  const F = window.TWFI; if (!F || !F.ACT) return null; const sb = {}, ss = {}; Object.values(F.ACT).forEach(o => { const s = (BY[o.t] || {}).sec; if (!s) return; sb[s] = (sb[s] || 0) + (o.bv || 0); ss[s] = (ss[s] || 0) + (o.sv || 0); });
  const top = o => Object.entries(o).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 6), L = top(ss), Rr = top(sb); if (!L.length || !Rr.length) return null; const TL = L.reduce((a, x) => a + x[1], 0), TR = Rr.reduce((a, x) => a + x[1], 0);
  const bn = v => '$' + (v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : (v / 1e6).toFixed(0) + 'M');
  const el = frame('river', 'Follow the money · 13F', 'Where the legends <em>moved their money</em>.', 'Left: sectors the 30 famous investors sold last quarter. Right: sectors they bought (stocks we cover). Each glowing particle is money in motion.', 'sold → bought · last quarter');
  let parts = []; host(el, (g, W, H, t, m, tip) => {
    g.clearRect(0, 0, W, H); const top0 = W < 600 ? 130 : 110, h = H - top0 - 18, x0 = W < 600 ? 92 : W * .3, x1 = W - (W < 600 ? 92 : 150);
    const lay = (A, T) => { let y = top0; return A.map(a => { const hh = Math.max(10, a[1] / T * h - 6); const o = { n: a[0], v: a[1], y, h: hh }; y += hh + 6; return o; }); }, LL = lay(L, TL), RR = lay(Rr, TR), links = [];
    LL.forEach((a, i) => RR.forEach((b, j) => { const w = a.v / TL * b.v / TR; links.push({ a, b, w, ya: a.y + a.h * (RR.slice(0, j).reduce((s, x) => s + x.v, 0) / TR) + a.h * b.v / TR / 2, yb: b.y + b.h * (LL.slice(0, i).reduce((s, x) => s + x.v, 0) / TL) + b.h * a.v / TL / 2 }); }));
    links.forEach(k => { const lw = Math.max(1, k.w * h * .9), gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, 'rgba(248,113,113,.25)'); gr.addColorStop(1, 'rgba(52,211,153,.3)'); g.strokeStyle = gr; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, k.ya); g.bezierCurveTo((x0 + x1) / 2, k.ya, (x0 + x1) / 2, k.yb, x1, k.yb); g.stroke(); });
    if (parts.length < 260) parts.push({ k: links[Math.floor(Math.random() * links.length)], p: 0, s: .003 + Math.random() * .006, o: (Math.random() - .5) });
    parts.forEach(q => { const k = q.k; if (!k) return; q.p += q.s; const u = q.p, mx = (x0 + x1) / 2, bx = (1 - u) ** 3 * x0 + 3 * (1 - u) ** 2 * u * mx + 3 * (1 - u) * u * u * mx + u ** 3 * x1, by = (1 - u) ** 3 * k.ya + 3 * (1 - u) ** 2 * u * k.ya + 3 * (1 - u) * u * u * k.yb + u ** 3 * k.yb + q.o * Math.max(1, k.w * h * .8);
      g.fillStyle = `rgba(${Math.round(lerp(248, 52, u))},${Math.round(lerp(113, 211, u))},${Math.round(lerp(113, 153, u))},.95)`; g.beginPath(); g.arc(bx, by, 1.8, 0, 7); g.fill(); }); parts = parts.filter(q => q.p < 1);
    g.font = '700 11px Inter'; LL.forEach(a => { g.fillStyle = '#F87171'; g.fillRect(x0 - 6, a.y, 6, a.h); g.fillStyle = '#E2E8F0'; g.textAlign = 'right'; g.fillText(a.n.slice(0, W < 600 ? 12 : 24), x0 - 12, a.y + a.h / 2 + 2); g.fillStyle = '#F87171'; g.fillText('−' + bn(a.v), x0 - 12, a.y + a.h / 2 + 15); });
    RR.forEach(b => { g.fillStyle = '#34D399'; g.fillRect(x1, b.y, 6, b.h); g.fillStyle = '#E2E8F0'; g.textAlign = 'left'; g.fillText(b.n.slice(0, W < 600 ? 12 : 24), x1 + 12, b.y + b.h / 2 + 2); g.fillStyle = '#34D399'; g.fillText('+' + bn(b.v), x1 + 12, b.y + b.h / 2 + 15); }); g.textAlign = 'left';
  }); return el;
}

/* =========== 5. BAR CHART RACE =========== */
function race() {
  const y0 = Math.round(new Date(new Date().getUTCFullYear() + '-01-01T00:00:00Z') / 864e5), days = ser('SPY').filter(p => p.d >= y0 - 3).map(p => p.d); if (days.length < 20) return null;
  const base = {}, L = S.filter(s => ser(s.t).length > 200).map(s => { const z = ser(s.t); let b = null; for (const p of z) { if (p.d <= y0) b = p; else break; } return b ? { s, b: b.c, z } : null; }).filter(Boolean);
  const val = (o, d) => { const z = o.z; let lo = 0, hi = z.length - 1, v = null; while (lo <= hi) { const mi = (lo + hi) >> 1; if (z[mi].d <= d) { v = z[mi]; lo = mi + 1; } else hi = mi - 1; } return v ? (v.c / o.b - 1) * 100 : 0; };
  const step = Math.max(1, Math.floor(days.length / 120)), D = days.filter((d, i) => i % step === 0).concat([days[days.length - 1]]), frames = D.map(d => L.map(o => [o.s, val(o, d)]).sort((a, b) => b[1] - a[1]).slice(0, 10));
  const el = frame('race', 'Year-to-date race', 'The <em>race to the top</em>.', `The 10 best performers we cover, every trading day since January 1. Watch the lead change hands.`, 'return since Jan 1 · replays');
  const pos = {}; host(el, (g, W, H, t) => {
    g.clearRect(0, 0, W, H); const dur = 14, k = (t % (dur + 3)) / dur, fi = Math.min(frames.length - 1, k * (frames.length - 1)), f = frames[Math.floor(fi)], d = D[Math.floor(fi)], top0 = W < 600 ? 128 : 112, bh = (H - top0 - 14) / 10, mx = Math.max(...f.map(x => x[1]), 10), x0 = W < 600 ? 56 : 80, w = W - x0 - (W < 600 ? 70 : 110);
    f.forEach(([s, v], i) => { const p = pos[s.t] = pos[s.t] == null ? i : lerp(pos[s.t], i, .12), y = top0 + p * bh, bw = Math.max(4, v / mx * w), c = ['#34D399', '#38BDF8', '#A78BFA', '#F472B6', '#FBBF24', '#60A5FA', '#2DD4BF', '#F87171', '#C084FC', '#4ADE80'][Math.abs(s.t.charCodeAt(0) * 7 + s.t.length) % 10];
      const gr = g.createLinearGradient(x0, 0, x0 + bw, 0); gr.addColorStop(0, c + '55'); gr.addColorStop(1, c); g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(x0, y + 3, bw, bh - 6, 6) : g.rect(x0, y + 3, bw, bh - 6); g.fill();
      g.fillStyle = '#E2E8F0'; g.font = '800 12px Inter'; g.textAlign = 'right'; g.fillText(s.t, x0 - 8, y + bh / 2 + 4); g.textAlign = 'left'; g.fillStyle = '#fff'; g.fillText(pct(v, 0), x0 + bw + 8, y + bh / 2 + 4); });
    Object.keys(pos).forEach(t2 => { if (!f.some(x => x[0].t === t2)) delete pos[t2]; });
    g.fillStyle = 'rgba(255,255,255,.12)'; g.font = `800 ${W < 600 ? 30 : 54}px 'Space Grotesk',Inter`; g.textAlign = 'right'; g.fillText(dfmt(new Date(d * 864e5).toISOString().slice(0, 10)), W - 18, H - 22); g.textAlign = 'left';
  }); return el;
}

/* =========== 6. SPLIT-FLAP BOARD =========== */
function flap() {
  const by = k => S.filter(s => nz((s.ret || {})[k])), boards = [['TOP GAINERS 1M', by('r1m').sort((a, b) => b.ret.r1m - a.ret.r1m).slice(0, 5).map(s => [s.t, pct(s.ret.r1m, 0), s.ws])], ['BIGGEST DROPS 1M', by('r1m').sort((a, b) => a.ret.r1m - b.ret.r1m).slice(0, 5).map(s => [s.t, pct(s.ret.r1m, 0), s.ws])], ['HIGHEST SCORES', S.slice().sort((a, b) => (b.ws || 0) - (a.ws || 0) || ((b.ret || {}).r1y || 0) - ((a.ret || {}).r1y || 0)).slice(0, 5).map(s => [s.t, pct((s.ret || {}).r1y, 0), s.ws])]];
  const el = frame('flap', 'Departures board', 'Now departing: <em>today\'s movers</em>.', 'An old-school trading-floor board, flipping through the market\'s biggest stories.', 'flips every 6 seconds', '<div class="bx-flap"></div>'); const bd = $('.bx-flap', el), CH = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+−%./';
  const line = (r, w) => (r[0].padEnd(6) + ' ' + String(r[1]).padStart(5) + ' ' + ('SCORE ' + r[2]).padStart(w)).toUpperCase();
  let bi = 0; const show = () => { const b = boards[bi++ % boards.length], w = innerWidth < 640 ? 8 : 9, rows = [b[0].padEnd(23)].concat(b[1].map(r => line(r, w)));
    bd.innerHTML = rows.map((r, ri) => `<div class="row">${[...r].map(c => `<span class="ch${ri ? '' : ' hd'}" data-t="${c === ' ' ? ' ' : esc(c)}"> </span>`).join('')}</div>`).join('');
    $$('.row', bd).forEach((rw, ri) => { const up = ri && b[1][ri - 1][1].startsWith('+'); $$('.ch', rw).forEach((s, ci) => { const tgt = s.dataset.t; if (ri === 0) s.style.color = '#FBBF24'; else if (ci >= 7 && ci < 12) s.classList.add(up ? 'up' : 'dn'); if (tgt === ' ') { s.style.background = 'transparent'; s.style.boxShadow = 'none'; return; } let n = RM ? 0 : 4 + Math.floor(Math.random() * 10) + ci % 5; const tick = () => { if (!s.isConnected) return; if (n-- <= 0) { s.textContent = tgt; return; } s.textContent = CH[Math.floor(Math.random() * CH.length)]; s.classList.remove('f'); void s.offsetWidth; s.classList.add('f'); setTimeout(tick, 55); }; setTimeout(tick, ri * 90 + ci * 18); }); }); };
  show(); const iv = setInterval(() => { if (!el.isConnected) { clearInterval(iv); return; } if (!RM) show(); }, 6000); return el;
}

/* =========== 7. MARKET CITY =========== */
function city() {
  const L = SEC.slice(0, 10), el = frame('city', 'Market city', 'A skyline <em>built from stocks</em>.', 'Each tower is a sector, as tall as its average score. Every window is a stock: lit green if it rose on the last trading day.', 'height = avg score · lit = up today');
  host(el, (g, W, H, t, m, tip) => {
    g.clearRect(0, 0, W, H); const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, 'rgba(14,42,107,0)'); sky.addColorStop(1, 'rgba(124,58,237,.25)'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const n = L.length, bw = Math.min(70, (W - 40) / n * .62), gap = (W - 40 - bw * n) / n, gy = H - 26, iso = bw * .35; let hov = null;
    g.fillStyle = 'rgba(56,189,248,.15)'; g.fillRect(0, gy, W, 2);
    L.forEach((s, i) => { const x = 20 + i * (bw + gap) + gap / 2, hgt = (H - 150) * (s.ws / 10) * (.92 + .08 * Math.sin(t * 1.5 + i)), y = gy - hgt;
      g.fillStyle = '#13265A'; g.fillRect(x, y, bw, hgt); g.fillStyle = '#0C1A44'; g.beginPath(); g.moveTo(x + bw, y); g.lineTo(x + bw + iso, y - iso * .6); g.lineTo(x + bw + iso, gy - iso * .6); g.lineTo(x + bw, gy); g.fill();
      g.fillStyle = '#1E3A8A'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + iso, y - iso * .6); g.lineTo(x + bw + iso, y - iso * .6); g.lineTo(x + bw, y); g.fill();
      const cols = 3, rows = Math.ceil(s.L.length / cols), wh = Math.min(10, (hgt - 14) / Math.max(rows, 1) - 3), ww = (bw - 16) / cols - 3;
      s.L.forEach((st, k) => { const cx = x + 8 + (k % cols) * (ww + 3), cy = gy - 8 - (Math.floor(k / cols) + 1) * (wh + 3), up = day(st.t) >= 0, fl = .65 + .35 * Math.sin(t * 2 + k * 1.7 + i); g.fillStyle = up ? `rgba(52,211,153,${fl})` : `rgba(100,116,139,.35)`; g.fillRect(cx, cy, ww, wh); if (up) { g.shadowColor = '#34D399'; g.shadowBlur = 8; g.fillRect(cx, cy, ww, wh); g.shadowBlur = 0; } });
      g.fillStyle = '#CBD5E1'; g.font = '700 9.5px Inter'; g.save(); g.translate(x + bw / 2, gy + 14); g.textAlign = 'center'; g.fillText(s.n.split(/[ &,]/)[0].slice(0, 11), 0, 0); g.restore();
      if (m.on && m.x > x && m.x < x + bw + iso && m.y > y - 10) hov = s; });
    tip(hov ? `<b>${esc(hov.n)}</b> · ${hov.L.length} stocks · avg score ${hov.ws.toFixed(1)} · ${hov.L.filter(s => day(s.t) >= 0).length} up today` : '', m.x, m.y);
  }); return el;
}

/* =========== 8. EARNINGS RIPPLE POND =========== */
function ripple() {
  const now = ser('SPY').slice(-1)[0], cut = now ? now.d - 45 : 0, E = S.flatMap(s => (((s.earn || {}).h || []).slice(0, 1)).filter(h => h.d && Math.round(new Date(h.d + 'T00:00:00Z') / 864e5) >= cut && nz(h.e) && nz(h.ee)).map(h => ({ t: s.t, sur: h.ee ? (h.e - h.ee) / Math.abs(h.ee) * 100 : 0, beat: h.e >= h.ee })));
  if (!E.length) return null; const el = frame('ripple', 'Earnings season', 'Every report <em>makes waves</em>.', `${E.length} companies reported in the last 45 days. Each one drops into the pond: bigger ripples = bigger surprises; green beat, red missed.`, 'ripple size = surprise vs estimate');
  let drops = [], next = 0, i = 0; host(el, (g, W, H, t, m, tip) => {
    g.fillStyle = 'rgba(5,11,34,.25)'; g.fillRect(0, 0, W, H); if (t > next) { const e = E[i++ % E.length]; drops.push({ e, x: W * (.15 + Math.random() * .8), y: 120 + Math.random() * (H - 150), t0: t }); next = t + .55; }
    drops.forEach(d => { const a = t - d.t0, mx = 30 + Math.min(140, Math.abs(d.e.sur) * 4); for (let k = 0; k < 3; k++) { const r = (a * 60 - k * 18); if (r <= 0 || r > mx) continue; const o = (1 - r / mx) * .9; g.strokeStyle = d.e.beat ? `rgba(52,211,153,${o})` : `rgba(248,113,113,${o})`; g.lineWidth = 2; g.beginPath(); g.ellipse(d.x, d.y, r, r * .42, 0, 0, 7); g.stroke(); }
      if (a < 2.2) { g.fillStyle = `rgba(255,255,255,${1 - a / 2.2})`; g.font = '800 12px Inter'; g.textAlign = 'center'; g.fillText(`${d.e.t} ${d.e.sur >= 0 ? '+' : ''}${d.e.sur.toFixed(0)}%`, d.x, d.y - 10 - a * 8); g.textAlign = 'left'; } });
    drops = drops.filter(d => t - d.t0 < 4);
  }); return el;
}

/* =========== 9. TERRAIN FLYOVER =========== */
function terrain() {
  const L = SEC.slice(0, 12), sp = ser('SPY'), wk = []; for (let i = sp.length - 1; i >= 0 && wk.length < 27; i -= 5) wk.unshift(sp[i].d);
  const M = L.map(s => wk.map(d => { const v = s.L.map(st => { const z = ser(st.t); let b = null; for (let k = z.length - 1; k >= 0; k--) if (z[k].d <= d) { b = z[k]; break; } const a = z.find(p => p.d >= wk[0]); return a && b ? (b.c / a.c - 1) * 100 : 0; }); return v.reduce((a, x) => a + x, 0) / (v.length || 1); }));
  const el = frame('terrain', '6-month landscape', 'Fly over the <em>market\'s terrain</em>.', 'Mountains are sectors that climbed over the last 6 months; valleys are the ones that sank. Each ridge is one sector, from back to front.', 'height = return since 6 months ago');
  host(el, (g, W, H, t) => {
    g.clearRect(0, 0, W, H); const nx = wk.length, nz2 = L.length, mx = Math.max(10, ...M.flat().map(Math.abs)), cam = t * .25;
    for (let j = nz2 - 1; j >= 0; j--) { const z = j / nz2, sc = .55 + .45 * (1 - z), yb = H * (.42 + .5 * (1 - z)), xoff = (1 - sc) * W / 2; g.beginPath();
      for (let i = 0; i < nx; i++) { const x = xoff + i / (nx - 1) * W * sc, wob = Math.sin(i * .5 + cam + j) * 3, y = yb - M[j][i] / mx * 70 * sc + wob; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.lineTo(xoff + W * sc, H); g.lineTo(xoff, H); g.closePath(); const last = M[j][nx - 1], gr = g.createLinearGradient(0, yb - 80, 0, yb + 40); gr.addColorStop(0, last >= 0 ? `rgba(52,211,153,${.25 + .5 * (1 - z)})` : `rgba(248,113,113,${.25 + .5 * (1 - z)})`); gr.addColorStop(1, 'rgba(5,11,34,.95)'); g.fillStyle = gr; g.fill();
      g.strokeStyle = last >= 0 ? `rgba(110,231,183,${.4 + .6 * (1 - z)})` : `rgba(252,165,165,${.4 + .6 * (1 - z)})`; g.lineWidth = 1.2; g.stroke();
      if (W > 600 || j % 2 === 0) { g.fillStyle = `rgba(226,232,240,${.5 + .5 * (1 - z)})`; g.font = `700 ${Math.round(9 + 3 * (1 - z))}px Inter`; g.fillText(L[j].n.slice(0, 18) + ' ' + pct(last, 0), xoff + W * sc - (W < 600 ? 110 : 160) * sc, yb - M[j][nx - 1] / mx * 70 * sc - 6); } }
  }); return el;
}

/* =========== 10. SCORE DNA =========== */
function dna(t) {
  const s = BY[t]; if (!s || !s.P) return null; const P = s.P, K = [['Momentum', P.m], ['Earnings', P.e], ['Growth', P.g], ['Profitability', P.p], ['Health', P.b]];
  const el = frame('dna', 'Score DNA · ' + esc(t), `${esc(t)}'s <em>DNA</em>: ${s.ws}/10.`, 'Five strands, one for each pillar of the Tickerwise Score. Longer, brighter rungs = stronger pillar.', K.map(k => k[0] + ' ' + (k[1] != null ? k[1] : '—')).join(' · '));
  host(el, (g, W, H, tt) => {
    g.clearRect(0, 0, W, H); const x0 = W < 600 ? 20 : W * .45, x1 = W - 20, n = 34, cy = H * .62, amp = Math.min(70, H * .2);
    for (let i = 0; i < n; i++) { const x = x0 + i / (n - 1) * (x1 - x0), a = i * .45 + tt * 1.4, y1 = cy + Math.sin(a) * amp, y2 = cy - Math.sin(a) * amp, z = Math.cos(a), k = K[i % 5], v = (k[1] || 0) / 100, c = v >= .66 ? [52, 211, 153] : v >= .4 ? [251, 191, 36] : [248, 113, 113];
      g.strokeStyle = `rgba(${c},${.25 + .6 * v * (.6 + .4 * Math.abs(z))})`; g.lineWidth = 2 + 3 * v; g.beginPath(); const mid = (y1 + y2) / 2, half = (y2 - y1) / 2 * (.3 + .7 * v); g.moveTo(x, mid - half); g.lineTo(x, mid + half); g.stroke();
      [[y1, z], [y2, -z]].forEach(([y, zz]) => { g.fillStyle = zz > 0 ? '#38BDF8' : 'rgba(56,189,248,.35)'; g.beginPath(); g.arc(x, y, 3 + 2 * Math.max(0, zz), 0, 7); g.fill(); });
      if (i < 5 && W > 600) { g.fillStyle = `rgb(${c})`; g.font = '800 11px Inter'; g.fillText(k[0] + ' ' + (k[1] != null ? k[1] : '—'), 24, H - 120 + i * 20); } }
  }); return el;
}

/* =========== 11. DATA RAIN =========== */
function rain() {
  const T = window.TWT, sig = T && T.sigAll ? T.sigAll().filter(x => x.L.length) : [], HL = sig.slice(0, 6).map(x => `${String(x.n || x.k || 'SIGNAL').toUpperCase()}: ${x.L.slice(0, 3).map(r => r.t || (r.s && r.s.t) || '').join(' ')}`).filter(h => h.length > 8);
  const heads = HL.length ? HL : S.slice().sort((a, b) => (b.ws || 0) - (a.ws || 0)).slice(0, 5).map(s => `${s.t} SCORES ${s.ws}/10`), POOL = S.map(s => s.t).concat(S.map(s => (s.ws || 0) + '/10'));
  const el = frame('rain', 'Live signal feed', 'Out of the noise, <em>a signal</em>.', 'Thousands of data points pour in. Every few seconds the rain locks into one of today\'s real signals.', 'from today\'s Signals scan');
  let cols = null, hi = 0, h0 = 0; host(el, (g, W, H, t) => {
    const fs = 14; if (!cols || cols.W !== W) { cols = Array.from({ length: Math.ceil(W / fs) }, () => Math.random() * -40); cols.W = W; g.fillStyle = '#050B22'; g.fillRect(0, 0, W, H); }
    g.fillStyle = 'rgba(5,11,34,.14)'; g.fillRect(0, 0, W, H); g.font = `700 ${fs}px ui-monospace,Menlo,monospace`;
    cols.forEach((y, i) => { const yy = Math.abs(Math.floor(y)), s = POOL[(i * 7 + yy) % POOL.length] || '0', ch = s[yy % s.length] || '0'; g.fillStyle = Math.random() < .03 ? '#fff' : `rgba(52,211,153,${.5 + Math.random() * .5})`; g.fillText(ch, i * fs, y * fs); cols[i] = y * fs > H && Math.random() > .97 ? 0 : y + .5 + (i % 3) * .15; });
    const cyc = 5, k = Math.floor(t / cyc); if (k !== h0) { h0 = k; hi++; } const head = heads[hi % heads.length], p = (t % cyc) / cyc, fsz = W < 600 ? 15 : 22; g.font = `800 ${fsz}px ui-monospace,Menlo,monospace`; const tw = g.measureText(head).width, scale = Math.min(1, (W - 30) / tw); g.save(); g.translate(W / 2, H * .7); g.scale(scale, scale);
    const lock = Math.min(1, p * 2.2), fade = p > .85 ? (1 - p) / .15 : 1; [...head].forEach((c, j) => { const done = j / head.length < lock, x = -tw / 2 + j * tw / head.length; g.fillStyle = done ? `rgba(255,255,255,${fade})` : `rgba(52,211,153,${.8 * fade})`; if (done) { g.shadowColor = '#34D399'; g.shadowBlur = 12; } g.fillText(done ? c : String.fromCharCode(48 + Math.floor(Math.random() * 42)), x, 0); g.shadowBlur = 0; }); g.restore();
  }); return el;
}

/* =========== 12. HOLOGRAPHIC CARDS =========== */
function holo() {
  const top = S.slice().sort((a, b) => (b.ws || 0) - (a.ws || 0) || ((b.ret || {}).r1y || 0) - ((a.ret || {}).r1y || 0)).slice(0, 4);
  const el = frame('holo', 'Collector\'s edition', 'The <em>top-scored</em> stocks.', 'Today\'s four highest Tickerwise Scores as holographic cards. Move your mouse over them, or tilt your phone.', '', `<div class="bx-holo">${top.map(s => `<a href="#/stock/${esc(s.t)}"><b>${esc(s.t)}</b><span>${esc(s.n || '')}</span><div class="sc">${s.ws}/10</div><span>1Y ${pct((s.ret || {}).r1y, 0)} · ${esc(s.sec || '')}</span></a>`).join('')}</div>`);
  const tilt = (a, rx, ry, mx, my) => { a.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`; a.style.setProperty('--mx', mx + '%'); a.style.setProperty('--my', my + '%'); a.style.setProperty('--a', (ry * 8 + rx * 5) + 'deg'); a.style.setProperty('--o', .35 + Math.min(.4, (Math.abs(rx) + Math.abs(ry)) / 40)); };
  setTimeout(() => $$('.bx-holo a', el).forEach(a => { a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; tilt(a, (.5 - py) * 22, (px - .5) * 26, px * 100, py * 100); }); a.addEventListener('pointerleave', () => tilt(a, 0, 0, 50, 30)); }), 0);
  if (!RM) { let t = 0; const idle = () => { if (!el.isConnected) return; t += .016; if (!el.matches(':hover')) $$('.bx-holo a', el).forEach((a, i) => tilt(a, Math.sin(t + i) * 6, Math.cos(t * .8 + i) * 8, 50 + Math.sin(t + i) * 30, 30 + Math.cos(t + i) * 20)); requestAnimationFrame(idle); }; requestAnimationFrame(idle); }
  addEventListener('deviceorientation', e => { if (!el.isConnected || e.beta == null) return; $$('.bx-holo a', el).forEach(a => tilt(a, clamp(e.beta - 45, -20, 20) * .6, clamp(e.gamma, -20, 20) * .8, 50 + e.gamma, 50 - (e.beta - 45))); }); return el;
}

/* =========== 13. MARKET AURORA =========== */
function aurora() {
  const up = S.filter(s => day(s.t) > 0).length, br = up / S.length, el = frame('aurora', 'Market breadth', `<em>${up} of ${S.length}</em> stocks rose.`, `The northern lights take the market's mood: they glow green when most stocks rise and red when most fall. Last trading day: ${Math.round(br * 100)}% up.`, 'color = share of stocks that rose');
  const hue = br >= .5 ? lerp(150, 165, (br - .5) * 2) : lerp(0, 150, br * 2), hue2 = hue + 50;
  let st = null; host(el, (g, W, H, t) => { if (!st || st.W !== W) { st = Array.from({ length: 160 }, () => [Math.random() * W, Math.random() * H * .7, Math.random()]); st.W = W; }
    g.fillStyle = '#040A1F'; g.fillRect(0, 0, W, H); st.forEach(s => { g.fillStyle = `rgba(255,255,255,${.2 + .6 * Math.abs(Math.sin(t * .8 + s[2] * 10))})`; g.fillRect(s[0], s[1], 1.2, 1.2); }); g.globalCompositeOperation = 'lighter';
    for (let b = 0; b < 4; b++) { const yb = H * (.35 + b * .1), hh = H * (.28 - b * .03); for (let x = 0; x < W; x += 4) { const y = yb + Math.sin(x / (140 + b * 30) + t * (.35 + b * .12)) * 26 + Math.sin(x / 57 - t * .6) * 10, a = .07 + .05 * Math.sin(x / 90 + t + b), gr = g.createLinearGradient(0, y - hh, 0, y); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.7, `hsla(${b % 2 ? hue2 : hue},90%,60%,${a})`); gr.addColorStop(1, `hsla(${hue},95%,70%,${a * 1.6})`); g.fillStyle = gr; g.fillRect(x, y - hh, 4, hh); } }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#020617'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, H - 26 - Math.abs(Math.sin(x * .013) * 22) - Math.abs(Math.sin(x * .041)) * 10); g.lineTo(W, H); g.fill();
  }); return el;
}

/* =========== 14. MAGNETIC CANDLES =========== */
function magnet() {
  const z = ser('SPY').slice(-120), el = frame('magnet', 'S&P 500 · last 120 days', 'Candles that <em>feel your cursor</em>.', 'The last 120 trading days of the S&P 500. Each candle bends toward your pointer like iron filings near a magnet.', 'green = up day · red = down day');
  host(el, (g, W, H, t, m) => { g.clearRect(0, 0, W, H); if (z.length < 3) return; const mn = Math.min(...z.map(p => p.c)), mx = Math.max(...z.map(p => p.c)), x0 = 20, w = W - 40, top0 = 120, h = H - top0 - 20, n = z.length, bw = w / n;
    const px = m.on ? m.x : W / 2 + Math.cos(t * .6) * W * .3, py = m.on ? m.y : top0 + h / 2 + Math.sin(t * .9) * h * .3;
    for (let i = 1; i < n; i++) { const a = z[i - 1].c, b = z[i].c, x = x0 + i * bw, y1 = top0 + (1 - (a - mn) / (mx - mn)) * h, y2 = top0 + (1 - (b - mn) / (mx - mn)) * h, cx = x, cy = (y1 + y2) / 2, dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy), f = Math.max(0, 1 - d / 220), ang = Math.atan2(dy, dx) - Math.PI / 2;
      g.save(); g.translate(cx, cy); g.rotate(ang * f * .9); g.scale(1 + f * .6, 1 + f * .25); const hh = Math.max(2, Math.abs(y2 - y1)), up = b >= a; g.fillStyle = up ? '#34D399' : '#F87171'; g.shadowColor = g.fillStyle; g.shadowBlur = 6 * f;
      g.fillRect(-Math.max(1.5, bw * .32), -hh / 2, Math.max(3, bw * .64), hh); g.fillRect(-.5, -hh / 2 - 4, 1, hh + 8); g.restore(); }
    g.fillStyle = 'rgba(56,189,248,.15)'; g.beginPath(); g.arc(px, py, 26 + 4 * Math.sin(t * 4), 0, 7); g.fill();
  }); return el;
}

/* =========== 15. SCROLL STORY =========== */
function story() {
  const y0 = Math.round(new Date(new Date().getUTCFullYear() + '-01-01T00:00:00Z') / 864e5), z = ser('SPY').filter(p => p.d >= y0 - 3); if (z.length < 20) return null;
  const big = ['NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'TSLA', 'AVGO'].map(t => BY[t]).filter(Boolean).flatMap(s => ((s.earn || {}).h || []).filter(h => h.d && Math.round(new Date(h.d + 'T00:00:00Z') / 864e5) >= y0).map(h => ({ t: s.t, d: Math.round(new Date(h.d + 'T00:00:00Z') / 864e5), beat: h.e >= h.ee })));
  const fomc = (MK.fomc || []).map(d => Math.round(new Date(d + 'T00:00:00Z') / 864e5)).filter(d => d >= y0 && d <= z[z.length - 1].d);
  const el = frame('story', 'The year so far', 'Scroll to <em>tell the story</em>.', 'The S&P 500 this year, drawn as you scroll. Big-tech earnings pop up along the way.', 'line draws with your scroll');
  host(el, (g, W, H, t) => { g.clearRect(0, 0, W, H); const r = el.getBoundingClientRect(), vh = innerHeight, prog = RM ? 1 : clamp((vh - r.top) / (vh * .9), 0, 1), mn = Math.min(...z.map(p => p.c)), mx = Math.max(...z.map(p => p.c)), x0 = 24, w = W - 48, top0 = 118, h = H - top0 - 30;
    const X = i => x0 + i / (z.length - 1) * w, Y = c => top0 + (1 - (c - mn) / (mx - mn)) * h, k = Math.max(1, Math.floor(prog * (z.length - 1)));
    g.strokeStyle = 'rgba(148,163,184,.15)'; g.setLineDash([4, 6]); g.beginPath(); g.moveTo(x0, Y(z[0].c)); g.lineTo(x0 + w, Y(z[0].c)); g.stroke(); g.setLineDash([]);
    const gr = g.createLinearGradient(0, top0, 0, top0 + h); gr.addColorStop(0, 'rgba(56,189,248,.35)'); gr.addColorStop(1, 'rgba(56,189,248,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(X(0), top0 + h); for (let i = 0; i <= k; i++) g.lineTo(X(i), Y(z[i].c)); g.lineTo(X(k), top0 + h); g.fill();
    g.strokeStyle = '#38BDF8'; g.lineWidth = 2.5; g.shadowColor = '#38BDF8'; g.shadowBlur = 10; g.beginPath(); for (let i = 0; i <= k; i++) i ? g.lineTo(X(i), Y(z[i].c)) : g.moveTo(X(i), Y(z[i].c)); g.stroke(); g.shadowBlur = 0;
    const cur = z[k], idx = d => z.findIndex(p => p.d >= d); fomc.forEach(d => { const i = idx(d); if (i >= 0 && i <= k) { g.fillStyle = '#FBBF24'; g.fillRect(X(i) - 1, top0, 2, h); g.font = '700 9.5px Inter'; g.fillText('Fed', X(i) + 3, top0 + 10); } });
    big.forEach((b, j) => { const i = idx(b.d); if (i < 0 || i > k) return; const y = Y(z[i].c) - 14 - (j % 3) * 14; g.fillStyle = b.beat ? '#34D399' : '#F87171'; g.beginPath(); g.arc(X(i), Y(z[i].c), 3.5, 0, 7); g.fill(); if (W > 600) { g.font = '800 10px Inter'; g.fillText(b.t, X(i) - 10, y); } });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(X(k), Y(cur.c), 5 + 2 * Math.sin(t * 5), 0, 7); g.fill(); g.font = '800 14px Inter'; g.textAlign = X(k) > W - 120 ? 'right' : 'left'; g.fillText(`${dfmt(new Date(cur.d * 864e5).toISOString().slice(0, 10))}  ${pct((cur.c / z[0].c - 1) * 100)}`, X(k) + (g.textAlign === 'right' ? -10 : 10), Y(cur.c) - 10); g.textAlign = 'left';
  }); return el;
}

/* =========== 16. AI SCANNER =========== */
function scanner() {
  const T = window.TWT, rows = S.slice().sort(() => Math.random() - .5).slice(0, 40), find = [];
  S.forEach(s => { const r = (s.tech || {}).rsi; if ((s.ws || 0) >= 8 && nz(r) && r < 40) find.push(`<b>${s.t}</b> scores ${s.ws}/10 but RSI is ${Math.round(r)}: a strong stock that is oversold.`); if ((s.earn || {}).streak >= 8) find.push(`<b>${s.t}</b> has beaten earnings ${s.earn.streak} quarters in a row.`); if ((s.tech || {}).v200 > 0 && ((s.ret || {}).r1m || 0) < -10 && (s.ws || 0) >= 7) find.push(`<b>${s.t}</b> fell ${Math.abs(s.ret.r1m).toFixed(0)}% this month but is still in a long-term uptrend.`); });
  const F = find.sort(() => Math.random() - .5).slice(0, 8); if (!F.length) F.push('Scanning…');
  const el = frame('scanner', 'Tickerwise AI scanner', 'The scanner <em>never blinks</em>.', `It sweeps all ${S.length} stocks for setups that matter and writes up what it finds.`, 'findings are from today\'s data', `<div class="bx-scan"><div class="ls">${rows.map(s => `<div data-t="${esc(s.t)}"><span>${esc(s.t)}</span><span>${s.ws}/10</span><span>RSI ${nz((s.tech || {}).rsi) ? Math.round(s.tech.rsi) : '—'}</span></div>`).join('')}<div class="ln"></div></div><div class="ty"></div></div>`);
  const ls = $('.ls', el), ln = $('.ln', el), ty = $('.ty', el); let y = 0, dir = 1, fi = 0, ci = 0, buf = '';
  const tick = () => { if (!el.isConnected) return; y += dir * 2; if (y > ls.clientHeight - 26 || y < 0) dir *= -1; ln.style.top = y + 'px'; const items = $$('div[data-t]', ls), k = Math.floor((y + 13) / 21); items.forEach((d, i) => d.classList.toggle('hit', i === k));
    const txt = F[fi % F.length]; if (ci <= txt.length) { buf = txt.slice(0, ci); if (txt[ci] === '<') { ci = txt.indexOf('>', ci) + 1; } else ci++; ty.innerHTML = '› ' + buf + '<span class="cur"></span>'; } else if (ci++ > txt.length + 90) { fi++; ci = 0; }
    setTimeout(() => requestAnimationFrame(tick), 28); };
  if (RM) ty.innerHTML = '› ' + F[0]; else tick(); return el;
}

/* =========== 17. LIVING CELLS =========== */
function cells() {
  const L = SEC.slice(0, 14), el = frame('cells', 'Living market', 'The market is <em>alive</em>.', 'Each cell is a sector, sized by how many stocks we cover and colored by its last month. Cells breathe and jostle; grab one and throw it.', 'size = stocks covered · color = 1-month move');
  let B = null, grab = null; el.addEventListener('pointerdown', e => { const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; grab = B && B.find(b => Math.hypot(b.x - x, b.y - y) < b.r); }); addEventListener('pointerup', () => { grab = null; });
  host(el, (g, W, H, t, m, tip) => {
    if (!B || B.W !== W) { const tot = L.reduce((a, s) => a + s.L.length, 0), area = W * (H - 100) * .5; B = L.map(s => ({ s, r: Math.sqrt(s.L.length / tot * area / Math.PI), x: W * (.2 + Math.random() * .6), y: 120 + Math.random() * (H - 160), vx: 0, vy: 0 })); B.W = W; }
    g.clearRect(0, 0, W, H); let hov = null;
    B.forEach(b => { b.vx += (W * .55 - b.x) * .0006; b.vy += ((H + 100) / 2 - b.y) * .0012; if (grab === b && m.on) { b.vx += (m.x - b.x) * .2; b.vy += (m.y - b.y) * .2; } });
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) { const a = B[i], b = B[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, o = a.r + b.r + 4 - d; if (o > 0) { const f = o * .03; a.vx -= dx / d * f; a.vy -= dy / d * f; b.vx += dx / d * f; b.vy += dy / d * f; } }
    B.forEach((b, i) => { b.vx *= .9; b.vy *= .9; b.x = clamp(b.x + b.vx, b.r, W - b.r); b.y = clamp(b.y + b.vy, 100 + b.r, H - b.r); const br = b.r * (1 + .04 * Math.sin(t * 2 + i)), v = b.s.r1m;
      g.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 2, rr = br * (1 + .05 * Math.sin(a * 3 + t * 2 + i) + .03 * Math.sin(a * 5 - t * 3)); const x = b.x + Math.cos(a) * rr, y = b.y + Math.sin(a) * rr; k ? g.lineTo(x, y) : g.moveTo(x, y); }
      const gr = g.createRadialGradient(b.x - br * .3, b.y - br * .3, br * .1, b.x, b.y, br); gr.addColorStop(0, v >= 0 ? 'rgba(110,231,183,.95)' : 'rgba(252,165,165,.95)'); gr.addColorStop(1, v >= 0 ? `rgba(5,150,105,${.5 + Math.min(.4, Math.abs(v) / 20)})` : `rgba(185,28,28,${.5 + Math.min(.4, Math.abs(v) / 20)})`); g.fillStyle = gr; g.fill();
      if (br > 26) { g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = `800 ${Math.min(13, br / 3)}px Inter`; g.fillText(b.s.n.split(/[ &,]/)[0].slice(0, 12), b.x, b.y); g.font = `700 ${Math.min(12, br / 3.4)}px Inter`; g.fillText(pct(v, 0), b.x, b.y + 14); g.textAlign = 'left'; }
      if (m.on && Math.hypot(m.x - b.x, m.y - b.y) < br) hov = b; });
    tip(hov ? `<b>${esc(hov.s.n)}</b> · ${hov.s.L.length} stocks · 1M ${pct(hov.s.r1m)} · avg score ${hov.s.ws.toFixed(1)}` : '', m.x, m.y); el.style.cursor = hov ? 'grab' : '';
  }); return el;
}

/* =========== 18. ORBITING LEGENDS =========== */
function orbit() {
  const F = window.TWFI; if (!F || !F.INV) return null; const INV = F.INV.slice().sort((a, b) => (b.val || 0) - (a.val || 0)).slice(0, 8), hold = INV.map(m => m.H.slice(0, 3).map(h => h[0]));
  const el = frame('orbit', 'Famous investors', 'The legends <em>in orbit</em>.', 'Eight of the biggest famous-investor portfolios, each circled by its top 3 holdings. Gold lines connect legends who share a top holding.', 'moons = top 3 holdings · gold = shared');
  host(el, (g, W, H, t, m, tip) => { g.clearRect(0, 0, W, H); const cx = W / 2, cy = H * .6, RX = W * .42, RY = H * .26; const P = INV.map((v, i) => { const a = i / INV.length * Math.PI * 2 + t * .08; return { v, i, x: cx + Math.cos(a) * RX, y: cy + Math.sin(a) * RY, z: Math.sin(a) }; });
    g.strokeStyle = 'rgba(148,163,184,.12)'; g.beginPath(); g.ellipse(cx, cy, RX, RY, 0, 0, 7); g.stroke();
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const sh = hold[i].filter(x => hold[j].includes(x)); if (sh.length) { g.strokeStyle = `rgba(251,191,36,${.25 + .15 * Math.sin(t * 2 + i + j)})`; g.lineWidth = sh.length; g.beginPath(); g.moveTo(P[i].x, P[i].y); g.lineTo(P[j].x, P[j].y); g.stroke(); } }
    let hov = null; P.slice().sort((a, b) => a.z - b.z).forEach(p => { const sc = .75 + .35 * (p.z + 1) / 2, r = (W < 600 ? 13 : 20) * sc;
      hold[p.i].forEach((tk, k) => { const a = t * (.9 + k * .35) + k * 2.1, mx = p.x + Math.cos(a) * (r + 16 + k * 9) * sc, my = p.y + Math.sin(a) * (r + 10 + k * 6) * sc * .6; g.fillStyle = '#38BDF8'; g.beginPath(); g.arc(mx, my, 3.2 * sc, 0, 7); g.fill(); if (W > 600 && p.z > -.2) { g.fillStyle = 'rgba(226,232,240,.85)'; g.font = '700 9.5px Inter'; g.fillText(tk, mx + 5, my + 3); } });
      const gr = g.createRadialGradient(p.x - r * .3, p.y - r * .3, 1, p.x, p.y, r); gr.addColorStop(0, '#A78BFA'); gr.addColorStop(1, '#4C1D95'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = `800 ${Math.round(11 * sc)}px Inter`; g.textAlign = 'center'; g.fillText((p.v.name || '').split(' ').map(w => w[0]).join('').slice(0, 2), p.x, p.y + 4); if (W > 600) { g.font = '700 10.5px Inter'; g.fillStyle = 'rgba(226,232,240,.9)'; g.fillText(p.v.name, p.x, p.y + r + 14); } g.textAlign = 'left';
      if (m.on && Math.hypot(m.x - p.x, m.y - p.y) < r + 4) hov = p; });
    tip(hov ? `<b>${esc(hov.v.name)}</b> · ${esc(hov.v.firm || '')} · top: ${hold[hov.i].join(', ')}` : '', m.x, m.y); el.style.cursor = hov ? 'pointer' : ''; el.__h = hov;
  }); el.addEventListener('click', () => { if (el.__h) location.hash = '#/investors/' + el.__h.v.id; }); return el;
}

/* =========== 19. ODOMETER =========== */
function odometer() {
  const F = window.TWFI, aum = F && F.INV ? F.INV.reduce((a, m) => a + (m.val || 0), 0) : 0, nSig = window.TWT && window.TWT.sigAll ? window.TWT.sigAll().reduce((a, x) => a + x.L.length, 0) : 0, pts = S.length * 5, beats = S.reduce((a, s) => a + (((s.earn || {}).h || []).filter(h => h.e >= h.ee).length), 0);
  const stats = [[S.length, 'stocks scored nightly'], [Math.round(aum / 1e9), '$B of legend portfolios tracked'], [beats, 'earnings beats on record'], [nSig || pts, nSig ? 'live signals today' : 'pillar scores computed']];
  const el = frame('odo', 'By the numbers', 'Built on <em>real data</em>.', '', 'refreshed every night', `<div class="bx-odo">${stats.map(s => `<div><div class="num" data-v="${s[0]}">${String(s[0]).split('').map(() => `<span class="d">${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}</span>`).join('')}</div><small>${s[1]}</small></div>`).join('')}</div>`);
  const roll = () => $$('.num', el).forEach(n => { const v = String(n.dataset.v); $$('.d', n).forEach((d, i) => { d.style.transform = `translateY(-${(+v[i]) * 1.15}em)`; d.style.transitionDelay = (i * .12) + 's'; }); });
  new IntersectionObserver(es => { if (es[0].isIntersecting) { $$('.d', el).forEach(d => { d.style.transition = 'none'; d.style.transform = 'translateY(0)'; }); requestAnimationFrame(() => requestAnimationFrame(() => { $$('.d', el).forEach(d => d.style.transition = ''); roll(); })); } }, { threshold: .4 }).observe(el); return el;
}

/* =========== 20. VOLUME GLOW =========== */
function volglow(t) {
  const z = ser(t).slice(-126).filter(p => p.v); if (z.length < 30) return null; const mn = Math.min(...z.map(p => p.c)), mx = Math.max(...z.map(p => p.c)), nb = 28, bins = Array(nb).fill(0); z.forEach(p => { bins[Math.min(nb - 1, Math.floor((p.c - mn) / (mx - mn || 1) * nb))] += p.v; });
  const bmx = Math.max(...bins), poc = bins.indexOf(bmx), lc = z[z.length - 1].c, pp = (mn + (poc + .5) / nb * (mx - mn));
  const el = frame('vol', 'Volume profile · ' + esc(t), `Where ${esc(t)} <em>traded the most</em>.`, `The last 6 months of trading, stacked by price. The brightest bar (about $${pp.toFixed(2)}) is where the most shares changed hands, often a price the stock returns to.`, 'bar length = shares traded at that price');
  host(el, (g, W, H, tt) => { g.clearRect(0, 0, W, H); const top0 = 118, h = H - top0 - 16, bh = h / nb, x0 = W < 600 ? 16 : W * .38, w = W - x0 - 70;
    bins.forEach((v, i) => { const y = top0 + h - (i + 1) * bh, len = v / bmx * w * (.96 + .04 * Math.sin(tt * 2 + i)), hot = i === poc, gr = g.createLinearGradient(x0, 0, x0 + len, 0); gr.addColorStop(0, hot ? 'rgba(251,191,36,.2)' : 'rgba(56,189,248,.1)'); gr.addColorStop(1, hot ? '#FBBF24' : `rgba(56,189,248,${.35 + .6 * v / bmx})`);
      g.fillStyle = gr; g.shadowColor = hot ? '#FBBF24' : '#38BDF8'; g.shadowBlur = hot ? 18 : 8 * v / bmx; g.fillRect(x0, y + 1.5, len, bh - 3); g.shadowBlur = 0; });
    const ly = top0 + h - (lc - mn) / (mx - mn || 1) * h; g.strokeStyle = '#fff'; g.setLineDash([5, 5]); g.beginPath(); g.moveTo(x0, ly); g.lineTo(W - 12, ly); g.stroke(); g.setLineDash([]); g.fillStyle = '#fff'; g.font = '800 12px Inter'; g.fillText('$' + lc.toFixed(2) + ' now', W - 92, ly - 6);
    const sx = (tt * 120) % (w + 200) - 100 + x0, sg = g.createLinearGradient(sx - 60, 0, sx + 60, 0); sg.addColorStop(0, 'transparent'); sg.addColorStop(.5, 'rgba(255,255,255,.12)'); sg.addColorStop(1, 'transparent'); g.fillStyle = sg; g.fillRect(sx - 60, top0, 120, h);
  }); return el;
}

/* ---------- placement ---------- */
const ALL = { weather, galaxy, globe, river, race, flap, city, ripple, terrain, holo, aurora, magnet, story, scanner, cells, orbit, odometer };
function put(list, where, how) { if (!where) return; const box = document.createElement('div'); box.className = 'bx-set'; box.style.cssText = 'display:flex;flex-direction:column;gap:18px'; list.forEach(f => { try { const e = f(); if (e) box.appendChild(e); } catch (er) { if (window.console) console.error(er); } }); if (box.children.length) where[how || 'prepend'](box); }
function showcase() {
  app.innerHTML = `<section class="page-h"><div class="wrap"><h1>Motion Gallery</h1><p>All 20 live data banners in one place. Every one is drawn in real time from real Tickerwise data.</p></div></section><section class="sec" style="padding-top:22px"><div class="wrap bx-gal" id="bx-gal"></div></section>`; document.title = 'Motion Gallery — Tickerwise';
  const gal = $('#bx-gal'), T = BY.NVDA ? 'NVDA' : S[0].t; [['Market Weather', weather], ['Market Globe', globe], ['Money River', river], ['Bar Chart Race', race], ['Departures Board', flap], ['Market City', city], ['Earnings Ripple Pond', ripple], ['Terrain Flyover', terrain], ['Score DNA', () => dna(T)], ['Data Rain', rain], ['Market Aurora', aurora], ['Volume Glow', () => volglow(T)]].forEach(([n, f], i) => { const h = document.createElement('h4'); h.textContent = (i + 1) + '. ' + n; gal.appendChild(h); try { const e = f(); if (e) gal.appendChild(e); } catch (er) { if (window.console) console.error(er); } });
}
const done = new Set();
function route() {
  $$('.bx-set').forEach(x => { if (!document.body.contains(x)) return; }); const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('?')[0].split('/'), k = p[0] || 'home';
  if (k === 'showcase') { showcase(); window.scrollTo(0, 0); return; }
  let n = 0; const wait = (ok, fn) => { const go = () => { if (ok()) fn(); else if (n++ < 40) setTimeout(go, 200); }; setTimeout(go, 500); };
  const W = () => !$('#app .bx-set') && $('#app .sec .wrap'), first = () => $('#app .sec .wrap');
  if (k === 'home') wait(() => !$('#app .bx-set') && $('#app section:nth-of-type(2)'), () => { const s2 = $('#app section:nth-of-type(2)'), sec = document.createElement('section'); sec.className = 'sec'; sec.style.paddingTop = '18px'; sec.innerHTML = '<div class="wrap"></div>'; s2.before(sec); put([flap], sec.firstChild, 'append'); });
  const map = { markets: [weather, globe, terrain], investors: [river], signals: [rain], dashboard: [city], calendar: [ripple], briefing: [ripple], community: [aurora], learn: [] };
  if (k === 'tools') wait(() => $('#app .tt-g') && !$('#bx-tt'), () => $('#app .tt-g').insertAdjacentHTML('beforeend', '<a class="tt-tool" id="bx-tt" href="#/showcase"><em>New</em><i>✨</i><b>Motion Gallery</b><span>All 20 live data banners in one place.</span></a>'));
  if (map[k] && !(k === 'investors' && p[1]) && !(k === 'paper' && p[1])) wait(W, () => put(map[k], first()));
  if (k === 'stock' && p[1]) { const t = decodeURIComponent(p[1]).toUpperCase(), tab = p[2] || 'overview'; wait(() => $('.main') && !$('.main .bx-set'), () => { if (tab === 'overview') put([() => dna(t)], $('.main'));  }); }
}
window.addEventListener('hashchange', () => setTimeout(route, 90)); setTimeout(route, 120);
window.TWB2 = Object.assign({ dna, volglow, showcase, frame, host, SEC }, ALL);
})();
