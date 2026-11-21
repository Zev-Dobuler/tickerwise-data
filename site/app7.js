/* ---------- Social: follow investors with real, checkable track records (Nov 22, 2026). Preview: free; follows are saved in the visitor's browser.
   Three kinds of investor, all real: Tickerwise Verified Lead Traders (applications reviewed by us), superinvestors (13F filings) and members of Congress (STOCK Act disclosures),
   plus the top public paper-trading players. No automatic copying: followers see the trades and get alerts, and decide for themselves. ---------- */
(function () {
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const { S, BY, esc, nz, sg, cls, dfmt } = window.TWX || {};
const app = $('#app'), NX = (window.TW || {}).NX || {}, API = 'https://www.wixapis.com';
const st = document.createElement('style'); st.id = 'so-css'; st.textContent = `
.so-sub{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.so-sub a{padding:7px 14px;border-radius:999px;border:1.5px solid var(--line);font:600 14px Inter,sans-serif;text-decoration:none;color:#334155;background:#fff}.so-sub a.on{background:#0B1B3F;color:#fff;border-color:#0B1B3F}
.so-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}.so-c{border:1.5px solid var(--line);border-radius:16px;padding:16px;background:#fff;display:flex;flex-direction:column;gap:8px}.so-c:hover{border-color:#2F6BFF}
.so-h{display:flex;gap:12px;align-items:center}.so-av{flex:none;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;color:#fff;font:800 17px 'Space Grotesk',sans-serif}
.so-h b{display:block;font:700 16px 'Space Grotesk',sans-serif;line-height:1.2}.so-h small{color:var(--mut);font-size:12.5px}.so-k{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--mut)}.so-k b{color:#0B1B3F}
.so-bd{display:inline-block;font:700 11px Inter,sans-serif;padding:3px 8px;border-radius:999px;margin-right:4px}.so-bd.v{background:#E7F8EF;color:#00995A}.so-bd.f{background:#EEF4FF;color:#2F6BFF}.so-bd.c{background:#FDF2F8;color:#BE185D}.so-bd.p{background:#FFF7E0;color:#9A6B00}.so-bd.s{background:#F1F5F9;color:#475569}
.so-fb{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:8px;border-top:1px solid var(--line)}.so-fb a{font:600 13px Inter,sans-serif}
.so-btn{border:1.5px solid #2F6BFF;background:#2F6BFF;color:#fff;border-radius:10px;padding:7px 12px;font:700 13px Inter,sans-serif;cursor:pointer}.so-btn.on{background:#fff;color:#2F6BFF}
.so-filter{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.so-filter input{padding:8px 12px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;min-width:200px;flex:1}
.so-feed li{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line);list-style:none}.so-feed{margin:0;padding:0}.so-feed .d{flex:none;width:86px;font-size:12.5px;color:var(--mut)}
.so-app{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.so-app label{display:flex;flex-direction:column;gap:4px;font:600 12.5px Inter,sans-serif;color:#334155}.so-app input,.so-app select,.so-app textarea{padding:9px 10px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;width:100%;box-sizing:border-box}.so-app .wide{grid-column:1/-1}
.so-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.so-steps>div{background:#F7F9FC;border-radius:14px;padding:14px}.so-steps b{display:block;font:700 15px 'Space Grotesk',sans-serif;margin-bottom:4px}.so-steps p{margin:0;font-size:13.5px;color:#334155;line-height:1.5}
.so-sample{border:2px dashed #CBD5E1;opacity:.92}.so-ribbon{font:800 11px Inter,sans-serif;letter-spacing:.06em;color:#64748B}
.so-alert{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:#F5F3FF;border:1px solid #DDD6FE;border-radius:12px;padding:10px 14px;font-size:13.5px;margin:0 0 12px}`;
if (!$('#so-css')) document.head.appendChild(st);

/* ---------- follows (browser) ---------- */
const FK = 'tw_follow', rdF = () => { try { return JSON.parse(localStorage.getItem(FK) || '{}'); } catch (e) { return {}; } }, wrF = o => { try { localStorage.setItem(FK, JSON.stringify(o)); } catch (e) {} };
const isF = id => !!rdF()[id];
const COLS = ['#2F6BFF', '#00B86B', '#F28C28', '#9B6BDE', '#E04B4B', '#0EA5E9', '#C9A000', '#14B8A6'];
const av = n => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) >>> 0; const ini = n.replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'; return `<div class="so-av" style="background:${COLS[h % COLS.length]}">${esc(ini)}</div>`; };
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------- investors from public data ---------- */
function supers() { const M = {};
  Object.entries(NX.SI || {}).forEach(([t, v]) => (v[3] || []).forEach(r => { const id = 'si:' + slug(r[0]); (M[id] = M[id] || { id, kind: 'si', name: r[0], pos: [] }).pos.push({ t, pct: r[1], act: r[2], sh: r[3] }); }));
  return Object.values(M).map(m => { m.pos.sort((a, b) => b.pct - a.pct); m.adds = m.pos.filter(p => /^(Buy|Add)/i.test(p.act)).length; m.cuts = m.pos.filter(p => /^Reduce/i.test(p.act)).length; m.w = m.pos.reduce((a, p) => a + p.pct, 0); return m; }).sort((a, b) => b.pos.length - a.pos.length || b.w - a.w); }
function congress() { const M = {}, cut = Date.now() - 365 * 864e5;
  Object.entries(NX.CG || {}).forEach(([t, v]) => (v[2] || []).forEach(r => { const id = 'cg:' + slug(r[2]); (M[id] = M[id] || { id, kind: 'cg', name: r[2], ch: r[3], party: r[4], tr: [] }).tr.push({ t, side: r[0], amt: r[1], d: r[5] }); }));
  return Object.values(M).map(m => { m.tr = m.tr.filter(x => +new Date(x.d) >= cut).sort((a, b) => a.d < b.d ? 1 : -1); m.buys = m.tr.filter(x => x.side === 'P').length; m.sells = m.tr.filter(x => x.side === 'S').length; m.last = m.tr[0] && m.tr[0].d; return m; }).filter(m => m.tr.length).sort((a, b) => b.tr.length - a.tr.length); }
let LT = null; async function leads() { if (LT) return LT; try { const a = await window.TWPP.token(); const r = await fetch(API + '/wix-data/v2/items/query', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: a }, body: JSON.stringify({ dataCollectionId: 'LeadTraders', query: { filter: { verified: { $eq: true } }, cursorPaging: { limit: 100 } } }) }).then(x => x.json());
  LT = (r.dataItems || []).map(i => i.data).map(d => ({ id: 'lt:' + slug(d.handle || d.name), kind: 'lt', name: d.name || d.handle, handle: d.handle, place: d.place, bio: d.bio, style: d.style, since: d.since, data: d.data || {} })); } catch (e) { LT = []; } return LT; }
let PP = null; async function paper() { if (PP) return PP; try { const L = await window.TWPP.board(); PP = L.slice().sort((a, b) => b.c.ret - a.c.ret).slice(0, 24).map(x => ({ id: 'pp:' + x.P.id, kind: 'pp', name: x.d.username, place: x.d.place, x })); } catch (e) { PP = []; } return PP; }

/* ---------- cards ---------- */
const price = '<span class="muted" style="font-size:12.5px">$1/month · free in preview</span>';
const fbtn = id => `<button type="button" class="so-btn ${isF(id) ? 'on' : ''}" data-f="${esc(id)}">${isF(id) ? '✓ Following' : '＋ Follow'}</button>`;
function cardOf(m) {
  const link = '#/social/t/' + encodeURIComponent(m.id);
  if (m.kind === 'si') return `<div class="so-c"><div class="so-h">${av(m.name)}<div><b>${esc(m.name)}</b><small>Fund manager · 13F filings</small></div></div><div><span class="so-bd f">Superinvestor</span><span class="so-bd s">Quarterly, delayed</span></div>
    <div class="so-k"><span><b>${m.pos.length}</b> of our stocks</span><span><b class="up">${m.adds}</b> added</span><span><b class="dn">${m.cuts}</b> cut</span></div><div class="so-k">Top: ${m.pos.slice(0, 3).map(p => `<b>${esc(p.t)}</b> ${p.pct.toFixed(1)}%`).join(' · ')}</div><div class="so-fb"><a href="${link}">View portfolio →</a>${fbtn(m.id)}</div></div>`;
  if (m.kind === 'cg') return `<div class="so-c"><div class="so-h">${av(m.name)}<div><b>${esc(m.name)}</b><small>${m.ch === 'S' ? 'Senate' : 'House'}${m.party ? ' · ' + esc(m.party === 'D' ? 'Democrat' : m.party === 'R' ? 'Republican' : m.party) : ''}</small></div></div><div><span class="so-bd c">Congress</span><span class="so-bd s">Disclosed up to 45 days late</span></div>
    <div class="so-k"><span><b>${m.tr.length}</b> trades in 12 months</span><span><b class="up">${m.buys}</b> buys</span><span><b class="dn">${m.sells}</b> sells</span></div><div class="so-k">Latest: ${m.tr.slice(0, 3).map(x => `<b class="${x.side === 'P' ? 'up' : 'dn'}">${x.side === 'P' ? 'Buy' : 'Sell'}</b> ${esc(x.t)}`).join(' · ')}</div><div class="so-fb"><a href="${link}">View trades →</a>${fbtn(m.id)}</div></div>`;
  if (m.kind === 'pp') { const c = m.x.c; return `<div class="so-c"><div class="so-h">${av(m.name)}<div><b>${esc(m.name)}</b><small>${esc(m.place || '')}</small></div></div><div><span class="so-bd p">Paper trader</span><span class="so-bd s">Virtual money</span></div>
    <div class="so-k"><span>Return <b class="${cls(c.ret)}">${sg(c.ret, 1)}</b></span><span>vs S&amp;P <b class="${cls(nz(c.spx) ? c.ret - c.spx : null)}">${nz(c.spx) ? sg(c.ret - c.spx, 1) : '—'}</b></span><span><b>${c.open.length}</b> holdings</span></div><div class="so-fb"><a href="#/paper/player/${encodeURIComponent(m.x.P.id)}">View portfolio →</a>${fbtn(m.id)}</div></div>`; }
  return `<div class="so-c"><div class="so-h">${av(m.name)}<div><b>${esc(m.name)}</b><small>@${esc(m.handle || '')}${m.place ? ' · ' + esc(m.place) : ''}</small></div></div><div><span class="so-bd v">✓ Tickerwise Verified</span>${m.style ? `<span class="so-bd s">${esc(m.style)}</span>` : ''}</div><p style="margin:0;font-size:13.5px">${esc((m.bio || '').slice(0, 140))}</p><div class="so-fb"><a href="${link}">View profile →</a>${fbtn(m.id)}</div></div>`;
}
const sample = `<div class="so-c so-sample"><div class="so-ribbon">EXAMPLE PROFILE · NOT A REAL TRADER</div><div class="so-h"><div class="so-av" style="background:#94A3B8">?</div><div><b>Your Name Here</b><small>@yourhandle · Your city</small></div></div><div><span class="so-bd v">✓ Tickerwise Verified</span><span class="so-bd s">Growth · 3–12 month holds</span></div>
  <p style="margin:0;font-size:13.5px">What a verified Lead Trader profile will show: background, strategy, a broker-verified track record, 1-year return, risk level, win rate and every trade as it happens.</p><div class="so-fb"><a href="#/social/apply">Apply to be a Lead Trader →</a>${price}</div></div>`;

/* ---------- pages ---------- */
const head = (t, sub, on) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p><nav class="so-sub">${[['', 'Discover'], ['following', 'Following'], ['apply', 'Become a Lead Trader'], ['how', 'How It Works']].map(x => `<a href="#/social${x[0] ? '/' + x[0] : ''}" class="${on === x[0] ? 'on' : ''}">${x[1]}</a>`).join('')}</nav></div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const preview = '<p class="muted" style="font-size:12.5px;margin:0">Free during the preview; following will cost $1 a month per investor and sit inside Tickerwise Pro. Follows are saved in this browser for now. Tickerwise shows trades for information only: it never places trades for you, and nothing here is investment advice.</p>';
const alertBox = '<div class="so-alert"><b>🔔 Trade alerts</b><span>When a followed investor makes a new trade, followers get an email and a site alert. Email alerts switch on when accounts launch; until then, new trades show in your Following feed.</span></div>';
let Q = '', K = 'all';
async function discover() {
  app.innerHTML = head('Social', 'Follow investors with real, checkable track records: see their portfolios and every new trade.', '') + wrap('<div class="card"><p class="muted">Loading investors…</p></div>');
  const [lt, pp] = await Promise.all([leads(), paper()]), si = supers(), cg = congress(); if (!/^#\/social\/?$/.test(location.hash)) return;
  const all = { lt, si, cg, pp }, KS = [['all', 'All'], ['lt', 'Verified Lead Traders'], ['si', 'Superinvestors'], ['cg', 'Congress'], ['pp', 'Top Paper Traders']];
  const filt = arr => arr.filter(m => !Q || (m.name + ' ' + (m.place || '')).toLowerCase().includes(Q.toLowerCase()));
  const sec = (k, title, sub, arr, extra) => (K === 'all' || K === k) ? card(title, sub, `<div class="so-g">${(extra || '') + filt(arr).slice(0, K === k ? 200 : 8).map(cardOf).join('') || '<p class="muted">No matches.</p>'}</div>${K === 'all' && filt(arr).length > 8 ? `<p style="margin:10px 0 0"><a href="#" data-k="${k}">See all ${filt(arr).length} →</a></p>` : ''}`) : '';
  $('#app > section.sec .wrap').innerHTML = `${alertBox}<div class="so-filter"><input id="so-q" placeholder="Search investors by name or place" value="${esc(Q)}"><div class="seg">${KS.map(k => `<button type="button" class="${k[0] === K ? 'on' : ''}" data-k="${k[0]}">${k[1]}</button>`).join('')}</div></div>
    ${sec('lt', 'Verified Lead Traders', 'real investors, real money, verified by Tickerwise', lt, lt.length ? '' : sample)}
    ${sec('si', 'Superinvestors', 'famous fund managers, from their quarterly 13F filings (Dataroma)', si)}
    ${sec('cg', 'Members of Congress', 'stock trades they must disclose by law (Quiver Quantitative)', cg)}
    ${sec('pp', 'Top Paper Traders', 'the best public portfolios in Paper Trading (virtual money)', pp)}${preview}`;
  wire(); $('#so-q').oninput = e => { Q = e.target.value; clearTimeout(window.__soq); window.__soq = setTimeout(() => { const p = e.target.selectionStart; discover().then(() => { const i = $('#so-q'); if (i) { i.focus(); i.setSelectionRange(p, p); } }); }, 250); };
  $$('[data-k]').forEach(b => b.onclick = e => { e.preventDefault(); K = b.dataset.k; discover(); });
}
function wire() { $$('[data-f]').forEach(b => b.onclick = () => { const o = rdF(), id = b.dataset.f; if (o[id]) delete o[id]; else o[id] = { at: new Date().toISOString().slice(0, 10) }; wrF(o); b.classList.toggle('on', !!o[id]); b.textContent = o[id] ? '✓ Following' : '＋ Follow'; }); }
async function find(id) { if (id.startsWith('si:')) return supers().find(m => m.id === id); if (id.startsWith('cg:')) return congress().find(m => m.id === id); if (id.startsWith('lt:')) return (await leads()).find(m => m.id === id); if (id.startsWith('pp:')) return (await paper()).find(m => m.id === id); return null; }
async function profile(id) {
  app.innerHTML = head('Investor', 'Loading…', '') + wrap('<div class="card"><p class="muted">Loading…</p></div>'); const m = await find(id), ph = $('.page-h p'), w = $('#app > section.sec .wrap');
  if (!m) { ph.textContent = 'Investor not found.'; w.innerHTML = '<a class="btn ghost" href="#/social">← Back</a>'; return; }
  if (m.kind === 'pp') { location.hash = '#/paper/player/' + encodeURIComponent(m.x.P.id); return; }
  $('.page-h h1').innerHTML = esc(m.name);
  if (m.kind === 'si') { ph.textContent = 'Fund manager · holdings from the latest 13F filing, for the ' + m.pos.length + ' Tickerwise stocks they own';
    w.innerHTML = `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${fbtn(m.id)} ${price}</div>${alertBox}${card('Portfolio', 'stocks Tickerwise covers, by weight in their portfolio', `<div class="tbl-wrap" style="max-height:none"><table class="tw"><thead><tr><th>Stock</th><th class="num">% of their portfolio</th><th>Latest quarter</th><th class="num">Shares</th><th class="num">Tickerwise Score</th></tr></thead><tbody>${m.pos.map(p => `<tr><td><a href="#/stock/${esc(p.t)}"><b>${esc(p.t)}</b></a> <span class="muted">${esc((BY[p.t] || {}).n || '')}</span></td><td class="num">${p.pct.toFixed(2)}%</td><td><b class="${/^(Buy|Add)/i.test(p.act) ? 'up' : /^Reduce/i.test(p.act) ? 'dn' : ''}">${esc(p.act || 'No change')}</b></td><td class="num">${esc(p.sh)}</td><td class="num">${BY[p.t] ? BY[p.t].ws + '/10' : '—'}</td></tr>`).join('')}</tbody></table></div><p class="muted" style="font-size:12.5px;margin:10px 0 0">Source: Dataroma, from the fund's quarterly 13F filing (filed up to 45 days after quarter-end). Only stocks Tickerwise covers are shown, so this is part of the full portfolio.</p>`)}` + preview; }
  else if (m.kind === 'cg') { ph.textContent = (m.ch === 'S' ? 'U.S. Senate' : 'U.S. House') + (m.party ? ' · ' + (m.party === 'D' ? 'Democrat' : m.party === 'R' ? 'Republican' : m.party) : '') + ' · trades disclosed under the STOCK Act';
    w.innerHTML = `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${fbtn(m.id)} ${price}</div>${alertBox}${card('Trades, Last 12 Months', m.buys + ' buys · ' + m.sells + ' sells', `<div class="tbl-wrap" style="max-height:none"><table class="tw"><thead><tr><th>Traded</th><th>Stock</th><th>Trade</th><th class="num">Amount</th><th class="num">Tickerwise Score</th></tr></thead><tbody>${m.tr.map(x => `<tr><td>${dfmt(x.d)}</td><td><a href="#/stock/${esc(x.t)}"><b>${esc(x.t)}</b></a></td><td><b class="${x.side === 'P' ? 'up' : x.side === 'S' ? 'dn' : ''}">${x.side === 'P' ? 'Purchase' : x.side === 'S' ? 'Sale' : 'Exchange'}</b></td><td class="num">$${esc(String(x.amt).replace(/\s*-\s*/, ' – $'))}</td><td class="num">${BY[x.t] ? BY[x.t].ws + '/10' : '—'}</td></tr>`).join('')}</tbody></table></div><p class="muted" style="font-size:12.5px;margin:10px 0 0">Source: Quiver Quantitative, from STOCK Act disclosures. Members report trades up to 45 days late, and only as dollar ranges. Only stocks Tickerwise covers are shown.</p>`)}` + preview; }
  else { ph.textContent = '@' + (m.handle || '') + (m.place ? ' · ' + m.place : '') + (m.since ? ' · investing since ' + m.since : '');
    w.innerHTML = `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${fbtn(m.id)} ${price}</div>${alertBox}${card('About', '<span class="so-bd v">✓ Tickerwise Verified</span>', `<p style="margin:0;line-height:1.6">${esc(m.bio || '')}</p>${m.style ? `<p class="muted" style="margin:8px 0 0">Style: ${esc(m.style)}</p>` : ''}`)}` + preview; }
  wire();
}
async function following() {
  app.innerHTML = head('Following', 'New trades from the investors you follow, newest first.', 'following') + wrap('<div class="card"><p class="muted">Loading…</p></div>');
  const F = rdF(), ids = Object.keys(F), w = $('#app > section.sec .wrap');
  if (!ids.length) { w.innerHTML = alertBox + card('Your Feed', '', '<p style="margin:0">You are not following anyone yet. <a href="#/social">Discover investors →</a></p>') + preview; return; }
  const ms = (await Promise.all(ids.map(find))).filter(Boolean), ev = [];
  ms.forEach(m => { if (m.kind === 'cg') m.tr.forEach(x => ev.push({ d: x.d, m, h: `<b class="${x.side === 'P' ? 'up' : 'dn'}">${x.side === 'P' ? 'Bought' : 'Sold'}</b> <a href="#/stock/${esc(x.t)}"><b>${esc(x.t)}</b></a> <span class="muted">$${esc(String(x.amt).replace(/\s*-\s*/, ' – $'))}</span>` }));
    if (m.kind === 'si') m.pos.filter(p => p.act).forEach(p => ev.push({ d: '', q: 1, m, h: `<b class="${/^(Buy|Add)/i.test(p.act) ? 'up' : 'dn'}">${esc(p.act)}</b> <a href="#/stock/${esc(p.t)}"><b>${esc(p.t)}</b></a> <span class="muted">now ${p.pct >= 0.1 ? p.pct.toFixed(1) + '%' : 'under 0.1%'} of the portfolio</span>` }));
    if (m.kind === 'pp') (m.x.P.lots || []).forEach(l => { ev.push({ d: l.bd, m, h: `<b class="up">Bought</b> ${l.q} <a href="#/stock/${esc(l.t)}"><b>${esc(l.t)}</b></a> at $${(+l.bp).toFixed(2)} <span class="muted">(paper)</span>` }); if (l.sd) ev.push({ d: l.sd, m, h: `<b class="dn">Sold</b> ${l.q} <a href="#/stock/${esc(l.t)}"><b>${esc(l.t)}</b></a> at $${(+l.sp).toFixed(2)} <span class="muted">(paper)</span>` }); }); });
  ev.sort((a, b) => a.d < b.d ? 1 : -1);
  w.innerHTML = alertBox + card('Your Feed', ms.length + ' investor' + (ms.length === 1 ? '' : 's') + ' followed', `<ul class="so-feed">${ev.slice(0, 80).map(e => `<li><span class="d">${e.q ? 'Latest 13F' : dfmt(e.d)}</span>${av(e.m.name)}<div><a href="#/social/t/${encodeURIComponent(e.m.id)}"><b>${esc(e.m.name)}</b></a><div>${e.h}</div></div></li>`).join('') || '<li>No trades yet from the investors you follow.</li>'}</ul>`)
    + card('Following', '', `<div class="so-g">${ms.map(cardOf).join('')}</div>`) + preview; wire();
}
function apply() {
  app.innerHTML = head('Become a Lead Trader', 'Share your real portfolio, build a following, and earn from every follower.', 'apply') + wrap(`
    ${card('How It Works For Lead Traders', '', `<div class="so-steps"><div><b>1. Apply</b><p>Tell us about your experience and strategy. We review every application by hand.</p></div><div><b>2. Get verified</b><p>Connect your brokerage (read-only) so your trades and returns come straight from the broker. No screenshots, no self-reported numbers.</p></div><div><b>3. Publish</b><p>Your profile, holdings and every new trade appear on Tickerwise. Followers get an alert the moment you trade.</p></div><div><b>4. Earn</b><p>Followers pay $1 a month to follow you. Lead Traders keep a share of what their followers pay.</p></div></div>`)}
    ${card('Application', 'takes 3 minutes', `<div class="so-app"><label>Full name<input id="a1" maxlength="60"></label><label>Email<input id="a2" type="email" maxlength="80"></label><label>Public handle<input id="a3" maxlength="20" placeholder="e.g. valuehunter"></label><label>Where you're from<input id="a4" maxlength="40"></label>
      <label>Years investing<select id="a5"><option>Less than 2</option><option>2–5</option><option>5–10</option><option>10+</option></select></label><label>Style<select id="a6"><option>Long-term growth</option><option>Value</option><option>Dividends and income</option><option>Swing trading (days to weeks)</option><option>Thematic (AI, defense, energy…)</option><option>Mixed</option></select></label>
      <label>Main broker<input id="a7" maxlength="40" placeholder="e.g. Schwab, IBKR, Fidelity"></label><label>Links (optional)<input id="a8" maxlength="200" placeholder="X, LinkedIn, blog"></label>
      <label class="wide">About you and your approach<textarea id="a9" rows="4" maxlength="800"></textarea></label>
      <label class="wide" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="a10" style="width:auto"> I confirm I trade with my own real money and will share real, broker-verified results.</label>
      <div><button class="btn primary" id="asend">Send Application</button></div></div><p class="muted" id="amsg" style="margin:8px 0 0"></p>`)}${preview}`);
  $('#asend').onclick = async () => { const v = i => ($('#a' + i).value || '').trim(), m = $('#amsg');
    if (!v(1) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v(2)) || !v(3) || !v(9)) { m.style.color = '#D72B45'; m.textContent = 'Please fill in your name, a valid email, a handle and a few words about your approach.'; return; }
    if (!$('#a10').checked) { m.style.color = '#D72B45'; m.textContent = 'Please confirm the real-money checkbox.'; return; }
    m.style.color = ''; m.textContent = 'Sending…';
    try { const a = await window.TWPP.token(); const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: a }, body: JSON.stringify({ dataCollectionId: 'LeadTraderApplications', dataItem: { data: { name: v(1), email: v(2), handle: v(3), place: v(4), experience: v(5), style: v(6), broker: v(7), links: v(8), bio: v(9) } } }) });
      if (!r.ok) throw 0; m.style.color = '#00995A'; m.textContent = 'Thanks! Your application is in. We will email you about the next step (broker verification).'; $('#asend').disabled = true; } catch (e) { m.style.color = '#D72B45'; m.textContent = 'Could not send right now. Please try again.'; } };
}
function how() {
  app.innerHTML = head('How Social Works', 'Follow real investors. See what they hold and every trade they make. Decide for yourself.', 'how') + wrap(card('For Followers', '', `<div class="so-steps">
    <div><b>Discover</b><p>Browse four kinds of investors: <b>Verified Lead Traders</b> (real money, broker-verified), <b>Superinvestors</b> (13F filings), <b>Members of Congress</b> (legal trade disclosures) and the <b>Top Paper Traders</b> from our leaderboard.</p></div>
    <div><b>Follow</b><p>Follow anyone for $1 a month (free during the preview). Cancel any time.</p></div>
    <div><b>Get alerts</b><p>The moment a followed investor trades, you get an email and a site alert, and the trade appears in your Following feed.</p></div>
    <div><b>Compare</b><p>Every profile shows the portfolio, recent trades and the Tickerwise Score of each stock they hold, so you can judge their moves with our research.</p></div></div>`)
    + card('What We Don\'t Do', '', `<ul style="margin:0;padding-left:18px;line-height:1.7"><li>We never place trades for you. There is no automatic copying; you decide every trade at your own broker.</li><li>We don't show self-reported returns for Lead Traders: results come from their broker.</li><li>Filings data (13F, Congress) is public and delayed, so those trades are already weeks or months old when they appear.</li></ul>`) + preview);
}

/* ---------- router ---------- */
function navLink() { const n = $('#navlinks'); if (n && !$('a[data-r="social"]', n)) { const pl = $('a[data-r="plans"]', n), a = '<a href="#/social" data-r="social">Social</a>'; if (pl) pl.insertAdjacentHTML('beforebegin', a); else n.insertAdjacentHTML('beforeend', a); } }
function route() {
  const h = location.hash.replace(/^#\/?/, '').split('#')[0], p = h.split('/'); navLink(); $$('#navlinks a').forEach(a => { if (a.dataset.r === 'social') a.classList.toggle('on', p[0] === 'social'); });
  if (p[0] !== 'social') return; $$('#navlinks a').forEach(a => { if (a.dataset.r !== 'social') a.classList.remove('on'); });
  try { if (p[1] === 't' && p[2]) profile(decodeURIComponent(p[2])); else if (p[1] === 'following') following(); else if (p[1] === 'apply') apply(); else if (p[1] === 'how') how(); else discover(); } catch (e) { if (window.console) console.error(e); }
  document.title = 'Social — Tickerwise'; window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route); route();
})();
