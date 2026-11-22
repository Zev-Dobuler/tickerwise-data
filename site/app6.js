/* ---------- Paper Trading + Leaderboard (Nov 22, 2026). Front-end preview: portfolios live in the visitor's browser; public portfolios are
   published as snapshots to the site's PaperPortfolios collection (Wix Data, anyone can read and add, nobody but the admin can edit or delete). ---------- */
(function () {
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const { S, BY, esc, nz, sg, cls, dfmt, pxSeries, pxDate } = window.TWX || {};
const app = $('#app'), START = 100000, CLIENT = '5883ec70-a62e-4258-806c-af065b13f4c9', COLL = 'PaperPortfolios', API = 'https://www.wixapis.com';
const st = document.createElement('style'); st.id = 'pp-css'; st.textContent = `
.pp-sub{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.pp-sub a{padding:7px 14px;border-radius:999px;border:1.5px solid var(--line);font:600 14px Inter,sans-serif;text-decoration:none;color:#334155;background:#fff}.pp-sub a.on{background:#0B1B3F;color:#fff;border-color:#0B1B3F}
.pp-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.pp-c{display:block;border:1.5px solid var(--line);border-radius:16px;padding:16px;text-decoration:none;color:inherit;background:#fff}.pp-c:hover{border-color:#2F6BFF}
.pp-c h4{margin:0 0 2px;font:700 17px 'Space Grotesk',sans-serif}.pp-c .pp-v{font:800 26px 'Space Grotesk',sans-serif;margin:8px 0 2px}.pp-tag{display:inline-block;font:700 11px Inter,sans-serif;padding:3px 8px;border-radius:999px;background:#EEF4FF;color:#2F6BFF;margin-left:6px;vertical-align:middle}.pp-tag.g{background:#E7F8EF;color:#00995A}.pp-tag.p{background:#FFF7E0;color:#9A6B00}
.pp-new{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;border:2px dashed #BFD3FF;border-radius:16px;padding:16px;cursor:pointer;color:#2F6BFF;font-weight:700;background:#F7FAFF;min-height:130px}
.pp-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px}.pp-k>div{background:#F7F9FC;border-radius:12px;padding:10px 14px}.pp-k span{display:block;font-size:12.5px;color:var(--mut);font-weight:600}.pp-k b{display:block;font:800 22px 'Space Grotesk',sans-serif;margin-top:2px}.pp-k small{font-size:12px;color:var(--mut)}
.pp-f{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;align-items:end}.pp-f label{display:flex;flex-direction:column;gap:4px;font:600 12.5px Inter,sans-serif;color:#334155}.pp-f input,.pp-f select{padding:9px 10px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;min-width:0;width:100%;box-sizing:border-box}
.pp-f .btn{padding:10px 14px}.pp-msg{font-size:13px;margin:8px 0 0}.pp-msg.err{color:#D72B45}.pp-msg.ok{color:#00995A}
.pp-t td,.pp-t th{padding:8px 10px;white-space:nowrap}.pp-x{border:0;background:none;color:#94A3B8;cursor:pointer;font-size:13px;font-weight:600;padding:2px 6px}.pp-x:hover{color:#D72B45}.pp-sell{border:1.5px solid #2F6BFF;background:#fff;color:#2F6BFF;border-radius:8px;cursor:pointer;font:600 12.5px Inter,sans-serif;padding:3px 9px}
.pp-pub{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:12px 14px;margin:0 0 12px;font-size:14px}.pp-pub input{width:18px;height:18px;accent-color:#7C3AED}
.pp-note{font-size:12.5px;color:var(--mut);margin:10px 0 0;line-height:1.5}.pp-how li{margin:6px 0;line-height:1.5}
.lb-t td,.lb-t th{padding:10px;white-space:nowrap}.lb-t tr.clk{cursor:pointer}.lb-t tr.clk:hover td{background:#F7FAFF}.lb-r{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;font:800 14px 'Space Grotesk',sans-serif;background:#EEF2F8}.lb-r.g1{background:#FFD60A}.lb-r.g2{background:#E2E8F0}.lb-r.g3{background:#F3C998}
.lb-top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:14px}.lb-pod{border-radius:16px;padding:14px;text-align:center;text-decoration:none;color:inherit;border:1.5px solid var(--line);background:#fff}.lb-pod b{display:block;font:800 24px 'Space Grotesk',sans-serif}.lb-pod .m{font-size:28px}
.lb-sort{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
.mk-hero{position:relative;overflow:hidden;border-radius:24px;padding:34px;background:linear-gradient(135deg,#0B1B3F 0%,#1E3A8A 55%,#2F6BFF 100%);color:#fff;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:30px;align-items:center}
.mk-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(420px 240px at 90% 10%,rgba(0,193,118,.35),transparent 60%),radial-gradient(380px 220px at 0% 100%,rgba(124,77,255,.4),transparent 60%);pointer-events:none}
.mk-hero>*{position:relative;min-width:0}.mk-eb{display:inline-block;font:700 12px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7FE3FF;background:rgba(255,255,255,.1);padding:5px 10px;border-radius:999px}
.mk-hero h2{font:800 40px/1.08 'Space Grotesk',sans-serif;margin:14px 0 12px;color:#fff}.mk-hero h2 em{font-style:normal;background:linear-gradient(90deg,#00E38C,#7FE3FF);-webkit-background-clip:text;background-clip:text;color:transparent}.mk-hero p{color:#D6E2FF;font-size:16.5px;line-height:1.55;margin:0 0 20px}
.mk-cta{display:flex;gap:10px;flex-wrap:wrap}.mk-cta a{padding:12px 18px;border-radius:12px;font:700 15px Inter,sans-serif;text-decoration:none}.mk-cta a.p{background:linear-gradient(90deg,#00C176,#0EA5E9);color:#fff}.mk-cta a.g{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25)}
.mk-st{display:flex;gap:26px;flex-wrap:wrap;margin-top:24px}.mk-st b{display:block;font:800 26px 'Space Grotesk',sans-serif}.mk-st span{font-size:13px;color:#C4D3F5}
.mk-art{background:rgba(255,255,255,.97);color:var(--ink);border-radius:20px;padding:16px;box-shadow:0 30px 60px rgba(0,0,0,.3)}.mk-art h5{margin:0 0 10px;font:800 12px Inter,sans-serif;letter-spacing:.08em;color:#64748B;text-transform:uppercase}
.mk-row{display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid #EEF2F8;text-decoration:none;color:inherit}.mk-row:last-child{border-bottom:0}.mk-row b{font:700 14.5px 'Space Grotesk',sans-serif}.mk-row small{display:block;color:#64748B;font-size:12px}.mk-row .r{margin-left:auto;text-align:right;font:800 16px 'Space Grotesk',sans-serif}
.mk-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}.mk-steps>div{background:#fff;border:1.5px solid var(--line);border-radius:18px;padding:18px}.mk-steps i{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;font-style:normal;font-size:22px;background:#EEF4FF;margin-bottom:10px}.mk-steps b{display:block;font:700 17px 'Space Grotesk',sans-serif;margin-bottom:4px}.mk-steps p{margin:0;color:#475569;font-size:14px;line-height:1.5}
.tw-av{flex:none;border-radius:50%;display:block}.pp-who{display:flex;align-items:center;gap:10px}
.mk-demo{font-size:12.5px;color:#64748B;background:#F8FAFC;border:1px dashed #CBD5E1;border-radius:10px;padding:8px 12px;line-height:1.5}
@media (max-width:900px){.mk-hero{grid-template-columns:minmax(0,1fr);padding:24px 18px}.mk-hero h2{font-size:30px}}
@media (max-width:760px){.lb-top{grid-template-columns:1fr}.pp-f{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
if (!$('#pp-css')) document.head.appendChild(st);

/* ---------- storage ---------- */
const KEY = 'tw_paper', rd = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || { prof: null, list: [] }; } catch (e) { return { prof: null, list: [] }; } };
const wr = o => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');
const iso = d => new Date(d * 864e5).toISOString().slice(0, 10), dnum = s => Math.round(new Date(s + 'T00:00:00Z') / 864e5);
const money = v => !nz(v) ? '—' : (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
const money2 = v => !nz(v) ? '—' : '$' + v.toFixed(2);

/* ---------- prices: daily closes from the site's price data ---------- */
const PC = {}; const ser = t => PC[t] || (PC[t] = (pxSeries(t) || []).filter(p => nz(p.c)));
const lastDay = () => { const s = ser('SPY'); return s.length ? s[s.length - 1].d : null; };
const closeOn = (t, d) => { const s = ser(t); let lo = 0, hi = s.length - 1, v = null; while (lo <= hi) { const m = (lo + hi) >> 1; if (s[m].d <= d) { v = s[m]; lo = m + 1; } else hi = m - 1; } return v; };
const firstDay = t => { const s = ser(t); return s.length ? s[0].d : null; };

/* ---------- portfolio math ---------- */
function calc(P) {
  const L = P.lots || [], today = lastDay(); let cost = 0, proceeds = 0, value = 0, best = null;
  const rows = L.map(l => { const cur = l.sd ? null : closeOn(l.t, today), px = l.sd ? l.sp : cur && cur.c, v = l.q * (px || 0), c = l.q * l.bp, r = c ? (v / c - 1) * 100 : null;
    if (r != null && (!best || r > best.r)) best = { t: l.t, r }; cost += c; if (l.sd) proceeds += v; else value += v; return Object.assign({}, l, { px, v, c, g: v - c, r }); });
  const S0 = P.start || START, cash = S0 - cost + proceeds, total = cash + value, ret = (total / S0 - 1) * 100;
  const d0 = L.length ? Math.min(...L.map(l => dnum(l.bd))) : null, a = d0 && closeOn('SPY', d0), b = closeOn('SPY', today), spx = a && b ? (b.c / a.c - 1) * 100 : null;
  return { rows, cash, value, total, ret, best, spx, open: rows.filter(r => !r.sd), closed: rows.filter(r => r.sd), d0 };
}
function cashOK(lots, st) { const ev = []; lots.forEach(l => { ev.push([dnum(l.bd), -l.q * l.bp]); if (l.sd) ev.push([dnum(l.sd), l.q * l.sp]); }); ev.sort((a, b) => a[0] - b[0] || b[1] - a[1]); let c = st || START; for (const e of ev) { c += e[1]; if (c < -0.01) return false; } return true; }
function curve(P) {
  const L = P.lots || []; if (!L.length) return null; const d0 = Math.min(...L.map(l => dnum(l.bd))), days = ser('SPY').filter(p => p.d >= d0).map(p => p.d); if (days.length < 2) return null;
  const s0 = closeOn('SPY', d0); return days.map(d => { let cash = P.start || START, hold = 0; L.forEach(l => { const b = dnum(l.bd), s = l.sd ? dnum(l.sd) : Infinity; if (d < b) return; cash -= l.q * l.bp; if (d >= s) cash += l.q * l.sp; else { const c = closeOn(l.t, d); hold += l.q * (c ? c.c : l.bp); } });
    const sp = closeOn('SPY', d); return [d, (cash + hold) / (P.start || START) * 100 - 100, s0 && sp ? (sp.c / s0.c - 1) * 100 : null]; });
}
function chart(P, who) {
  const C = curve(P); if (!C) return '<p class="muted" style="margin:8px 0">The chart appears after your first trade.</p>';
  const W = 900, H = 230, pl = 52, pr = 90, pt = 14, pb = 26, iw = W - pl - pr, ih = H - pt - pb, vs = C.flatMap(p => [p[1], p[2]]).filter(nz), mx = Math.max(2, ...vs), mn = Math.min(-2, ...vs);
  const X = d => pl + (d - C[0][0]) / ((C[C.length - 1][0] - C[0][0]) || 1) * iw, Y = v => pt + ih - (v - mn) / ((mx - mn) || 1) * ih;
  let g = ''; [mn, 0, mx].forEach(v => { g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? '#CBD5E1' : '#EEF2F8'}"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#94A3B8">${sg(v, 0)}</text>`; });
  g += `<polyline fill="none" stroke="#94A3B8" stroke-width="1.8" points="${C.filter(p => nz(p[2])).map(p => X(p[0]).toFixed(1) + ',' + Y(p[2]).toFixed(1)).join(' ')}"/>`;
  g += `<polyline fill="none" stroke="#2F6BFF" stroke-width="2.8" points="${C.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
  const l = C[C.length - 1]; g += `<text x="${W - pr + 6}" y="${Y(l[1]) + 4}" font-size="12" font-weight="800" fill="#2F6BFF">${esc(who || 'You')} ${sg(l[1], 1)}</text>${nz(l[2]) ? `<text x="${W - pr + 6}" y="${Y(l[2]) + 4 + (Math.abs(Y(l[2]) - Y(l[1])) < 14 ? 14 : 0)}" font-size="12" font-weight="700" fill="#64748B">S&amp;P ${sg(l[2], 1)}</text>` : ''}`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Portfolio vs S&P 500">${g}</svg></div><div class="legend"><span><i style="background:#2F6BFF"></i>${who ? esc(who) : 'Your portfolio'}</span><span><i style="background:#94A3B8"></i>S&amp;P 500 (SPY), same start date</span></div>`;
}

/* ---------- shared: seeded random, illustrated avatars, demo portfolio builder (used by Paper, Social and the home page) ---------- */
const hsh = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => { let a = hsh(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
/* look = [skin 0-5, hair colour 0-5, hair style 0-6, shirt colour, extras: 'g' glasses, 'b' beard] */
const SKIN = ['#F6D5BC', '#EDBB97', '#D9A074', '#BC7F57', '#8E5B3C', '#5F3C27'], HAIR = ['#1F1A17', '#3B2A20', '#6B4423', '#A0522D', '#D8B06B', '#A8AFB8'], BGS = [['#DBEAFE', '#BFDBFE'], ['#DCFCE7', '#BBF7D0'], ['#FEF3C7', '#FDE68A'], ['#EDE9FE', '#DDD6FE'], ['#FCE7F3', '#FBCFE8'], ['#E0F2FE', '#BAE6FD'], ['#FFEDD5', '#FED7AA']];
function avatar(id, look, size) {
  const r = rng(id), L = look || [Math.floor(r() * 6), Math.floor(r() * 6), Math.floor(r() * 7), ['#2F6BFF', '#0B1B3F', '#00B86B', '#7C3AED', '#E04B4B', '#F28C28', '#0EA5E9'][Math.floor(r() * 7)], ''];
  const sk = SKIN[L[0]], hc = HAIR[L[1]], hs = L[2], sh = L[3], ex = L[4] || '', bg = BGS[hsh(id) % BGS.length], u = 'a' + hsh(id).toString(36);
  const back = hs === 2 || hs === 6 ? `<path d="M18.5 30 C18 14 46 14 45.5 30 L47 50 C40 53 24 53 17 50Z" fill="${hc}"/>` : '';
  const top = [`<path d="M20.3 28 C19.6 14.5 44.4 14.5 43.7 28 C41.5 21.5 36 19.6 32 19.6 C27.5 19.6 22.6 21.5 20.3 28Z" fill="${hc}"/>`,
    `<path d="M20.3 29 C18.6 13.5 45.8 12.8 43.7 29 C42.6 22.8 39.2 20.6 36.4 20.3 C30.6 22.6 25.2 21.9 20.3 29Z" fill="${hc}"/>`,
    `<path d="M19.8 31 C18.6 14.5 45.4 14.5 44.2 31 C42.2 22.5 36.4 19.2 30.2 21.2 C25.8 22.4 22 25.6 19.8 31Z" fill="${hc}"/>`,
    `<circle cx="32" cy="13.6" r="5.2" fill="${hc}"/><path d="M20.3 28 C19.6 15 44.4 15 43.7 28 C41.5 21.5 36 19.8 32 19.8 C27.5 19.8 22.6 21.5 20.3 28Z" fill="${hc}"/>`,
    `<path d="M21 25.5 C22 16.5 42 16.5 43 25.5 C38.5 20.6 25.5 20.6 21 25.5Z" fill="${hc}" opacity=".9"/>`,
    [22, 26.5, 31.5, 36.5, 41.5].map((x, i) => `<circle cx="${x}" cy="${19.5 - (i % 2) * 1.8}" r="5.1" fill="${hc}"/>`).join('') + `<path d="M20.5 26 C21 20 43 20 43.5 26 C39 22.5 25 22.5 20.5 26Z" fill="${hc}"/>`,
    `<path d="M19.8 31 C18.6 14.5 45.4 14.5 44.2 31 C43 24 40 21 32 21 C24 21 21 24 19.8 31Z" fill="${hc}"/>`][hs];
  const beard = ex.includes('b') ? `<path d="M20.8 31 C21 41.5 26 44.6 32 44.6 C38 44.6 43 41.5 43.2 31 C41.2 37.4 37 38.8 32 38.8 C27 38.8 22.8 37.4 20.8 31Z" fill="${hc}"/>` : '';
  const gl = ex.includes('g') ? `<g fill="none" stroke="#1F2937" stroke-width="1.3"><circle cx="27.4" cy="29.3" r="3.6"/><circle cx="36.6" cy="29.3" r="3.6"/><path d="M31 29.3h2"/></g>` : '';
  return `<svg class="tw-av" viewBox="0 0 64 64" width="${size || 48}" height="${size || 48}" aria-hidden="true"><defs><linearGradient id="${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient><clipPath id="${u}c"><circle cx="32" cy="32" r="32"/></clipPath></defs>
    <circle cx="32" cy="32" r="32" fill="url(#${u})"/><g clip-path="url(#${u}c)">${back}<path d="M9 66 C11 51 21 46.5 32 46.5 C43 46.5 53 51 55 66Z" fill="${sh}"/><path d="M27 46.8 L32 53 L37 46.8Z" fill="#fff" opacity=".85"/><rect x="28" y="37.5" width="8" height="10" rx="3.5" fill="${sk}"/>
    <circle cx="20.4" cy="30.5" r="2.4" fill="${sk}"/><circle cx="43.6" cy="30.5" r="2.4" fill="${sk}"/><ellipse cx="32" cy="29.5" rx="11.6" ry="13" fill="${sk}"/>${top}${beard}
    <circle cx="27.4" cy="29.3" r="1.35" fill="#1F2937"/><circle cx="36.6" cy="29.3" r="1.35" fill="#1F2937"/><path d="M25.4 25.6h3.6M35 25.6h3.6" stroke="${hc}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M28.3 35.2 Q32 38.4 35.7 35.2" stroke="${ex.includes('b') ? '#F8FAFC' : '#9A3412'}" stroke-width="1.4" fill="none" stroke-linecap="round"/>${gl}</g></svg>`;
}
/* Builds a realistic demo portfolio from real daily closes: buys at the real close on each buy date, optional add-ons and sales.
   spec = {seed, start, from:'YYYY-MM-DD', to:'YYYY-MM-DD', pool:[tickers], n, sell:0-1, add:0-1, cashMin:0-1} */
function build(spec) {
  const r = rng(spec.seed), f = dnum(spec.from), t = dnum(spec.to), last = lastDay(), lots = [];
  const pool = [...new Set(spec.pool)].filter(x => BY[x] && ser(x).length > 30 && firstDay(x) <= f);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const picks = pool.slice(0, spec.n), budget = spec.start * (1 - (spec.cashMin == null ? 0.06 : spec.cashMin)), w = picks.map(() => 0.6 + r());
  const ws = w.reduce((a, b) => a + b, 0), mk = (tk, day, amt) => { const c = closeOn(tk, Math.min(day, last)); if (!c) return null; const q = Math.max(1, Math.floor(amt / c.c * (0.97 + r() * 0.05))); return { id: tk + '-' + c.d + '-' + lots.length, t: tk, q, bd: iso(c.d), bp: +c.c.toFixed(2) }; };
  picks.forEach((tk, i) => { const amt = budget * w[i] / ws, split = r() < (spec.add || 0) ? 0.55 + r() * 0.2 : 1, d1 = f + Math.floor(r() * Math.max(1, (t - f) * 0.7));
    const a = mk(tk, d1, amt * split); if (!a) return; lots.push(a);
    if (split < 1) { const d2 = dnum(a.bd) + 12 + Math.floor(r() * Math.max(1, t - dnum(a.bd) - 12)); const b = mk(tk, Math.min(d2, t), amt * (1 - split)); if (b && b.bd > a.bd) lots.push(b); else a.q = Math.floor(a.q / split); }
    if (r() < (spec.sell || 0)) { const sd = dnum(a.bd) + 20 + Math.floor(r() * Math.max(1, last - dnum(a.bd) - 25)); const c = closeOn(tk, Math.min(sd, last - 2)); if (c && iso(c.d) > a.bd) { a.sd = iso(c.d); a.sp = +c.c.toFixed(2); } } });
  lots.sort((a, b) => a.bd < b.bd ? -1 : 1); while (lots.length && !cashOK(lots, spec.start)) lots.forEach(l => { l.q = Math.max(1, Math.floor(l.q * 0.93)); });
  return { id: spec.seed, name: spec.name || spec.seed, created: spec.from, start: spec.start, lots, mode: 'game', pub: true };
}
/* demo paper-trading players for the leaderboard preview (game rules: buys only from the start date, at real closes) */
const DEMO_PP = [['NorthStarTrades', 'Chicago, IL', 'Tech Rebound', '2026-05-11', [1, 0, 0, '#2F6BFF', '']], ['TLV_Bull', 'Tel Aviv, Israel', 'Chips & Defense', '2026-06-02', [2, 1, 4, '#0B1B3F', 'b']], ['OakLeafValue', 'Portland, OR', 'Boring Compounders', '2026-04-20', [0, 3, 1, '#00B86B', 'g']],
  ['ChipChaser', 'San Jose, CA', 'Semis Only', '2026-07-06', [3, 0, 5, '#7C3AED', '']], ['DividendDana', 'Charlotte, NC', 'Income First', '2026-05-26', [1, 4, 2, '#E04B4B', '']], ['Rocket_Rob', 'Huntsville, AL', 'To The Moon', '2026-06-23', [0, 2, 0, '#F28C28', 'b']],
  ['QuietCompounder', 'London, UK', 'Slow And Steady', '2026-03-30', [4, 0, 6, '#0EA5E9', 'g']], ['MidwestMomentum', 'Columbus, OH', 'Trend Rider', '2026-08-04', [2, 2, 3, '#2F6BFF', '']], ['SatoshiSam', 'Austin, TX', 'Crypto Adjacent', '2026-07-20', [5, 0, 4, '#0B1B3F', '']], ['GreenCandleGal', 'Toronto, Canada', 'AI Picks', '2026-05-04', [0, 1, 2, '#00B86B', '']]];
const THM = th => S.filter(s => th.some(x => s.th === x) && s.sec !== 'ETF').map(s => s.t);
const PP_POOL = [['Big Tech & Internet', 'Software & Cyber', 'AI Infrastructure'], ['Semiconductors & Memory', 'Drones & Defense', 'Aerospace & Defense'], ['Consumer', 'Healthcare', 'Banks & Financials', 'Industrials & Construction'], ['Semiconductors & Memory', 'Semiconductors - Photonics'],
  ['Banks & Financials', 'Oil, Gas & Utilities', 'Consumer', 'Healthcare'], ['Space', 'eVTOL & Air Mobility', 'Quantum'], ['Big Tech & Internet', 'Healthcare', 'Consumer', 'Index, Dividend & Value ETFs'], ['AI Infrastructure', 'Power, Nuclear & Storage', 'Robotics'], ['Fintech & Crypto', 'Software & Cyber'], ['AI Infrastructure', 'Big Tech & Internet', 'Semiconductors & Memory']];
let DPP = null;
function demoPlayers() { if (DPP) return DPP; try { DPP = DEMO_PP.map((d, i) => { const P = build({ seed: 'pp-' + d[0], name: d[2], start: START, from: d[3], to: '2026-11-13', pool: THM(PP_POOL[i]).concat(i === 6 ? ['SPY', 'QQQ'] : []), n: 4 + (hsh(d[0]) % 5), sell: 0.25, add: 0.2, cashMin: 0.03 + (hsh(d[0]) % 7) / 100 });
  P.id = 'demo-' + d[0].toLowerCase(); P.created = d[3]; return { d: { username: d[0], place: d[1], pname: d[2], look: d[4] }, P, c: calc(P), demo: true }; }).filter(x => x.P.lots.length); } catch (e) { DPP = []; } return DPP; }
const demoTag = '<span class="pp-tag" style="background:#F1F5F9;color:#64748B">Demo</span>';

/* ---------- public leaderboard store (Wix Data via visitor token) ---------- */
let TOK = null;
async function token() {
  if (TOK && TOK.exp > Date.now()) return TOK.a; let rt = null; try { rt = localStorage.getItem('tw_pp_rt'); } catch (e) {}
  let r = rt ? await fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: CLIENT, grantType: 'refresh_token', refreshToken: rt }) }).then(x => x.ok ? x.json() : null).catch(() => null) : null;
  if (!r || !r.access_token) r = await fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: CLIENT, grantType: 'anonymous' }) }).then(x => x.json());
  try { localStorage.setItem('tw_pp_rt', r.refresh_token); } catch (e) {} TOK = { a: r.access_token, exp: Date.now() + (r.expires_in || 3600) * 900 }; return TOK.a;
}
const H = async () => ({ 'Content-Type': 'application/json', Authorization: await token() });
async function queryAll(filter) { const out = []; let cursor = null;
  for (let i = 0; i < 10; i++) { const body = { dataCollectionId: COLL, query: cursor ? { cursorPaging: { limit: 1000, cursor } } : { filter: filter || {}, sort: [{ fieldName: '_createdDate', order: 'DESC' }], cursorPaging: { limit: 1000 } } };
    const r = await fetch(API + '/wix-data/v2/items/query', { method: 'POST', headers: await H(), body: JSON.stringify(body) }).then(x => x.json()); (r.dataItems || []).forEach(it => out.push(it.data));
    cursor = r.pagingMetadata && r.pagingMetadata.hasNext && r.pagingMetadata.cursors && r.pagingMetadata.cursors.next; if (!cursor) break; }
  return out; }
async function publish(P, on) { const o = rd(); if (!o.prof) return false;
  const body = { dataCollectionId: COLL, dataItem: { data: { username: o.prof.u, place: o.prof.p, pname: P.name, ownerKey: await sha(o.prof.k), pid: P.id, public: !!on, data: { name: P.name, created: P.created, lots: (P.lots || []).map(l => ({ t: l.t, q: l.q, bd: l.bd, bp: l.bp, sd: l.sd || null, sp: l.sp || null })) } } } };
  const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: await H(), body: JSON.stringify(body) }); return r.ok; }
let LB = null, LBt = 0;
async function board(force) {
  if (LB && !force && Date.now() - LBt < 60000) return LB; let items = []; try { items = await queryAll(); } catch (e) {}
  const owner = {}; items.slice().reverse().forEach(d => { const u = (d.username || '').toLowerCase(); if (u && !owner[u]) owner[u] = d.ownerKey; });
  const latest = {}; items.forEach(d => { if (!d.pid || latest[d.pid]) return; latest[d.pid] = d; });
  LB = Object.values(latest).filter(d => d.public && d.data && owner[(d.username || '').toLowerCase()] === d.ownerKey && (d.data.lots || []).length).map(d => { const P = { id: d.pid, name: d.pname, created: d.data.created, lots: d.data.lots }; return { d, P, c: calc(P) }; });
  LB = LB.concat(demoPlayers()); LBt = Date.now(); return LB; }
async function nameTaken(u, key) { const items = await queryAll({ username: { $eq: u } }); const lower = items.filter(d => (d.username || '').toLowerCase() === u.toLowerCase()); if (!lower.length) return false; const first = lower[lower.length - 1]; return first.ownerKey !== await sha(key); }

/* ---------- pages ---------- */
const head = (t, sub, on) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p><nav class="pp-sub">${[['', 'My Portfolios'], ['leaderboard', '🏆 Leaderboard'], ['how', 'How It Works']].map(x => `<a href="#/paper${x[0] ? '/' + x[0] : ''}" class="${on === x[0] ? 'on' : ''}">${x[1]}</a>`).join('')}</nav></div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const preview = '<p class="pp-note" style="margin:0">Paper Trading is free. Portfolios are saved in this browser; public portfolios also go to the leaderboard. Players marked Demo are sample portfolios built on real closing prices, to show how the leaderboard works. Not investment advice.</p>';

const pAv = (x, s) => avatar('pp:' + (x.d.username || '').toLowerCase(), x.d.look, s || 40);
const mkHero = o => `<div class="mk-hero"><div><span class="mk-eb">${o.eb}</span><h2>${o.h}</h2><p>${o.p}</p><div class="mk-cta">${o.cta.map((c, i) => `<a class="${i ? 'g' : 'p'}" href="${c[1]}">${c[0]}</a>`).join('')}</div>${o.st ? `<div class="mk-st">${o.st.map(x => `<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('')}</div>` : ''}</div><div>${o.art}</div></div>`;
function list() {
  const o = rd(), cards = o.list.map(P => { const c = calc(P); return `<a class="pp-c" href="#/paper/p/${P.id}"><h4>${esc(P.name)}<span class="pp-tag ${P.mode === 'game' ? 'g' : 'p'}">${P.mode === 'game' ? 'Leaderboard game' : 'Practice'}</span>${P.pub ? '<span class="pp-tag">Public</span>' : ''}</h4>
      <div class="muted" style="font-size:12.5px">${(P.lots || []).length} trade${(P.lots || []).length === 1 ? '' : 's'} · started ${dfmt(P.created)}</div><div class="pp-v">${money(c.total)}</div><b class="${cls(c.ret)}">${sg(c.ret, 2)}</b> <span class="muted" style="font-size:13px">vs S&amp;P ${sg(c.spx, 1)}</span></a>`; }).join('');
  const D = demoPlayers().slice().sort((a, b) => b.c.ret - a.c.ret), top = D.slice(0, 4);
  app.innerHTML = head('Paper Trading', 'Practice investing with $100,000 of virtual money, keep score against the S&amp;P 500, and compete on the public leaderboard. Free.', '') + wrap(`
    ${mkHero({ eb: 'Paper Trading · Free', h: 'Practice with <em>$100,000</em>. Compete with everyone.', p: 'Build portfolios with virtual money at real closing prices. See exactly how you would have done against the S&amp;P 500, then put your best portfolio on the public leaderboard.', cta: [['＋ Start a Portfolio', '#/paper#pp-start'], ['🏆 See the Leaderboard', '#/paper/leaderboard']],
      st: [['$100K', 'virtual cash per portfolio'], [S.length, 'stocks and funds to trade'], [top[0] ? sg(top[0].c.ret, 1) : '—', 'top return on the board']],
      art: `<div class="mk-art"><h5 style="display:flex;justify-content:space-between"><span>🏆 Leaderboard race · top players</span><span class="mo-live">REAL PRICES</span></h5><div data-race="pp" data-n="5"></div></div>` })}
    <div class="mk-steps"><div><i>💵</i><b>Start with $100,000</b><p>Create as many portfolios as you like, each with $100,000 of virtual cash.</p></div><div><i>📈</i><b>Trade at real prices</b><p>Buy and sell any of the ${S.length} stocks and funds we cover at each day's real closing price.</p></div><div><i>🎯</i><b>Beat the market</b><p>Every portfolio is scored against the S&amp;P 500 over the same days, with your best and worst picks.</p></div><div><i>🏆</i><b>Climb the leaderboard</b><p>Make a game portfolio public and see how you rank against players everywhere.</p></div></div>
    <div id="pp-start">${profileCard(o)}</div>
    ${card('My Portfolios', o.list.length + ' portfolio' + (o.list.length === 1 ? '' : 's'), `<div class="pp-g">${cards}<div class="pp-new" id="pp-new">＋ New Portfolio<small class="muted" style="font-weight:500">Start with $100,000</small></div></div>`)}
    <div id="pp-form"></div>${preview}`);
  $('#pp-new').onclick = () => { $('#pp-form').innerHTML = card('New Portfolio', '', `<div class="pp-f"><label>Name<input id="pn" maxlength="40" placeholder="My Growth Picks"></label>
      <label>Type<select id="pm"><option value="game">Leaderboard game: trades from today forward, at real closing prices</option><option value="practice">Practice: any past date, any price (not ranked)</option></select></label><button class="btn primary" id="pc">Create Portfolio</button></div>`);
    $('#pc').onclick = () => { const n = ($('#pn').value || '').trim() || 'My Portfolio', o2 = rd(), P = { id: uid(), name: n.slice(0, 40), mode: $('#pm').value, created: iso(lastDay() || Math.floor(Date.now() / 864e5)), lots: [], pub: false }; o2.list.push(P); wr(o2); location.hash = '#/paper/p/' + P.id; }; $('#pn').focus(); };
  wireProfile(); if (/#pp-start$/.test(location.hash)) setTimeout(() => { const e = $('#pp-start'); if (e) e.scrollIntoView({ behavior: 'smooth' }); }, 50);
}
function profileCard(o) { const p = o.prof;
  return card('Your Player Profile', 'needed only for the leaderboard', p ? `<p style="margin:0;font-size:15px">Playing as <b>${esc(p.u)}</b> from <b>${esc(p.p)}</b>. <button class="pp-x" id="pp-edit" style="color:#2F6BFF">Change</button></p><div id="pp-pf"></div>`
    : `<div id="pp-pf">${profForm()}</div>`); }
const profForm = (p) => `<div class="pp-f"><label>Username<input id="pu" maxlength="20" placeholder="e.g. BullRunner" value="${esc(p ? p.u : '')}"></label><label>Where you're from<input id="pl" maxlength="40" placeholder="e.g. Tel Aviv, Israel" value="${esc(p ? p.p : '')}"></label><button class="btn primary" id="ps">Save Profile</button></div><p class="pp-msg" id="pmsg"></p>`;
function wireProfile() { const e = $('#pp-edit'); if (e) e.onclick = () => { $('#pp-pf').innerHTML = profForm(rd().prof); wireProfile(); };
  const s = $('#ps'); if (!s) return; s.onclick = async () => { const u = ($('#pu').value || '').trim(), p = ($('#pl').value || '').trim(), m = $('#pmsg');
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(u)) { m.className = 'pp-msg err'; m.textContent = 'Username: 3 to 20 letters, numbers, dots, dashes or underscores.'; return; }
    if (!p) { m.className = 'pp-msg err'; m.textContent = 'Tell other players where you are from.'; return; }
    const o = rd(), k = (o.prof && o.prof.k) || uid() + uid() + uid(); m.className = 'pp-msg'; m.textContent = 'Checking the username…';
    try { if (await nameTaken(u, k)) { m.className = 'pp-msg err'; m.textContent = 'That username is taken. Try another.'; return; } } catch (err) {}
    o.prof = { u, p: p.slice(0, 40), k }; wr(o); for (const P of o.list.filter(x => x.pub)) { try { await publish(P, true); } catch (err) {} } route(); }; }

function view(id) {
  const o = rd(), P = o.list.find(x => x.id === id); if (!P) { location.hash = '#/paper'; return; }
  const c = calc(P), today = lastDay(), game = P.mode === 'game', opts = S.slice().sort((a, b) => a.t.localeCompare(b.t)).map(s => `<option value="${esc(s.t)}">${esc(s.n)}</option>`).join('');
  const open = c.open.map(r => `<tr><td><a href="#/stock/${esc(r.t)}"><b>${esc(r.t)}</b></a></td><td class="num">${r.q.toLocaleString()}</td><td>${dfmt(r.bd)}</td><td class="num">${money2(r.bp)}</td><td class="num">${money2(r.px)}</td><td class="num"><b>${money(r.v)}</b></td><td class="num"><b class="${cls(r.g)}">${money(r.g)}</b></td><td class="num"><b class="${cls(r.r)}">${sg(r.r, 1)}</b></td><td><button class="pp-sell" data-sell="${r.id}">Sell</button> <button class="pp-x" data-del="${r.id}" title="Delete this trade">✕</button></td></tr>`).join('');
  const closed = c.closed.map(r => `<tr><td><b>${esc(r.t)}</b></td><td class="num">${r.q.toLocaleString()}</td><td>${dfmt(r.bd)}</td><td class="num">${money2(r.bp)}</td><td>${dfmt(r.sd)}</td><td class="num">${money2(r.sp)}</td><td class="num"><b class="${cls(r.g)}">${money(r.g)}</b></td><td class="num"><b class="${cls(r.r)}">${sg(r.r, 1)}</b></td><td><button class="pp-x" data-del="${r.id}" title="Delete this trade">✕</button></td></tr>`).join('');
  app.innerHTML = head(esc(P.name), (game ? 'Leaderboard game' : 'Practice portfolio') + ' · started ' + dfmt(P.created) + ' · prices as of the ' + dfmt(iso(today)) + ' close', '') + wrap(`
    ${game ? `<div class="pp-pub"><label style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" id="pp-on" ${P.pub ? 'checked' : ''}><b>Show this portfolio on the public leaderboard</b></label><span class="muted" style="font-size:13px">${o.prof ? 'as ' + esc(o.prof.u) + ' from ' + esc(o.prof.p) : 'Set up your player profile first (My Portfolios page).'}</span><span id="pp-pm" class="pp-msg" style="margin:0"></span></div>` : ''}
    ${card('Scorecard', 'started with $100,000', `<div class="pp-k"><div><span>Portfolio value</span><b>${money(c.total)}</b></div><div><span>Total return</span><b class="${cls(c.ret)}">${sg(c.ret, 2)}</b><small>${money(c.total - START)}</small></div><div><span>S&amp;P 500, same period</span><b class="${cls(c.spx)}">${sg(c.spx, 2)}</b><small>${nz(c.spx) ? (c.ret >= c.spx ? 'You are beating the market' : 'The market is ahead') : ''}</small></div><div><span>Cash left</span><b>${money(c.cash)}</b></div><div><span>Best single stock</span><b class="${cls(c.best && c.best.r)}">${c.best ? esc(c.best.t) + ' ' + sg(c.best.r, 0) : '—'}</b></div></div>${chart(P)}`)}
    ${card('Add A Trade', game ? 'game rules: buy dates from ' + dfmt(P.created) + ' on, at that day\'s closing price' : 'practice: any date in the last two years; price fills from the close, change it if you like', `<div class="pp-f">
      <label>Stock<input id="tt" list="pp-list" placeholder="Ticker, e.g. NVDA" autocomplete="off"><datalist id="pp-list">${opts}</datalist></label>
      <label>Shares<input id="tq" type="number" min="0" step="any" placeholder="10"></label>
      <label>Buy date<input id="tb" type="date" value="${iso(today)}" ${game ? `min="${P.created}"` : ''} max="${iso(today)}"></label>
      <label>Buy price<input id="tp" type="number" min="0" step="any" ${game ? 'readonly' : ''}></label>
      <label>Sell date (optional)<input id="ts" type="date" max="${iso(today)}"></label>
      <label>Sell price<input id="tsp" type="number" min="0" step="any" ${game ? 'readonly' : ''} placeholder="if sold"></label>
      <button class="btn primary" id="tadd">＋ Add Trade</button></div><p class="pp-msg" id="tmsg"></p>
      <p class="pp-note">Stocks available: the ${S.length} stocks and funds Tickerwise covers. Prices are daily closes. Cash can't go below zero: you start with $100,000, and selling puts the money back.</p>`)}
    ${card('Open Positions', c.open.length + ' holding' + (c.open.length === 1 ? '' : 's'), c.open.length ? `<div class="tbl-wrap" style="max-height:none"><table class="tw pp-t"><thead><tr><th>Stock</th><th class="num">Shares</th><th>Bought</th><th class="num">Buy price</th><th class="num">Last price</th><th class="num">Value</th><th class="num">Gain</th><th class="num">Return</th><th></th></tr></thead><tbody>${open}</tbody></table></div>` : '<p class="muted" style="margin:0">No open positions yet.</p>')}
    ${c.closed.length ? card('Closed Trades', c.closed.length + ' sold', `<div class="tbl-wrap" style="max-height:none"><table class="tw pp-t"><thead><tr><th>Stock</th><th class="num">Shares</th><th>Bought</th><th class="num">Buy price</th><th>Sold</th><th class="num">Sell price</th><th class="num">Gain</th><th class="num">Return</th><th></th></tr></thead><tbody>${closed}</tbody></table></div>`) : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn ghost" href="#/paper">← All portfolios</a><button class="btn ghost" id="pdel" style="color:#D72B45">Delete portfolio</button></div>${preview}`);
  const fill = (dEl, pEl) => { const t = ($('#tt').value || '').trim().toUpperCase(), d = $(dEl).value; if (!BY[t] || !d) return; const c2 = closeOn(t, dnum(d)); if (c2) $(pEl).value = c2.c.toFixed(2); };
  ['#tt', '#tb'].forEach(s => $(s).addEventListener('change', () => fill('#tb', '#tp'))); ['#tt', '#ts'].forEach(s => $(s).addEventListener('change', () => { if ($('#ts').value) fill('#ts', '#tsp'); }));
  const save = async (P2) => { const o2 = rd(), i = o2.list.findIndex(x => x.id === P2.id); o2.list[i] = P2; wr(o2); if (P2.pub) { try { await publish(P2, true); LB = null; } catch (e) {} } view(P2.id); };
  $('#tadd').onclick = () => { const m = $('#tmsg'), err = s => { m.className = 'pp-msg err'; m.textContent = s; };
    const t = ($('#tt').value || '').trim().toUpperCase(), q = +$('#tq').value, bd = $('#tb').value, sd = $('#ts').value || null;
    if (!BY[t]) return err('Pick a stock from the list (' + S.length + ' covered).'); if (!(q > 0)) return err('Enter how many shares.'); if (!bd) return err('Enter the buy date.');
    const fd = firstDay(t); if (dnum(bd) > today || (fd && dnum(bd) < fd)) return err('Buy date must be between ' + dfmt(iso(fd || today)) + ' and ' + dfmt(iso(today)) + '.');
    if (game && bd < P.created) return err('In the leaderboard game you can only buy from the day the portfolio started (' + dfmt(P.created) + ').');
    let bp = +$('#tp').value; const cb = closeOn(t, dnum(bd)); if (game || !(bp > 0)) bp = cb ? +cb.c.toFixed(4) : null; if (!(bp > 0)) return err('No price for that date.');
    let sp = null; if (sd) { if (sd < bd) return err('The sell date is before the buy date.'); if (dnum(sd) > today) return err('The sell date is in the future.'); sp = +$('#tsp').value; const cs = closeOn(t, dnum(sd)); if (game || !(sp > 0)) sp = cs ? +cs.c.toFixed(4) : null; if (!(sp > 0)) return err('No price for the sell date.'); }
    const lot = { id: uid(), t, q, bd, bp, sd, sp }, lots = (P.lots || []).concat([lot]); if (!cashOK(lots)) return err('Not enough cash on that date for ' + q + ' shares at ' + money2(bp) + '.');
    P.lots = lots; save(P); };
  $$('[data-del]').forEach(b => b.onclick = () => { if (!confirm('Delete this trade?')) return; P.lots = P.lots.filter(l => l.id !== b.dataset.del); save(P); });
  $$('[data-sell]').forEach(b => b.onclick = () => { const l = P.lots.find(x => x.id === b.dataset.sell); const d = prompt('Sell ' + l.q + ' shares of ' + l.t + ' on which date? (YYYY-MM-DD)', iso(today)); if (!d) return; if (!/^\d{4}-\d\d-\d\d$/.test(d) || d < l.bd || dnum(d) > today) { alert('Use a date between ' + l.bd + ' and ' + iso(today) + '.'); return; }
    let sp = closeOn(l.t, dnum(d)); sp = sp ? +sp.c.toFixed(4) : null; if (!game) { const x = prompt('Sell price? (blank = that day\'s close ' + money2(sp) + ')', ''); if (x && +x > 0) sp = +x; } if (!sp) return; l.sd = d; l.sp = sp; save(P); });
  $('#pdel').onclick = async () => { if (!confirm('Delete "' + P.name + '"? This cannot be undone.')) return; if (P.pub) { try { await publish(P, false); } catch (e) {} } const o2 = rd(); o2.list = o2.list.filter(x => x.id !== P.id); wr(o2); location.hash = '#/paper'; };
  const on = $('#pp-on'); if (on) on.onchange = async () => { const m = $('#pp-pm'); if (!rd().prof) { on.checked = false; m.className = 'pp-msg err'; m.textContent = 'Set up your profile on the My Portfolios page first.'; return; }
    m.className = 'pp-msg'; m.textContent = 'Saving…'; P.pub = on.checked; let ok = false; try { ok = await publish(P, P.pub); } catch (e) {} const o2 = rd(); o2.list[o2.list.findIndex(x => x.id === P.id)] = P; wr(o2); LB = null;
    m.className = 'pp-msg ' + (ok ? 'ok' : 'err'); m.textContent = ok ? (P.pub ? 'On the leaderboard.' : 'Removed from the leaderboard.') : 'Could not reach the leaderboard. Try again.'; };
}

let LS = 'ret';
async function leaderboard() {
  app.innerHTML = head('Leaderboard', 'Public paper portfolios ranked by return. Every player starts with $100,000 and trades at real closing prices from the day they join.', 'leaderboard') + wrap(card('Players', '', '<p class="muted" id="lb-load">Loading the leaderboard…</p>', 'lb'));
  let L; try { L = await board(); } catch (e) { $('#lb-load').textContent = 'Could not load the leaderboard right now.'; return; } if (!/^#\/paper\/leaderboard/.test(location.hash)) return;
  const SO = [['ret', 'Total return'], ['vs', 'Beat the S&P by'], ['best', 'Best single stock'], ['val', 'Portfolio value'], ['new', 'Newest']];
  const key = { ret: x => x.c.ret, vs: x => nz(x.c.spx) ? x.c.ret - x.c.spx : -1e9, best: x => x.c.best ? x.c.best.r : -1e9, val: x => x.c.total, new: x => +new Date(x.P.created) }[LS];
  L = L.slice().sort((a, b) => key(b) - key(a)); const me = rd().prof;
  const pod = L.slice(0, 3).map((x, i) => `<a class="lb-pod" href="#/paper/player/${encodeURIComponent(x.P.id)}"><div class="m">${['🥇', '🥈', '🥉'][i]}</div><div style="display:flex;justify-content:center;margin:4px 0">${pAv(x, 56)}</div><b>${esc(x.d.username)}</b><div class="muted" style="font-size:13px">${esc(x.d.place || '')}</div><div style="margin-top:6px;font:800 22px 'Space Grotesk'" class="${cls(x.c.ret)}">${sg(x.c.ret, 1)}</div><div class="muted" style="font-size:12.5px">${esc(x.P.name)}</div></a>`).join('');
  const rows = L.map((x, i) => `<tr class="clk" data-p="${encodeURIComponent(x.P.id)}"><td><span class="lb-r ${i < 3 ? 'g' + (i + 1) : ''}">${i + 1}</span></td><td><div class="pp-who">${pAv(x, 34)}<b>${esc(x.d.username)}</b>${x.demo ? demoTag : ''}</div>${me && me.u.toLowerCase() === (x.d.username || '').toLowerCase() ? ' <span class="pp-tag g">You</span>' : ''}</td><td class="muted">${esc(x.d.place || '')}</td><td>${esc(x.P.name)}</td>
    <td class="num"><b class="${cls(x.c.ret)}">${sg(x.c.ret, 2)}</b></td><td class="num"><b class="${cls(nz(x.c.spx) ? x.c.ret - x.c.spx : null)}">${nz(x.c.spx) ? sg(x.c.ret - x.c.spx, 1) : '—'}</b></td><td class="num">${x.c.best ? '<b>' + esc(x.c.best.t) + '</b> <span class="' + cls(x.c.best.r) + '">' + sg(x.c.best.r, 0) + '</span>' : '—'}</td><td class="num">${money(x.c.total)}</td><td class="num">${x.c.open.length}</td><td>${dfmt(x.P.created)}</td></tr>`).join('');
  $('#lb').outerHTML = `${L.length >= 3 ? `<div class="lb-top">${pod}</div>` : ''}${card('Players', L.length + ' public portfolio' + (L.length === 1 ? '' : 's') + ' · prices as of the ' + dfmt(iso(lastDay())) + ' close', `<div class="lb-sort">${SO.map(s => `<button type="button" class="btn ${s[0] === LS ? 'primary' : 'ghost'}" data-s="${s[0]}" style="padding:6px 12px;font-size:13px">${s[1]}</button>`).join('')}</div>
    ${L.length ? `<div class="tbl-wrap" style="max-height:none"><table class="tw lb-t"><thead><tr><th>Rank</th><th>Player</th><th>From</th><th>Portfolio</th><th class="num">Return</th><th class="num">Vs S&amp;P</th><th class="num">Best stock</th><th class="num">Value</th><th class="num">Holdings</th><th>Started</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="muted" style="margin:0">No public portfolios yet. Be the first: create a Leaderboard game portfolio and switch on "Show on the public leaderboard".</p>'}
    <p class="pp-note">Click a player to see the whole portfolio. Returns update with every nightly price refresh. Only Leaderboard game portfolios (bought at real closes, from the day they joined) can be public.</p>`, 'lb')}${preview}`;
  $$('[data-s]').forEach(b => b.onclick = () => { LS = b.dataset.s; leaderboard(); });
  $$('tr[data-p]').forEach(tr => tr.onclick = () => { location.hash = '#/paper/player/' + tr.dataset.p; });
}
async function player(pid) {
  app.innerHTML = head('Player Portfolio', 'Loading…', 'leaderboard') + wrap('<div class="card"><p class="muted">Loading…</p></div>');
  let L; try { L = await board(); } catch (e) { return; } const x = L.find(z => z.P.id === pid); const ph = $('.page-h p');
  if (!x) { ph.textContent = 'This portfolio is not public.'; return; } const c = x.c, rank = L.slice().sort((a, b) => b.c.ret - a.c.ret).indexOf(x) + 1;
  $('.page-h h1').innerHTML = `<span style="display:inline-flex;align-items:center;gap:14px">${pAv(x, 64)}<span>${esc(x.d.username)}${x.demo ? ' ' + demoTag : ''}<span style="display:block;font:600 16px Inter,sans-serif;color:var(--mut)">${esc(x.P.name)}</span></span></span>`;
  ph.textContent = 'From ' + (x.d.place || '—') + ' · started ' + dfmt(x.P.created) + ' with $100,000 · rank #' + rank + ' of ' + L.length + ' by return';
  const open = c.open.map(r => `<tr><td><a href="#/stock/${esc(r.t)}"><b>${esc(r.t)}</b></a> <span class="muted">${esc(((BY[r.t] || {}).n || '').slice(0, 22))}</span></td><td class="num">${r.q.toLocaleString()}</td><td>${dfmt(r.bd)}</td><td class="num">${money2(r.bp)}</td><td class="num">${money2(r.px)}</td><td class="num"><b class="${cls(r.px - r.bp)}">${(r.px - r.bp < 0 ? '−$' : '+$') + Math.abs(r.px - r.bp).toFixed(2)}</b></td><td class="num"><b>${money(r.v)}</b></td><td class="num"><b class="${cls(r.g)}">${money(r.g)}</b></td><td class="num"><b class="${cls(r.r)}">${sg(r.r, 1)}</b></td><td class="num">${(r.v / c.total * 100).toFixed(1)}%</td></tr>`).join('');
  const closed = c.closed.map(r => `<tr><td><b>${esc(r.t)}</b></td><td class="num">${r.q.toLocaleString()}</td><td>${dfmt(r.bd)}</td><td class="num">${money2(r.bp)}</td><td>${dfmt(r.sd)}</td><td class="num">${money2(r.sp)}</td><td class="num"><b class="${cls(r.sp - r.bp)}">${(r.sp - r.bp < 0 ? '−$' : '+$') + Math.abs(r.sp - r.bp).toFixed(2)}</b></td><td class="num"><b class="${cls(r.g)}">${money(r.g)}</b></td><td class="num"><b class="${cls(r.r)}">${sg(r.r, 1)}</b></td></tr>`).join('');
  $('#app > section.sec .wrap').innerHTML = `${x.demo ? '<div class="mk-demo">Demo player: a sample portfolio built on real closing prices to show how player pages work.</div>' : ''}${card('Scorecard', 'started with $100,000', `<div class="pp-k"><div><span>Rank</span><b>#${rank}</b><small>of ${L.length}</small></div><div><span>Portfolio value</span><b>${money(c.total)}</b></div><div><span>Total return</span><b class="${cls(c.ret)}">${sg(c.ret, 2)}</b><small>${money(c.total - 100000)}</small></div><div><span>S&amp;P 500, same period</span><b class="${cls(c.spx)}">${sg(c.spx, 2)}</b></div><div><span>Best single stock</span><b class="${cls(c.best && c.best.r)}">${c.best ? esc(c.best.t) + ' ' + sg(c.best.r, 0) : '—'}</b></div><div><span>Cash</span><b>${money(c.cash)}</b></div></div>${chart(x.P, x.d.username)}`)}
    ${card('Holdings', c.open.length + ' open · prices as of the ' + dfmt(iso(lastDay())) + ' close', c.open.length ? `<div class="tbl-wrap" style="max-height:none"><table class="tw pp-t"><thead><tr><th>Stock</th><th class="num">Shares</th><th>Bought</th><th class="num">Cost/share</th><th class="num">Last price</th><th class="num">Gain/share</th><th class="num">Value</th><th class="num">Total gain</th><th class="num">Return</th><th class="num">Weight</th></tr></thead><tbody>${open}</tbody></table></div>` : '<p class="muted" style="margin:0">All cash.</p>')}
    ${c.closed.length ? card('Closed Trades', c.closed.length + ' sold', `<div class="tbl-wrap" style="max-height:none"><table class="tw pp-t"><thead><tr><th>Stock</th><th class="num">Shares</th><th>Bought</th><th class="num">Buy price</th><th>Sold</th><th class="num">Sell price</th><th class="num">Gain/share</th><th class="num">Total gain</th><th class="num">Return</th></tr></thead><tbody>${closed}</tbody></table></div>`) : ''}
    <a class="btn ghost" href="#/paper/leaderboard" style="align-self:flex-start">← Back to the leaderboard</a>`;
}
function how() {
  app.innerHTML = head('How Paper Trading Works', 'Practice with play money until you are ready to invest for real.', 'how') + wrap(card('The Rules', '', `<ol class="pp-how">
    <li><b>Everyone starts with $100,000</b> of virtual money in each portfolio. Make as many portfolios as you like.</li>
    <li><b>Two kinds of portfolio.</b> A <b>Leaderboard game</b> portfolio trades only from the day you create it, at each day's real closing price, so nobody can win with hindsight. A <b>Practice</b> portfolio lets you enter any past date in the last two years and any price, to test ideas or copy trades you made for real. Practice portfolios are never ranked.</li>
    <li><b>Buying and selling.</b> Pick a stock, enter the shares and the date. The price fills in from that day's close. Sell any time; the cash goes back into the portfolio. You can't spend more cash than you have.</li>
    <li><b>Keep score.</b> Every portfolio shows its value, total return, best single stock, and how it compares with the S&amp;P 500 over the same period.</li>
    <li><b>Go public.</b> Set a username and where you're from, then switch a Leaderboard game portfolio to public. It joins the leaderboard, where anyone can sort players by return, by how far they beat the S&amp;P, or by best single stock, and open any player's full portfolio.</li>
    <li><b>Prices</b> are daily closes for the ${S.length} stocks and funds Tickerwise covers, updated every night.</li></ol>`) + preview);
}

/* ---------- router ---------- */
function navLink() { const n = $('#navlinks'); if (n && !$('a[data-r="paper"]', n)) { const pl = $('a[data-r="plans"]', n); const a = '<a href="#/paper" data-r="paper">Paper Trading</a>'; if (pl) pl.insertAdjacentHTML('beforebegin', a); else n.insertAdjacentHTML('beforeend', a); } }
function route() {
  const h = location.hash.replace(/^#\/?/, '').split('#')[0], p = h.split('/'); navLink(); $$('#navlinks a').forEach(a => { if (a.dataset.r === 'paper') a.classList.toggle('on', p[0] === 'paper'); });
  if (p[0] !== 'paper') return; $$('#navlinks a').forEach(a => { if (a.dataset.r !== 'paper') a.classList.remove('on'); });
  try { if (p[1] === 'p' && p[2]) view(p[2]); else if (p[1] === 'leaderboard') leaderboard(); else if (p[1] === 'player' && p[2]) player(decodeURIComponent(p[2])); else if (p[1] === 'how') how(); else list(); }
  catch (e) { if (window.console) console.error(e); }
  document.title = 'Paper Trading — Tickerwise'; window.scrollTo(0, 0);
}
window.TWPP = { mkHero, pAv, demoTag, board, calc, chart, token, curve, build, avatar, rng, hsh, closeOn, lastDay, iso, dnum, ser, money, money2, demoPlayers, THM };
window.addEventListener('hashchange', route); route();
})();
