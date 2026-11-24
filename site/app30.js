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
const ORD = [[/^(r2-wch)$/, 1], [/^(ai-box)$/, 2], [/^Price Chart \+ Timeline/, 11], [/^Price Chart/, 10], [/^Report Card/, 20], [/^Tickerwise Take/, 30], [/^What's Happening/, 40], [/^Why Is It Moving/, 50],
  [/^Scores & Fundamentals/, 60], [/^Quarterly Results/, 70], [/^(ecall-)/, 71], [/^Earnings Preview/, 72], [/^Valuation & Cash Flow/, 80], [/^Fair Value/, 90], [/^Bull vs Bear/, 100], [/^Zacks Style/, 110],
  [/^Returns vs the S&P/, 120], [/^Performance/, 130], [/^Earnings Reactions/, 140], [/^Timeline/, 150], [/^The Big Picture/, 160], [/^Compare With Similar/, 170], [/^(r3-peer)$/, 180],
  [/^Stocks Like This/, 190], [/^ETFs That Own/, 200], [/In The News$/, 210], [/^Tickerwise Research/, 220], [/^Prediction Markets/, 230], [/^My Thesis/, 240], [/^Live Community/, 250],
  [/^Community$/, 260], [/^Get Alerts/, 270], [/^(r3-ad)$/, 280], [/^(r3-noprint)$/, 290]];
const OVM = [
  ['moves', "What's Happening", 40, [["What's Happening", /^What's Happening/], ['Why Is It Moving?', /^Why Is It Moving/]]],
  ['returns', 'Returns', 120, [['Vs the S&P 500', /^Returns vs the S&P/], ['Performance', /^Performance/]]],
  ['peers', 'Peers', 170, [['Peer Table', /^(r3-peer)$/], ['Compare With Similar Stocks', /^Compare With Similar/], ['Stocks Like This', /^Stocks Like This/]]]], OVS = {};
const ovcss = document.createElement('style'); ovcss.textContent = `.ovm{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:-8px}.ovm b{font:800 18px Inter,sans-serif;color:#0B1B3F;margin-right:6px}.ovm button{border:1.5px solid var(--line,#E2E8F0);background:#fff;border-radius:999px;padding:6px 13px;font:700 13px Inter,sans-serif;color:#0B1B3F;cursor:pointer;white-space:nowrap}.ovm button.on{background:#0B1B3F;border-color:#0B1B3F;color:#fff}.ovm button:hover:not(.on){border-color:#2F6BFF}@media(max-width:600px){.ovm b{width:100%}}`; document.head.appendChild(ovcss);
/* Community on the Overview (Zev, Nov 24, 2026): one Community section. Live Community is switched off; its "This week: up or down?" poll
   moves to the top of Community, with a "Your view" Bullish / Bearish / Neutral pick. Posting happens in the discussion itself. */
function comMerge() {
  const c = $('#cm-teaser'), h = c && $('.card-h', c); if (!c || !h) return; const t = (location.hash.split('/')[2] || '').toUpperCase().split(/[?#]/)[0];
  const poll = $('#tz-poll'); if (poll && poll.parentElement !== c) h.after(poll);
  if (!$('.cm-view', c)) { const k = 'tw-view-' + t; let v = ''; try { v = localStorage.getItem(k) || ''; } catch (e) {}
    const el = document.createElement('div'); el.className = 'cm-view'; el.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0 4px;font:600 13.5px Inter,sans-serif;color:#0B1B3F';
    const draw = () => { el.innerHTML = `<b style="margin-right:4px">Your view</b>` + [['bull', '🐂 Bullish'], ['bear', '🐻 Bearish'], ['neu', 'Neutral']].map(([k2, n]) => `<button type="button" data-v="${k2}" style="border:1.5px solid ${v === k2 ? '#0B1B3F' : 'var(--line,#E2E8F0)'};background:${v === k2 ? '#0B1B3F' : '#fff'};color:${v === k2 ? '#fff' : '#0B1B3F'};border-radius:999px;padding:5px 12px;font:700 13px Inter,sans-serif;cursor:pointer">${n}</button>`).join('') + (v ? `<a href="#/stock/${t}/community" style="font-weight:700;color:#2F6BFF;margin-left:4px">Saved. Tell everyone why in the discussion →</a>` : '');
      $$('button', el).forEach(b => b.onclick = () => { v = v === b.dataset.v ? '' : b.dataset.v; try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} draw(); }); };
    draw(); ($('#tz-poll', c) || h).after(el); }
}
function ovOrder() {
  const m = $('#app .sp-body > .main'); if (!m) return; const parts = location.hash.replace(/^#\/?/, '').split(/[/?]/), ov = parts[0] === 'stock' && (!parts[2] || parts[2] === 'overview');
  if (!ov) { $$('.ovm', m).forEach(e => e.remove()); $$('[data-ovo]', m).forEach(e => { e.style.order = ''; if (e.dataset.ovo === 'w' || e.dataset.ovh) e.style.display = ''; delete e.dataset.ovo; delete e.dataset.ovh; }); return; }
  const W = [$('#r2-why'), $('#r5-tl')].filter(Boolean).map(e => e.parentElement); const t = $('#r5-tl'); if (t && t.parentElement.parentElement !== m) W.push(t.parentElement.parentElement);
  [...W, $('#tw-sc'), $('#r3-st')].forEach(w => { if (w && w !== m && w.parentElement && (w.parentElement === m || w.parentElement.dataset.ovo === 'w')) { w.style.display = 'contents'; w.dataset.ovo = 'w'; } });
  const flat = []; const walk = el => [...el.children].forEach(k => k.dataset.ovo === 'w' ? walk(k) : k.classList.contains('ovm') ? 0 : flat.push(k)); walk(m);
  let prev = 0; flat.forEach(k => { const h = (k.querySelector('.card-h h3') || k.querySelector('h3') || k.querySelector('.card-h') || k).textContent || '', ht = h.replace(/\s+/g, ' ').trim(); const key = (k.id || String(k.className || '').split(' ')[0]), r = ORD.find(([rx]) => rx.test(key) && /\(/.test(rx.source) || rx.test(ht)); const o = r ? r[1] : prev + 1; prev = o; if (k.style.order !== String(o)) k.style.order = o; k.dataset.ovo = 'c'; k.dataset.ovl = key + '|' + ht; });
  /* removed from the Overview (Zev, Nov 24, 2026), switched off not deleted: watchers line while it reads 0, the rotating Pro teaser,
     Prediction Markets, The Big Picture, the promoted Pick 5 ad. ETFs That Own It was kept. */
  flat.forEach(k => { const [key, ht] = (k.dataset.ovl || '|').split('|'); if (key === 'r2-wch') { const w = [...k.children].find(c => /members? watching/.test(c.textContent) && !/Share/.test(c.textContent)); if (w) w.style.display = /\b0 members watching/.test(w.textContent) ? 'none' : ''; } const off = (k.classList.contains('pro-t') && k.id !== 'ai-box') || key === 'r2-pm' || /^The Big Picture/.test(ht) || key === 'r3-ad' || key === 'tz-com';
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
/* bigger hover pop-ups (+2px) on Quarterly Results and Valuation & Cash Flow by Quarter (Forward P/E, Forward P/S, FCF Margin) and the Price Chart, then made one size for all pop-ups (Zev, Nov 24, 2026) */
const tbcss = document.createElement('style'); tbcss.textContent = `.tw-tip,.r5-tip,.ptl-tip,.tm-tip,.th-tip,.bx-tip{font-size:16px!important;line-height:1.45!important}
.tw-tip *,.r5-tip *,.ptl-tip *,.tm-tip *,.th-tip *,.bx-tip *{font-size:16px!important}
.tw-tip>b:first-child,.r5-tip>b:first-child,.ptl-tip>b:first-child,.tm-tip>b:first-child,.th-tip>b:first-child,.bx-tip>b:first-child{font-size:17px!important}
.tw-tip .tw-tip-s{font-size:14.5px!important}`; document.head.appendChild(tbcss); /* every hover pop-up on the site uses one size: 16px text, 17px title (Zev, Nov 24, 2026: "be consistent with the pop-ups") */
/* TEST (Zev, Nov 24, 2026), MU only: a copy of the Price Chart with the Timeline's events laid on it, right under the normal Price Chart.
   The normal Price Chart and Timeline are untouched. To go back: empty PTL_TEST (or delete this block). */
const PTL_TEST = new Set(['MU']), PTL = { sel: new Set(['e', 'a', 'i', 'c', 'n']) };
const pcss = document.createElement('style'); pcss.textContent = `#ptl .ptl-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px}#ptl .ptl-bar button{border:1.5px solid var(--line,#E2E8F0);background:#fff;border-radius:999px;padding:5px 11px;font:700 12.5px Inter,sans-serif;color:#0B1B3F;cursor:pointer}#ptl .ptl-bar button.on{background:#0B1B3F;border-color:#0B1B3F;color:#fff}#ptl .ptl-bar .sp{flex:1}#ptl .ptl-cb{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line,#E2E8F0);background:#fff;border-radius:999px;padding:4px 11px;font:700 12.5px Inter,sans-serif;color:#0B1B3F;cursor:pointer;user-select:none}#ptl .ptl-cb.on{border-color:#0B1B3F;background:#F1F5F9}#ptl .ptl-cb input{accent-color:#0B1B3F;margin:0;width:15px;height:15px}#ptl .ptl-body{position:relative}#ptl .ptl-tip{position:absolute;pointer-events:none;background:#0B1B3F;color:#fff;border-radius:10px;padding:8px 11px;font:500 15px/1.45 Inter,sans-serif;max-width:300px;z-index:5;display:none;box-shadow:0 8px 24px rgba(11,27,63,.25)}#ptl .ptl-tip b{font-weight:800}#ptl .ptl-tip .ev{display:block;margin-top:4px;padding-left:9px;border-left:3px solid var(--c)}#ptl .tbadge{font:800 10.5px Inter,sans-serif;background:#FEF3C7;color:#92400E;border-radius:999px;padding:2px 8px;margin-left:8px;vertical-align:middle;letter-spacing:.03em}`; document.head.appendChild(pcss);
function ptlDraw(box, t, force) {
  /* mirrors the real Price Chart (same ranges, change line, mountain, 50/200-day, volume and RSI, same hover) and lays the Timeline's events on it */
  const orig = document.getElementById('px-' + t), E = window.__r5tl || []; if (!orig) return; const osvg = orig.querySelector('svg'), poly = osvg && osvg.querySelector('polygon');
  const sig = (orig.querySelector('.px-chg') || {}).textContent + '|' + (poly ? poly.getAttribute('points').length : 0) + '|' + [...PTL.sel].join('') + '|' + E.length;
  if (!force && box.dataset.sig === sig) return; box.dataset.sig = sig;
  const rng = ((orig.querySelector('.px-seg button.on') || {}).textContent || '1Y').trim();
  const K = [['all', 'All'], ['e', '📊 Earnings'], ['a', '🏦 Analysts'], ['i', '👔 Insiders'], ['c', '🏛️ Congress'], ['n', '📰 News']];
  box.querySelector('.ptl-body').innerHTML = `<div class="ptl-copy">${orig.outerHTML.replace('id="px-' + t + '"', 'id="px-' + t + '-ptl"')}</div><div class="ptl-tip"></div>
    <p class="muted" style="margin:6px 0 0;font-size:12.5px">Hover a marker for the event; click a news marker (N) to read the article in a new tab. <b style="color:#059669">Green = good for the stock</b>, <b style="color:#DC2626">red = bad</b>, grey = neutral. E earnings · A analyst · I insider · C Congress · N news. The range buttons move the main Price Chart too.</p>`;
  const top0 = box.querySelector('.ptl-copy .px-top'); if (top0) top0.insertAdjacentHTML('afterend', '<div class="ptl-bar ptl-k" style="margin:8px 0 6px"></div>'); /* event filters right under the range buttons (Zev, Nov 24, 2026) */
  const svg = box.querySelector('.ptl-copy svg'), pg = svg && svg.querySelector('polygon'); if (!pg) return;
  const pts = pg.getAttribute('points').trim().split(/\s+/).map(q => q.split(',').map(Number)).slice(1, -1), N = pts.length; let D = [];
  const S = ((window.TWX || {}).pxSeries ? window.TWX.pxSeries(t) || [] : []).filter(p => p && p.c > 0);
  if (rng === '1D') D = []; else if (rng !== '5Y' && S.length >= N) D = S.slice(-N).map(p => p.d);
  else { const m = /(\w{3} \d{1,2}, \d{4}) – (\w{3} \d{1,2}, \d{4})/.exec((orig.querySelector('.px-chg') || {}).textContent || ''); if (m) { const a = Date.parse(m[1] + ' UTC') / 864e5, b = Date.parse(m[2] + ' UTC') / 864e5; D = pts.map((p, i) => a + (b - a) * i / Math.max(1, N - 1)); } }
  const inR = E.map((e, i) => Object.assign({ i }, e)).filter(e => D.length && e.d >= D[0] - 1 && e.d <= D[D.length - 1] + 1), EV = inR.filter(e => PTL.sel.has(e.k));
  box.querySelector('.ptl-k').innerHTML = `<b style="font:800 12px Inter,sans-serif;color:#64748B;text-transform:uppercase;letter-spacing:.05em;margin-right:4px">Events</b>` + (rng === '1D' ? '<span class="muted" style="font-size:13px">Events show on the daily ranges (1M, 1Y, 5Y, YTD).</span>' : `<button type="button" data-all="1" class="${PTL.sel.size === 5 ? 'on' : ''}">All</button><button type="button" data-none="1" class="${PTL.sel.size ? '' : 'on'}">None</button>` + K.slice(1).map(k => [k[0], k[1], inR.filter(e => e.k === k[0]).length]).filter(k => k[2]).map(k => `<label class="ptl-cb${PTL.sel.has(k[0]) ? ' on' : ''}"><input type="checkbox" data-k="${k[0]}" ${PTL.sel.has(k[0]) ? 'checked' : ''}> ${k[1]} ${k[2]}</label>`).join(''));
  const idx = d => { let lo = 0, hi = N - 1, v = 0; while (lo <= hi) { const m = (lo + hi) >> 1; if (D[m] <= d + 0.5) { v = m; lo = m + 1; } else hi = m - 1; } return v; };
  const lanes = {}, top = 6, g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.innerHTML = EV.map(e => { const [x, yb] = pts[idx(e.d)], b = Math.round(x / 13), n = lanes[b] = (lanes[b] || 0) + 1, y = Math.max(top + 7, yb - 20 - (n - 1) * 16);
    return `<g class="ptl-ev" data-i="${e.i}" style="cursor:pointer"><line x1="${x}" x2="${x}" y1="${y + 7}" y2="${yb}" stroke="${e.c}" stroke-width="1.2" opacity=".6"/><circle cx="${x}" cy="${yb}" r="2.6" fill="${e.c}"/><circle cx="${x}" cy="${y}" r="7.5" fill="${e.c}" stroke="#fff" stroke-width="1.8"/><text x="${x}" y="${y + 3.4}" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" pointer-events="none">${e.l}</text></g>`; }).join('');
  svg.appendChild(g);
  const tip = box.querySelector('.ptl-tip'), bx = box.querySelector('.ptl-body');
  box.querySelectorAll('.ptl-ev').forEach(el => { const show = ev => { ev.stopPropagation(); const e = E[+el.dataset.i], br = bx.getBoundingClientRect(); tip.innerHTML = `<b>${new Date(e.d * 864e5).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</b><span class="ev" style="--c:${e.c}">${e.txt.replace(/</g, '&lt;')}</span>${e.u ? `<span style="display:block;margin-top:4px;color:#7FE3FF;font-weight:700">${(e.src || 'News').replace(/</g, '&lt;')} · click to read the full article ↗</span>` : ''}`; tip.style.display = 'block'; tip.style.left = Math.min(br.width - 300, Math.max(0, ev.clientX - br.left + 14)) + 'px'; tip.style.top = Math.max(0, ev.clientY - br.top - 10) + 'px'; };
    el.addEventListener('pointerenter', show); el.addEventListener('pointermove', show); el.addEventListener('click', ev => { const e = E[+el.dataset.i]; if (e && e.u) window.open(e.u, '_blank', 'noopener'); else show(ev); }); el.addEventListener('pointerleave', () => tip.style.display = 'none'); });
  box.querySelectorAll('.ptl-k [data-all]').forEach(b => b.onclick = () => { PTL.sel = new Set(['e', 'a', 'i', 'c', 'n']); ptlDraw(box, t, 1); }); box.querySelectorAll('.ptl-k [data-none]').forEach(b => b.onclick = () => { PTL.sel = new Set(); ptlDraw(box, t, 1); }); box.querySelectorAll('.ptl-k input[data-k]').forEach(c => c.onchange = () => { c.checked ? PTL.sel.add(c.dataset.k) : PTL.sel.delete(c.dataset.k); ptlDraw(box, t, 1); });
  /* the same hover pop-up as the Price Chart (date, close and day change, 50-day, 200-day, volume, RSI), at the bigger 15px size */
  if (D.length) { const byD = {}; S.forEach((p, i) => { byD[Math.round(p.d)] = [p, S[i - 1]]; }); const NS = 'http://www.w3.org/2000/svg', vb = svg.viewBox.baseVal, hl = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle');
    hl.setAttribute('stroke', '#0B1B3F'); hl.setAttribute('stroke-dasharray', '3 3'); hl.setAttribute('opacity', '0'); hl.setAttribute('y1', 0); hl.setAttribute('y2', vb.height - 20); dot.setAttribute('r', 4.5); dot.setAttribute('fill', '#2F6BFF'); dot.setAttribute('stroke', '#fff'); dot.setAttribute('stroke-width', 2); dot.setAttribute('opacity', '0'); svg.insertBefore(hl, g); svg.insertBefore(dot, g);
    const f = (v, d = 2) => v == null ? '—' : '$' + v.toLocaleString('en-US', { minimumFractionDigits: v >= 1000 ? 0 : d, maximumFractionDigits: v >= 1000 ? 0 : d }), vol = v => v == null ? '—' : v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? Math.round(v / 1e6) + 'M' : Math.round(v / 1e3) + 'K';
    svg.addEventListener('pointermove', ev => { if (ev.target.closest('.ptl-ev')) return; const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * vb.width; let i = 0; pts.forEach((q, k) => { if (Math.abs(q[0] - x) < Math.abs(pts[i][0] - x)) i = k; }); const [px, py] = pts[i], hit = byD[Math.round(D[i])] || [], p = hit[0], pv = hit[1];
      hl.setAttribute('x1', px); hl.setAttribute('x2', px); hl.setAttribute('opacity', '.35'); dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('opacity', '1');
      const dd = p && pv ? (p.c / pv.c - 1) * 100 : null, day = new Date(Math.round(D[i]) * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
      tip.innerHTML = `<b style="font-size:16px">${day}</b><div>Close: <b>${f(p ? p.c : null)}</b>${dd != null ? ` <span style="color:${dd >= 0 ? '#6EE7B7' : '#FCA5A5'}">${dd >= 0 ? '+' : '−'}${Math.abs(dd).toFixed(2)}%</span>` : ''}</div><div>50-day avg: ${f(p && p.m50)}</div><div>200-day avg: ${f(p && p.m200)}</div><div>Volume: ${vol(p && p.v)}</div><div>RSI (14): ${p && p.rsi != null ? Math.round(p.rsi) : '—'}</div>`;
      const br = bx.getBoundingClientRect(); tip.style.display = 'block'; tip.style.left = Math.min(br.width - 240, Math.max(0, ev.clientX - br.left + 16)) + 'px'; tip.style.top = Math.max(0, ev.clientY - br.top - 20) + 'px'; });
    svg.addEventListener('pointerleave', () => { tip.style.display = 'none'; hl.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0'); }); }
}
function ptlMount() {
  const parts = location.hash.replace(/^#\/?/, '').split(/[/?]/), t = (parts[1] || '').toUpperCase(), ov = parts[0] === 'stock' && (!parts[2] || parts[2] === 'overview'), m = $('#app .sp-body > .main');
  if (!m || !ov || !PTL_TEST.has(t)) return; const ex = $('#ptl', m); if (ex) { ptlDraw(ex, t); return; } if (!$('#r5-tl')) return;
  const el = document.createElement('div'); el.className = 'card'; el.id = 'ptl'; el.innerHTML = `<div class="card-h"><h3>Price Chart + Timeline<span class="tbadge">TEST · ${t} ONLY</span></h3><span class="muted">daily closes, 50- and 200-day averages, with every event pinned to the price</span></div><div class="ptl-body"></div>`;
  m.appendChild(el); ptlDraw(el, t);
}
const tick = () => { if (base(location.hash) === '#/tools') tools(); bar(); erDates(); ptlMount(); comMerge(); ovOrder(); };
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; tick(); }, 80); }).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { setTimeout(tick, 60); setTimeout(tick, 600); }); setTimeout(tick, 300);
})();
