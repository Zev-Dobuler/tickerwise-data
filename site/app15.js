/* Tickerwise app15: the rest of the wish list.
   Live Community (posts, weekly polls, holder badges, Q&A), private Leagues, Replay leaderboard + daily challenge, Groups,
   Creator program, paper Limit/Stop orders, simulated paper Options (Black-Scholes), score widgets (#/embed/T), custom Dashboard,
   Broker comparison, Fair Value calculator, Fund Letters library, Sector Rotation of the legends, and "Upgraded Plan" gates
   for everything that needs a backend (email/SMS alerts, AI chat, broker linking, native apps, real options chains, transcripts). */
(function () {
if (window.TWZ) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, dfmt } = X, PP = window.TWPP || {}, app = $('#app'); if (!app || !esc || !S) return;
const API = 'https://www.wixapis.com', jget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const ser = t => (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => nz(p.c)), last = t => { const z = ser(t); return z[z.length - 1]; };
const pct = (v, d = 1) => !nz(v) ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%', usd = (v, d = 2) => !nz(v) ? '—' : (v < 0 ? '−$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const gcol = v => v > 0 ? 'up' : v < 0 ? 'dn' : '';
const card = (t, s, inner, id) => `<div class="card"${id ? ` id="${id}"` : ''}><div class="card-h"><h3>${t}</h3>${s ? `<span>${s}</span>` : ''}</div>${inner}</div>`;
const head = (t, sub, extra) => `<section class="page-h"><div class="wrap"><h1>${t}</h1><p>${sub}</p>${extra || ''}</div></section>`;
const wrap = h => `<section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">${h}</div></section>`;
const tl = t => BY[t] ? `<a href="#/stock/${esc(t)}"><b>${esc(t)}</b></a>` : `<b>${esc(t)}</b>`;
const UP = '<span class="tw-up">Upgraded Plan</span>', DEMO = '<span class="tz-demo">Simulated</span>';
const toast = h => (window.TWA ? window.TWA.toast(h) : alert(h.replace(/<[^>]+>/g, '')));
const member = () => window.TWA && window.TWA.member ? window.TWA.member() : null;
const needLogin = () => { const b = document.createElement('a'); b.setAttribute('data-login', 'up'); b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); };
const nick = () => (member() || {}).nick || 'Member';
const opts = (a, v) => a.map(x => `<option value="${esc(x[0])}"${x[0] === v ? ' selected' : ''}>${esc(x[1])}</option>`).join('');
const tickOpts = v => opts(S.slice().sort((a, b) => a.t < b.t ? -1 : 1).map(s => [s.t, s.t + ' · ' + (s.n || '')]), v);

/* ---------- Wix Data (public reads with a visitor token; writes need a member) ---------- */
async function tok(write) { if (member() && window.TWA.token) { const t = await window.TWA.token(); if (t) return t; } if (write) return null; return PP.token ? PP.token() : null; }
async function q(coll, filter, sort, limit) { try { const t = await tok(); const r = await fetch(API + '/wix-data/v2/items/query', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t || '' }, body: JSON.stringify({ dataCollectionId: coll, query: { filter: filter || {}, sort: sort || [{ fieldName: '_createdDate', order: 'DESC' }], cursorPaging: { limit: limit || 50 } } }) }); if (!r.ok) return null; const j = await r.json(); return (j.dataItems || []).map(i => Object.assign({ _id: i.id, _at: i.data._createdDate && (i.data._createdDate.$date || i.data._createdDate) }, i.data)); } catch (e) { return null; } }
async function ins(coll, data) { if (!member()) { needLogin(); return null; } const t = await tok(true); if (!t) { needLogin(); return null; } try { const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: t }, body: JSON.stringify({ dataCollectionId: coll, dataItem: { data } }) }); if (!r.ok) { toast('Sorry, that did not save. Please try again.'); return null; } return (await r.json()).dataItem; } catch (e) { toast('Sorry, that did not save. Please try again.'); return null; } }
const ago = s => { if (!s) return ''; const m = (Date.now() - new Date(s)) / 6e4; return m < 1 ? 'just now' : m < 60 ? Math.floor(m) + 'm ago' : m < 1440 ? Math.floor(m / 60) + 'h ago' : Math.floor(m / 1440) + 'd ago'; };
const wk = () => { const d = new Date(), j = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return d.getUTCFullYear() + '-W' + String(Math.ceil(((d - j) / 864e5 + j.getUTCDay() + 1) / 7)).padStart(2, '0'); };
const holds = t => (jget('tw_paper', { list: [] }).list || []).some(P => (P.lots || []).some(l => l.t === t && !l.sd));
const offline = '<p class="muted" style="margin:0">Live posts could not load right now. Please try again in a minute.</p>';

const css = document.createElement('style'); css.textContent = `
.tw-up{display:inline-block;background:linear-gradient(90deg,#7C3AED,#2F6BFF);color:#fff;font:700 11px Inter,sans-serif;padding:3px 9px;border-radius:999px;letter-spacing:.02em;white-space:nowrap;vertical-align:middle}
.tz-demo{display:inline-block;background:#FEF3C7;color:#92400E;font:700 11px Inter,sans-serif;padding:3px 9px;border-radius:999px;vertical-align:middle}
.tz-f{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}.tz-f label{display:flex;flex-direction:column;gap:4px;font:600 12px Inter,sans-serif;color:var(--mut);flex:1 1 140px;min-width:0}
.tz-f input,.tz-f select,.tz-f textarea,.tz-in{padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif;background:#fff;color:#0B1B3F;min-width:0;width:100%;box-sizing:border-box}
.tz-f textarea{min-height:70px;resize:vertical}.tz-f .btn{flex:0 0 auto}
.tz-t{width:100%;border-collapse:collapse;font-size:14px}.tz-t th{text-align:left;font:700 12px Inter,sans-serif;color:var(--mut);padding:8px;border-bottom:1.5px solid var(--line);white-space:nowrap}.tz-t td{padding:9px 8px;border-bottom:1px solid var(--line);vertical-align:top}.tz-t td.n,.tz-t th.n{text-align:right;white-space:nowrap}
.tz-sc{overflow-x:auto;-webkit-overflow-scrolling:touch}
.tz-post{border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;background:#fff}.tz-post+.tz-post{margin-top:10px}.tz-post .h{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px;color:var(--mut);margin-bottom:6px}.tz-post .h b{color:#0B1B3F}.tz-post p{margin:0;white-space:pre-wrap;word-wrap:break-word;line-height:1.55}
.tz-side{font:800 11px Inter,sans-serif;padding:2px 8px;border-radius:999px}.tz-side.bull{background:#DCFCE7;color:#047857}.tz-side.bear{background:#FEE2E2;color:#B91C1C}.tz-hold{background:#DBEAFE;color:#1E40AF;font:700 11px Inter,sans-serif;padding:2px 8px;border-radius:999px}
.tz-poll{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.tz-bar{flex:1 1 220px;height:14px;border-radius:999px;background:#FEE2E2;overflow:hidden}.tz-bar i{display:block;height:100%;background:linear-gradient(90deg,#00C176,#10B981)}
.tz-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.tz-tile{position:relative;display:flex;flex-direction:column;gap:6px;padding:18px;border:1.5px solid var(--line);border-radius:18px;background:#fff;text-decoration:none;color:#0B1B3F}.tz-tile i{font-style:normal;font-size:26px}.tz-tile b{font:800 17px 'Space Grotesk',sans-serif}.tz-tile span{font-size:13.5px;color:var(--mut);line-height:1.5}.tz-tile .tw-up{position:absolute;right:12px;top:12px}
.tz-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.tz-k>div{background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px}.tz-k span{display:block;font-size:12px;color:var(--mut);font-weight:600}.tz-k b{display:block;font:800 20px 'Space Grotesk',sans-serif}
.tz-code{font:700 15px ui-monospace,Menlo,monospace;background:#0B1B3F;color:#fff;padding:3px 10px;border-radius:8px;letter-spacing:.08em}
.tz-lock{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:14px 16px;border-radius:14px;background:linear-gradient(90deg,#F5F3FF,#EFF6FF);border:1.5px dashed #A78BFA}
.tz-lock p{margin:0;flex:1 1 240px;font-size:14px;line-height:1.5}
.tz-ch{display:flex;gap:6px;flex-wrap:wrap}.tz-ch button{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:7px 12px;font:600 13px Inter,sans-serif;cursor:pointer}.tz-ch button.on{background:#0B1B3F;color:#fff;border-color:#0B1B3F}
.tz-w{border:1.5px solid var(--line);border-radius:18px;padding:16px;background:#fff;max-width:340px;font-family:Inter,sans-serif}
body.tz-embed header,body.tz-embed footer,body.tz-embed .ticker,body.tz-embed .tape,body.tz-embed nav.top{display:none!important}body.tz-embed{background:transparent!important}
.up{color:#059669}.dn{color:#DC2626}
@media(max-width:640px){.tz-hm{display:none}}
`; document.head.appendChild(css);
const lock = (what, extra) => `<div class="tz-lock"><p>${UP} <b>${what}</b> ${extra || 'requires the upgraded plan.'}</p><a class="btn primary" href="#/plans">See Plans</a></div>`;

/* ============ LIVE COMMUNITY on stock pages ============ */
async function stockCommunity(t) {
  const m = $('.main'); if (!m || $('#tz-com', m)) return; const el = document.createElement('div'); el.className = 'card'; el.id = 'tz-com';
  const after = $('#tt-rc', m) || $('#ta-sh', m); after ? after.after(el) : m.appendChild(el); const voted = jget('tw_votes', {})[t + wk()];
  el.innerHTML = `<div class="card-h"><h3>Live Community</h3><span>members across Tickerwise · ${esc(t)}</span></div>
   <div id="tz-poll" class="tz-poll"><span class="muted">Loading this week's poll…</span></div>
   <form class="tz-f" id="tz-pf" style="margin:14px 0"><label style="flex:0 1 150px">Your view<select name="side"><option value="bull">🐂 Bullish</option><option value="bear">🐻 Bearish</option><option value="">Neutral</option></select></label><label style="flex:1 1 100%">Post<textarea name="text" maxlength="600" placeholder="Share your thesis, a catalyst, or a question about ${esc(t)}…"></textarea></label><button class="btn primary">Post</button>${holds(t) ? '<span class="tz-hold">✓ You hold it in Paper Trading</span>' : ''}</form>
   <div id="tz-pl"><p class="muted">Loading posts…</p></div>`;
  $('#tz-pf', el).onsubmit = async e => { e.preventDefault(); const f = e.target, text = f.text.value.trim(); if (text.length < 3) return; const r = await ins('CommunityPosts', { t, kind: 'post', text, side: f.side.value, nick: nick(), holder: holds(t), parent: '' }); if (r) { f.text.value = ''; toast('✓ Posted'); loadPosts(t); } };
  loadPoll(t, voted); loadPosts(t);
}
async function loadPoll(t) {
  const box = $('#tz-poll'); if (!box) return; const L = await q('PollVotes', { t: { $eq: t }, wk: { $eq: wk() } }, null, 1000), me = jget('tw_votes', {})[t + wk()];
  if (!L) { box.innerHTML = ''; return; } const b = L.filter(x => x.vote === 'bull').length, n = L.length, sh = n ? Math.round(b / n * 100) : 50;
  box.innerHTML = `<b style="flex:0 0 auto">This week: ${esc(t)} up or down?</b>${me ? `<div class="tz-bar" title="${b} bullish, ${n - b} bearish"><i style="width:${sh}%"></i></div><span class="muted" style="font-size:13px">${sh}% bullish · ${n} vote${n === 1 ? '' : 's'} · you voted ${me === 'bull' ? '🐂' : '🐻'}</span>` : `<button class="btn ghost" data-v="bull">🐂 Up</button><button class="btn ghost" data-v="bear">🐻 Down</button><span class="muted" style="font-size:13px">${n} vote${n === 1 ? '' : 's'} so far · results show after you vote</span>`}`;
  $$('[data-v]', box).forEach(x => x.onclick = async () => { const l = last(t), r = await ins('PollVotes', { t, vote: x.dataset.v, wk: wk(), px: l ? l.c : null }); if (r) { const V = jget('tw_votes', {}); V[t + wk()] = x.dataset.v; jset('tw_votes', V); loadPoll(t); } });
}
const postHTML = p => `<div class="tz-post" data-id="${esc(p._id || '')}"><div class="h"><b>${esc(p.nick || 'Member')}</b>${p.side ? `<span class="tz-side ${p.side}">${p.side === 'bull' ? '🐂 Bullish' : '🐻 Bearish'}</span>` : ''}${p.holder ? '<span class="tz-hold">✓ Holds in Paper</span>' : ''}${p.t && p.t !== 'QA' ? `<a href="#/stock/${esc(p.t)}">$${esc(p.t)}</a>` : ''}<span>${ago(p._at)}</span></div><p>${esc(p.text || '')}</p></div>`;
async function loadPosts(t) { const box = $('#tz-pl'); if (!box) return; const L = await q('CommunityPosts', { t: { $eq: t }, kind: { $eq: 'post' } }, null, 30); if (!$('#tz-pl')) return; box.innerHTML = L == null ? offline : L.length ? L.map(postHTML).join('') : `<p class="muted" style="margin:0">No posts on ${esc(t)} yet. Be the first.</p>`; }

/* ============ COMMUNITY HUB + TRADER Q&A ============ */
async function community() {
  app.innerHTML = head('Community', 'What members are saying across every stock, plus questions for the community and our Lead Traders.') + wrap(`
    ${card('Ask the Community', 'questions get answers from members and Lead Traders', `<form class="tz-f" id="tz-qf"><label style="flex:1 1 100%">Your question<textarea name="text" maxlength="600" placeholder="e.g. How do you decide when to take profits on a big winner?"></textarea></label><button class="btn primary">Ask</button></form><div id="tz-qa" style="margin-top:14px"><p class="muted">Loading…</p></div>`)}
    ${card('Latest Posts', 'from every stock page', '<div id="tz-all"><p class="muted">Loading…</p></div>')}`);
  document.title = 'Community — Tickerwise';
  $('#tz-qf').onsubmit = async e => { e.preventDefault(); const text = e.target.text.value.trim(); if (text.length < 5) return; if (await ins('CommunityPosts', { t: 'QA', kind: 'qa', text, side: '', nick: nick(), holder: false, parent: '' })) { e.target.text.value = ''; loadQA(); } };
  loadQA(); const L = await q('CommunityPosts', { kind: { $eq: 'post' } }, null, 40); const b = $('#tz-all'); if (b) b.innerHTML = L == null ? offline : L.length ? L.map(postHTML).join('') : '<p class="muted" style="margin:0">No posts yet. Open any stock page to start the conversation.</p>';
}
async function loadQA() {
  const box = $('#tz-qa'); if (!box) return; const L = await q('CommunityPosts', { kind: { $in: ['qa', 'ans'] } }, null, 200); if (L == null) { box.innerHTML = offline; return; }
  const Qs = L.filter(x => x.kind === 'qa'), A = L.filter(x => x.kind === 'ans');
  box.innerHTML = Qs.length ? Qs.map(x => `<div class="tz-post"><div class="h"><b>${esc(x.nick || 'Member')}</b><span>asked ${ago(x._at)}</span></div><p><b>${esc(x.text)}</b></p>
    ${A.filter(a => a.parent === x._id).reverse().map(a => `<div style="margin:10px 0 0 14px;padding-left:12px;border-left:3px solid var(--line)"><div class="h"><b>${esc(a.nick || 'Member')}</b><span>${ago(a._at)}</span></div><p>${esc(a.text)}</p></div>`).join('')}
    <form class="tz-f" data-p="${esc(x._id)}" style="margin-top:10px"><label style="flex:1 1 200px"><input name="text" maxlength="600" placeholder="Write an answer…"></label><button class="btn ghost">Answer</button></form></div>`).join('') : '<p class="muted" style="margin:0">No questions yet. Ask the first one.</p>';
  $$('form[data-p]', box).forEach(f => f.onsubmit = async e => { e.preventDefault(); const text = f.text.value.trim(); if (text.length < 2) return; if (await ins('CommunityPosts', { t: 'QA', kind: 'ans', text, side: '', nick: nick(), holder: false, parent: f.dataset.p })) loadQA(); });
}

/* ============ LEAGUES ============ */
const myL = () => jget('tw_leagues', []), papers = () => (jget('tw_paper', { list: [] }).list || []);
const code6 = () => Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
async function leagues(c) {
  if (c) return league(c.toUpperCase());
  const L = myL();
  app.innerHTML = head('Leagues', 'Private Paper Trading leagues for friends, families, classes and clubs. Create one, share the code, and race on real prices.') + wrap(`
    ${window.TWQ ? window.TWQ.banner('candles', 'Private leagues', 'Your own <em>trading league</em>.', 'Everyone starts with $100,000 of paper money. Members post their Paper Trading results to the league board, which ranks by return.', [[L.length, 'leagues you are in']]) : ''}
    <div class="tz-g" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    ${card('Create a League', 'free for members', `<form class="tz-f" id="tz-lc"><label style="flex:1 1 100%">League name<input name="name" maxlength="40" placeholder="e.g. Dobuler Family Cup" required></label><label>Ends on<input type="date" name="end" value="${new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10)}"></label><label>Max positions<select name="max"><option>5</option><option selected>10</option><option>20</option><option value="0">No limit</option></select></label><button class="btn primary">Create</button></form>`)}
    ${card('Join a League', 'enter the code a friend sent you', `<form class="tz-f" id="tz-lj"><label>League code<input name="code" maxlength="6" placeholder="ABC123" style="text-transform:uppercase" required></label><button class="btn primary">Join</button></form>`)}
    </div>
    ${card('Your Leagues', '', L.length ? `<div class="tz-sc"><table class="tz-t"><tr><th>League</th><th>Code</th><th></th></tr>${L.map(x => `<tr><td><b>${esc(x.name)}</b></td><td><span class="tz-code">${esc(x.code)}</span></td><td class="n"><a class="btn ghost" href="#/leagues/${esc(x.code)}">Open</a></td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">You have not joined a league yet.</p>')}`);
  document.title = 'Leagues — Tickerwise'; if (window.TWQ) window.TWQ.wake(app);
  $('#tz-lc').onsubmit = async e => { e.preventDefault(); const f = e.target, code = code6(), name = f.name.value.trim(); const r = await ins('Leagues', { code, name, nick: nick(), rules: { start: 100000, end: f.end.value, max: +f.max.value } }); if (r) { jset('tw_leagues', myL().concat([{ code, name }])); location.hash = '#/leagues/' + code; } };
  $('#tz-lj').onsubmit = async e => { e.preventDefault(); const code = e.target.code.value.trim().toUpperCase(); const r = await q('Leagues', { code: { $eq: code } }, null, 1); if (!r || !r.length) { toast('No league found with code ' + esc(code)); return; } if (!myL().some(x => x.code === code)) jset('tw_leagues', myL().concat([{ code, name: r[0].name }])); location.hash = '#/leagues/' + code; };
}
async function league(code) {
  app.innerHTML = head('League', 'Loading…') + wrap('<p class="muted">Loading…</p>'); const r = await q('Leagues', { code: { $eq: code } }, null, 1); const Lg = r && r[0];
  if (!Lg) { app.innerHTML = head('League Not Found', 'Check the code and try again.') + wrap('<a class="btn primary" href="#/leagues">Back to Leagues</a>'); return; }
  const E = await q('LeagueEntries', { code: { $eq: code } }, null, 500) || [], best = {}; E.forEach(x => { const k = x.nick + '|' + x.pid; if (!best[k]) best[k] = x; });
  const rows = Object.values(best).sort((a, b) => (b.data.ret || 0) - (a.data.ret || 0)), R = Lg.rules || {}, P = papers();
  app.innerHTML = head(esc(Lg.name), `League code <span class="tz-code">${esc(code)}</span> · started by ${esc(Lg.nick || 'a member')} · ends ${esc(dfmt(R.end) || R.end || '—')} · $100,000 start${R.max ? ' · up to ' + R.max + ' positions' : ''}`) + wrap(`
    ${card('Post Your Result', 'pick one of your Paper Trading portfolios', P.length ? `<form class="tz-f" id="tz-le"><label>Portfolio<select name="pid">${opts(P.map(p => [p.id, p.name || 'Portfolio']))}</select></label><button class="btn primary">Post to the Board</button><a class="btn ghost" id="tz-inv">Copy Invite Link</a></form><p class="muted" style="margin:8px 0 0;font-size:13px">Post again any time to update your line. Results use the same real closing prices as Paper Trading.</p>` : '<p style="margin:0">Start a <a href="#/paper">Paper Trading portfolio</a> first, then post it here.</p>')}
    ${card('Leaderboard', rows.length + ' entr' + (rows.length === 1 ? 'y' : 'ies'), rows.length ? `<div class="tz-sc"><table class="tz-t"><tr><th>#</th><th>Player</th><th class="n">Return</th><th class="n tz-hm">Value</th><th class="n tz-hm">Positions</th><th class="n">Updated</th></tr>${rows.map((x, i) => `<tr><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td><b>${esc(x.nick)}</b>${x.data.pname ? ` <span class="muted">· ${esc(x.data.pname)}</span>` : ''}${R.max && x.data.n > R.max ? ' <span class="tz-side bear">over limit</span>' : ''}</td><td class="n ${gcol(x.data.ret)}"><b>${pct(x.data.ret)}</b></td><td class="n tz-hm">${usd(x.data.total, 0)}</td><td class="n tz-hm">${x.data.n}</td><td class="n muted">${ago(x._at)}</td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">No one has posted yet.</p>')}`);
  document.title = Lg.name + ' — Tickerwise Leagues'; if (!myL().some(x => x.code === code)) jset('tw_leagues', myL().concat([{ code, name: Lg.name }]));
  const inv = $('#tz-inv'); if (inv) inv.onclick = () => { const u = location.origin + location.pathname + '#/leagues/' + code; try { navigator.clipboard.writeText(u); } catch (e) {} toast('✓ Invite link copied'); };
  const f = $('#tz-le'); if (f) f.onsubmit = async e => { e.preventDefault(); const p = P.find(x => x.id === f.pid.value); if (!p || !PP.calc) return; const c = PP.calc(Object.assign({}, p, { start: 100000 })), s0 = p.start || 100000, k = PP.calc(p), ret = k.ret, total = 100000 * (1 + ret / 100);
    if (await ins('LeagueEntries', { code, nick: nick(), pid: p.id, data: { ret: +ret.toFixed(2), total: Math.round(total), n: k.open.length, pname: p.name || '', s0 } })) league(code); };
}

/* ============ REPLAY LEADERBOARD + DAILY CHALLENGE ============ */
function daily() { const ok = S.filter(s => ser(s.t).length > 300), d = new Date().toISOString().slice(0, 10); let h = 0; for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0; const s = ok[h % ok.length], z = ser(s.t), i = 200 + (h >> 7) % Math.max(1, z.length - 260); return { t: s.t, n: s.n, day: PP.iso ? PP.iso(z[i].d) : '', d }; }
async function replayBoard() {
  const D = daily(), R = jget('tw_replay', {}), L = await q('ReplayScores', {}, [{ fieldName: 'ret', order: 'DESC' }], 100);
  const today = (L || []).filter(x => x.mode === 'daily' && x.day === D.d), all = (L || []).filter(x => x.mode !== 'daily');
  const tbl = (A, e) => A.length ? `<div class="tz-sc"><table class="tz-t"><tr><th>#</th><th>Player</th><th>Stock</th><th class="n">Return</th><th class="n tz-hm">Buy & hold</th><th class="n">Edge</th></tr>${A.slice(0, 25).map((x, i) => `<tr><td>${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</td><td><b>${esc(x.nick)}</b></td><td>${tl(x.ticker)}</td><td class="n ${gcol(x.ret)}"><b>${pct(x.ret)}</b></td><td class="n tz-hm">${pct(x.bh)}</td><td class="n ${gcol(x.ret - x.bh)}">${pct(x.ret - x.bh)}</td></tr>`).join('')}</table></div>` : `<p class="muted" style="margin:0">${e}</p>`;
  app.innerHTML = head('Market Replay Leaderboard', 'Trade real past sessions bar by bar, then post your score. The edge column is what you made beyond simply buying and holding.') + wrap(`
    ${card('Today\'s Challenge', esc(dfmt(D.d)), `<div class="tz-k"><div><span>Stock</span><b>${tl(D.t)}</b></div><div><span>Session starts</span><b style="font-size:16px">${esc(dfmt(D.day))}</b></div><div><span>Players today</span><b>${today.length}</b></div></div><p style="margin:12px 0">Everyone plays the same stock from the same day. Open Market Replay, pick <b>${esc(D.t)}</b> and the date above, trade it, then post your result here.</p>
      <form class="tz-f" id="tz-rd"><a class="btn ghost" href="#/paper/replay">Open Market Replay</a><label>Your return %<input name="ret" type="number" step="0.01" required></label><label>Buy & hold %<input name="bh" type="number" step="0.01" required></label><button class="btn primary">Post Score</button></form>`)}
    ${card('Today\'s Board', 'daily challenge', tbl(today.sort((a, b) => b.ret - a.ret), 'No scores yet today.'))}
    ${card('All-Time Best Runs', 'free play', `${R.runs ? `<p style="margin:0 0 12px">Your best run: <b class="${gcol(R.best)}">${pct(R.best)}</b> over ${R.runs} run${R.runs === 1 ? '' : 's'}. <button class="btn ghost" id="tz-rb">Post My Best</button></p>` : ''}${L == null ? offline : tbl(all, 'No scores yet. Play Market Replay and post your best run.')}`)}`);
  document.title = 'Replay Leaderboard — Tickerwise';
  $('#tz-rd').onsubmit = async e => { e.preventDefault(); const f = e.target; if (await ins('ReplayScores', { nick: nick(), day: D.d, ret: +f.ret.value, bh: +f.bh.value, ticker: D.t, mode: 'daily' })) replayBoard(); };
  const b = $('#tz-rb'); if (b) b.onclick = async () => { if (await ins('ReplayScores', { nick: nick(), day: new Date().toISOString().slice(0, 10), ret: +R.best, bh: 0, ticker: R.t || '', mode: 'free' })) replayBoard(); };
}

/* ============ GROUPS (family / club) ============ */
const myG = () => jget('tw_groups', []);
async function groups(c) {
  if (c) return group(c.toUpperCase()); const G = myG();
  app.innerHTML = head('Groups', 'A private space for a family, an investment club or a class: share stock picks and notes, and see everyone\'s ideas in one watchlist.') + wrap(`
    <div class="tz-g" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    ${card('Start a Group', '', `<form class="tz-f" id="tz-gc"><label style="flex:1 1 100%">Group name<input name="name" maxlength="40" placeholder="e.g. Sunday Investment Club" required></label><button class="btn primary">Create</button></form>`)}
    ${card('Join a Group', '', `<form class="tz-f" id="tz-gj"><label>Group code<input name="code" maxlength="6" style="text-transform:uppercase" required></label><button class="btn primary">Join</button></form>`)}</div>
    ${card('Your Groups', '', G.length ? `<div class="tz-sc"><table class="tz-t">${G.map(x => `<tr><td><b>${esc(x.name)}</b></td><td><span class="tz-code">${esc(x.code)}</span></td><td class="n"><a class="btn ghost" href="#/groups/${esc(x.code)}">Open</a></td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">No groups yet.</p>')}`);
  document.title = 'Groups — Tickerwise';
  $('#tz-gc').onsubmit = async e => { e.preventDefault(); const code = code6(), name = e.target.name.value.trim(); if (await ins('GroupItems', { code, kind: 'group', t: '', nick: nick(), text: name })) { jset('tw_groups', myG().concat([{ code, name }])); location.hash = '#/groups/' + code; } };
  $('#tz-gj').onsubmit = async e => { e.preventDefault(); const code = e.target.code.value.trim().toUpperCase(), r = await q('GroupItems', { code: { $eq: code }, kind: { $eq: 'group' } }, null, 1); if (!r || !r.length) { toast('No group found with code ' + esc(code)); return; } if (!myG().some(x => x.code === code)) jset('tw_groups', myG().concat([{ code, name: r[0].text }])); location.hash = '#/groups/' + code; };
}
async function group(code) {
  const L = await q('GroupItems', { code: { $eq: code } }, null, 500); const g = (L || []).find(x => x.kind === 'group');
  if (!g) { app.innerHTML = head('Group Not Found', 'Check the code and try again.') + wrap('<a class="btn primary" href="#/groups">Back to Groups</a>'); return; }
  const picks = L.filter(x => x.kind === 'pick'), notes = L.filter(x => x.kind === 'note'), agg = {}; picks.forEach(p => { (agg[p.t] = agg[p.t] || { t: p.t, who: new Set(), why: [] }).who.add(p.nick); if (p.text) agg[p.t].why.push(p); });
  const rows = Object.values(agg).sort((a, b) => b.who.size - a.who.size);
  app.innerHTML = head(esc(g.text), `Group code <span class="tz-code">${esc(code)}</span> · ${new Set(L.map(x => x.nick)).size} member${new Set(L.map(x => x.nick)).size === 1 ? '' : 's'} · share the code to invite people`) + wrap(`
    ${card('Add a Pick', '', `<form class="tz-f" id="tz-gp"><label>Stock<select name="t">${tickOpts('')}</select></label><label style="flex:2 1 220px">Why (optional)<input name="text" maxlength="200" placeholder="One line on why you like it"></label><button class="btn primary">Add</button></form>`)}
    ${card('Group Watchlist', rows.length + ' stocks', rows.length ? `<div class="tz-sc"><table class="tz-t"><tr><th>Stock</th><th class="n">Score</th><th class="n">1M</th><th>Picked by</th><th class="tz-hm">Why</th></tr>${rows.map(r => { const s = BY[r.t] || {}; return `<tr><td>${tl(r.t)} <span class="muted tz-hm">${esc(s.n || '')}</span></td><td class="n"><b>${s.ws != null ? s.ws : '—'}</b></td><td class="n ${gcol((s.ret || {}).r1m)}">${pct((s.ret || {}).r1m)}</td><td>${[...r.who].map(esc).join(', ')}</td><td class="tz-hm muted" style="font-size:13px">${r.why.slice(0, 2).map(p => esc(p.text)).join(' · ')}</td></tr>`; }).join('')}</table></div><p style="margin:10px 0 0"><button class="btn ghost" id="tz-gw">☆ Add All to My Watchlist</button></p>` : '<p class="muted" style="margin:0">No picks yet.</p>')}
    ${card('Notes', '', `<form class="tz-f" id="tz-gn"><label style="flex:1 1 100%"><textarea name="text" maxlength="600" placeholder="Meeting notes, ideas, links…"></textarea></label><button class="btn primary">Post</button></form><div style="margin-top:12px">${notes.map(n => `<div class="tz-post"><div class="h"><b>${esc(n.nick)}</b><span>${ago(n._at)}</span></div><p>${esc(n.text)}</p></div>`).join('') || '<p class="muted" style="margin:0">No notes yet.</p>'}</div>`)}`);
  document.title = g.text + ' — Tickerwise Groups'; if (!myG().some(x => x.code === code)) jset('tw_groups', myG().concat([{ code, name: g.text }]));
  $('#tz-gp').onsubmit = async e => { e.preventDefault(); if (await ins('GroupItems', { code, kind: 'pick', t: e.target.t.value, nick: nick(), text: e.target.text.value.trim() })) group(code); };
  $('#tz-gn').onsubmit = async e => { e.preventDefault(); const t = e.target.text.value.trim(); if (t && await ins('GroupItems', { code, kind: 'note', t: '', nick: nick(), text: t })) group(code); };
  const w = $('#tz-gw'); if (w) w.onclick = () => { const W = jget('tw-watchlist', []); jset('tw-watchlist', [...new Set(W.concat(rows.map(r => r.t).filter(t => BY[t])))]); toast('✓ Added to your watchlist'); setTimeout(() => location.reload(), 900); };
}

/* ============ CREATOR PROGRAM ============ */
function creators() {
  const T = [['🌱', 'Rising Trader', 'Top 25% of Paper Trading players for 3 straight months', 'Profile badge, featured on Social Trading, followers'], ['⭐', 'Lead Trader', 'Top 10% for 6 months, 20+ trades, max drawdown under 25%', 'Copy button on your profile, monthly share of Pro revenue from your copiers'], ['💎', 'Elite Lead Trader', 'Top 2% for 12 months with 500+ copiers', 'Higher revenue share, Premium articles, live Q&A sessions']];
  app.innerHTML = head('Creator Program', 'Great paper traders become Lead Traders: a public track record, followers and copiers, and a share of revenue once paid plans launch.') + wrap(`
    <div class="tz-g">${T.map((x, i) => `<div class="tz-tile"><i>${x[0]}</i><b>${x[1]}</b><span><b style="font:600 13px Inter">How to qualify:</b> ${x[2]}</span><span><b style="font:600 13px Inter">What you get:</b> ${x[3]}</span>${i ? UP : ''}</div>`).join('')}</div>
    ${card('How Payouts Work', '', `<p style="margin:0 0 10px;line-height:1.6">Lead Traders earn a share of the subscription revenue from the members who copy them, paid monthly. Rankings use the same Paper Trading results everyone sees, so there are no self-reported numbers.</p>${lock('Payouts', 'require the upgraded plan, which adds payment accounts and tax forms.')}`)}
    ${card('Start Now', '', '<p style="margin:0 0 12px">Every track record starts in Paper Trading. Build yours today.</p><a class="btn primary" href="#/paper">Open Paper Trading</a> <a class="btn ghost" href="#/social">See Lead Traders</a>')}`);
  document.title = 'Creator Program — Tickerwise';
}

/* ============ PAPER LIMIT / STOP ORDERS (fill at the daily close) ============ */
const rdO = () => jget('tw_orders', []), wrO = o => jset('tw_orders', o);
function runOrders() {
  if (!PP.closeOn || !PP.lastDay) return []; const O = rdO(), today = PP.lastDay(), done = []; if (!today) return [];
  const o2 = jget('tw_paper', { prof: null, list: [] }); let ch = 0;
  O.filter(o => o.st === 'open').forEach(o => {
    const P = o2.list.find(x => x.id === o.pid); if (!P) { o.st = 'cancelled'; o.note = 'Portfolio not found'; ch = 1; return; }
    if (o.exp && PP.dnum(o.exp) < today) { const z0 = ser(o.t).filter(p => p.d > PP.dnum(o.at) && p.d <= PP.dnum(o.exp)); if (!z0.some(p => hit(o, p.c))) { o.st = 'expired'; ch = 1; return; } }
    const z = ser(o.t).filter(p => p.d > PP.dnum(o.at) && (!o.exp || p.d <= PP.dnum(o.exp))), f = z.find(p => hit(o, p.c)); if (!f) return;
    const d = PP.iso(f.d), px = +f.c.toFixed(4);
    if (o.side === 'buy') { const cash = PP.calc(P).cash; if (cash < o.q * px) { o.st = 'cancelled'; o.note = 'Not enough cash on ' + d; ch = 1; return; } P.lots = (P.lots || []).concat([{ id: uid(), t: o.t, q: o.q, bd: d, bp: px, sd: null, sp: null }]); }
    else { let need = o.q; const open = (P.lots || []).filter(l => l.t === o.t && !l.sd && PP.dnum(l.bd) <= f.d); if (open.reduce((a, l) => a + l.q, 0) < need) { o.st = 'cancelled'; o.note = 'Not enough shares'; ch = 1; return; }
      open.forEach(l => { if (need <= 0) return; if (l.q <= need) { l.sd = d; l.sp = px; need -= l.q; } else { P.lots.push({ id: uid(), t: l.t, q: l.q - need, bd: l.bd, bp: l.bp, sd: null, sp: null }); l.q = need; l.sd = d; l.sp = px; need = 0; } }); }
    o.st = 'filled'; o.fd = d; o.fp = px; ch = 1; done.push(o);
  });
  if (ch) { jset('tw_paper', o2); wrO(O); } return done;
}
function hit(o, c) { return o.type === 'limit' ? (o.side === 'buy' ? c <= o.px : c >= o.px) : (o.side === 'buy' ? c >= o.px : c <= o.px); }
function orders() {
  const P = papers(), O = rdO();
  const lbl = o => (o.side === 'buy' ? 'Buy' : 'Sell') + ' ' + (o.type === 'limit' ? 'Limit' : 'Stop');
  app.innerHTML = head('Limit & Stop Orders', 'Place orders on your Paper Trading portfolios. They fill automatically at the first daily close that reaches your price.') + wrap(`
    ${P.length ? card('New Order', 'paper money', `<form class="tz-f" id="tz-of"><label>Portfolio<select name="pid">${opts(P.map(p => [p.id, p.name || 'Portfolio']))}</select></label><label>Stock<select name="t" id="tz-ot">${tickOpts('NVDA')}</select></label><label>Order<select name="k">${opts([['buy-limit', 'Buy Limit (buy at or below)'], ['buy-stop', 'Buy Stop (buy at or above)'], ['sell-limit', 'Sell Limit (take profit)'], ['sell-stop', 'Sell Stop (stop loss)']], 'buy-limit')}</select></label><label>Price $<input name="px" type="number" step="0.01" min="0.01" required></label><label>Shares<input name="q" type="number" min="1" step="1" value="10" required></label><label>Good until<input name="exp" type="date" value="${new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)}"></label><button class="btn primary">Place Order</button></form><p class="muted" id="tz-olp" style="margin:8px 0 0;font-size:13px"></p>`) : card('New Order', '', '<p style="margin:0">Start a <a href="#/paper">Paper Trading portfolio</a> first.</p>')}
    ${card('Your Orders', O.length + ' total', O.length ? `<div class="tz-sc"><table class="tz-t"><tr><th>Order</th><th>Stock</th><th class="n">Shares</th><th class="n">Price</th><th>Status</th><th class="tz-hm">Placed</th><th></th></tr>${O.slice().reverse().map(o => `<tr><td><b>${lbl(o)}</b></td><td>${tl(o.t)}</td><td class="n">${o.q}</td><td class="n">${usd(o.px)}</td><td>${o.st === 'filled' ? `<span class="tz-side bull">Filled ${esc(dfmt(o.fd))} at ${usd(o.fp)}</span>` : o.st === 'open' ? '<b>Open</b>' : `<span class="muted">${esc(o.st[0].toUpperCase() + o.st.slice(1))}${o.note ? ' · ' + esc(o.note) : ''}</span>`}</td><td class="tz-hm muted">${esc(dfmt(o.at))}</td><td class="n">${o.st === 'open' ? `<button class="btn ghost" data-x="${o.id}">Cancel</button>` : ''}</td></tr>`).join('')}</table></div>` : '<p class="muted" style="margin:0">No orders yet.</p>')}
    ${lock('Intraday fills and alerts when an order fills', 'require the upgraded plan. Paper orders here fill at the daily close.')}`);
  document.title = 'Limit & Stop Orders — Tickerwise';
  const f = $('#tz-of'); if (f) { const hint = () => { const l = last(f.t.value); $('#tz-olp').textContent = l ? `Last close for ${f.t.value}: ${usd(l.c)} on ${dfmt(PP.iso(l.d))}.` : ''; if (l && !f.px.value) f.px.value = l.c.toFixed(2); }; f.t.onchange = () => { f.px.value = ''; hint(); }; hint();
    f.onsubmit = e => { e.preventDefault(); const [side, type] = f.k.value.split('-'), today = PP.lastDay ? PP.iso(PP.lastDay()) : new Date().toISOString().slice(0, 10); wrO(rdO().concat([{ id: uid(), pid: f.pid.value, t: f.t.value, side, type, px: +f.px.value, q: Math.floor(+f.q.value), exp: f.exp.value, at: today, st: 'open' }])); runOrders(); orders(); toast('✓ Order placed'); }; }
  $$('[data-x]').forEach(b => b.onclick = () => { const O2 = rdO(); const o = O2.find(x => x.id === b.dataset.x); if (o) o.st = 'cancelled'; wrO(O2); orders(); });
}

/* ============ SIMULATED PAPER OPTIONS (Black-Scholes) ============ */
const ncdf = x => { const t = 1 / (1 + .2316419 * Math.abs(x)), d = .3989423 * Math.exp(-x * x / 2), p = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; };
function bs(S0, K, T, v, call, r = .04) { if (T <= 0) return Math.max(0, call ? S0 - K : K - S0); const d1 = (Math.log(S0 / K) + (r + v * v / 2) * T) / (v * Math.sqrt(T)), d2 = d1 - v * Math.sqrt(T); return call ? S0 * ncdf(d1) - K * Math.exp(-r * T) * ncdf(d2) : K * Math.exp(-r * T) * ncdf(-d2) - S0 * ncdf(-d1); }
function hv(t) { const z = ser(t).slice(-61); if (z.length < 20) return .4; const r = []; for (let i = 1; i < z.length; i++) r.push(Math.log(z[i].c / z[i - 1].c)); const m = r.reduce((a, x) => a + x, 0) / r.length; return Math.max(.1, Math.sqrt(r.reduce((a, x) => a + (x - m) ** 2, 0) / (r.length - 1) * 252)); }
function options() {
  const O = jget('tw_opts', []), today = PP.lastDay ? PP.lastDay() : null;
  const val = o => { const l = last(o.t); if (!l) return null; const T = Math.max(0, (PP.dnum(o.exp) - l.d) / 365); return bs(l.c, o.k, T, hv(o.t), o.call) * 100 * o.n; };
  const tot = O.reduce((a, o) => { const v = val(o); return v == null ? a : { c: a.c + o.p * 100 * o.n, v: a.v + v }; }, { c: 0, v: 0 });
  app.innerHTML = head('Paper Options ' + DEMO, 'Practice calls and puts with paper money. Prices are simulated with the Black-Scholes model from each stock\'s real price and its recent volatility.') + wrap(`
    ${card('Price an Option', 'simulated, not a real quote', `<form class="tz-f" id="tz-xf"><label>Stock<select name="t">${tickOpts('NVDA')}</select></label><label>Type<select name="c"><option value="1">Call (bet it rises)</option><option value="0">Put (bet it falls)</option></select></label><label>Strike $<input name="k" type="number" step="0.5" required></label><label>Expires<select name="e">${[7, 14, 30, 60, 90, 180, 365].map(d => `<option value="${d}"${d === 30 ? ' selected' : ''}>${d} days</option>`).join('')}</select></label><label>Contracts<input name="n" type="number" min="1" value="1"></label></form>
      <div class="tz-k" id="tz-xq" style="margin-top:12px"></div><p style="margin:12px 0 0"><button class="btn primary" id="tz-xb">Buy (Paper)</button> <span class="muted" style="font-size:13px">1 contract = 100 shares. Uses volatility from the last 60 trading days and a 4% interest rate.</span></p>`)}
    ${card('Your Option Positions', O.length ? `cost ${usd(tot.c, 0)} · value ${usd(tot.v, 0)} · <b class="${gcol(tot.v - tot.c)}">${pct(tot.c ? (tot.v / tot.c - 1) * 100 : 0)}</b>` : '', O.length ? `<div class="tz-sc"><table class="tz-t"><tr><th>Option</th><th class="n">Contracts</th><th class="n">Paid</th><th class="n">Now</th><th class="n">P/L</th><th></th></tr>${O.map(o => { const v = val(o), c = o.p * 100 * o.n, exp = today && PP.dnum(o.exp) <= today; return `<tr><td><b>${esc(o.t)} ${usd(o.k, o.k % 1 ? 2 : 0)} ${o.call ? 'Call' : 'Put'}</b><div class="muted" style="font-size:12px">${exp ? 'Expired ' : 'Expires '}${esc(dfmt(o.exp))}</div></td><td class="n">${o.n}</td><td class="n">${usd(c, 0)}</td><td class="n">${usd(v, 0)}</td><td class="n ${gcol(v - c)}"><b>${usd(v - c, 0)}</b></td><td class="n"><button class="btn ghost" data-cl="${o.id}">Close</button></td></tr>`; }).join('')}</table></div>` : '<p class="muted" style="margin:0">No option positions yet.</p>')}
    ${lock('Real options chains, live bid/ask and the Greeks from the market', 'require the upgraded plan.')}`);
  document.title = 'Paper Options — Tickerwise';
  const f = $('#tz-xf'); let cur = null;
  const upd = () => { const l = last(f.t.value); if (!l) return; if (!f.k.value || f.k.dataset.t !== f.t.value) { f.k.value = (Math.round(l.c / (l.c > 100 ? 5 : 1)) * (l.c > 100 ? 5 : 1)).toFixed(l.c > 100 ? 0 : 1); f.k.dataset.t = f.t.value; }
    const v = hv(f.t.value), call = f.c.value === '1', K = +f.k.value, T = +f.e.value / 365, p = bs(l.c, K, T, v, call), be = call ? K + p : K - p; cur = { p, l };
    $('#tz-xq').innerHTML = `<div><span>${esc(f.t.value)} last close</span><b>${usd(l.c)}</b></div><div><span>Option price (per share)</span><b>${usd(p)}</b></div><div><span>Cost for ${f.n.value} contract${+f.n.value === 1 ? '' : 's'}</span><b>${usd(p * 100 * f.n.value, 0)}</b></div><div><span>Break-even at expiry</span><b>${usd(be)}</b></div><div><span>Volatility used</span><b>${Math.round(v * 100)}%</b></div>`; };
  f.oninput = f.onchange = upd; upd();
  $('#tz-xb').onclick = () => { if (!cur) return; const l = cur.l, exp = PP.iso(l.d + Math.round(+f.e.value * 365 / 365)); jset('tw_opts', jget('tw_opts', []).concat([{ id: uid(), t: f.t.value, call: f.c.value === '1', k: +f.k.value, exp, n: Math.max(1, Math.floor(+f.n.value)), p: +cur.p.toFixed(4), at: PP.iso(l.d) }])); toast('✓ Option added'); options(); };
  $$('[data-cl]').forEach(b => b.onclick = () => { const O2 = jget('tw_opts', []), o = O2.find(x => x.id === b.dataset.cl), v = o && val(o); jset('tw_opts', O2.filter(x => x.id !== b.dataset.cl)); if (o) toast(`Closed ${esc(o.t)} ${o.call ? 'call' : 'put'} for ${usd(v, 0)} (${usd(v - o.p * 100 * o.n, 0)} P/L)`); options(); });
}

/* ============ EMBEDDABLE SCORE WIDGET ============ */
function widgetHTML(t) { const s = BY[t]; if (!s) return '<p>Stock not covered.</p>'; const l = last(t), P = s.P || {}, pil = [['Momentum', P.m], ['Earnings', P.e], ['Growth', P.g], ['Profitability', P.p], ['Balance', P.b]];
  return `<div class="tz-w"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><b style="font:800 20px 'Space Grotesk',sans-serif">${esc(t)}</b><div style="font-size:12.5px;color:#64748B">${esc(s.n || '')}</div></div><div style="text-align:center;background:linear-gradient(135deg,#00C176,#0EA5E9);color:#fff;border-radius:14px;padding:6px 12px"><b style="font:800 26px 'Space Grotesk',sans-serif;display:block;line-height:1">${s.ws != null ? s.ws : '—'}</b><span style="font-size:10px;font-weight:700">of 10</span></div></div>
   ${l ? `<div style="margin:8px 0;font-size:14px"><b>${usd(l.c)}</b> <span class="${gcol((s.ret || {}).r1m)}">${pct((s.ret || {}).r1m)} 1M</span></div>` : ''}
   ${pil.map(([n, v]) => `<div style="display:flex;align-items:center;gap:8px;font-size:12px;margin:4px 0"><span style="width:84px;color:#475569">${n}</span><div style="flex:1;height:7px;border-radius:9px;background:#E2E8F0"><div style="height:100%;border-radius:9px;width:${(v || 0) * 10}%;background:#2F6BFF"></div></div><b style="width:18px;text-align:right">${v != null ? v : '—'}</b></div>`).join('')}
   <a href="${esc(location.origin + location.pathname)}#/stock/${esc(t)}" target="_blank" rel="noopener" style="display:block;margin-top:10px;font-size:12px;color:#2F6BFF;text-decoration:none;font-weight:700">Tickerwise Score · full analysis →</a></div>`; }
function embed(t) { document.body.classList.add('tz-embed'); app.innerHTML = `<div style="padding:8px">${widgetHTML((t || '').toUpperCase())}</div>`; document.title = (t || '') + ' — Tickerwise Score'; }
function widgets() {
  app.innerHTML = head('Score Widgets', 'Put a live Tickerwise Score card on your blog, newsletter or club site. Pick a stock and copy the code.') + wrap(card('Build a Widget', 'free', `<form class="tz-f" id="tz-wf"><label>Stock<select name="t">${tickOpts('NVDA')}</select></label></form><div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;align-items:flex-start"><div id="tz-wp" style="flex:0 1 340px;min-width:0"></div><div style="flex:1 1 260px;min-width:0"><b style="font-size:13px">Embed code</b><textarea id="tz-wc" class="tz-in" readonly style="height:120px;margin-top:6px;font:12px ui-monospace,Menlo,monospace"></textarea><button class="btn primary" id="tz-wcp" style="margin-top:8px">Copy Code</button></div></div>`));
  document.title = 'Score Widgets — Tickerwise'; const f = $('#tz-wf');
  const up = () => { const t = f.t.value; $('#tz-wp').innerHTML = widgetHTML(t); $('#tz-wc').value = `<iframe src="${location.origin + location.pathname}#/embed/${t}" width="360" height="330" style="border:0;max-width:100%" title="${t} Tickerwise Score" loading="lazy"></iframe>`; };
  f.onchange = up; up(); $('#tz-wcp').onclick = () => { const c = $('#tz-wc'); c.select(); try { navigator.clipboard.writeText(c.value); } catch (e) { document.execCommand('copy'); } toast('✓ Code copied'); };
}

/* ============ CUSTOM DASHBOARD ============ */
const WID = [['wl', '☆ Watchlist'], ['mv', '🚀 Top Movers'], ['er', '📅 Earnings Next 14 Days'], ['pp', '📈 Paper Portfolios'], ['al', '🔔 Alerts'], ['lg', '🏛️ What the Legends Bought'], ['sg', '📡 Signals'], ['or', '🧾 Open Orders']];
function dash() {
  const on = jget('tw_dash', ['wl', 'mv', 'er', 'pp', 'lg']), W = jget('tw-watchlist', []);
  const tbl = (L, cols) => `<div class="tz-sc"><table class="tz-t">${L.map(cols).join('')}</table></div>`;
  const R = {
    wl: () => W.length ? tbl(W.filter(t => BY[t]).slice(0, 12), t => { const s = BY[t], l = last(t); return `<tr><td>${tl(t)}</td><td class="n">${l ? usd(l.c) : '—'}</td><td class="n ${gcol((s.ret || {}).r1m)}">${pct((s.ret || {}).r1m)}</td><td class="n"><b>${s.ws != null ? s.ws : '—'}</b></td></tr>`; }) : '<p class="muted" style="margin:0">Add stocks with the ☆ on any stock page.</p>',
    mv: () => tbl(S.filter(s => nz((s.ret || {}).r1m)).sort((a, b) => b.ret.r1m - a.ret.r1m).slice(0, 8), s => `<tr><td>${tl(s.t)}</td><td class="muted tz-hm">${esc(s.n || '')}</td><td class="n up"><b>${pct(s.ret.r1m)}</b></td></tr>`),
    er: () => { const now = new Date(new Date().toDateString()), L = S.filter(s => s.earn && s.earn.next).map(s => [s, Math.round((new Date(s.earn.next + 'T00:00:00') - now) / 864e5)]).filter(x => x[1] >= 0 && x[1] <= 14).sort((a, b) => a[1] - b[1]); return L.length ? tbl(L.slice(0, 10), ([s, d]) => `<tr><td>${tl(s.t)}</td><td>${esc(dfmt(s.earn.next))}</td><td class="n muted">${d ? 'in ' + d + 'd' : 'today'}</td></tr>`) : '<p class="muted" style="margin:0">No covered stocks report in the next 14 days.</p>'; },
    pp: () => { const P = papers(); return P.length && PP.calc ? tbl(P, p => { const c = PP.calc(p); return `<tr><td><b>${esc(p.name || 'Portfolio')}</b></td><td class="n">${usd(c.total, 0)}</td><td class="n ${gcol(c.ret)}"><b>${pct(c.ret)}</b></td></tr>`; }) : '<p class="muted" style="margin:0"><a href="#/paper">Start Paper Trading</a></p>'; },
    al: () => { const A = jget('tw_alerts', []); return A.length ? tbl(A.slice(0, 8), a => `<tr><td>${tl(a.t)}</td><td>${esc(a.msg || a.kind || '')}</td><td class="n">${a.unread ? '<span class="tz-side bull">New</span>' : ''}</td></tr>`) : '<p class="muted" style="margin:0">Set alerts from any stock page\'s Report Card.</p>'; },
    lg: () => { const F = window.TWFI; if (!F || !F.ACT) return '<p class="muted" style="margin:0">Loading…</p>'; return tbl(Object.values(F.ACT).filter(o => o.buy.length).sort((a, b) => b.buy.length - a.buy.length).slice(0, 8), o => `<tr><td>${tl(o.t)}</td><td class="muted">${o.buy.length} legend${o.buy.length === 1 ? '' : 's'} bought</td><td class="n"><a href="#/investors/stock/${esc(o.t)}">Who</a></td></tr>`); },
    sg: () => { const T = window.TWT; if (!T || !T.sigAll) return '<p class="muted" style="margin:0">Loading…</p>'; return tbl(T.sigAll().filter(x => x.L.length), x => `<tr><td><b>${esc(x.n || x.k)}</b></td><td>${x.L.slice(0, 6).map(r => tl(r.t || r.s && r.s.t || r)).join(' ')}</td></tr>`); },
    or: () => { const O = rdO().filter(o => o.st === 'open'); return O.length ? tbl(O, o => `<tr><td>${tl(o.t)}</td><td>${o.side === 'buy' ? 'Buy' : 'Sell'} ${o.type}</td><td class="n">${o.q} @ ${usd(o.px)}</td></tr>`) : '<p class="muted" style="margin:0"><a href="#/orders">Place a limit or stop order</a></p>'; }
  };
  app.innerHTML = head('My Dashboard', 'Your own home base. Choose the panels you want; your choice is saved, and syncs when you are logged in.') + wrap(`
    <div class="tz-ch" id="tz-dc">${WID.map(w => `<button data-w="${w[0]}" class="${on.includes(w[0]) ? 'on' : ''}">${w[1]}</button>`).join('')}</div>
    <div class="tz-g" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));align-items:start">${WID.filter(w => on.includes(w[0])).map(w => { let h; try { h = R[w[0]](); } catch (e) { h = '<p class="muted" style="margin:0">Not available right now.</p>'; } return card(w[1], '', h); }).join('')}</div>`);
  document.title = 'My Dashboard — Tickerwise';
  $$('[data-w]').forEach(b => b.onclick = () => { const k = b.dataset.w, o = jget('tw_dash', ['wl', 'mv', 'er', 'pp', 'lg']); jset('tw_dash', o.includes(k) ? o.filter(x => x !== k) : o.concat([k])); dash(); });
}

/* ============ BROKER COMPARISON ============ */
const BRK = [
  ['Charles Schwab', '$0', '$0.65', 'No', 'Yes', 'Full service, branches, thinkorswim', 'https://www.schwab.com/pricing'],
  ['Fidelity', '$0', '$0.65', 'Yes', 'Yes', 'Strong research, fractional shares, no-fee index funds', 'https://www.fidelity.com/trading/commissions-margin-rates'],
  ['Interactive Brokers', '$0 (Lite)', 'up to $0.65', 'Yes', 'Yes', 'Global markets, lowest margin rates', 'https://www.interactivebrokers.com/en/pricing/commissions-home.php'],
  ['Robinhood', '$0', '$0', 'Yes', 'Yes', 'Simple app, 24-hour trading on many stocks', 'https://robinhood.com/us/en/support/articles/robinhood-fee-schedule/'],
  ['Webull', '$0', '$0', 'Yes', 'Yes', 'Charting tools, extended hours', 'https://www.webull.com/pricing'],
  ['E*TRADE (Morgan Stanley)', '$0', '$0.65 ($0.50 active)', 'No', 'Yes', 'Power E*TRADE platform', 'https://us.etrade.com/what-we-offer/pricing-and-rates'],
  ['Vanguard', '$0', '$1 (free for top tiers)', 'ETFs only', 'Limited', 'Best for long-term index investing', 'https://investor.vanguard.com/investor-resources-education/understanding-investment-types/commissions-and-fees'],
  ['Public', '$0', '$0 (with rebates)', 'Yes', 'Yes', 'Social features, bonds and treasuries', 'https://public.com/disclosures/fee-schedule'],
  ['SoFi Invest', '$0', '$0', 'Yes', 'Yes', 'Banking and investing in one app', 'https://www.sofi.com/invest/'],
  ['Merrill Edge', '$0', '$0.65', 'No', 'Yes', 'Bank of America rewards tie-in', 'https://www.merrilledge.com/pricing']];
function brokers() {
  app.innerHTML = head('Broker Comparison', 'Where to open a real account once you are ready. Fees for U.S. online stock and ETF trades.') + wrap(`
    ${card('Fees at a Glance', 'from each broker\'s public price page', `<div class="tz-sc"><table class="tz-t"><tr><th>Broker</th><th class="n">Stock / ETF trades</th><th class="n">Options per contract</th><th class="n tz-hm">Fractional shares</th><th class="n tz-hm">Options</th><th class="tz-hm">Best for</th><th></th></tr>${BRK.map(b => `<tr><td><b>${b[0]}</b></td><td class="n">${b[1]}</td><td class="n">${b[2]}</td><td class="n tz-hm">${b[3]}</td><td class="n tz-hm">${b[4]}</td><td class="tz-hm muted" style="font-size:13px">${b[5]}</td><td class="n"><a href="${b[6]}" target="_blank" rel="noopener nofollow">Fees ↗</a></td></tr>`).join('')}</table></div><p class="muted" style="margin:10px 0 0;font-size:12.5px">Fees change often. Always confirm on the broker's own page before opening an account. Tickerwise is not paid by any broker listed here.</p>`)}
    ${lock('Link your broker account to import real holdings', 'requires the upgraded plan.')}`);
  document.title = 'Broker Comparison — Tickerwise';
}

/* ============ FAIR VALUE CALCULATOR ============ */
function fairvalue(t0) {
  const t = (t0 || 'NVDA').toUpperCase();
  app.innerHTML = head('Fair Value Calculator', 'A simple earnings model: grow this year\'s earnings, put a multiple on them in five years, and discount back to today.') + wrap(card('Your Assumptions', 'pre-filled from our data; change anything', `<form class="tz-f" id="tz-ff"><label>Stock<select name="t">${tickOpts(BY[t] ? t : 'NVDA')}</select></label><label>Forward EPS $<input name="eps" type="number" step="0.01"></label><label>EPS growth per year %<input name="g" type="number" step="0.5"></label><label>P/E in 5 years<input name="pe" type="number" step="0.5"></label><label>Required return %<input name="r" type="number" step="0.5" value="10"></label></form><div class="tz-k" id="tz-fo" style="margin-top:14px"></div><p class="muted" style="margin:12px 0 0;font-size:12.5px">Educational model only, not a price target. Forward EPS = last close ÷ forward P/E. Growth starts from analysts' expected EPS growth, capped at 40% a year.</p>`));
  document.title = 'Fair Value Calculator — Tickerwise'; const f = $('#tz-ff');
  const fill = () => { const s = BY[f.t.value] || {}, l = last(f.t.value), fpe = (s.val || {}).fpe, g = nz(s.rg) ? s.rg : nz((s.fq || {}).g) ? s.fq.g : 12; f.eps.value = l && fpe > 0 ? (l.c / fpe).toFixed(2) : ''; f.g.value = Math.max(0, Math.min(40, Math.round(g))); f.pe.value = fpe > 0 ? Math.round(Math.min(35, Math.max(12, fpe * .8))) : 20; calc(); };
  const calc = () => { const l = last(f.t.value), eps = +f.eps.value, g = +f.g.value / 100, pe = +f.pe.value, r = +f.r.value / 100; if (!(eps > 0) || !l) { $('#tz-fo').innerHTML = '<div><span>Result</span><b style="font-size:15px">Needs positive earnings</b></div>'; return; }
    const e5 = eps * Math.pow(1 + g, 5), p5 = e5 * pe, fv = p5 / Math.pow(1 + r, 5), up = (fv / l.c - 1) * 100;
    $('#tz-fo').innerHTML = `<div><span>Last close</span><b>${usd(l.c)}</b></div><div><span>EPS in 5 years</span><b>${usd(e5)}</b></div><div><span>Price in 5 years</span><b>${usd(p5, 0)}</b></div><div><span>Fair value today</span><b>${usd(fv)}</b></div><div><span>Upside / downside</span><b class="${gcol(up)}">${pct(up)}</b></div>`; };
  f.t.onchange = fill; f.oninput = e => { if (e.target.name !== 't') calc(); }; fill();
}

/* ============ FUND LETTERS LIBRARY ============ */
const LET = [['Warren Buffett', 'Berkshire Hathaway shareholder letters (1977 to today)', 'https://www.berkshirehathaway.com/letters/letters.html'], ['Howard Marks', 'Oaktree memos', 'https://www.oaktreecapital.com/insights/memos'], ['Bill Ackman', 'Pershing Square Holdings reports and letters', 'https://pershingsquareholdings.com/company-reports/'], ['Seth Klarman', 'Baupost (letters are private; read his book Margin of Safety)', 'https://en.wikipedia.org/wiki/Seth_Klarman'], ['Terry Smith', 'Fundsmith annual letters', 'https://www.fundsmith.co.uk/'], ['Chuck Akre', 'Akre Capital commentary', 'https://akrefund.com/'], ['Bruce Berkowitz', 'Fairholme Fund reports', 'https://www.fairholmefunds.com/'], ['Li Lu', 'Talks and essays (Himalaya Capital)', 'https://www.himcap.com/'], ['Mohnish Pabrai', 'Pabrai Funds letters and talks', 'https://www.pabraifunds.com/'], ['Bill Nygren', 'Oakmark Funds commentary', 'https://oakmark.com/news-insights/'], ['Tom Russo', 'Gardner Russo & Quinn', 'https://www.gardnerrusso.com/'], ['Joel Greenblatt', 'Gotham Asset Management', 'https://www.gothamfunds.com/']];
function letters() {
  app.innerHTML = head('Fund Letters Library', 'The best investors explain their thinking in their own words. Free, public letters and memos from the legends we track.') + wrap(`<div class="tz-g">${LET.map(l => `<a class="tz-tile" href="${l[2]}" target="_blank" rel="noopener nofollow"><i>📜</i><b>${l[0]}</b><span>${l[1]}</span><span style="color:#2F6BFF;font-weight:700">Read ↗</span></a>`).join('')}</div>
    ${lock('AI summaries of every new letter, delivered by email', 'require the upgraded plan.')}`);
  document.title = 'Fund Letters — Tickerwise';
}

/* ============ SECTOR ROTATION of the legends (appended to #/investors) ============ */
function rotation() {
  const F = window.TWFI; if (!F || !F.ACT || $('#tz-rot')) return; const anchor = $('#app .sec .wrap'); if (!anchor) return; const sec = {};
  Object.values(F.ACT).forEach(o => { const s = (BY[o.t] || {}).sec; if (!s) return; const x = sec[s] = sec[s] || { s, b: 0, sv: 0, n: 0 }; x.b += o.bv || 0; x.sv += o.sv || 0; x.n++; });
  const L = Object.values(sec).map(x => Object.assign(x, { net: x.b - x.sv })).sort((a, b) => b.net - a.net); if (!L.length) return; const mx = Math.max(...L.map(x => Math.abs(x.net))) || 1;
  const bn = v => (v < 0 ? '−' : '+') + '$' + (Math.abs(v) >= 1e9 ? (Math.abs(v) / 1e9).toFixed(1) + 'B' : (Math.abs(v) / 1e6).toFixed(0) + 'M');
  const el = document.createElement('div'); el.className = 'card'; el.id = 'tz-rot';
  el.innerHTML = `<div class="card-h"><h3>Sector Rotation</h3><span>where the 30 legends moved money last quarter · stocks we cover</span></div>${L.map(x => `<div style="display:grid;grid-template-columns:minmax(90px,170px) 1fr 80px;gap:10px;align-items:center;margin:7px 0;font-size:13.5px"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.s)}</b><div style="display:flex;height:14px"><div style="flex:1;display:flex;justify-content:flex-end">${x.net < 0 ? `<i style="display:block;height:100%;width:${Math.abs(x.net) / mx * 100}%;background:#EF4444;border-radius:7px 0 0 7px"></i>` : ''}</div><div style="flex:1">${x.net > 0 ? `<i style="display:block;height:100%;width:${x.net / mx * 100}%;background:#10B981;border-radius:0 7px 7px 0"></i>` : ''}</div></div><span class="n ${gcol(x.net)}" style="text-align:right;font-weight:700">${bn(x.net)}</span></div>`).join('')}`;
  anchor.appendChild(el);
}

/* ============ UPGRADED PLAN gates ============ */
function ask() {
  app.innerHTML = head('Ask Tickerwise AI', 'Ask anything about a stock, your portfolio or a term, and get an answer built on our scores and data.') + wrap(`
    ${card('AI Research Chat', '', `<div class="tz-f" style="opacity:.6;pointer-events:none"><label style="flex:1 1 100%"><input placeholder="e.g. Why did NVDA's score fall this month? Compare it with AMD."></label><button class="btn primary">Ask</button></div><div style="margin-top:14px">${lock('AI Research Chat', 'requires the upgraded plan.')}</div>`)}
    ${card('Free Right Now', '', '<p style="margin:0">Every stock page has a plain-English summary, a Report Card and Famous Investors ownership. <a href="#/learn">Learn & Glossary</a> explains every term.</p>')}`);
  document.title = 'Ask Tickerwise AI — Tickerwise';
}
function apps() {
  app.innerHTML = head('Tickerwise on Your Phone', 'Add Tickerwise to your home screen today. Native iPhone and Android apps with push alerts are part of the upgraded plan.') + wrap(`
    ${card('Add to Home Screen', 'free, works now', `<div class="tz-k"><div><span>iPhone (Safari)</span><b style="font-size:15px">Share ↑ → Add to Home Screen</b></div><div><span>Android (Chrome)</span><b style="font-size:15px">⋮ menu → Add to Home screen</b></div></div>${INST ? '<p style="margin:12px 0 0"><button class="btn primary" id="tz-ins">Install Tickerwise</button></p>' : ''}`)}
    ${lock('Native apps with push notifications', 'require the upgraded plan.')}`);
  document.title = 'Mobile App — Tickerwise'; const b = $('#tz-ins'); if (b) b.onclick = () => { INST.prompt(); INST = null; };
}
let INST = null; window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); INST = e; });
(() => { if ($('link[rel=manifest]')) return; const m = { name: 'Tickerwise', short_name: 'Tickerwise', start_url: location.origin + location.pathname, display: 'standalone', background_color: '#0B1B3F', theme_color: '#0B1B3F', icons: [] };
  const l = document.createElement('link'); l.rel = 'manifest'; l.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(m)); document.head.appendChild(l);
  [['apple-mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-title', 'Tickerwise'], ['theme-color', '#0B1B3F']].forEach(([n, c]) => { if (!$(`meta[name="${n}"]`)) { const x = document.createElement('meta'); x.name = n; x.content = c; document.head.appendChild(x); } }); })();
function alertsExtras() { const m = $('#app .sec .wrap'); if (!m || $('#tz-al')) return; const el = document.createElement('div'); el.id = 'tz-al'; el.innerHTML = card('Email & Phone Delivery', '', `<div class="tz-f" style="opacity:.6;pointer-events:none;margin-bottom:12px"><label><input placeholder="you@email.com"></label><label><input placeholder="Mobile number"></label><button class="btn ghost">Save</button></div>${lock('Alerts by email, text message and push notification', 'require the upgraded plan. Alerts on this page are checked every time you open Tickerwise.')}`); m.appendChild(el); }
function toolTiles() {
  const g = $('#app .tt-g'); if (!g || $('#tz-tt')) return; const mark = document.createElement('i'); mark.id = 'tz-tt'; mark.hidden = true; g.appendChild(mark);
  const T = [['🗂️', 'My Dashboard', 'Build your own home page from the panels you care about.', '#/dashboard'], ['👥', 'Community', 'Posts and weekly polls on every stock, plus Q&A with members and Lead Traders.', '#/community'], ['🏟️', 'Leagues', 'Private Paper Trading leagues for friends, family and classes.', '#/leagues'], ['🏁', 'Replay Leaderboard', 'A daily replay challenge and the best runs of all time.', '#/replay-board'], ['🫂', 'Groups', 'Shared picks and notes for families and investment clubs.', '#/groups'], ['🧾', 'Limit & Stop Orders', 'Paper orders that fill automatically at the close.', '#/orders'], ['🎲', 'Paper Options', 'Practice calls and puts with simulated Black-Scholes prices.', '#/options'], ['⚖️', 'Fair Value Calculator', 'What is a stock worth? Five inputs, one answer.', '#/fairvalue'], ['🧩', 'Score Widgets', 'Embed a live Tickerwise Score on your own site.', '#/widgets'], ['🏦', 'Broker Comparison', 'Fees at 10 popular brokers, side by side.', '#/brokers'], ['📜', 'Fund Letters', 'Letters and memos from Buffett, Marks, Ackman and more.', '#/letters'], ['🌟', 'Creator Program', 'How top paper traders become paid Lead Traders.', '#/creators'], ['🤖', 'Ask Tickerwise AI', 'Research chat on any stock or portfolio.', '#/ask', 1], ['📱', 'Mobile App', 'Home-screen app today; native apps with push alerts.', '#/app', 1]].filter(t => !twOffH(t[3]));
  g.insertAdjacentHTML('beforeend', T.map(t => `<a class="tt-tool" href="${t[3]}" style="position:relative">${t[4] ? '<em style="background:linear-gradient(90deg,#7C3AED,#2F6BFF);color:#fff">Upgraded Plan</em>' : '<em>New</em>'}<i>${t[0]}</i><b>${t[1]}</b><span>${t[2]}</span></a>`).join(''));
}

/* ============ router ============ */
const PAGES = { community, leagues, 'replay-board': replayBoard, groups, creators, orders, options, widgets, dashboard: dash, brokers, fairvalue, letters, ask, app: apps, embed };
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('?')[0].split('/'); if (p[0] !== 'embed') document.body.classList.remove('tz-embed');
  if (PAGES[p[0]]) { $$('#navlinks a').forEach(a => a.classList.toggle('on', a.dataset.r === 'tools')); try { PAGES[p[0]](p[1] && decodeURIComponent(p[1])); } catch (e) { if (window.console) console.error(e); } window.scrollTo(0, 0); return; }
  if (p[0] === 'tools') { let n = 0; const go = () => { if ($('#app .tt-g')) toolTiles(); else if (n++ < 20) setTimeout(go, 150); }; go(); }
  if (p[0] === 'alerts') { let n = 0; const go = () => { if ($('#app .sec .wrap')) alertsExtras(); else if (n++ < 20) setTimeout(go, 150); }; setTimeout(go, 200); }
  if (p[0] === 'investors' && !p[1]) { let n = 0; const go = () => { if (window.TWFI && $('#app .sec .wrap')) rotation(); else if (n++ < 30) setTimeout(go, 200); }; setTimeout(go, 400); }
  if (p[0] === 'stock' && p[1] && (!p[2] || p[2] === 'overview')) { const t = decodeURIComponent(p[1]).toUpperCase(); let n = 0; const go = () => { if ($('.main') && ($('#tt-rc') || n > 12)) stockCommunity(t); else if (n++ < 30) setTimeout(go, 200); }; setTimeout(go, 700); }
}
window.addEventListener('hashchange', () => setTimeout(route, 60));
const filled = runOrders(); if (filled.length) setTimeout(() => toast(`🧾 ${filled.length} paper order${filled.length === 1 ? '' : 's'} filled: ${esc(filled[0].side === 'buy' ? 'bought' : 'sold')} ${filled[0].q} ${esc(filled[0].t)} at ${usd(filled[0].fp)} <a href="#/orders">View</a>`), 2500);
setTimeout(route, 60);
window.TWZ = { bs, hv, runOrders, widgetHTML, daily };
})();
