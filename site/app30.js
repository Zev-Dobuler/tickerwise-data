/* Tickerwise app30: tool hubs (Zev, Nov 24, 2026: "I approve all these mergers").
   Twelve overlapping tools become three hubs. Each hub shows ONE tile on the Tools page, and every page in the hub
   gets the same tab bar at the top, so moving between them feels like one tool:
   - Portfolio Check: X-Ray, Risk Scan, Crash Test, Correlation
   - Contests: Challenges (Paper Trading), Pick 5, Prediction Game, Leagues
   - Community: Discussions, Activity Feed, Members, Groups
   The pages themselves are unchanged; only the Tools tiles and the tab bar are new. */
(function () {
if (window.TWHUB) return; window.TWHUB = 1;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)], app = $('#app'); if (!app) return;
const HUBS = [
  { k: 'check', i: '🩺', n: 'Portfolio Check', d: 'One check-up for your stocks: X-Ray, risk scan, crash test and how much they move together.', t: [['🩻 X-Ray', '#/xray'], ['🛡️ Risk Scan', '#/risk-scan'], ['💥 Crash Test', '#/crashtest'], ['🧬 Correlation', '#/correlation']] },
  { k: 'contests', i: '🏆', n: 'Contests', d: 'Paper Trading challenges, weekly Pick 5, earnings predictions and private leagues, all in one place.', t: [['🏆 Challenges', '#/paper'], ['🏅 Pick 5', '#/pick5'], ['🎯 Prediction Game', '#/predict'], ['🏟️ Leagues', '#/leagues']] },
  { k: 'community', i: '👥', n: 'Community', d: 'Discussions on every stock, the activity feed, members to follow and groups for families and clubs.', t: [['💬 Discussions', '#/community'], ['📰 Activity Feed', '#/feed'], ['👥 Members', '#/members'], ['🫂 Groups', '#/groups']] }];
const MERGED = new Set(HUBS.flatMap(h => h.t.map(x => x[1])));
/* off the Tools page only (the page itself still opens from its other links): Fund Letters (Zev, Nov 24, 2026) */
const OFF_TOOLS = new Set(['#/letters']);
const base = h => '#/' + (String(h || '').replace(/^#\/?/, '').split(/[/?#]/)[0]);
const css = document.createElement('style'); css.textContent = `.hub-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:14px 0 0}.hub-bar b{font:800 12px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#64748B;margin-right:4px}.hub-bar a{border:1.5px solid var(--line,#E2E8F0);background:#fff;border-radius:999px;padding:6px 13px;font:700 13px Inter,sans-serif;color:#0B1B3F;text-decoration:none;white-space:nowrap}.hub-bar a.on{background:#0B1B3F;border-color:#0B1B3F;color:#fff}.hub-bar a:hover:not(.on){border-color:#2F6BFF}@media(max-width:600px){.hub-bar{flex-wrap:nowrap;overflow-x:auto;max-width:100%;padding-bottom:4px}}`; document.head.appendChild(css);
/* Tools page: hide the 12 merged tiles, add the 3 hub tiles at the front */
function tools() { const g = $('#app .tt-g'); if (!g) return; $$('a.tt-tool', g).forEach(a => { const h = a.getAttribute('href') || ''; if ((MERGED.has(h) || OFF_TOOLS.has(h)) && !a.dataset.hub) a.remove(); });
  if (!$('a[data-hub]', g)) g.insertAdjacentHTML('afterbegin', HUBS.map(h => `<a class="tt-tool" data-hub="${h.k}" href="${h.t[0][1]}"><em>New</em><i>${h.i}</i><b>${h.n}</b><span>${h.d}</span></a>`).join('')); }
/* Hub pages: the shared tab bar under the page title */
function bar() { const cur = base(location.hash), h = HUBS.find(x => x.t.some(t => t[1] === cur)); const old = $('#app .hub-bar'); if (!h) { if (old) old.remove(); return; }
  if (cur === '#/paper' && location.hash.replace(/^#\/?/, '').split('/').length > 1) { if (old) old.remove(); return; } /* only on the Paper Trading home, not inside a portfolio */
  if (old && old.dataset.hub === h.k && old.dataset.cur === cur) return; if (old) old.remove();
  const ph = $('#app .page-h .wrap') || $('#app .page-h'); if (!ph) return;
  const el = document.createElement('div'); el.className = 'hub-bar'; el.dataset.hub = h.k; el.dataset.cur = cur; el.innerHTML = `<b>${h.n}</b>` + h.t.map(t => `<a href="${t[1]}" class="${t[1] === cur ? 'on' : ''}">${t[0]}</a>`).join(''); ph.appendChild(el); }
/* Next-earnings dates written by the base site ("Next report Feb 2, 2027", the Compare table's Next earnings row, demo posts) read "February 2nd" (Zev, Nov 24, 2026) */
const MS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const fx = t => t.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}), (20\d\d)\b/, (m, mo, d, y) => window.erFmt ? window.erFmt(y + '-' + String(MS[mo]).padStart(2, '0') + '-' + String(d).padStart(2, '0')) : m);
function erDates() {
  $$('#app .badge').forEach(b => { if (/^Next report \w{3} \d/.test(b.textContent)) b.textContent = fx(b.textContent); });
  $$('#app tr').forEach(tr => { const c = tr.cells; if (c && c[0] && /^Next earnings$/i.test(c[0].textContent.trim())) [...c].slice(1).forEach(td => { if (!td.children.length && /\d, 20\d\d/.test(td.textContent)) td.textContent = fx(td.textContent); }); });
  $$('#app .cm-tx').forEach(e => { if (!e.children.length && /^Earnings \w{3} \d{1,2}, 20\d\d/.test(e.textContent)) e.textContent = fx(e.textContent); });
}
/* Stock Overview order (Zev approved, Nov 24, 2026): most important first. Done with CSS order, so no section is moved in the page
   and every section's own code keeps working; the wrappers that group several sections become display:contents. */
const ORD = [[/^(r2-wch)$/, 1], [/^(ai-box)$/, 2], [/^Price Chart/, 10], [/^Report Card/, 20], [/^Tickerwise Take/, 30], [/^What's Happening/, 40], [/^Why Is It Moving/, 50],
  [/^Scores & Fundamentals/, 60], [/^Quarterly Results/, 70], [/^(ecall-)/, 71], [/^Earnings Preview/, 72], [/^Valuation & Cash Flow/, 80], [/^Fair Value/, 90], [/^Bull vs Bear/, 100], [/^Zacks Style/, 110],
  [/^Returns vs the S&P/, 120], [/^Performance/, 130], [/^Earnings Reactions/, 140], [/^Timeline/, 150], [/^The Big Picture/, 160], [/^Compare With Similar/, 170], [/^(r3-peer)$/, 180],
  [/^Stocks Like This/, 190], [/^ETFs That Own/, 200], [/In The News$/, 210], [/^Tickerwise Research/, 220], [/^Prediction Markets/, 230], [/^My Thesis/, 240], [/^Live Community/, 250],
  [/^Community$/, 260], [/^Get Alerts/, 270], [/^(r3-ad)$/, 280], [/^(r3-noprint)$/, 290]];
function ovOrder() {
  const m = $('#app .sp-body > .main'); if (!m) return; const parts = location.hash.replace(/^#\/?/, '').split(/[/?]/), ov = parts[0] === 'stock' && (!parts[2] || parts[2] === 'overview');
  if (!ov) { $$('[data-ovo]', m).forEach(e => { e.style.order = ''; if (e.dataset.ovo === 'w') e.style.display = ''; delete e.dataset.ovo; }); return; }
  const W = [$('#r2-why'), $('#r5-tl')].filter(Boolean).map(e => e.parentElement); const t = $('#r5-tl'); if (t && t.parentElement.parentElement !== m) W.push(t.parentElement.parentElement);
  [...W, $('#tw-sc'), $('#r3-st')].forEach(w => { if (w && w !== m && w.parentElement && (w.parentElement === m || w.parentElement.dataset.ovo === 'w')) { w.style.display = 'contents'; w.dataset.ovo = 'w'; } });
  const flat = []; const walk = el => [...el.children].forEach(k => k.dataset.ovo === 'w' ? walk(k) : flat.push(k)); walk(m);
  let prev = 0; flat.forEach(k => { const h = (k.querySelector('.card-h h3') || k.querySelector('h3') || k.querySelector('.card-h') || {}).textContent || '', ht = h.replace(/\s+/g, ' ').trim(); const key = (k.id || String(k.className || '').split(' ')[0]), r = ORD.find(([rx]) => rx.test(key) && /\(/.test(rx.source) || rx.test(ht)); const o = r ? r[1] : prev + 1; prev = o; if (k.style.order !== String(o)) k.style.order = o; k.dataset.ovo = 'c'; });
}
const tick = () => { if (base(location.hash) === '#/tools') tools(); bar(); erDates(); ovOrder(); };
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; tick(); }, 80); }).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { setTimeout(tick, 60); setTimeout(tick, 600); }); setTimeout(tick, 300);
})();
