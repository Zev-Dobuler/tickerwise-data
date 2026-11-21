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
const closeOn = (t, d) => { const s = ser(t); let v = null; for (const p of s) { if (p.d <= d) v = p; else break; } return v; };
const firstDay = t => { const s = ser(t); return s.length ? s[0].d : null; };

/* ---------- portfolio math ---------- */
function calc(P) {
  const L = P.lots || [], today = lastDay(); let cost = 0, proceeds = 0, value = 0, best = null;
  const rows = L.map(l => { const cur = l.sd ? null : closeOn(l.t, today), px = l.sd ? l.sp : cur && cur.c, v = l.q * (px || 0), c = l.q * l.bp, r = c ? (v / c - 1) * 100 : null;
    if (r != null && (!best || r > best.r)) best = { t: l.t, r }; cost += c; if (l.sd) proceeds += v; else value += v; return Object.assign({}, l, { px, v, c, g: v - c, r }); });
  const cash = START - cost + proceeds, total = cash + value, ret = (total / START - 1) * 100;
  const d0 = L.length ? Math.min(...L.map(l => dnum(l.bd))) : null, a = d0 && closeOn('SPY', d0), b = closeOn('SPY', today), spx = a && b ? (b.c / a.c - 1) * 100 : null;
  return { rows, cash, value, total, ret, best, spx, open: rows.filter(r => !r.sd), closed: rows.filter(r => r.sd), d0 };
}
function cashOK(lots) { const ev = []; lots.forEach(l => { ev.push([dnum(l.bd), -l.q * l.bp]); if (l.sd) ev.push([dnum(l.sd), l.q * l.sp]); }); ev.sort((a, b) => a[0] - b[0] || b[1] - a[1]); let c = START; for (const e of ev) { c += e[1]; if (c < -0.01) return false; } return true; }
function curve(P) {
  const L = P.lots || []; if (!L.length) return null; const d0 = Math.min(...L.map(l => dnum(l.bd))), days = ser('SPY').filter(p => p.d >= d0).map(p => p.d); if (days.length < 2) return null;
  const s0 = closeOn('SPY', d0); return days.map(d => { let cash = START, hold = 0; L.forEach(l => { const b = dnum(l.bd), s = l.sd ? dnum(l.sd) : Infinity; if (d < b) return; cash -= l.q * l.bp; if (d >= s) cash += l.q * l.sp; else { const c = closeOn(l.t, d); hold += l.q * (c ? c.c : l.bp); } });
    const sp = closeOn('SPY', d); return [d, (cash + hold) / START * 100 - 100, s0 && sp ? (sp.c / s0.c - 1) * 100 : null]; });
}
function chart(P) {
  const C = curve(P); if (!C) return '<p class="muted" style="margin:8px 0">The chart appears after your first trade.</p>';
  const W = 900, H = 230, pl = 52, pr = 90, pt = 14, pb = 26, iw = W - pl - pr, ih = H - pt - pb, vs = C.flatMap(p => [p[1], p[2]]).filter(nz), mx = Math.max(2, ...vs), mn = Math.min(-2, ...vs);
  const X = d => pl + (d - C[0][0]) / ((C[C.length - 1][0] - C[0][0]) || 1) * iw, Y = v => pt + ih - (v - mn) / ((mx - mn) || 1) * ih;
  let g = ''; [mn, 0, mx].forEach(v => { g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="${v === 0 ? '#CBD5E1' : '#EEF2F8'}"/><text x="${pl - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#94A3B8">${sg(v, 0)}</text>`; });
  g += `<polyline fill="none" stroke="#94A3B8" stroke-width="1.8" points="${C.filter(p => nz(p[2])).map(p => X(p[0]).toFixed(1) + ',' + Y(p[2]).toFixed(1)).join(' ')}"/>`;
  g += `<polyline fill="none" stroke="#2F6BFF" stroke-width="2.8" points="${C.map(p => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ')}"/>`;
  const l = C[C.length - 1]; g += `<text x="${W - pr + 6}" y="${Y(l[1]) + 4}" font-size="12" font-weight="800" fill="#2F6BFF">You ${sg(l[1], 1)}</text>${nz(l[2]) ? `<text x="${W - pr + 6}" y="${Y(l[2]) + 4 + (Math.abs(Y(l[2]) - Y(l[1])) < 14 ? 14 : 0)}" font-size="12" font-weight="700" fill="#64748B">S&amp;P ${sg(l[2], 1)}</text>` : ''}`;
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Portfolio vs S&P 500">${g}</svg></div><div class="legend"><span><i style="background:#2F6BFF"></i>Your portfolio</span><span><i style="background:#94A3B8"></i>S&amp;P 500 (SPY), same start date</span></div>`;
}

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
  if (LB && !force && Date.now() - LBt < 60000) return LB; const items = await queryAll();
  const owner = {}; items.slice().reverse().forEach(d => { const u = (d.username || '').toLowerCase(); if (u && !owner[u]) owner[u] = d.ownerKey; });
  const latest = {}; items.forEach(d => { if (!d.pid || latest[d.pid]) return; latest[d.pid] = d; });
  LB = Object.values(latest).filter(d => d.public && d.data && owner[(d.username || '').toLowerCase()] === d.ownerKey && (d.data.lots || []).length).map(d => { const P = { id: d.pid, name: d.pname, created: d.data.created, lots: d.data.lots }; return { d, P, c: calc(P) }; });
  LBt = Date.now(); return LB; }
async function nameTaken(u, key) { const items = await queryAll({ username: { $eq: u } }); const lower = items.filter(d => (d.username || '').toLowerCase() === u.toLowerCase()); if (!lower.length) return false; const first = lower[lower.length - 1]; return first.ownerKey !== await sha(key); }

/* ---------- pages ---------- */
const head = (t, sub, on) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p><nav class="pp-sub">${[['', 'My Portfolios'], ['leaderboard', '🏆 Leaderboard'], ['how', 'How It Works']].map(x => `<a href="#/paper${x[0] ? '/' + x[0] : ''}" class="${on === x[0] ? 'on' : ''}">${x[1]}</a>`).join('')}</nav></div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const preview = '<p class="pp-note" style="margin:0">Free during the preview; Paper Trading will become part of Tickerwise Pro. Portfolios are saved in this browser. Public portfolios also go to the leaderboard. Not investment advice.</p>';

function list() {
  const o = rd(), cards = o.list.map(P => { const c = calc(P); return `<a class="pp-c" href="#/paper/p/${P.id}"><h4>${esc(P.name)}<span class="pp-tag ${P.mode === 'game' ? 'g' : 'p'}">${P.mode === 'game' ? 'Leaderboard game' : 'Practice'}</span>${P.pub ? '<span class="pp-tag">Public</span>' : ''}</h4>
      <div class="muted" style="font-size:12.5px">${(P.lots || []).length} trade${(P.lots || []).length === 1 ? '' : 's'} · started ${dfmt(P.created)}</div><div class="pp-v">${money(c.total)}</div><b class="${cls(c.ret)}">${sg(c.ret, 2)}</b> <span class="muted" style="font-size:13px">vs S&amp;P ${sg(c.spx, 1)}</span></a>`; }).join('');
  app.innerHTML = head('Paper Trading', 'Practice investing with $100,000 of virtual money, keep score against the S&amp;P 500, and compete on the public leaderboard.', '') + wrap(`
    ${profileCard(o)}
    ${card('My Portfolios', o.list.length + ' portfolio' + (o.list.length === 1 ? '' : 's'), `<div class="pp-g">${cards}<div class="pp-new" id="pp-new">＋ New Portfolio<small class="muted" style="font-weight:500">Start with $100,000</small></div></div>`)}
    <div id="pp-form"></div>${preview}`);
  $('#pp-new').onclick = () => { $('#pp-form').innerHTML = card('New Portfolio', '', `<div class="pp-f"><label>Name<input id="pn" maxlength="40" placeholder="My Growth Picks"></label>
      <label>Type<select id="pm"><option value="game">Leaderboard game: trades from today forward, at real closing prices</option><option value="practice">Practice: any past date, any price (not ranked)</option></select></label><button class="btn primary" id="pc">Create Portfolio</button></div>`);
    $('#pc').onclick = () => { const n = ($('#pn').value || '').trim() || 'My Portfolio', o2 = rd(), P = { id: uid(), name: n.slice(0, 40), mode: $('#pm').value, created: iso(lastDay() || Math.floor(Date.now() / 864e5)), lots: [], pub: false }; o2.list.push(P); wr(o2); location.hash = '#/paper/p/' + P.id; }; $('#pn').focus(); };
  wireProfile();
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
  const pod = L.slice(0, 3).map((x, i) => `<a class="lb-pod" href="#/paper/player/${encodeURIComponent(x.P.id)}"><div class="m">${['🥇', '🥈', '🥉'][i]}</div><b>${esc(x.d.username)}</b><div class="muted" style="font-size:13px">${esc(x.d.place || '')}</div><div style="margin-top:6px;font:800 22px 'Space Grotesk'" class="${cls(x.c.ret)}">${sg(x.c.ret, 1)}</div><div class="muted" style="font-size:12.5px">${esc(x.P.name)}</div></a>`).join('');
  const rows = L.map((x, i) => `<tr class="clk" data-p="${encodeURIComponent(x.P.id)}"><td><span class="lb-r ${i < 3 ? 'g' + (i + 1) : ''}">${i + 1}</span></td><td><b>${esc(x.d.username)}</b>${me && me.u.toLowerCase() === (x.d.username || '').toLowerCase() ? ' <span class="pp-tag g">You</span>' : ''}</td><td class="muted">${esc(x.d.place || '')}</td><td>${esc(x.P.name)}</td>
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
  $('.page-h h1').textContent = x.d.username + ': ' + x.P.name; ph.textContent = 'From ' + (x.d.place || '—') + ' · started ' + dfmt(x.P.created) + ' · rank #' + rank + ' of ' + L.length + ' by return';
  const open = c.open.map(r => `<tr><td><a href="#/stock/${esc(r.t)}"><b>${esc(r.t)}</b></a></td><td class="num">${r.q.toLocaleString()}</td><td>${dfmt(r.bd)}</td><td class="num">${money2(r.bp)}</td><td class="num">${money2(r.px)}</td><td class="num"><b>${money(r.v)}</b></td><td class="num"><b class="${cls(r.r)}">${sg(r.r, 1)}</b></td><td class="num">${(r.v / c.total * 100).toFixed(1)}%</td></tr>`).join('');
  const closed = c.closed.map(r => `<tr><td><b>${esc(r.t)}</b></td><td class="num">${r.q.toLocaleString()}</td><td>${dfmt(r.bd)}</td><td class="num">${money2(r.bp)}</td><td>${dfmt(r.sd)}</td><td class="num">${money2(r.sp)}</td><td class="num"><b class="${cls(r.r)}">${sg(r.r, 1)}</b></td></tr>`).join('');
  $('#app > section.sec .wrap').innerHTML = `${card('Scorecard', 'started with $100,000', `<div class="pp-k"><div><span>Rank</span><b>#${rank}</b><small>of ${L.length}</small></div><div><span>Portfolio value</span><b>${money(c.total)}</b></div><div><span>Total return</span><b class="${cls(c.ret)}">${sg(c.ret, 2)}</b></div><div><span>S&amp;P 500, same period</span><b class="${cls(c.spx)}">${sg(c.spx, 2)}</b></div><div><span>Best single stock</span><b class="${cls(c.best && c.best.r)}">${c.best ? esc(c.best.t) + ' ' + sg(c.best.r, 0) : '—'}</b></div><div><span>Cash</span><b>${money(c.cash)}</b></div></div>${chart(x.P)}`)}
    ${card('Holdings', c.open.length + ' open', c.open.length ? `<div class="tbl-wrap" style="max-height:none"><table class="tw pp-t"><thead><tr><th>Stock</th><th class="num">Shares</th><th>Bought</th><th class="num">Buy price</th><th class="num">Last price</th><th class="num">Value</th><th class="num">Return</th><th class="num">Weight</th></tr></thead><tbody>${open}</tbody></table></div>` : '<p class="muted" style="margin:0">All cash.</p>')}
    ${c.closed.length ? card('Closed Trades', '', `<div class="tbl-wrap" style="max-height:none"><table class="tw pp-t"><thead><tr><th>Stock</th><th class="num">Shares</th><th>Bought</th><th class="num">Buy price</th><th>Sold</th><th class="num">Sell price</th><th class="num">Return</th></tr></thead><tbody>${closed}</tbody></table></div>`) : ''}
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
window.TWPP = { board, calc, chart, token };
window.addEventListener('hashchange', route); route();
})();
