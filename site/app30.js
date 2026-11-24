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
/* bigger hover pop-ups (+2px) on Quarterly Results and Valuation & Cash Flow by Quarter (Forward P/E, Forward P/S, FCF Margin) (Zev, Nov 24, 2026) */
const tbcss = document.createElement('style'); tbcss.textContent = `.tw-tip.tw-big{font-size:15px!important}.tw-tip.tw-big b{font-size:16px!important}.tw-tip.tw-big .tw-tip-s{font-size:13.5px!important}`; document.head.appendChild(tbcss);
document.addEventListener('mouseover', e => { const d = e.target.closest && e.target.closest('[data-tip]'); if (!d) return; const c = d.closest('.card'), h = c && (c.querySelector('.card-h h3') || {}).textContent || '', big = /^(Quarterly Results|Valuation & Cash Flow)/.test(h.trim());
  const set = () => { const t = document.querySelector('.tw-tip'); if (t) t.classList.toggle('tw-big', big); }; set(); setTimeout(set, 0); }, true);
/* TEST (Zev, Nov 24, 2026), MU only: a copy of the Price Chart with the Timeline's events laid on it, right under the normal Price Chart.
   The normal Price Chart and Timeline are untouched. To go back: empty PTL_TEST (or delete this block). */
const PTL_TEST = new Set(['MU']), PTL = { r: 365, k: 'all' };
const pcss = document.createElement('style'); pcss.textContent = `#ptl .ptl-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px}#ptl .ptl-bar button{border:1.5px solid var(--line,#E2E8F0);background:#fff;border-radius:999px;padding:5px 11px;font:700 12.5px Inter,sans-serif;color:#0B1B3F;cursor:pointer}#ptl .ptl-bar button.on{background:#0B1B3F;border-color:#0B1B3F;color:#fff}#ptl .ptl-bar .sp{flex:1}#ptl .ptl-w{position:relative}#ptl .ptl-tip{position:absolute;pointer-events:none;background:#0B1B3F;color:#fff;border-radius:10px;padding:8px 11px;font:500 13px/1.45 Inter,sans-serif;max-width:300px;z-index:5;display:none;box-shadow:0 8px 24px rgba(11,27,63,.25)}#ptl .ptl-tip b{font-weight:800}#ptl .ptl-tip .ev{display:block;margin-top:4px;padding-left:9px;border-left:3px solid var(--c)}#ptl .tbadge{font:800 10.5px Inter,sans-serif;background:#FEF3C7;color:#92400E;border-radius:999px;padding:2px 8px;margin-left:8px;vertical-align:middle;letter-spacing:.03em}`; document.head.appendChild(pcss);
function ptlDraw(box, t) {
  const X = window.TWX || {}, all = (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => p && p.c > 0), E = (window.__r5tl || []); if (all.length < 60) return;
  const iso = d => new Date(d * 864e5).toISOString().slice(0, 10), md = d => { const x = new Date(d * 864e5); return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); };
  const ma = n => all.map((p, i) => i + 1 < n ? null : all.slice(i + 1 - n, i + 1).reduce((a, b) => a + b.c, 0) / n);
  const M50 = ma(50), M200 = ma(200), d1 = all[all.length - 1].d, d0 = d1 - PTL.r, I = all.map((p, i) => i).filter(i => all[i].d >= d0), z = I.map(i => all[i]);
  const vals = I.flatMap(i => [all[i].c, M50[i], M200[i]]).filter(v => v != null), mn = Math.min(...vals) * 0.97, mx = Math.max(...vals) * 1.03;
  const W = 1000, H = 380, L = 8, R = 62, T = 34, B = 30, Xd = d => L + (d - z[0].d) / (d1 - z[0].d || 1) * (W - L - R), Yc = c => T + (mx - c) / (mx - mn || 1) * (H - T - B);
  const line = A => I.map((i, j) => A[i] == null ? '' : (j && A[I[j - 1]] != null ? 'L' : 'M') + Xd(all[i].d).toFixed(1) + ' ' + Yc(A[i]).toFixed(1)).join('');
  const C = all.map(p => p.c), up = z[z.length - 1].c >= z[0].c, col = up ? '#16A34A' : '#DC2626', path = line(C);
  const grid = [0, 1, 2, 3, 4].map(k => { const v = mn + (mx - mn) * k / 4, y = Yc(v); return `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" stroke="#EEF2F8"/><text x="${W - R + 6}" y="${y + 4}" font-size="12" fill="#94A3B8">$${v >= 100 ? v.toFixed(0) : v.toFixed(2)}</text>`; }).join('');
  const months = []; let pm = -1; z.forEach(p => { const m = new Date(p.d * 864e5).getUTCMonth(); if (m !== pm) { pm = m; months.push(p.d); } });
  const step = Math.ceil(months.length / 8), xl = months.filter((d, i) => i % step === 0 && Xd(d) > L + 20).map(d => `<text x="${Xd(d)}" y="${H - 8}" font-size="12" fill="#94A3B8" text-anchor="middle">${new Date(d * 864e5).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })}</text>`).join('');
  const closeOn = d => { let v = z[0]; for (const p of z) { if (p.d <= d) v = p; else break; } return v; };
  const EV = E.map((e, i) => Object.assign({ i }, e)).filter(e => e.d >= z[0].d && (PTL.k === 'all' || e.k === PTL.k));
  const lanes = {}; const pins = EV.map(e => { const p = closeOn(e.d), x = Xd(Math.max(z[0].d, e.d)), yb = Yc(p.c), bucket = Math.round(x / 14); const n = lanes[bucket] = (lanes[bucket] || 0) + 1; const y = Math.max(T - 14, yb - 22 - (n - 1) * 17);
    return `<g class="ptl-ev" data-i="${e.i}" style="cursor:pointer"><line x1="${x}" x2="${x}" y1="${y + 7}" y2="${yb}" stroke="${e.c}" stroke-width="1.2" opacity=".55"/><circle cx="${x}" cy="${yb}" r="2.6" fill="${e.c}"/><circle cx="${x}" cy="${y}" r="7.5" fill="${e.c}" stroke="#fff" stroke-width="1.8"/><text x="${x}" y="${y + 3.4}" text-anchor="middle" font-size="9" font-weight="800" fill="#fff" pointer-events="none">${e.l}</text></g>`; }).join('');
  const K = [['all', 'All'], ['e', '📊 Earnings'], ['a', '🏦 Analysts'], ['i', '👔 Insiders'], ['c', '🏛️ Congress'], ['n', '📰 News']].map(k => [k[0], k[1], k[0] === 'all' ? E.filter(e => e.d >= z[0].d).length : E.filter(e => e.k === k[0] && e.d >= z[0].d).length]).filter(k => k[2]);
  const chg = (z[z.length - 1].c / z[0].c - 1) * 100;
  box.querySelector('.ptl-body').innerHTML = `<div class="ptl-bar">${[[91, '3M'], [182, '6M'], [365, '1Y']].map(r => `<button type="button" data-r="${r[0]}" class="${PTL.r === r[0] ? 'on' : ''}">${r[1]}</button>`).join('')}<span class="sp"></span>${K.map(k => `<button type="button" data-k="${k[0]}" class="${PTL.k === k[0] ? 'on' : ''}">${k[1]} ${k[2]}</button>`).join('')}</div>
    <div style="font:700 14px Inter,sans-serif;color:${col};margin:0 0 4px">${chg >= 0 ? '+' : '−'}${Math.abs(chg).toFixed(1)}% <span style="color:#64748B;font-weight:500">${md(z[0].d)} – ${md(d1)}</span> <span style="color:#64748B;font-weight:500;margin-left:10px"><span style="color:#2F6BFF">━</span> Close <span style="color:#F59E0B;margin-left:8px">━</span> 50-Day Avg <span style="color:#8B5CF6;margin-left:8px">━</span> 200-Day Avg</span></div>
    <div class="ptl-w"><svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible">${grid}<path d="${path} L ${Xd(d1)} ${H - B} L ${Xd(z[0].d)} ${H - B} Z" fill="rgba(47,107,255,.08)"/><path d="${line(M200)}" fill="none" stroke="#8B5CF6" stroke-width="1.6"/><path d="${line(M50)}" fill="none" stroke="#F59E0B" stroke-width="1.6"/><path d="${path}" fill="none" stroke="#2F6BFF" stroke-width="2.2"/>${xl}<line class="ptl-x" y1="${T - 20}" y2="${H - B}" stroke="#0B1B3F" stroke-dasharray="3 3" opacity="0" /><circle class="ptl-dot" r="4.5" fill="#2F6BFF" stroke="#fff" stroke-width="2" opacity="0"/>${pins}<rect class="ptl-hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="transparent"/></svg><div class="ptl-tip"></div></div>
    <p class="muted" style="margin:6px 0 0;font-size:12.5px">Hover the chart for the price on any day, or a marker for the event. <b style="color:#059669">Green = good for the stock</b>, <b style="color:#DC2626">red = bad</b>, grey = neutral. E earnings · A analyst · I insider · C Congress · N news.</p>`;
  const svg = box.querySelector('svg'), tip = box.querySelector('.ptl-tip'), w = box.querySelector('.ptl-w'), xl2 = box.querySelector('.ptl-x'), dot = box.querySelector('.ptl-dot');
  const place = (cx, cy) => { const wr = w.getBoundingClientRect(); tip.style.display = 'block'; tip.style.left = Math.min(wr.width - 300, Math.max(0, cx - wr.left + 14)) + 'px'; tip.style.top = Math.max(0, cy - wr.top - 10) + 'px'; };
  const toD = ev => { const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W; return z[0].d + (x - L) / (W - L - R) * (d1 - z[0].d); };
  box.querySelector('.ptl-hit').onpointermove = ev => { const d = toD(ev); let p = z[0], j = 0; z.forEach((q, k) => { if (Math.abs(q.d - d) < Math.abs(p.d - d)) { p = q; j = k; } }); const i = I[j], x = Xd(p.d), y = Yc(p.c); xl2.setAttribute('x1', x); xl2.setAttribute('x2', x); xl2.setAttribute('opacity', '.35'); dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('opacity', '1');
    const prev = all[i - 1], dd = prev ? (p.c / prev.c - 1) * 100 : null, evs = EV.filter(e => Math.abs(e.d - p.d) <= 1);
    tip.innerHTML = `<b>${new Date(p.d * 864e5).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</b><br>Close $${p.c.toFixed(2)}${dd != null ? ` <span style="color:${dd >= 0 ? '#6EE7B7' : '#FCA5A5'}">${dd >= 0 ? '+' : '−'}${Math.abs(dd).toFixed(2)}%</span>` : ''}<br>50-day $${M50[i] != null ? M50[i].toFixed(2) : '—'} · 200-day $${M200[i] != null ? M200[i].toFixed(2) : '—'}${evs.map(e => `<span class="ev" style="--c:${e.c}">${e.txt.replace(/</g, '&lt;')}</span>`).join('')}`; place(ev.clientX, ev.clientY); };
  box.querySelector('.ptl-hit').onpointerleave = () => { tip.style.display = 'none'; xl2.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0'); };
  box.querySelectorAll('.ptl-ev').forEach(g => { const show = ev => { const e = E[+g.dataset.i]; tip.innerHTML = `<b>${new Date(e.d * 864e5).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</b><span class="ev" style="--c:${e.c}">${e.txt.replace(/</g, '&lt;')}</span>`; place(ev.clientX, ev.clientY); }; g.addEventListener('pointerenter', show); g.addEventListener('click', show); g.addEventListener('pointerleave', () => tip.style.display = 'none'); });
  box.querySelectorAll('.ptl-bar button').forEach(b => b.onclick = () => { if (b.dataset.r) PTL.r = +b.dataset.r; if (b.dataset.k) PTL.k = b.dataset.k; ptlDraw(box, t); });
}
function ptlMount() {
  const parts = location.hash.replace(/^#\/?/, '').split(/[/?]/), t = (parts[1] || '').toUpperCase(), ov = parts[0] === 'stock' && (!parts[2] || parts[2] === 'overview'), m = $('#app .sp-body > .main');
  if (!m || !ov || !PTL_TEST.has(t)) return; if (!$('#r5-tl') || $('#ptl', m)) return;
  const el = document.createElement('div'); el.className = 'card'; el.id = 'ptl'; el.innerHTML = `<div class="card-h"><h3>Price Chart + Timeline<span class="tbadge">TEST · ${t} ONLY</span></h3><span class="muted">daily closes with every event pinned to the price</span></div><div class="ptl-body"></div>`;
  m.appendChild(el); ptlDraw(el, t);
}
const tick = () => { if (base(location.hash) === '#/tools') tools(); bar(); erDates(); ptlMount(); comMerge(); ovOrder(); };
let pend = 0; new MutationObserver(() => { if (pend) return; pend = 1; setTimeout(() => { pend = 0; tick(); }, 80); }).observe(app, { childList: true, subtree: true });
window.addEventListener('hashchange', () => { setTimeout(tick, 60); setTimeout(tick, 600); }); setTimeout(tick, 300);
})();
