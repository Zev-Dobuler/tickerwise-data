/* Tickerwise app11: Pro trading layer.
   Paper Trading: challenges, achievements, Market Replay Trainer, advanced analytics, trading tools, trade journal, copy a Lead Trader.
   Social Trading: trader screener, side-by-side compare, risk analytics, copy simulator, paper-copy, badges.
   Site-wide: animated data banners built from real prices (pulse lines, heat grid, signal radar, candle replay, trader network). */
(function () {
if (window.TWQ) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, sg, cls, dfmt, pxSeries } = X, PP = window.TWPP || {}, SO = window.TWSO || {};
const app = $('#app'); if (!app || !S || !PP.calc) return;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, alive = el => document.body.contains(el);
const money = v => PP.money(v), m2 = v => PP.money2(v), pct = (v, d) => nz(v) ? (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d == null ? 1 : d) + '%' : '—';
const rt = () => location.hash.replace(/^#\/?/, '').split('#')[0].split('?')[0].split('/');
const KEYP = 'tw_paper', rdP = () => { try { return JSON.parse(localStorage.getItem(KEYP) || 'null') || { prof: null, list: [] }; } catch (e) { return { prof: null, list: [] }; } };
const wrP = o => { try { localStorage.setItem(KEYP, JSON.stringify(o)); } catch (e) {} };
const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }, jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

const css = document.createElement('style'); css.id = 'tq-css'; css.textContent = `
.tq-sec{padding:18px 0 0}.tq-sec+.sec{padding-top:18px}
.tq-bn{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(120deg,#071334 0%,#0B1B3F 40%,#13306E 100%);color:#F5F8FF;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.35fr);min-height:250px;box-shadow:0 24px 50px rgba(11,27,63,.22);isolation:isolate}
.tq-bn:before{content:"";position:absolute;inset:0;background:radial-gradient(500px 220px at 85% 0%,rgba(47,107,255,.45),transparent 65%),radial-gradient(420px 200px at 10% 110%,rgba(0,227,140,.22),transparent 60%);z-index:-1}
.tq-bn:after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(127,227,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(127,227,255,.06) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(90deg,transparent,#000 40%);-webkit-mask-image:linear-gradient(90deg,transparent,#000 40%);z-index:-1;pointer-events:none}
.tq-txt{padding:26px 10px 24px 28px;display:flex;flex-direction:column;justify-content:center;min-width:0}
.tq-eb{display:inline-flex;align-items:center;gap:8px;font:700 11.5px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#7FE3FF}
.tq-dot{width:8px;height:8px;border-radius:50%;background:#00E38C;box-shadow:0 0 0 0 rgba(0,227,140,.7);animation:tqp 1.8s infinite}
@keyframes tqp{0%{box-shadow:0 0 0 0 rgba(0,227,140,.6)}70%{box-shadow:0 0 0 10px rgba(0,227,140,0)}100%{box-shadow:0 0 0 0 rgba(0,227,140,0)}}
.tq-bn h3{font:800 26px/1.15 'Space Grotesk',sans-serif;margin:10px 0 8px;color:#fff}.tq-bn h3 em{font-style:normal;background:linear-gradient(90deg,#00E38C,#7FE3FF);-webkit-background-clip:text;background-clip:text;color:transparent}
.tq-bn p{margin:0;color:#C4D3F5;font-size:14px;line-height:1.55}
.tq-st{display:flex;gap:22px;flex-wrap:wrap;margin-top:16px}.tq-st b{display:block;font:800 22px 'Space Grotesk',sans-serif;color:#fff}.tq-st span{font-size:12px;color:#9FB3DD}
.tq-viz{position:relative;min-width:0;min-height:230px}.tq-viz canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.tq-tip{position:absolute;right:14px;top:12px;font:600 12px Inter,sans-serif;color:#E6F0FF;background:rgba(7,19,52,.72);border:1px solid rgba(127,227,255,.3);border-radius:10px;padding:6px 10px;backdrop-filter:blur(6px);max-width:70%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tq-src{position:absolute;left:12px;bottom:8px;font-size:10.5px;color:#7D92BE;letter-spacing:.02em}
@media (max-width:860px){.tq-bn{grid-template-columns:minmax(0,1fr)}.tq-txt{padding:22px 18px 6px}.tq-viz{min-height:210px}.tq-bn h3{font-size:22px}}
.tq-g4{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.tq-ch{position:relative;overflow:hidden;border-radius:18px;padding:18px;color:#fff;display:flex;flex-direction:column;gap:8px;min-width:0}
.tq-ch.a{background:linear-gradient(135deg,#0B1B3F,#2F6BFF)}.tq-ch.b{background:linear-gradient(135deg,#052E2B,#00B86B)}.tq-ch.c{background:linear-gradient(135deg,#2A1050,#7C4DFF)}.tq-ch.d{background:linear-gradient(135deg,#3A1A05,#F28C28)}
.tq-ch:after{content:"";position:absolute;right:-40px;top:-40px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.08)}
.tq-ch h4{margin:0;font:800 19px 'Space Grotesk',sans-serif}.tq-ch p{margin:0;font-size:13px;color:rgba(255,255,255,.82);line-height:1.5}
.tq-cd{display:flex;gap:6px}.tq-cd div{background:rgba(255,255,255,.14);border-radius:10px;padding:6px 8px;text-align:center;min-width:46px}.tq-cd b{display:block;font:800 18px 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums}.tq-cd span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;opacity:.8}
.tq-ch button,.tq-btn{cursor:pointer;border:0;border-radius:11px;padding:10px 14px;font:700 14px Inter,sans-serif;background:#fff;color:#0B1B3F}
.tq-btn.p{background:linear-gradient(90deg,#00C176,#0EA5E9);color:#fff}.tq-btn.g{background:#fff;border:1.5px solid var(--line);color:var(--ink)}.tq-btn.r{background:#D72B45;color:#fff}.tq-btn.b{background:#2F6BFF;color:#fff}.tq-btn:disabled{opacity:.45;cursor:not-allowed}
.tq-ch .tq-meta{font-size:12px;opacity:.85;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.tq-tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.tq-tool{display:flex;gap:12px;align-items:flex-start;border:1.5px solid var(--line);border-radius:16px;padding:14px;background:#fff;text-decoration:none;color:inherit;transition:transform .2s,border-color .2s}.tq-tool:hover{border-color:#2F6BFF;transform:translateY(-2px)}
.tq-tool i{flex:none;width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:20px;background:#EEF4FF}.tq-tool b{display:block;font:700 15px 'Space Grotesk',sans-serif}.tq-tool span{font-size:12.5px;color:var(--mut);line-height:1.45}
.tq-lv{display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:center}.tq-ring{width:110px;height:110px}
.tq-ach{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:14px}.tq-ach div{border-radius:14px;padding:10px 12px;background:#F7F9FC;border:1.5px solid var(--line);font-size:12.5px;color:var(--mut);min-width:0}.tq-ach div.on{background:linear-gradient(135deg,#ECFDF5,#EEF4FF);border-color:#9FE3C3;color:#0B1B3F}.tq-ach b{display:block;font:700 13.5px Inter,sans-serif;color:inherit}.tq-ach div:not(.on) b{color:#94A3B8}
.tq-kg{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.tq-kg>div{background:#F7F9FC;border-radius:12px;padding:10px 12px;min-width:0}.tq-kg span{display:block;font-size:12px;color:var(--mut);font-weight:600}.tq-kg b{display:block;font:800 20px 'Space Grotesk',sans-serif}.tq-kg small{font-size:11.5px;color:var(--mut)}
.tq-2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}@media (max-width:860px){.tq-2{grid-template-columns:minmax(0,1fr)}}
.tq-svg{width:100%;height:auto;display:block}.tq-draw path.ln{stroke-dasharray:3000;stroke-dashoffset:3000;animation:tqd 1.8s cubic-bezier(.3,.7,.2,1) forwards}@keyframes tqd{to{stroke-dashoffset:0}}
.tq-f{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;align-items:end}.tq-f label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:600;color:var(--mut);min-width:0}.tq-f input,.tq-f select{padding:9px 10px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;min-width:0;width:100%;box-sizing:border-box;background:#fff}
.tq-out{margin-top:12px;padding:12px 14px;border-radius:12px;background:#F2F7FF;font-size:14px;line-height:1.6}.tq-out b{font-family:'Space Grotesk',sans-serif}
.tq-bd{display:flex;gap:8px;flex-wrap:wrap}.tq-bd span{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;font:700 12.5px Inter,sans-serif;background:#EEF4FF;color:#1E4FD8}.tq-bd span.g{background:#E7F8EF;color:#00794A}.tq-bd span.v{background:#F2EDFF;color:#5B2FD6}.tq-bd span.o{background:#FFF4E5;color:#9A5B00}
.tq-rp{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px}@media (max-width:980px){.tq-rp{grid-template-columns:minmax(0,1fr)}}
.tq-rpc{position:relative;height:420px;border-radius:16px;background:#0B1B3F;overflow:hidden}.tq-rpc canvas{position:absolute;inset:0;width:100%;height:100%}@media (max-width:600px){.tq-rpc{height:320px}}
.tq-pn{display:flex;flex-direction:column;gap:10px}.tq-pn .row{display:flex;gap:8px;flex-wrap:wrap}.tq-pn .row>*{flex:1 1 auto}
.tq-log{max-height:180px;overflow:auto;font-size:12.5px;border-top:1px solid var(--line);padding-top:8px}.tq-log div{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px dashed #EEF2F8}
.tq-tbl{width:100%;border-collapse:collapse;font-size:13.5px}.tq-tbl th{font:700 11.5px Inter,sans-serif;text-transform:uppercase;letter-spacing:.05em;color:var(--mut);text-align:left;padding:8px;border-bottom:1.5px solid var(--line);white-space:nowrap}.tq-tbl td{padding:8px;border-bottom:1px solid #EEF2F8;white-space:nowrap}.tq-tbl .num{text-align:right;font-variant-numeric:tabular-nums}
.tq-rk{display:inline-flex;gap:2px}.tq-rk i{width:6px;height:12px;border-radius:2px;background:#E2E8F0}.tq-rk i.on{background:linear-gradient(180deg,#00B86B,#F28C28 60%,#D72B45)}
.tq-lg{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;margin:6px 0 0}.tq-lg i{display:inline-block;width:12px;height:3px;border-radius:2px;margin-right:6px;vertical-align:middle}
.tq-jn{width:100%;box-sizing:border-box;border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;font:500 12.5px Inter,sans-serif;min-width:160px}
.tq-hm{display:grid;grid-template-columns:44px repeat(12,minmax(0,1fr));gap:3px;font-size:11px}.tq-hm div{padding:6px 2px;text-align:center;border-radius:6px;font-weight:700;font-variant-numeric:tabular-nums;overflow:hidden}.tq-hm .h{color:var(--mut);background:none;font-weight:600}
@media (max-width:600px){.tq-hm{font-size:9px;grid-template-columns:34px repeat(12,minmax(0,1fr))}}
`;
document.head.appendChild(css);

/* ---------- data helpers ---------- */
const PX = {}; const ser = t => PX[t] || (PX[t] = (pxSeries(t) || []).filter(p => nz(p.c)));
const chg1 = t => { const s = ser(t); return s.length > 1 ? (s[s.length - 1].c / s[s.length - 2].c - 1) * 100 : null; };
const retN = (t, n) => { const s = ser(t); return s.length > n ? (s[s.length - 1].c / s[s.length - 1 - n].c - 1) * 100 : null; };
const asOf = () => { const s = ser('SPY'); return s.length ? dfmt(PP.iso(s[s.length - 1].d)) : ''; };

/* ---------- canvas host: DPR, resize, pause off-screen, stop when removed ---------- */
function host(el, draw) {
  const c = document.createElement('canvas'); el.prepend(c); const x = c.getContext('2d'); let w = 0, h = 0, seen = true, t0 = performance.now();
  const fit = () => { const r = el.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); w = r.width; h = r.height; c.width = Math.max(1, w * d); c.height = Math.max(1, h * d); x.setTransform(d, 0, 0, d, 0, 0); };
  fit(); window.addEventListener('resize', fit); new IntersectionObserver(es => es.forEach(e => { seen = e.isIntersecting; })).observe(el);
  const loop = now => { if (!alive(el)) { window.removeEventListener('resize', fit); return; } requestAnimationFrame(loop); if (!seen || !w) return; x.clearRect(0, 0, w, h); draw(x, w, h, (now - t0) / 1000); };
  if (RM) { setTimeout(() => draw(x, w, h, 999), 50); } else requestAnimationFrame(loop);
  return { c, x, size: () => [w, h] };
}
const tipOf = el => $('.tq-tip', el.closest('.tq-bn'));

/* ---------- banner 1: pulse — real 6-month lines racing in, rotating through leaders and laggards ---------- */
function vizPulse(el) {
  const pool = S.map(s => ({ t: s.t, r: retN(s.t, 126) })).filter(x => nz(x.r)).sort((a, b) => b.r - a.r);
  const sets = [['SPY', 'QQQ'].concat(pool.slice(0, 4).map(x => x.t)), ['SPY', 'QQQ'].concat(pool.slice(4, 8).map(x => x.t)), ['SPY', 'DIA'].concat(pool.slice(-4).map(x => x.t))].map(a => a.filter(t => ser(t).length > 130));
  const COL = ['#FFFFFF', '#7FE3FF', '#00E38C', '#2F6BFF', '#F5B84B', '#C084FC', '#FF7A8A'];
  const mk = set => set.map((t, i) => { const s = ser(t).slice(-127), b = s[0].c; return { t, col: COL[i % COL.length], v: s.map(p => (p.c / b - 1) * 100) }; });
  let k = 0, L = mk(sets[0]), cyc = 0; const tip = tipOf(el);
  host(el, (x, w, h, t) => {
    const per = 7, ph = (t % per) / per, n = Math.floor(t / per); if (n !== cyc) { cyc = n; k = (k + 1) % sets.length; L = mk(sets[k]); }
    const all = L.flatMap(l => l.v), mx = Math.max(...all, 5), mn = Math.min(...all, -5), padL = 10, padR = 58, padT = 18, padB = 26, W = w - padL - padR, H = h - padT - padB;
    const Y = v => padT + (mx - v) / (mx - mn) * H, prog = RM ? 1 : Math.min(1, ph / 0.62), fade = ph > 0.92 ? 1 - (ph - 0.92) / 0.08 : 1;
    x.globalAlpha = 1; x.strokeStyle = 'rgba(255,255,255,.18)'; x.setLineDash([4, 5]); x.beginPath(); x.moveTo(padL, Y(0)); x.lineTo(padL + W, Y(0)); x.stroke(); x.setLineDash([]);
    x.fillStyle = 'rgba(159,179,221,.8)'; x.font = '600 10.5px Inter'; x.fillText('0%', padL + W + 6, Y(0) + 3);
    const sx = padL + W * prog; x.fillStyle = 'rgba(127,227,255,.07)'; x.fillRect(sx - 30, padT, 30, H); x.strokeStyle = 'rgba(127,227,255,.5)'; x.beginPath(); x.moveTo(sx, padT); x.lineTo(sx, padT + H); x.stroke();
    x.globalAlpha = fade; let lead = null;
    L.forEach((l, i) => { const m = Math.max(2, Math.floor(l.v.length * prog)); x.beginPath(); for (let j = 0; j < m; j++) { const px = padL + j / (l.v.length - 1) * W, py = Y(l.v[j]); j ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.strokeStyle = l.col; x.lineWidth = i < 2 ? 1.6 : 2.2; x.shadowColor = l.col; x.shadowBlur = i < 2 ? 0 : 10; x.stroke(); x.shadowBlur = 0;
      const v = l.v[m - 1], px = padL + (m - 1) / (l.v.length - 1) * W, py = Y(v); x.fillStyle = l.col; x.beginPath(); x.arc(px, py, 3.5, 0, 7); x.fill();
      x.font = '700 11px Inter'; x.fillText(l.t + ' ' + (v >= 0 ? '+' : '') + v.toFixed(0) + '%', Math.min(px + 7, w - 70), py + 4); if (!lead || v > lead.v) lead = { t: l.t, v }; });
    x.globalAlpha = 1; if (tip && lead) tip.textContent = (k === 2 ? 'Laggards' : 'Leaders') + ' · 6 months · ' + lead.t + ' ' + pct(lead.v, 0);
  });
}

/* ---------- banner 2: heat grid — every stock's real last-day move, with a scanning wave ---------- */
function vizHeat(el) {
  const D = S.map(s => ({ t: s.t, c: chg1(s.t) })).filter(d => nz(d.c)); const tip = tipOf(el); let hi = 0, last = -1;
  host(el, (x, w, h, t) => {
    const cols = Math.max(8, Math.round(Math.sqrt(D.length * w / h / 1.5))), rows = Math.ceil(D.length / cols), gw = (w - 20) / cols, gh = (h - 30) / rows, wave = (t * 0.35) % 1.6 - 0.3;
    const step = Math.floor(t / 1.4); if (step !== last) { last = step; hi = Math.floor(Math.random() * D.length); const d = D[hi]; if (tip) tip.textContent = d.t + ' · ' + ((BY[d.t] || {}).n || '').slice(0, 26) + ' · ' + pct(d.c); }
    D.forEach((d, i) => { const cx = i % cols, cy = Math.floor(i / cols), px = 10 + cx * gw, py = 10 + cy * gh, a = Math.min(1, Math.abs(d.c) / 4), near = Math.max(0, 1 - Math.abs(cx / cols - wave) * 6);
      x.fillStyle = d.c >= 0 ? `rgba(0,${150 + 77 * a | 0},${100 + 40 * a | 0},${0.25 + a * 0.6 + near * 0.15})` : `rgba(${200 + 40 * a | 0},43,69,${0.25 + a * 0.6 + near * 0.15})`;
      const r = Math.min(6, gw / 5); x.beginPath(); x.roundRect ? x.roundRect(px + 1.5, py + 1.5, gw - 3, gh - 3, r) : x.rect(px + 1.5, py + 1.5, gw - 3, gh - 3); x.fill();
      if (i === hi) { x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); }
      if (gw > 26 && gh > 16) { x.fillStyle = 'rgba(255,255,255,' + (0.55 + near * 0.45) + ')'; x.font = '700 ' + Math.min(11, gw / 3.6) + 'px Inter'; x.fillText(d.t, px + 5, py + gh / 2 + 3); } });
  });
}

/* ---------- banner 3: signal radar — stocks plotted by Tickerwise Score, sweep lights them up ---------- */
function vizRadar(el) {
  const D = S.filter(s => nz(s.ws)).map(s => { let hh = 0; for (const ch of (s.th || s.t)) hh = (hh * 31 + ch.charCodeAt(0)) >>> 0; return { t: s.t, ws: s.ws, a: (hh % 3600) / 3600 * Math.PI * 2, j: ((hh >> 8) % 100) / 100, rsi: (s.tech || {}).rsi, g: 0 }; });
  const tip = tipOf(el);
  host(el, (x, w, h, t) => {
    const cx = w * 0.5, cy = h * 0.52, R = Math.min(w * 0.46, h * 0.46), sw = (t * 0.9) % (Math.PI * 2);
    x.strokeStyle = 'rgba(127,227,255,.16)'; x.lineWidth = 1; for (let i = 1; i <= 4; i++) { x.beginPath(); x.arc(cx, cy, R * i / 4, 0, 7); x.stroke(); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.stroke(); }
    x.fillStyle = 'rgba(159,179,221,.7)'; x.font = '600 10px Inter'; ['Score 10', '7.5', '5', '2.5'].forEach((s, i) => x.fillText(s, cx + 4, cy - R * i / 4 - 3));
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, 'rgba(0,227,140,.0)'); g.addColorStop(1, 'rgba(0,227,140,.22)');
    x.fillStyle = g; x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R, sw - 0.6, sw); x.closePath(); x.fill(); x.strokeStyle = 'rgba(0,227,140,.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(sw) * R, cy + Math.sin(sw) * R); x.stroke();
    let pick = null; D.forEach(d => { const rr = R * (1 - (d.ws - 0.5) / 10) * (0.92 + d.j * 0.08), px = cx + Math.cos(d.a) * rr, py = cy + Math.sin(d.a) * rr; let da = (sw - d.a) % (Math.PI * 2); if (da < 0) da += Math.PI * 2; if (da < 0.05) { d.g = 1; if (!pick || d.ws > pick.ws) pick = d; } d.g *= 0.985;
      const col = d.ws >= 8 ? '0,227,140' : d.ws >= 6 ? '127,227,255' : d.ws >= 4 ? '245,184,75' : '255,122,138'; x.fillStyle = `rgba(${col},${0.35 + d.g * 0.65})`; x.beginPath(); x.arc(px, py, 2.2 + d.g * 3, 0, 7); x.fill();
      if (d.g > 0.6 && d.ws >= 7) { x.fillStyle = `rgba(255,255,255,${d.g})`; x.font = '700 10.5px Inter'; x.fillText(d.t, px + 6, py - 4); } });
    if (pick && tip) tip.textContent = 'Signal · ' + pick.t + ' · Score ' + pick.ws + '/10' + (nz(pick.rsi) ? ' · RSI ' + Math.round(pick.rsi) : '');
  });
}

/* ---------- banner 4: candle replay — real daily closes drawn bar by bar (close-to-close candles) ---------- */
function candles(x, w, h, bars, opt) {
  opt = opt || {}; const padL = opt.padL || 10, padR = opt.padR || 56, padT = opt.padT || 18, padB = opt.padB || 22, W = w - padL - padR, H = h - padT - padB, vh = H * 0.18;
  const vis = bars.filter(Boolean); if (vis.length < 2) return; const hiA = vis.map(b => b.h), loA = vis.map(b => b.l), mxv = Math.max(...vis.map(b => b.v || 0), 1);
  let mx = Math.max(...hiA), mn = Math.min(...loA); const pd = (mx - mn) * 0.06 || 1; mx += pd; mn -= pd;
  const Y = v => padT + (mx - v) / (mx - mn) * (H - vh), bw = W / (opt.n || bars.length);
  x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 1; x.font = '600 10px Inter'; x.fillStyle = 'rgba(159,179,221,.85)';
  for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) * i / 4, y = Y(v); x.beginPath(); x.moveTo(padL, y); x.lineTo(padL + W, y); x.stroke(); x.fillText(v >= 1000 ? v.toFixed(0) : v.toFixed(2), padL + W + 6, y + 3); }
  bars.forEach((b, i) => { if (!b) return; const px = padL + i * bw + bw / 2, up = b.c >= b.o, col = up ? '#00E38C' : '#FF5C72'; x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 1;
    x.beginPath(); x.moveTo(px, Y(b.h)); x.lineTo(px, Y(b.l)); x.stroke(); const y1 = Y(Math.max(b.o, b.c)), y2 = Y(Math.min(b.o, b.c)); x.fillRect(px - bw * 0.32, y1, bw * 0.64, Math.max(1, y2 - y1));
    if (b.v) { x.globalAlpha = 0.35; x.fillRect(px - bw * 0.32, padT + H - b.v / mxv * vh, bw * 0.64, b.v / mxv * vh); x.globalAlpha = 1; } });
  x.save(); x.beginPath(); x.rect(padL, padT, W, H - vh); x.clip(); (opt.ma || []).forEach((m, k) => { x.strokeStyle = k ? 'rgba(245,184,75,.9)' : 'rgba(127,227,255,.9)'; x.lineWidth = 1.5; x.beginPath(); let on = false; m.forEach((v, i) => { if (!nz(v) || !bars[i]) return; const px = padL + i * bw + bw / 2; on ? x.lineTo(px, Y(v)) : x.moveTo(px, Y(v)); on = true; }); x.stroke(); }); x.restore();
  const lb = vis[vis.length - 1], ly = Y(lb.c); x.setLineDash([3, 4]); x.strokeStyle = 'rgba(255,255,255,.5)'; x.beginPath(); x.moveTo(padL, ly); x.lineTo(padL + W, ly); x.stroke(); x.setLineDash([]);
  x.fillStyle = lb.c >= lb.o ? '#00B86B' : '#D72B45'; x.fillRect(padL + W + 2, ly - 9, padR - 4, 18); x.fillStyle = '#fff'; x.font = '700 10.5px Inter'; x.fillText(lb.c.toFixed(2), padL + W + 6, ly + 4);
  (opt.marks || []).forEach(mk => { if (!bars[mk.i]) return; const px = padL + mk.i * bw + bw / 2, y = mk.side === 'B' ? Y(bars[mk.i].l) + 14 : Y(bars[mk.i].h) - 14; x.fillStyle = mk.side === 'B' ? '#00E38C' : '#FF5C72'; x.beginPath(); if (mk.side === 'B') { x.moveTo(px, y - 8); x.lineTo(px - 6, y + 2); x.lineTo(px + 6, y + 2); } else { x.moveTo(px, y + 8); x.lineTo(px - 6, y - 2); x.lineTo(px + 6, y - 2); } x.fill(); });
}
const toBars = s => s.map((p, i) => { const o = i ? s[i - 1].c : p.c; return { d: p.d, o, c: p.c, h: Math.max(o, p.c), l: Math.min(o, p.c), v: p.v, m50: p.m50, m200: p.m200 }; });
function vizCandles(el) {
  const pick = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMD', 'META', 'AMZN', 'PLTR', 'GOOGL', 'AVGO'].filter(t => BY[t] && ser(t).length > 80); if (!pick.length) return;
  let k = 0, B = toBars(ser(pick[0]).slice(-61)).slice(1), cyc = -1; const tip = tipOf(el);
  host(el, (x, w, h, t) => { const per = 9, n = Math.floor(t / per); if (n !== cyc) { cyc = n; k = n % pick.length; B = toBars(ser(pick[k]).slice(-61)).slice(1); }
    const m = RM ? B.length : Math.max(2, Math.min(B.length, Math.floor((t % per) / (per * 0.8) * B.length))), sh = B.map((b, i) => i < m ? b : null);
    candles(x, w, h, sh, { n: B.length, ma: [B.map(b => b.m50)] }); const lb = B[m - 1], r = (lb.c / B[0].o - 1) * 100;
    if (tip) tip.textContent = 'Replay · ' + pick[k] + ' · last 60 sessions · ' + dfmt(PP.iso(lb.d)) + ' · ' + pct(r); });
}

/* ---------- banner 5: trader network — Lead Traders linked to the stocks they hold, trades flowing ---------- */
function vizNet(el) {
  const L = (SO.leads ? SO.leads() : []).slice(0, 10); if (!L.length) return; const tip = tipOf(el);
  const T = {}; L.forEach(m => m.hold.slice(0, 5).forEach(hh => { T[hh.t] = (T[hh.t] || 0) + hh.w; })); const TK = Object.entries(T).sort((a, b) => b[1] - a[1]).slice(0, 16).map(x => x[0]);
  const E = []; L.forEach((m, i) => m.hold.slice(0, 5).forEach(hh => { const j = TK.indexOf(hh.t); if (j >= 0) E.push({ i, j, w: hh.w, ph: Math.random() }); }));
  let foc = 0, last = -1;
  host(el, (x, w, h, t) => {
    const ln = L.map((m, i) => ({ x: w * 0.14, y: 18 + (h - 36) * (i + 0.5) / L.length, m })), rowsT = Math.ceil(TK.length / 2), tn = TK.map((s, j) => ({ x: w * (j % 2 ? 0.86 : 0.64) - (Math.floor(j / 2) % 2) * w * 0.04, y: 20 + (h - 40) * (Math.floor(j / 2) + 0.5) / rowsT, t: s }));
    const step = Math.floor(t / 2.2); if (step !== last) { last = step; foc = step % L.length; const m = L[foc]; if (tip) tip.textContent = m.name + ' · 12 months ' + pct(m.r12) + ' · risk ' + m.risk + '/10'; }
    E.forEach(e => { const a = ln[e.i], b = tn[e.j], on = e.i === foc, mx = (a.x + b.x) / 2; x.strokeStyle = on ? 'rgba(0,227,140,.75)' : 'rgba(127,227,255,.12)'; x.lineWidth = on ? 1.6 : 1; x.beginPath(); x.moveTo(a.x, a.y); x.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y); x.stroke();
      const p = (t * (on ? 0.6 : 0.25) + e.ph) % 1, q = 1 - p, bx = q * q * q * a.x + 3 * q * q * p * mx + 3 * q * p * p * mx + p * p * p * b.x, by = q * q * q * a.y + 3 * q * q * p * a.y + 3 * q * p * p * b.y + p * p * p * b.y;
      x.fillStyle = on ? '#00E38C' : 'rgba(127,227,255,.55)'; x.beginPath(); x.arc(bx, by, on ? 2.6 : 1.6, 0, 7); x.fill(); });
    ln.forEach((n, i) => { const on = i === foc; x.fillStyle = on ? '#00E38C' : '#2F6BFF'; x.beginPath(); x.arc(n.x, n.y, on ? 7 : 5, 0, 7); x.fill(); if (on) { x.strokeStyle = 'rgba(0,227,140,.4)'; x.lineWidth = 6; x.beginPath(); x.arc(n.x, n.y, 11 + Math.sin(t * 5) * 2, 0, 7); x.stroke(); }
      x.fillStyle = on ? '#fff' : 'rgba(196,211,245,.75)'; x.font = (on ? '700 ' : '600 ') + '11px Inter'; x.textAlign = 'right'; x.fillText(n.m.name.split(' ')[0], n.x - 12, n.y + 4); x.textAlign = 'left'; });
    tn.forEach(n => { const on = L[foc].hold.slice(0, 5).some(hh => hh.t === n.t); x.fillStyle = on ? 'rgba(0,227,140,.2)' : 'rgba(255,255,255,.06)'; x.strokeStyle = on ? '#00E38C' : 'rgba(127,227,255,.35)'; x.lineWidth = 1.2; x.beginPath(); x.roundRect ? x.roundRect(n.x - 22, n.y - 10, 44, 20, 10) : x.rect(n.x - 22, n.y - 10, 44, 20); x.fill(); x.stroke();
      x.fillStyle = '#fff'; x.font = '700 10.5px Inter'; x.textAlign = 'center'; x.fillText(n.t, n.x, n.y + 4); x.textAlign = 'left'; });
  });
}

const VIZ = { pulse: vizPulse, heat: vizHeat, radar: vizRadar, candles: vizCandles, net: vizNet };
function banner(kind, eb, h3, p, stats, src) {
  return `<div class="tq-bn" data-tq="${kind}"><div class="tq-txt"><span class="tq-eb"><i class="tq-dot"></i>${eb}</span><h3>${h3}</h3><p>${p}</p><div class="tq-st">${stats.map(s => `<div><b data-count>${s[0]}</b><span>${s[1]}</span></div>`).join('')}</div></div><div class="tq-viz"><div class="tq-tip">Loading signals…</div><span class="tq-src">${src || 'Real daily closes · as of ' + asOf()}</span></div></div>`;
}
function wake(root) { $$('.tq-bn', root).forEach(b => { if (b.__on) return; b.__on = 1; const v = $('.tq-viz', b), f = VIZ[b.dataset.tq]; if (v && f) try { f(v); } catch (e) { if (window.console) console.error(e); } }); }

/* ---------- which banner goes on which page ---------- */
function bannerFor(r) {
  const up = S.filter(s => (chg1(s.t) || 0) > 0).length, dn = S.filter(s => (chg1(s.t) || 0) < 0).length, hiS = S.filter(s => s.ws >= 8).length;
  const avgS = (S.reduce((a, s) => a + (s.ws || 0), 0) / S.length).toFixed(1), spx6 = retN('SPY', 126), best = S.map(s => ({ t: s.t, r: retN(s.t, 126) })).filter(x => nz(x.r)).sort((a, b) => b.r - a.r)[0] || {};
  const L = SO.leads ? SO.leads() : [], topL = L.slice().sort((a, b) => b.r12 - a.r12)[0];
  const B = {
    home: ['pulse', 'Market pulse · live replay', 'Leaders and laggards, <em>drawn from real prices</em>.', 'Every line is a real 6-month price path. The board rotates through the strongest and weakest stocks we cover, against the S&amp;P 500 and Nasdaq 100.', [[S.length, 'stocks tracked'], [pct(spx6), 'S&amp;P 500, 6 months'], [best.t ? best.t + ' ' + pct(best.r, 0) : '—', 'top 6-month move']]],
    markets: ['heat', 'Market heat map · last session', 'The whole market <em>in one glance</em>.', 'Each tile is one of the stocks we cover, colored by its move in the latest session. Green is up, red is down; brighter means a bigger move.', [[up, 'stocks up'], [dn, 'stocks down'], [pct(chg1('SPY'), 2), 'S&amp;P 500 (SPY)']]],
    watchlist: ['radar', 'Signal radar · your universe', 'Never miss a <em>signal change</em>.', 'Scores update with every data refresh. Add stocks to your watchlist and they show up here first.', [[hiS, 'scoring 8 or more'], [avgS, 'average score'], [S.length, 'stocks covered']]],
    themes: ['pulse', 'Theme momentum', 'Themes move together. <em>See who leads.</em>', 'The lines replay real 6-month price paths for the top performers in our themes, against the market.', [[new Set(S.map(s => s.th)).size, 'themes'], [S.length, 'stocks'], [pct(spx6), 'S&amp;P 6 months']]],
    compare: ['candles', 'Price action replay', 'Compare with <em>the full picture</em>.', 'A bar-by-bar replay of the last 60 sessions for the most-watched stocks, with the 50-day average.', [[S.length, 'stocks to compare'], ['60', 'sessions replayed'], ['50-day', 'moving average']]],
    insights: ['pulse', 'Research desk', 'Stories backed by <em>the numbers</em>.', 'Every article connects to live scores and real price history, so you can check the thesis yourself.', [[S.length, 'stocks covered'], [hiS, 'top-scored names'], [pct(spx6), 'S&amp;P 6 months']]],
    plans: ['candles', 'Plans · start free', 'Practice free. <em>Upgrade when you are ready.</em>', 'Paper Trading and Market Replay are free on every plan. Pro adds Social Trading and all Premium Insights; Premium adds unlimited AI research.', [['$0', 'Free forever'], ['$25', 'Pro per month'], ['$100', 'Premium per month']]],
    social: ['net', 'Social network · Lead Traders', 'See who holds what, <em>and how it is working</em>.', 'Lines connect each Lead Trader to their largest positions. Every trade is at a real closing price.', [[L.length, 'Lead Traders'], [topL ? pct(topL.r12, 0) : '—', 'best 12-month return'], [L.reduce((a, m) => a + m.trades, 0), 'trades tracked']], 'Demo Lead Traders · real closing prices']
  }; return B[r];
}
function ensureBanner() {
  const r = rt(), k = r[0] || 'home'; if (k === 'social' && r[1]) return; if (k === 'paper') return; const b = bannerFor(k); if (!b) return;
  if ($('.tq-sec[data-k="' + k + '"]', app)) return; $$('.tq-sec', app).forEach(e => e.remove());
  const sec = document.createElement('section'); sec.className = 'tq-sec'; sec.dataset.k = k; sec.innerHTML = `<div class="wrap">${banner(...b)}</div>`;
  if (k === 'home') { const hero = app.firstElementChild; if (!hero) return; hero.after(sec); }
  else if (k === 'social') { const h = $('.so-hero, .page-h', app); if (!h) return; h.after(sec); }
  else { const h = $('section.page-h', app); if (!h) return; h.after(sec); }
  wake(sec);
}

/* ---------- analytics from a value curve V = [[day, value, spx% since start]] ---------- */
function analytics(V) {
  if (!V || V.length < 25) return null; const r = [], b = [];
  for (let i = 1; i < V.length; i++) { r.push(V[i][1] / V[i - 1][1] - 1); const s0 = 1 + (V[i - 1][2] || 0) / 100, s1 = 1 + (V[i][2] || 0) / 100; b.push(s1 / s0 - 1); }
  const n = r.length, mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1), mu = mean(r), mb = mean(b), sd = Math.sqrt(mean(r.map(x => (x - mu) ** 2))), dsd = Math.sqrt(mean(r.map(x => Math.min(0, x) ** 2)));
  const cov = mean(r.map((x, i) => (x - mu) * (b[i] - mb))), vb = mean(b.map(x => (x - mb) ** 2)), beta = vb ? cov / vb : null, rf = 0.04;
  const days = V[V.length - 1][0] - V[0][0], tot = V[V.length - 1][1] / V[0][1] - 1, cagr = days > 30 ? Math.pow(1 + tot, 365 / days) - 1 : tot;
  const annR = mu * 252, annB = mb * 252, vol = sd * Math.sqrt(252), sharpe = vol ? (annR - rf) / vol : null, sortino = dsd ? (annR - rf) / (dsd * Math.sqrt(252)) : null, alpha = beta != null ? annR - (rf + beta * (annB - rf)) : null;
  let pk = 0, dd = 0, ddS = null, ddE = null, cur = null; const uw = V.map(p => { if (p[1] > pk) { pk = p[1]; cur = p[0]; } const d = (p[1] / pk - 1) * 100; if (d < dd) { dd = d; ddS = cur; ddE = p[0]; } return [p[0], d]; });
  const M = {}, MB = {}; V.forEach(p => { const k = PP.iso(p[0]).slice(0, 7); M[k] = p[1]; MB[k] = 1 + (p[2] || 0) / 100; }); const ks = Object.keys(M).sort(), mon = {}, monB = {};
  ks.forEach((k, i) => { mon[k] = (M[k] / (i ? M[ks[i - 1]] : V[0][1]) - 1) * 100; monB[k] = (MB[k] / (i ? MB[ks[i - 1]] : 1) - 1) * 100; });
  const mv = Object.values(mon), upM = mv.filter(x => x > 0).length / (mv.length || 1) * 100, bestM = Math.max(...mv), worstM = Math.min(...mv);
  const upD = r.filter((x, i) => b[i] > 0), dnD = r.filter((x, i) => b[i] < 0), upC = mean(upD) / (mean(b.filter(x => x > 0)) || 1) * 100, dnC = mean(dnD) / (mean(b.filter(x => x < 0)) || 1) * 100;
  return { n, vol: vol * 100, sharpe, sortino, beta, alpha: alpha != null ? alpha * 100 : null, cagr: cagr * 100, tot: tot * 100, dd, ddS, ddE, calmar: dd ? cagr * 100 / Math.abs(dd) : null, uw, mon, monB, upM, bestM, worstM, upC, dnC, spx: (V[V.length - 1][2] || 0) };
}
const f2 = v => nz(v) ? v.toFixed(2) : '—';
function statGrid(a) {
  return `<div class="tq-kg">${[['Sharpe ratio', f2(a.sharpe), 'return per unit of risk (4% cash rate)'], ['Sortino ratio', f2(a.sortino), 'counts only downside swings'], ['Beta vs S&amp;P', f2(a.beta), '1.0 moves with the market'], ['Alpha (yearly)', pct(a.alpha), 'return beyond what beta explains'],
    ['Volatility', nz(a.vol) ? a.vol.toFixed(1) + '%' : '—', 'yearly, from daily moves'], ['Max drawdown', pct(a.dd), a.ddS ? dfmt(PP.iso(a.ddS)) + ' → ' + dfmt(PP.iso(a.ddE)) : ''], ['Calmar ratio', f2(a.calmar), 'yearly return ÷ max drawdown'], ['Up months', Math.round(a.upM) + '%', 'best ' + pct(a.bestM) + ' · worst ' + pct(a.worstM)],
    ['Upside capture', nz(a.upC) ? Math.round(a.upC) + '%' : '—', 'of the S&amp;P on up days'], ['Downside capture', nz(a.dnC) ? Math.round(a.dnC) + '%' : '—', 'of the S&amp;P on down days (lower is better)']].map(k => `<div><span>${k[0]}</span><b class="${/drawdown/.test(k[0]) ? 'dn' : /Alpha/.test(k[0]) ? cls(a.alpha) : ''}">${k[1]}</b><small>${k[2]}</small></div>`).join('')}</div>`;
}
/* SVG line chart with draw-in animation */
function lines(series, o) {
  o = o || {}; const W = 760, H = o.h || 220, pl = 8, pr = 54, pt = 12, pb = 22, all = series.flatMap(s => s.pts.map(p => p[1])).filter(nz); if (!all.length) return '';
  let mx = Math.max(...all, o.zero ? 0 : -Infinity), mn = Math.min(...all, o.zero ? 0 : Infinity); const pad = (mx - mn) * 0.08 || 1; mx += pad; mn -= pad;
  const x0 = Math.min(...series.map(s => s.pts[0][0])), x1 = Math.max(...series.map(s => s.pts[s.pts.length - 1][0])), X = d => pl + (d - x0) / ((x1 - x0) || 1) * (W - pl - pr), Y = v => pt + (mx - v) / (mx - mn) * (H - pt - pb);
  const grid = [0, 1, 2, 3, 4].map(i => { const v = mn + (mx - mn) * i / 4; return `<line x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="#EEF2F8"/><text x="${W - pr + 6}" y="${(Y(v) + 4).toFixed(1)}" font-size="11" fill="#64748B">${o.fmt ? o.fmt(v) : v.toFixed(0)}</text>`; }).join('');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => { const d = Math.round(x0 + (x1 - x0) * f); return `<text x="${X(d).toFixed(1)}" y="${H - 5}" font-size="10.5" fill="#94A3B8" text-anchor="${f === 0 ? 'start' : f === 1 ? 'end' : 'middle'}">${dfmt(PP.iso(d))}</text>`; }).join('');
  const body = series.map(s => { const d = s.pts.filter(p => nz(p[1])).map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(''); if (!d) return '';
    const area = s.fill ? `<path d="${d}L${X(s.pts[s.pts.length - 1][0]).toFixed(1)} ${Y(o.base != null ? o.base : mn).toFixed(1)}L${X(s.pts[0][0]).toFixed(1)} ${Y(o.base != null ? o.base : mn).toFixed(1)}Z" fill="${s.fill}"/>` : '';
    return area + `<path class="ln" d="${d}" fill="none" stroke="${s.col}" stroke-width="${s.w || 2}" ${s.dash ? 'stroke-dasharray="5 4" style="animation:none;stroke-dashoffset:0"' : ''} stroke-linejoin="round"/>`; }).join('');
  const zero = o.zero ? `<line x1="${pl}" x2="${W - pr}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" stroke="#94A3B8" stroke-dasharray="3 4"/>` : '';
  return `<svg class="tq-svg tq-draw" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'chart')}">${grid}${zero}${body}${ticks}</svg>` + (o.legend ? `<div class="tq-lg">${series.map(s => `<span><i style="background:${s.col}"></i>${s.name}</span>`).join('')}</div>` : '');
}
function heatGrid(mon) {
  const ys = [...new Set(Object.keys(mon).map(k => k.slice(0, 4)))].sort().reverse(), M = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const col = v => !nz(v) ? '#F1F5F9' : v >= 0 ? `rgba(0,184,107,${Math.min(0.9, 0.18 + v / 12)})` : `rgba(215,43,69,${Math.min(0.9, 0.18 - v / 12)})`;
  return `<div class="tq-hm"><div class="h"></div>${M.map(m => `<div class="h">${m}</div>`).join('')}${ys.map(y => `<div class="h">${y}</div>` + M.map((m, i) => { const k = y + '-' + String(i + 1).padStart(2, '0'), v = mon[k]; return `<div style="background:${col(v)};color:${nz(v) && Math.abs(v) > 6 ? '#fff' : '#0B1B3F'}" title="${k}: ${pct(v)}">${nz(v) ? v.toFixed(1) : ''}</div>`; }).join('')).join('')}</div>`;
}
const riskK = r => `<span class="tq-rk">${Array.from({ length: 10 }, (_, i) => `<i class="${i < r ? 'on' : ''}"></i>`).join('')}</span>`;
const paperV = P => { const C = PP.curve(P); if (!C) return null; const s0 = P.start || 100000; return C.map(p => [p[0], s0 * (1 + p[1] / 100), p[2]]); };

/* ================= PAPER TRADING ================= */
const CH = () => { const now = new Date(), y = now.getUTCFullYear(), mo = now.getUTCMonth(), mEnd = Date.UTC(y, mo + 1, 1) - 1000, qEnd = Date.UTC(y, Math.floor(mo / 3) * 3 + 3, 1) - 1000;
  const fri = new Date(Date.UTC(y, mo, now.getUTCDate(), 21, 0, 0)); while (fri.getUTCDay() !== 5 || fri <= now) fri.setUTCDate(fri.getUTCDate() + 1);
  const mn = now.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' }), q = 'Q' + (Math.floor(mo / 3) + 1);
  return [{ k: 'm-' + y + '-' + (mo + 1), c: 'a', i: '🏆', n: mn + ' Challenge', d: 'Highest return by the last close of the month. Everyone starts with $100,000.', end: mEnd, tag: 'Monthly' },
    { k: 'w-' + fri.toISOString().slice(0, 10), c: 'b', i: '⚡', n: 'Weekly Sprint', d: 'Five sessions, one winner. Ends at Friday\'s close.', end: +fri, tag: 'Weekly' },
    { k: 'q-' + y + q, c: 'c', i: '🎯', n: 'Beat the S&P · ' + q, d: 'Finish the quarter ahead of the S&P 500. Every portfolio that beats it earns the badge.', end: qEnd, tag: 'Quarterly' },
    { k: 'r-' + y + '-' + (mo + 1), c: 'd', i: '🛡️', n: 'Low-Risk Cup', d: 'Best return with a max drawdown under 8%. Steady wins.', end: mEnd, tag: 'Monthly' }]; };
function countdown() { $$('[data-end]').forEach(el => { let s = Math.max(0, Math.floor((+el.dataset.end - Date.now()) / 1000)); const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
  el.innerHTML = [[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']].map(x => `<div><b>${String(x[0]).padStart(2, '0')}</b><span>${x[1]}</span></div>`).join(''); }); }
setInterval(() => { if ($('[data-end]')) countdown(); }, 1000);
function joinCh(c) { const o = rdP(), ex = o.list.find(P => P.ch === c.k); if (ex) { location.hash = '#/paper/p/' + ex.id; return; }
  const P = { id: uid(), name: c.n, mode: 'game', created: PP.iso(PP.lastDay()), lots: [], pub: false, ch: c.k }; o.list.push(P); wrP(o); location.hash = '#/paper/p/' + P.id; }

const ACH = [['🥇', 'First Trade', 'Make your first paper trade', (L) => L.some(P => (P.lots || []).length)], ['🧺', 'Diversified', '5+ different stocks in one portfolio', L => L.some(P => new Set((P.lots || []).filter(l => !l.sd).map(l => l.t)).size >= 5)],
  ['📈', 'Market Beater', 'A portfolio ahead of the S&P 500', L => L.some(P => { if (!(P.lots || []).length) return false; const c = PP.calc(P); return nz(c.spx) && c.ret > c.spx; })], ['💰', 'Profit Taker', 'Close a trade at a gain', L => L.some(P => (P.lots || []).some(l => l.sd && l.sp > l.bp))],
  ['🔁', 'Active Trader', '10+ trades in total', L => L.reduce((a, P) => a + (P.lots || []).length, 0) >= 10], ['🌐', 'Went Public', 'Put a portfolio on the leaderboard', L => L.some(P => P.pub)],
  ['🏁', 'Contender', 'Join a challenge', L => L.some(P => P.ch)], ['🤝', 'Copycat', 'Copy a Lead Trader into a portfolio', L => L.some(P => (P.lots || []).some(l => l.cp))],
  ['⏪', 'Replay Rookie', 'Finish a Market Replay session', (L, R) => (R.runs || 0) >= 1], ['🧠', 'Replay Pro', 'Beat buy-and-hold in Market Replay', (L, R) => !!R.beat], ['📓', 'Journaler', 'Write a note in your trade journal', () => Object.keys(jget('tw_journal', {})).length > 0], ['🧮', 'Risk Manager', 'Use the position size calculator', () => !!jget('tw_ps', null)]];
const LVL = ['Rookie', 'Analyst', 'Strategist', 'Portfolio Manager', 'Market Wizard'];
function achCard() { const L = rdP().list, R = jget('tw_replay', {}), got = ACH.map(a => { try { return a[3](L, R); } catch (e) { return false; } }), n = got.filter(Boolean).length, xp = n * 100, lv = Math.min(LVL.length - 1, Math.floor(n / 3)), into = (n % 3) / 3, pctv = lv === LVL.length - 1 ? 1 : into;
  const C = 2 * Math.PI * 46; return card('Your Trader Level', xp + ' XP · ' + n + ' of ' + ACH.length + ' badges', `<div class="tq-lv"><svg class="tq-ring" viewBox="0 0 110 110"><circle cx="55" cy="55" r="46" fill="none" stroke="#EEF2F8" stroke-width="10"/><circle cx="55" cy="55" r="46" fill="none" stroke="url(#tqg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(C * pctv).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 55 55)"/><defs><linearGradient id="tqg"><stop offset="0" stop-color="#00C176"/><stop offset="1" stop-color="#2F6BFF"/></linearGradient></defs><text x="55" y="52" text-anchor="middle" font-size="24" font-weight="800" font-family="Space Grotesk" fill="#0B1B3F">${lv + 1}</text><text x="55" y="70" text-anchor="middle" font-size="10" fill="#64748B">LEVEL</text></svg>
    <div><b style="font:800 22px 'Space Grotesk',sans-serif">${LVL[lv]}</b><p class="muted" style="margin:4px 0 0;font-size:13.5px">${lv < LVL.length - 1 ? (3 - n % 3) + ' more badge' + (3 - n % 3 === 1 ? '' : 's') + ' to reach ' + LVL[lv + 1] + '.' : 'Top level reached.'} Badges are earned in this browser and move to your account when accounts launch.</p></div></div>
    <div class="tq-ach">${ACH.map((a, i) => `<div class="${got[i] ? 'on' : ''}"><b>${a[0]} ${a[1]}</b>${a[2]}</div>`).join('')}</div>`); }

function paperHome() {
  const anchor = $('.mk-steps', app); if (!anchor || $('#tq-pp', app)) return; const C = CH(), o = rdP();
  const sec = document.createElement('div'); sec.id = 'tq-pp'; sec.style.cssText = 'display:flex;flex-direction:column;gap:18px';
  sec.innerHTML = banner('candles', 'Market Replay · train on real sessions', 'Trade the past <em>bar by bar</em>.', 'Pick any stock, hide the future, and step through real sessions one day at a time. Buy, sell or short, then see how you did against buy-and-hold.', [['$100K', 'virtual cash'], ['60', 'sessions per run'], [S.length, 'stocks to replay']])
    + card('Challenges', 'join with one click · ranked on the public leaderboard', `<div class="tq-g4">${C.map((c, i) => { const j = o.list.find(P => P.ch === c.k); return `<div class="tq-ch ${c.c}"><div class="tq-meta"><span>${c.i} ${c.tag}</span><span>${j ? '✓ Joined' : 'Free to enter'}</span></div><h4>${esc(c.n)}</h4><p>${c.d}</p><div class="tq-cd" data-end="${c.end}"></div><button type="button" data-ch="${i}">${j ? 'Open my entry →' : 'Join challenge'}</button></div>`; }).join('')}</div><p class="muted" style="font-size:12.5px;margin:10px 0 0">Prizes for challenge winners start when member accounts launch. Until then, challenges are for bragging rights and badges.</p>`)
    + card('Trading Toolkit', 'everything serious traders use, free', `<div class="tq-tools">${[['⏪', 'Market Replay Trainer', 'Step through real past sessions with the future hidden. Blind mode hides the name and dates.', '#/paper/replay'], ['🤝', 'Copy a Lead Trader', 'Mirror a Lead Trader\'s portfolio into your paper account in one click.', '#/social'], ['📊', 'Pro Analytics', 'Sharpe, Sortino, beta, alpha, drawdown and monthly returns on every portfolio.', o.list[0] ? '#/paper/p/' + o.list[0].id + '#tq-an' : '#/paper#pp-start'], ['🧮', 'Position Sizer', 'Size each trade from your risk and stop, inside every portfolio.', o.list[0] ? '#/paper/p/' + o.list[0].id + '#tq-tools' : '#/paper#pp-start'], ['📓', 'Trade Journal', 'Write why you bought. Review it when you sell.', o.list[0] ? '#/paper/p/' + o.list[0].id + '#tq-jr' : '#/paper#pp-start'], ['🏆', 'Leaderboard', 'Public rankings, re-scored after every close.', '#/paper/leaderboard']].map(t => `<a class="tq-tool" href="${t[3]}"><i>${t[0]}</i><div><b>${t[1]}</b><span>${t[2]}</span></div></a>`).join('')}</div>`)
    + achCard();
  anchor.after(sec); wake(sec); countdown(); $$('[data-ch]', sec).forEach(b => b.onclick = () => joinCh(C[+b.dataset.ch]));
  const v = $('.tq-bn', sec); if (v) { v.style.cursor = 'pointer'; v.onclick = () => { location.hash = '#/paper/replay'; }; }
}

function paperView(id) {
  const o = rdP(), P = o.list.find(x => x.id === id); if (!P) return; const cards = $$('.card', app); if (!cards.length || $('#tq-an', app)) return;
  const sc = cards.find(c => /Scorecard/.test(($('h3', c) || {}).textContent || '')), at = cards.find(c => /Add A Trade/.test(($('h3', c) || {}).textContent || ''));
  const V = paperV(P), A = analytics(V), c = PP.calc(P);
  const an = document.createElement('div'); an.id = 'tq-an';
  if (A) { const sec = {}; c.open.forEach(r => { const k = (BY[r.t] || {}).th || 'Other'; sec[k] = (sec[k] || 0) + r.v; }); sec.Cash = c.cash; const se = Object.entries(sec).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
    an.innerHTML = card('Pro Analytics', A.n + ' trading days · risk-adjusted, against the S&amp;P 500', statGrid(A)
      + `<div class="tq-2" style="margin-top:16px"><div><b style="font-size:13.5px">Growth of $100 vs the S&amp;P 500</b>${lines([{ name: 'This portfolio', col: '#2F6BFF', w: 2.4, fill: 'rgba(47,107,255,.08)', pts: V.map(p => [p[0], p[1] / V[0][1] * 100]) }, { name: 'S&P 500', col: '#94A3B8', pts: V.map(p => [p[0], 100 + (p[2] || 0)]) }], { legend: 1, fmt: v => '$' + v.toFixed(0), h: 200 })}</div>
        <div><b style="font-size:13.5px">Drawdown (distance from the last peak)</b>${lines([{ name: 'Drawdown', col: '#D72B45', fill: 'rgba(215,43,69,.12)', pts: A.uw }], { fmt: v => v.toFixed(0) + '%', h: 200, base: 0 })}</div></div>
      <div class="tq-2" style="margin-top:16px"><div><b style="font-size:13.5px">Monthly returns</b><div style="margin-top:8px">${heatGrid(A.mon)}</div></div><div><b style="font-size:13.5px">Exposure by theme</b><div style="margin-top:8px">${se.map(([k, v]) => `<div style="display:grid;grid-template-columns:minmax(0,1fr) 120px 56px;gap:8px;align-items:center;font-size:13px;margin:6px 0"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><div style="height:8px;background:#EEF2F8;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${(v / c.total * 100).toFixed(1)}%;background:linear-gradient(90deg,#2F6BFF,#00B86B)"></i></div><b style="text-align:right">${(v / c.total * 100).toFixed(1)}%</b></div>`).join('')}</div></div></div>`); }
  else an.innerHTML = card('Pro Analytics', '', '<p class="muted" style="margin:0">Analytics switch on after about 25 trading days of history. Sharpe, Sortino, beta, alpha, drawdown and monthly returns will appear here.</p>');
  (sc || cards[0]).after(an);
  const L = SO.leads ? SO.leads().slice().sort((a, b) => b.r12 - a.r12) : [], today = PP.lastDay(), px = t => (PP.closeOn(t, today) || {}).c;
  const tl = document.createElement('div'); tl.id = 'tq-tools';
  tl.innerHTML = card('Trading Tools', 'size trades, buy by dollar amount, or copy a Lead Trader', `<div class="tq-2">
    <div><b style="font-size:14px">🧮 Position size calculator</b><div class="tq-f" style="margin-top:8px"><label>Stock<input id="ps-t" list="pp-list" placeholder="NVDA"></label><label>Risk per trade (% of account)<input id="ps-r" type="number" value="1" step="0.25" min="0.1"></label><label>Stop loss below entry (%)<input id="ps-s" type="number" value="8" step="0.5" min="0.5"></label></div><div class="tq-out" id="ps-o">Enter a stock to see how many shares fit your risk.</div><button type="button" class="tq-btn g" id="ps-use" style="margin-top:8px">Use these shares in Add A Trade ↑</button></div>
    <div><b style="font-size:14px">💵 Buy by dollar amount</b><div class="tq-f" style="margin-top:8px"><label>Stock<input id="da-t" list="pp-list" placeholder="AAPL"></label><label>Amount ($)<input id="da-a" type="number" value="10000" step="500" min="1"></label></div><div class="tq-out" id="da-o">Shares are rounded down to whole shares at the last close.</div><button type="button" class="tq-btn g" id="da-use" style="margin-top:8px">Fill Add A Trade ↑</button></div></div>
    <div style="margin-top:18px;border-top:1px solid var(--line);padding-top:16px"><b style="font-size:14px">🤝 Copy a Lead Trader into this portfolio</b><p class="muted" style="margin:4px 0 8px;font-size:13px">Buys the trader's current holdings in the same weights, at today's closing prices, using the cash you choose. Cash available: <b>${money(c.cash)}</b>.</p>
    <div class="tq-f"><label>Lead Trader<select id="cp-m">${L.map(m => `<option value="${esc(m.id)}">${esc(m.name)} · 12M ${pct(m.r12)} · risk ${m.risk}/10</option>`).join('')}</select></label><label>Amount to invest ($)<input id="cp-a" type="number" value="${Math.max(0, Math.floor(Math.min(c.cash, 50000) / 1000) * 1000)}" min="0" step="1000"></label><button type="button" class="tq-btn p" id="cp-go">Copy portfolio</button></div><p class="pp-msg" id="cp-msg" style="margin:8px 0 0"></p></div>`);
  (at || an).after(tl);
  const shares = (t, f) => { t = (t || '').trim().toUpperCase(); const p = px(t); return BY[t] && p ? f(p, t) : null; };
  const ps = () => { const o2 = shares($('#ps-t').value, (p, t) => { const risk = c.total * (+$('#ps-r').value || 0) / 100, stop = p * (+$('#ps-s').value || 0) / 100, q = stop ? Math.floor(risk / stop) : 0, cost = q * p; jset('tw_ps', 1);
    return { q, t, html: `Buy <b>${q.toLocaleString()} shares</b> of ${t} at ${m2(p)} = <b>${money(cost)}</b> (${(cost / c.total * 100).toFixed(1)}% of the account).<br>Stop at <b>${m2(p - stop)}</b>. If hit, you lose about <b>${money(risk)}</b>.${cost > c.cash ? ' <b class="dn">More than your cash.</b>' : ''}` }; }); $('#ps-o').innerHTML = o2 ? o2.html : 'Pick a stock we cover.'; return o2; };
  const da = () => { const o2 = shares($('#da-t').value, (p, t) => { const q = Math.floor((+$('#da-a').value || 0) / p); return { q, t, html: `<b>${q.toLocaleString()} shares</b> of ${t} at ${m2(p)} = <b>${money(q * p)}</b>.` }; }); $('#da-o').innerHTML = o2 ? o2.html : 'Pick a stock we cover.'; return o2; };
  ['#ps-t', '#ps-r', '#ps-s'].forEach(s => $(s).addEventListener('input', ps)); ['#da-t', '#da-a'].forEach(s => $(s).addEventListener('input', da));
  const fill = o2 => { if (!o2 || !$('#tt')) return; $('#tt').value = o2.t; $('#tq').value = o2.q; $('#tt').dispatchEvent(new Event('change')); $('#tt').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  $('#ps-use').onclick = () => fill(ps()); $('#da-use').onclick = () => fill(da());
  $('#cp-go').onclick = () => { const m = L.find(x => x.id === $('#cp-m').value), amt = Math.min(+$('#cp-a').value || 0, PP.calc(P).cash), msg = $('#cp-msg'); if (!m || !(amt > 100)) { msg.className = 'pp-msg err'; msg.textContent = 'Choose an amount you have in cash.'; return; }
    const d = PP.iso(today), tot = m.hold.reduce((a, h) => a + h.v, 0), lots = []; m.hold.forEach(h => { const p = px(h.t); if (!p) return; const q = Math.floor(amt * h.v / tot / p); if (q > 0) lots.push({ id: uid(), t: h.t, q, bd: d, bp: +p.toFixed(4), sd: null, sp: null, cp: m.id }); });
    if (!lots.length) { msg.className = 'pp-msg err'; msg.textContent = 'Amount too small to buy whole shares.'; return; }
    const o2 = rdP(), P2 = o2.list.find(x => x.id === P.id); P2.lots = (P2.lots || []).concat(lots); wrP(o2); rerender(); };
  // trade journal column
  const J = jget('tw_journal', {}); $$('table.pp-t', app).forEach(tb => { const hr = $('thead tr', tb); if (!hr || $('.tq-jh', hr)) return; hr.insertAdjacentHTML('beforeend', '<th class="tq-jh">Journal</th>');
    $$('tbody tr', tb).forEach(tr => { const b = $('[data-del],[data-sell]', tr), lid = b ? (b.dataset.del || b.dataset.sell) : null; tr.insertAdjacentHTML('beforeend', lid ? `<td><input class="tq-jn" data-jn="${lid}" placeholder="Why this trade?" value="${esc(J[lid] || '')}"></td>` : '<td></td>'); }); });
  const op = $$('table.pp-t', app)[0]; if (op) op.closest('.card').id = 'tq-jr';
  $$('[data-jn]').forEach(i => i.addEventListener('change', () => { const J2 = jget('tw_journal', {}); if (i.value.trim()) J2[i.dataset.jn] = i.value.trim().slice(0, 200); else delete J2[i.dataset.jn]; jset('tw_journal', J2); }));
  const hs = location.hash.split('#')[2]; if (hs) setTimeout(() => { const e = document.getElementById(hs); if (e) e.scrollIntoView({ behavior: 'smooth' }); }, 80);
}

/* ---------- Market Replay Trainer ---------- */
const RP = { t: null, s: null, i0: 0, i: 0, end: 0, cash: 100000, pos: 0, avg: 0, log: [], marks: [], blind: false, play: null, done: false };
function replayPage() {
  const opts = S.slice().sort((a, b) => a.t.localeCompare(b.t)).map(s => `<option value="${esc(s.t)}">${esc(s.n)}</option>`).join(''), R = jget('tw_replay', {});
  app.innerHTML = `<section class="page-h"><div class="wrap"><h1>Market Replay Trainer</h1><p>Step through real past sessions with the future hidden. Trade as the bars come in, then compare your result with simply buying and holding.</p><nav class="pp-sub"><a href="#/paper">My Portfolios</a><a href="#/paper/leaderboard">🏆 Leaderboard</a><a href="#/paper/replay" class="on">⏪ Market Replay</a><a href="#/paper/how">How It Works</a></nav></div></section>
  <section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">
  ${card('Set Up A Session', (R.runs ? R.runs + ' sessions played · best ' + pct(R.best) : 'free · uses real daily closes'), `<div class="tq-f"><label>Stock<input id="rp-t" list="rp-list" placeholder="Random"><datalist id="rp-list">${opts}</datalist></label><label>Sessions to play<select id="rp-n"><option>40</option><option selected>60</option><option>90</option><option>120</option></select></label><label>Mode<select id="rp-b"><option value="0">Show name and dates</option><option value="1">Blind: hide name and dates</option></select></label><button type="button" class="tq-btn p" id="rp-go">▶ Start session</button></div>`)}
  <div class="tq-rp"><div><div class="tq-rpc" id="rp-c"></div><div class="tq-lg" style="margin-top:8px"><span><i style="background:#7FE3FF"></i>50-day average</span><span><i style="background:#F5B84B"></i>200-day average</span><span>▲ buy · ▼ sell/short</span><span class="muted">Candles show close-to-close moves from real daily closes.</span></div></div>
  <div class="card tq-pn"><div class="card-h"><h3 id="rp-h">No session yet</h3><span id="rp-d"></span></div>
    <div class="tq-kg" style="grid-template-columns:1fr 1fr"><div><span>Account value</span><b id="rp-v">$100,000</b></div><div><span>Your return</span><b id="rp-r">0.0%</b></div><div><span>Position</span><b id="rp-p">Flat</b></div><div><span>Buy &amp; hold</span><b id="rp-bh">—</b></div></div>
    <label style="font-size:12.5px;font-weight:600;color:var(--mut)">Trade size<select id="rp-sz" style="width:100%;padding:8px;border:1.5px solid var(--line);border-radius:10px;margin-top:4px"><option value="0.25">25% of account</option><option value="0.5">50% of account</option><option value="1" selected>100% of account</option></select></label>
    <div class="row"><button type="button" class="tq-btn b" id="rp-buy">▲ Buy</button><button type="button" class="tq-btn r" id="rp-sh">▼ Short</button><button type="button" class="tq-btn g" id="rp-x">Close</button></div>
    <div class="row"><button type="button" class="tq-btn g" id="rp-nx">Next day ⏭</button><button type="button" class="tq-btn g" id="rp-pl">▶ Auto-play</button></div>
    <div class="tq-log" id="rp-log"><div class="muted">Your trades appear here.</div></div></div></div>
  ${card('How Market Replay Works', '', '<div class="mk-steps" style="margin:0"><div><i>🎲</i><b>Pick a moment</b><p>Choose a stock or let us pick one, plus a random starting point in the last two years.</p></div><div><i>🙈</i><b>Hide the future</b><p>You only see the bars up to today in the replay. Blind mode also hides the name and dates.</p></div><div><i>⚖️</i><b>Trade as it unfolds</b><p>Buy, short or close at each day\'s close. Step one day at a time or auto-play.</p></div><div><i>🏁</i><b>Score yourself</b><p>At the end, compare your return with buy-and-hold over the same days and earn badges.</p></div></div>')}
  </div></section>`;
  const cv = $('#rp-c'); let H = null; const draw = () => { if (!H) return; const [w, h] = H.size(); H.x.clearRect(0, 0, w, h); if (!RP.s) { H.x.fillStyle = '#9FB3DD'; H.x.font = '600 14px Inter'; H.x.fillText('Press Start session to load a real chart.', 20, 40); return; }
    const vis = RP.s.slice(Math.max(0, RP.i - 90), RP.i + 1), B = toBars(vis); candles(H.x, w, h, B, { n: Math.max(60, B.length), ma: [vis.map(p => p.m50), vis.map(p => p.m200)], marks: RP.marks.filter(m => m.i > RP.i - vis.length).map(m => ({ i: m.i - (RP.i - vis.length + 1), side: m.side })) }); };
  H = host(cv, () => draw());
  const val = () => { const p = RP.s ? RP.s[RP.i].c : 0; return RP.cash + RP.pos * p; }, lg = (s, cl) => { RP.log.unshift(`<div><span>${RP.blind ? 'Day ' + (RP.i - RP.i0) : dfmt(PP.iso(RP.s[RP.i].d))}</span><b class="${cl || ''}">${s}</b></div>`); };
  const ui = () => { if (!RP.s) return; const p = RP.s[RP.i].c, v = val(), r = (v / 100000 - 1) * 100, bh = (p / RP.s[RP.i0].c - 1) * 100, left = RP.end - RP.i;
    $('#rp-h').textContent = (RP.blind ? 'Mystery stock' : RP.t) + (RP.done ? ' · session over' : ''); $('#rp-d').textContent = RP.blind ? 'day ' + (RP.i - RP.i0) + ' · ' + left + ' left' : dfmt(PP.iso(RP.s[RP.i].d)) + ' · ' + left + ' sessions left';
    $('#rp-v').textContent = money(v); $('#rp-r').textContent = pct(r); $('#rp-r').className = cls(r); $('#rp-bh').textContent = pct(bh); $('#rp-bh').className = cls(bh);
    $('#rp-p').textContent = RP.pos > 0 ? 'Long ' + RP.pos.toLocaleString() : RP.pos < 0 ? 'Short ' + (-RP.pos).toLocaleString() : 'Flat'; $('#rp-log').innerHTML = RP.log.join('') || '<div class="muted">Your trades appear here.</div>';
    ['#rp-buy', '#rp-sh', '#rp-x', '#rp-nx', '#rp-pl'].forEach(s => { $(s).disabled = RP.done; }); draw(); };
  const close = () => { if (!RP.pos) return; const p = RP.s[RP.i].c, g = (p - RP.avg) * RP.pos; RP.cash += RP.pos * p; lg((RP.pos > 0 ? 'Sold ' : 'Covered ') + Math.abs(RP.pos).toLocaleString() + ' at ' + m2(p) + ' · ' + (g >= 0 ? '+' : '−') + '$' + Math.round(Math.abs(g)).toLocaleString(), g >= 0 ? 'up' : 'dn'); RP.marks.push({ i: RP.i, side: RP.pos > 0 ? 'S' : 'B' }); RP.pos = 0; };
  const open = side => { if (RP.done) return; const p = RP.s[RP.i].c; if ((side > 0 && RP.pos < 0) || (side < 0 && RP.pos > 0)) close(); const q = Math.floor(val() * (+$('#rp-sz').value) / p) - Math.abs(RP.pos); if (q <= 0) return;
    RP.avg = RP.pos ? (RP.avg * Math.abs(RP.pos) + p * q) / (Math.abs(RP.pos) + q) : p; RP.pos += side * q; RP.cash -= side * q * p; RP.marks.push({ i: RP.i, side: side > 0 ? 'B' : 'S' }); lg((side > 0 ? 'Bought ' : 'Shorted ') + q.toLocaleString() + ' at ' + m2(p), side > 0 ? 'up' : 'dn'); ui(); };
  const finish = () => { close(); RP.done = true; clearInterval(RP.play); RP.play = null; $('#rp-pl').textContent = '▶ Auto-play'; const r = (val() / 100000 - 1) * 100, bh = (RP.s[RP.i].c / RP.s[RP.i0].c - 1) * 100, R2 = jget('tw_replay', {});
    R2.runs = (R2.runs || 0) + 1; R2.best = Math.max(nz(R2.best) ? R2.best : -1e9, r); if (r > bh) R2.beat = (R2.beat || 0) + 1; jset('tw_replay', R2);
    lg(`Session over: you ${pct(r)} vs buy &amp; hold ${pct(bh)}${RP.blind ? ' · it was ' + RP.t + ', ' + dfmt(PP.iso(RP.s[RP.i0].d)) + ' to ' + dfmt(PP.iso(RP.s[RP.i].d)) : ''}`, r > bh ? 'up' : 'dn'); ui(); };
  const next = () => { if (RP.done || !RP.s) return; RP.i++; if (RP.i >= RP.end) { RP.i = RP.end; finish(); return; } ui(); };
  $('#rp-go').onclick = () => { let t = ($('#rp-t').value || '').trim().toUpperCase(); const n = +$('#rp-n').value, ok = s => ser(s.t).length > n + 120; if (!BY[t] || !ok(BY[t])) { const pool = S.filter(ok); t = pool[Math.floor(Math.random() * pool.length)].t; }
    const s = ser(t), i0 = 100 + Math.floor(Math.random() * (s.length - n - 101)); clearInterval(RP.play); Object.assign(RP, { t, s, i0, i: i0, end: i0 + n, cash: 100000, pos: 0, avg: 0, log: [], marks: [], blind: $('#rp-b').value === '1', play: null, done: false }); $('#rp-pl').textContent = '▶ Auto-play'; ui(); };
  $('#rp-buy').onclick = () => RP.s && open(1); $('#rp-sh').onclick = () => RP.s && open(-1); $('#rp-x').onclick = () => { if (RP.s && !RP.done) { close(); ui(); } }; $('#rp-nx').onclick = next;
  $('#rp-pl').onclick = () => { if (!RP.s || RP.done) return; if (RP.play) { clearInterval(RP.play); RP.play = null; $('#rp-pl').textContent = '▶ Auto-play'; } else { RP.play = setInterval(() => { if (!alive(cv)) { clearInterval(RP.play); return; } next(); }, 450); $('#rp-pl').textContent = '⏸ Pause'; } };
  if (RP.s) ui(); document.title = 'Market Replay — Tickerwise';
}

/* ================= SOCIAL TRADING ================= */
const QS = { risk: 10, min: -100, style: '', sort: 'sharpe', cmp: [] };
const leadA = m => m.__a || (m.__a = analytics(m.V) || {});
function socialHome() {
  const anchor = $('#so-top', app) || $('.so-2', app); if (!anchor || $('#tq-so', app)) return; const L = (SO.leads ? SO.leads() : []); if (!L.length) return;
  const styles = [...new Set(L.map(m => m.style))].sort(); const box = document.createElement('div'); box.id = 'tq-so'; box.style.cssText = 'display:flex;flex-direction:column;gap:18px';
  const render = () => {
    const key = { sharpe: m => leadA(m).sharpe || -9, r12: m => m.r12, dd: m => m.dd, risk: m => -m.risk, f: m => m.f }[QS.sort];
    const rows = L.filter(m => m.risk <= QS.risk && m.r12 >= QS.min && (!QS.style || m.style === QS.style)).sort((a, b) => key(b) - key(a));
    box.innerHTML = card('Trader Screener', rows.length + ' of ' + L.length + ' Lead Traders match · tick up to 3 to compare', `<div class="tq-f"><label>Max risk score: <b id="sq-rv">${QS.risk}</b><input type="range" id="sq-r" min="1" max="10" value="${QS.risk}"></label><label>Min 12-month return<select id="sq-m">${[[-100, 'Any'], [0, 'Positive'], [10, '+10% or more'], [25, '+25% or more'], [50, '+50% or more']].map(o => `<option value="${o[0]}" ${QS.min === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label><label>Style<select id="sq-s"><option value="">All styles</option>${styles.map(s => `<option ${QS.style === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></label><label>Sort by<select id="sq-o">${[['sharpe', 'Best risk-adjusted (Sharpe)'], ['r12', '12-month return'], ['dd', 'Smallest drawdown'], ['risk', 'Lowest risk'], ['f', 'Most followed']].map(o => `<option value="${o[0]}" ${QS.sort === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label></div>
      <div class="tbl-wrap" style="max-height:none;margin-top:12px"><table class="tq-tbl"><thead><tr><th></th><th>Lead Trader</th><th>Style</th><th class="num">12M</th><th class="num">Sharpe</th><th class="num">Max DD</th><th>Risk</th><th class="num">Win rate</th><th class="num">Followers</th></tr></thead><tbody>${rows.map(m => { const a = leadA(m); return `<tr><td><input type="checkbox" data-cmp="${esc(m.id)}" ${QS.cmp.includes(m.id) ? 'checked' : ''} aria-label="Compare ${esc(m.name)}"></td><td><a href="#/social/t/${encodeURIComponent(m.id)}" style="display:flex;gap:8px;align-items:center;color:inherit">${PP.avatar(m.id, m.look, 30)}<b>${esc(m.name)}</b></a></td><td>${esc(m.style)}</td><td class="num"><b class="${cls(m.r12)}">${pct(m.r12)}</b></td><td class="num">${f2(a.sharpe)}</td><td class="num dn">${pct(m.dd)}</td><td>${riskK(m.risk)} ${m.risk}</td><td class="num">${Math.round(m.win)}%</td><td class="num">${(SO.fol || String)(m.f)}</td></tr>`; }).join('') || '<tr><td colspan="9" class="muted">No Lead Traders match these filters.</td></tr>'}</tbody></table></div><p class="muted" style="font-size:12px;margin:8px 0 0">Demo Lead Traders · every trade at a real closing price · Sharpe uses a 4% cash rate.</p>`)
      + (QS.cmp.length >= 2 ? compareCard(QS.cmp.map(id => L.find(m => m.id === id)).filter(Boolean)) : card('Compare Lead Traders', 'side by side', '<p class="muted" style="margin:0">Tick two or three Lead Traders in the screener to compare their returns, risk and holdings side by side.</p>'));
    $('#sq-r', box).oninput = e => { QS.risk = +e.target.value; $('#sq-rv', box).textContent = QS.risk; clearTimeout(box.__t); box.__t = setTimeout(render, 200); };
    $('#sq-m', box).onchange = e => { QS.min = +e.target.value; render(); }; $('#sq-s', box).onchange = e => { QS.style = e.target.value; render(); }; $('#sq-o', box).onchange = e => { QS.sort = e.target.value; render(); };
    $$('[data-cmp]', box).forEach(c => c.onchange = () => { const id = c.dataset.cmp; QS.cmp = c.checked ? QS.cmp.concat([id]).slice(-3) : QS.cmp.filter(x => x !== id); render(); });
  };
  render(); anchor.after(box);
}
function compareCard(ms) {
  const COL = ['#2F6BFF', '#00B86B', '#F28C28'], d0 = Math.max(...ms.map(m => m.V[0][0]), PP.lastDay() - 365);
  const ser2 = ms.map((m, i) => { const v = m.V.filter(p => p[0] >= d0), b = v[0][1]; return { name: m.name, col: COL[i], w: 2.4, pts: v.map(p => [p[0], (p[1] / b - 1) * 100]) }; });
  const sp = ms[0].V.filter(p => p[0] >= d0), sb = 1 + (sp[0][2] || 0) / 100; ser2.push({ name: 'S&P 500', col: '#94A3B8', dash: 1, pts: sp.map(p => [p[0], ((1 + (p[2] || 0) / 100) / sb - 1) * 100]) });
  const rowsD = [['12-month return', m => pct(m.r12)], ['Since joining', m => pct(m.c.ret)], ['Sharpe', m => f2(leadA(m).sharpe)], ['Sortino', m => f2(leadA(m).sortino)], ['Beta', m => f2(leadA(m).beta)], ['Max drawdown', m => pct(m.dd)], ['Volatility', m => nz(m.vol) ? m.vol.toFixed(1) + '%' : '—'], ['Risk score', m => m.risk + '/10'], ['Win rate', m => Math.round(m.win) + '%'], ['Avg holding', m => Math.round(m.avgHold) + ' days'], ['Open positions', m => m.hold.length], ['Top holding', m => m.hold[0] ? m.hold[0].t + ' ' + m.hold[0].w.toFixed(0) + '%' : '—']];
  const ov = {}; ms.forEach(m => m.hold.forEach(h => { ov[h.t] = (ov[h.t] || 0) + 1; })); const shared = Object.entries(ov).filter(x => x[1] > 1).map(x => x[0]);
  return card('Compare Lead Traders', ms.length + ' side by side · last 12 months', lines(ser2, { legend: 1, zero: 1, fmt: v => v.toFixed(0) + '%', h: 230, label: 'Lead Trader comparison' })
    + `<div class="tbl-wrap" style="max-height:none;margin-top:12px"><table class="tq-tbl"><thead><tr><th></th>${ms.map((m, i) => `<th style="color:${COL[i]}">${esc(m.name)}</th>`).join('')}</tr></thead><tbody>${rowsD.map(r => `<tr><td class="muted">${r[0]}</td>${ms.map(m => `<td><b>${r[1](m)}</b></td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p style="margin:10px 0 0;font-size:13px">${shared.length ? '<b>Held in common:</b> ' + shared.map(t => `<a href="#/stock/${esc(t)}">${esc(t)}</a>`).join(', ') : 'No stocks in common: these traders would diversify each other.'}</p>`);
}
function badges(m, L) { const a = leadA(m), b = [], rk = L.slice().sort((x, y) => y.r12 - x.r12).indexOf(m);
  if (rk >= 0 && rk < 3) b.push(['v', '🏆 Top 3 this year']); if (nz(a.sharpe) && a.sharpe > 1) b.push(['g', '⚖️ Strong risk-adjusted returns']); if (m.dd > -15) b.push(['g', '🛡️ Shallow drawdowns']); if (m.r12 > m.s12) b.push(['', '📈 Beat the S&P 500']);
  if (a.upM >= 60) b.push(['', '📅 Consistent: ' + Math.round(a.upM) + '% up months']); if (m.avgHold > 180) b.push(['o', '⏳ Long-term holder']); if (m.hold.length >= 10) b.push(['', '🧺 Diversified']); if (m.risk >= 7) b.push(['o', '🔥 High risk, high octane']); return b; }
function socialProfile(id) {
  if ($('#tq-sp', app)) return; const L = SO.leads ? SO.leads() : [], m = L.find(x => x.id === id); const kp = $('.so-kp', app); if (!m || !kp) return; const A = leadA(m);
  const box = document.createElement('div'); box.id = 'tq-sp'; box.style.cssText = 'display:flex;flex-direction:column;gap:18px';
  box.innerHTML = `<div class="tq-bd">${badges(m, L).map(x => `<span class="${x[0]}">${x[1]}</span>`).join('')}</div>`
    + (A.n ? card('Risk &amp; Performance Analytics', 'from ' + A.n + ' trading days, against the S&amp;P 500', statGrid(A) + `<div style="margin-top:14px"><b style="font-size:13.5px">Drawdown: distance below the last high</b>${lines([{ name: 'Drawdown', col: '#D72B45', fill: 'rgba(215,43,69,.12)', pts: A.uw }], { fmt: v => v.toFixed(0) + '%', h: 170, base: 0 })}</div>`) : '')
    + card('Copy Simulator', 'what copying ' + esc(m.name.split(' ')[0]) + ' would have done, with a safety stop', `<div class="tq-f"><label>Amount: <b id="cs-av">$10,000</b><input type="range" id="cs-a" min="1000" max="100000" step="1000" value="10000"></label><label>Start copying<select id="cs-p"><option value="21">1 month ago</option><option value="63">3 months ago</option><option value="126">6 months ago</option><option value="252" selected>1 year ago</option><option value="9999">When they joined</option></select></label><label>Trailing safety stop<select id="cs-s"><option value="0">None</option><option value="10">10% below its high</option><option value="20" selected>20% below its high</option><option value="30">30% below its high</option></select></label></div><div id="cs-o"></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px"><button type="button" class="tq-btn p" id="cs-pp">🤝 Copy into Paper Trading</button><span class="muted" style="font-size:12.5px">Opens a $100,000 practice portfolio and invests the amount above in the same holdings and weights, at today's close. Real-money copying comes with brokerage linking.</span></div><p class="pp-msg" id="cs-msg"></p>`);
  kp.after(box);
  const sim = () => { const amt = +$('#cs-a').value, back = +$('#cs-p').value, stp = +$('#cs-s').value, d0 = Math.max(m.V[0][0], PP.lastDay() - Math.round(back * 365 / 252)), V = m.V.filter(p => p[0] >= d0); if (V.length < 2) return;
    $('#cs-av').textContent = money(amt); const b = V[0][1], sb = 1 + (V[0][2] || 0) / 100; let stopped = null, pk = amt; const cp = V.map(p => { if (stopped) return [p[0], stopped.v]; const v = amt * p[1] / b; pk = Math.max(pk, v); if (stp && v <= pk * (1 - stp / 100)) stopped = { d: p[0], v }; return [p[0], v]; });
    const sp = V.map(p => [p[0], amt * (1 + (p[2] || 0) / 100) / sb]), end = cp[cp.length - 1][1], se = sp[sp.length - 1][1];
    $('#cs-o').innerHTML = `<div class="tq-kg" style="margin-top:12px"><div><span>Copying ${esc(m.name.split(' ')[0])}</span><b class="${cls(end - amt)}">${money(end)}</b><small>${pct((end / amt - 1) * 100)}</small></div><div><span>S&amp;P 500 instead</span><b>${money(se)}</b><small>${pct((se / amt - 1) * 100)}</small></div><div><span>Difference</span><b class="${cls(end - se)}">${(end - se >= 0 ? '+' : '−') + '$' + Math.round(Math.abs(end - se)).toLocaleString()}</b><small>vs the index</small></div><div><span>Safety stop</span><b>${stopped ? 'Triggered' : stp ? 'Not hit' : 'Off'}</b><small>${stopped ? 'sold out on ' + dfmt(PP.iso(stopped.d)) : stp ? 'never fell ' + stp + '% from a high' : 'no stop set'}</small></div></div>`
      + lines([{ name: 'Copy of ' + m.name, col: '#2F6BFF', w: 2.4, fill: 'rgba(47,107,255,.08)', pts: cp }, { name: 'S&P 500', col: '#94A3B8', dash: 1, pts: sp }], { legend: 1, fmt: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v.toFixed(0)), h: 200 })
      + '<p class="muted" style="font-size:12px;margin:6px 0 0">Simulation from this Lead Trader\'s real-price track record. Past results do not predict future returns.</p>'; };
  ['#cs-a', '#cs-p', '#cs-s'].forEach(s => $(s).addEventListener('input', sim)); sim();
  $('#cs-pp').onclick = () => { const amt = +$('#cs-a').value, today = PP.lastDay(), d = PP.iso(today), tot = m.hold.reduce((a, h) => a + h.v, 0), lots = [];
    m.hold.forEach(h => { const p = (PP.closeOn(h.t, today) || {}).c; if (!p) return; const q = Math.floor(amt * h.v / tot / p); if (q > 0) lots.push({ id: uid(), t: h.t, q, bd: d, bp: +p.toFixed(4), sd: null, sp: null, cp: m.id }); });
    const o = rdP(), P = { id: uid(), name: 'Copy of ' + m.name, mode: 'practice', created: d, lots, pub: false }; o.list.push(P); wrP(o); location.hash = '#/paper/p/' + P.id; };
}

/* ================= router ================= */
function apply() {
  const r = rt();
  try {
    ensureBanner();
    if (r[0] === 'paper') { if (r[1] === 'replay') { if (!$('#rp-c', app)) replayPage(); } else if (!r[1]) paperHome(); else if (r[1] === 'p' && r[2]) paperView(r[2]); }
    if (r[0] === 'social') { if (!r[1]) socialHome(); else if (r[1] === 't' && r[2]) socialProfile(decodeURIComponent(r[2])); }
  } catch (e) { if (window.console) console.error(e); }
}
let pend = 0; new MutationObserver(ms => { if (ms.every(mu => { const t = mu.target.nodeType === 1 ? mu.target : mu.target.parentElement; return t && t.closest && t.closest('.tq-bn,#tq-pp,#tq-so,#tq-sp,#tq-an,#tq-tools,.tq-cd,.mo-race,.mo-tape,.mk-st,#rp-log'); })) return; if (pend) return; pend = 1; setTimeout(() => { pend = 0; apply(); }, 60); }).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { setTimeout(apply, 40); setTimeout(apply, 400); });
// paper nav: add Market Replay to the Paper Trading sub-menu
new MutationObserver(() => { const n = $('nav.pp-sub', app); if (n && !$('a[href="#/paper/replay"]', n)) { const a = document.createElement('a'); a.href = '#/paper/replay'; a.textContent = '⏪ Market Replay'; const how = $('a[href="#/paper/how"]', n); n.insertBefore(a, how); } }).observe(app, { childList: true });
window.TWQ = { analytics, banner, wake, lines };
apply();
})();
