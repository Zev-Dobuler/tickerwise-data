/* Tickerwise app25: Compare Scorecard.
   Scores every metric head-to-head for the 2–4 stocks on the Compare page (#/compare/A,B,C,D), groups them into 8 categories,
   and shows who wins each category and overall, next to the Tickerwise Score. Also feeds the Compare Arena banner (app24). */
(function () {
if (window.TWCMP) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz } = X, TW = window.TW || {}, NX = TW.NX || {}, app = $('#app'); if (!app || !esc || !S) return;
const PC = {}, ser = t => PC[t] || (PC[t] = (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => nz(p.c) && p.c > 0)), last = t => { const z = ser(t); return z[z.length - 1]; };
const COL = ['#2F6BFF', '#7C3AED', '#F59E0B', '#10B981'];
const pos = v => nz(v) && v > 0 ? v : null, n = v => nz(v) ? +v : null;
const f0 = v => nz(v) ? (+v).toFixed(0) : '—', f1 = v => nz(v) ? (+v).toFixed(1) : '—', pc = v => nz(v) ? (v > 0 ? '+' : '') + (+v).toFixed(0) + '%' : '—', mx = v => nz(v) ? (+v).toFixed(1) + 'x' : 'n/m';
const CONS = { 'Strong Buy': 5, 'Moderate Buy': 4, Buy: 4, Hold: 3, 'Moderate Sell': 2, Sell: 1, 'Strong Sell': 1 };
/* [category, metric, value(s), 1 higher better / -1 lower better, format] */
const M = [
  ['Valuation', 'Forward P/E', s => pos((s.val || {}).fpe), -1, mx], ['Valuation', 'Price/Sales', s => pos((s.val || {}).ps), -1, mx], ['Valuation', 'PEG', s => pos((s.val || {}).peg), -1, f1],
  ['Valuation', 'Upside to analyst target', s => { const A = (TW.AN || {})[s.t], l = last(s.t); return A && nz(A[0]) && l ? (A[0] / l.c - 1) * 100 : null; }, 1, pc],
  ['Growth', 'Revenue growth (y/y)', s => n(s.rg), 1, pc], ['Growth', 'Growth pillar', s => n((s.P || {}).g), 1, f0], ['Growth', 'Earnings growth (y/y)', s => { const v = (s.earn || {}).yoy; return typeof v === 'number' ? v : null; }, 1, pc],
  ['Profitability', 'Gross margin', s => n((s.mg || {}).gross), 1, pc], ['Profitability', 'Operating margin', s => n((s.mg || {}).op), 1, pc], ['Profitability', 'Net margin', s => n((s.mg || {}).net), 1, pc], ['Profitability', 'Free cash flow margin', s => n((s.mg || {}).fcf), 1, pc], ['Profitability', 'Profitability pillar', s => n((s.P || {}).p), 1, f0],
  ['Momentum', '1-month return', s => n((s.ret || {}).r1m), 1, pc], ['Momentum', '6-month return', s => n((s.ret || {}).r6m), 1, pc], ['Momentum', '1-year return', s => n((s.ret || {}).r1y), 1, pc], ['Momentum', 'vs 200-day average', s => n((s.tech || {}).v200), 1, pc], ['Momentum', 'Momentum pillar', s => n((s.P || {}).m), 1, f0],
  ['Earnings', 'Beat rate (8 quarters)', s => n((s.earn || {}).l8), 1, v => f0(v) + '%'], ['Earnings', 'Beat streak', s => n((s.earn || {}).streak), 1, f0], ['Earnings', 'Earnings pillar', s => n((s.P || {}).e), 1, f0],
  ['Safety', 'Financial health pillar', s => n((s.P || {}).b), 1, f0], ['Safety', 'Beta (swings vs market)', s => n(s.beta), -1, f1], ['Safety', 'Short interest', s => { const sh = ((TW.X || {})[s.t] || {}).sh; return sh ? +sh[0] : null; }, -1, v => f1(v) + '%'], ['Safety', 'Drop from 52-week high', s => n((s.tech || {}).off), 1, pc],
  ['Analysts', 'Consensus', s => { const A = (TW.AN || {})[s.t]; return A ? CONS[A[7]] || null : null; }, 1, v => ['', 'Sell', 'Sell', 'Hold', 'Buy', 'Strong Buy'][v] || '—'], ['Analysts', 'Number of analysts', s => { const A = (TW.AN || {})[s.t]; return A ? n(A[9]) : null; }, 1, f0],
  ['Smart Money', 'Famous investors who own it', s => { const F = window.TWFI; return F && F.OWN ? ((F.OWN[s.t] || {}).who || []).length : null; }, 1, f0],
  ['Smart Money', 'Funds adding minus trimming', s => { const v = (NX.SI || {})[s.t]; if (!v || !v[3]) return null; let x = 0; v[3].forEach(r => { const a = String(r[2] || ''); if (/^(Buy|Add)/i.test(a)) x++; else if (/^(Reduce|Sell)/i.test(a)) x--; }); return x; }, 1, f0],
  ['Smart Money', 'Insider buys minus sells', s => { const i = ((TW.X || {})[s.t] || {}).i; return i ? i[1] - i[2] : null; }, 1, f0],
  ['Smart Money', 'Congress buys minus sells', s => { const c = (NX.CG || {})[s.t]; return c ? c[0] - c[1] : null; }, 1, f0]];
const CATS = ['Valuation', 'Growth', 'Profitability', 'Momentum', 'Earnings', 'Safety', 'Analysts', 'Smart Money'];
const CI = { Valuation: '💲', Growth: '🌱', Profitability: '💰', Momentum: '🚀', Earnings: '📊', Safety: '🛡️', Analysts: '🏦', 'Smart Money': '🏛️' };
function list() { const m = location.hash.match(/^#\/compare\/([^/?#]+)/); let L = m ? decodeURIComponent(m[1]).split(',').map(x => x.trim().toUpperCase()).filter(x => BY[x]).slice(0, 4) : []; if (!L.length) L = ['NVDA', 'AMD'].filter(t => BY[t]); return L; }
function score(L) {
  const SS = L.map(t => BY[t]), rows = M.map(([c, nm, f, dir, fmt]) => { const v = SS.map(s => { try { const x = f(s); return nz(x) ? x : null; } catch (e) { return null; } }), ok = v.filter(x => x != null); let win = [];
    if (ok.length >= 2) { const best = dir > 0 ? Math.max(...ok) : Math.min(...ok); if (ok.some(x => x !== best)) win = v.map((x, i) => x === best ? i : -1).filter(i => i >= 0); } return { c, nm, v, dir, fmt, win }; });
  const cat = CATS.map(c => { const R = rows.filter(r => r.c === c && r.win.length), w = L.map((t, i) => R.filter(r => r.win.includes(i)).length), mxw = Math.max(...w); return { c, R, w, n: R.length, lead: R.length && w.filter(x => x === mxw).length === 1 ? w.indexOf(mxw) : -1 }; }).filter(x => x.n);
  const tot = L.map((t, i) => rows.filter(r => r.win.includes(i)).length), catW = L.map((t, i) => cat.filter(c => c.lead === i).length), decided = rows.filter(r => r.win.length).length;
  return { L, SS, rows, cat, tot, catW, decided };
}
const css = document.createElement('style'); css.textContent = `
.cmp-v{display:flex;gap:14px;flex-wrap:wrap;align-items:stretch}.cmp-v>div{flex:1 1 200px;border:1.5px solid var(--line);border-radius:16px;padding:14px 16px;background:#fff;position:relative;min-width:0}
.cmp-v .w{border-color:#FBBF24;box-shadow:0 10px 30px rgba(251,191,36,.18)}.cmp-v b.t{font:900 22px 'Space Grotesk',sans-serif}.cmp-v .big{font:800 30px 'Space Grotesk',sans-serif}.cmp-v small{display:block;color:var(--mut);font-size:12px;font-weight:600}
.cmp-v .cr{position:absolute;top:10px;right:12px;font-size:22px}
.cmp-g{display:grid;gap:6px}.cmp-r{display:grid;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid var(--line);background:#fff;cursor:pointer}.cmp-r:hover{border-color:#93C5FD}
.cmp-r .lb{font:700 14px Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cmp-r .bar{display:flex;height:22px;border-radius:999px;overflow:hidden;background:#F1F5F9}.cmp-r .bar i{display:flex;align-items:center;justify-content:center;color:#fff;font:800 11.5px Inter,sans-serif;font-style:normal;min-width:0;transition:width .6s}
.cmp-r .wn{font:800 13px Inter,sans-serif;white-space:nowrap;text-align:right}
.cmp-d{margin:2px 0 8px;padding:10px 12px;border-radius:12px;background:#F8FAFC;font-size:13.5px}.cmp-d table{width:100%;border-collapse:collapse}.cmp-d td,.cmp-d th{padding:5px 6px;border-bottom:1px solid #EEF2F7;text-align:right;white-space:nowrap}.cmp-d td:first-child,.cmp-d th:first-child{text-align:left;white-space:normal}.cmp-d td.win{font-weight:800;color:#047857}.cmp-d td.win:after{content:' ✓'}
.cmp-note{margin:12px 0 0;padding:12px 14px;border-radius:12px;background:#FFFBEB;border:1.5px solid #FCD34D;font-size:14px;line-height:1.55}
@media(max-width:640px){.cmp-r{grid-template-columns:110px minmax(0,1fr)!important}.cmp-r .wn{grid-column:1/-1;text-align:left}}
`; document.head.appendChild(css);
function scorecard() {
  if (!/^#\/compare/.test(location.hash)) return; const R = score(list()), { L, SS, cat, tot, catW, decided } = R; if (L.length < 2) return; const old = $('#cmp-sc'); if (old && old.dataset.l === L.join(',')) return; if (old) old.remove();
  const ord = L.map((t, i) => i).sort((a, b) => tot[b] - tot[a] || catW[b] - catW[a]), top = ord[0], wsTop = SS.map((s, i) => i).sort((a, b) => (SS[b].ws || 0) - (SS[a].ws || 0))[0], tieWs = SS.filter(s => s.ws === SS[wsTop].ws).length > 1, tieTot = tot.filter(x => x === tot[top]).length > 1;
  let note = ''; if (!tieTot && !tieWs && top !== wsTop) note = `<div class="cmp-note">⚖️ <b>Split decision.</b> ${esc(L[wsTop])} has the higher Tickerwise Score (${SS[wsTop].ws} vs ${SS[top].ws}), but ${esc(L[top])} wins more of the individual metrics (${tot[top]} vs ${tot[wsTop]}). The score weighs what matters most (momentum, earnings, growth, profitability, health); the metric count treats every number the same. Open each category below to see where each one wins.</div>`;
  else if (!tieTot) note = `<div class="cmp-note" style="background:#ECFDF5;border-color:#6EE7B7">✓ <b>Clear picture.</b> ${esc(L[top])} wins on both the Tickerwise Score and the head-to-head metrics.</div>`;
  const el = document.createElement('div'); el.className = 'card'; el.id = 'cmp-sc'; el.dataset.l = L.join(',');
  el.innerHTML = `<div class="card-h"><h3>Head-to-Head Scorecard</h3><span>${decided} metrics decided · ${cat.length} categories</span></div>
    <div class="cmp-v">${L.map((t, i) => `<div class="${i === top && !tieTot ? 'w' : ''}">${i === top && !tieTot ? '<span class="cr">🏆</span>' : ''}<b class="t" style="color:${COL[i]}">${esc(t)}</b><small>${esc(SS[i].n || '')}</small><div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap"><div><span class="big">${tot[i]}</span><small>metrics won</small></div><div><span class="big">${catW[i]}</span><small>categories led</small></div><div><span class="big">${SS[i].ws}</span><small>Tickerwise Score</small></div></div></div>`).join('')}</div>
    ${note}
    <div class="cmp-g" style="margin-top:14px">${cat.map((c, k) => `<div class="cmp-r" data-k="${k}" style="grid-template-columns:150px minmax(0,1fr) 130px"><span class="lb">${CI[c.c]} ${esc(c.c)}</span><div class="bar">${c.w.map((w, i) => w ? `<i style="width:${w / c.n * 100}%;background:${COL[i]}" title="${esc(L[i])} wins ${w} of ${c.n}">${w}</i>` : '').join('')}${c.n - c.w.reduce((a, b) => a + b, 0) > 0 ? `<i style="width:${(c.n - c.w.reduce((a, b) => a + b, 0)) / c.n * 100}%;background:#CBD5E1"></i>` : ''}</div><span class="wn">${c.lead >= 0 ? `<span style="color:${COL[c.lead]}">${esc(L[c.lead])} leads</span>` : 'Tied'} ▾</span></div><div class="cmp-d" data-d="${k}" hidden><table><tr><th>Metric</th>${L.map((t, i) => `<th style="color:${COL[i]}">${esc(t)}</th>`).join('')}<th></th></tr>${c.R.map(r => `<tr><td>${esc(r.nm)}</td>${r.v.map((v, i) => `<td class="${r.win.includes(i) ? 'win' : ''}">${v == null ? '—' : r.fmt(v)}</td>`).join('')}<td class="muted" style="font-size:11.5px">${r.dir > 0 ? 'higher wins' : 'lower wins'}</td></tr>`).join('')}</table></div>`).join('')}</div>
    <p class="muted" style="margin:10px 0 0;font-size:12.5px">Tap a category for the numbers. Each metric gives one point to the best value (ties and missing data give none). Colored bar = share of that category's metrics each stock wins; gray = ties.</p>
    <div class="tz-lock" style="margin-top:12px"><p><span class="tw-up">Upgraded Plan</span> <b>AI "Make the Case":</b> a written verdict on which of these is the better buy for your goal, with the reasons.</p><a class="btn primary" href="#/plans">See Plans</a></div>`;
  $$('.cmp-r', el).forEach(r => r.onclick = () => { const d = $(`[data-d="${r.dataset.k}"]`, el); d.hidden = !d.hidden; });
  const bx = $('#app .bx-set4'), w = $('#app .sec .wrap'); if (bx) bx.after(el); else if (w) w.prepend(el); else return;
}
let pend = 0; const kick = () => { if (pend) return; pend = 1; let n = 0; const go = () => { pend = 0; if (!/^#\/compare/.test(location.hash)) return; if ($('#app .sec .wrap') && (n > 6 || $('#app .bx-set4'))) scorecard(); else if (n++ < 30) { pend = 1; setTimeout(go, 250); } }; setTimeout(go, 600); };
window.addEventListener('hashchange', kick); kick();
window.TWCMP = { score, list, COL, CATS };
})();
