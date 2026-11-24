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
const tick = () => { if (base(location.hash) === '#/tools') tools(); bar(); erDates(); };
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; tick(); }, 80); }).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { setTimeout(tick, 60); setTimeout(tick, 600); }); setTimeout(tick, 300);
})();
