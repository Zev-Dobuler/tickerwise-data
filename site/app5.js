/* ---------- Tickerwise new features (Nov 22, 2026): Market Heatmap, Fair Value, Analyst Target History, Revenue by Segment & Geography, Seasonality,
   Superinvestors, Congress Trades, ETFs That Own This, Saved Screens, Pricing Plans and more Pro banners. Same data and layout for every stock. ---------- */
/* RETIRED SECTIONS (Zev, Nov 24, 2026): switched off, code kept. To restore one, remove its key from TW_OFF.
   Log with snapshots: project doc claude/tickerwise-retired-sections.md */
window.TW_OFF = window.TW_OFF || ['tickerdle', 'replay', 'subway', 'bots', 'widgets', 'brokers', 'legendquiz', 'showcase'];
(function () { const R = { tickerdle: { h: ['#/tickerdle'], t: ['Tickerdle'] }, replay: { h: ['#/paper/replay', '#/replay-board'], t: ['Market Replay', 'Replay Leaderboard'] }, subway: { h: [], t: [] }, bots: { h: ['#/bots'], t: ['Strategy Bots', 'strategy bot'] }, widgets: { h: ['#/widgets', '#/embed'], t: ['Score Widgets'] }, brokers: { h: ['#/brokers'], t: ['Broker Comparison'] }, legendquiz: { h: ['#/legend-quiz'], t: ['Legend Quiz', 'Which Legend Are You'] },
    /* hidden, not retired: Motion Gallery still opens at #/showcase for Zev, but no link to it is shown anywhere */
    showcase: { h: [], x: ['#/showcase'], t: ['Motion Gallery'] } };
  const on = () => (window.TW_OFF || []).filter(k => R[k]);
  window.twOff = k => on().includes(k);
  const hm = (h, L) => L.some(x => h === x || h.indexOf(x + '/') === 0 || h.indexOf(x + '?') === 0);
  window.twOffH = h => { h = String(h || ''); return on().some(k => hm(h, R[k].h.concat(R[k].x || []))); };
  const gH = h => { h = String(h || ''); return on().some(k => hm(h, R[k].h)); };
  window.twOffT = t => { t = String(t || ''); return on().some(k => R[k].t.some(x => t.indexOf(x) >= 0)); };
  const guard = () => { if (gH(location.hash)) history.replaceState(null, '', '#/tools'); };
  guard(); window.addEventListener('hashchange', guard); })();
(function () {
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const { S, BY, esc, nz, sg, cls, dfmt, fcv, capFmt, pxSeries, pxDate, SCR } = window.TWX || {};
const app = $('#app');
const __st = document.createElement('style'); __st.id = 'nx-css'; __st.textContent = "/* ---- Nov 22, 2026: heatmap, fair value, target history, segments, seasonality, superinvestors, congress, ETFs, saved screens, plans ---- */\n.nx-src{font-size:12.5px;color:var(--mut);margin:10px 0 0;line-height:1.5}\n.hm-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}.hm-leg{display:flex;margin-left:auto;border-radius:8px;overflow:hidden}.hm-leg span{font:700 11px Inter,sans-serif;color:#fff;padding:5px 8px}\n.hm-sum{display:flex;gap:18px;flex-wrap:wrap;font-size:13.5px;margin:0 0 10px;color:var(--mut)}.hm-sum b{color:inherit}.hm-sum b.up{color:#00995A}.hm-sum b.dn{color:#D72B45}\n.hm-svg{background:#0F172A;border-radius:12px;overflow:hidden}.hm-svg svg{display:block;width:100%;height:auto}.hm-c{cursor:pointer}.hm-c:hover{stroke:#fff;stroke-width:2}\n.subnav a.hm-tab{font-weight:700}\n.fv-top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.fv-big{border:2px solid var(--line);border-radius:14px;padding:12px 16px}.fv-big span{display:block;font-size:13px;color:var(--mut);font-weight:600}.fv-big b{display:block;font:800 28px 'Space Grotesk',sans-serif;margin:2px 0}.fv-big small{font-size:12.5px;color:var(--mut)}\n.fv-bar{position:relative;height:12px;border-radius:8px;background:#EEF2F8;margin:40px 8px 18px}.fv-rng{position:absolute;top:0;bottom:0;background:#BDE8D1;border-radius:8px}\n.fv-mk{position:absolute;top:-6px;width:4px;height:24px;border-radius:3px;transform:translateX(-50%)}.fv-mk em{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);white-space:nowrap;font:700 12px Inter,sans-serif;font-style:normal}\n.fv-px{background:#0B1B3F}.fv-px em{color:#0B1B3F}.fv-fv{background:#00995A;top:-6px}.fv-fv em{color:#00995A;bottom:auto;top:26px}\n.fv-m{margin:18px 0 0;padding-left:18px;font-size:13.5px;line-height:1.7}\n.th-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:10px}.th-k>div{background:#F7F9FC;border-radius:12px;padding:10px 14px}.th-k span{display:block;font-size:12.5px;color:var(--mut);font-weight:600}.th-k b{display:block;font:800 20px 'Space Grotesk',sans-serif;margin-top:2px}.th-k b .badge{font-size:12.5px}.th-k small{font-size:12px;color:var(--mut)}\n.th-read{font-size:14px;margin:4px 0 6px;font-weight:600}\n.sg-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr));gap:22px}.sg-b{min-width:0}.sg-t{width:100%}.ov-al em{left:-6px!important;transform:none!important}.ov-ar em{left:auto!important;right:-6px;transform:none!important}.sg-h{display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin-bottom:8px}.sg-h b{font-size:15.5px}.sg-h span{font-size:12.5px}\n.sg-bar{display:flex;height:22px;border-radius:8px;overflow:hidden;margin-bottom:10px}.sg-bar i{display:block;height:100%}\n.sg-t td,.sg-t th{padding:6px 8px}.sg-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;vertical-align:-1px}\n.sg-tl{font-size:12.5px;color:var(--mut);font-weight:600;margin:12px 0 6px}.sg-trend{display:flex;gap:8px;align-items:flex-end;height:120px}.sg-col{flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end}\n.sg-stack{width:70%;display:flex;flex-direction:column-reverse;border-radius:4px;overflow:hidden}.sg-stack i{display:block;width:100%}.sg-col small{font-size:10.5px;color:var(--mut);margin-top:4px;white-space:nowrap}\n.sg-warn{background:#FFF7E0;border:1px solid #F2D27A;border-radius:10px;padding:8px 12px;font-size:13px;margin:0 0 10px}\n.etf-w{display:inline-block;width:70px;height:8px;background:#EEF2F8;border-radius:4px;margin-right:8px;vertical-align:middle;overflow:hidden}.etf-w i{display:block;height:100%;background:#2F6BFF}\n#scr-saved{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px}.scr-chip{display:inline-flex;align-items:center;border:1.5px solid #2F6BFF;border-radius:999px;overflow:hidden}.scr-chip a{padding:4px 10px;font:600 13px Inter,sans-serif;color:#2F6BFF;text-decoration:none}.scr-chip button{border:0;background:#EEF4FF;color:#2F6BFF;cursor:pointer;padding:4px 8px;font-size:14px}\n#navlinks a.nav-plans{color:#7C3AED;font-weight:700}\n.pl-note{background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:12px 16px;font-size:14px;margin-bottom:18px}\n.pl-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-bottom:22px;align-items:stretch}\n.pl{position:relative;background:#fff;border:1.5px solid var(--line);border-top:5px solid var(--c);border-radius:18px;padding:22px 22px 18px;display:flex;flex-direction:column}\n.pl.hot{border-color:var(--c);box-shadow:0 14px 34px rgba(124,58,237,.18)}.pl-hot{position:absolute;top:-13px;right:18px;background:var(--c);color:#fff;font:800 11.5px Inter,sans-serif;letter-spacing:.04em;padding:4px 10px;border-radius:999px}\n.pl h3{margin:0;font:800 24px 'Space Grotesk',sans-serif;color:var(--c)}.pl-tag{margin:4px 0 12px;font-size:13.5px;color:var(--mut)}\n.pl-p b{font:800 40px 'Space Grotesk',sans-serif}.pl-p span{font-size:14px;color:var(--mut);margin-left:6px}.pl-yr{font-size:12.5px;color:var(--mut);margin:2px 0 14px}\n.pl-cta{width:100%;padding:12px;font-size:15px}.pl.hot .pl-cta{background:linear-gradient(120deg,#4C1D95,#7C3AED)}\n.pl ul{margin:16px 0 0;padding:0;list-style:none;font-size:13.5px;line-height:1.5}.pl li{padding:6px 0 6px 24px;position:relative;border-top:1px dashed var(--line)}.pl li::before{content:'\u2713';position:absolute;left:2px;color:var(--c);font-weight:800}\n.pl-t td,.pl-t th{padding:9px 10px}.pl-y{color:#00995A;font-size:16px}.pl-n{color:#CBD5E1}\n.pl-r{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.pl-rc{border:1px solid var(--line);border-radius:14px;padding:14px 16px}.pl-rh{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}.pl-rh b{font-size:15.5px}.pl-rc p{margin:0;font-size:13.5px;line-height:1.55;color:#334155}\n.pl-chat{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pl-q{background:#F5F3FF;border-radius:14px 14px 14px 4px;padding:10px 14px;font-size:14px;color:#4C1D95;font-weight:600}\n.pl-faq{margin-top:18px}.pl-faq details{border-bottom:1px solid var(--line);padding:12px 4px}.pl-faq summary{cursor:pointer;font-weight:700}.pl-faq p{margin:8px 0 0;color:#334155;font-size:14px}\n@media (max-width:860px){.pl-g,.pl-r{grid-template-columns:1fr}.pl-chat{grid-template-columns:1fr}.fv-top{grid-template-columns:1fr}.sg-g{grid-template-columns:1fr}.hm-leg{margin-left:0}}\n.pl:last-child .pl-cta{background:linear-gradient(120deg,#A07800,#E0B400);color:#fff}\n"; if (!document.getElementById('nx-css')) document.head.appendChild(__st);

const NX = TW.NX || {}, ND = NX.d || {};
const card = (title, sub, inner, id, cls) => `<div class="card${cls ? ' ' + cls : ''}"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${title}</h3>${sub ? `<span>${sub}</span>` : ''}</div>${inner}</div>`;
const LOCK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const SPARK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2l1.8 5.6L19.5 9l-5.7 1.5L12 16l-1.8-5.5L4.5 9l5.7-1.4z"/><path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z" opacity=".7"/></svg>';
const pro = (what, title, sub, btn, id) => `<div class="pro-t" data-pro data-what="${esc(what)}"${id ? ` id="${id}"` : ''}><div class="pro-ic">${SPARK}</div><div class="pro-tx"><b>${title}<span class="pro-badge" style="display:inline-flex;margin-top:0">${LOCK} PRO</span></b><span>${sub}</span></div><button class="pro-btn" type="button">${LOCK} ${btn}</button></div>`;
const src = (txt, d) => `<p class="nx-src">${txt}${d ? ', read ' + dfmt(d) : ''}.</p>`;
const money = m => !nz(m) ? '—' : Math.abs(m) >= 1e6 ? '$' + (m / 1e6).toFixed(2) + 'T' : Math.abs(m) >= 1e3 ? '$' + (m / 1e3).toFixed(1) + 'B' : '$' + Math.round(m) + 'M';
const lastPx = t => { const S = pxSeries(t); return S && S.length ? S[S.length - 1] : null; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ===== 1. Market Heatmap (Markets → Heatmap) ===== */
const HP = [['1D', 1], ['1W', 7], ['1M', 30], ['3M', 91], ['YTD', 'ytd'], ['1Y', 365]];
let hmP = '1D', hmG = 'sec', hmU = 'sp';
const HU = [['sp', 'S&P 500', 1], ['ndx', 'Nasdaq-100', 2], ['dow', 'Dow 30', 4], ['all', 'All Three', 7], ['ours', 'Our Stocks', 0]];
function chg(t, p) {
  const S = pxSeries(t); if (!S || S.length < 2) return null; const last = S[S.length - 1];
  if (p === 1) return (last.c / S[S.length - 2].c - 1) * 100;
  const tgt = p === 'ytd' ? Date.UTC(pxDate(last.d).getUTCFullYear(), 0, 1) / 864e5 - 1 : last.d - p;
  let b = null; for (let i = S.length - 1; i >= 0; i--) { if (S[i].d <= tgt) { b = S[i]; break; } } if (!b) return null; return (last.c / b.c - 1) * 100;
}
function hmCol(v, p) {
  if (!nz(v)) return '#CBD5E1'; const sc = { 1: 3, 7: 6, 30: 12, 91: 20, ytd: 30, 365: 40 }[p] || 10, x = Math.max(-1, Math.min(1, v / sc));
  if (Math.abs(x) < 0.04) return '#414554';
  return x > 0 ? `rgb(${Math.round(65 - 55 * x)},${Math.round(69 + 110 * x)},${Math.round(84 - 10 * x)})` : `rgb(${Math.round(65 + 180 * -x)},${Math.round(69 - 25 * -x)},${Math.round(84 - 10 * -x)})`;
}
function squarify(items, x, y, w, h) {
  const out = [], tot = items.reduce((a, b) => a + b.v, 0); if (!tot || w <= 0 || h <= 0) return out;
  const sc = w * h / tot; let rest = items.map(i => Object.assign({}, i, { a: i.v * sc }));
  while (rest.length) {
    const short = Math.min(w, h); let row = [], best = Infinity;
    for (const it of rest) { const r = row.concat([it]), s = r.reduce((a, b) => a + b.a, 0), mx = Math.max(...r.map(z => z.a)), mn = Math.min(...r.map(z => z.a)), worst = Math.max(short * short * mx / (s * s), s * s / (short * short * mn)); if (worst > best) break; row = r; best = worst; }
    const s = row.reduce((a, b) => a + b.a, 0);
    if (w >= h) { const cw = s / h; let cy = y; row.forEach(it => { const ch = it.a / cw; out.push(Object.assign(it, { x, y: cy, w: cw, h: ch })); cy += ch; }); x += cw; w -= cw; }
    else { const rh = s / w; let cx = x; row.forEach(it => { const cw = it.a / rh; out.push(Object.assign(it, { x: cx, y, w: cw, h: rh })); cx += cw; }); y += rh; h -= rh; }
    rest = rest.slice(row.length);
  }
  return out;
}
function heatmap() {
  const p = HP.find(x => x[0] === hmP)[1], W = 1200, H = 660;
  const IX = ((TW.NX || {}).IX || {}).T, U = IX ? hmU : 'ours', PI = { 1: 4, 7: 5, 30: 6, 91: 7, ytd: 8, 365: 9 }[p], BIT = (HU.find(x => x[0] === U) || [])[2];
  const items = U === 'ours' ? S.map(s => ({ s, cap: fcv(s, 'Market Cap') })).filter(o => nz(o.cap) && o.cap > 0).map(o => ({ s: o.s, v: Math.sqrt(o.cap), r: chg(o.s.t, p), cap: o.cap }))
    : Object.entries(IX).filter(([t, v]) => (v[3] & BIT) && nz(v[2]) && v[2] > 0).map(([t, v]) => ({ s: BY[t] || { t, n: v[0], ix: 1 }, g: v[1] || 'Other', v: Math.sqrt(v[2]), r: v[PI], cap: v[2] * 1e9 }));
  const gk = o => o.g || (hmG === 'sec' ? (o.s.sec || 'Other') : (o.s.th || 'Other'));
  const G = {}; items.forEach(o => { (G[gk(o)] = G[gk(o)] || []).push(o); });
  let groups = Object.entries(G).map(([k, v]) => ({ k, v: v.reduce((a, b) => a + b.v, 0), list: v.sort((a, b) => b.v - a.v) })).sort((a, b) => b.v - a.v);
  const gl = squarify(groups, 0, 0, W, H); let g = '';
  gl.forEach(G1 => { const pad = 1.5, top = G1.h > 60 && G1.w > 70 ? 16 : 0;
    g += `<rect x="${G1.x}" y="${G1.y}" width="${G1.w}" height="${G1.h}" fill="#0F172A"/>`;
    if (top) g += `<text x="${G1.x + 5}" y="${G1.y + 12}" font-size="10.5" font-weight="700" fill="#CBD5E1">${esc(G1.k.toUpperCase().slice(0, Math.floor(G1.w / 7)))}</text>`;
    squarify(G1.list, G1.x + pad, G1.y + top + pad, G1.w - 2 * pad, G1.h - top - 2 * pad).forEach(c => {
      const fs = Math.max(8, Math.min(26, Math.min(c.w / 4.2, c.h / 2.6))), show = c.w > 26 && c.h > 16, tip = `${c.s.t} · ${c.s.n}|${hmP} change: ${nz(c.r) ? sg(c.r, 1) : '—'} · Market cap ${capFmt(c.cap)}${!c.s.ix && c.s.ws != null ? ` · Score ${c.s.ws}/10` : ''}`;
      g += `<a${c.s.ix ? '' : ` href="#/stock/${esc(c.s.t)}"`}><rect class="hv hm-c" x="${c.x + 0.5}" y="${c.y + 0.5}" width="${Math.max(0, c.w - 1)}" height="${Math.max(0, c.h - 1)}" fill="${hmCol(c.r, p)}" data-tip="${esc(tip)}"/>`;
      if (show) g += `<text x="${c.x + c.w / 2}" y="${c.y + c.h / 2 + (c.h > fs * 2.4 ? -fs * 0.12 : fs * 0.35)}" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#fff" pointer-events="none">${esc(c.s.t)}</text>${c.h > fs * 2.4 ? `<text x="${c.x + c.w / 2}" y="${c.y + c.h / 2 + fs * 0.95}" text-anchor="middle" font-size="${fs * 0.62}" font-weight="600" fill="#fff" opacity=".92" pointer-events="none">${nz(c.r) ? sg(c.r, 1) : '—'}</text>` : ''}`;
      g += '</a>'; });
  });
  const up = items.filter(o => o.r > 0).length, dn = items.filter(o => o.r < 0).length, avg = items.filter(o => nz(o.r)).reduce((a, b, i, A) => a + b.r / A.length, 0);
  const best = items.filter(o => nz(o.r)).sort((a, b) => b.r - a.r), sc = { 1: 3, 7: 6, 30: 12, 91: 20, ytd: 30, 365: 40 }[p];
  const leg = [-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map(x => `<span style="background:${hmCol(x * sc, p)}">${sg(x * sc, 0)}</span>`).join('');
  return `<div class="card hm"><div class="hm-top"><div class="seg">${HP.map(x => `<button type="button" class="${x[0] === hmP ? 'on' : ''}" onclick="twHm('${x[0]}')">${x[0]}</button>`).join('')}</div>
      ${((TW.NX || {}).IX) ? `<div class="seg">${HU.map(x => `<button type="button" class="${x[0] === hmU ? 'on' : ''}" onclick="twHmU('${x[0]}')">${x[1]}</button>`).join('')}</div>` : ''}${hmU === 'ours' || !((TW.NX || {}).IX) ? `<div class="seg">${[['sec', 'By Sector'], ['th', 'By Theme']].map(x => `<button type="button" class="${x[0] === hmG ? 'on' : ''}" onclick="twHmG('${x[0]}')">${x[1]}</button>`).join('')}</div>` : ''}
      <div class="hm-leg">${leg}</div></div>
    <div class="hm-sum"><span><b class="up">${up}</b> up</span><span><b class="dn">${dn}</b> down</span><span>Average <b class="${cls(avg)}">${sg(avg, 1)}</b></span>${best.length ? `<span>Best <a${best[0].s.ix ? '' : ` href="#/stock/${best[0].s.t}"`}><b>${esc(best[0].s.t)}</b></a> <b class="up">${sg(best[0].r, 1)}</b></span><span>Worst <a${best[best.length - 1].s.ix ? '' : ` href="#/stock/${best[best.length - 1].s.t}"`}><b>${esc(best[best.length - 1].s.t)}</b></a> <b class="dn">${sg(best[best.length - 1].r, 1)}</b></span>` : ''}</div>
    <div class="chart hm-svg"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Market heatmap">${g}</svg></div>
    <p class="nx-src">${U === 'ours' ? 'Every stock we cover (funds without a market cap are left out).' : `Every ${(HU.find(x => x[0] === U) || [])[1] === 'All Three' ? 'S&P 500, Nasdaq-100 and Dow 30' : (HU.find(x => x[0] === U) || [])[1]} stock (${items.length}); boxes for stocks we cover open their page. Index members, sectors and market caps from stockanalysis.com, price changes from Yahoo Finance, as of ${dfmt((TW.NX.IX || {}).read)} close.`} Box size = market cap (square-root scaled, so smaller companies stay visible); color = price change over the period. ${U === 'ours' ? `Click a box to open the stock. Prices as of ${dfmt(TW.asof)} close.` : ''}</p></div>`;
}
window.twHm = p => { hmP = p; const el = $('.card.hm'); if (el) el.outerHTML = heatmap(); };
window.twHmU = u => { hmU = u; const el = $('.card.hm'); if (el) el.outerHTML = heatmap(); };
window.twHmG = g => { hmG = g; const el = $('.card.hm'); if (el) el.outerHTML = heatmap(); };
function patchMarketsHeat(sub) {
  const ph = $('.page-h .wrap'), nav = ph && $('.subnav', ph); if (!nav) return;
  if (!$('a[data-k="heatmap"]', nav)) nav.insertAdjacentHTML('afterbegin', `<a href="#/markets/heatmap" data-k="heatmap" class="hm-tab">🟩 Heatmap</a>`);
  $$('a', nav).forEach(a => a.classList.toggle('on', a.dataset.k === (sub || '')));
  if (sub !== 'heatmap') return;
  $('h1', ph).textContent = 'Market Heatmap'; const pp = $('p', ph); if (pp) pp.textContent = 'The S&P 500, Nasdaq-100 and Dow 30 at a glance, or just the stocks we cover: size is market cap, color is the price move.';
  const sec = $('#app > section.sec'); if (sec) sec.outerHTML = `<section class="sec" style="padding-top:22px"><div class="wrap">${heatmap()}</div></section>`;
  document.title = 'Market Heatmap — Tickerwise';
}
function patchHomeHeat() {
  const p = $('#x-pulse .sec-h p'); if (p && !$('a[href="#/markets/heatmap"]', p)) p.insertAdjacentHTML('beforeend', ' <a href="#/markets/heatmap">Open the Market Heatmap →</a>');
}

/* ===== 2. Fair Value Estimate (Overview) ===== */
function fairValue(s) {
  const Q = (TW.QH || {})[s.t], L = lastPx(s.t); if (!Q || !L) return '';
  const ok = v => nz(v) && v > 0 && v <= 400, avg = a => { const x = (a || []).filter(ok); return x.length >= 4 ? [x.reduce((p, c) => p + c, 0) / x.length, x.length] : null; };
  const fv0 = k => { const a = ((TW.F || {})[s.t] || {})[k]; return a && nz(+a[0]) ? +a[0] : null; };
  const fe = avg(Q.fpe), ps = avg(Q.ps), cf = [fv0('Forward P/E'), fv0('P/S')], px = L.c, M = [];
  if (fe && ok(cf[0])) M.push(['Forward P/E', px * fe[0] / cf[0], `today ${cf[0].toFixed(1)}x vs its ${fe[1]}-quarter average ${fe[0].toFixed(1)}x`]);
  if (ps && ok(cf[1])) M.push(['Price / Sales', px * ps[0] / cf[1], `today ${cf[1].toFixed(1)}x vs its ${ps[1]}-quarter average ${ps[0].toFixed(1)}x`]);
  if (!M.length) return '';
  const mid = M.reduce((a, b) => a + b[1], 0) / M.length, lo = Math.min(...M.map(m => m[1])), hi = Math.max(...M.map(m => m[1])), up = (mid / px - 1) * 100;
  const v = up >= 15 ? ['Below fair value', 'b-up', '#00995A'] : up <= -15 ? ['Above fair value', 'b-dn', '#D72B45'] : ['Near fair value', 'b-am', '#B07A00'];
  const mx = Math.max(hi, px) * 1.12, mn = Math.min(lo, px) * 0.88, X = x => ((x - mn) / ((mx - mn) || 1) * 100).toFixed(1) + '%';
  return card('Fair Value Estimate', 'what the price would be at the stock\'s own average valuation',
    `<div class="fv-top"><div class="fv-big" style="border-color:${v[2]}"><span>Fair value</span><b>$${mid.toFixed(2)}</b><small>${M.length > 1 ? `range $${lo.toFixed(2)} – $${hi.toFixed(2)}` : M[0][0] + ' method'}</small></div>
      <div class="fv-big"><span>Last close</span><b>$${px.toFixed(2)}</b><small>${dfmt(TW.asof)}</small></div>
      <div class="fv-big" style="border-color:${v[2]}"><span>Upside to fair value</span><b style="color:${v[2]}">${sg(up, 0)}</b><small><span class="badge ${v[1]}">${v[0]}</span></small></div></div>
    <div class="fv-bar"><i class="fv-rng" style="left:${X(lo)};width:calc(${X(hi)} - ${X(lo)})"></i><b class="fv-mk fv-px ${parseFloat(X(px)) < 25 ? 'ov-al' : parseFloat(X(px)) > 75 ? 'ov-ar' : ''}" style="left:${X(px)}"><em>Price $${px.toFixed(0)}</em></b><b class="fv-mk fv-fv ${parseFloat(X(mid)) < 25 ? 'ov-al' : parseFloat(X(mid)) > 75 ? 'ov-ar' : ''}" style="left:${X(mid)}"><em>Fair $${mid.toFixed(0)}</em></b></div>
    <ul class="fv-m">${M.map(m => `<li><b>${m[0]} method: $${m[1].toFixed(2)}</b> <span class="muted">(${m[2]})</span></li>`).join('')}</ul>
    <p class="nx-src">How it works: today's price × (the stock's average multiple over the last quarter-ends ÷ today's multiple), with today's Forward P/E and P/S from the Valuation &amp; Growth boxes and the average from the Valuation &amp; Cash Flow by Quarter card (stockanalysis.com). It assumes the stock goes back to its usual valuation; it does not predict growth. Not financial advice.</p>`, 'fv-' + s.t);
}

/* ===== 3. Analyst Target History (Analysts tab) ===== */
function targetHist(s) {
  /* One chart for the Analysts tab (Zev, Nov 24, 2026: merged "Analyst Target History" + "Price vs Analyst Targets").
     Price line, the month-end average target (MarketBeat), every firm's individual target as a dot, and a hover that lists
     the firms behind each month's average. The firm list rides on the last target-history point (kit/nx.js). */
  const T = (NX.TH || {})[s.t], P = pxSeries(s.t); if (!T || T.length < 2 || !P) return '';
  const W = 900, H = 300, pl = 56, pr = 120, pt = 16, pb = 28, iw = W - pl - pr, ih = H - pt - pb;
  const d0 = Math.round(new Date(T[0][0] + 'T12:00:00Z') / 864e5), last = P[P.length - 1], d1 = last.d, PP = P.filter(p => p.d >= d0);
  const dn = x => Math.floor(new Date(x + 'T00:00:00Z') / 864e5), pts = T.map(r => [dn(r[0]), r[1], r[2]]), LR = (T[T.length - 1][3] || []).filter(r => r && r[4] > 0);
  const DOTS = LR.filter(r => dn(r[0]) >= d0);
  const vs = PP.map(p => p.c).concat(pts.map(p => p[1]), DOTS.map(r => r[4])), mx = Math.max(...vs) * 1.05, mn = Math.min(...vs) * 0.94;
  const X = d => pl + (d - d0) / ((d1 - d0) || 1) * iw, Y = v => pt + ih - (v - mn) / ((mx - mn) || 1) * ih, F = v => '$' + (v >= 100 ? v.toFixed(0) : v.toFixed(2));
  const rc = r => /buy|outperform|overweight|accumulate|positive/i.test(r) ? '#10B981' : /sell|underperform|underweight|reduce|negative/i.test(r) ? '#EF4444' : '#F59E0B';
  let g = ''; [mn, (mn + mx) / 2, mx].forEach(v => { g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EEF2F8"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#94A3B8">${F(v)}</text>`; });
  g += DOTS.map(r => `<circle cx="${X(dn(r[0])).toFixed(1)}" cy="${Y(r[4]).toFixed(1)}" r="4.2" fill="${rc(r[3])}" opacity=".55"/>`).join('');
  g += `<polyline fill="none" stroke="#0B1B3F" stroke-width="2" points="${PP.map(p => X(p.d).toFixed(1) + ',' + Y(p.c).toFixed(1)).join(' ')}"/>`;
  g += `<polyline fill="none" stroke="#7C3AED" stroke-width="2.6" stroke-dasharray="6 4" points="${pts.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
  pts.forEach((p, i) => { g += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="${i === pts.length - 1 ? 5.5 : 3.8}" fill="#7C3AED"/>`; });
  const lp = pts[pts.length - 1], ly = Y(lp[1]), lyp = Y(last.c), sep = Math.abs(ly - lyp) < 16 ? (ly < lyp ? -8 : 8) : 0;
  g += `<text x="${W - pr + 12}" y="${ly + 4 + sep}" font-size="12" font-weight="800" fill="#6D28D9">Target ${F(lp[1])}</text><text x="${W - pr + 12}" y="${lyp + 4 - sep}" font-size="12" font-weight="700" fill="#0B1B3F">Price ${F(last.c)}</text>`;
  [0, 0.25, 0.5, 0.75, 1].forEach(f => { const d = d0 + (d1 - d0) * f, dt = pxDate(d); g += `<text x="${X(d)}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="#94A3B8">${MON[dt.getUTCMonth()]} ${String(dt.getUTCFullYear()).slice(2)}</text>`; });
  g += `<line class="th-x" x1="0" x2="0" y1="${pt}" y2="${pt + ih}" stroke="#0B1B3F" stroke-width="1" opacity="0"/><rect class="th-hit" x="${pl}" y="${pt}" width="${iw}" height="${ih}" fill="transparent"/>`;
  const first = pts[0][1], chg = (lp[1] / first - 1) * 100, pchg = PP.length ? (last.c / PP[0].c - 1) * 100 : null, up = (lp[1] / last.c - 1) * 100;
  const NOW = (() => { const e = d1, lat = {}; LR.forEach(r => { const d = dn(r[0]); if (d <= e && d >= e - 365 && (!lat[r[1]] || d > dn(lat[r[1]][0]))) lat[r[1]] = r; }); return Object.values(lat); })(), hi = NOW.length ? Math.max(...NOW.map(r => r[4])) : null, lo = NOW.length ? Math.min(...NOW.map(r => r[4])) : null;
  const read = chg > 5 && nz(pchg) && pchg < chg - 10 ? 'Analysts have raised targets faster than the price has moved: they are getting ahead of the stock.' : chg < -5 ? 'Analysts have been cutting targets.' : nz(pchg) && pchg > chg + 15 ? 'The price has run ahead of analyst targets: they are chasing the stock.' : 'Targets and price have moved roughly together.';
  const p0 = PP.find(p => p.d >= pts[0][0]) || PP[0], g0 = p0 ? (first / p0.c - 1) * 100 : null, conv = nz(g0) ? (Math.abs(up) < Math.abs(g0) ? ` The gap to the average target <b>shrank</b> from ${sg(g0, 0)} to ${sg(up, 0)}.` : ` The gap to the average target <b>widened</b>, from ${sg(g0, 0)} to ${sg(up, 0)}.`) : '';
  window.__thD = window.__thD || {}; window.__thD[s.t] = { pts, PP, LR, d0, d1, mn, mx, W, H, pl, pr, pt, pb };
  return card('Analyst Target History', 'price vs the average analyst target, last 12 months · hover a month to see every analyst',
    `<div class="th-k"><div><span>Average target, ${MON[pxDate(pts[0][0]).getUTCMonth()]} ${pxDate(pts[0][0]).getUTCFullYear()}</span><b>${F(first)}</b></div><div><span>Average target today</span><b>${F(lp[1])}</b></div><div><span>Target change</span><b class="${cls(chg)}">${sg(chg, 0)}</b></div><div><span>Price change, same period</span><b class="${cls(pchg)}">${sg(pchg, 0)}</b></div><div><span>Upside to average</span><b class="${cls(up)}">${sg(up, 0)}</b></div>${hi != null ? `<div><span>Highest / lowest target</span><b>${F(hi)} / ${F(lo)}</b></div>` : ''}<div><span>Analysts in the average</span><b>${lp[2]}</b></div></div>
    <p class="th-read">${read}${conv}</p><div class="chart" style="position:relative"><svg class="th-svg" data-t="${esc(s.t)}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Analyst target history" style="touch-action:pan-y">${g}</svg><div class="th-tip" style="position:absolute;display:none;pointer-events:none;background:#0B1B3F;color:#fff;border-radius:10px;padding:9px 11px;font-size:12.5px;line-height:1.45;z-index:5;max-width:330px;box-shadow:0 8px 24px rgba(11,27,63,.28)"></div></div>
    <div class="legend"><span><i style="background:#0B1B3F"></i>Price</span><span><i style="background:#7C3AED"></i>Average analyst target (dashed)</span>${DOTS.length ? '<span><i style="background:#10B981;border-radius:50%"></i>Buy</span><span><i style="background:#F59E0B;border-radius:50%"></i>Hold</span><span><i style="background:#EF4444;border-radius:50%"></i>Sell target, on the day it was set</span>' : ''}</div>
    ${src('Month-end averages of each firm\'s latest price target in the 12 months before that date, from MarketBeat rating history (last point = today). The Analyst Upside elsewhere on this page uses TipRanks\' current average; the two services count slightly different analysts', ND.TH)}`, 'th-' + s.t);
}
function thBind(t) { const D = (window.__thD || {})[t], svg = document.querySelector(`.th-svg[data-t="${t}"]`); if (!D || !svg || svg.dataset.b) return; svg.dataset.b = 1;
  const tip = svg.parentNode.querySelector('.th-tip'), xl = svg.querySelector('.th-x'), { pts, PP, LR, d0, d1, W, H, pl, pr, pt, pb } = D, iw = W - pl - pr, dn = x => Math.floor(new Date(x + 'T00:00:00Z') / 864e5), X = d => pl + (d - d0) / ((d1 - d0) || 1) * iw, F = v => '$' + (v >= 100 ? v.toFixed(0) : v.toFixed(2));
  const rc = r => /buy|outperform|overweight|accumulate|positive/i.test(r) ? '#34D399' : /sell|underperform|underweight|reduce|negative/i.test(r) ? '#F87171' : '#FBBF24';
  const mv = ev => { const r = svg.getBoundingClientRect(), vx = (ev.clientX - r.left) / r.width * W; let p = pts[0]; pts.forEach(q => { if (Math.abs(X(q[0]) - vx) < Math.abs(X(p[0]) - vx)) p = q; });
    const x = X(p[0]); xl.setAttribute('x1', x); xl.setAttribute('x2', x); xl.setAttribute('opacity', .3); const pc = PP.filter(q => q.d <= p[0]).pop(), gap = pc ? (p[1] / pc.c - 1) * 100 : null;
    const lat = {}; LR.forEach(rw => { const d = dn(rw[0]); if (d <= p[0] && d >= p[0] - 365 && (!lat[rw[1]] || d > dn(lat[rw[1]][0]))) lat[rw[1]] = rw; }); const L = Object.values(lat).sort((a, b) => b[4] - a[4]);
    tip.innerHTML = `<div style="font-weight:800;margin-bottom:2px">${esc(dfmt(new Date(p[0] * 864e5).toISOString().slice(0, 10)))}</div>Average target <b>${F(p[1])}</b> · <b>${p[2]} analyst${p[2] === 1 ? '' : 's'}</b>${pc ? `<br>Price ${F(pc.c)} · gap ${sg(gap, 0)}` : ''}` + (L.length ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.15);max-height:220px;overflow:hidden">${L.slice(0, 18).map(rw => `<div style="display:flex;justify-content:space-between;gap:10px"><span><i style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${rc(rw[3])};margin-right:5px"></i>${esc(rw[1])}${rw[2] ? ` <span style="opacity:.7">(${esc(rw[2])})</span>` : ''}</span><b>${F(rw[4])}</b></div>`).join('')}${L.length > 18 ? `<div style="opacity:.7">+${L.length - 18} more</div>` : ''}</div>` : `<div style="margin-top:5px;opacity:.75">Analyst names arrive with the next nightly update.</div>`);
    tip.style.display = 'block'; const px = x / W * r.width, tw = tip.offsetWidth; tip.style.left = Math.max(0, Math.min(px + 14 + tw > r.width ? px - tw - 14 : px + 14, r.width - tw)) + 'px'; tip.style.top = '8px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { tip.style.display = 'none'; xl.setAttribute('opacity', 0); }); }

/* ===== 4. Revenue by Segment & Geography (Financials tab) ===== */
const SEGC = ['#2F6BFF', '#00B86B', '#F28C28', '#9B6BDE', '#E04B4B', '#0EA5E9', '#C9A000', '#64748B', '#D946EF', '#14B8A6'];
function mixBlock(title, D) {
  if (!D || !D[1] || !D[1].length) return '';
  const [h, rows] = D, r0 = rows[0], vals = h.map((n, i) => [n, r0[i + 1]]).filter(x => nz(x[1]) && x[1] > 0), tot = vals.reduce((a, b) => a + b[1], 0); if (!tot) return '';
  const ya = rows.find(r => { const a = new Date(r[0]), b = new Date(r0[0]); return (b - a) / 864e5 > 330 && (b - a) / 864e5 < 400; });
  vals.sort((a, b) => b[1] - a[1]);
  const bar = `<div class="sg-bar">${vals.map((v, i) => `<i style="width:${(v[1] / tot * 100).toFixed(2)}%;background:${SEGC[i % 10]}" data-tip="${esc(v[0] + '|' + money(v[1]) + ' · ' + (v[1] / tot * 100).toFixed(1) + '% of total')}" class="hv"></i>`).join('')}</div>`;
  const list = vals.map((v, i) => { const j = h.indexOf(v[0]) + 1, p = ya && nz(ya[j]) && ya[j] > 0 ? (v[1] / ya[j] - 1) * 100 : null;
    return `<tr><td><i class="sg-dot" style="background:${SEGC[i % 10]}"></i>${esc(v[0])}</td><td class="num"><b>${money(v[1])}</b></td><td class="num">${(v[1] / tot * 100).toFixed(1)}%</td><td class="num"><b class="${cls(p)}">${nz(p) ? sg(p, 0) : '—'}</b></td></tr>`; }).join('');
  const trend = rows.slice(0, 8).reverse(), tmax = Math.max(...trend.map(r => r.slice(1).filter(x => nz(x) && x > 0).reduce((a, b) => a + b, 0)));
  const tb = `<div class="sg-trend">${trend.map(r => { const t = r.slice(1).reduce((a, b) => a + (nz(b) && b > 0 ? b : 0), 0);
    return `<div class="sg-col"><div class="sg-stack" style="height:${(t / (tmax || 1) * 100).toFixed(1)}%">${vals.map((v, i) => { const x = r[h.indexOf(v[0]) + 1]; return nz(x) && x > 0 ? `<i class="hv" style="height:${(x / t * 100).toFixed(2)}%;background:${SEGC[i % 10]}" data-tip="${esc(r[0] + '|' + v[0] + ': ' + money(x))}"></i>` : ''; }).join('')}</div><small>${esc(r[0].replace(/^(\w{3}) \d+, (\d{4})$/, (m, a, b) => a + ' ' + b.slice(2)))}</small></div>`; }).join('')}</div>`;
  return `<div class="sg-b"><div class="sg-h"><b>${title}</b><span class="muted">12 months to ${esc(r0[0])} · total ${money(tot)}</span></div>${bar}
    <table class="tw sg-t"><thead><tr><th>${title.replace('By ', '')}</th><th class="num">Revenue</th><th class="num">Share</th><th class="num">Vs a year earlier</th></tr></thead><tbody>${list}</tbody></table>
    <div class="sg-tl">12-month revenue at each of the last ${trend.length} reports (current segments only)</div>${tb}</div>`;
}
function segments(s) {
  const D = (NX.SEG || {})[s.t]; if (!D) return '';
  const a = mixBlock('By Segment', D.s), b = mixBlock('By Geography', D.g); if (!a && !b) return '';
  return card('Where The Revenue Comes From', 'revenue by business segment and by region', `<div class="sg-g">${a}${b}</div>${src('Company-reported segment and regional revenue, trailing 12 months at each report date, from stockanalysis.com. Segments a company has since renamed or dropped are left out', ND.SEG)}`, 'seg-' + s.t);
}

/* ===== 5. Seasonality (Technicals tab) ===== */
function seasonality(s) {
  const A = (NX.SEA || {})[s.t], B = (NX.SEA || {})['^GSPC']; if (!A || !A[3]) return '';
  const M = A[3], SP = B ? B[3] : [], yrs = A[2], cur = new Date(TW.asof + 'T12:00:00Z').getUTCMonth(), nxt = (cur + 1) % 12;
  const W = 900, H = 230, pl = 46, pr = 14, pt = 18, pb = 40, iw = W - pl - pr, ih = H - pt - pb, bw = iw / 12;
  const vs = M.concat(SP).filter(Boolean).map(m => m[0]), mx = Math.max(2, ...vs) * 1.18, mn = Math.min(-2, ...vs) * 1.45, Y = v => pt + ih - (v - mn) / ((mx - mn) || 1) * ih;
  let g = `<line x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="#94A3B8"/>`; [mn, mx].forEach(v => { g += `<text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#94A3B8">${sg(v, 0)}</text>`; });
  M.forEach((m, i) => { const x = pl + i * bw, on = i === cur || i === nxt;
    if (on) g += `<rect x="${x + 2}" y="${pt}" width="${bw - 4}" height="${ih}" fill="${i === cur ? '#FFF7E0' : '#EEF4FF'}"/>`;
    if (m) { const y0 = Y(0), y1 = Y(m[0]); g += `<rect class="hv" x="${x + bw * 0.2}" y="${Math.min(y0, y1)}" width="${bw * 0.42}" height="${Math.max(1, Math.abs(y1 - y0))}" rx="3" fill="${m[0] >= 0 ? '#00B86B' : '#F0324F'}" data-tip="${esc(MON[i] + '|' + s.t + ': average ' + sg(m[0], 1) + ', up in ' + m[1] + '% of ' + m[2] + ' years')}"/>`;
      g += `<text x="${x + bw * 0.41}" y="${m[0] >= 0 ? y1 - 5 : y1 + 13}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${m[0] >= 0 ? '#00995A' : '#D72B45'}">${sg(m[0], 1)}</text>`; }
    const sp = SP[i]; if (sp) { const y0 = Y(0), y1 = Y(sp[0]); g += `<rect class="hv" x="${x + bw * 0.64}" y="${Math.min(y0, y1)}" width="${bw * 0.18}" height="${Math.max(1, Math.abs(y1 - y0))}" rx="2" fill="#94A3B8" data-tip="${esc(MON[i] + '|S&P 500: average ' + sg(sp[0], 1) + ', up in ' + sp[1] + '% of ' + sp[2] + ' years')}"/>`; }
    g += `<text x="${x + bw / 2}" y="${H - 22}" text-anchor="middle" font-size="11.5" font-weight="${on ? 800 : 600}" fill="${on ? '#0B1B3F' : '#64748B'}">${MON[i]}</text>${m ? `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#94A3B8">${m[1]}% up</text>` : ''}`; });
  const ok = M.map((m, i) => [m, i]).filter(x => x[0]), best = ok.slice().sort((a, b) => b[0][0] - a[0][0]), c = M[cur], n = M[nxt];
  const k = `<div class="th-k"><div><span>Best month</span><b class="up">${best.length ? MON[best[0][1]] + ' ' + sg(best[0][0][0], 1) : '—'}</b></div><div><span>Worst month</span><b class="dn">${best.length ? MON[best[best.length - 1][1]] + ' ' + sg(best[best.length - 1][0][0], 1) : '—'}</b></div>
    <div><span>This month (${MON[cur]})</span><b class="${cls(c && c[0])}">${c ? sg(c[0], 1) : '—'}</b><small>${c ? 'up in ' + Math.round(c[1] * c[2] / 100) + ' of ' + c[2] + ' years' : ''}</small></div><div><span>Next month (${MON[nxt]})</span><b class="${cls(n && n[0])}">${n ? sg(n[0], 1) : '—'}</b><small>${n ? 'up in ' + Math.round(n[1] * n[2] / 100) + ' of ' + n[2] + ' years' : ''}</small></div></div>`;
  return card('Seasonality', `average return by calendar month · ${yrs} year${yrs === 1 ? '' : 's'} of history`,
    `${yrs < 4 ? `<p class="sg-warn">Only ${yrs} year${yrs === 1 ? '' : 's'} of history, so these averages can be driven by one or two big months. Treat with caution.</p>` : ''}${k}
    <div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Seasonality">${g}</svg></div><div class="legend"><span><i style="background:#00B86B"></i>${esc(s.t)} average month (green up, red down)</span><span><i style="background:#94A3B8"></i>S&amp;P 500 average month</span><span><i style="background:#FFF7E0;border:1px solid #F2D27A"></i>This month</span><span><i style="background:#EEF4FF;border:1px solid #BFD3FF"></i>Next month</span></div>
    ${src('Month-by-month price changes over up to 10 years (Yahoo Finance, adjusted for splits and dividends). Past seasonality does not guarantee future returns', ND.SEA)}`, 'sea-' + s.t);
}

/* ===== 6. Superinvestors & Congress (Institutions and Insiders tabs) ===== */
const actCls = a => /^(Buy|Add)/i.test(a) ? 'up' : /^(Reduce|Sell)/i.test(a) ? 'dn' : '';
function superInv(s) {
  const D = (NX.SI || {})[s.t]; if (!D) return '';
  const [n, pct, hp, R] = D, buys = R.filter(r => /^(Buy|Add)/i.test(r[2])).length, sells = R.filter(r => /^Reduce/i.test(r[2])).length;
  const body = !n ? `<p class="muted" style="margin:6px 0 0">None of the ~80 well-known value and growth investors tracked by Dataroma reported owning ${esc(s.t)} in their latest 13F filing.</p>`
    : `<div class="th-k"><div><span>Superinvestors holding</span><b>${n}</b></div><div><span>Share of all their portfolios</span><b>${esc(pct || '—')}</b></div><div><span>Latest quarter, top 10 holders</span><b><span class="up">${buys} added</span> · <span class="dn">${sells} cut</span></b></div>${hp ? `<div><span>Their average buy price</span><b>${esc(hp)}</b></div>` : ''}</div>
    <div class="tbl-wrap" style="max-height:none"><table class="tw"><thead><tr><th>Investor</th><th class="num">% of their portfolio</th><th>Latest quarter</th><th class="num">Shares</th></tr></thead><tbody>${R.map(r => `<tr><td><b>${esc(r[0])}</b></td><td class="num">${r[1].toFixed(2)}%</td><td><b class="${actCls(r[2])}">${esc(r[2] || 'No change')}</b></td><td class="num">${esc(r[3])}</td></tr>`).join('')}</tbody></table></div>`;
  return card('Superinvestors', 'famous fund managers who own ' + esc(s.t) + ' (13F filings)', body + src('Dataroma, from each fund\'s latest quarterly 13F filing (filed up to 45 days after quarter-end, so it can be months old)', ND.SI), 'si-' + s.t);
}
function congress(s) {
  const D = (NX.CG || {})[s.t]; if (!D) return '';
  const [b, sl, R] = D, net = b > sl ? ['More buying than selling', 'b-up'] : sl > b ? ['More selling than buying', 'b-dn'] : b ? ['Even buying and selling', 'b-am'] : ['No trades in the last year', 'b-gr'];
  const amt = a => String(a || '').replace(/^\((Full|Partial)\)\s*/, '').replace(/^\s*/, '$').replace(/\s*-\s*/, ' – $');
  const body = `<div class="th-k"><div><span>Purchases, last 12 months</span><b class="up">${b}</b></div><div><span>Sales, last 12 months</span><b class="dn">${sl}</b></div><div><span>Signal</span><b><span class="badge ${net[1]}">${net[0]}</span></b></div></div>
    ${R.length ? `<div class="tbl-wrap" style="max-height:none"><table class="tw"><thead><tr><th>Traded</th><th>Member</th><th>Trade</th><th class="num">Amount</th></tr></thead><tbody>${R.map(r => `<tr><td>${dfmt(r[5])}</td><td><b>${esc(r[2])}</b> <span class="muted">${r[3] === 'S' ? 'Senate' : 'House'}${r[4] ? ' · ' + esc(r[4]) : ''}</span></td><td><b class="${r[0] === 'P' ? 'up' : r[0] === 'S' ? 'dn' : ''}">${r[0] === 'P' ? 'Purchase' : r[0] === 'S' ? 'Sale' : 'Exchange'}</b></td><td class="num">${esc(amt(r[1]))}</td></tr>`).join('')}</tbody></table></div>` : ''}`;
  return card('Congress Trades', 'stock trades by members of Congress', body + src('Quiver Quantitative, from STOCK Act disclosures. Members report trades up to 45 days late and only as dollar ranges. Showing the latest trades', ND.CG), 'cg-' + s.t);
}

/* ===== 7. ETFs That Own This (Institutions tab) ===== */
function etfs(s) {
  const D = (NX.ETF || {})[s.t]; if (!D || !D[1] || !D[1].length) return '';
  const [n, R] = D, mx = Math.max(...R.map(r => parseFloat(r[3]) || 0));
  return card('ETFs That Own ' + esc(s.t), 'the funds with the biggest weight in it',
    `<p class="muted" style="margin:0 0 10px;font-size:13.5px">${n ? `<b>${n.toLocaleString()}</b> ETFs hold ${esc(s.t)}. ` : ''}When money flows into or out of these funds, they have to buy or sell ${esc(s.t)}, which can move the price regardless of company news.</p>
    <div class="tbl-wrap" style="max-height:none"><table class="tw"><thead><tr><th>ETF</th><th>Name</th><th class="num">Expense ratio</th><th class="num">${esc(s.t)}'s weight in the fund</th></tr></thead><tbody>${R.map(r => { const w = parseFloat(r[3]) || 0;
      return `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="num">${esc(r[2])}%</td><td class="num"><span class="etf-w"><i style="width:${(w / (mx || 1) * 100).toFixed(0)}%"></i></span><b>${w.toFixed(2)}%</b></td></tr>`; }).join('')}</tbody></table></div>${src('ETF Database (etfdb.com), top holders by weight', ND.ETF)}`, 'etf-' + s.t);
}

/* ===== 8. Saved Screens (Screener) and Pro alerts ===== */
const SKEY = 'tw_screens', rdS = () => { try { return JSON.parse(localStorage.getItem(SKEY) || '[]'); } catch (e) { return []; } }, wrS = a => { try { localStorage.setItem(SKEY, JSON.stringify(a)); } catch (e) {} };
const scrDesc = c => [c.q && '“' + c.q + '”', c.sec, c.trend, c.min ? 'Score ' + c.min + '+' : ''].filter(Boolean).join(' · ') || 'All stocks';
function savedBar() {
  const ph = $('#app > section.sec .wrap'), f = ph && $('.filters', ph); if (!f || $('#scr-saved')) return; const L = rdS();
  f.insertAdjacentHTML('afterend', `<div id="scr-saved"><button type="button" class="btn ghost" id="scr-save">★ Save This Screen</button>
    ${L.length ? `<span class="muted" style="font-size:13px">My screens:</span>${L.map((c, i) => `<span class="scr-chip"><a href="#" data-i="${i}" title="${esc(scrDesc(c))}">${esc(c.name)}</a><button type="button" data-x="${i}" aria-label="Delete">×</button></span>`).join('')}` : `<span class="muted" style="font-size:13px">Set the filters and sort, then save them to come back with one click. Saved in this browser.</span>`}</div>
    ${pro('Screen Alerts', 'Screen Alerts', 'Get an email when a new stock enters one of your saved screens, or when one drops out.', 'Turn On Alerts', 'scr-pro')}`);
  $('#scr-save').onclick = () => { const nm = prompt('Name this screen:', scrDesc(SCR)); if (!nm) return; const a = rdS(); a.push(Object.assign({ name: nm.slice(0, 40), h: location.hash }, SCR)); wrS(a.slice(-12)); const el = $('#scr-saved'); el.nextElementSibling && el.nextElementSibling.id === 'scr-pro' && el.nextElementSibling.remove(); el.remove(); savedBar(); };
  $('#scr-saved').onclick = e => { const x = e.target.closest('[data-x]'), a = e.target.closest('a[data-i]');
    if (x) { const L2 = rdS(); L2.splice(+x.dataset.x, 1); wrS(L2); const el = $('#scr-saved'); $('#scr-pro') && $('#scr-pro').remove(); el.remove(); savedBar(); }
    if (a) { e.preventDefault(); const c = rdS()[+a.dataset.i]; if (!c) return; ['q', 'sec', 'min', 'sort', 'dir', 'trend'].forEach(k => { if (k in c) SCR[k] = c[k]; });
      if (location.hash === c.h || (!c.h && /^#\/screener\/?$/.test(location.hash))) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = c.h || '#/screener'; } };
}
function watchPro() { const w = $('#app > section.sec .wrap'); if (!w || $('#wl-pro')) return; w.insertAdjacentHTML('afterbegin', pro('Watchlist Alerts', 'Watchlist Alerts', 'Email alerts for every stock on your watchlist: score changes, analyst upgrades and downgrades, earnings dates, and price moves past the levels you set.', 'Turn On Alerts', 'wl-pro')); }

/* ===== 9. Pro banners for AI features ===== */
function callPro(t, where, pos) { if (!where || $('#ecall-' + t)) return; where.insertAdjacentHTML(pos || 'afterend', pro('Earnings Call Highlights', 'Earnings Call Highlights: ' + esc(t), `The latest ${esc(t)} earnings call in 5 bullets: guidance, management's tone, the number that mattered, what analysts pushed on, and what management avoided.`, 'Read the Highlights', 'ecall-' + t)); }

/* ===== 10. Pricing Plans page ===== */
const PL = [
  { k: 'free', n: 'Free', p: '$0', per: 'forever', tag: 'Everything you need to research a stock', c: '#0B1B3F', cta: 'Start Free', f: [
    'Tickerwise Score, Smart Score and Zacks Rank for every stock', 'Full stock pages: overview, technicals, earnings, financials, analysts, insiders, institutions', 'Market Heatmap, Markets hub and Market Health score',
    'Stock Screener with 3 saved screens', 'Compare up to 4 stocks side by side', 'Fair Value Estimate, Seasonality, Revenue by Segment', 'Superinvestors, Congress trades and ETF holders', '<b>Paper Trading</b> with $100,000 of virtual money and the public leaderboard', '<b>Social:</b> browse Lead Traders, superinvestors and Congress members', '<b>Insights:</b> all free articles (market wraps, analyst and insider roundups)',
    '<b>1-Page Snapshot</b> report for any stock', '<b>AI chat:</b> 5 questions a month to try it', 'One watchlist, saved in your browser'] },
  { k: 'pro', n: 'Pro', p: '$25', per: 'per month', yr: '$240 a year (save 20%)', tag: 'AI research, social trading and alerts', c: '#7C3AED', cta: 'Join the Pro Waitlist', hot: 1, f: [
    'Everything in Free', '<b>AI chat:</b> 100 questions a month. "Why NVDA over AMD?", "Explain every risk MU is exposed to"', '<b>5-Page Research Report</b> for any stock', 'AI <b>Bull vs Bear</b> and <b>Make the Case</b> matchups',
    '<b>Earnings Previews</b> before every report', '<b>Earnings Call Summaries</b> for the last 4 quarters (1 year back)', '<b>Editor\'s Call</b> and curated news on every stock',
    '<b>Social Trading:</b> follow Lead Traders and see their full portfolios, cost per share, gains and every trade, with instant trade alerts', '<b>All Premium Insights articles:</b> stock deep dives, theme reports, superinvestor and Congress roundups, plus author alerts', '<b>Alerts by email:</b> rating changes, score changes, watchlist and screen alerts', 'Unlimited watchlists and saved screens, synced to your account'] },
  { k: 'premium', n: 'Premium', p: '$100', per: 'per month', yr: '$960 a year (save 20%)', tag: 'Deep research and portfolio tools', c: '#C9A000', cta: 'Join the Premium Waitlist', f: [
    'Everything in Pro', '<b>Social Trading Plus:</b> follow unlimited traders, AI summary of every trade, and how each trader\'s picks score on Tickerwise', '<b>Unlimited AI chat</b>, including questions about your own portfolio', '<b>20-Page Deep-Dive Report</b> for any stock', '<b>Earnings Call Summaries back to 2019</b> (about 25 quarters), with quarter-over-quarter tone tracking',
    '<b>Portfolio X-Ray:</b> link or upload your portfolio for scores, risk and concentration', '<b>Daily portfolio briefing</b> by email before the open', '<b>Tax Planner:</b> gains, losses and harvesting ideas',
    '<b>Options sentiment and expected move</b> for every stock', '<b>Deep Fair Value model:</b> DCF with bull, base and bear cases', 'Export any table to Excel, priority support'] }];
const RPT = [['1-Page Snapshot', 'Free', 'The verdict in one page: Tickerwise Score and what drives it, price vs fair value, analyst target, the three biggest strengths and the three biggest risks, and the next earnings date.'],
  ['5-Page Research Report', 'Pro', 'Everything in the Snapshot, plus: the business and where revenue comes from, growth and margins over 3 years, valuation vs peers and history, the earnings track record, analyst views, insider and fund activity, and a bull and bear case.'],
  ['20-Page Deep Dive', 'Premium', 'Everything in the 5-page report, plus: a full risk map (customers, suppliers, China and tariffs, debt, dilution, competition, regulation), segment-by-segment analysis, management and capital allocation, a DCF with bull, base and bear cases, a peer comparison table, the last 8 earnings calls in summary, and what would change the thesis.']];
const CMP = [['Stock scores and full stock pages', 1, 1, 1], ['Market Heatmap and Markets hub', 1, 1, 1], ['Fair Value Estimate (historical multiples)', 1, 1, 1], ['Seasonality, Segments, Superinvestors, Congress, ETF holders', 1, 1, 1],
  ['AI chat (compare stocks, explain risks, ask anything)', '5 a month', '100 a month', 'Unlimited + your portfolio'], ['Stock research reports', '1-page Snapshot', '5-page Report', '20-page Deep Dive'],
  ['Earnings call summaries', 0, 'Last 4 quarters', 'Back to 2019 (~25 quarters)'], ['Saved screens', '3', 'Unlimited', 'Unlimited'], ['Watchlists', '1 (this browser)', 'Unlimited, synced', 'Unlimited, synced'], ['Compare stocks', 'Up to 4', 'Up to 4 + AI matchup', 'Up to 4 + AI matchup'],
  ['Paper Trading and leaderboard', 1, 1, 1], ['Social: browse traders, superinvestors, Congress', 1, 1, 1], ['Social Trading: follow traders, full portfolios, trade alerts', 0, 'Up to 25 traders', 'Unlimited + AI trade notes'], ['Insights articles', 'Free articles', 'All, incl. Premium', 'All, incl. Premium'], ['Bull vs Bear and Earnings Preview', 0, 1, 1], ['Editor\'s Call and curated news', 0, 1, 1], ['Email alerts', 0, 1, 1],
  ['Portfolio X-Ray and daily briefing', 0, 0, 1], ['Tax Planner', 0, 0, 1], ['Options sentiment and expected move', 0, 0, 1], ['Deep Fair Value model (DCF)', 0, 0, 1], ['Export to Excel', 0, 0, 1]];
function plans() {
  const yes = v => v === 1 ? '<b class="pl-y">✓</b>' : v === 0 ? '<span class="pl-n">—</span>' : `<b>${esc(v)}</b>`;
  app.innerHTML = `<section class="page-h"><div class="wrap"><h1>Plans &amp; Pricing</h1><p>Start free. Upgrade when you want AI research, alerts and portfolio tools.</p></div></section>
  <section class="sec" style="padding-top:22px"><div class="wrap">
    <div class="pl-note"><b>Paid plans aren't live yet.</b> Everything on Tickerwise is free while we build Pro and Premium. Join a waitlist and we'll let you know when they open. Prices may change before launch.</div>
    <div class="pl-g">${PL.map(p => `<div class="pl ${p.hot ? 'hot' : ''}" style="--c:${p.c}">${p.hot ? '<span class="pl-hot">Most popular</span>' : ''}<h3>${p.n}</h3><p class="pl-tag">${p.tag}</p>
      <div class="pl-p"><b>${p.p}</b><span>${p.per}</span></div><p class="pl-yr">${p.yr || '&nbsp;'}</p>
      <button type="button" class="btn ${p.k === 'free' ? 'ghost' : 'primary'} pl-cta" ${p.k === 'free' ? 'data-login="up"' : `data-wait="${p.n}"`}>${p.cta}</button>
      <ul>${p.f.map(x => `<li>${x}</li>`).join('')}</ul></div>`).join('')}</div>
    ${card('Research Reports: What You Get', 'one stock, three depths', `<div class="pl-r">${RPT.map(r => `<div class="pl-rc"><div class="pl-rh"><b>${r[0]}</b><span class="badge ${r[1] === 'Free' ? 'b-up' : 'b-am'}">${r[1]}</span></div><p>${r[2]}</p></div>`).join('')}</div>`)}
    ${card('AI Chat: Ask Anything About A Stock', 'Pro and Premium', `<div class="pl-chat">${['Why would I buy NVDA over AMD right now?', 'Explain every risk MU is exposed to, from biggest to smallest.', 'What changed in ALAB\'s last earnings call versus the one before?', 'Which of my holdings is most exposed to China and tariffs?'].map(q => `<div class="pl-q">💬 ${q}</div>`).join('')}</div><p class="nx-src">Answers use the same data as the stock pages and say where each number comes from. Portfolio questions are Premium.</p>`)}
    ${card('Compare Plans', '', `<div class="tbl-wrap" style="max-height:none"><table class="tw pl-t"><thead><tr><th>Feature</th><th class="num">Free</th><th class="num">Pro</th><th class="num">Premium</th></tr></thead><tbody>${CMP.map(r => `<tr><td>${esc(r[0])}</td><td class="num">${yes(r[1])}</td><td class="num">${yes(r[2])}</td><td class="num">${yes(r[3])}</td></tr>`).join('')}</tbody></table></div>`)}
    <div class="pl-faq">${[['Is Tickerwise financial advice?', 'No. Tickerwise organizes data and AI analysis so you can make your own decisions. Nothing on the site is a recommendation to buy or sell.'],
      ['Where does the data come from?', 'TipRanks, Zacks, Fiscal.ai, stockanalysis.com, Yahoo Finance, MarketBeat, Dataroma, Quiver Quantitative, ETF Database and government sources, refreshed every night.'],
      ['Can I cancel anytime?', 'Yes. When paid plans launch they will be month to month, and you can cancel at any time.']].map(q => `<details><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join('')}</div>
  </div></section>`;
  document.title = 'Plans & Pricing — Tickerwise';
}
document.addEventListener('click', e => { const b = e.target.closest('[data-wait]'); if (!b) return; const m = document.createElement('div'); m.className = 'pro-m';
  m.innerHTML = `<div class="pro-mb" role="dialog" aria-modal="true"><span class="pro-badge" style="margin:0">${LOCK} ${esc(b.dataset.wait.toUpperCase())}</span><h3>Tickerwise ${esc(b.dataset.wait)} is coming soon</h3><p>Paid plans aren't open yet, and no payment is taken. Everything on Tickerwise is free while we build them.</p><small>We'll announce the launch on the site. Prices may change before launch.</small><button type="button">Got it</button></div>`;
  m.onclick = ev => { if (ev.target === m || ev.target.tagName === 'BUTTON') m.remove(); }; document.body.appendChild(m); });
function navLink() { const n = $('#navlinks'); if (n && !$('a[data-r="plans"]', n)) n.insertAdjacentHTML('beforeend', '<a href="#/plans" data-r="plans" class="nav-plans">Plans</a>'); }

/* ===== router hook (after app.js – app4.js) ===== */
function post() {
  const h = location.hash.replace(/^#\/?/, '').split('#')[0], p = h.split('/'), r = p[0] || 'home';
  try {
    navLink(); $$('#navlinks a').forEach(a => { if (a.dataset.r === 'plans') a.classList.toggle('on', r === 'plans'); });
    if (r === 'plans') { plans(); window.scrollTo(0, 0); return; }
    if (r === 'markets') patchMarketsHeat(p[1]);
    if (r === 'home' || r === '') patchHomeHeat();
    if (r === 'screener' && p[1] !== 'earnings') savedBar();
    if (r === 'watchlist') watchPro();
    if (r === 'stock') { const t = decodeURIComponent(p[1] || '').toUpperCase(), s = BY[t], tab = p[2] || 'overview', m = $('.main'); if (!s || !m) return;
      const add = (html, id) => { if (html && !document.getElementById(id)) m.insertAdjacentHTML('beforeend', html); };
      if (tab === 'overview') { const q = $$('.card h3', m).find(h => /Valuation &amp; Cash Flow by Quarter|Valuation & Cash Flow by Quarter/.test(h.innerHTML)), fv = fairValue(s);
        if (fv && !document.getElementById('fv-' + t)) { if (q) q.closest('.card').insertAdjacentHTML('afterend', fv); else m.insertAdjacentHTML('beforeend', fv); }
        const qr = $$('.card h3', m).find(h => /Quarterly Results/.test(h.textContent)); if (qr) callPro(t, qr.closest('.card')); }
      if (tab === 'technicals') add(seasonality(s), 'sea-' + t);
      if (tab === 'financials') add(segments(s), 'seg-' + t);
      if (tab === 'earnings') { const f = $('.card', m); if (f) callPro(t, f, 'beforebegin'); }
      if (tab === 'analysts') { const th = targetHist(s); if (th && !document.getElementById('th-' + t)) { const f = $('.card', m); if (f) f.insertAdjacentHTML('afterend', th); else m.insertAdjacentHTML('beforeend', th); } thBind(t); }
      if (tab === 'institutions') { add(superInv(s), 'si-' + t); add(etfs(s), 'etf-' + t); }
      if (tab === 'insiders') add(congress(s), 'cg-' + t);
    }
  } catch (e) { if (window.console) console.error(e); }
}
window.addEventListener('hashchange', post);
post();
})();
