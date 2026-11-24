/* Tickerwise app14: member accounts.
   Sign up / log in through Wix-hosted pages (OAuth + PKCE), sync watchlist, paper portfolios, alerts, badges, journal and follows
   across devices (Wix Data "MemberSync", readable only by its owner), account page, referral links, score history.
   The owner key login (app3) is untouched: lock cards on owner-only pages still open it, and the member menu links to it. */
(function () {
if (window.TWA) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { BY, esc, nz, dfmt } = X, app = $('#app'); if (!app) return;
const CID = '5883ec70-a62e-4258-806c-af065b13f4c9', API = 'https://www.wixapis.com', MK = 'tw_member', PK = 'tw_pkce';
const KEYS = ['tw-watchlist', 'tw_paper', 'tw_alerts', 'tw_journal', 'tw_replay', 'tw_streak', 'tw_inv_follow', 'tw_follow', 'tw_xray', 'tw_comm', 'tw_ps', 'tw_groups', 'tw_leagues', 'tw_orders', 'tw_opts', 'tw_dash', 'tw_votes', 'tw_thesis', 'tw_riskpf', 'tw_preds', 'tw_pred_res', 'tw_acad', 'tw_tdl', 'tw_pick5', 'tw_legend', 'tw_follow_m', 'tw_upv'];
const jget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const rand = n => b64u(crypto.getRandomValues(new Uint8Array(n)));
const redirectUri = () => location.origin + (/index\.html$/.test(location.pathname) ? location.pathname : '/');

/* ---------- tokens ---------- */
const M = () => jget(MK, null);
async function visitor() { const PP = window.TWPP; if (PP && PP.token) return PP.token(); const r = await fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: CID, grantType: 'anonymous' }) }).then(x => x.json()); return r.access_token; }
async function mtoken() {
  const m = M(); if (!m) return null; if (m.exp > Date.now() + 60000) return m.a;
  const r = await fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: CID, grantType: 'refresh_token', refreshToken: m.r }) }).then(x => x.ok ? x.json() : null).catch(() => null);
  if (!r || !r.access_token) { localStorage.removeItem(MK); refreshUI(); return null; }
  m.a = r.access_token; m.r = r.refresh_token || m.r; m.exp = Date.now() + (r.expires_in || 14400) * 1000; jset(MK, m); return m.a;
}
async function login(mode) {
  const v = rand(48), ch = b64u(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))), state = rand(16), ret = location.hash && !/code=|state=/.test(location.hash) ? location.hash : '#/account';
  jset(PK, { v, state, ret, mode, ru: redirectUri() });
  const body = { auth: { authRequest: { redirectUri: redirectUri(), clientId: CID, codeChallenge: ch, codeChallengeMethod: 'S256', responseMode: 'fragment', responseType: 'code', scope: 'offline_access', state } } };
  const r = await fetch(API + '/_api/redirects-api/v1/redirect-session', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: await visitor() }, body: JSON.stringify(body) }).then(x => x.json()).catch(e => ({ e: String(e) }));
  const url = r.redirectSession && r.redirectSession.fullUrl; if (!url) { alert('Sorry, login is not available right now. Please try again in a minute.'); return; }
  location.href = url;
}
async function callback() {
  const h = location.hash.replace(/^#\/?/, ''); if (!/(^|&)(code|error)=/.test(h)) return false;
  const q = new URLSearchParams(h), pk = jget(PK, null); localStorage.removeItem(PK);
  if (q.get('error') || !pk || q.get('state') !== pk.state) { history.replaceState(null, '', location.pathname + '#/'); toast('Login was cancelled or expired. Please try again.'); return true; }
  history.replaceState(null, '', location.pathname + '#/');
  const r = await fetch(API + '/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: CID, grantType: 'authorization_code', redirectUri: pk.ru, code: q.get('code'), codeVerifier: pk.v }) }).then(x => x.json()).catch(() => null);
  if (!r || !r.access_token) { toast('We could not complete the login. Please try again.'); return true; }
  const m = { a: r.access_token, r: r.refresh_token, exp: Date.now() + (r.expires_in || 14400) * 1000 };
  try { const me = await fetch(API + '/members/v1/members/my?fieldsets=FULL', { headers: { Authorization: m.a } }).then(x => x.json()); const mm = me.member || {};
    m.id = mm.id || mm.contactId; m.email = mm.loginEmail || ((mm.contact || {}).emails || [])[0] || ''; m.nick = (mm.profile || {}).nickname || [((mm.contact || {}).firstName || ''), ((mm.contact || {}).lastName || '')].join(' ').trim() || (m.email || 'Member').split('@')[0]; m.photo = ((mm.profile || {}).photo || {}).url || ''; m.since = (mm.createdDate || '').slice(0, 10); } catch (e) {}
  jset(MK, m); await sync(true); await referral();
  location.hash = pk.ret || '#/account'; location.reload(); return true;
}
function logout() { localStorage.removeItem(MK); refreshUI(); toast('You are logged out. Your data stays saved in your account.'); if (/^#\/account/.test(location.hash)) location.hash = '#/'; }

/* ---------- sync (one private item per member) ---------- */
let ITEM = null, pushing = 0, lastSync = jget('tw_sync_at', null);
const mh = async () => ({ 'Content-Type': 'application/json', Authorization: await mtoken() });
async function pull() { const r = await fetch(API + '/wix-data/v2/items/query', { method: 'POST', headers: await mh(), body: JSON.stringify({ dataCollectionId: 'MemberSync', query: { cursorPaging: { limit: 5 } } }) }).then(x => x.json()); const it = (r.dataItems || [])[0]; ITEM = it ? it.id : null; return it ? (it.data.data || {}) : null; }
function merge(k, a, b) { // a = remote, b = local
  if (a == null) return b; if (b == null) return a;
  if (k === 'tw-watchlist') return [...new Set(a.concat(b))];
  if (k === 'tw_alerts') { const o = {}; a.concat(b).forEach(x => { o[x.id] = Object.assign(o[x.id] || {}, x); }); return Object.values(o); }
  if (k === 'tw_paper') { const L = {}; (a.list || []).concat(b.list || []).forEach(P => { const ex = L[P.id]; if (!ex || (P.lots || []).length >= (ex.lots || []).length) L[P.id] = P; }); return { prof: b.prof || a.prof, list: Object.values(L) }; }
  if (k === 'tw_replay') return { runs: Math.max(a.runs || 0, b.runs || 0), best: Math.max(nz(a.best) ? a.best : -1e9, nz(b.best) ? b.best : -1e9), beat: Math.max(a.beat || 0, b.beat || 0) };
  if (k === 'tw_streak') return b.d >= (a.d || '') ? Object.assign(b, { best: Math.max(a.best || 0, b.best || 0) }) : Object.assign(a, { best: Math.max(a.best || 0, b.best || 0) });
  if (Array.isArray(a) || Array.isArray(b)) return [...new Set([].concat(a, b).map(x => JSON.stringify(x)))].map(x => JSON.parse(x));
  if (typeof a === 'object' && typeof b === 'object') return Object.assign({}, a, b);
  return b;
}
async function push() { if (!M()) return; const data = {}; KEYS.forEach(k => { const v = jget(k, null); if (v != null) data[k] = v; });
  const item = { nick: M().nick || '', data }, h = await mh(); if (!h.Authorization) return;
  const r = ITEM ? await fetch(API + '/wix-data/v2/items/' + ITEM, { method: 'PUT', headers: h, body: JSON.stringify({ dataCollectionId: 'MemberSync', dataItem: { id: ITEM, data: item } }) })
    : await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: h, body: JSON.stringify({ dataCollectionId: 'MemberSync', dataItem: { data: item } }) });
  if (r.ok) { const j = await r.json().catch(() => ({})); if (j.dataItem) ITEM = j.dataItem.id; lastSync = new Date().toISOString(); jset('tw_sync_at', lastSync); } }
async function sync(first) { if (!M()) return; try { const remote = await pull(); if (remote) KEYS.forEach(k => { const v = merge(k, remote[k], jget(k, null)); if (v != null) { SKIP = 1; jset(k, v); SKIP = 0; } }); await push(); } catch (e) { if (window.console) console.error(e); } }
let SKIP = 0, T = null; const _set = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) { _set.call(this, k, v); if (!SKIP && this === window.localStorage && KEYS.includes(k) && M()) { clearTimeout(T); T = setTimeout(() => push().catch(() => {}), 2500); } };

/* ---------- referrals: ?ref= or #/r/CODE ---------- */
const myCode = () => { const m = M(); if (!m || !m.id) return ''; let h = 0; for (const c of m.id) h = (h * 33 + c.charCodeAt(0)) >>> 0; return (m.nick || 'tw').replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase() + h.toString(36).slice(0, 4).toUpperCase(); };
(() => { const m = location.search.match(/[?&]ref=([A-Za-z0-9]{4,16})/) || location.hash.match(/^#\/r\/([A-Za-z0-9]{4,16})/); if (m) { if (!jget('tw_ref', null)) jset('tw_ref', m[1]); if (/^#\/r\//.test(location.hash)) history.replaceState(null, '', location.pathname + '#/'); } })();
async function referral() { const ref = jget('tw_ref', null); if (!ref || jget('tw_ref_done', 0) || ref === myCode()) return; try { const r = await fetch(API + '/wix-data/v2/items', { method: 'POST', headers: await mh(), body: JSON.stringify({ dataCollectionId: 'Referrals', dataItem: { data: { ref, nick: (M() || {}).nick || '' } } }) }); if (r.ok) jset('tw_ref_done', 1); } catch (e) {} }

/* ---------- UI ---------- */
const css = document.createElement('style'); css.textContent = `
.ta-ov{position:fixed;inset:0;z-index:1000;background:rgba(7,19,52,.55);backdrop-filter:blur(4px);display:grid;place-items:center;padding:16px}
.ta-m{background:#fff;border-radius:22px;max-width:440px;width:100%;padding:26px;box-shadow:0 40px 80px rgba(0,0,0,.35);position:relative}
.ta-m h3{margin:0 0 6px;font:800 24px 'Space Grotesk',sans-serif}.ta-m p{margin:0 0 14px;color:var(--mut);font-size:14px;line-height:1.55}.ta-m ul{margin:0 0 16px;padding-left:18px;font-size:14px;line-height:1.8}
.ta-b{display:block;width:100%;cursor:pointer;border:0;border-radius:12px;padding:13px 16px;font:700 15px Inter,sans-serif;background:linear-gradient(90deg,#00C176,#0EA5E9);color:#fff;margin-top:8px}.ta-b.g{background:#fff;color:#0B1B3F;border:1.5px solid var(--line)}
.ta-x{position:absolute;right:14px;top:12px;border:0;background:none;font-size:22px;cursor:pointer;color:#64748B}
.ta-own{display:block;text-align:center;margin-top:14px;font-size:12.5px;color:#94A3B8;cursor:pointer}
.ta-chip{display:inline-flex;align-items:center;gap:8px}.ta-av{width:26px;height:26px;border-radius:50%;display:inline-grid;place-items:center;background:linear-gradient(135deg,#1E4FD8,#00794A);color:#fff;font:800 12px Inter,sans-serif;overflow:hidden}.ta-av img{width:100%;height:100%;object-fit:cover}
.ta-menu{position:fixed;z-index:1001;background:#fff;border:1.5px solid var(--line);border-radius:14px;box-shadow:0 20px 40px rgba(11,27,63,.18);padding:6px;min-width:220px}.ta-menu a,.ta-menu button{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:10px;border:0;background:none;font:600 14px Inter,sans-serif;color:#0B1B3F;cursor:pointer;text-decoration:none}.ta-menu a:hover,.ta-menu button:hover{background:#F1F5F9}
.ta-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.ta-k>div{background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px}.ta-k span{display:block;font-size:12px;color:var(--mut);font-weight:600}.ta-k b{display:block;font:800 20px 'Space Grotesk',sans-serif;overflow:hidden;text-overflow:ellipsis}
.tw-up{display:inline-block;background:linear-gradient(90deg,#7C3AED,#2F6BFF);color:#fff;font:700 11px Inter,sans-serif;padding:3px 9px;border-radius:999px;letter-spacing:.02em}
.ta-ref{display:flex;gap:8px;flex-wrap:wrap}.ta-ref input{flex:1 1 260px;min-width:0;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font:500 14px Inter,sans-serif}
`; document.head.appendChild(css);
function toast(h) { const t = document.createElement('div'); t.className = 'tt-toast'; t.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1002;max-width:min(360px,calc(100vw - 32px));background:#0B1B3F;color:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 20px 40px rgba(0,0,0,.3);font-size:14px'; t.innerHTML = h; document.body.appendChild(t); setTimeout(() => t.remove(), 6000); t.onclick = () => t.remove(); }
function modal(mode) {
  const o = document.createElement('div'); o.className = 'ta-ov'; o.innerHTML = `<div class="ta-m" role="dialog" aria-modal="true"><button class="ta-x" aria-label="Close">×</button><h3>${mode === 'in' ? 'Welcome Back' : 'Create Your Free Account'}</h3><p>Free forever. Your account keeps everything in sync on every device:</p>
    <ul><li>Watchlist, alerts and Portfolio X-Ray</li><li>Paper Trading portfolios, badges and journal</li><li>Leagues, Community posts and replay scores</li><li>Investors and Lead Traders you follow</li></ul>
    <button class="ta-b" data-go="up">${mode === 'in' ? 'Log In' : 'Sign Up Free'}</button><button class="ta-b g" data-go="in">${mode === 'in' ? 'New Here? Sign Up Free' : 'I Already Have an Account'}</button>
    <p style="margin:12px 0 0;font-size:12px">Sign-up and log-in happen on a secure Wix page (email, Google or Facebook), then bring you right back.</p><a class="ta-own" data-own>Site Owner Access</a></div>`;
  document.body.appendChild(o); const close = () => o.remove(); $('.ta-x', o).onclick = close; o.onclick = e => { if (e.target === o) close(); };
  $$('[data-go]', o).forEach(b => b.onclick = () => { b.textContent = 'Opening Secure Login…'; login(b.dataset.go); });
  $('[data-own]', o).onclick = () => { close(); window.__twOwner = 1; const b = document.createElement('button'); b.id = 'tw-in'; b.style.display = 'none'; document.body.appendChild(b); b.click(); b.remove(); window.__twOwner = 0; };
}
function menu(anchor) { const m = M(), r = anchor.getBoundingClientRect(), d = document.createElement('div'); d.className = 'ta-menu'; d.style.top = (r.bottom + 6) + 'px'; d.style.right = Math.max(8, innerWidth - r.right) + 'px';
  d.innerHTML = `<div style="padding:8px 12px 10px;border-bottom:1px solid var(--line);margin-bottom:4px"><b>${esc(m.nick || 'Member')}</b><div class="muted" style="font-size:12px">${esc(m.email || '')}</div></div><a href="#/account">👤 My Account</a><a href="#/watchlist">☆ Watchlist</a><a href="#/paper">📈 Paper Trading</a><a href="#/alerts">🔔 Alerts</a><button data-sync>🔄 Sync Now</button><button data-out>↩ Log Out</button>`;
  document.body.appendChild(d); const close = e => { if (!d.contains(e.target)) { d.remove(); document.removeEventListener('click', close, true); } }; setTimeout(() => document.addEventListener('click', close, true), 0);
  $('[data-out]', d).onclick = () => { d.remove(); logout(); }; $('[data-sync]', d).onclick = async () => { d.remove(); await sync(); toast('✓ Synced'); }; }
const av = m => `<span class="ta-av">${m.photo ? `<img src="${esc(m.photo)}" alt="">` : esc((m.nick || 'M').slice(0, 1).toUpperCase())}</span>`;
function refreshUI() { const m = M(); $$('#tw-in').forEach(b => { if (b.closest('.tw-lock') || b.style.display === 'none') return; if (m) { if (!b.__mem) { b.__mem = 1; b.dataset.label = b.textContent; } b.innerHTML = `<span class="ta-chip" title="${esc(m.nick || "My Account")}">${av(m)}</span>`; } else if (b.__mem) { b.__mem = 0; b.textContent = b.dataset.label || 'Log In'; } }); }
window.addEventListener('click', e => {
  if (window.__twOwner) return; const b = e.target.closest('#tw-in, [data-login]'); if (!b || b.closest('.tw-lock')) return;
  e.preventDefault(); e.stopImmediatePropagation(); if (M()) { if (b.id === 'tw-in') menu(b); else location.hash = '#/account'; } else modal(b.dataset.login === 'in' ? 'in' : 'up');
}, true);

/* ---------- account page ---------- */
function account() {
  const m = M(); if (!m) { app.innerHTML = `<section class="page-h"><div class="wrap"><h1>Your Account</h1><p>Create a free account to keep your watchlist, paper portfolios, alerts and badges on every device.</p></div></section><section class="sec"><div class="wrap"><button class="btn primary" data-login="up">Sign Up Free</button> <button class="btn ghost" data-login="in">Log In</button></div></section>`; return; }
  const P = jget('tw_paper', { list: [] }).list || [], W = jget('tw-watchlist', []), A = jget('tw_alerts', []), s = jget('tw_streak', { n: 1, best: 1 }), link = location.origin + location.pathname + '#/r/' + myCode();
  app.innerHTML = `<section class="page-h"><div class="wrap" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">${av(m).replace('ta-av', 'ta-av" style="width:64px;height:64px;font-size:26px')}<div><h1>${esc(m.nick || 'Your Account')}</h1><p>${esc(m.email || '')}${m.since ? ' · member since ' + esc(dfmt(m.since)) : ''}</p></div></div></section>
  <section class="sec" style="padding-top:22px"><div class="wrap" style="display:flex;flex-direction:column;gap:18px">
    <div class="ta-k"><div><span>Watchlist</span><b>${W.length}</b></div><div><span>Paper portfolios</span><b>${P.length}</b></div><div><span>Alerts</span><b>${A.length}</b></div><div><span>Streak</span><b>🔥 ${s.n} day${s.n === 1 ? '' : 's'}</b></div><div><span>Last synced</span><b style="font-size:15px">${lastSync ? new Date(lastSync).toLocaleString() : 'Not yet'}</b></div></div>
    <div class="card"><div class="card-h"><h3>Invite Friends</h3><span>your personal link</span></div><p style="margin:0 0 10px">Share Tickerwise with friends. When paid plans launch, every friend who joins earns you both a free month of Pro.</p><div class="ta-ref"><input id="ta-rl" value="${esc(link)}" readonly><button class="btn primary" id="ta-cp">Copy Link</button></div></div>
    <div class="card"><div class="card-h"><h3>Your Data</h3><span>synced automatically</span></div><p style="margin:0 0 10px;line-height:1.6">Your watchlist, Paper Trading portfolios, alerts, journal, badges, follows and X-Ray holdings save to your account a few seconds after any change, and load on every device you log in on.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" id="ta-sy">🔄 Sync Now</button><button class="btn ghost" id="ta-lo">↩ Log Out</button></div></div>
    <div class="card"><div class="card-h"><h3>Upgraded Plan Features</h3><span class="tw-up">Upgraded Plan</span></div><p style="margin:0;line-height:1.6">Email and phone alerts, the daily briefing by email, AI research chat and broker linking require the upgraded plan.</p></div>
  </div></section>`;
  $('#ta-cp').onclick = () => { const i = $('#ta-rl'); i.select(); try { navigator.clipboard.writeText(i.value); } catch (e) { document.execCommand('copy'); } toast('✓ Link copied'); };
  $('#ta-sy').onclick = async () => { await sync(); account(); toast('✓ Synced'); }; $('#ta-lo').onclick = logout; document.title = 'Your Account — Tickerwise';
}

/* ---------- score history on the stock Report Card ---------- */
let SH = null; const base = () => window.TW_BASE != null ? window.TW_BASE : 'https://raw.githubusercontent.com/Zev-Dobuler/tickerwise-data/main/';
async function hist() { if (SH) return SH; try { SH = await fetch(base() + 'scores_hist.json' + (window.TW_BASE ? '' : '?t=' + Math.floor(Date.now() / 36e5)), { cache: 'no-store' }).then(x => x.json()); } catch (e) { SH = { d: [], T: {} }; } return SH; }
async function scoreHist(t) { const rc = $('#tt-rc'); if (!rc || $('#ta-sh', rc)) return; const H = await hist(), row = (H.T || {})[t]; if (!row || !$('#tt-rc') || $('#ta-sh', rc)) return;
  const pts = H.d.map((d, i) => [d, row[i] ? row[i][0] : null]).filter(p => p[1] != null), el = document.createElement('div'); el.id = 'ta-sh'; el.style.cssText = 'border-top:1px solid var(--line);margin-top:12px;padding-top:10px;font-size:13.5px';
  if (pts.length < 2) el.innerHTML = `<b>📈 Score history</b> <span class="muted">· tracking every night since ${esc(dfmt(H.d[0]))}. The chart fills in as days pass.</span>`;
  else { const W = 600, Hh = 70, X = i => i / (pts.length - 1) * W, Y = v => Hh - 6 - (v - 1) / 9 * (Hh - 12); const ch = pts.map((p, i) => i && p[1] !== pts[i - 1][1] ? { d: p[0], a: pts[i - 1][1], b: p[1] } : null).filter(Boolean);
    el.innerHTML = `<b>📈 Score history</b> <span class="muted">· ${pts.length} nightly snapshots since ${esc(dfmt(pts[0][0]))}${ch.length ? ' · last change ' + esc(dfmt(ch[ch.length - 1].d)) + ': ' + ch[ch.length - 1].a + ' → ' + ch[ch.length - 1].b : ' · unchanged'}</span><svg viewBox="0 0 ${W} ${Hh}" width="100%" height="${Hh}" preserveAspectRatio="none"><path d="${pts.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('')}" fill="none" stroke="#2F6BFF" stroke-width="2.5"/></svg>`; }
  rc.appendChild(el); }

/* ---------- router ---------- */
function route() { refreshUI(); const p = location.hash.replace(/^#\/?/, '').split('#')[0].split('/');
  if (p[0] === 'account') { account(); return; }
  if (p[0] === 'stock' && p[1] && (!p[2] || p[2] === 'overview')) { let n = 0; const go = () => { if ($('#tt-rc')) scoreHist(decodeURIComponent(p[1]).toUpperCase()); else if (n++ < 30) setTimeout(go, 200); }; setTimeout(go, 500); } }
new MutationObserver(() => refreshUI()).observe(document.body, { childList: true, subtree: false });
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; refreshUI(); }, 200); }).observe($('header') || document.body, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { if (/^#\/?(code|error)=/.test(location.hash)) { callback(); return; } setTimeout(route, 50); });
callback().then(done => { if (done) return; route(); if (M()) { sync(); setInterval(() => { if (document.visibilityState === 'visible') sync(); }, 5 * 60 * 1000); } });
window.TWA = { member: M, token: mtoken, login, logout, sync, push, hist, toast };
})();
