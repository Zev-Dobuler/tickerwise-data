/* Tickerwise app17: engagement + research features, round 2.
   Stock pages: Why Is It Moving, Bull vs Bear Debate (vote), Stocks Like This, Earnings Reactions, ETFs That Own It, Watchers, Share card, community fair value.
   Pages: Tickerdle, Time Machine, Crash Test, Confluence, Score Changes, Theme Baskets, Pick 5, Academy, Goal Planner, Calls (tracked community calls),
   Calendar export, Stock of the Day, Upgraded Plan teasers. Site-wide: market status bar, Ctrl+K palette, dark mode, Simple Words mode. */
(function () {
if (window.TWR2) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, dfmt } = X, PP = window.TWPP || {}, TW = window.TW || {}, NX = TW.NX || {}, MK = TW.MK || {}, app = $('#app'); if (!app || !esc || !S) return;
const API = 'https://www.wixapis.com', jget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const PC = {}, ser = t => PC[t] || (PC[t] = (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => nz(p.c) && p.c > 0)), last = t => { const z = ser(t); return z[z.length - 1]; };
const iso = d => PP.iso ? PP.iso(d) : new Date(d * 864e5).toISOString().slice(0, 10), dnum = s => Math.round(new Date(s + 'T00:00:00Z') / 864e5);
const closeOn = (t, d) => { const z = ser(t); let v = null; for (let i = z.length - 1; i >= 0; i--) if (z[i].d <= d) { v = z[i]; break; } return v; };
const pct = (v, d = 1) => !nz(v) ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%', usd = (v, d = 2) => !nz(v) ? '—' : (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const gcol = v => v > 0 ? 'up' : v < 0 ? 'dn' : '';
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const head = (t, sub, extra) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p>${extra || ''}</div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const tl = t => BY[t] ? `<a href="#/stock/${esc(t)}"><b>${esc(t)}</b></a>` : `<b>${esc(t)}</b>`;
const UP = '<span class="tw-up">Upgraded Plan</span>';
const lock = (what, extra) => `<div class="tz-lock"><p>${UP} <b>${what}</b> ${extra || 'requires the upgraded plan.'}</p><a class="btn primary" href="#/plans">See Plans</a></div>`;
const toast = h => (window.TWA ? window.TWA.toast(h) : 0);
const member = () => window.TWA && window.TWA.member ? window.TWA.member() : null, nick = () => (member() || {}).nick || 'Member';
const needLogin = () => { const b = document.createElement('a'); b.setAttribute('data-login', 'up'); b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); };
const opts = (a, v) => a.map(x => `<option value="${esc(x[0])}"${x[0] === v ? ' selected' : ''}>${esc(x[1])}</option>`).join('');
const tickOpts = v => opts(S.slice().sort((a, b) => a.t < b.t ? -1 : 1).map(s => [s.t, s.t + ' · ' + (s.n || '')]), v);
const papers = () => (jget('tw_paper', { list: [] }).list || []);
const hsh = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const today = () => new Date().toISOString().slice(0, 10);
const lastD = () => { const z = ser('SPY'); return z.length ? z[z.length - 1].d : null; };
async function tok(write) { if (member() && window.TWA.token) { const t = await window.TWA.token(); if (t) return t; } if (write) return null; return PP.token ? PP.token() : null; }
async function q(coll, filter, limit) { try { const r = await fetch(API + '/wix-data/v2/items/query', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: (await tok()) || '' }, body: JSON.stringify({ dataCollectionId: coll, query: { filter: filter || {}, sort: [{ fieldName: '_createdDate', order: 'DESC' }], cursorPaging: { limit: limit || 100 } } }) }); if (!r.ok) return null; return ((await r.json()).dataItems || []).map(i => Object.assign({ _id: i.id, _at: i.data._createdDate && (i.data._createdDate.$date || i.data._createdDate) }, i.data)); } catch (e) { return null; } }
async function ins(coll, data, silent) { if (!member()) { if (!silent) needLogin(); return null; } const t = await tok(true); if (!t) { if (!silent) needLogin(); return null; } try { const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t }, body: JSON.stringify({ dataCollectionId: coll, dataItem: { data } }) }); if (!r.ok) { if (!silent) toast('Sorry, that did not save. Please try again.'); return null; } return (await r.json()).dataItem; } catch (e) { return null; } }
async function del(coll, id) { const t = await tok(true); if (!t) return; try { await fetch(API + '/wix-data/v2/items/' + id + '?dataCollectionId=' + coll, { method: 'DELETE', headers: { Authorization: t } }); } catch (e) {} }
const NEWS = t => { const N = NX.NEWS || {}, A = N.A || []; return ((N.T || {})[t] || []).map(i => A[i]).filter(Boolean); };
const newsLink = a => 'https://finance.yahoo.com/' + String(a[2] || '').replace(/^\//, '');

const css = document.createElement('style'); css.textContent = `
.tm-cw{position:relative}.tm-tip{position:absolute;display:none;pointer-events:none;background:#0B1B3F;color:#fff;border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.5;z-index:5;max-width:240px;box-shadow:0 6px 20px rgba(11,27,63,.25)}.tm-k{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}.tm-2 p{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:6px 0 0}.tm-2 p+p{border-top:1px dashed var(--line);padding-top:6px}.tm-2 em{font-style:normal;font-size:12px;color:var(--mut);font-weight:600}.tm-2 b{font-size:18px!important;display:inline!important}.tm-2 p+p b{font-size:16px!important}.tm-d{background:#F8FAFF!important;border-color:#C7D7FE!important}.tm-d p+p b{font-size:16px!important}.tm-n.g{background:#64748B}.tm-sb{background:#F8FAFC!important}.tm-vs{font-size:12px;color:var(--mut);margin-top:6px;padding-top:6px;border-top:1px dashed var(--line)}.tm-vs b{display:inline!important;font-size:12.5px!important}.tm-n{display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;border-radius:50%;background:#EF4444;color:#fff;font:800 10px Inter,sans-serif;font-style:normal;margin-right:6px;vertical-align:1px}.r2-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}.r2-k>div{background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;min-width:0}.r2-k span{display:block;font-size:12px;color:var(--mut);font-weight:600}.r2-k b{display:block;font:800 20px 'Space Grotesk',sans-serif;overflow:hidden;text-overflow:ellipsis}
.r2-f{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}.r2-f label{display:flex;flex-direction:column;gap:4px;font:600 12px Inter,sans-serif;color:var(--mut);flex:1 1 140px;min-width:0}
.r2-f input,.r2-f select{padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;background:#fff;color:#0B1B3F;min-width:0;width:100%;box-sizing:border-box}
.r2-t{width:100%;border-collapse:collapse;font-size:14px}.r2-t th{text-align:left;font:700 12px Inter,sans-serif;color:var(--mut);padding:8px;border-bottom:1.5px solid var(--line);white-space:nowrap}.r2-t td{padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:middle}.r2-t .n{text-align:right;white-space:nowrap}
.r2-sc{overflow-x:auto;-webkit-overflow-scrolling:touch}
.r2-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}.r2-2>div{min-width:0}
.r2-li{margin:0;padding-left:18px;line-height:1.65;font-size:14.5px}.r2-li li+li{margin-top:4px}
.r2-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font:700 12px Inter,sans-serif;background:#F1F5F9;color:#0B1B3F}
.r2-sim{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.r2-sim a{display:block;border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;text-decoration:none;color:#0B1B3F;background:#fff}.r2-sim a:hover{border-color:#2F6BFF}.r2-sim b{font:800 16px 'Space Grotesk',sans-serif}.r2-sim span{display:block;font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r2-rx{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px}.r2-rx>div{border-radius:12px;padding:10px;text-align:center;color:#fff;font-size:12px}.r2-rx b{display:block;font:800 18px 'Space Grotesk',sans-serif}
.r2-vb{display:flex;height:16px;border-radius:999px;overflow:hidden;background:#F1F5F9;margin:8px 0}.r2-vb i{display:block;height:100%}
.r2-tile{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin:12px 0}.r2-tile div{aspect-ratio:1/1;border-radius:10px;display:grid;place-items:center;font:800 14px Inter,sans-serif;color:#fff;background:#CBD5E1}
.r2-clue{display:flex;gap:10px;align-items:center;padding:10px 12px;border:1.5px solid var(--line);border-radius:12px;background:#fff;font-size:14.5px}.r2-clue+.r2-clue{margin-top:8px}.r2-clue i{font-style:normal;font-size:18px}
.r2-clue.lock{color:#94A3B8;background:#F8FAFC;border-style:dashed}
.r2-stat{position:relative;z-index:30;background:#0B1B3F;color:#CBD5E1;font:600 12.5px Inter,sans-serif}.r2-stat .wrap{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding-top:6px;padding-bottom:6px}.r2-stat b{color:#fff}.r2-stat .dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:middle}
.r2-stat a{color:#93C5FD;text-decoration:none}.r2-stat .sp{flex:1}.r2-stat button{background:none;border:1px solid rgba(255,255,255,.25);color:#fff;border-radius:999px;padding:3px 10px;font:600 12px Inter,sans-serif;cursor:pointer}
@media(max-width:640px){.r2-2{grid-template-columns:1fr}.r2-hm{display:none!important}.r2-stat .wrap{gap:8px;font-size:12px}}
.r2-pal{position:fixed;inset:0;z-index:1100;background:rgba(7,19,52,.45);backdrop-filter:blur(3px);display:flex;justify-content:center;align-items:flex-start;padding:10vh 12px 12px}
.r2-pal>div{background:#fff;border-radius:18px;width:100%;max-width:620px;box-shadow:0 40px 80px rgba(0,0,0,.35);overflow:hidden}
.r2-pal input{width:100%;box-sizing:border-box;border:0;border-bottom:1.5px solid var(--line);padding:18px 20px;font:500 18px Inter,sans-serif;outline:none}
.r2-pal ul{list-style:none;margin:0;padding:6px;max-height:55vh;overflow:auto}.r2-pal li{display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:14.5px}.r2-pal li.on{background:#EFF6FF}.r2-pal li small{margin-left:auto;color:#94A3B8;font-size:12px}
.r2-pal .ft{padding:8px 14px;border-top:1px solid var(--line);font-size:12px;color:#94A3B8}
html.r2-dark{filter:invert(1) hue-rotate(180deg);background:#fff}html.r2-dark img,html.r2-dark video,html.r2-dark canvas,html.r2-dark iframe,html.r2-dark .r2-keep{filter:invert(1) hue-rotate(180deg)}
.r2-eli{border-bottom:1.5px dotted #7C3AED;cursor:help}.r2-eli-x{display:inline;font-size:.86em;color:#6D28D9;background:#F5F3FF;border-radius:6px;padding:0 5px;margin-left:3px;font-weight:600}
.r2-cert{max-width:100%;border-radius:12px;border:1.5px solid var(--line)}
.r2-quiz label{display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;margin:6px 0;cursor:pointer;font-size:14px}.r2-quiz label.ok{border-color:#10B981;background:#ECFDF5}.r2-quiz label.no{border-color:#EF4444;background:#FEF2F2}
`; document.head.appendChild(css);

/* =================== STOCK PAGE CARDS =================== */
function dayMove(t) { const z = ser(t), a = z[z.length - 1], b = z[z.length - 2]; return a && b ? { c: a.c, ch: (a.c / b.c - 1) * 100, d: a.d, v: a.v, av: z.slice(-51, -1).reduce((s, p) => s + (p.v || 0), 0) / Math.min(50, z.length - 1) } : null; }
function whyMoving(t) {
  const s = BY[t], m = dayMove(t); if (!s || !m) return ''; const z = ser(t), w = z.length > 5 ? (m.c / z[z.length - 6].c - 1) * 100 : null, R = [], E = s.earn || {}, A = (TW.AN || {})[t], I = ((TW.X || {})[t] || {}).i, CG = (NX.CG || {})[t];
  const h = (E.h || [])[0]; if (h && h.d && dnum(h.d) >= m.d - 7) R.push(`📊 Reported ${esc(h.q)} earnings on ${esc(dfmt(h.d))}: EPS ${usd(h.e)} vs ${usd(h.ee)} expected (${h.e >= h.ee ? 'a beat' : 'a miss'}).`);
  if (E.next) { const dd = dnum(E.next) - m.d; if (dd >= 0 && dd <= 10) R.push(`📅 Earnings due ${esc(dfmt(E.next))}, ${dd ? dd + ' day' + (dd === 1 ? '' : 's') + ' away' : 'today'}: moves often get bigger before a report.`); }
  if (A && A[10]) A[10].filter(r => dnum(r[5]) >= m.d - 7).slice(0, 2).forEach(r => R.push(`🏦 ${esc(r[0])} ${esc(r[3])} a ${esc(r[2])} rating${r[4] ? ' with a $' + r[4] + ' target' : ''} (${esc(dfmt(r[5]))}).`));
  NEWS(t).filter(a => a[3] * 1000 > Date.now() - 4 * 864e5).slice(0, 2).forEach(a => R.push(`📰 <a href="${esc(newsLink(a))}" target="_blank" rel="noopener nofollow">${esc(a[0])}</a> <span class="muted">· ${esc(a[1])}</span>`));
  if (m.av && m.v > 1.8 * m.av) R.push(`🔊 Volume was ${(m.v / m.av).toFixed(1)}× its 50-day average, so big money was moving.`);
  const sp = dayMove('SPY'); if (sp && Math.abs(sp.ch) > 1 && Math.sign(sp.ch) === Math.sign(m.ch)) R.push(`🌍 The whole market moved too: the S&P 500 was ${pct(sp.ch)} on the day${s.beta ? `, and ${esc(t)} usually moves about ${s.beta.toFixed(1)}× the market` : ''}.`);
  if (I && I[5] && I[5][0] && dnum(I[5][0][4]) >= m.d - 14) R.push(`👔 Insider ${esc(I[5][0][0])} (${esc(I[5][0][1])}) ${I[5][0][2] === 'P' || I[5][0][2] === 'B' ? 'bought' : 'sold'} shares on ${esc(dfmt(I[5][0][4]))}.`);
  if (CG && CG[2] && CG[2][0] && dnum(CG[2][0][5]) >= m.d - 30) R.push(`🏛️ ${esc(CG[2][0][2])} disclosed a ${CG[2][0][0] === 'P' ? 'purchase' : 'sale'} (${esc(CG[2][0][1])}) on ${esc(dfmt(CG[2][0][5]))}.`);
  if (s.tech && nz(s.tech.rsi)) { if (s.tech.rsi >= 70) R.push(`🔥 RSI is ${Math.round(s.tech.rsi)}: overbought, so pullbacks are common.`); else if (s.tech.rsi <= 30) R.push(`🧊 RSI is ${Math.round(s.tech.rsi)}: oversold, so bounces are common.`); }
  if (!R.length) R.push('No single company event stands out. The move looks driven by the market, its sector, or normal day-to-day trading.');
  return card('Why Is It Moving?', 'built from today\'s data', `<p style="margin:0 0 10px;font-size:15.5px"><b>${esc(t)} ${m.ch >= 0 ? 'rose' : 'fell'} <span class="${gcol(m.ch)}">${pct(m.ch)}</span></b> on ${esc(dfmt(iso(m.d)))}${nz(w) ? `, <span class="${gcol(w)}">${pct(w)}</span> over 5 days` : ''}. What's going on:</p><ul class="r2-li">${R.slice(0, 6).map(x => `<li>${x}</li>`).join('')}</ul>`, 'r2-why');
}
function debate(t) {
  const s = BY[t]; if (!s) return ''; const P = s.P || {}, T = s.tech || {}, E = s.earn || {}, V = s.val || {}, M = s.mg || {}, A = (TW.AN || {})[t], bull = [], bear = [];
  const add = (c, a, b) => (c ? bull : bear).push(c ? a : b);
  if (nz(P.g)) add(P.g >= 60, `Growth pillar is ${P.g}/100: the business is expanding.`, `Growth pillar is only ${P.g}/100.`);
  if (nz(P.p)) add(P.p >= 60, `Profitability is ${P.p}/100${nz(M.net) ? `, with a ${Math.round(M.net)}% net margin` : ''}.`, `Profitability is weak (${P.p}/100)${nz(M.net) ? `, net margin ${Math.round(M.net)}%` : ''}.`);
  if (nz(E.l8)) add(E.l8 >= 62, `Beat estimates in ${E.l8}% of the last 8 quarters.`, `Beat estimates in only ${E.l8}% of the last 8 quarters.`);
  if (nz(T.v200)) add(T.v200 >= 0, `Trading ${pct(T.v200, 0)} above its 200-day average: the long-term trend is up.`, `Trading ${pct(T.v200, 0)} vs its 200-day average: the long-term trend is down.`);
  if (nz(V.fpe) && V.fpe > 0) add(V.fpe < 25, `Forward P/E of ${V.fpe.toFixed(0)}x is reasonable.`, `Forward P/E of ${V.fpe.toFixed(0)}x prices in a lot of success.`);
  if (nz(V.peg) && V.peg > 0) add(V.peg < 1.5, `PEG of ${V.peg.toFixed(1)}: growth looks cheap for its pace.`, `PEG of ${V.peg.toFixed(1)}: you pay a premium for the growth.`);
  const lp = last(t); if (A && nz(A[0]) && lp) { const up = (A[0] / lp.c - 1) * 100; add(up > 10, `Analysts' average target is ${usd(A[0], 0)}, ${pct(up, 0)} above the price (${esc(A[7] || '')}).`, `Analysts' average target of ${usd(A[0], 0)} leaves little upside (${pct(up, 0)}).`); }
  if (nz(P.b)) add(P.b >= 60, `Balance sheet is solid (${P.b}/100).`, `Balance sheet is a concern (${P.b}/100).`);
  if (nz(s.beta)) if (s.beta > 1.6) bear.push(`Beta of ${s.beta.toFixed(1)}: expect big swings in both directions.`);
  return card('Bull vs Bear Debate', 'both sides, from the data · then you vote', `<div class="r2-2"><div><b style="color:#047857">🐂 The bull case</b><ul class="r2-li">${(bull.length ? bull : ['Few clear positives in the data right now.']).slice(0, 5).map(x => `<li>${x}</li>`).join('')}</ul></div><div><b style="color:#B91C1C">🐻 The bear case</b><ul class="r2-li">${(bear.length ? bear : ['Few clear negatives in the data right now.']).slice(0, 5).map(x => `<li>${x}</li>`).join('')}</ul></div></div><div id="r2-dv" style="margin-top:12px"></div>`, 'r2-deb');
}
async function debateVote(t) {
  const box = $('#r2-dv'); if (!box) return; const k = 'deb:' + t, me = jget('tw_votes', {})[k], L = await q('PollVotes', { t: { $eq: t }, wk: { $eq: 'debate' } }, 1000);
  const b = (L || []).filter(x => x.vote === 'bull').length, n = (L || []).length, sh = n ? Math.round(b / n * 100) : 50;
  box.innerHTML = me ? `<b>Who won?</b> <span class="muted" style="font-size:13px">${n} vote${n === 1 ? '' : 's'} · you picked ${me === 'bull' ? '🐂 Bulls' : '🐻 Bears'}</span><div class="r2-vb"><i style="width:${sh}%;background:#10B981"></i><i style="width:${100 - sh}%;background:#EF4444"></i></div><span class="muted" style="font-size:13px">🐂 ${sh}% · 🐻 ${100 - sh}%</span>`
    : `<b>Who wins the debate?</b> <button class="btn ghost" data-dv="bull">🐂 Bulls</button> <button class="btn ghost" data-dv="bear">🐻 Bears</button>`;
  $$('[data-dv]', box).forEach(x => x.onclick = async () => { const l = last(t); if (await ins('PollVotes', { t, vote: x.dataset.dv, wk: 'debate', px: l ? l.c : null })) { const V = jget('tw_votes', {}); V[k] = x.dataset.dv; jset('tw_votes', V); debateVote(t); } });
}
function similar(t) {
  const s = BY[t]; if (!s || !s.P) return ''; const v = x => [x.P.m, x.P.e, x.P.g, x.P.p, x.P.b].map(n => n || 0);
  const a = v(s), L = S.filter(x => x !== s && x.P).map(x => { const b = v(x); let d = Math.sqrt(a.reduce((acc, n, i) => acc + (n - b[i]) ** 2, 0)); if (x.sec === s.sec) d *= .75; return [x, d]; }).sort((p, q) => p[1] - q[1]).slice(0, 6);
  return card('Stocks Like This', `same score shape as ${esc(t)}${s.sec ? ' · same-sector matches ranked higher' : ''}`, `<div class="r2-sim">${L.map(([x, d]) => `<a href="#/stock/${esc(x.t)}"><b>${esc(x.t)}</b> <span class="r2-pill" style="float:right">${x.ws != null ? x.ws : '—'}/10</span><span>${esc(x.n || '')}</span><span>${Math.max(0, Math.round(100 - d / 2.24))}% match · ${esc(x.sec || '')}</span></a>`).join('')}</div>`, 'r2-sim');
}
function reactions(t) {
  const s = BY[t], H = ((s || {}).earn || {}).h || []; const L = H.slice(0, 8).map(h => { const d = h.d && dnum(h.d); if (!d) return null; const b = closeOn(t, d - 1), z = ser(t), a = z.find(p => p.d > d); if (!b || !a) return null; return { q: h.q, d: h.d, m: (a.c / b.c - 1) * 100, beat: h.e >= h.ee }; }).filter(Boolean);
  if (!L.length) return ''; const avg = L.reduce((x, r) => x + Math.abs(r.m), 0) / L.length, up = L.filter(r => r.m > 0).length;
  const bg = m => m >= 0 ? `rgba(16,185,129,${Math.min(1, .35 + Math.abs(m) / 15)})` : `rgba(239,68,68,${Math.min(1, .35 + Math.abs(m) / 15)})`;
  return card('Earnings Reactions', `how ${esc(t)} moved after its last ${L.length} reports`, `<div class="r2-rx">${L.map(r => `<div style="background:${bg(r.m)}" title="Close before the report to the first close after"><span>${esc(r.q)}</span><b>${pct(r.m)}</b><span>${r.beat ? 'beat' : 'miss'} · ${esc(dfmt(r.d))}</span></div>`).join('')}</div><p class="muted" style="margin:10px 0 0;font-size:13px">Average move: <b>±${avg.toFixed(1)}%</b> · rose after ${up} of ${L.length} reports. Measured from the close before the report to the first close after it.</p>`, 'r2-rx');
}
function etfs(t) { const E = (NX.ETF || {})[t]; if (!E || !E[1] || !E[1].length) return ''; return card('ETFs That Own It', `${E[0].toLocaleString()} ETFs hold ${esc(t)} · top ${Math.min(10, E[1].length)} by weight`, `<div class="r2-sc"><table class="r2-t"><tr><th>ETF</th><th class="r2-hm">Name</th><th class="n">Weight</th><th class="n">Fee</th></tr>${E[1].slice(0, 10).map(r => `<tr><td><b>${esc(r[0])}</b></td><td class="r2-hm muted">${esc(r[1])}</td><td class="n"><b>${esc(r[3])}%</b></td><td class="n">${esc(r[2])}%</td></tr>`).join('')}</table></div>`, 'r2-etf'); }
async function watchers(t) {
  const h = $('.main') || app; if ($('#r2-wch')) return; const L = await q('Watchers', { t: { $eq: t } }, 1000); if (L == null || $('#r2-wch')) return;
  const n = new Set(L.map(x => x.nick + '|' + (x.mid || ''))).size, el = document.createElement('div'); el.id = 'r2-wch'; el.style.cssText = 'margin:0 0 4px;font-size:14px';
  el.innerHTML = `<span class="r2-pill">👀 ${n.toLocaleString()} member${n === 1 ? '' : 's'} watching ${esc(t)}</span> <button class="btn ghost" id="r2-sh" style="padding:6px 12px;font-size:13px">📤 Share</button>`; h.prepend(el); $('#r2-sh').onclick = () => share(t);
}
/* keep the public Watchers collection in step with the member's watchlist */
let WSY = 0; async function syncWatchers() { const m = member(); if (!m || WSY) return; WSY = 1; try { const W = jget('tw-watchlist', []), L = await q('Watchers', { mid: { $eq: m.id || '' } }, 500); if (L == null) return; const have = new Set(L.map(x => x.t));
  for (const t of W) if (!have.has(t)) await ins('Watchers', { t, nick: m.nick || '', mid: m.id || '' }, true); for (const x of L) if (!W.includes(x.t)) await del('Watchers', x._id); } finally { WSY = 0; } }
async function share(t) {
  const s = BY[t], l = last(t), c = document.createElement('canvas'); c.width = 1080; c.height = 1080; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 1080, 1080); gr.addColorStop(0, '#0B1B3F'); gr.addColorStop(1, '#1E3A8A'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1080);
  g.fillStyle = '#fff'; g.font = '800 120px Inter, sans-serif'; g.fillText(t, 80, 220); g.font = '500 40px Inter, sans-serif'; g.fillStyle = '#93C5FD'; g.fillText((s.n || '').slice(0, 40), 80, 285);
  if (l) { g.fillStyle = '#fff'; g.font = '700 64px Inter, sans-serif'; g.fillText(usd(l.c), 80, 390); }
  g.beginPath(); g.arc(840, 220, 130, 0, Math.PI * 2); g.lineWidth = 26; g.strokeStyle = 'rgba(255,255,255,.15)'; g.stroke(); g.beginPath(); g.arc(840, 220, 130, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (s.ws || 0) / 10); g.strokeStyle = '#00C176'; g.stroke();
  g.fillStyle = '#fff'; g.font = '800 110px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(String(s.ws != null ? s.ws : '—'), 840, 255); g.font = '600 30px Inter'; g.fillText('of 10', 840, 300); g.textAlign = 'left';
  const P = s.P || {}; [['Momentum', P.m], ['Earnings', P.e], ['Growth', P.g], ['Profitability', P.p], ['Financial Health', P.b]].forEach(([n, v], i) => { const y = 500 + i * 92; g.fillStyle = '#CBD5E1'; g.font = '600 36px Inter'; g.fillText(n, 80, y); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(430, y - 28, 480, 26); g.fillStyle = '#2F6BFF'; g.fillRect(430, y - 28, 4.8 * (v || 0), 26); g.fillStyle = '#fff'; g.font = '800 36px Inter'; g.fillText(String(v != null ? v : '—'), 940, y); });
  g.fillStyle = '#00C176'; g.font = '800 44px Inter'; g.fillText('Tickerwise', 80, 1010); g.fillStyle = '#94A3B8'; g.font = '500 28px Inter'; g.fillText('Stop guessing. Start knowing.', 360, 1008);
  const url = location.origin + location.pathname + '#/stock/' + t, text = `${t} scores ${s.ws}/10 on Tickerwise. See why: ${url}`;
  c.toBlob(async b => { try { const f = new File([b], t + '-tickerwise.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text }); return; } } catch (e) {}
    const o = document.createElement('div'); o.className = 'ai-ov'; o.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(7,19,52,.55);display:grid;place-items:center;padding:16px';
    o.innerHTML = `<div style="background:#fff;border-radius:20px;padding:18px;max-width:420px;width:100%"><img src="${URL.createObjectURL(b)}" alt="" style="width:100%;border-radius:12px"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn primary" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">WhatsApp</a><a class="btn ghost" download="${t}-tickerwise.png" href="${URL.createObjectURL(b)}">Save Image</a><button class="btn ghost" id="r2-cl">Close</button></div></div>`;
    document.body.appendChild(o); $('#r2-cl', o).onclick = () => o.remove(); o.onclick = e => { if (e.target === o) o.remove(); }; }, 'image/png');
}
async function fvCommunity(t) {
  const L = await q('CommunityPosts', { t: { $eq: t }, kind: { $eq: 'fv' } }, 200); if (!L || !L.length) return null; const v = L.map(x => { try { return JSON.parse(x.text).fv; } catch (e) { return null; } }).filter(x => x > 0).sort((a, b) => a - b); if (!v.length) return null;
  return { n: v.length, med: v[Math.floor(v.length / 2)], avg: v.reduce((a, b) => a + b, 0) / v.length, lo: v[0], hi: v[v.length - 1], L };
}
async function stockCards(t) {
  const m = $('.main'); if (!m || $('#r2-why', m)) return; const anchor = $('#tt-rc', m);
  const html = whyMoving(t) + debate(t) + reactions(t) + similar(t) + etfs(t) + `<div id="r2-fvc"></div>` + card('Prediction Markets', 'odds of an earnings beat', lock('Live prediction-market odds (Kalshi, Polymarket) for ' + esc(t) + '\'s next report', 'require the upgraded plan.'), 'r2-pm');
  const box = document.createElement('div'); box.style.cssText = 'display:flex;flex-direction:column;gap:18px'; box.innerHTML = html; anchor ? anchor.after(box) : m.appendChild(box);
  debateVote(t); watchers(t); const f = await fvCommunity(t), l = last(t); const fb = $('#r2-fvc'); if (fb && f && l) fb.outerHTML = card('Community Fair Value', `${f.n} member estimate${f.n === 1 ? '' : 's'}`, `<div class="r2-k"><div><span>Median fair value</span><b>${usd(f.med)}</b></div><div><span>vs last close</span><b class="${gcol(f.med / l.c - 1)}">${pct((f.med / l.c - 1) * 100)}</b></div><div><span>Range</span><b style="font-size:15px">${usd(f.lo, 0)} – ${usd(f.hi, 0)}</b></div></div><p style="margin:10px 0 0"><a href="#/fairvalue/${esc(t)}">Add your own estimate →</a></p>`);
  else if (fb) fb.remove();
}

/* =================== TICKERDLE =================== */
const TDP = () => S.filter(s => ser(s.t).length > 250 && s.n);
function tdAnswer() { const L = TDP(), h = hsh('tdl' + today()); return L[h % L.length]; }
function tickerdle() {
  const A = tdAnswer(), st = jget('tw_tdl', {}), g = st[today()] || { g: [], done: 0 }, n = g.g.length, won = g.g.includes(A.t), over = won || n >= 6, z = ser(A.t).slice(-252), ret = z.length ? (z[z.length - 1].c / z[0].c - 1) * 100 : null;
  const cap = A.mc || (BY[A.t] || {}).mc, capB = nz(cap) ? (cap >= 2e11 ? 'Mega cap (over $200B)' : cap >= 1e10 ? 'Large cap ($10B–$200B)' : cap >= 2e9 ? 'Mid cap ($2B–$10B)' : 'Small cap (under $2B)') : null;
  const clues = [['🏭', 'Sector', esc(A.sec || '—')], ['📈', '1-year return', `<b class="${gcol(ret)}">${pct(ret, 0)}</b>`], ['⭐', 'Tickerwise Score', `${A.ws}/10`], ['🧩', 'Industry', esc(A.th || A.sec || '—')], ['💰', capB ? 'Size' : 'Profitability', capB || ((A.P || {}).p != null ? A.P.p + '/100' : '—')], ['🔤', 'Ticker starts with', `<b>${esc(A.t[0])}</b> and has ${A.t.length} letters`]];
  const W = z.length ? 600 : 0, mn = Math.min(...z.map(p => p.c)), mx = Math.max(...z.map(p => p.c)), path = z.map((p, i) => (i ? 'L' : 'M') + (i / (z.length - 1) * W).toFixed(1) + ' ' + (110 - (p.c - mn) / (mx - mn || 1) * 100).toFixed(1)).join('');
  const stats = Object.values(st), wins = stats.filter(x => x.win).length;
  app.innerHTML = head('Tickerdle', 'Guess today\'s mystery stock in 6 tries. Every wrong guess unlocks a new clue. A new stock every day.') + wrap(`
    ${card('Mystery Stock #' + (dnum(today()) - dnum('2026-11-21')), `${n}/6 guesses`, `<svg viewBox="0 0 600 115" width="100%" height="115" preserveAspectRatio="none" style="display:block;margin-bottom:10px"><path d="${path}" fill="none" stroke="${ret >= 0 ? '#10B981' : '#EF4444'}" stroke-width="2.5"/></svg><p class="muted" style="margin:0 0 12px;font-size:13px">The last 12 months of its price (no axis, no names).</p>
      ${clues.map((c, i) => i <= n || over ? `<div class="r2-clue"><i>${c[0]}</i><span class="muted" style="min-width:120px">${c[1]}</span><span>${c[2]}</span></div>` : `<div class="r2-clue lock"><i>🔒</i>Clue ${i + 1} unlocks after guess ${i}</div>`).join('')}
      <div class="r2-tile">${[0, 1, 2, 3, 4, 5].map(i => `<div style="background:${g.g[i] ? (g.g[i] === A.t ? '#10B981' : '#EF4444') : '#E2E8F0'}">${esc(g.g[i] || '')}</div>`).join('')}</div>
      ${over ? `<div class="tz-lock" style="border-color:${won ? '#10B981' : '#EF4444'}"><p>${won ? `🎉 <b>You got it in ${g.g.indexOf(A.t) + 1}!</b>` : '😅 <b>Out of guesses.</b>'} It was ${tl(A.t)}, ${esc(A.n)}.</p><button class="btn primary" id="r2-tds">Share Result</button></div>`
      : `<form class="r2-f" id="r2-tdf"><label style="flex:1 1 220px">Your guess<input name="g" list="r2-tdl" autocomplete="off" placeholder="Type a ticker or company" required></label><button class="btn primary">Guess</button></form><datalist id="r2-tdl">${S.map(s => `<option value="${esc(s.t)}">${esc(s.n || '')}</option>`).join('')}</datalist>`}`)}
    ${card('Your Stats', '', `<div class="r2-k"><div><span>Played</span><b>${stats.length}</b></div><div><span>Won</span><b>${wins}</b></div><div><span>Win rate</span><b>${stats.length ? Math.round(wins / stats.length * 100) : 0}%</b></div></div>`)}`);
  document.title = 'Tickerdle — Tickerwise';
  const f = $('#r2-tdf'); if (f) f.onsubmit = e => { e.preventDefault(); let v = f.g.value.trim().toUpperCase(); const byN = S.find(s => (s.n || '').toUpperCase() === v); if (byN) v = byN.t; if (!BY[v]) { toast('Pick a stock we cover from the list.'); return; } if (g.g.includes(v)) return; g.g.push(v); if (v === A.t) g.win = 1; st[today()] = g; jset('tw_tdl', st); tickerdle(); };
  const sh = $('#r2-tds'); if (sh) sh.onclick = () => { const txt = `Tickerdle ${today()} ${won ? g.g.indexOf(A.t) + 1 : 'X'}/6\n${g.g.map(x => x === A.t ? '🟩' : '🟥').join('')}\n${location.origin + location.pathname}#/tickerdle`; if (navigator.share) navigator.share({ text: txt }).catch(() => {}); else { try { navigator.clipboard.writeText(txt); } catch (e) {} toast('✓ Result copied'); } };
}

/* =================== TIME MACHINE =================== */
function sparkSVG(series, H = 160) { const all = series.flatMap(s => s.v), mn = Math.min(...all), mx = Math.max(...all), W = 600, n = series[0].v.length; const Y = v => (H - 8 - (v - mn) / (mx - mn || 1) * (H - 16)).toFixed(1);
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none">${series.map(s => `<path d="${s.v.map((v, i) => (i ? 'L' : 'M') + (i / (n - 1) * W).toFixed(1) + ' ' + Y(v)).join('')}" fill="none" stroke="${s.c}" stroke-width="${s.w || 2.5}"${s.dash ? ' stroke-dasharray="6 5"' : ''}/>`).join('')}</svg>`; }
function tmDD(z) { const DR = []; let ep = { p: z[0], lo: z[0] }; z.forEach(q => { if (q.c >= ep.p.c) { if (ep.lo.c < ep.p.c) DR.push({ p: ep.p, lo: ep.lo, rec: q }); ep = { p: q, lo: q }; } else if (q.c < ep.lo.c) ep.lo = q; });
  if (ep.lo.c < ep.p.c) DR.push({ p: ep.p, lo: ep.lo, rec: null }); return DR.map(x => Object.assign(x, { pc: (x.lo.c / x.p.c - 1) * 100 })).filter(x => x.pc <= -5).sort((x, y) => x.pc - y.pc).slice(0, 4); }
const TM = { W: 1000, H: 300, L: 52, R: 12, T: 14, B: 30 };
function tmChart(t, z, b, s0, D4, SD4) { const { W, H, L, R, T, B } = TM, d0 = z[0].d, d1 = z[z.length - 1].d;
  const P = z.map(p => { const s = closeOn('SPY', p.d); return { d: p.d, c: p.c, y: (p.c / b.c - 1) * 100, s: s && s0 ? (s.c / s0.c - 1) * 100 : null }; }); window.__tmP = P;
  const all = P.flatMap(p => p.s == null ? [p.y] : [p.y, p.s]); let mn = Math.min(0, ...all), mx = Math.max(0, ...all); const pad = (mx - mn) * .06 || 5; mn -= pad; mx += pad;
  const X = d => L + (d - d0) / (d1 - d0 || 1) * (W - L - R), Y = v => T + (mx - v) / (mx - mn) * (H - T - B); window.__tmXY = { X, Y, d0, d1 };
  const stp = (() => { const r = mx - mn, c = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]; return c.find(x => r / x <= 6) || 10000; })();
  let g = ''; for (let v = Math.ceil(mn / stp) * stp; v <= mx; v += stp) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" stroke="${v === 0 ? '#94A3B8' : '#E2E8F0'}" stroke-width="1"${v === 0 ? ' stroke-dasharray="4 4"' : ''}/><text x="${L - 6}" y="${(Y(v) + 4).toFixed(1)}" font-size="11" fill="#64748B" text-anchor="end">${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}%</text>`;
  /* date axis: years for long spans, months otherwise */
  const D = x => new Date(iso(x) + 'T00:00:00Z'), M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], yrs = (d1 - d0) / 365.25;
  const mstep = yrs > 6 ? 24 : yrs > 2.5 ? 12 : yrs > 1.2 ? 6 : yrs > .5 ? 3 : 1; let ax = ''; const st = D(d0); let y = st.getUTCFullYear(), m = Math.ceil((st.getUTCMonth() + (st.getUTCDate() > 1 ? 1 : 0)) / mstep) * mstep;
  for (let k = 0; k < 40; k++) { while (m >= 12) { m -= 12; y++; } const dd = dnum(`${y}-${String(m + 1).padStart(2, '0')}-01`); if (dd > d1) break; if (dd >= d0) { const x = X(dd); ax += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${T}" y2="${H - B}" stroke="#F1F5F9"/><text x="${x.toFixed(1)}" y="${H - B + 17}" font-size="11" fill="#64748B" text-anchor="middle">${mstep >= 12 ? y : M[m] + ' ' + String(y).slice(2)}</text>`; } m += mstep; }
  ax += `<text x="${L}" y="${H - 1}" font-size="10.5" fill="#94A3B8">${esc(dfmt(iso(d0)))}</text><text x="${W - R}" y="${H - 1}" font-size="10.5" fill="#94A3B8" text-anchor="end">${esc(dfmt(iso(d1)))}</text>`;
  /* drops: shaded from the high to the low, numbered dots at both ends */
  const yAt = d => { const p = P.find(q => q.d === d); return p ? Y(p.y) : 0; };
  const dr = D4.map((x, i) => { const x1 = X(x.p.d), x2 = X(x.lo.d), y1 = yAt(x.p.d), y2 = yAt(x.lo.d), dot = (cx, cy, lb) => `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="8" fill="#EF4444" stroke="#fff" stroke-width="2"/><text x="${cx.toFixed(1)}" y="${(cy + 3.5).toFixed(1)}" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">${lb}</text>`;
    return `<rect x="${x1.toFixed(1)}" y="${T}" width="${Math.max(2, x2 - x1).toFixed(1)}" height="${H - T - B}" fill="rgba(239,68,68,.09)"/><text x="${Math.min(W - R - 22, Math.max(L + 22, (x1 + x2) / 2)).toFixed(1)}" y="${H - B - 6}" font-size="11" font-weight="800" fill="#DC2626" text-anchor="middle">${pct(x.pc, 0)}</text>` + dot(x1, y1, i + 1) + dot(x2, y2, i + 1); }).join('');
  const sAt = d => { const u = closeOn('SPY', d); return u && s0 ? Y((u.c / s0.c - 1) * 100) : null; };
  const sd = (SD4 || []).map((x, i) => [x.p.d, x.lo.d].map(d => { const cy = sAt(d); return cy == null ? '' : `<circle cx="${X(d).toFixed(1)}" cy="${cy.toFixed(1)}" r="7" fill="#64748B" stroke="#fff" stroke-width="2"/><text x="${X(d).toFixed(1)}" y="${(cy + 3.2).toFixed(1)}" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">${i + 1}</text>`; }).join('')).join('');
  const path = k => P.filter(p => p[k] != null).map((p, i) => (i ? 'L' : 'M') + X(p.d).toFixed(1) + ' ' + Y(p[k]).toFixed(1)).join('');
  return `<svg class="tm-svg" viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible;touch-action:pan-y">${g}${ax}${dr.replace(/<circle[\s\S]*?<\/text>/g, '')}<path d="${path('s')}" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 5"/><path d="${path('y')}" fill="none" stroke="#2F6BFF" stroke-width="2.5"/>${sd}${(dr.match(/<circle[\s\S]*?<\/text>/g) || []).join('')}<line class="tm-x" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="#0B1B3F" stroke-width="1" opacity="0"/><circle class="tm-d1" r="5" fill="#2F6BFF" stroke="#fff" stroke-width="2" opacity="0"/><circle class="tm-d2" r="4" fill="#94A3B8" stroke="#fff" stroke-width="2" opacity="0"/><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent" class="tm-hit"/></svg>`; }
function tmHover(t, z, b, s0, a) { const w = $('.tm-cw'), svg = $('.tm-svg', w), tip = $('.tm-tip', w), P = window.__tmP, { X, Y } = window.__tmXY; if (!svg || !P) return;
  const xl = $('.tm-x', svg), c1 = $('.tm-d1', svg), c2 = $('.tm-d2', svg), hide = () => { tip.style.display = 'none'; [xl, c1, c2].forEach(n => n.setAttribute('opacity', 0)); };
  const mv = ev => { const r = svg.getBoundingClientRect(), vx = (ev.clientX - r.left) / r.width * TM.W; let lo = 0, hi = P.length - 1; while (hi - lo > 1) { const md = (lo + hi) >> 1; if (X(P[md].d) < vx) lo = md; else hi = md; } const p = Math.abs(X(P[lo].d) - vx) < Math.abs(X(P[hi].d) - vx) ? P[lo] : P[hi];
    const x = X(p.d); xl.setAttribute('x1', x); xl.setAttribute('x2', x); xl.setAttribute('opacity', .35); c1.setAttribute('cx', x); c1.setAttribute('cy', Y(p.y)); c1.setAttribute('opacity', 1); if (p.s != null) { c2.setAttribute('cx', x); c2.setAttribute('cy', Y(p.s)); c2.setAttribute('opacity', 1); } else c2.setAttribute('opacity', 0);
    const sg = v => `<b style="color:${v >= 0 ? '#34D399' : '#F87171'}">${pct(v, 1)}</b>`;
    tip.innerHTML = `<div style="font-weight:700;margin-bottom:3px">${esc(dfmt(iso(p.d)))}</div>${esc(t)} ${esc(usd(p.c))} · ${sg(p.y)} since bought<br>Your ${esc(usd(a, 0))} → ${esc(usd(a * (1 + p.y / 100), 0))}${p.s != null ? `<br>S&P 500 ${sg(p.s)} → ${esc(usd(a * (1 + p.s / 100), 0))}` : ''}`;
    tip.style.display = 'block'; const px = x / TM.W * r.width, tw = tip.offsetWidth; tip.style.left = Math.min(Math.max(0, px + 12 + tw > r.width ? px - tw - 12 : px + 12), r.width - tw) + 'px'; tip.style.top = Math.max(0, Y(p.y) / TM.H * r.height - 70) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', hide); }
function timeMachine() {
  const z0 = ser('SPY'), first = z0.length ? iso(z0[0].d) : '2021-11-22';
  app.innerHTML = head('Time Machine', 'What if you had bought? Pick a stock, a date and an amount, and see what it would be worth today, against simply buying the S&P 500.') + wrap(card('Go Back in Time', 'real closing prices', `<form class="r2-f" id="r2-tmf"><label>Stock<select name="t">${tickOpts('NVDA')}</select></label><label>Bought on<input type="date" name="d" min="${first}" max="${today()}" value="2022-01-03"></label><label>Amount $<input type="number" name="a" value="1000" min="1"></label></form><div id="r2-tmo" style="margin-top:14px"></div>`));
  document.title = 'Time Machine — Tickerwise'; const f = $('#r2-tmf');
  const run = () => { const t = f.t.value, d0 = dnum(f.d.value), a = +f.a.value || 0, z = ser(t).filter(p => p.d >= d0); if (z.length < 2) { $('#r2-tmo').innerHTML = '<p class="muted">No price data for that date. Try a later date.</p>'; return; }
    const b = z[0], e = z[z.length - 1], s0 = closeOn('SPY', b.d), s1 = closeOn('SPY', e.d), moved = b.d === ser(t)[0].d && b.d > d0 + 4 ? `Our price history for ${esc(t)} starts ${esc(dfmt(iso(b.d)))}, so this starts on that day.` : b.d > d0 + 3 ? `We don't have a price for ${esc(t)} on ${esc(dfmt(iso(d0)))}; the closest one after it is ${esc(dfmt(iso(b.d)))}, so this starts there.` : '';
    const v = a * e.c / b.c, vs = s0 && s1 ? a * s1.c / s0.c : null, yrs = (e.d - b.d) / 365.25, tr = (e.c / b.c - 1) * 100, str = vs != null ? (vs / a - 1) * 100 : null;
    const cagr = yrs > .5 ? (Math.pow(e.c / b.c, 1 / yrs) - 1) * 100 : null, scagr = yrs > .5 && vs != null ? (Math.pow(vs / a, 1 / yrs) - 1) * 100 : null;
    /* drawdown episodes: peak -> lowest close -> back to the old peak (or still below it today); 4 deepest */
    const D4 = tmDD(z), SD4 = tmDD(ser('SPY').filter(p => p.d >= b.d && p.d <= e.d));
    const spSame = x => { const u = closeOn('SPY', x.p.d), w = closeOn('SPY', x.lo.d); return u && w ? (w.c / u.c - 1) * 100 : null; };
    const dBox = (x, i, sp) => `<div${sp ? ' class="tm-sb"' : ''}><span><i class="tm-n${sp ? ' g' : ''}">${i + 1}</i>${['Largest', '2nd largest', '3rd largest', '4th largest'][i]} drop</span><b class="dn">${pct(x.pc, 0)}</b><small style="display:block;font-size:12px;color:var(--mut);margin-top:4px;line-height:1.45">${esc(dfmt(iso(x.p.d)))} → ${esc(dfmt(iso(x.lo.d)))} (${Math.max(1, Math.round((x.lo.d - x.p.d) / 30.4))} mo. falling)<br>${x.rec ? 'Back to the old high ' + esc(dfmt(iso(x.rec.d))) + ' (' + Math.round((x.rec.d - x.p.d) / 30.4) + ' mo. total)' : 'Not back to the old high yet'}</small>${sp ? '' : (v => v == null ? '' : `<div class="tm-vs">S&P 500 over the same dates: <b class="${v < 0 ? 'dn' : 'up'}">${pct(v, 0)}</b></div>`)(spSame(x))}</div>`;
    const two = (lab, x, y, fx, cx, cy) => `<div class="tm-2"><span>${lab}</span><p><em>${esc(t)}</em><b class="${cx || ''}">${x == null ? '—' : fx(x)}</b></p><p><em>S&P 500</em><b class="${cy || ''}">${y == null ? '—' : fx(y)}</b></p></div>`;
    const dif = (x, y) => x == null || y == null ? null : x - y, pp = x => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(Math.abs(x) < 10 ? 1 : 0) + ' pts';
    const dv = dif(v, vs), dt = dif(tr, str), dy = dif(cagr, scagr), dsg = x => x == null ? '' : x >= 0 ? 'up' : 'dn';
    const boxes = `<div class="r2-k tm-k">${two(`${esc(usd(a, 0))} bought ${esc(dfmt(iso(b.d)))}, worth today`, v, vs, x => usd(x, 0), gcol(v - a), vs != null ? gcol(vs - a) : '')}${two('Total return', tr, str, x => pct(x, 0), gcol(tr), str != null ? gcol(str) : '')}${two('Per year', cagr, scagr, x => pct(x), cagr != null ? gcol(cagr) : '', scagr != null ? gcol(scagr) : '')}
      <div class="tm-2 tm-d"><span>${esc(t)} vs the S&P 500</span><p><em>Dollars</em><b class="${dsg(dv)}">${dv == null ? '—' : (dv >= 0 ? '+' : '−') + usd(Math.abs(dv), 0)}</b></p><p><em>Total return</em><b class="${dsg(dt)}">${dt == null ? '—' : pp(dt)}</b></p><p><em>Per year</em><b class="${dsg(dy)}">${dy == null ? '—' : pp(dy)}</b></p></div></div>
      <p class="muted" style="margin:8px 0 0;font-size:12.5px">${dv == null ? '' : dv >= 0 ? `${esc(t)} beat the S&P 500 by ${esc(usd(dv, 0))} on ${esc(usd(a, 0))} over ${yrs.toFixed(1)} years.` : `${esc(t)} trailed the S&P 500 by ${esc(usd(-dv, 0))} on ${esc(usd(a, 0))} over ${yrs.toFixed(1)} years.`}</p>`;
    $('#r2-tmo').innerHTML = (moved ? `<p style="margin:0 0 10px;padding:8px 12px;border-radius:10px;background:#FEF3C7;color:#92400E;font-size:13px">${moved}</p>` : '') + boxes
      + `<div class="tm-cw" style="margin-top:16px">${tmChart(t, z, b, s0, D4, SD4)}<div class="tm-tip"></div></div><p class="muted" style="margin:6px 0 0;font-size:12.5px"><b style="color:#2F6BFF">━</b> ${esc(t)} &nbsp; <b style="color:#94A3B8">┅</b> S&P 500 &nbsp; <b style="color:#EF4444">▮</b> ${esc(t)} drop, high to low (red dots) · <b style="color:#64748B">●</b> S&P 500 drops (grey dots) · % change since you bought · price change only, dividends not included. Hover or tap the chart for any day.</p>`
      + (D4.length ? `<h4 style="margin:18px 0 8px;font:700 14px Inter,sans-serif">${esc(t)}: largest drops along the way</h4><div class="r2-k">${D4.map((x, i) => dBox(x, i)).join('')}</div>` : '')
      + (SD4.length ? `<h4 style="margin:16px 0 8px;font:700 14px Inter,sans-serif;color:#475569">S&P 500: largest drops in the same period</h4><div class="r2-k">${SD4.map((x, i) => dBox(x, i, 1)).join('')}</div>` : '');
    tmHover(t, z, b, s0, a); };
  f.oninput = f.onchange = run; run();
}

/* =================== CRASH TEST =================== */
function crashTest() {
  const P = papers(), W = jget('tw-watchlist', []), src = [['wl', 'My watchlist (equal amounts)']].concat(P.map(p => ['p:' + p.id, 'Paper: ' + (p.name || 'Portfolio')]));
  app.innerHTML = head('Crash Test', 'How would your stocks hold up if the market fell? Each stock is moved by its beta, its usual sensitivity to the S&P 500.') + wrap(`
    ${card('Run the Test', '', `<form class="r2-f" id="r2-ctf"><label>Portfolio<select name="s">${opts(src, P.length ? 'p:' + P[0].id : 'wl')}</select></label><label>Market move: <b id="r2-ctv">−20%</b><input type="range" name="m" min="-50" max="20" step="5" value="-20"></label></form><div class="r2-f" style="margin-top:8px">${[['2020 Covid crash', -34], ['2022 bear market', -25], ['2008 crisis', -50], ['A normal correction', -10]].map(x => `<button class="btn ghost" data-sc="${x[1]}" type="button">${x[0]} (${x[1]}%)</button>`).join('')}</div><div id="r2-cto" style="margin-top:14px"></div>`)}
    ${lock('AI portfolio coach: how to make this portfolio crash-proof', 'requires the upgraded plan.')}`);
  document.title = 'Crash Test — Tickerwise'; const f = $('#r2-ctf');
  const run = () => { const mv = +f.m.value; $('#r2-ctv').textContent = pct(mv, 0); let H = [];
    if (f.s.value === 'wl') H = W.filter(t => BY[t]).map(t => ({ t, v: 10000 })); else { const p = P.find(x => 'p:' + x.id === f.s.value); if (p && PP.calc) H = PP.calc(p).open.map(r => ({ t: r.t, v: r.v })); }
    if (!H.length) { $('#r2-cto').innerHTML = '<p class="muted" style="margin:0">Nothing to test yet. Add stocks to your watchlist or start a Paper Trading portfolio.</p>'; return; }
    const rows = H.map(h => { const b = (BY[h.t] || {}).beta || 1, m = Math.max(-95, b * mv); return Object.assign(h, { b, m, nv: h.v * (1 + m / 100) }); }).sort((a, b) => a.m - b.m), tv = rows.reduce((a, r) => a + r.v, 0), nv = rows.reduce((a, r) => a + r.nv, 0), pb = rows.reduce((a, r) => a + r.b * r.v, 0) / tv;
    $('#r2-cto').innerHTML = `<div class="r2-k"><div><span>Value today</span><b>${usd(tv, 0)}</b></div><div><span>After a ${pct(mv, 0)} market</span><b class="${gcol(nv - tv)}">${usd(nv, 0)}</b></div><div><span>Your move</span><b class="${gcol(nv - tv)}">${pct((nv / tv - 1) * 100)}</b></div><div><span>Portfolio beta</span><b>${pb.toFixed(2)}</b></div></div>
      <p style="margin:12px 0">${pb > 1.2 ? `⚠️ Your portfolio swings about <b>${pb.toFixed(1)}×</b> the market. In a ${pct(mv, 0)} market you would lose more than the average investor.` : pb < .8 ? `🛡️ Your portfolio is calmer than the market (beta ${pb.toFixed(1)}).` : `Your portfolio moves roughly with the market (beta ${pb.toFixed(1)}).`}</p>
      <div class="r2-sc"><table class="r2-t"><tr><th>Stock</th><th class="n">Beta</th><th class="n">Expected move</th><th class="n">Value after</th></tr>${rows.map(r => `<tr><td>${tl(r.t)}</td><td class="n">${r.b.toFixed(2)}</td><td class="n ${gcol(r.m)}"><b>${pct(r.m, 0)}</b></td><td class="n">${usd(r.nv, 0)}</td></tr>`).join('')}</table></div><p class="muted" style="margin:8px 0 0;font-size:12.5px">An estimate from beta. Real crashes hit some stocks much harder.</p>`; };
  f.oninput = run; $$('[data-sc]').forEach(b => b.onclick = () => { f.m.value = b.dataset.sc; run(); }); run();
}

/* =================== CONFLUENCE =================== */
function confluence() {
  const F = window.TWFI, ACT = (F && F.ACT) || {}, CG = NX.CG || {}, XX = TW.X || {}, AN = TW.AN || {};
  const L = S.map(s => { const a = ACT[s.t], i = (XX[s.t] || {}).i, c = CG[s.t], an = AN[s.t];
    const sig = [['Legends buying', a && a.net > 0, a ? `${a.buy.length} bought, ${a.sell.length} sold` : ''], ['Insiders buying', i && i[1] > i[2], i ? `${i[1]} buys, ${i[2]} sells` : ''], ['Congress buying', c && c[0] > c[1], c ? `${c[0]} buys, ${c[1]} sells` : ''], ['Score 7+', (s.ws || 0) >= 7, s.ws + '/10'], ['Analysts say Buy', an && /buy/i.test(an[7] || ''), an ? an[7] : ''], ['Uptrend', s.tech && s.tech.v200 > 0, s.tech ? pct(s.tech.v200, 0) + ' vs 200-day' : '']];
    return { s, sig, n: sig.filter(x => x[1]).length }; }).sort((a, b) => b.n - a.n || (b.s.ws || 0) - (a.s.ws || 0));
  const ck = x => x[1] ? `<span title="${esc(x[2])}" style="color:#059669;font-weight:800">✓</span>` : `<span title="${esc(x[2])}" style="color:#CBD5E1">·</span>`;
  app.innerHTML = head('Confluence', 'When smart money agrees. Stocks where famous investors, insiders, members of Congress, analysts, our score and the trend all point the same way.') + wrap(`
    ${card('Most Signals in Agreement', `${L.filter(x => x.n >= 4).length} stocks with 4 or more of 6`, `<div class="r2-sc"><table class="r2-t"><tr><th>Stock</th><th class="n">Signals</th>${L[0].sig.map(x => `<th class="n r2-hm" style="font-size:11px">${x[0]}</th>`).join('')}</tr>${L.slice(0, 40).map(x => `<tr><td>${tl(x.s.t)} <span class="muted r2-hm" style="font-size:12.5px">${esc(x.s.n || '')}</span></td><td class="n"><b>${x.n}/6</b></td>${x.sig.map(y => `<td class="n r2-hm">${ck(y)}</td>`).join('')}</tr>`).join('')}</table></div><p class="muted" style="margin:8px 0 0;font-size:12.5px">Legends = 13F changes last quarter; insiders and Congress = recent disclosed trades. Hover a ✓ for the detail. Agreement is not a guarantee.</p>`)}`);
  document.title = 'Confluence — Tickerwise';
}

/* =================== SCORE CHANGES =================== */
async function scoreChanges() {
  app.innerHTML = head('Score Changes', 'Every night we re-score all stocks. Here is what moved up and down.') + wrap('<p class="muted">Loading…</p>'); document.title = 'Score Changes — Tickerwise';
  const H = window.TWA && window.TWA.hist ? await window.TWA.hist() : null; if (!H || !H.d) return; const n = H.d.length, nm = ['Score', 'Momentum', 'Earnings', 'Growth', 'Profitability', 'Health'];
  if (n < 2) { $('#app .sec .wrap').innerHTML = card('Tracking Started', esc(dfmt(H.d[0])), `<p style="margin:0">We saved the first snapshot of all ${Object.keys(H.T).length} stocks on ${esc(dfmt(H.d[0]))}. Changes appear here after the next nightly run, and build into a full history over time.</p>`); return; }
  const ch = []; Object.entries(H.T).forEach(([t, r]) => { const a = r[n - 2], b = r[n - 1]; if (!a || !b) return; const d = b.map((v, i) => (v || 0) - (a[i] || 0)); if (d.some(x => x)) ch.push({ t, a, b, d }); });
  const up = ch.filter(c => c.d[0] > 0).sort((x, y) => y.d[0] - x.d[0]), dn = ch.filter(c => c.d[0] < 0).sort((x, y) => x.d[0] - y.d[0]), pil = ch.filter(c => !c.d[0]);
  const why = c => c.d.slice(1).map((v, i) => v ? `${nm[i + 1]} ${v > 0 ? '+' : ''}${v}` : '').filter(Boolean).join(', ');
  const T = (L, e) => L.length ? `<div class="r2-sc"><table class="r2-t"><tr><th>Stock</th><th class="n">Score</th><th>What changed</th></tr>${L.slice(0, 30).map(c => `<tr><td>${tl(c.t)}</td><td class="n"><b>${c.a[0]} → ${c.b[0]}</b></td><td class="muted" style="font-size:13px">${esc(why(c)) || '—'}</td></tr>`).join('')}</table></div>` : `<p class="muted" style="margin:0">${e}</p>`;
  $('#app .sec .wrap').innerHTML = card('⬆️ Upgrades', `${esc(dfmt(H.d[n - 2]))} → ${esc(dfmt(H.d[n - 1]))}`, T(up, 'No upgrades last night.')) + card('⬇️ Downgrades', '', T(dn, 'No downgrades last night.')) + card('Pillar Moves', 'score unchanged, a pillar moved', T(pil, 'None.'));
}

/* =================== THEME BASKETS =================== */
function baskets() {
  app.innerHTML = head('Theme Basket Builder', 'Describe an idea in a few words and we build a basket of stocks we cover, test it over the past year against the S&P 500, and let you paper-trade it.') + wrap(`
    ${card('Build a Basket', '', `<form class="r2-f" id="r2-bf"><label style="flex:2 1 260px">Your idea<input name="q" placeholder="e.g. AI chips, nuclear energy, banks, space" value="AI semiconductors"></label><label>Minimum score<select name="m">${opts([['0', 'Any'], ['6', '6+'], ['7', '7+'], ['8', '8+']], '6')}</select></label><label>Max stocks<select name="n">${opts([['5', '5'], ['8', '8'], ['10', '10'], ['15', '15']], '8')}</select></label><label>Weighting<select name="w">${opts([['eq', 'Equal'], ['sc', 'By score']], 'eq')}</select></label><button class="btn primary">Build</button></form><div class="r2-f" style="margin-top:8px">${['Nuclear energy', 'Space', 'Cybersecurity', 'Banks', 'Defense', 'Quantum', 'Consumer brands', 'Electric vehicles'].map(x => `<button class="btn ghost" type="button" data-bq="${x}">${x}</button>`).join('')}</div><div id="r2-bo" style="margin-top:14px"></div>`)}
    ${lock('AI theme builder that understands any idea in plain English', 'requires the upgraded plan. The free builder matches your words to company names, industries and sectors.')}`);
  document.title = 'Theme Baskets — Tickerwise'; const f = $('#r2-bf');
  const run = () => { const words = f.q.value.toLowerCase().split(/[\s,]+/).filter(w => w.length > 2), syn = { ai: ['artificial', 'semiconductor', 'data center', 'software'], chips: ['semiconductor'], chip: ['semiconductor'], nuclear: ['uranium', 'utilities', 'nuclear'], space: ['aerospace', 'satellite', 'space'], banks: ['bank', 'financial'], cyber: ['security', 'software'], cybersecurity: ['security'], ev: ['auto', 'electric'], electric: ['auto', 'electric'], defense: ['aerospace', 'defense'], quantum: ['quantum', 'computer'], consumer: ['consumer', 'retail', 'beverage'] };
    const W2 = words.concat(...words.map(w => syn[w] || [])), m = +f.m.value;
    let L = S.map(s => { const hay = [s.n, s.th, s.sec, s.t].join(' ').toLowerCase(); return [s, W2.filter(w => hay.includes(w)).length]; }).filter(x => x[1] > 0 && (x[0].ws || 0) >= m && ser(x[0].t).length > 252).sort((a, b) => b[1] - a[1] || (b[0].ws || 0) - (a[0].ws || 0)).slice(0, +f.n.value).map(x => x[0]);
    if (!L.length) { $('#r2-bo').innerHTML = '<p class="muted" style="margin:0">No stocks matched. Try other words or a lower minimum score.</p>'; return; }
    const wt = L.map(s => f.w.value === 'sc' ? (s.ws || 1) : 1), tw = wt.reduce((a, b) => a + b, 0), d1 = lastD(), d0 = d1 - 365, days = ser('SPY').filter(p => p.d >= d0).map(p => p.d);
    const curve = days.map(d => L.reduce((a, s, i) => { const b = closeOn(s.t, d0), c = closeOn(s.t, d); return a + (b && c ? wt[i] / tw * c.c / b.c : wt[i] / tw); }, 0) * 100), s0 = closeOn('SPY', d0), spc = days.map(d => 100 * closeOn('SPY', d).c / s0.c);
    const r = curve[curve.length - 1] - 100, rs = spc[spc.length - 1] - 100; window.__r2b = { L, wt, tw, name: f.q.value };
    $('#r2-bo').innerHTML = `<div class="r2-k"><div><span>Basket, past year</span><b class="${gcol(r)}">${pct(r)}</b></div><div><span>S&P 500</span><b class="${gcol(rs)}">${pct(rs)}</b></div><div><span>Edge</span><b class="${gcol(r - rs)}">${pct(r - rs)}</b></div><div><span>Avg score</span><b>${(L.reduce((a, s) => a + (s.ws || 0), 0) / L.length).toFixed(1)}</b></div></div>
      <div style="margin-top:10px">${sparkSVG([{ v: curve, c: '#7C3AED' }, { v: spc, c: '#94A3B8', dash: 1, w: 2 }])}</div>
      <div class="r2-sc"><table class="r2-t"><tr><th>Stock</th><th class="r2-hm">Industry</th><th class="n">Score</th><th class="n">Weight</th><th class="n">1Y</th></tr>${L.map((s, i) => { const b = closeOn(s.t, d0), c = last(s.t); return `<tr><td>${tl(s.t)}</td><td class="r2-hm muted" style="font-size:13px">${esc(s.th || s.sec || '')}</td><td class="n">${s.ws}</td><td class="n">${(wt[i] / tw * 100).toFixed(0)}%</td><td class="n ${gcol(c.c / b.c - 1)}">${pct((c.c / b.c - 1) * 100, 0)}</td></tr>`; }).join('')}</table></div>
      <p style="margin:12px 0 0"><button class="btn primary" id="r2-bp">📈 Paper-Trade This Basket ($100K)</button> <span class="muted" style="font-size:12.5px">Past results use today's picks, so they look better than a real test would (hindsight).</span></p>`;
    $('#r2-bp').onclick = () => { const B = window.__r2b, l = lastD(), o = jget('tw_paper', { prof: null, list: [] }), lots = []; B.L.forEach((s, i) => { const c = last(s.t); const qn = Math.floor(100000 * .99 * B.wt[i] / B.tw / c.c); if (qn > 0) lots.push({ id: uid(), t: s.t, q: qn, bd: iso(l), bp: +c.c.toFixed(4), sd: null, sp: null }); });
      const P = { id: uid(), name: ('Basket: ' + B.name).slice(0, 40), mode: 'practice', created: iso(l), lots, pub: false }; o.list.push(P); jset('tw_paper', o); location.hash = '#/paper/p/' + P.id; }; };
  f.onsubmit = e => { e.preventDefault(); run(); }; $$('[data-bq]').forEach(b => b.onclick = () => { f.q.value = b.dataset.bq; run(); }); run();
}

/* =================== PICK 5 WEEKLY CONTEST =================== */
const wkStart = () => { const l = lastD(); if (!l) return null; const dow = new Date(l * 864e5).getUTCDay(); return l - ((dow + 6) % 7) - 3; }; /* last close of the previous week (Friday) */
const wkId = () => { const w = wkStart(); return w ? 'PICK5-' + iso(w) : 'PICK5'; };
async function pick5() {
  const w0 = wkStart(), id = wkId(), my = jget('tw_pick5', {})[id];
  app.innerHTML = head('Pick 5', 'Pick five stocks you think will beat the S&P 500 this week. Returns run from last Friday\'s close. New contest every Monday.') + wrap('<p class="muted">Loading…</p>'); document.title = 'Pick 5 — Tickerwise';
  const E = await q('LeagueEntries', { code: { $eq: id } }, 500) || [], best = {}; E.forEach(x => { if (!best[x.nick]) best[x.nick] = x; });
  const sc = picks => { const r = picks.map(t => { const b = closeOn(t, w0), c = last(t); return b && c ? (c.c / b.c - 1) * 100 : 0; }); return r.reduce((a, b) => a + b, 0) / (r.length || 1); }, sp = (() => { const b = closeOn('SPY', w0), c = last('SPY'); return b && c ? (c.c / b.c - 1) * 100 : 0; })();
  const rows = Object.values(best).map(x => Object.assign(x, { r: sc(x.data.picks || []) })).sort((a, b) => b.r - a.r);
  $('#app .sec .wrap').innerHTML = `${card('Your Picks', 'week from ' + esc(dfmt(iso(w0 + 3))), my ? `<p style="margin:0">Your five: ${my.map(tl).join(' · ')} · <b class="${gcol(sc(my) - sp)}">${pct(sc(my))}</b> vs S&P ${pct(sp)}</p>` : `<form class="r2-f" id="r2-p5">${[0, 1, 2, 3, 4].map(i => `<label>Pick ${i + 1}<select name="p${i}">${tickOpts(['NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL'][i])}</select></label>`).join('')}<button class="btn primary">Enter</button></form>`)}
    ${card('This Week\'s Leaderboard', `${rows.length} player${rows.length === 1 ? '' : 's'} · S&P 500 ${pct(sp)}`, rows.length ? `<div class="r2-sc"><table class="r2-t"><tr><th>#</th><th>Player</th><th class="r2-hm">Picks</th><th class="n">Return</th><th class="n">vs S&P</th></tr>${rows.map((x, i) => `<tr><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td><b>${esc(x.nick)}</b></td><td class="r2-hm" style="font-size:13px">${(x.data.picks || []).join(' · ')}</td><td class="n ${gcol(x.r)}"><b>${pct(x.r)}</b></td><td class="n ${gcol(x.r - sp)}">${pct(x.r - sp)}</td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">No entries yet this week.</p>')}`;
  const f = $('#r2-p5'); if (f) f.onsubmit = async e => { e.preventDefault(); const p = [0, 1, 2, 3, 4].map(i => f['p' + i].value); if (new Set(p).size < 5) { toast('Pick five different stocks.'); return; } if (await ins('LeagueEntries', { code: id, nick: nick(), pid: 'pick5', data: { picks: p } })) { const M = jget('tw_pick5', {}); M[id] = p; jset('tw_pick5', M); pick5(); } };
}

/* =================== ACADEMY =================== */
const AC = [
 { k: 'start', n: 'Stock Market Basics', i: '🌱', L: [
  ['What a stock is', 'A share is a tiny piece of ownership in a company. If the company earns more over time, each piece is usually worth more. The price you see is simply what the last buyer and seller agreed on.', [['Owning one share means you own…', ['A loan to the company', 'A small piece of the company', 'A promise of dividends'], 1], ['The stock price is set by…', ['The company each morning', 'Buyers and sellers trading', 'The government'], 1]]],
  ['Why prices move', 'Short term, prices move on news, emotions and big funds buying or selling. Long term, they follow the company\'s earnings. That is why a great company can still fall 30% in a bad month.', [['Over many years, prices mostly follow…', ['News headlines', 'Earnings', 'Trading volume'], 1], ['A great company falling 30% in a month is…', ['Impossible', 'Common', 'Always a sign of fraud'], 1]]],
  ['Indexes and the S&P 500', 'An index is a basket that tracks many stocks. The S&P 500 holds 500 large U.S. companies and is the yardstick most investors try to beat. Most professionals fail to beat it over 10+ years.', [['The S&P 500 holds about…', ['50 companies', '500 large U.S. companies', 'Every U.S. company'], 1], ['Over 10+ years, most fund managers…', ['Beat the S&P 500', 'Fail to beat it', 'Match it exactly'], 1]]],
  ['Risk and diversification', 'Owning one stock is risky: it can fall 80% and never come back. Owning 20+ stocks across sectors smooths the ride. Beta tells you how much a stock swings compared with the market.', [['A beta of 2 means the stock usually moves…', ['Half as much as the market', 'Twice as much as the market', 'Opposite to the market'], 1], ['Diversification mainly…', ['Guarantees profits', 'Reduces the damage from one bad stock', 'Increases fees'], 1]]]] },
 { k: 'value', n: 'Valuing a Company', i: '⚖️', L: [
  ['Earnings and EPS', 'EPS (earnings per share) is the profit divided by the number of shares. Growing EPS is the engine of long-term stock returns.', [['EPS stands for…', ['Earnings per share', 'Equity per stock', 'Estimated price spread'], 0]]],
  ['The P/E ratio', 'P/E is the price divided by yearly earnings: how many years of today\'s profit you pay for the stock. A high P/E means investors expect fast growth. Forward P/E uses next year\'s expected earnings.', [['A P/E of 40 means you pay…', ['$40 per share', '40 years of today\'s earnings', '40% interest'], 1], ['Forward P/E uses…', ['Last year\'s earnings', 'Next year\'s expected earnings', 'Revenue'], 1]]],
  ['Margins and cash flow', 'Margins show how much of each sales dollar becomes profit. Free cash flow is the real cash left after running and investing in the business. Cash pays dividends and buybacks; accounting profit does not.', [['Free cash flow is…', ['Revenue minus taxes', 'Cash left after running and investing in the business', 'The stock price times shares'], 1]]],
  ['Fair value', 'A stock is worth all the cash it will make in the future, discounted to today. Our Fair Value calculator does a simple version: grow earnings, apply a P/E, discount back.', [['A higher required return makes today\'s fair value…', ['Higher', 'Lower', 'No different'], 1]]]] },
 { k: 'trade', n: 'Charts and Trading', i: '📈', L: [
  ['Moving averages', 'The 50-day and 200-day averages smooth out the noise. A price above its 200-day average is in a long-term uptrend. A 50-day crossing above the 200-day is called a golden cross.', [['A golden cross is when…', ['Price hits a record', 'The 50-day average crosses above the 200-day', 'Volume doubles'], 1]]],
  ['RSI', 'RSI (0 to 100) measures how fast a stock moved recently. Above 70 is overbought, below 30 oversold. These are warnings, not signals to buy or sell on their own.', [['An RSI of 25 is usually called…', ['Overbought', 'Oversold', 'Neutral'], 1]]],
  ['Orders', 'A limit order sets the most you will pay (or least you will accept). A stop order triggers when the price falls to a level, often used to cap a loss. Practice both in Paper Trading.', [['To cap a loss you would use…', ['A buy limit', 'A sell stop', 'A market order'], 1]]],
  ['Position sizing', 'Never risk so much on one trade that a loss hurts your whole portfolio. Many traders risk 1–2% of their account per trade.', [['Many traders risk per trade about…', ['1–2% of the account', '25% of the account', 'Everything'], 0]]]] }];
function academy(k, i) {
  const pr = jget('tw_acad', {}), done = (c, j) => pr[c.k + j]; if (k) { const c = AC.find(x => x.k === k); if (c) return lesson(c, +i || 0); }
  app.innerHTML = head('Tickerwise Academy', 'Short lessons, quick quizzes and a certificate at the end. Learn the market the wise way.') + wrap(`<div class="tz-g" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">${AC.map(c => { const n = c.L.filter((l, j) => done(c, j)).length; return `<a class="tz-tile" href="#/academy/${c.k}" style="display:flex;flex-direction:column;gap:6px;padding:18px;border:1.5px solid var(--line);border-radius:18px;background:#fff;text-decoration:none;color:#0B1B3F"><i style="font-style:normal;font-size:28px">${c.i}</i><b style="font:800 18px 'Space Grotesk',sans-serif">${c.n}</b><span class="muted" style="font-size:13.5px">${c.L.length} lessons · ${n}/${c.L.length} done</span><div class="r2-vb"><i style="width:${n / c.L.length * 100}%;background:linear-gradient(90deg,#00C176,#0EA5E9)"></i></div>${n === c.L.length ? '<span class="r2-pill" style="background:#DCFCE7;color:#047857">🎓 Certificate earned</span>' : ''}</a>`; }).join('')}</div>
    ${lock('AI tutor that answers your questions inside every lesson', 'requires the upgraded plan.')}`);
  document.title = 'Academy — Tickerwise';
}
function lesson(c, i) {
  const l = c.L[i], pr = jget('tw_acad', {});
  app.innerHTML = head(`${c.i} ${c.n}`, `Lesson ${i + 1} of ${c.L.length}: ${l[0]}`) + wrap(`${card(l[0], '', `<p style="margin:0;font-size:16px;line-height:1.7">${l[1]}</p>`)}${card('Quick Quiz', 'pick an answer: right answers move you on automatically', `<div class="r2-quiz" id="r2-qz">${l[2].map((qq, j) => `<div style="margin-bottom:12px"><b>${j + 1}. ${qq[0]}</b>${qq[1].map((o, k) => `<label><input type="radio" name="q${j}" value="${k}"> ${o}</label>`).join('')}</div>`).join('')}<span id="r2-qm"></span></div>`)}
    <div style="display:flex;gap:8px;flex-wrap:wrap">${i ? `<a class="btn ghost" href="#/academy/${c.k}/${i - 1}">← Previous</a>` : ''}<a class="btn ghost" href="#/academy">All courses</a>${i < c.L.length - 1 ? `<a class="btn ghost" href="#/academy/${c.k}/${i + 1}">Next →</a>` : ''}</div><div id="r2-cert"></div>`);
  document.title = l[0] + ' — Tickerwise Academy';
  const cert = () => { if (!c.L.every((x, j) => jget('tw_acad', {})[c.k + j])) return; const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 800; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1200, 800); g.strokeStyle = '#0B1B3F'; g.lineWidth = 14; g.strokeRect(30, 30, 1140, 740); g.strokeStyle = '#00C176'; g.lineWidth = 3; g.strokeRect(56, 56, 1088, 688);
    g.textAlign = 'center'; g.fillStyle = '#00A86B'; g.font = '800 40px Inter'; g.fillText('TICKERWISE ACADEMY', 600, 170); g.fillStyle = '#0B1B3F'; g.font = '800 64px Inter'; g.fillText('Certificate of Completion', 600, 280); g.font = '500 30px Inter'; g.fillStyle = '#475569'; g.fillText('This certifies that', 600, 370); g.fillStyle = '#0B1B3F'; g.font = '800 58px Inter'; g.fillText(nick() === 'Member' ? 'A Wise Investor' : nick(), 600, 450); g.font = '500 30px Inter'; g.fillStyle = '#475569'; g.fillText('has completed the course', 600, 520); g.fillStyle = '#1E4FD8'; g.font = '800 44px Inter'; g.fillText(c.n, 600, 590); g.fillStyle = '#94A3B8'; g.font = '500 24px Inter'; g.fillText(dfmt(today()), 600, 690);
    const u = cv.toDataURL('image/png'); $('#r2-cert').innerHTML = card('🎓 Course Complete!', '', `<img class="r2-cert" src="${u}" alt="Certificate"><p style="margin:10px 0 0"><a class="btn primary" download="tickerwise-certificate.png" href="${u}">Download Certificate</a></p>`); };
  /* answers are checked as soon as you pick one; a right answer moves you to the next question, and the last one to the next lesson (Zev, Nov 24, 2026) */
  let adv = 0; const check = () => { let ok = 0, ans = 0; l[2].forEach((qq, j) => { const v = $(`input[name=q${j}]:checked`); $$(`input[name=q${j}]`).forEach(x => x.parentNode.className = ''); if (v) { ans++; v.parentNode.className = +v.value === qq[2] ? 'ok' : 'no'; if (+v.value === qq[2]) ok++; } }); return { ok, ans }; };
  $$('#r2-qz input[type=radio]').forEach(inp => inp.onchange = () => { const j = +inp.name.slice(1), qq = l[2][j], right = +inp.value === qq[2], r = check();
    if (!right) { $('#r2-qm').innerHTML = '<b class="dn">Not quite. Try another answer.</b>'; return; }
    if (r.ok === l[2].length) { const P = jget('tw_acad', {}); P[c.k + i] = 1; jset('tw_acad', P); cert(); if (adv) return; adv = 1;
      if (i < c.L.length - 1) { $('#r2-qm').innerHTML = '<b class="up">✓ All correct! Next lesson in a moment…</b>'; setTimeout(() => { if (location.hash === `#/academy/${c.k}/${i}`) location.hash = `#/academy/${c.k}/${i + 1}`; }, 1400); }
      else $('#r2-qm').innerHTML = '<b class="up">✓ All correct! Course complete.</b>'; return; }
    $('#r2-qm').innerHTML = '<b class="up">✓ Right!</b>'; const nx = l[2].findIndex((q2, k) => k > j && !$(`input[name=q${k}]:checked`)) ; const tgt = nx >= 0 ? $(`input[name=q${nx}]`) : null; if (tgt) setTimeout(() => tgt.closest('div').scrollIntoView({ behavior: 'smooth', block: 'center' }), 350); });
  cert();
}

/* =================== GOAL PLANNER =================== */
function goal() {
  app.innerHTML = head('Goal Planner', 'How much do you need to save, and what return do you need, to reach your number?') + wrap(card('Your Goal', '', `<form class="r2-f" id="r2-gf"><label>Saved today $<input type="number" name="p" value="25000"></label><label>Add each month $<input type="number" name="m" value="500"></label><label>Years<input type="number" name="y" value="20" min="1" max="60"></label><label>Target $<input type="number" name="t" value="500000"></label></form><div id="r2-go" style="margin-top:14px"></div>`));
  document.title = 'Goal Planner — Tickerwise'; const f = $('#r2-gf');
  const fv = (p, m, y, r) => { const i = r / 12, n = y * 12; return i ? p * Math.pow(1 + i, n) + m * (Math.pow(1 + i, n) - 1) / i : p + m * n; };
  const run = () => { const p = +f.p.value || 0, m = +f.m.value || 0, y = +f.y.value || 1, T = +f.t.value || 0; let lo = -0.5, hi = 1; for (let k = 0; k < 80; k++) { const mid = (lo + hi) / 2; fv(p, m, y, mid) < T ? lo = mid : hi = mid; } const need = hi * 100, nm = r => { const i = r / 12, n = y * 12, g = Math.pow(1 + i, n); return Math.max(0, (T - p * g) * i / (g - 1)); };
    const sc = [[0.04, 'Cautious (4%)', '#94A3B8'], [0.07, 'Balanced (7%)', '#2F6BFF'], [0.10, 'Stock market history (~10%)', '#10B981']], yrs = [...Array(y + 1).keys()];
    $('#r2-go').innerHTML = `<div class="r2-k"><div><span>Return you need</span><b class="${need > 12 ? 'dn' : need > 8 ? '' : 'up'}">${need > 99 ? '99%+' : need.toFixed(1) + '% a year'}</b></div>${sc.map(s => `<div><span>Monthly needed at ${(s[0] * 100).toFixed(0)}%</span><b>${usd(nm(s[0]), 0)}</b></div>`).join('')}</div>
      <p style="margin:12px 0">${need > 12 ? '⚠️ That return is higher than the stock market has delivered over long periods. Save more each month, give it more years, or lower the target.' : need > 8 ? 'Possible with a mostly-stock portfolio, but expect rough years along the way.' : '✓ Realistic with a diversified portfolio.'}</p>${sparkSVG(sc.map(s => ({ v: yrs.map(t => fv(p, m, t, s[0])), c: s[2] })).concat([{ v: yrs.map(() => T), c: '#F59E0B', dash: 1, w: 1.5 }]), 180)}<p class="muted" style="margin:6px 0 0;font-size:12.5px">${sc.map(s => `<b style="color:${s[2]}">━</b> ${s[1]}`).join(' &nbsp; ')} &nbsp; <b style="color:#F59E0B">┅</b> target. Before taxes, fees and inflation.</p>`; };
  f.oninput = run; run();
}

/* =================== TRACKED CALLS =================== */
async function calls() {
  app.innerHTML = head('Tracked Calls', 'Every bullish or bearish post on Tickerwise is scored against the real price since it was posted. Who actually gets it right?') + wrap('<p class="muted">Loading…</p>'); document.title = 'Tracked Calls — Tickerwise';
  const L = await q('CommunityPosts', { kind: { $eq: 'post' } }, 500); const W = $('#app .sec .wrap'); if (!W) return; if (L == null) { W.innerHTML = '<p class="muted">Calls could not load right now.</p>'; return; }
  const scored = L.filter(p => p.side && BY[p.t] && p._at).map(p => { const d = dnum(String(p._at).slice(0, 10)), b = p.px || (closeOn(p.t, d) || {}).c, c = (last(p.t) || {}).c; if (!b || !c) return null; const r = (c / b - 1) * 100 * (p.side === 'bull' ? 1 : -1); return Object.assign(p, { r, ok: r > 0, days: lastD() - d }); }).filter(Boolean);
  const by = {}; scored.forEach(p => { const x = by[p.nick] = by[p.nick] || { n: 0, ok: 0, r: 0, nick: p.nick }; x.n++; x.ok += p.ok ? 1 : 0; x.r += p.r; });
  const R = Object.values(by).filter(x => x.n >= 1).sort((a, b) => b.ok / b.n - a.ok / a.n || b.r - a.r);
  W.innerHTML = card('Most Accurate Members', 'right = the price moved the way they called it', R.length ? `<div class="r2-sc"><table class="r2-t"><tr><th>#</th><th>Member</th><th class="n">Calls</th><th class="n">Right</th><th class="n">Avg result</th></tr>${R.slice(0, 25).map((x, i) => `<tr><td>${i + 1}</td><td><b>${esc(x.nick)}</b></td><td class="n">${x.n}</td><td class="n"><b>${Math.round(x.ok / x.n * 100)}%</b></td><td class="n ${gcol(x.r)}">${pct(x.r / x.n)}</td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">No scored calls yet. Post a bullish or bearish view on any stock page to get on the board.</p>')
    + card('Latest Calls', '', scored.length ? `<div class="r2-sc"><table class="r2-t"><tr><th>Member</th><th>Call</th><th class="n">Since</th><th class="n">Result</th></tr>${scored.slice(0, 30).map(p => `<tr><td>${esc(p.nick)}</td><td>${p.side === 'bull' ? '🐂' : '🐻'} ${tl(p.t)}</td><td class="n muted">${p.days}d</td><td class="n ${gcol(p.r)}"><b>${pct(p.r)}</b></td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">—</p>');
}

/* =================== CALENDAR EXPORT =================== */
function ics(list, name) { const L = list.filter(s => s && s.earn && /^\d{4}-\d{2}-\d{2}$/.test(s.earn.next || '')); if (!L.length) { toast('No upcoming earnings dates for these stocks.'); return; }
  const d = x => x.replace(/-/g, ''), nx = x => { const t = new Date(x + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10).replace(/-/g, ''); };
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tickerwise//Earnings//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + name].concat(...L.map(s => ['BEGIN:VEVENT', 'UID:' + s.t + '-' + d(s.earn.next) + '@tickerwise', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z', 'DTSTART;VALUE=DATE:' + d(s.earn.next), 'DTEND;VALUE=DATE:' + nx(s.earn.next), 'SUMMARY:' + s.t + ' earnings', 'DESCRIPTION:' + (s.n || '') + ' reports earnings. Tickerwise Score ' + s.ws + '/10. ' + location.origin + location.pathname + '#/stock/' + s.t, 'END:VEVENT'])).concat(['END:VCALENDAR']).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = name.replace(/\W+/g, '-').toLowerCase() + '.ics'; document.body.appendChild(a); a.click(); a.remove(); toast(`✓ ${L.length} earnings date${L.length === 1 ? '' : 's'} saved. Open the file to add them to your calendar.`); }
function calendar() {
  const W = jget('tw-watchlist', []).map(t => BY[t]).filter(Boolean), P = [...new Set(papers().flatMap(p => (p.lots || []).filter(l => !l.sd).map(l => l.t)))].map(t => BY[t]).filter(Boolean), up = S.filter(s => s.earn && s.earn.next && dnum(s.earn.next) >= lastD()).sort((a, b) => a.earn.next < b.earn.next ? -1 : 1);
  app.innerHTML = head('Earnings Calendar Export', 'Add earnings dates to your phone or computer calendar (Google, Apple, Outlook) in one tap.') + wrap(`${card('Add to My Calendar', '', `<div class="r2-f"><button class="btn primary" data-ic="wl">☆ My watchlist (${W.length})</button><button class="btn primary" data-ic="pp">📈 My paper holdings (${P.length})</button><button class="btn ghost" data-ic="all">All ${up.length} upcoming</button></div><p class="muted" style="margin:10px 0 0;font-size:13px">Downloads a calendar file (.ics). On a phone, open it and tap "Add All".</p>`)}
    ${card('Coming Up', 'next 30 reports', `<div class="r2-sc"><table class="r2-t"><tr><th>Date</th><th>Stock</th><th class="r2-hm">Company</th><th class="n">Score</th></tr>${up.slice(0, 30).map(s => `<tr><td>${esc(dfmt(s.earn.next))}</td><td>${tl(s.t)}</td><td class="r2-hm muted">${esc(s.n || '')}</td><td class="n">${s.ws}</td></tr>`).join('')}</table></div>`)}`);
  document.title = 'Earnings Calendar — Tickerwise'; $$('[data-ic]').forEach(b => b.onclick = () => ics(b.dataset.ic === 'wl' ? W : b.dataset.ic === 'pp' ? P : up, b.dataset.ic === 'wl' ? 'Tickerwise Watchlist Earnings' : b.dataset.ic === 'pp' ? 'Tickerwise Paper Earnings' : 'Tickerwise Earnings'));
}

/* =================== STOCK OF THE DAY =================== */
function sotdPick() { const L = S.filter(s => (s.ws || 0) >= 7 && ser(s.t).length > 60).sort((a, b) => a.t < b.t ? -1 : 1); return L[hsh('sotd' + today()) % L.length]; }
function sotdHTML(s, full) {
  const P = s.P || {}, F = window.TWFI, own = F && F.OWN && F.OWN[s.t], A = (TW.AN || {})[s.t], E = s.earn || {}, l = last(s.t), pil = [['Momentum', P.m], ['Earnings', P.e], ['Growth', P.g], ['Profitability', P.p], ['Health', P.b]].sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const lines = [`<b>${esc(s.n)}</b> scores <b>${s.ws}/10</b>, led by ${pil[0][0].toLowerCase()} (${pil[0][1]}) and ${pil[1][0].toLowerCase()} (${pil[1][1]}). Its weakest pillar is ${pil[4][0].toLowerCase()} (${pil[4][1]}).`];
  if (nz(E.l8)) lines.push(`It beat earnings estimates in ${E.l8}% of the last 8 quarters${E.next ? `, and reports next on ${esc(dfmt(E.next))}` : ''}.`);
  if (own && own.who.length) lines.push(`${own.who.length} famous investor${own.who.length === 1 ? '' : 's'} own it, including ${esc(own.who.slice(0, 2).map(m => m.name).join(' and '))}.`);
  if (A && nz(A[0]) && l) lines.push(`Analysts rate it ${esc(A[7])} with an average target of ${usd(A[0], 0)} (${pct((A[0] / l.c - 1) * 100, 0)} from here).`);
  if (s.ret && nz(s.ret.r1y)) lines.push(`The stock is ${pct(s.ret.r1y, 0)} over the past year${s.tech && nz(s.tech.off) ? ` and ${Math.abs(s.tech.off).toFixed(0)}% below its 52-week high` : ''}.`);
  return `<div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><div style="flex:1 1 280px;min-width:0"><div style="display:flex;gap:10px;align-items:baseline;flex-wrap:wrap"><a href="#/stock/${esc(s.t)}" style="font:800 26px 'Space Grotesk',sans-serif;text-decoration:none">${esc(s.t)}</a><span class="muted">${esc(s.th || s.sec || '')}</span>${l ? `<b>${usd(l.c)}</b>` : ''}</div><p style="margin:8px 0 0;line-height:1.7;font-size:15px">${lines.slice(0, full ? 6 : 3).join(' ')}</p></div><a class="btn primary" href="#/stock/${esc(s.t)}" style="align-self:center">See the Full Picture →</a></div>`;
}
function sotd() { const s = sotdPick(); app.innerHTML = head('Stock of the Day', esc(dfmt(today())) + ' · a fresh, high-scoring stock every day') + wrap(card('⭐ ' + esc(s.t), '', sotdHTML(s, 1)) + `<div id="r2-sotdx"></div>`); document.title = 'Stock of the Day — Tickerwise'; const x = $('#r2-sotdx'); x.outerHTML = whyMoving(s.t) + debate(s.t); debateVote(s.t); }
function homeSotd() { if ($('#r2-hsotd')) return; const anchor = $('#hm-inv', app) || $('#hm-social', app); if (!anchor) return; const s = sotdPick(), sec = document.createElement('section'); sec.className = 'sec'; sec.id = 'r2-hsotd'; sec.style.paddingTop = '10px';
  sec.innerHTML = `<div class="wrap"><div class="card" style="border:1.5px solid #FDE68A;background:linear-gradient(135deg,#FFFBEB,#fff)"><div class="card-h"><h3>⭐ Stock of the Day</h3><span><a href="#/sotd">read the story</a>${twOff('tickerdle') ? '' : ' · <a href="#/tickerdle">🧩 play Tickerdle</a>'}</span></div>${sotdHTML(s)}</div></div>`; anchor.before(sec); }

/* =================== FAIR VALUE: publish your estimate (narratives) =================== */
function fvExtras() {
  const fo = $('#tz-fo'), f = $('#tz-ff'); if (!fo || !f || $('#r2-fvp')) return; const el = document.createElement('div'); el.id = 'r2-fvp'; el.style.marginTop = '14px';
  el.innerHTML = `<form class="r2-f" id="r2-fvf"><label style="flex:2 1 280px">Your story in one line (optional)<input name="note" maxlength="200" placeholder="e.g. Data center demand keeps growing 30% a year"></label><button class="btn primary">Publish My Fair Value</button></form><div id="r2-fvl" style="margin-top:12px"></div>`; f.parentNode.appendChild(el);
  const load = async () => { const t = f.t.value, c = await fvCommunity(t), l = last(t), box = $('#r2-fvl'); if (!box) return; box.innerHTML = c ? `<b>Community: ${c.n} estimate${c.n === 1 ? '' : 's'} for ${esc(t)}</b> · median <b>${usd(c.med)}</b>${l ? ` (<span class="${gcol(c.med / l.c - 1)}">${pct((c.med / l.c - 1) * 100)}</span> vs price)` : ''}<div style="margin-top:8px">${c.L.slice(0, 5).map(x => { let j = {}; try { j = JSON.parse(x.text); } catch (e) {} return `<div class="tz-post"><div class="h"><b>${esc(x.nick)}</b><span>fair value ${usd(j.fv)}</span><span class="muted">growth ${j.g}% · P/E ${j.pe}</span></div>${j.note ? `<p>${esc(j.note)}</p>` : ''}</div>`; }).join('')}</div>` : `<span class="muted">No community estimates for ${esc(t)} yet. Be the first.</span>`; };
  $('#r2-fvf').onsubmit = async e => { e.preventDefault(); const t = f.t.value, eps = +f.eps.value, g = +f.g.value, pe = +f.pe.value, r = +f.r.value, fv = eps * Math.pow(1 + g / 100, 5) * pe / Math.pow(1 + r / 100, 5); if (!(fv > 0)) { toast('Needs positive earnings.'); return; }
    if (await ins('CommunityPosts', { t, kind: 'fv', text: JSON.stringify({ fv: +fv.toFixed(2), eps, g, pe, r, note: e.target.note.value.trim() }), side: '', nick: nick(), holder: false, parent: '' })) { toast('✓ Published'); e.target.note.value = ''; load(); } };
  f.t.addEventListener('change', () => setTimeout(load, 50)); load();
}

/* =================== SITE-WIDE: status bar, palette, dark mode, simple words =================== */
const HOL = ['2026-11-26', '2026-12-25', '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31', '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24'], HALF = ['2026-11-27', '2026-12-24', '2027-11-26'];
function ny() { const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short' }).formatToParts(new Date()), o = {}; p.forEach(x => o[x.type] = x.value); return { d: `${o.year}-${o.month}-${o.day}`, wd: o.weekday, m: (+o.hour % 24) * 60 + +o.minute, s: +o.second }; }
function mkt() { const n = ny(), close = HALF.includes(n.d) ? 13 * 60 : 16 * 60, trading = !['Sat', 'Sun'].includes(n.wd) && !HOL.includes(n.d);
  if (trading && n.m >= 570 && n.m < close) return { st: 'open', c: '#10B981', txt: 'Market open', left: close - n.m };
  if (trading && n.m >= 240 && n.m < 570) return { st: 'pre', c: '#F59E0B', txt: 'Pre-market', left: 570 - n.m, to: 'opens' };
  if (trading && n.m >= close && n.m < 1200) return { st: 'post', c: '#A78BFA', txt: 'After hours', left: null };
  return { st: 'closed', c: '#EF4444', txt: ['Sat', 'Sun'].includes(n.wd) ? 'Weekend: market closed' : HOL.includes(n.d) ? 'Holiday: market closed' : 'Market closed', left: null }; }
const hm = m => Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm';
function statusBar() {
  let b = $('#r2-stat'); const hdr = $('header'); if (!hdr) return; if (!b) { b = document.createElement('div'); b.id = 'r2-stat'; b.className = 'r2-stat'; hdr.after(b); }
  const k = mkt(), fg = MK.fg, sp = dayMove('SPY'), n = ny();
  b.innerHTML = `<div class="wrap"><span><span class="dot" style="background:${k.c}${k.st === 'open' ? ';box-shadow:0 0 0 4px rgba(16,185,129,.25)' : ''}"></span><b>${k.txt}</b>${k.st === 'open' ? ` · closes in ${hm(k.left)}` : k.st === 'pre' ? ` · opens in ${hm(k.left)}` : ''}</span><span class="r2-hm">New York ${String(Math.floor(n.m / 60)).padStart(2, '0')}:${String(n.m % 60).padStart(2, '0')}</span>${sp ? `<span>S&P 500 last close <b class="${sp.ch >= 0 ? 'up' : 'dn'}" style="color:${sp.ch >= 0 ? '#34D399' : '#F87171'}">${pct(sp.ch)}</b></span>` : ''}${fg ? `<span class="r2-hm">Fear & Greed <b>${fg.s}</b> (${esc(fg.r)})</span>` : ''}<span class="sp"></span><a href="#/sotd" class="r2-hm">⭐ Stock of the Day</a><button id="r2-k" title="Search everything (Ctrl+K)">⌘K</button></div>`;
  $('#r2-k').onclick = palette;
}
document.documentElement.classList.remove('r2-dark');
const PAGES_LIST = [['Home', '#/'], ['Markets', '#/markets'], ['Screener', '#/screener'], ['Themes', '#/themes'], ['Compare', '#/compare'], ['Insights', '#/insights'], ['Famous Investors', '#/investors'], ['Social Trading', '#/social'], ['Paper Trading', '#/paper'], ['Market Replay', '#/paper/replay'], ['Watchlist', '#/watchlist'], ['Tools', '#/tools'], ['Plans', '#/plans'], ['My Dashboard', '#/dashboard'], ['Daily Briefing', '#/briefing'], ['Signals', '#/signals'], ['Portfolio X-Ray', '#/xray'], ['Alerts', '#/alerts'], ['Learn & Glossary', '#/learn'], ['Academy', '#/academy'], ['Tickerdle', '#/tickerdle'], ['Time Machine', '#/timemachine'], ['Crash Test', '#/crashtest'], ['Confluence', '#/confluence'], ['Score Changes', '#/score-changes'], ['Theme Baskets', '#/baskets'], ['Pick 5', '#/pick5'], ['Goal Planner', '#/goal'], ['Tracked Calls', '#/calls'], ['Earnings Calendar', '#/calendar'], ['Stock of the Day', '#/sotd'], ['Community', '#/community'], ['Leagues', '#/leagues'], ['Groups', '#/groups'], ['Replay Leaderboard', '#/replay-board'], ['Limit & Stop Orders', '#/orders'], ['Paper Options', '#/options'], ['Fair Value', '#/fairvalue'], ['Score Widgets', '#/widgets'], ['Broker Comparison', '#/brokers'], ['Fund Letters', '#/letters'], ['Creator Program', '#/creators'], ['My Account', '#/account']].filter(t => !twOffH(t[1]));
function palette() {
  if ($('.r2-pal')) return; const F = window.TWFI, IV = (F && F.INV || []).map(m => [m.name + ' (' + m.firm + ')', '#/investors/' + m.id, '🏛️', 'Investor']);
  const ALL = S.map(s => [s.t + ' · ' + (s.n || ''), '#/stock/' + s.t, '📈', 'Stock']).concat(PAGES_LIST.map(p => [p[0], p[1], '📄', 'Page']), IV);
  const o = document.createElement('div'); o.className = 'r2-pal'; o.innerHTML = `<div><input placeholder="Search stocks, pages, investors…" aria-label="Search"><ul></ul><div class="ft">↑↓ to move · Enter to open · Esc to close</div></div>`; document.body.appendChild(o);
  const inp = $('input', o), ul = $('ul', o); let sel = 0, cur = [];
  const draw = () => { const v = inp.value.trim().toLowerCase(); cur = (v ? ALL.filter(x => x[0].toLowerCase().includes(v)).sort((a, b) => (a[0].toLowerCase().startsWith(v) ? 0 : 1) - (b[0].toLowerCase().startsWith(v) ? 0 : 1)) : PAGES_LIST.slice(13, 24).map(p => [p[0], p[1], '📄', 'Page'])).slice(0, 12); sel = Math.min(sel, cur.length - 1);
    ul.innerHTML = cur.map((x, i) => `<li class="${i === sel ? 'on' : ''}" data-i="${i}"><span>${x[2]}</span>${esc(x[0])}<small>${x[3]}</small></li>`).join('') || '<li class="muted">No matches</li>'; };
  const go = i => { const x = cur[i]; if (x) { location.hash = x[1]; o.remove(); } };
  inp.oninput = () => { sel = 0; draw(); }; inp.onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(cur.length - 1, sel + 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') go(sel); else if (e.key === 'Escape') o.remove(); };
  ul.onclick = e => { const li = e.target.closest('li[data-i]'); if (li) go(+li.dataset.i); }; o.onclick = e => { if (e.target === o) o.remove(); }; draw(); inp.focus();
}
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); } else if (e.key === '/' && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '') && !$('.r2-pal')) { e.preventDefault(); palette(); } });
let ELI = false;
const GL = { 'P/E': 'price ÷ yearly profit per share', 'Forward P/E': 'price ÷ next year\'s expected profit per share', 'PEG': 'P/E divided by growth; under 1 can mean cheap for its growth', 'EPS': 'profit per share', 'RSI': 'speed of recent moves, 0–100; over 70 = ran up fast', 'Beta': 'how much it swings vs the market; 2 = twice as much', 'Market cap': 'total value of all shares', 'Free cash flow': 'real cash left after running the business', 'FCF': 'real cash left after running the business', 'Gross margin': 'share of sales left after making the product', 'Net margin': 'share of sales kept as profit', 'Operating margin': 'share of sales left after running costs', '200-day': 'average price of the last 200 trading days', '50-day': 'average price of the last 50 trading days', 'Short interest': 'shares borrowed by people betting it falls', 'Dividend yield': 'yearly dividend as a % of the price', '13F': 'quarterly report of big funds\' U.S. stock holdings', 'Golden cross': '50-day average crossing above the 200-day', 'Drawdown': 'drop from the highest point', 'Sharpe': 'return earned per unit of risk', 'Volatility': 'how much the price jumps around', 'Consensus': 'the average view of the analysts', 'Price target': 'where analysts think the price will be in a year', 'Guidance': 'what the company says to expect next', 'Buyback': 'the company buying its own shares', 'Overbought': 'rose so fast a pause is common', 'Oversold': 'fell so fast a bounce is common', 'Momentum': 'how strongly the price has been trending', 'Insider': 'an executive or director of the company', 'ETF': 'a fund that trades like a stock and holds a basket' };
const GRX = new RegExp('\\b(' + Object.keys(GL).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|') + ')\\b', 'i');
function eli() {
  $$('.r2-eli-x').forEach(x => x.remove()); $$('.r2-eli').forEach(x => x.replaceWith(document.createTextNode(x.textContent))); if (!ELI) return; const seen = new Set();
  const walk = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentNode.closest('script,style,svg,input,textarea,select,option,button,a,.r2-eli,.r2-eli-x,th,canvas') || !GRX.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT }), L = []; while (walk.nextNode()) L.push(walk.currentNode);
  L.slice(0, 300).forEach(n => { const m = n.nodeValue.match(GRX); if (!m) return; const key = Object.keys(GL).find(k => k.toLowerCase() === m[1].toLowerCase()); if (!key || seen.has(key)) return; seen.add(key); const r = n.splitText(m.index); r.splitText(m[1].length); const sp = document.createElement('span'); sp.className = 'r2-eli'; sp.textContent = r.nodeValue; sp.title = GL[key]; const x = document.createElement('span'); x.className = 'r2-eli-x'; x.textContent = GL[key]; r.replaceWith(sp); sp.after(x); });
}

/* =================== UPGRADED PLAN teasers in context =================== */
function teasers(p) {
  const W = $('#app .sec .wrap'); if (!W || $('#r2-tz')) return; let h = '';
  if (p === 'briefing') h = lock('🎧 Daily 2-minute audio briefing (listen on your commute)');
  else if (p === 'alerts') h = lock('💬 WhatsApp and Telegram alert bot');
  else if (p === 'compare') h = lock('⚖️ AI "Make the Case": a written verdict on which stock is the better buy');
  else if (p === 'xray') h = lock('🧾 Tax-loss harvesting helper (needs a linked broker account)') + lock('🤖 AI portfolio coach');
  else if (p === 'paper') h = lock('🤖 AI portfolio coach: weekly review of your trades');
  else if (p === 'markets') h = lock('🇮🇱 Tel Aviv Stock Exchange (TASE) stocks', 'need a licensed data feed and come with the upgraded plan.') + lock('🦄 Private-company valuations (SpaceX, OpenAI, Stripe…)', 'need a licensed data feed and come with the upgraded plan.');
  else if (p === 'dashboard') h = lock('💵 Dividend income planner (income by month, yield on cost)', 'needs dividend data and comes with the upgraded plan.');
  else if (p === 'tools') h = lock('🧩 Browser extension: see the Tickerwise Score on any website that mentions a ticker');
  if (!h) return; const el = document.createElement('div'); el.id = 'r2-tz'; el.style.cssText = 'display:flex;flex-direction:column;gap:10px'; el.innerHTML = h; W.appendChild(el);
}
function toolTiles() { const g = $('#app .tt-g'); if (!g || $('#r2-tt')) return; const mk = document.createElement('i'); mk.id = 'r2-tt'; mk.hidden = true; g.appendChild(mk);
  const T = [['⭐', 'Stock of the Day', 'One high-scoring stock, explained in plain English.', '#/sotd'], ['🧩', 'Tickerdle', 'Guess the mystery stock in 6 tries. New puzzle daily.', '#/tickerdle'], ['⏳', 'Time Machine', 'What $1,000 in any stock would be worth today.', '#/timemachine'], ['💥', 'Crash Test', 'Your portfolio in a market crash, by beta.', '#/crashtest'], ['🎯', 'Confluence', 'Where legends, insiders, Congress and our score agree.', '#/confluence'], ['🔁', 'Score Changes', 'Nightly upgrades and downgrades.', '#/score-changes'], ['🧺', 'Theme Baskets', 'Turn an idea into a basket, test it, paper-trade it.', '#/baskets'], ['🏅', 'Pick 5', 'Weekly contest: five stocks vs the S&P 500.', '#/pick5'], ['🎓', 'Academy', 'Lessons, quizzes and certificates.', '#/academy'], ['🎯', 'Goal Planner', 'What it takes to reach your number.', '#/goal'], ['📣', 'Tracked Calls', 'Who in the community actually gets it right.', '#/calls'], ['📅', 'Earnings Calendar', 'Add earnings dates to your phone calendar.', '#/calendar']].filter(t => !twOffH(t[3]));
  g.insertAdjacentHTML('beforeend', T.map(t => `<a class="tt-tool" href="${t[3]}"><em>New</em><i>${t[0]}</i><b>${t[1]}</b><span>${t[2]}</span></a>`).join('')); }

/* =================== router =================== */
const PAGES = { tickerdle, timemachine: timeMachine, crashtest: crashTest, confluence, 'score-changes': scoreChanges, baskets, pick5, academy, goal, calls, calendar, sotd };
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('?')[0].split('/'); setTimeout(statusBar, 30);
  if (PAGES[p[0]]) { $$('#navlinks a').forEach(a => a.classList.toggle('on', a.dataset.r === 'tools')); try { PAGES[p[0]](p[1] && decodeURIComponent(p[1]), p[2]); } catch (e) { if (window.console) console.error(e); } window.scrollTo(0, 0); setTimeout(eli, 300); return; }
  let n = 0; const wait = (ok, fn, ms) => { const go = () => { if (ok()) fn(); else if (n++ < 30) setTimeout(go, ms || 200); }; setTimeout(go, 300); };
  if (p[0] === 'stock' && p[1] && (!p[2] || p[2] === 'overview')) wait(() => $('.main') && $('#tt-rc'), () => stockCards(decodeURIComponent(p[1]).toUpperCase()));
  if (!p[0] || p[0] === 'home') wait(() => $('#hm-inv', app) || $('#hm-social', app), homeSotd);
  if (p[0] === 'tools') wait(() => $('#app .tt-g'), () => { toolTiles(); teasers('tools'); });
  if (p[0] === 'fairvalue') wait(() => $('#tz-fo'), fvExtras);
  if (['briefing', 'alerts', 'compare', 'xray', 'paper', 'markets', 'dashboard'].includes(p[0]) && !p[1]) wait(() => $('#app .sec .wrap'), () => teasers(p[0]), 300);
  setTimeout(eli, 2500);
}
window.addEventListener('hashchange', () => setTimeout(route, 70));
setInterval(() => { if (document.visibilityState === 'visible') statusBar(); }, 30000);
const _set = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { _set.call(this, k, v); if (k === 'tw-watchlist' && this === window.localStorage) { clearTimeout(window.__r2w); window.__r2w = setTimeout(syncWatchers, 3000); } };
setTimeout(route, 80); setTimeout(syncWatchers, 6000);
window.TWR2 = { palette, share, ics, whyMoving, sotdPick, eli };
})();
