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
  $$('#app *').forEach(l => { if (l.children.length || !/^Next earnings$/i.test(l.textContent.trim())) return; const v = l.nextElementSibling; const mm = v && !v.children.length && /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2})$/.exec(v.textContent.trim()); if (mm) v.textContent = window.erFmt('2000-' + String(MS[mm[1]]).padStart(2, '0') + '-' + mm[2].padStart(2, '0')); });
  $$('#app .cm-tx').forEach(e => { if (!e.children.length && /^Earnings \w{3} \d{1,2}, 20\d\d/.test(e.textContent)) e.textContent = fx(e.textContent); });
}
/* Stock Overview order (Zev approved, Nov 24, 2026): most important first. Done with CSS order, so no section is moved in the page
   and every section's own code keeps working; the wrappers that group several sections become display:contents. */
const ORD = [[/^(r2-wch)$/, 1], [/^(ai-box)$/, 2], [/^Price Chart/, 10], [/^Report Card/, 20], [/^Tickerwise Take/, 30], [/^What's Happening/, 40], [/^Why Is It Moving/, 50],
  [/^Scores & Fundamentals/, 60], [/^Quarterly Results/, 70], [/^(ecall-)/, 71], [/^Earnings Preview/, 72], [/^Valuation & Cash Flow/, 80], [/^Fair Value/, 90], [/^Bull vs Bear/, 100], [/^Zacks Style/, 110],
  [/^Returns vs the S&P/, 120], [/^Performance/, 130], [/^Earnings Reactions/, 140], [/^Timeline/, 150], [/^The Big Picture/, 160], [/^Compare With Similar/, 170], [/^(r3-peer)$/, 180],
  [/^Stocks Like This/, 190], [/^ETFs That Own/, 200], [/In The News$/, 210], [/^Tickerwise Research/, 220], [/^Prediction Markets/, 230], [/^My Thesis/, 240], [/^Live Community/, 250],
  [/^Community$/, 260], [/^Get Alerts/, 270], [/^(r3-ad)$/, 280], [/^(r3-noprint)$/, 290]];
const OVM = [
  ['moves', "What's Happening", 40, [["What's Happening", /^What's Happening/], ['Why Is It Moving?', /^Why Is It Moving/]]],
  ['returns', 'Returns', 120, [['Vs the S&P 500', /^Returns vs the S&P/], ['Performance', /^Performance/]]],
  ['peers', 'Peers', 170, [['Peer Table', /^(r3-peer)$/], ['Compare With Similar Stocks', /^Compare With Similar/], ['Stocks Like This', /^Stocks Like This/]]],
  ['community', 'Community', 250, [['Live Community', /^Live Community/], ['Discussions', /^Community$/]]]], OVS = {};
const ovcss = document.createElement('style'); ovcss.textContent = `.ovm{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:-8px}.ovm b{font:800 18px Inter,sans-serif;color:#0B1B3F;margin-right:6px}.ovm button{border:1.5px solid var(--line,#E2E8F0);background:#fff;border-radius:999px;padding:6px 13px;font:700 13px Inter,sans-serif;color:#0B1B3F;cursor:pointer;white-space:nowrap}.ovm button.on{background:#0B1B3F;border-color:#0B1B3F;color:#fff}.ovm button:hover:not(.on){border-color:#2F6BFF}@media(max-width:600px){.ovm b{width:100%}}`; document.head.appendChild(ovcss);
function ovOrder() {
  const m = $('#app .sp-body > .main'); if (!m) return; const parts = location.hash.replace(/^#\/?/, '').split(/[/?]/), ov = parts[0] === 'stock' && (!parts[2] || parts[2] === 'overview');
  if (!ov) { $$('.ovm', m).forEach(e => e.remove()); $$('[data-ovo]', m).forEach(e => { e.style.order = ''; if (e.dataset.ovo === 'w' || e.dataset.ovh) e.style.display = ''; delete e.dataset.ovo; delete e.dataset.ovh; }); return; }
  const W = [$('#r2-why'), $('#r5-tl')].filter(Boolean).map(e => e.parentElement); const t = $('#r5-tl'); if (t && t.parentElement.parentElement !== m) W.push(t.parentElement.parentElement);
  [...W, $('#tw-sc'), $('#r3-st')].forEach(w => { if (w && w !== m && w.parentElement && (w.parentElement === m || w.parentElement.dataset.ovo === 'w')) { w.style.display = 'contents'; w.dataset.ovo = 'w'; } });
  const flat = []; const walk = el => [...el.children].forEach(k => k.dataset.ovo === 'w' ? walk(k) : k.classList.contains('ovm') ? 0 : flat.push(k)); walk(m);
  let prev = 0; flat.forEach(k => { const h = (k.querySelector('.card-h h3') || k.querySelector('h3') || k.querySelector('.card-h') || k).textContent || '', ht = h.replace(/\s+/g, ' ').trim(); const key = (k.id || String(k.className || '').split(' ')[0]), r = ORD.find(([rx]) => rx.test(key) && /\(/.test(rx.source) || rx.test(ht)); const o = r ? r[1] : prev + 1; prev = o; if (k.style.order !== String(o)) k.style.order = o; k.dataset.ovo = 'c'; k.dataset.ovl = key + '|' + ht; });
  /* removed from the Overview (Zev, Nov 24, 2026), switched off not deleted: watchers line while it reads 0, the rotating Pro teaser,
     Prediction Markets, The Big Picture, the promoted Pick 5 ad. ETFs That Own It was kept. */
  flat.forEach(k => { const [key, ht] = (k.dataset.ovl || '|').split('|'); if (key === 'r2-wch') { const w = [...k.children].find(c => /members? watching/.test(c.textContent) && !/Share/.test(c.textContent)); if (w) w.style.display = /\b0 members watching/.test(w.textContent) ? 'none' : ''; } const off = (k.classList.contains('pro-t') && k.id !== 'ai-box') || key === 'r2-pm' || /^The Big Picture/.test(ht) || key === 'r3-ad';
    if (off) { if (k.style.display !== 'none') { k.style.display = 'none'; k.dataset.ovh = 'x'; } } else if (k.dataset.ovh === 'x') { k.style.display = ''; delete k.dataset.ovh; } });
  /* merged sections (Zev, Nov 24, 2026): one title with tabs, one section showing at a time */
  OVM.forEach(([gk, title, o, tabs]) => {
    const mem = tabs.map(([n, rx]) => flat.find(k => { const [key, ht] = (k.dataset.ovl || '|').split('|'); return /\(/.test(rx.source) ? rx.test(key) : rx.test(ht); }));
    const have = tabs.map((x, i) => [x[0], mem[i]]).filter(x => x[1]); let b = $('#ovm-' + gk, m);
    if (have.length < 2) { if (b) b.remove(); return; }
    let cur = OVS[gk]; if (!have.some(x => x[0] === cur)) cur = have[0][0];
    if (!b) { b = document.createElement('div'); b.className = 'ovm'; b.id = 'ovm-' + gk; m.prepend(b); }
    const html = `<b>${title}</b>` + have.map(x => `<button type="button" data-t="${x[0]}" class="${x[0] === cur ? 'on' : ''}">${x[0]}</button>`).join('');
    if (b.dataset.h !== html) { b.innerHTML = html; b.dataset.h = html; $$('button', b).forEach(x => x.onclick = () => { OVS[gk] = x.dataset.t; ovOrder(); }); }
    b.style.order = o; have.forEach(([n, k]) => { k.style.order = o; const h3 = k.querySelector('.card-h h3'); if (h3 && !h3.dataset.ovt) { h3.dataset.ovt = '1'; h3.style.display = 'none'; } const show = n === cur; if (show) { if (k.dataset.ovh) { k.style.display = ''; delete k.dataset.ovh; } } else if (!k.dataset.ovh) { k.style.display = 'none'; k.dataset.ovh = '1'; } });
  });
}
/* bigger hover pop-ups (+1px) on Quarterly Results and Valuation & Cash Flow by Quarter (Forward P/E, Forward P/S, FCF Margin) (Zev, Nov 24, 2026) */
const tbcss = document.createElement('style'); tbcss.textContent = `.tw-tip.tw-big{font-size:14px!important}.tw-tip.tw-big b{font-size:15px!important}.tw-tip.tw-big .tw-tip-s{font-size:12.5px!important}`; document.head.appendChild(tbcss);
document.addEventListener('mouseover', e => { const d = e.target.closest && e.target.closest('[data-tip]'); if (!d) return; const c = d.closest('.card'), h = c && (c.querySelector('.card-h h3') || {}).textContent || '', big = /^(Quarterly Results|Valuation & Cash Flow)/.test(h.trim());
  const set = () => { const t = document.querySelector('.tw-tip'); if (t) t.classList.toggle('tw-big', big); }; set(); setTimeout(set, 0); }, true);
const tick = () => { if (base(location.hash) === '#/tools') tools(); bar(); erDates(); ovOrder(); };
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; tick(); }, 80); }).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { setTimeout(tick, 60); setTimeout(tick, 600); }); setTimeout(tick, 300);
})();
