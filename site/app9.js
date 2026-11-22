/* ---------- Motion + home page + navigation (Nov 22, 2026).
   Motion: trader races (animated return lines with a live re-ranking leaderboard), count-up stats, a moving market-field canvas behind hero banners,
   a scrolling tape of the latest Lead Trader trades, charts that draw themselves in, and tilt-on-hover trader cards. All respect "reduce motion".
   Home page: a 4-step journey (Research → Insights → Social Trading → Paper Trading), latest articles, the Lead Trader race, the paper leaderboard and a plans teaser.
   Navigation: links in order of progression. ---------- */
(function () {
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const { S, BY, esc, nz, sg, cls, dfmt } = window.TWX || {};
const PP = window.TWPP || {}, RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const st = document.createElement('style'); st.id = 'mo-css'; st.textContent = `
.mk-hero canvas.mo-field{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.55}
.mo-race{display:grid;grid-template-columns:minmax(0,1fr) 215px;gap:12px;align-items:stretch}.mo-race>svg{width:100%;height:auto;display:block}.mo-date{font:800 13px 'Space Grotesk',sans-serif;fill:#64748B}
.mo-lb{position:relative}.mo-lb a{position:absolute;left:0;right:0;height:40px;display:flex;align-items:center;gap:8px;padding:0 6px;border-radius:10px;text-decoration:none;color:inherit;transition:top .45s cubic-bezier(.2,.8,.2,1),background .3s}.mo-lb a:hover{background:#F1F5FF}
.mo-lb b{font:700 13px 'Space Grotesk',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}.mo-lb i{width:8px;height:8px;border-radius:50%;flex:none}.mo-lb em{font-style:normal;font:800 13px 'Space Grotesk',sans-serif;flex:none}.mo-lb .rk{width:14px;font:800 12px 'Space Grotesk';color:#94A3B8;flex:none}
.mo-tape{overflow:hidden;position:relative;border-radius:14px;background:#0B1B3F;color:#fff;padding:10px 0;mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.mo-tape>div{display:flex;gap:28px;width:max-content;animation:moTape 60s linear infinite}.mo-tape:hover>div{animation-play-state:paused}.mo-tape span{display:flex;align-items:center;gap:8px;font-size:13.5px;white-space:nowrap}.mo-tape a{color:#7FE3FF;font-weight:700;text-decoration:none}.mo-tape .up{color:#34D399}.mo-tape .dn{color:#F87171}
@keyframes moTape{to{transform:translateX(-50%)}}
.mo-draw polyline{stroke-dasharray:4000;stroke-dashoffset:4000;animation:moDraw 1.8s cubic-bezier(.4,0,.2,1) forwards}@keyframes moDraw{to{stroke-dashoffset:0}}
.mo-live{display:inline-flex;align-items:center;gap:6px;font:800 11px Inter,sans-serif;letter-spacing:.08em;color:#00B86B}.mo-live:before{content:"";width:8px;height:8px;border-radius:50%;background:#00B86B;box-shadow:0 0 0 0 rgba(0,184,107,.6);animation:moPing 1.6s infinite}@keyframes moPing{70%{box-shadow:0 0 0 8px rgba(0,184,107,0)}100%{box-shadow:0 0 0 0 rgba(0,184,107,0)}}
.so-lc{transform-style:preserve-3d;will-change:transform}
.hm-j{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;position:relative}.hm-j a{position:relative;display:block;background:#fff;border:1.5px solid var(--line);border-radius:20px;padding:20px;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s,border-color .2s;overflow:hidden}
.hm-j a:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(11,27,63,.12);border-color:#2F6BFF}.hm-j .n{position:absolute;top:14px;right:16px;font:800 40px 'Space Grotesk',sans-serif;color:#EEF2F8}.hm-j i{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;font-style:normal;font-size:24px;margin-bottom:12px}
.hm-j b{display:block;font:800 19px 'Space Grotesk',sans-serif;margin-bottom:6px}.hm-j p{margin:0 0 10px;color:#475569;font-size:14px;line-height:1.5}.hm-j span{font:700 13.5px Inter,sans-serif;color:#2F6BFF}
.hm-dark{background:linear-gradient(135deg,#0B1B3F,#132a63 55%,#1E3A8A);color:#fff;position:relative;overflow:hidden}.hm-dark h2{color:#fff}.hm-dark .sec-h p{color:#C4D3F5}
.hm-2{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:26px;align-items:center}.hm-2 .mk-art{position:relative}
.hm-ins{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:18px}.hm-feat{display:flex;flex-direction:column;justify-content:flex-end;min-height:300px;border-radius:22px;padding:26px;color:#fff;text-decoration:none;background:linear-gradient(160deg,rgba(11,27,63,.2),#0B1B3F 75%),linear-gradient(135deg,#2F6BFF,#7C4DFF);position:relative;overflow:hidden}
.hm-feat h3{font:800 26px/1.2 'Space Grotesk',sans-serif;margin:10px 0 8px;color:#fff}.hm-feat p{margin:0;color:#C4D3F5}.hm-feat svg.bg{position:absolute;inset:0;width:100%;height:60%;opacity:.35}
.hm-pl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.hm-pl a{display:block;border-radius:18px;padding:18px;text-decoration:none;color:inherit;background:#fff;border:1.5px solid var(--line)}.hm-pl a.hot{border-color:#7C3AED;box-shadow:0 14px 34px rgba(124,58,237,.15)}.hm-pl b{display:block;font:800 18px 'Space Grotesk'}.hm-pl big{display:block;font:800 30px 'Space Grotesk';margin:6px 0}.hm-pl small{color:#475569;font-size:13.5px;line-height:1.5;display:block}
@media (max-width:980px){.hm-j{grid-template-columns:repeat(2,minmax(0,1fr))}.hm-2,.hm-ins{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.hm-j,.hm-pl{grid-template-columns:minmax(0,1fr)}.mo-race{grid-template-columns:minmax(0,1fr)}.mo-lb{height:auto!important}.mo-lb a{position:relative;top:auto!important}}
@media (prefers-reduced-motion:reduce){.mo-tape>div{animation:none}.mo-draw polyline{animation:none;stroke-dashoffset:0}}`;
if (!$('#mo-css')) document.head.appendChild(st);

const PAL = ['#2F6BFF', '#00B86B', '#F28C28', '#7C3AED', '#E04B4B', '#0EA5E9', '#C9A000', '#14B8A6', '#EC4899', '#64748B'];
const alive = el => document.body.contains(el);

/* ---------- race: animated return lines + a leaderboard that re-ranks as the lines move ---------- */
function raceData(kind, n) {
  if (kind === 'lt' && window.TWSO) return window.TWSO.leads().map(m => { const V = m.V, dl = V[V.length - 1][0], A = V.filter(p => p[0] >= dl - 365); return { id: m.id, name: m.name, href: '#/social/t/' + encodeURIComponent(m.id), av: PP.avatar(m.id, m.look, 26), pts: A.map(p => [p[0], (p[1] / A[0][1] - 1) * 100]) }; }).sort((a, b) => b.pts[b.pts.length - 1][1] - a.pts[a.pts.length - 1][1]).slice(0, n || 6);
  if (kind === 'pp') return (PP.demoPlayers ? PP.demoPlayers() : []).slice().sort((a, b) => b.c.ret - a.c.ret).slice(0, n || 5).map(x => { const C = PP.curve(x.P) || []; return { id: x.P.id, name: x.d.username, href: '#/paper/player/' + encodeURIComponent(x.P.id), av: PP.pAv(x, 26), pts: C.map(p => [p[0], p[1]]) }; });
  return [];
}
function race(el) {
  if (el.__race) return; el.__race = 1; const L = raceData(el.dataset.race, +el.dataset.n || 0).filter(s => s.pts.length > 3); if (!L.length) return;
  const d0 = Math.min(...L.map(s => s.pts[0][0])), d1 = Math.max(...L.map(s => s.pts[s.pts.length - 1][0])), spy = []; for (let d = d0; d <= d1; d += 3) { const a = PP.closeOn('SPY', d0), b = PP.closeOn('SPY', d); if (a && b) spy.push([d, (b.c / a.c - 1) * 100]); }
  L.push({ id: 'spx', name: 'S&P 500', pts: spy, spx: 1 }); L.forEach((s, i) => { s.col = s.spx ? '#94A3B8' : PAL[i % PAL.length]; });
  const all = L.flatMap(s => s.pts.map(p => p[1])), mx = Math.max(5, ...all), mn = Math.min(-5, ...all), W = 560, H = 300, pl = 40, pr = 16, pt = 26, pb = 22;
  const X = d => pl + (d - d0) / ((d1 - d0) || 1) * (W - pl - pr), Y = v => pt + (H - pt - pb) - (v - mn) / ((mx - mn) || 1) * (H - pt - pb);
  let grid = ''; for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) * i / 4; grid += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EEF2F8"/><text x="${pl - 5}" y="${Y(v) + 4}" text-anchor="end" font-size="10" fill="#94A3B8">${sg(v, 0)}</text>`; }
  grid += `<line x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="#CBD5E1" stroke-dasharray="3 4"/>`;
  el.innerHTML = `<div class="mo-race"><svg viewBox="0 0 ${W} ${H}">${grid}<text class="mo-date" x="${pl}" y="16"></text>${L.map(s => `<polyline data-s="${s.id}" fill="none" stroke="${s.col}" stroke-width="${s.spx ? 1.6 : 2.4}" ${s.spx ? 'stroke-dasharray="4 4"' : ''} stroke-linejoin="round"/><circle data-h="${s.id}" r="${s.spx ? 3 : 4.5}" fill="${s.col}" stroke="#fff" stroke-width="1.5"/>`).join('')}</svg>
    <div class="mo-lb" style="height:${L.length * 40}px">${L.map(s => `<a ${s.href ? `href="${s.href}"` : ''} data-r="${s.id}"><span class="rk"></span>${s.av || `<i style="background:${s.col}"></i>`}<b>${esc(s.name)}</b><em></em></a>`).join('')}</div></div>`;
  const pl_ = {}, hd = {}, row = {}; L.forEach(s => { pl_[s.id] = $(`polyline[data-s="${s.id}"]`, el); hd[s.id] = $(`circle[data-h="${s.id}"]`, el); row[s.id] = $(`a[data-r="${s.id}"]`, el); });
  const dt = $('.mo-date', el), at = (s, d) => { let v = null; for (const p of s.pts) { if (p[0] <= d) v = p[1]; else break; } return v; };
  const frame = t => { const d = d0 + (d1 - d0) * t, cur = [];
    L.forEach(s => { const pts = s.pts.filter(p => p[0] <= d); if (!pts.length) { pl_[s.id].setAttribute('points', ''); hd[s.id].setAttribute('r', 0); return; } pl_[s.id].setAttribute('points', pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')); const l = pts[pts.length - 1];
      hd[s.id].setAttribute('cx', X(l[0])); hd[s.id].setAttribute('cy', Y(l[1])); hd[s.id].setAttribute('r', s.spx ? 3 : 4.5); cur.push([s, l[1]]); });
    cur.sort((a, b) => b[1] - a[1]).forEach(([s, v], i) => { const r = row[s.id]; r.style.top = i * 40 + 'px'; $('.rk', r).textContent = i + 1; const e = $('em', r); e.textContent = sg(v, 1); e.className = cls(v); });
    dt.textContent = new Date(d * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); };
  if (RM) { frame(1); return; }
  let t0 = null, seen = false, raf = 0; const DUR = 7000, HOLD = 3500;
  const loop = ts => { if (!alive(el)) return; if (!seen) { raf = requestAnimationFrame(loop); return; } if (t0 == null) t0 = ts; const e = ts - t0; frame(Math.min(1, e / DUR)); if (e > DUR + HOLD) t0 = ts; raf = requestAnimationFrame(loop); };
  frame(0); new IntersectionObserver(es => es.forEach(x => { seen = x.isIntersecting; }), { threshold: .2 }).observe(el); raf = requestAnimationFrame(loop);
}

/* ---------- moving market field behind hero banners ---------- */
function field(host) {
  if (host.__field || RM) return; host.__field = 1; const c = document.createElement('canvas'); c.className = 'mo-field'; host.prepend(c); const x = c.getContext('2d');
  const N = 7, lines = Array.from({ length: N }, (_, i) => ({ y: 0.15 + i * 0.11, a: 6 + Math.random() * 10, f: 0.004 + Math.random() * 0.006, p: Math.random() * 6, v: 0.25 + Math.random() * 0.5, col: i % 3 ? 'rgba(127,227,255,' : 'rgba(0,227,140,' }));
  const dots = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), s: 0.0004 + Math.random() * 0.0012, r: 0.6 + Math.random() * 1.6 }));
  let w = 0, h = 0, t = 0, seen = true; const fit = () => { const r = host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }; fit(); window.addEventListener('resize', fit);
  new IntersectionObserver(es => es.forEach(e => { seen = e.isIntersecting; })).observe(host);
  const draw = () => { if (!alive(host)) return; requestAnimationFrame(draw); if (!seen) return; t += 1; x.clearRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = 1; for (let gx = (-(t * .3) % 40); gx < w; gx += 40) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, h); x.stroke(); } for (let gy = 0; gy < h; gy += 40) { x.beginPath(); x.moveTo(0, gy); x.lineTo(w, gy); x.stroke(); }
    lines.forEach((l, i) => { x.beginPath(); for (let px = 0; px <= w; px += 6) { const k = px + t * l.v * 2, yy = h * l.y + Math.sin(k * l.f + l.p) * l.a + Math.sin(k * l.f * 2.7 + i) * l.a * .45 - (px / w) * 18; px ? x.lineTo(px, yy) : x.moveTo(px, yy); } x.strokeStyle = l.col + (0.10 + (i % 3) * 0.05) + ')'; x.lineWidth = 1.4; x.shadowColor = l.col + '0.6)'; x.shadowBlur = 8; x.stroke(); x.shadowBlur = 0; });
    dots.forEach(d => { d.x -= d.s; if (d.x < 0) { d.x = 1; d.y = Math.random(); } x.fillStyle = 'rgba(127,227,255,.5)'; x.beginPath(); x.arc(d.x * w, d.y * h, d.r, 0, 7); x.fill(); }); };
  draw();
}

/* ---------- count-up numbers ---------- */
function countUp(b) { if (b.__cu || RM) return; const m = (b.textContent || '').match(/^([^\d−-]*)([−-]?)([\d,]*\.?\d+)(.*)$/); if (!m) return; b.__cu = 1;
  const pre = m[1], neg = m[2], num = +m[3].replace(/,/g, ''), dec = (m[3].split('.')[1] || '').length, suf = m[4], comma = m[3].includes(',');
  const fmt = v => pre + neg + (comma ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec)) + suf; b.textContent = fmt(0);
  const io = new IntersectionObserver(es => { if (!es[0].isIntersecting) return; io.disconnect(); const t0 = performance.now(), run = ts => { const k = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - k, 3); b.textContent = fmt(num * e); if (k < 1) requestAnimationFrame(run); }; requestAnimationFrame(run); }); io.observe(b); }

/* ---------- trade tape ---------- */
function tape(el) { if (el.__tape || !window.TWSO) return; el.__tape = 1; const L = window.TWSO.leads(), ev = window.TWSO.trades(L).slice(0, 18); if (!ev.length) return;
  const one = ev.map(e => `<span>${PP.avatar(e.m.id, e.m.look, 22)}<a href="#/social/t/${encodeURIComponent(e.m.id)}">${esc(e.m.name)}</a><b class="${e.side === 'B' ? 'up' : 'dn'}">${e.side === 'B' ? 'bought' : 'sold'}</b>${e.q.toLocaleString()} <a href="#/stock/${esc(e.t)}">${esc(e.t)}</a> at $${e.p.toFixed(2)} <span style="color:#94A3B8">${dfmt(e.d)}</span></span>`).join('');
  el.className = 'mo-tape'; el.innerHTML = `<div>${one}${one}</div>`; }

/* ---------- tilt on trader cards ---------- */
function tilt(card) { if (card.__tilt || RM || !matchMedia('(hover:hover)').matches) return; card.__tilt = 1;
  card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`; });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; }); }

/* ---------- hydrate anything new on the page ---------- */
function hydrate() {
  $$('.mk-hero').forEach(field); $$('[data-race]').forEach(race); $$('[data-tape]').forEach(tape); $$('.mk-st b, [data-count]').forEach(countUp); $$('.so-lc').forEach(tilt);
  if (/^#\/(social|paper)/.test(location.hash)) $$('#so-pf .chart, .card .chart').forEach(c => { if (!c.__dr) { c.__dr = 1; c.classList.add('mo-draw'); } });
  home(); nav();
}

/* ---------- navigation in order of progression ---------- */
const ORDER = ['home', 'markets', 'screener', 'themes', 'compare', 'insights', 'investors', 'social', 'paper', 'watchlist', 'plans'];
function nav() { const n = $('#navlinks'); if (!n) return; const sc = $('a[data-r="screener"]', n); if (sc && sc.textContent !== 'Screener') sc.textContent = 'Screener';
  const mt = $('a[data-r="method"]', n); if (mt) mt.remove(); const so = $('a[data-r="social"]', n); if (so && so.textContent !== 'Social Trading') so.textContent = 'Social Trading';
  const cur = $$('a[data-r]', n).map(a => a.dataset.r), want = ORDER.filter(r => cur.includes(r)).concat(cur.filter(r => !ORDER.includes(r)));
  if (cur.join() !== want.join()) want.forEach(r => n.appendChild($(`a[data-r="${r}"]`, n))); }

/* ---------- home page ---------- */
function home() {
  const h = location.hash.replace(/^#\/?/, ''); if (h !== '' || $('#hm-journey')) return; const hero = $('#app > section.hero'); if (!hero) return;
  const secs = $$('#app > section'), scores = secs.find(s => /Highest Tickerwise Scores/.test(s.textContent.slice(0, 400))) || secs[2], last = secs[secs.length - 1];
  const IN = window.TWIN ? window.TWIN.library() : [], feat = IN.find(a => a.ec) || IN[0], more = IN.filter(a => a !== feat && !a.prem).slice(0, 3).concat(IN.filter(a => a.prem && a.kind === 'Stock Snapshot').slice(0, 1));
  const LT = window.TWSO ? window.TWSO.leads() : [], DP = PP.demoPlayers ? PP.demoPlayers().slice().sort((a, b) => b.c.ret - a.c.ret) : [];
  const totA = LT.reduce((a, m) => a + m.c.total, 0), topLT = LT.slice().sort((a, b) => b.r12 - a.r12)[0];
  hero.insertAdjacentHTML('afterend', `<section class="sec" id="hm-journey" style="padding-top:34px"><div class="wrap"><div class="sec-h"><div><h2>Everything You Need, In The Order You Need It</h2><p>Research a stock, read what it means, see what great investors do, then practice before you put real money in.</p></div></div>
    <div class="hm-j"><a href="#/screener"><span class="n">1</span><i style="background:#EEF4FF">🔬</i><b>Research</b><p>Scores for ${S.length} stocks, the Screener, Themes, Markets and side-by-side Compare.</p><span>Open the Screener →</span></a>
    <a href="#/insights"><span class="n">2</span><i style="background:#FFF7E0">📰</i><b>Insights</b><p>${IN.length} articles written from our data every night: analyst moves, insider buys, earnings and deep dives.</p><span>Read the latest →</span></a>
    <a href="#/social"><span class="n">3</span><i style="background:#F5F3FF">👥</i><b>Social Trading</b><p>Follow Lead Traders: full portfolios, cost per share, gains and every trade the moment it happens.</p><span>Meet the traders →</span></a>
    <a href="#/paper"><span class="n">4</span><i style="background:#E7F8EF">🏆</i><b>Paper Trading</b><p>Practice with $100,000 of virtual money at real prices and climb the public leaderboard. Free.</p><span>Start playing →</span></a></div></div></section>`);
  const ins = feat ? `<section class="sec" id="hm-ins"><div class="wrap"><div class="sec-h"><div><h2>Latest Insights</h2><p>Stories on the stocks we cover, written from every data point on Tickerwise and refreshed nightly.</p></div><a href="#/insights" class="btn ghost">All ${IN.length} articles →</a></div>
    <div class="hm-ins"><a class="hm-feat" href="#/insights/a/${encodeURIComponent(feat.id)}"><svg class="bg" viewBox="0 0 400 120" preserveAspectRatio="none"><polyline fill="none" stroke="#7FE3FF" stroke-width="2" points="0,90 40,80 80,86 120,60 160,66 200,40 240,52 280,30 320,38 360,14 400,20"/></svg><div class="in-m" style="color:#C4D3F5">${window.TWIN.badge(feat)}</div><h3>${esc(feat.title)}</h3><p>${esc(feat.dek)}</p></a>
      <div class="card" style="margin:0"><div class="in-l">${more.map(window.TWIN.item).join('')}</div></div></div></div></section>` : '';
  const soc = LT.length ? `<section class="sec hm-dark" id="hm-social"><div class="wrap"><div class="hm-2"><div><span class="mk-eb">Social Trading · Pro</span><h2 style="font:800 38px/1.1 'Space Grotesk',sans-serif;margin:14px 0 12px">Watch the best investors <span style="background:linear-gradient(90deg,#00E38C,#7FE3FF);-webkit-background-clip:text;background-clip:text;color:transparent">compete, live</span>.</h2>
      <p style="color:#D6E2FF;font-size:16.5px;line-height:1.55;margin:0 0 18px">Every Lead Trader shows their whole portfolio: what they own, what they paid per share, how much they are up or down, and every trade the moment it happens. Follow the ones you trust and get alerted when they move.</p>
      <div class="mk-cta"><a class="p" href="#/social">Discover Lead Traders</a><a class="g" href="#/social/apply">Become a Lead Trader</a></div>
      <div class="mk-st"><div><b>${LT.length}</b><span>Lead Traders</span></div><div><b>$${(totA / 1e6).toFixed(2)}M</b><span>in their portfolios</span></div><div><b>${topLT ? sg(topLT.r12, 1) : '—'}</b><span>top 12-month return</span></div></div></div>
      <div class="mk-art"><h5 style="display:flex;justify-content:space-between"><span>🏁 Lead Trader race · 12 months</span><span class="mo-live">LIVE PRICES</span></h5><div data-race="lt" data-n="6"></div></div></div>
      <div data-tape="lt" style="margin-top:22px"></div><p style="color:#94A3B8;font-size:12px;margin:10px 0 0">Preview: Lead Traders shown are Demo profiles whose trades use real closing prices. Real, broker-verified traders join at launch.</p></div></section>` : '';
  const pap = DP.length ? `<section class="sec" id="hm-paper"><div class="wrap"><div class="hm-2"><div class="mk-art" style="box-shadow:0 20px 50px rgba(11,27,63,.12)"><h5>🏆 Paper Trading race · since each player joined</h5><div data-race="pp" data-n="5"></div></div>
      <div><span class="mk-eb" style="color:#00995A;background:#E7F8EF">Paper Trading · Free</span><h2 style="font:800 34px/1.1 'Space Grotesk',sans-serif;margin:14px 0 12px">Practice with $100,000. Beat the market. Beat everyone.</h2><p style="color:#475569;font-size:16px;line-height:1.55;margin:0 0 18px">Build portfolios at real closing prices, keep score against the S&amp;P 500, and climb the public leaderboard. No money at risk.</p>
      <div class="mk-cta"><a class="p" href="#/paper">Start a Portfolio</a><a href="#/paper/leaderboard" style="border:1.5px solid var(--line);color:#0B1B3F">See the Leaderboard</a></div></div></div></div></section>` : '';
  const plans = `<section class="sec" id="hm-plans"><div class="wrap"><div class="sec-h"><div><h2>Start Free. Upgrade When You're Ready.</h2><p>Research, Paper Trading and free articles cost nothing. Pro adds Social Trading, every Premium article and AI research.</p></div><a href="#/plans" class="btn ghost">Compare plans →</a></div>
    <div class="hm-pl"><a href="#/plans"><b>Free</b><big>$0</big><small>Scores and full stock pages, Screener, Paper Trading and the leaderboard, free Insights articles.</small></a><a href="#/plans" class="hot"><b style="color:#7C3AED">Pro</b><big>$25<span style="font-size:15px;color:#64748B">/mo</span></big><small>Social Trading with trade alerts, all Premium Insights, AI chat, 5-page reports and earnings call summaries.</small></a><a href="#/plans"><b style="color:#C9A000">Premium</b><big>$100<span style="font-size:15px;color:#64748B">/mo</span></big><small>Unlimited AI, 20-page deep dives, Portfolio X-Ray, calls back to 2019, unlimited traders.</small></a></div></div></section>`;
  const NA = window.TWIN && window.TWIN.newsAll ? window.TWIN.newsAll().filter(n => n.img).slice(0, 4) : [];
  const nws = NA.length ? `<section class="sec" id="hm-news" style="padding-top:0"><div class="wrap"><div class="sec-h"><div><h2>Market News</h2><p>The latest stories on the stocks we cover, from Yahoo Finance and its partners.</p></div><a href="#/insights/news" class="btn ghost">More news →</a></div><div class="in-ng">${NA.map(window.TWIN.nCard).join('')}</div></div></section>` : '';
  (scores || hero).insertAdjacentHTML('afterend', ins + nws + soc + pap); if (last && last !== hero) last.insertAdjacentHTML('beforebegin', plans); else $('#app').insertAdjacentHTML('beforeend', plans);
}

let pend = 0; const mo = new MutationObserver(ms => { if (ms.every(m => { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; return t && t.closest && t.closest('.mo-race,.mo-tape,.mk-st'); })) return; if (pend) return; pend = 1; requestAnimationFrame(() => { pend = 0; try { hydrate(); } catch (e) { if (window.console) console.error(e); } }); });
mo.observe(document.body, { childList: true, subtree: true }); window.addEventListener('hashchange', () => setTimeout(hydrate, 30)); hydrate();
window.TWM = { race, field, countUp, tape };
})();
