/* Tickerwise app13: everyday tools.
   Tools hub, Daily Briefing, Signals (table + chart grid), Portfolio X-Ray, Alerts (this browser), Learn & Glossary,
   stock Report Card (sector-relative letter grades + shape), shareable result cards, visit streaks, legend -> watchlist. */
(function () {
if (window.TWT) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, sg, cls, dfmt, pxSeries } = X, PP = window.TWPP || {}, app = $('#app'); if (!app || !S) return;
const FI = () => window.TWFI || null, SO = window.TWSO || {};
const jget = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }, jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const pct = (v, d) => nz(v) ? (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d == null ? 1 : d) + '%' : '—';
const money = v => !nz(v) ? '—' : (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
const bn = v => v >= 1e9 ? '$' + (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : money(v);
const PX = {}; const ser = t => PX[t] || (PX[t] = (pxSeries(t) || []).filter(p => nz(p.c)));
const last = t => { const s = ser(t); return s[s.length - 1]; }, chg = (t, n) => { const s = ser(t); n = n || 1; return s.length > n ? (s[s.length - 1].c / s[s.length - 1 - n].c - 1) * 100 : null; };
const asOf = () => { const l = last('SPY'); return l ? dfmt(PP.iso(l.d)) : ''; };
const PIL = [['m', 'Momentum'], ['e', 'Earnings'], ['g', 'Growth'], ['p', 'Profitability'], ['b', 'Financial Health']];
const daysTo = s => { if (!s) return null; const d = new Date(String(s).length <= 12 && !/\d{4}/.test(s) ? s + ', ' + new Date().getFullYear() : s); return isNaN(d) ? null : Math.round((d - new Date(new Date().toDateString())) / 864e5); };
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const head = (t, sub, extra) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p>${extra || ''}</div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const tlink = t => BY[t] ? `<a href="#/stock/${esc(t)}"><b>${esc(t)}</b></a>` : `<b>${esc(t)}</b>`;
const subnav = on => `<nav class="pp-sub" style="margin-top:12px">${[['tools', '🧰 All Tools'], ['briefing', '☀️ Daily Briefing'], ['signals', '📡 Signals'], ['xray', '🩻 Portfolio X-Ray'], ['alerts', '🔔 Alerts'], ['learn', '📘 Learn']].map(x => `<a href="#/${x[0]}" class="${on === x[0] ? 'on' : ''}">${x[1]}</a>`).join('')}</nav>`;

const css = document.createElement('style'); css.id = 'tt-css'; css.textContent = `
.tt-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.tt-tool{display:flex;flex-direction:column;gap:8px;border:1.5px solid var(--line);border-radius:18px;padding:18px;background:#fff;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s,border-color .2s;position:relative;overflow:hidden;min-width:0}
.tt-tool:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(11,27,63,.12);border-color:#2F6BFF}.tt-tool i{font-style:normal;font-size:26px;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#EEF4FF,#E7F8EF)}
.tt-tool b{font:800 18px 'Space Grotesk',sans-serif}.tt-tool span{font-size:13.5px;color:var(--mut);line-height:1.5}.tt-tool em{position:absolute;right:14px;top:14px;font-style:normal;font:700 11px Inter,sans-serif;padding:3px 8px;border-radius:999px;background:#E7F8EF;color:#00794A}
.tt-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.tt-k>div{background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;min-width:0}.tt-k span{display:block;font-size:12px;color:var(--mut);font-weight:600}.tt-k b{display:block;font:800 22px 'Space Grotesk',sans-serif}.tt-k small{font-size:11.5px;color:var(--mut)}
.tt-2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}@media (max-width:900px){.tt-2{grid-template-columns:minmax(0,1fr)}}
.tt-l{list-style:none;margin:0;padding:0}.tt-l li{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #EEF2F8;font-size:14px}.tt-l li:last-child{border-bottom:0}.tt-l small{color:var(--mut)}
.tt-seg{display:flex;gap:6px;flex-wrap:wrap}.tt-seg button{cursor:pointer;padding:7px 12px;border-radius:999px;border:1.5px solid var(--line);background:#fff;font:600 13px Inter,sans-serif;color:#334155}.tt-seg button.on{background:#0B1B3F;color:#fff;border-color:#0B1B3F}.tt-seg button b{font-weight:800;margin-left:4px}
.tt-tb{width:100%;border-collapse:collapse;font-size:13.5px}.tt-tb th{font:700 11.5px Inter,sans-serif;text-transform:uppercase;letter-spacing:.05em;color:var(--mut);text-align:left;padding:8px;border-bottom:1.5px solid var(--line);white-space:nowrap}.tt-tb td{padding:8px;border-bottom:1px solid #EEF2F8;white-space:nowrap}.tt-tb .num{text-align:right;font-variant-numeric:tabular-nums}
.tt-cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}.tt-cg a{border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;background:#fff;text-decoration:none;color:inherit;min-width:0}.tt-cg a:hover{border-color:#2F6BFF}.tt-cg .h{display:flex;justify-content:space-between;font-size:13px}
.tt-rc{display:grid;grid-template-columns:220px minmax(0,1fr);gap:22px;align-items:center}@media (max-width:700px){.tt-rc{grid-template-columns:minmax(0,1fr)}}
.tt-gr{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}@media (max-width:700px){.tt-gr{grid-template-columns:repeat(2,minmax(0,1fr))}}.tt-gr>div{border-radius:14px;padding:10px;background:#F7F9FC;text-align:center;min-width:0}.tt-gr b{display:block;font:800 30px 'Space Grotesk',sans-serif;line-height:1.1}.tt-gr span{display:block;font-size:12px;color:var(--mut);font-weight:600}.tt-gr small{font-size:11px;color:var(--mut)}
.g-A{color:#00794A}.g-B{color:#1E4FD8}.g-C{color:#9A5B00}.g-D,.g-F{color:#B4233A}
.tt-al{display:flex;gap:8px;flex-wrap:wrap;align-items:end}.tt-al label{display:flex;flex-direction:column;gap:4px;font-size:12px;font-weight:600;color:var(--mut)}.tt-al input,.tt-al select,.tt-ta{padding:9px 10px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;background:#fff;min-width:0}
.tt-btn{cursor:pointer;border:0;border-radius:11px;padding:10px 14px;font:700 14px Inter,sans-serif;background:linear-gradient(90deg,#00C176,#0EA5E9);color:#fff}.tt-btn.g{background:#fff;border:1.5px solid var(--line);color:var(--ink)}
.tt-toast{position:fixed;right:16px;bottom:16px;z-index:999;max-width:min(360px,calc(100vw - 32px));background:#0B1B3F;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 20px 40px rgba(0,0,0,.3);font-size:14px;animation:ttin .35s both}.tt-toast a{color:#7FE3FF;font-weight:700}@keyframes ttin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.tt-badge{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#E04B4B;color:#fff;font:800 11px Inter,sans-serif;margin-left:4px;vertical-align:1px}
.tt-ta{width:100%;box-sizing:border-box;min-height:150px;font-family:ui-monospace,Menlo,monospace;font-size:13px}
.tt-bar{display:grid;grid-template-columns:minmax(0,1fr) 140px 56px;gap:8px;align-items:center;font-size:13px;margin:6px 0}.tt-bar>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tt-bar div{height:8px;background:#EEF2F8;border-radius:4px;overflow:hidden}.tt-bar i{display:block;height:100%;background:linear-gradient(90deg,#2F6BFF,#00B86B)}.tt-bar b{text-align:right}
.tt-flag{display:flex;gap:10px;padding:8px 0;border-bottom:1px dashed #EEF2F8;font-size:14px}.tt-flag:last-child{border-bottom:0}
.tt-gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.tt-gl div{border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;background:#fff}.tt-gl b{font:700 15px 'Space Grotesk',sans-serif}.tt-gl p{margin:4px 0 0;font-size:13.5px;color:#334155;line-height:1.55}.tt-gl span{font-size:11px;font-weight:700;color:#2F6BFF;text-transform:uppercase;letter-spacing:.06em}
.tt-streak{display:inline-flex;gap:8px;align-items:center;padding:8px 14px;border-radius:999px;background:linear-gradient(90deg,#FFF1E6,#FFF7E0);color:#9A3412;font:800 14px Inter,sans-serif;border:1.5px solid #FCD9B6}
`;
document.head.appendChild(css);

/* ---------- streak (days in a row this browser opened Tickerwise) ---------- */
(() => { const s = jget('tw_streak', { d: '', n: 0, best: 0 }), today = new Date().toISOString().slice(0, 10), yd = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  if (s.d !== today) { s.n = s.d === yd ? s.n + 1 : 1; s.d = today; s.best = Math.max(s.best || 0, s.n); jset('tw_streak', s); } })();
const streak = () => { const s = jget('tw_streak', { n: 1, best: 1 }); return `<span class="tt-streak" title="Days in a row you've opened Tickerwise · best ${s.best}">🔥 ${s.n}-day streak</span>`; };

/* ---------- grades: each pillar ranked within its sector ---------- */
const GRD = [[95, 'A+'], [85, 'A'], [75, 'A−'], [65, 'B+'], [55, 'B'], [45, 'B−'], [35, 'C+'], [25, 'C'], [15, 'C−'], [5, 'D'], [-1, 'F']];
function grades(s) {
  const peers = S.filter(x => x.sec === s.sec && x.P), out = {};
  PIL.forEach(([k]) => { const v = (s.P || {})[k]; if (!nz(v)) return; const L = peers.map(x => x.P[k]).filter(nz).sort((a, b) => b - a), rank = L.indexOf(v) + 1, below = L.filter(x => x < v).length, pc = L.length > 1 ? below / (L.length - 1) * 100 : 50;
    out[k] = { v, rank, n: L.length, pc, g: (GRD.find(g => pc >= g[0]) || GRD[GRD.length - 1])[1] }; });
  return out;
}
function shape(s, size) {
  const P = s.P || {}, R = size / 2 - 30, c = size / 2, SL = ['Momentum', 'Earnings', 'Growth', 'Profit', 'Health'], pts = PIL.map(([k], i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5, r = R * (nz(P[k]) ? P[k] / 100 : 0); return [c + Math.cos(a) * r, c + Math.sin(a) * r, c + Math.cos(a) * (R + 16), c + Math.sin(a) * (R + 14)]; });
  const ring = f => PIL.map((_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return (c + Math.cos(a) * R * f).toFixed(1) + ',' + (c + Math.sin(a) * R * f).toFixed(1); }).join(' ');
  const col = s.ws >= 8 ? '#00B86B' : s.ws >= 6 ? '#2F6BFF' : s.ws >= 4 ? '#F28C28' : '#E04B4B';
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Pillar shape for ${esc(s.t)}">${[1, .75, .5, .25].map(f => `<polygon points="${ring(f)}" fill="none" stroke="#E2E8F0"/>`).join('')}
    <polygon points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="${col}" fill-opacity=".22" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"><animate attributeName="fill-opacity" from="0" to=".22" dur=".8s"/></polygon>
    ${pts.map((p, i) => `<text x="${p[2].toFixed(1)}" y="${(p[3] + 4).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#64748B" font-family="Inter">${SL[i]}</text>`).join('')}</svg>`;
}
const gcls = g => 'g-' + g[0];

/* ---------- alerts (saved in this browser; email/push when accounts launch) ---------- */
const AK = 'tw_alerts', rdA = () => jget(AK, []), wrA = a => jset(AK, a);
function evalAlerts() {
  const A = rdA(); let fired = [];
  A.forEach(a => { if (a.fired) return; const s = BY[a.t], l = last(a.t); if (!s) return; let hit = null;
    if (a.type === 'above' && l && l.c >= a.v) hit = `${a.t} closed at $${l.c.toFixed(2)}, above your $${a.v} alert`;
    if (a.type === 'below' && l && l.c <= a.v) hit = `${a.t} closed at $${l.c.toFixed(2)}, below your $${a.v} alert`;
    if (a.type === 'score' && nz(s.ws) && s.ws !== a.v) hit = `${a.t}'s Tickerwise Score changed from ${a.v} to ${s.ws}`;
    if (a.type === 'earn') { const d = daysTo((s.earn || {}).next); if (d != null && d >= 0 && d <= a.v) hit = `${a.t} reports earnings ${d === 0 ? 'today' : 'in ' + d + ' day' + (d === 1 ? '' : 's')}`; }
    if (hit) { a.fired = new Date().toISOString().slice(0, 10); a.msg = hit; a.unread = 1; fired.push(a); } });
  if (fired.length) wrA(A); return A;
}
const unread = () => rdA().filter(a => a.unread).length;
function toast(h) { const t = document.createElement('div'); t.className = 'tt-toast'; t.innerHTML = h; document.body.appendChild(t); setTimeout(() => t.remove(), 7000); t.onclick = () => t.remove(); }
function addAlert(a) { const A = rdA(); A.push(Object.assign({ id: Math.random().toString(36).slice(2, 9), created: new Date().toISOString().slice(0, 10) }, a)); wrA(A); evalAlerts(); navBadge(); }

/* ---------- stock page: Report Card + alert setter (overview tab) ---------- */
function reportCard(t) {
  const s = BY[t], m = $('.main'); if (!s || !m || $('#tt-rc', m)) return; const G = grades(s), peers = S.filter(x => x.sec === s.sec), rk = peers.slice().sort((a, b) => (b.ws || 0) - (a.ws || 0)).indexOf(s) + 1, l = last(t);
  const el = document.createElement('div'); el.className = 'card'; el.id = 'tt-rc';
  el.innerHTML = `<div class="card-h"><h3>Report Card</h3><span>each pillar graded against the ${peers.length} ${esc(s.sec)} stocks we cover</span></div>
    <div class="tt-rc"><div style="display:flex;justify-content:center">${shape(s, 210)}</div><div><div class="tt-gr">${PIL.map(([k, n]) => { const g = G[k]; return g ? `<div><span>${n}</span><b class="${gcls(g.g)}">${g.g}</b><small>#${g.rank} of ${g.n} in sector</small></div>` : ''; }).join('')}</div>
    <p style="margin:12px 0 0;font-size:14px">Overall: <b>${s.ws}/10</b>, ranked <b>#${rk} of ${peers.length}</b> in ${esc(s.sec)}.</p></div></div>
    <div style="border-top:1px solid var(--line);margin-top:14px;padding-top:12px"><div class="tt-al"><b style="font-size:14px;align-self:center">🔔 Alert me when</b>
      <label>Type<select id="tt-at"><option value="above">Price rises above</option><option value="below">Price falls below</option><option value="score">Tickerwise Score changes</option><option value="earn">Earnings are coming up</option></select></label>
      <label id="tt-avl">Price ($)<input id="tt-av" type="number" step="0.01" value="${l ? (l.c * 1.05).toFixed(2) : ''}" style="width:120px"></label><button type="button" class="tt-btn" id="tt-ago">Set alert</button><a href="#/alerts" style="font-size:13px;align-self:center">My alerts →</a></div>
      <p class="muted" style="font-size:12px;margin:6px 0 0">Checked every time you open Tickerwise, against the latest close. Email and phone alerts switch on when accounts launch.</p></div>`;
  m.prepend(el);
  $('#tt-at').onchange = e => { const v = e.target.value, lab = $('#tt-avl'); lab.style.display = v === 'score' ? 'none' : ''; lab.firstChild.textContent = v === 'earn' ? 'Days before' : 'Price ($)'; $('#tt-av').value = v === 'earn' ? 7 : v === 'below' ? (l.c * 0.95).toFixed(2) : (l.c * 1.05).toFixed(2); };
  $('#tt-ago').onclick = () => { const type = $('#tt-at').value, v = type === 'score' ? s.ws : +$('#tt-av').value; if (type !== 'score' && !(v > 0)) return; addAlert({ t, type, v }); toast(`🔔 Alert set for <b>${esc(t)}</b>. <a href="#/alerts">See all alerts</a>`); };
}

/* ---------- tools hub ---------- */
function tools() {
  const n = rdA().length, u = unread();
  app.innerHTML = head('Tools', 'Everyday tools for serious investors: a morning briefing, live signals, a portfolio check-up, alerts and a learning hub.', `<div style="margin-top:12px">${streak()}</div>`) + wrap(`
    ${window.TWQ ? window.TWQ.banner('radar', 'Tickerwise tools', 'Everything you need <em>in one toolbox</em>.', 'Scan the market for signals, X-ray your portfolio, replay real sessions and set alerts, all built on the same scores and real prices as the rest of the site.', [[S.length, 'stocks scanned'], [sigAll().reduce((a, x) => a + x.L.length, 0), 'signals today'], [n, 'alerts you set']]) : ''}
    <div class="tt-g">${[['☀️', 'Daily Briefing', 'Market moves, your watchlist, earnings this week, signals and what the legends bought, in two minutes.', '#/briefing', 'New'], ['📡', 'Signals', 'New highs, oversold and overbought stocks, golden crosses, volume spikes and big movers, as a table or chart grid.', '#/signals', 'New'], ['🩻', 'Portfolio X-Ray', 'Paste your holdings: score, sector exposure, risk flags and which famous investor you invest most like.', '#/xray', 'New'], ['🔔', 'Alerts', `Price, score and earnings alerts on any stock. ${u ? u + ' new' : n ? n + ' set' : 'Set your first one on any stock page.'}`, '#/alerts', u ? u + ' new' : ''], ['⏪', 'Market Replay', 'Trade real past sessions bar by bar with the future hidden.', '#/paper/replay', ''], ['🏛️', 'Famous Investors', 'What Buffett, Ackman and 28 more legends own and changed last quarter.', '#/investors', ''], ['📘', 'Learn & Glossary', 'Plain-English explanations of every term on Tickerwise, plus five short lessons to get started.', '#/learn', 'New'], ['🏆', 'Paper Trading Challenges', 'Monthly, weekly and quarterly contests with badges and levels.', '#/paper', '']].map(t => `<a class="tt-tool" href="${t[3]}">${t[4] ? `<em>${t[4]}</em>` : ''}<i>${t[0]}</i><b>${t[1]}</b><span>${t[2]}</span></a>`).join('')}</div>`);
  if (window.TWQ) window.TWQ.wake(app); document.title = 'Tools — Tickerwise';
}

/* ---------- signals ---------- */
let SIGK = 'high', SIGV = 'table';
function sigAll() {
  const rows = S.map(s => { const z = ser(s.t), l = z[z.length - 1]; if (!l || z.length < 60) return null; const prev = z.slice(-51, -1), av = prev.reduce((a, p) => a + (p.v || 0), 0) / (prev.length || 1);
    let cross = null; for (let i = z.length - 10; i < z.length; i++) { const a = z[i - 1], b = z[i]; if (a && b && nz(a.m50) && nz(a.m200) && nz(b.m50) && nz(b.m200)) { if (a.m50 <= a.m200 && b.m50 > b.m200) cross = 'golden'; if (a.m50 >= a.m200 && b.m50 < b.m200) cross = 'death'; } }
    return { s, t: s.t, c: l.c, d1: chg(s.t), rsi: (s.tech || {}).rsi, off: (s.tech || {}).off, up: (s.tech || {}).up, vr: av ? (l.v || 0) / av : null, cross, v200: (s.tech || {}).v200 }; }).filter(Boolean);
  const F = FI(), nb = F ? Object.values(F.ACT).filter(o => BY[o.t] && o.buy.some(x => /^Buy/.test(x[1][1]))).map(o => o.t) : [];
  return [['high', '🚀 New 52-week highs', r => nz(r.off) && r.off >= -1.5, (a, b) => b.d1 - a.d1], ['low', '🧊 Near 52-week lows', r => nz(r.up) && r.up <= 5, (a, b) => a.up - b.up],
    ['oversold', '🟢 Oversold (RSI under 30)', r => nz(r.rsi) && r.rsi < 30, (a, b) => a.rsi - b.rsi], ['overbought', '🔥 Overbought (RSI over 70)', r => nz(r.rsi) && r.rsi > 70, (a, b) => b.rsi - a.rsi],
    ['golden', '✨ Golden cross (last 10 days)', r => r.cross === 'golden', (a, b) => b.d1 - a.d1], ['death', '☠️ Death cross (last 10 days)', r => r.cross === 'death', (a, b) => a.d1 - b.d1],
    ['volume', '📊 Unusual volume (2× normal)', r => r.vr >= 2, (a, b) => b.vr - a.vr], ['movers', '⚡ Big movers (±5% in a day)', r => nz(r.d1) && Math.abs(r.d1) >= 5, (a, b) => Math.abs(b.d1) - Math.abs(a.d1)],
    ['quality', '⭐ Top scores in an uptrend', r => r.s.ws >= 8 && nz(r.v200) && r.v200 > 0, (a, b) => b.s.ws - a.s.ws], ['legends', '🏛️ New buys by famous investors', r => nb.includes(r.t), (a, b) => b.s.ws - a.s.ws]]
    .map(([k, n, f, so]) => ({ k, n, L: rows.filter(f).sort(so) }));
}
function spark(t) { const z = ser(t).slice(-60); if (z.length < 2) return ''; const mx = Math.max(...z.map(p => p.c)), mn = Math.min(...z.map(p => p.c)), W = 200, H = 54, X = i => i / (z.length - 1) * W, Y = v => H - 3 - (v - mn) / ((mx - mn) || 1) * (H - 6), up = z[z.length - 1].c >= z[0].c;
  const ma = z.map((p, i) => nz(p.m50) ? [X(i), Y(Math.max(mn, Math.min(mx, p.m50)))] : null).filter(Boolean);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none"><path d="${z.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.c).toFixed(1)).join('')}L${W} ${H}L0 ${H}Z" fill="${up ? 'rgba(0,184,107,.10)' : 'rgba(215,43,69,.10)'}"/><path d="${z.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.c).toFixed(1)).join('')}" fill="none" stroke="${up ? '#00B86B' : '#D72B45'}" stroke-width="1.8"/>${ma.length > 1 ? `<path d="${ma.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')}" fill="none" stroke="#2F6BFF" stroke-width="1" stroke-dasharray="3 3"/>` : ''}</svg>`; }
function signals() {
  const A = sigAll(); if (!(A.find(x => x.k === SIGK) || {}).L || !A.find(x => x.k === SIGK).L.length) SIGK = (A.find(x => x.L.length) || A[0]).k; const cur = A.find(x => x.k === SIGK) || A[0];
  app.innerHTML = head('Signals', 'Stocks setting up right now, from real prices and Tickerwise Scores. Updated with every data refresh · as of the ' + asOf() + ' close.', subnav('signals')) + wrap(`
    <div class="tt-seg">${A.map(x => `<button type="button" data-sk="${x.k}" class="${x.k === cur.k ? 'on' : ''}">${x.n}<b>${x.L.length}</b></button>`).join('')}</div>
    <div class="tt-seg"><button type="button" data-sv="table" class="${SIGV === 'table' ? 'on' : ''}">☰ Table</button><button type="button" data-sv="grid" class="${SIGV === 'grid' ? 'on' : ''}">▦ Chart grid</button></div>
    ${card(cur.n, cur.L.length + ' stock' + (cur.L.length === 1 ? '' : 's'), !cur.L.length ? '<p class="muted" style="margin:0">No stocks match this signal today.</p>' : SIGV === 'grid' ? `<div class="tt-cg">${cur.L.slice(0, 60).map(r => `<a href="#/stock/${esc(r.t)}"><div class="h"><b>${esc(r.t)}</b><span class="${cls(r.d1)}">${pct(r.d1)}</span></div><div class="muted" style="font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.s.n)}</div>${spark(r.t)}<div class="h"><span class="muted">$${r.c.toFixed(2)}</span><span>Score <b>${r.s.ws}</b></span></div></a>`).join('')}</div><p class="muted" style="font-size:12px;margin:8px 0 0">Last 60 sessions · dashed line = 50-day average.</p>`
      : `<div class="tbl-wrap" style="max-height:none"><table class="tt-tb"><thead><tr><th>Stock</th><th class="num">Price</th><th class="num">1 day</th><th class="num">1 month</th><th class="num">RSI</th><th class="num">Off high</th><th class="num">Volume vs normal</th><th class="num">Score</th></tr></thead><tbody>${cur.L.map(r => `<tr><td>${tlink(r.t)} <span class="muted">${esc(r.s.n.slice(0, 26))}</span></td><td class="num">$${r.c.toFixed(2)}</td><td class="num"><b class="${cls(r.d1)}">${pct(r.d1)}</b></td><td class="num ${cls((r.s.ret || {}).r1m)}">${pct((r.s.ret || {}).r1m, 0)}</td><td class="num">${nz(r.rsi) ? Math.round(r.rsi) : '—'}</td><td class="num">${nz(r.off) ? r.off.toFixed(0) + '%' : '—'}</td><td class="num">${nz(r.vr) ? r.vr.toFixed(1) + '×' : '—'}</td><td class="num"><b>${r.s.ws}</b>/10</td></tr>`).join('')}</tbody></table></div>`)}
    <p class="muted" style="font-size:12.5px;margin:0">Signals describe what prices are doing, not what they will do next. Education only, not investment advice.</p>`);
  $$('[data-sk]').forEach(b => b.onclick = () => { SIGK = b.dataset.sk; signals(); }); $$('[data-sv]').forEach(b => b.onclick = () => { SIGV = b.dataset.sv; signals(); });
  document.title = 'Signals — Tickerwise';
}

/* ---------- daily briefing ---------- */
function briefing() {
  const idx = [['SPY', 'S&P 500'], ['QQQ', 'Nasdaq 100'], ['DIA', 'Dow'], ['IWM', 'Russell 2000']].filter(x => ser(x[0]).length > 5);
  const mv = S.map(s => ({ s, d: chg(s.t) })).filter(x => nz(x.d)).sort((a, b) => b.d - a.d), up = mv.filter(x => x.d > 0).length, a200 = S.filter(s => (s.tech || {}).v200 > 0).length;
  const er = S.map(s => ({ s, d: daysTo((s.earn || {}).next) })).filter(x => x.d != null && x.d >= 0 && x.d <= 7).sort((a, b) => a.d - b.d);
  const WL = jget('tw-watchlist', []).filter(t => BY[t]), wl = WL.map(t => ({ t, d: chg(t), w: chg(t, 5) })).sort((a, b) => Math.abs(b.d || 0) - Math.abs(a.d || 0));
  const SG = sigAll(), F = FI(), nb = F ? Object.values(F.ACT).filter(o => o.net > 0).sort((a, b) => b.net - a.net).slice(0, 5) : [], tr = SO.trades && SO.leads ? SO.trades(SO.leads()).slice(0, 5) : [];
  const A = rdA().filter(a => a.unread), date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const row = (t, sub, right) => `<li><span>${t} <small>${sub || ''}</small></span><span>${right}</span></li>`;
  app.innerHTML = head('Daily Briefing', date + ' · everything that matters in two minutes · prices as of the ' + asOf() + ' close', subnav('briefing') + `<div style="margin-top:10px">${streak()}</div>`) + wrap(`
    <div class="tt-k">${idx.map(([t, n]) => { const d = chg(t), w = chg(t, 5); return `<div><span>${n}</span><b class="${cls(d)}">${pct(d, 2)}</b><small>5 days ${pct(w)}</small></div>`; }).join('')}<div><span>Breadth</span><b>${up}/${mv.length}</b><small>stocks up · ${Math.round(a200 / S.length * 100)}% above 200-day</small></div></div>
    ${A.length ? card('🔔 Your Alerts', A.length + ' new', `<ul class="tt-l">${A.map(a => row(tlink(a.t), '', `<span>${esc(a.msg)}</span>`)).join('')}</ul><p style="margin:8px 0 0"><a href="#/alerts">Manage alerts →</a></p>`) : ''}
    <div class="tt-2">${card('Your Watchlist', WL.length ? WL.length + ' stocks' : '', WL.length ? `<ul class="tt-l">${wl.slice(0, 10).map(x => row(tlink(x.t), '5d ' + pct(x.w), `<b class="${cls(x.d)}">${pct(x.d)}</b>`)).join('')}</ul>` : '<p class="muted" style="margin:0">Add stocks to your watchlist (☆ on any stock page) and they show up here every morning.</p>')}
      ${card('Earnings This Week', er.length + ' reporting', er.length ? `<ul class="tt-l">${er.slice(0, 10).map(x => row(tlink(x.s.t), esc(x.s.n.slice(0, 24)), `<span class="muted">${x.d === 0 ? 'Today' : x.d === 1 ? 'Tomorrow' : 'In ' + x.d + ' days'}</span>`)).join('')}</ul>` : '<p class="muted" style="margin:0">No stocks we cover report in the next 7 days.</p>')}</div>
    <div class="tt-2">${card('Biggest Gainers', 'last session', `<ul class="tt-l">${mv.slice(0, 6).map(x => row(tlink(x.s.t), esc(x.s.n.slice(0, 22)), `<b class="up">${pct(x.d)}</b>`)).join('')}</ul>`)}${card('Biggest Losers', 'last session', `<ul class="tt-l">${mv.slice(-6).reverse().map(x => row(tlink(x.s.t), esc(x.s.n.slice(0, 22)), `<b class="dn">${pct(x.d)}</b>`)).join('')}</ul>`)}</div>
    ${card('Signals Today', '<a href="#/signals">open Signals →</a>', `<div class="tt-seg">${SG.filter(x => x.L.length).map(x => `<button type="button" onclick="location.hash='#/signals'">${x.n}<b>${x.L.length}</b></button>`).join('')}</div>`)}
    <div class="tt-2">${card('What The Legends Bought', 'net buys last quarter · <a href="#/investors#fi-con">more</a>', nb.length ? `<ul class="tt-l">${nb.map(o => row(tlink(o.t), o.buy.length + ' buying', `<b class="up">+${bn(o.net)}</b>`)).join('')}</ul>` : '<p class="muted">Loading…</p>')}
      ${card('Latest Lead Trader Trades', '<a href="#/social">Social Trading →</a>', `<ul class="tt-l">${tr.map(e => row(`<b>${esc(e.m.name)}</b>`, dfmt(e.d), `<span><b class="${e.side === 'B' ? 'up' : 'dn'}">${e.side === 'B' ? 'Bought' : 'Sold'}</b> ${tlink(e.t)}</span>`)).join('')}</ul><p class="muted" style="font-size:12px;margin:6px 0 0">Demo Lead Traders, real closing prices.</p>`)}</div>
    <p class="muted" style="font-size:12.5px;margin:0">A daily email version comes with member accounts. Education only, not investment advice.</p>`);
  document.title = 'Daily Briefing — Tickerwise';
}

/* ---------- Portfolio X-Ray ---------- */
const XK = 'tw_xray';
function parseH(txt) { const out = [], bad = []; String(txt || '').split(/\n|;/).map(l => l.trim()).filter(Boolean).forEach(l => { const m = l.match(/^\$?([A-Za-z.\-]{1,8})[\s,:\t]+\$?([\d,]*\.?\d+)\s*(\$|usd|dollars)?/i); if (!m) { bad.push(l); return; } const t = m[1].toUpperCase(), n = +m[2].replace(/,/g, ''), isD = /\$/.test(l.split(m[1])[1] || '') || !!m[3]; out.push({ t, n, isD }); }); return { out, bad }; }
function xray() {
  const saved = jget(XK, ''), P = jget('tw_paper', { list: [] }).list || [], WL = jget('tw-watchlist', []).filter(t => BY[t]);
  app.innerHTML = head('Portfolio X-Ray', 'Paste your holdings and get a full check-up: Tickerwise Score, pillars, sector exposure, risk flags, upcoming earnings and which famous investor you invest most like. Nothing leaves your browser.', subnav('xray')) + wrap(`
    ${card('Your Holdings', 'one per line: ticker and shares, or ticker and a $ amount', `<textarea class="tt-ta" id="xr-in" placeholder="MSFT 20\nNVDA $15000\nAMZN, 30">${esc(saved)}</textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button type="button" class="tt-btn" id="xr-go">🩻 Run X-Ray</button><button type="button" class="tt-btn g" id="xr-s">Try a sample</button>${WL.length ? '<button type="button" class="tt-btn g" id="xr-w">Use my watchlist (equal $)</button>' : ''}${P.length ? `<select id="xr-p" class="tt-ta" style="min-height:0;width:auto;font-family:Inter"><option value="">Use a Paper Trading portfolio…</option>${P.map((p, i) => `<option value="${i}">${esc(p.name)}</option>`).join('')}</select>` : ''}</div><p class="muted" style="font-size:12px;margin:8px 0 0">Works with the ${S.length} stocks and funds Tickerwise covers; others are listed but not scored. Linking a brokerage account comes later.</p>`)}
    <div id="xr-out"></div>`);
  const run = () => { const txt = $('#xr-in').value; jset(XK, txt); const { out, bad } = parseH(txt), H = [], miss = [];
    out.forEach(h => { const s = BY[h.t], l = last(h.t); if (!s || !l) { miss.push(h.t); return; } const v = h.isD ? h.n : h.n * l.c; const ex = H.find(x => x.t === h.t); if (ex) ex.v += v; else H.push({ t: h.t, s, v, px: l.c }); });
    const tot = H.reduce((a, h) => a + h.v, 0); if (!tot) { $('#xr-out').innerHTML = card('Nothing To X-Ray', '', `<p style="margin:0">No holdings matched the stocks we cover${miss.length ? ' (' + esc(miss.join(', ')) + ')' : ''}.</p>`); return; }
    H.forEach(h => { h.w = h.v / tot * 100; }); H.sort((a, b) => b.v - a.v);
    const wav = f => { let w = 0, s = 0; H.forEach(h => { const v = f(h.s); if (nz(v)) { w += h.w; s += h.w * v; } }); return w ? s / w : null; };
    const avAll = f => { const L = S.map(f).filter(nz); return L.reduce((a, b) => a + b, 0) / L.length; };
    const score = wav(s => s.ws), r1 = wav(s => (s.ret || {}).r1y), beta = wav(s => s.beta), spx1 = (BY.SPY && (BY.SPY.ret || {}).r1y) != null ? BY.SPY.ret.r1y : chg('SPY', 252);
    const sec = {}; H.forEach(h => { const k = h.s.sec || 'Other'; sec[k] = (sec[k] || 0) + h.w; }); const se = Object.entries(sec).sort((a, b) => b[1] - a[1]);
    const flags = []; H.filter(h => h.w > 20).forEach(h => flags.push(['⚠️', `<b>${esc(h.t)}</b> is ${h.w.toFixed(0)}% of your portfolio. One stock this large can swing your whole result.`]));
    se.filter(x => x[1] > 40).forEach(x => flags.push(['⚠️', `${x[1].toFixed(0)}% of your money is in <b>${esc(x[0])}</b>. A sector slump would hit hard.`]));
    H.filter(h => h.s.ws <= 4).forEach(h => flags.push(['🔻', `<b>${esc(h.t)}</b> scores only ${h.s.ws}/10. <a href="#/stock/${esc(h.t)}">See why</a>.`]));
    H.filter(h => (h.s.tech || {}).v200 < 0).length / H.length > 0.5 && flags.push(['📉', `Most of your holdings trade below their 200-day average: the portfolio is in a downtrend.`]);
    H.filter(h => (h.s.mg || {}).net < 0).forEach(h => flags.push(['💸', `<b>${esc(h.t)}</b> is not profitable yet (net margin ${h.s.mg.net}%).`]));
    if (H.length < 5) flags.push(['🧺', `Only ${H.length} holding${H.length === 1 ? '' : 's'}: consider whether you're diversified enough.`]);
    if (nz(beta) && beta > 1.5) flags.push(['🎢', `Portfolio beta is ${beta.toFixed(2)}: expect bigger swings than the market.`]);
    const er = H.map(h => ({ h, d: daysTo((h.s.earn || {}).next) })).filter(x => x.d != null && x.d >= 0 && x.d <= 30).sort((a, b) => a.d - b.d);
    const F = FI(), sim = F ? F.INV.map(m => { const W = {}; m.H.forEach(x => { W[x[0]] = x[2]; }); return { m, o: H.reduce((a, h) => a + Math.min(h.w, W[h.t] || 0), 0), c: H.filter(h => W[h.t]).map(h => h.t) }; }).filter(x => x.o > 0).sort((a, b) => b.o - a.o).slice(0, 4) : [];
    $('#xr-out').innerHTML = `<div style="display:flex;flex-direction:column;gap:18px">
      <div class="tt-k"><div><span>Portfolio value</span><b>${bn(tot)}</b><small>${H.length} holdings at last close</small></div><div><span>Tickerwise Score</span><b>${score.toFixed(1)}/10</b><small>value-weighted · market avg ${avAll(s => s.ws).toFixed(1)}</small></div><div><span>1-year return</span><b class="${cls(r1)}">${pct(r1)}</b><small>S&amp;P 500 ${pct(spx1)}</small></div><div><span>Beta</span><b>${nz(beta) ? beta.toFixed(2) : '—'}</b><small>1.0 moves with the market</small></div><div><span>Largest position</span><b>${H[0].w.toFixed(0)}%</b><small>${esc(H[0].t)}</small></div></div>
      <div class="tt-2">${card('Pillars vs The Market', 'your value-weighted pillar scores', PIL.map(([k, n]) => { const v = wav(s => (s.P || {})[k]), m = avAll(s => (s.P || {})[k]); return `<div class="tt-bar"><span>${n} <small class="muted">mkt ${m.toFixed(0)}</small></span><div><i style="width:${Math.max(0, Math.min(100, v || 0))}%"></i></div><b class="${(v || 0) >= m ? 'up' : 'dn'}">${nz(v) ? v.toFixed(0) : '—'}</b></div>`; }).join(''))}
        ${card('Sector Exposure', '', se.map(([k, v]) => `<div class="tt-bar"><span>${esc(k)}</span><div><i style="width:${v}%"></i></div><b>${v.toFixed(1)}%</b></div>`).join(''))}</div>
      ${card('Risk Flags', flags.length ? flags.length + ' to review' : 'none', flags.length ? flags.map(f => `<div class="tt-flag"><span>${f[0]}</span><span>${f[1]}</span></div>`).join('') : '<p style="margin:0">✅ No major red flags: diversified, healthy scores and no outsized positions.</p>')}
      <div class="tt-2">${card('Famous Investors You Invest Like', 'portfolio overlap with their 13F holdings', sim.length ? `<ul class="tt-l">${sim.map(x => `<li><a href="#/investors/${x.m.id}"><b>${esc(x.m.name)}</b> <small>${esc(x.m.firm)}</small></a><span><b>${x.o.toFixed(0)}%</b> <small>overlap · ${esc(x.c.slice(0, 4).join(', '))}</small></span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">No overlap with the 30 famous investors we track.</p>')}
        ${card('Earnings In The Next 30 Days', er.length + ' holdings', er.length ? `<ul class="tt-l">${er.map(x => `<li><span>${tlink(x.h.t)} <small>${x.h.w.toFixed(0)}% of portfolio</small></span><span class="muted">${x.d === 0 ? 'Today' : 'In ' + x.d + ' days'}</span></li>`).join('')}</ul>` : '<p class="muted" style="margin:0">None of your holdings report in the next 30 days.</p>')}</div>
      ${card('Holdings', 'sorted by size', `<div class="tbl-wrap" style="max-height:none"><table class="tt-tb"><thead><tr><th>Stock</th><th class="num">Weight</th><th class="num">Value</th><th class="num">Score</th><th class="num">1 year</th><th class="num">vs 200-day</th><th>Sector</th></tr></thead><tbody>${H.map(h => `<tr><td>${tlink(h.t)} <span class="muted">${esc(h.s.n.slice(0, 22))}</span></td><td class="num"><b>${h.w.toFixed(1)}%</b></td><td class="num">${bn(h.v)}</td><td class="num"><b>${h.s.ws}</b>/10</td><td class="num ${cls((h.s.ret || {}).r1y)}">${pct((h.s.ret || {}).r1y, 0)}</td><td class="num ${cls((h.s.tech || {}).v200)}">${pct((h.s.tech || {}).v200, 0)}</td><td>${esc(h.s.sec || '')}</td></tr>`).join('')}</tbody></table></div>${miss.length || bad.length ? `<p class="muted" style="font-size:12.5px;margin:8px 0 0">Not scored: ${esc(miss.concat(bad).join(', '))}</p>` : ''}`)}
      <p class="muted" style="font-size:12.5px;margin:0">Education only, not investment advice. Your holdings are saved only in this browser.</p></div>`;
    $('#xr-out').scrollIntoView({ behavior: 'smooth' }); };
  $('#xr-go').onclick = run; $('#xr-s').onclick = () => { const sh = [25, 80, 40, 50, 20, 15, 30, 100]; $('#xr-in').value = ['MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'LLY', 'JPM', 'KO', 'XOM', 'AVGO', 'V', 'COST'].filter(t => BY[t]).slice(0, 8).map((t, i) => t + ' ' + sh[i]).join('\n'); run(); };
  if ($('#xr-w')) $('#xr-w').onclick = () => { $('#xr-in').value = WL.map(t => t + ' $10000').join('\n'); run(); };
  if ($('#xr-p')) $('#xr-p').onchange = e => { const p = P[+e.target.value]; if (!p) return; const q = {}; (p.lots || []).filter(l => !l.sd).forEach(l => { q[l.t] = (q[l.t] || 0) + l.q; }); $('#xr-in').value = Object.entries(q).map(x => x[0] + ' ' + x[1]).join('\n'); run(); };
  if (saved) run(); document.title = 'Portfolio X-Ray — Tickerwise';
}

/* ---------- alerts page ---------- */
function alertsPage() {
  const A = evalAlerts(); const lbl = a => a.type === 'above' ? 'Price above $' + a.v : a.type === 'below' ? 'Price below $' + a.v : a.type === 'score' ? 'Score changes from ' + a.v : 'Earnings within ' + a.v + ' days';
  app.innerHTML = head('Alerts', 'Price, score and earnings alerts, checked against the latest close every time you open Tickerwise.', subnav('alerts')) + wrap(
    card('Your Alerts', A.length + ' set', A.length ? `<div class="tbl-wrap" style="max-height:none"><table class="tt-tb"><thead><tr><th>Stock</th><th>Alert</th><th class="num">Last close</th><th>Status</th><th></th></tr></thead><tbody>${A.slice().reverse().map(a => { const l = last(a.t); return `<tr><td>${tlink(a.t)}</td><td>${esc(lbl(a))}</td><td class="num">${l ? '$' + l.c.toFixed(2) : '—'}</td><td>${a.fired ? `<b class="up">Triggered ${esc(a.fired)}</b><br><small class="muted">${esc(a.msg || '')}</small>` : '<span class="muted">Watching</span>'}</td><td><button type="button" class="tt-btn g" data-del="${a.id}" style="padding:6px 10px">Delete</button></td></tr>`; }).join('')}</tbody></table></div>` : '<p style="margin:0">No alerts yet. Open any stock and use <b>🔔 Alert me when</b> in its Report Card.</p>')
    + card('Coming With Accounts', '', '<p style="margin:0;line-height:1.6">Email and phone notifications, alerts when a followed Lead Trader trades, and alerts when a famous investor files a new 13F.</p>'));
  A.forEach(a => { a.unread = 0; }); wrA(A); navBadge();
  $$('[data-del]').forEach(b => b.onclick = () => { wrA(rdA().filter(a => a.id !== b.dataset.del)); alertsPage(); }); document.title = 'Alerts — Tickerwise';
}

/* ---------- learn & glossary ---------- */
const GL = [['Basics', 'Stock', 'A small piece of ownership in a company. If the company grows its profits, each piece usually becomes worth more.'], ['Basics', 'ETF', 'A fund that trades like a stock and holds many stocks at once, such as SPY, which holds the 500 companies in the S&P 500.'], ['Basics', 'S&P 500', 'An index of 500 large U.S. companies. Most investors measure their results against it.'], ['Basics', 'Market cap', 'Share price × number of shares: what the whole company is worth on the stock market.'], ['Basics', 'Dividend', 'Cash a company pays its shareholders, usually every quarter.'], ['Basics', 'Diversification', 'Spreading money across many stocks and sectors so one bad pick can\'t sink the whole portfolio.'],
  ['Valuation', 'P/E ratio', 'Price divided by earnings per share. A P/E of 20 means you pay $20 for every $1 of yearly profit.'], ['Valuation', 'Forward P/E', 'P/E using analysts\' estimate of next year\'s earnings instead of last year\'s.'], ['Valuation', 'P/S ratio', 'Market cap divided by yearly revenue. Useful for companies that aren\'t profitable yet.'], ['Valuation', 'PEG ratio', 'P/E divided by expected earnings growth. Under 1 can mean growth is cheap.'], ['Valuation', 'Fair value', 'An estimate of what a stock is worth based on its future cash flows. Different assumptions give different answers.'],
  ['Growth & profits', 'Revenue', 'All the money a company takes in from sales, before costs.'], ['Growth & profits', 'Net margin', 'Profit as a share of revenue. A 20% net margin means $20 of profit per $100 of sales.'], ['Growth & profits', 'Free cash flow', 'Cash left after running the business and investing in it. It pays for dividends, buybacks and growth.'], ['Growth & profits', 'EPS', 'Earnings per share: profit divided by the number of shares.'], ['Growth & profits', 'Earnings beat', 'When a company reports more profit than analysts expected.'], ['Growth & profits', 'Guidance', 'What management says it expects for the next quarter or year.'], ['Growth & profits', 'Dilution', 'When a company issues new shares, so each existing share owns a smaller slice.'],
  ['Technicals', 'Moving average', 'The average closing price over a period, such as 50 or 200 days. It smooths out daily noise to show the trend.'], ['Technicals', '200-day average', 'The long-term trend line. Stocks above it are generally in an uptrend.'], ['Technicals', 'Golden cross', 'When the 50-day average crosses above the 200-day: often read as the start of an uptrend.'], ['Technicals', 'Death cross', 'When the 50-day average crosses below the 200-day: often read as the start of a downtrend.'], ['Technicals', 'RSI', 'Relative Strength Index, 0–100. Over 70 is "overbought" (ran up fast); under 30 is "oversold" (fell fast).'], ['Technicals', '52-week high/low', 'The highest and lowest prices of the past year.'], ['Technicals', 'Volume', 'How many shares traded. A move on heavy volume carries more weight.'], ['Technicals', 'Relative strength', 'How a stock performs compared with the market or its sector.'],
  ['Risk', 'Beta', 'How much a stock moves with the market. Beta 2 means it tends to move twice as much as the S&P 500.'], ['Risk', 'Volatility', 'How much a price swings. Higher volatility means bigger ups and downs.'], ['Risk', 'Drawdown', 'The drop from a peak to a low. A 30% drawdown means the value fell 30% from its high.'], ['Risk', 'Sharpe ratio', 'Return earned per unit of risk taken. Above 1 is generally good.'], ['Risk', 'Sortino ratio', 'Like Sharpe, but only counts downside swings as risk.'], ['Risk', 'Short interest', 'Shares sold short as a share of all shares available: a measure of how many investors bet on a fall.'],
  ['Ownership', '13F filing', 'A quarterly report large investment managers must file with the SEC listing their U.S. stock holdings. It\'s how we know what famous investors own.'], ['Ownership', 'Insider trading (legal)', 'When executives or directors buy or sell their own company\'s stock and report it. Insider buying is often seen as a vote of confidence.'], ['Ownership', 'Institutional ownership', 'The share of a company owned by funds, pensions and other big investors.'], ['Ownership', 'Activist investor', 'An investor who buys a big stake and pushes the company to change, such as Bill Ackman or Nelson Peltz.'],
  ['Tickerwise', 'Tickerwise Score', 'Our 1–10 rating built from five equally weighted pillars: Momentum, Earnings, Growth, Profitability and Financial Health.'], ['Tickerwise', 'Report Card grades', 'Each pillar graded A+ to F against the other stocks in the same sector.'], ['Tickerwise', 'Paper Trading', 'Practice investing with $100,000 of virtual money at real prices, with zero risk.'], ['Tickerwise', 'Lead Trader', 'An investor who shows their full portfolio, cost per share and every trade, so others can follow them.'], ['Tickerwise', 'Market Replay', 'A trainer that replays real past price charts one day at a time, with the future hidden.']];
let GQ = '', GC = 'All';
function learn() {
  const cats = ['All'].concat([...new Set(GL.map(g => g[0]))]);
  app.innerHTML = head('Learn & Glossary', 'Plain-English explanations of every term you\'ll see on Tickerwise, plus five short lessons to get started.', subnav('learn')) + wrap(`
    ${card('Start Here: Five Short Lessons', 'about 10 minutes in total', `<div class="tt-g">${[['1', 'How to read a stock page', 'Start with the Tickerwise Score and its Report Card, then check the What To Watch list.', '#/stock/' + (BY.MSFT ? 'MSFT' : S[0].t)], ['2', 'Find ideas with Signals and the Screener', 'Filter by score, trend and valuation; check signals for timing.', '#/signals'], ['3', 'Practice before you risk money', 'Open a free Paper Trading portfolio and try Market Replay.', '#/paper'], ['4', 'Learn from the best', 'See what famous investors and Lead Traders own and how they trade.', '#/investors'], ['5', 'Check your own portfolio', 'Run a Portfolio X-Ray for score, sector exposure and risk flags.', '#/xray']].map(l => `<a class="tt-tool" href="${l[3]}"><i>${l[0]}</i><b>${l[1]}</b><span>${l[2]}</span></a>`).join('')}</div>`)}
    <div class="tt-al" style="align-items:center"><input id="gl-q" placeholder="Search terms, e.g. RSI, 13F, PEG" value="${esc(GQ)}" style="flex:1 1 240px"><div class="tt-seg">${cats.map(c => `<button type="button" data-gc="${esc(c)}" class="${c === GC ? 'on' : ''}">${esc(c)}</button>`).join('')}</div></div>
    <div class="tt-gl" id="gl-g"></div>`);
  const draw = () => { const q = GQ.toLowerCase(); $('#gl-g').innerHTML = GL.filter(g => (GC === 'All' || g[0] === GC) && (!q || (g[1] + ' ' + g[2]).toLowerCase().includes(q))).map(g => `<div><span>${esc(g[0])}</span><br><b>${esc(g[1])}</b><p>${esc(g[2])}</p></div>`).join('') || '<p class="muted">No terms match.</p>'; };
  draw(); $('#gl-q').oninput = e => { GQ = e.target.value; draw(); }; $$('[data-gc]').forEach(b => b.onclick = () => { GC = b.dataset.gc; $$('[data-gc]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
  document.title = 'Learn & Glossary — Tickerwise';
}

/* ---------- shareable result card (Paper Trading portfolio) ---------- */
function shareCard(P) {
  const c = PP.calc(P), W = 1200, H = 630, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#071334'); g.addColorStop(.5, '#0B1B3F'); g.addColorStop(1, '#1E3A8A'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(127,227,255,.07)'; for (let i = 0; i < W; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let i = 0; i < H; i += 40) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
  const C = PP.curve(P); if (C && C.length > 1) { const v = C.map(p => p[1]), mx = Math.max(...v, 1), mn = Math.min(...v, -1); x.beginPath(); C.forEach((p, i) => { const px = 600 + i / (C.length - 1) * 540, py = 470 - (p[1] - mn) / (mx - mn) * 250; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.strokeStyle = '#00E38C'; x.lineWidth = 5; x.shadowColor = '#00E38C'; x.shadowBlur = 16; x.stroke(); x.shadowBlur = 0; }
  x.fillStyle = '#7FE3FF'; x.font = '700 24px Inter, Arial'; x.fillText('PAPER TRADING · TICKERWISE', 60, 90);
  x.fillStyle = '#fff'; x.font = '800 52px "Space Grotesk", Arial'; x.fillText(P.name.slice(0, 26), 60, 160);
  x.fillStyle = c.ret >= 0 ? '#00E38C' : '#FF7A8A'; x.font = '800 120px "Space Grotesk", Arial'; x.fillText((c.ret >= 0 ? '+' : '−') + Math.abs(c.ret).toFixed(1) + '%', 60, 310);
  x.fillStyle = '#C4D3F5'; x.font = '600 30px Inter, Arial'; x.fillText(nz(c.spx) ? `S&P 500 same period: ${(c.spx >= 0 ? '+' : '−') + Math.abs(c.spx).toFixed(1)}%` : 'Practice portfolio', 60, 370);
  x.fillText('Value: ' + money(c.total) + ' from $100,000', 60, 420); const top = c.open.slice().sort((a, b) => b.v - a.v).slice(0, 4).map(r => r.t).join(' · '); if (top) x.fillText('Top holdings: ' + top, 60, 470);
  x.fillStyle = '#fff'; x.font = '800 34px "Space Grotesk", Arial'; x.fillText('Tickerwise', 60, 570); x.fillStyle = '#9FB3DD'; x.font = '500 24px Inter, Arial'; x.fillText('Practice free with $100,000 at real prices', 260, 570);
  cv.toBlob(b => { const f = new File([b], 'tickerwise-paper-results.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'My Tickerwise Paper Trading results' }).catch(() => {}); else { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = f.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); } }, 'image/png');
}
function paperShare(id) { const P = (jget('tw_paper', { list: [] }).list || []).find(x => x.id === id); if (!P || !(P.lots || []).length || $('#tt-sh', app)) return; const pub = $('.pp-pub', app) || $('.card', app); if (!pub) return;
  const b = document.createElement('button'); b.type = 'button'; b.id = 'tt-sh'; b.className = 'tt-btn'; b.style.alignSelf = 'flex-start'; b.textContent = '📸 Share my results'; b.onclick = () => shareCard(P); pub.before(b); }
function paperStreak() { const h = $('#tq-pp', app) || $('.mk-steps', app); if (!h || $('#tt-stk', app)) return; const d = document.createElement('div'); d.id = 'tt-stk'; d.innerHTML = streak() + ' <span class="muted" style="font-size:13px;margin-left:8px">Come back tomorrow to keep it going.</span>'; h.before(d); }

/* ---------- Famous Investors: add a legend's top 10 to the watchlist ---------- */
function legendWatch(id) { const F = FI(); if (!F || $('#tt-lw', app)) return; const m = F.INV.find(x => x.id === id); const fb = $('[data-fi-f]', app); if (!m || !fb) return;
  const top = m.H.map(h => h[0]).filter(t => BY[t]).slice(0, 10); if (!top.length) return; const b = document.createElement('button'); b.type = 'button'; b.id = 'tt-lw'; b.className = 'fi-fb on'; b.style.marginLeft = '8px'; b.textContent = '☆ Watch their top ' + top.length;
  b.title = 'Adds ' + top.join(', ') + ' to your watchlist'; b.onclick = () => { const W = jget('tw-watchlist', []); top.forEach(t => { if (!W.includes(t)) W.push(t); }); jset('tw-watchlist', W); location.hash = '#/watchlist'; location.reload(); }; fb.after(b); }

/* ---------- nav + router ---------- */
function navBadge() { const a = $('#navlinks a[data-r="tools"]'); if (!a) return; const u = unread(); a.innerHTML = 'Tools' + (u ? `<span class="tt-badge">${u}</span>` : ''); }
function nav() { const n = $('#navlinks'); if (!n) return; if (!$('a[data-r="tools"]', n)) { const a = document.createElement('a'); a.href = '#/tools'; a.dataset.r = 'tools'; a.textContent = 'Tools'; n.appendChild(a); navBadge(); } }
const PAGES = { tools, briefing, signals, xray, alerts: alertsPage, learn };
function route() {
  nav(); const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('/'); $$('#navlinks a').forEach(a => { if (a.dataset.r === 'tools') a.classList.toggle('on', !!PAGES[p[0]]); });
  if (PAGES[p[0]]) { $$('#navlinks a').forEach(a => { if (a.dataset.r !== 'tools') a.classList.remove('on'); }); try { PAGES[p[0]](); } catch (e) { if (window.console) console.error(e); } return; }
  if (p[0] === 'stock' && p[1] && (!p[2] || p[2] === 'overview')) { const t = decodeURIComponent(p[1]).toUpperCase(); let n = 0; const go = () => { if ($('.main') && $('nav.tabs a.x-tab')) reportCard(t); else if (n++ < 40) setTimeout(go, 120); }; setTimeout(go, 350); }
  if (p[0] === 'paper' && p[1] === 'p' && p[2]) setTimeout(() => paperShare(p[2]), 500); if (p[0] === 'paper' && !p[1]) setTimeout(paperStreak, 500);
  if (p[0] === 'investors' && p[1] && p[1] !== 'stock') setTimeout(() => legendWatch(p[1]), 300);
}
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; nav(); const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('/');
  if (p[0] === 'paper' && p[1] === 'p' && p[2]) paperShare(p[2]); if (p[0] === 'paper' && !p[1]) paperStreak(); if (p[0] === 'stock' && p[1] && (!p[2] || p[2] === 'overview') && $('nav.tabs a.x-tab')) reportCard(decodeURIComponent(p[1]).toUpperCase()); }, 150); }).observe(app, { childList: true });
window.addEventListener('hashchange', () => setTimeout(route, 40));
const fired = rdA().filter(a => a.unread).length; evalAlerts(); const nf = rdA().filter(a => a.unread); if (nf.length > fired || nf.length) setTimeout(() => toast(`🔔 ${nf.length} alert${nf.length === 1 ? '' : 's'} triggered: ${esc(nf[0].msg)}${nf.length > 1 ? '…' : ''} <a href="#/alerts">View</a>`), 1500);
route();
window.TWT = { grades, sigAll, evalAlerts };
})();
