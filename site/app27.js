/* Tickerwise app27 (Nov 22, 2026): Home page Market Movers (S&P 500 / Nasdaq-100 / Dow 30 / All Three; Top 5 and Bottom 5),
   Latest News (headlines written in Tickerwise's own words, each linking to its source; never copied headlines, article text or photos),
   and the home page order. Data: TW.NX.IX (index universe, nightly) and TW.NX.TOP (news, nightly + 2:30 PM Israel time). */
(function () {
if (window.TWHOME) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { BY, esc } = X, TW = window.TW || {}, NX = TW.NX || {}, app = $('#app'); if (!app || !esc) return;
const IX = (NX.IX || {}).T, TOPN = NX.TOP, MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fd = s => { const p = (s || '').split('-'); return p.length === 3 ? MO[+p[1] - 1] + ' ' + +p[2] + ', ' + p[0] : s || ''; };
const IDX = [['sp', 'S&P 500', 1], ['ndx', 'Nasdaq-100', 2], ['dow', 'Dow 30', 4], ['all', 'All Three', 7]], PER = [['1D', 4], ['1W', 5], ['1M', 6], ['YTD', 8]];
let mvI = 'sp', mvP = '1D';
const pc = v => v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(Math.abs(v) < 10 ? 2 : 1) + '%';
const css = `
#tw-mn .mn-g{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:18px;align-items:stretch}
#tw-mn .mn-g.solo{grid-template-columns:minmax(0,1fr)}
#tw-mn .card{padding:20px 20px 16px;display:flex;flex-direction:column;min-width:0}
#tw-mn .mn-h{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-bottom:12px}
#tw-mn .mn-h h3{margin:0;font-size:20px}
#tw-mn .mn-tabs{display:flex;flex-wrap:wrap;gap:4px}
#tw-mn .mn-tabs button{border:0;background:none;font:700 13px 'Inter',sans-serif;color:#64748B;padding:6px 9px;border-radius:8px;cursor:pointer}
#tw-mn .mn-tabs button.on{color:#0F172A;background:#EEF2FF;box-shadow:inset 0 -2px 0 #2F6BFF}
#tw-mn .mn-tabs.per button{font-size:12px;padding:4px 8px}
#tw-mn .mn-cols{display:grid;grid-template-columns:1fr 1fr;gap:22px}
#tw-mn .mn-cols h4{margin:4px 0 8px;font:800 12px 'Inter',sans-serif;letter-spacing:.08em;color:#0F172A}
#tw-mn .mn-r{display:grid;grid-template-columns:52px minmax(0,1fr) 62px minmax(40px,.9fr);align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #F1F5F9;font-size:13.5px;text-decoration:none;color:inherit}
#tw-mn a.mn-r:hover{background:#F8FAFC}
#tw-mn .mn-r b{font-weight:800;color:#0F172A}
#tw-mn .mn-r .nm{color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tw-mn .mn-r .v{font-weight:700;text-align:right}
#tw-mn .mn-r .bar{height:14px;border-radius:3px}
#tw-mn .up{color:#059669}#tw-mn .dn{color:#DC2626}
#tw-mn .mn-src{font-size:11.5px;color:#64748B;margin:10px 0 0}
#tw-mn .nw-list{overflow-y:auto;max-height:318px;margin:0 -4px;padding:0 4px;flex:1}
#tw-mn .nw-i{padding:11px 0;border-bottom:1px solid #EEF2F7}
#tw-mn .nw-t{display:flex;align-items:center;gap:7px;font:800 11px 'Inter',sans-serif;letter-spacing:.06em;color:#64748B;text-transform:uppercase}
#tw-mn .nw-t::before{content:'';width:7px;height:7px;border-radius:50%;background:#F59E0B}
#tw-mn .nw-i a.hl{display:block;margin-top:4px;font:700 15px/1.35 'Inter',sans-serif;color:#0F172A;text-decoration:none}
#tw-mn .nw-i a.hl:hover{color:#2F6BFF}
#tw-mn .nw-m{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;font-size:12px;color:#64748B;align-items:center}
#tw-mn .nw-m a.tk{font-weight:700;font-size:11.5px;padding:2px 7px;border-radius:999px;background:#F1F5F9;color:#0F172A;text-decoration:none}
#tw-mn .nw-m span.tk{font-weight:700;font-size:11.5px;padding:2px 7px;border-radius:999px;background:#F1F5F9;color:#0F172A}
@media(max-width:900px){#tw-mn .mn-g{grid-template-columns:minmax(0,1fr)}#tw-mn .nw-list{max-height:none}#tw-mn .nw-i.more{display:none}#tw-mn .nw-list.open .nw-i.more{display:block}}
@media(max-width:640px){#tw-mn .mn-cols{grid-template-columns:minmax(0,1fr);gap:8px}#tw-mn .mn-r{grid-template-columns:48px minmax(0,1fr) 60px 46px;font-size:13px}#tw-mn .card{padding:16px 14px 12px}}
#tw-mn .nw-more{display:none;margin-top:10px}
@media(max-width:900px){#tw-mn .nw-more{display:inline-flex}}`;
function movers() {
  if (!IX) return '';
  const bit = IDX.find(x => x[0] === mvI)[2], pi = PER.find(x => x[0] === mvP)[1];
  const L = Object.entries(IX).filter(([t, v]) => (v[3] & bit) && v[pi] != null).sort((a, b) => b[1][pi] - a[1][pi]);
  const top = L.slice(0, 5), bot = L.slice(-5).reverse(), mx = Math.max(...top.concat(bot).map(x => Math.abs(x[1][pi])), 0.01);
  const row = ([t, v]) => { const r = v[pi], cl = r >= 0 ? 'up' : 'dn', w = Math.max(4, Math.abs(r) / mx * 100), own = BY && BY[t];
    return `<${own ? `a href="#/stock/${esc(t)}"` : 'div'} class="mn-r"><b>${esc(t)}</b><span class="nm" title="${esc(v[0])}">${esc(v[0])}</span><span class="v ${cl}">${pc(r)}</span><span class="bar" style="width:${w.toFixed(0)}%;background:${r >= 0 ? '#059669' : '#DC2626'}"></span></${own ? 'a' : 'div'}>`; };
  return `<div class="card" id="tw-mv"><div class="mn-h"><h3>Market Movers</h3><div class="mn-tabs">${IDX.map(x => `<button type="button" class="${x[0] === mvI ? 'on' : ''}" data-i="${x[0]}">${x[1]}</button>`).join('')}</div>
    <div class="mn-tabs per" style="margin-left:auto">${PER.map(x => `<button type="button" class="${x[0] === mvP ? 'on' : ''}" data-p="${x[0]}">${x[0]}</button>`).join('')}</div></div>
    <div class="mn-cols"><div><h4>TOP</h4>${top.map(row).join('')}</div><div><h4>BOTTOM</h4>${bot.map(row).join('')}</div></div>
    <p class="mn-src">${L.length} stocks · ${mvP === '1D' ? 'last session' : mvP === 'YTD' ? 'since Jan 1' : 'past ' + (mvP === '1W' ? 'week' : 'month')} · as of ${fd(NX.IX.read)} close. Stocks we cover open their page. Index lists from stockanalysis.com, prices from Yahoo Finance. <a href="#/markets/heatmap">See all on the heatmap →</a></p></div>`;
}
const when = ts => { const d = new Date(ts * 1000), h = (Date.now() - d) / 36e5; if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min ago'; if (h < 24) return Math.round(h) + (Math.round(h) === 1 ? ' hour ago' : ' hours ago'); return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); };
function news() {
  if (!TOPN || !(TOPN.A || []).length) return '';
  const chip = t => { const v = IX && IX[t], own = BY && BY[t], r = v ? v[4] : null; return `<${own ? `a class="tk" href="#/stock/${esc(t)}"` : 'span class="tk"'}>${esc(t)}${r != null ? ` <span class="${r >= 0 ? 'up' : 'dn'}">${pc(r)}</span>` : ''}</${own ? 'a' : 'span'}>`; };
  return `<div class="card" id="tw-nw"><div class="mn-h"><h3>Latest News</h3><span class="muted" style="font-size:12px;margin-left:auto">Updated ${when(TOPN.at)}</span></div>
    <div class="nw-list">${TOPN.A.map((a, i) => `<div class="nw-i${i >= 8 ? ' more' : ''}"><div class="nw-t">${when(a[3])}</div><a class="hl" href="${esc(a[2])}" target="_blank" rel="noopener nofollow">${esc(a[0])}</a><div class="nw-m"><span>${esc(a[1])} ↗</span>${(a[4] || []).map(chip).join('')}</div></div>`).join('')}</div>
    <button type="button" class="btn nw-more">Show all ${TOPN.A.length}</button>
    <p class="mn-src">Headlines are written by Tickerwise from the day's reporting; each links to the original source. Chips show the stock's last-session move.</p></div>`;
}
function draw(sec) { const m = movers(), n = news(); sec.innerHTML = `<div class="wrap"><div class="mn-g${m && n ? '' : ' solo'}">${m}${n}</div></div>`;
  $$('[data-i]', sec).forEach(b => b.onclick = () => { mvI = b.dataset.i; draw(sec); }); $$('[data-p]', sec).forEach(b => b.onclick = () => { mvP = b.dataset.p; draw(sec); });
  const mb = $('.nw-more', sec); if (mb) mb.onclick = () => { $('.nw-list', sec).classList.add('open'); mb.remove(); }; }
/* Home order: today's market → valuation → ideas → how the score works → explore → learn and follow → practice and community → plans. */
const ORDER = [['section.hero'], ['#x-pulse'], ['#tw-mn'], ['#spx-pe', 1], ['#r2-hsotd'], ['h2|Highest Tickerwise Scores'], ['h2|One score, five reasons'], ['h2|Momentum Leaders'], ['.tq-sec'], ['h2|Explore by Theme'], ['#ai-box', 1], ['#hm-journey'], ['#hm-ins'], ['#hm-inv'], ['#r5-poll', 1], ['#hm-social'], ['#hm-paper'], ['*'], ['#r3-had'], ['#hm-plans'], ['h2|Build your watchlist']];
function secOf(sel, up) { if (sel.startsWith('h2|')) { const h = $$('#app > section h2, #app > section h3').find(x => x.textContent.includes(sel.slice(3))); return h ? h.closest('#app > section') : null; } const e = $('#app ' + sel); return e ? (up ? e.closest('#app > section') : e) : null; }
function reorder() {
  const all = $$('#app > section'), placed = new Set(), seq = [];
  ORDER.forEach(([sel, up]) => { if (sel === '*') { seq.push('*'); return; } const s = secOf(sel, up); if (s && !placed.has(s)) { placed.add(s); seq.push(s); } });
  const rest = all.filter(s => !placed.has(s) && s.id !== 'hm-news'), out = []; seq.forEach(x => { if (x === '*') out.push(...rest); else out.push(x); });
  let prev = null; out.forEach(s => { if (prev ? prev.nextElementSibling !== s : app.firstElementChild !== s) { if (prev) prev.after(s); else app.prepend(s); } prev = s; });
  const yn = $('#hm-news'); if (yn && TOPN) yn.style.display = 'none';
}
function put() {
  const k = location.hash.replace(/^#\/?/, '').split(/[/?#]/)[0] || 'home'; if (k !== 'home') return true;
  if (!$('#app section.hero')) return false;
  const hh = $('#app section.hero h1'), hl = $('#app section.hero p.lead');
  if (hh && !hh.dataset.tw) { hh.dataset.tw = 1; hh.innerHTML = 'Stop guessing. Start <em>knowing</em>.'; }
  if (hl && !hl.dataset.tw) { hl.dataset.tw = 1; hl.textContent = 'Every stock scored 1–10, the way the pros size up a stock. One score, five reasons, no noise.'; }
  if (!$('#tw-mn-css')) { const st = document.createElement('style'); st.id = 'tw-mn-css'; st.textContent = css; document.head.appendChild(st); }
  if (!$('#tw-mn') && (IX || TOPN)) { const sec = document.createElement('section'); sec.className = 'sec'; sec.id = 'tw-mn'; sec.style.paddingTop = '18px'; draw(sec); $('#app section.hero').after(sec); }
  const pt = $$('#x-pulse a, #x-pulse .it, #x-pulse div').find(e => e.children.length && /S&P 500 Forward P\/E/.test(e.textContent) && e.textContent.length < 90);
  if (pt && NX.SPE && NX.SPE.v) { const w = document.createTreeWalker(pt, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (/^\s*\d+(\.\d)?x\s*$/.test(n.nodeValue)) { n.nodeValue = (+NX.SPE.v).toFixed(1) + 'x'; break; } }
  reorder(); return true;
}
/* Tools page: live tool count on top (counts the cards, so it updates itself as tools are added) and a count on each section chip. */
function toolsCount() {
  if (!/^#\/tools\/?$/.test(location.hash)) return true; const cards = $$('#app .tt-tool'); if (!cards.length) return false;
  const HOME = { '#/bots': 'analyze', '#/chartdesk': 'analyze', '#/insider-buys': 'analyze', '#/fund-buying': 'analyze', '#/etf-finder': 'analyze', '#/target-tracker': 'analyze', '#/ai-finder': 'analyze', '#/theses': 'track', '#/mynews': 'track', '#/risk-scan': 'track' }, SECS = ['analyze', 'learn', 'play', 'track', 'community'];
  cards.forEach(c => { if (SECS.some(k => c.closest('#r3-' + k))) return; const k = HOME[c.getAttribute('href')] || 'analyze', g = $('#r3-' + k + ' .tt-g'); if (g) g.appendChild(c); });
  $$('#app .tt-g').forEach(g => { if (!g.children.length && !SECS.some(k => g.closest('#r3-' + k))) g.remove(); });
  SECS.forEach(k => { const sec = $('#r3-' + k); if (!sec) return; const m = new Set($$('.tt-tool', sec).map(c => c.getAttribute('href'))).size, hd = $('h2, h3', sec); if (hd) { const w = document.createTreeWalker(hd, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) if (/·\s*\d+/.test(t.nodeValue)) t.nodeValue = t.nodeValue.replace(/·\s*\d+/, '· ' + m); } });
  const n = new Set(cards.map(c => c.getAttribute('href'))).size, h1 = $('.page-h h1');
  if (h1 && !$('#tw-tcount')) h1.insertAdjacentHTML('beforeend', ` <span id="tw-tcount" style="display:inline-flex;align-items:center;vertical-align:middle;margin-left:10px;padding:5px 12px;border-radius:999px;background:#EEF2FF;color:#2F6BFF;font:800 15px 'Inter',sans-serif">${n} tools</span>`);
  else if ($('#tw-tcount')) $('#tw-tcount').textContent = n + ' tools';
  const p = $('.page-h p'); if (p && p.dataset.tw != n) { p.dataset.tw = n; p.textContent = n + ' everyday tools for serious investors, in 5 sections: Analyze, Learn, Play, Track and Community. Jump to a section below or search for a tool.'; }
  $$('#app a[data-j]').forEach(a => { const sec = $('#r3-' + a.dataset.j); if (!sec) return; const k = new Set($$('.tt-tool', sec).map(c => c.getAttribute('href'))).size; let b = $('b.tw-jn', a); if (!b) { b = document.createElement('b'); b.className = 'tw-jn'; b.style.cssText = 'margin-left:6px;font-size:11px;padding:1px 7px;border-radius:999px;background:#F1F5F9;color:#475569'; a.appendChild(b); } b.textContent = k; });
  return true;
}
let tm = 0; const kick = () => { clearTimeout(tm); let n = 0; const go = () => { put(); toolsCount(); if (n++ < 12) tm = setTimeout(go, 700); }; tm = setTimeout(go, 400); };
window.addEventListener('hashchange', kick); kick();
window.TWHOME = { movers, news, reorder };
})();
