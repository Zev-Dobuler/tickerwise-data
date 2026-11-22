/* Tickerwise app28 (Nov 22, 2026): the All Stocks screener (#/screener), rebuilt in the spirit of the report's screener.
   Ready-made screens, grouped range filters with counts, pill filters, 60+ columns in groups you can show or hide,
   click-to-sort with a second sort level (Shift+click), saved screens. Same data and definitions as the stock pages. */
(function () {
if (window.TWSCR2) return;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const X = window.TWX || {}, { S, BY, esc, nz, fcv } = X, TW = window.TW || {}, NX = TW.NX || {}, app = $('#app'); if (!app || !S || !esc) return;
const num = v => v != null && v !== '' && isFinite(+v) ? +v : null;
const F = (s, k) => { const v = fcv ? fcv(s, k) : null; return v; }, FN = (s, k) => num(F(s, k));
const QS = t => (TW.QS || {})[t] || {}, ZS = t => (TW.ZS || {})[t] || {}, XX = t => (TW.X || {})[t] || {}, AN = t => (TW.AN || {})[t] || [];
const ser = t => (X.pxSeries ? X.pxSeries(t) || [] : []).filter(p => p.c > 0);
const PX = {}; S.forEach(s => { const z = ser(s.t); if (z.length) PX[s.t] = [z[z.length - 1].c, z.length > 1 ? (z[z.length - 1].c / z[z.length - 2].c - 1) * 100 : null]; });
const FAM = t => { const o = (window.TWFI && window.TWFI.OWN || {})[t]; return o ? o.who.length : 0; };
const days = d => { if (!d) return null; const x = (Date.parse(d) - Date.parse((TW.asof && new Date(TW.asof).toISOString().slice(0, 10)) || new Date().toISOString().slice(0, 10))) / 864e5; return isFinite(x) ? Math.round(x) : null; };
const mv = s => ((s.earn || {}).x || {}).mv || [];
const avg = a => { a = a.filter(v => v != null && isFinite(v)); return a.length ? a.reduce((x, y) => x + y, 0) / a.length : null; };
const CONS = { 'Strong Buy': 5, 'Moderate Buy': 4, Buy: 4, Hold: 3, 'Moderate Sell': 2, Sell: 1, 'Strong Sell': 1 };
const GRADE = { A: 5, B: 4, C: 3, D: 2, F: 1 };
/* ---------- formats ---------- */
const sgn = (v, d) => v == null ? '—' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d == null ? 0 : d) + '%';
const pctc = (v, d) => v == null ? '<span class="muted">—</span>' : `<span class="${v > 0 ? 'up' : v < 0 ? 'dn' : ''}">${sgn(v, d)}</span>`;
const pctn = (v, d) => v == null ? '<span class="muted">—</span>' : (v < 0 ? `<span class="dn">${sgn(v, d)}</span>` : (+v).toFixed(d == null ? 0 : d) + '%');
const mult = v => v == null ? '<span class="muted">—</span>' : v <= 0 || v > 400 ? '<span class="muted">n/m</span>' : v.toFixed(1) + 'x';
const n1 = (v, d) => v == null ? '<span class="muted">—</span>' : (+v).toFixed(d || 0);
const cap = v => v == null ? '—' : v >= 1e12 ? '$' + (v / 1e12).toFixed(2) + 'T' : v >= 1e9 ? '$' + (v / 1e9).toFixed(1) + 'B' : '$' + (v / 1e6).toFixed(0) + 'M';
const sc100 = v => v == null ? '<span class="muted">—</span>' : `<span class="s2-bar"><i style="width:${v}%;background:${v >= 70 ? '#00B86B' : v >= 40 ? '#F5A524' : '#E5484D'}"></i></span>${v}`;
const sc10 = v => v == null ? '—' : `<b class="s2-ws" style="background:${v >= 8 ? '#00B86B' : v >= 6 ? '#7AC74F' : v >= 4 ? '#F5A524' : '#E5484D'}">${v}</b>`;
const zr = v => v == null ? '<span class="muted">—</span>' : `<b style="color:${v <= 2 ? '#00A862' : v === 3 ? '#B07A00' : '#D72B45'}">${v}</b> <span class="muted">${['', 'Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'][v] || ''}</span>`;
const grade = v => v ? `<b style="color:${'AB'.includes(v) ? '#00A862' : v === 'C' ? '#B07A00' : '#D72B45'}">${esc(v)}</b>` : '<span class="muted">—</span>';
const txt = v => v ? `<span style="white-space:nowrap">${esc(String(v))}</span>` : '<span class="muted">—</span>';
/* ---------- buckets ---------- */
const cuts = (c, u, lo, hi) => { u = u || ''; const f = v => (v < 0 ? '−' : '') + Math.abs(v) + u; const B = [[(lo || 'Under ') + f(c[0]), null, c[0]]]; for (let i = 0; i < c.length - 1; i++) B.push([f(c[i]) + ' to ' + f(c[i + 1]), c[i], c[i + 1]]); B.push([(hi || 'Over ') + f(c[c.length - 1]), c[c.length - 1], null]); return B; };
const RET = cuts([-50, -25, -10, 0, 10, 25, 50], '%'), GROW = cuts([0, 10, 25, 50, 100], '%'), MARG = cuts([0, 10, 20, 35, 50], '%'), S100 = cuts([20, 40, 60, 80], '', 'Under ', 'Over ');
const MULT = [['Under 10x', 0.001, 10], ['10x to 20x', 10, 20], ['20x to 30x', 20, 30], ['30x to 50x', 30, 50], ['Over 50x', 50, 400], ['n/m (losses)', -1e9, 0.001]];
/* ---------- columns: [key, label, group, get, cell, buckets, filter-group] ---------- */
const C = [
  ['price', 'Price', 'Overview', s => (PX[s.t] || [])[0], (v) => v == null ? '—' : '$' + v.toFixed(2)],
  ['d1', '1 Day', 'Overview', s => (PX[s.t] || [])[1], v => pctc(v, 1), cuts([-5, -2, 0, 2, 5], '%')],
  ['mcap', 'Market Cap', 'Overview', s => FN(s, 'Market Cap') || (((NX.IX || {}).T || {})[s.t] ? NX.IX.T[s.t][2] * 1e9 : null), cap, [['Under $2B', null, 2e9], ['$2B to $10B', 2e9, 1e10], ['$10B to $50B', 1e10, 5e10], ['$50B to $200B', 5e10, 2e11], ['$200B to $1T', 2e11, 1e12], ['Over $1T', 1e12, null]]],
  ['th', 'Theme', 'Overview', s => s.th, txt],
  ['ws', 'Tickerwise Score', 'Scores', s => s.ws, sc10, [['8 to 10', 8, 11], ['6 to 7', 6, 8], ['4 to 5', 4, 6], ['1 to 3', 0, 4]]],
  ['zk', 'Zacks Rank', 'Scores', s => FN(s, 'Zacks Score'), zr, [['1 Strong Buy', 1, 2], ['2 Buy', 2, 3], ['3 Hold', 3, 4], ['4 Sell', 4, 5], ['5 Strong Sell', 5, 6]], 1],
  ['smart', 'Smart Score', 'Scores', s => FN(s, 'Smart Score'), v => n1(v), [['8 to 10', 8, 11], ['6 to 7', 6, 8], ['4 to 5', 4, 6], ['1 to 3', 0, 4]]],
  ['vgm', 'Zacks Style (VGM)', 'Scores', s => ZS(s.t).vgm, grade],
  ['zv', 'Value Grade', 'Scores', s => ZS(s.t).v, grade], ['zg', 'Growth Grade', 'Scores', s => ZS(s.t).g, grade], ['zm', 'Momentum Grade', 'Scores', s => ZS(s.t).m, grade],
  ['ir', 'Industry Rank', 'Scores', s => { const z = ZS(s.t); return z.ir && z.irn ? Math.round(z.ir / z.irn * 100) : null; }, v => v == null ? '<span class="muted">—</span>' : `<span class="${v <= 33 ? 'up' : v > 66 ? 'dn' : ''}">Top ${v}%</span>`, [['Top third', 0, 34], ['Middle third', 34, 67], ['Bottom third', 67, 101]], 1],
  ['m', 'Momentum', 'Score Factors', s => s.P.m, sc100, S100], ['e', 'Earnings', 'Score Factors', s => s.P.e, sc100, S100], ['g', 'Growth', 'Score Factors', s => s.P.g, sc100, S100],
  ['p', 'Profitability', 'Score Factors', s => s.P.p, sc100, S100], ['b', 'Financial Health', 'Score Factors', s => s.P.b, sc100, S100],
  ['r1m', '1 Month', 'Performance', s => s.ret.r1m, v => pctc(v), RET], ['r3m', '3 Months', 'Performance', s => s.ret.r3m, v => pctc(v), RET], ['r6m', '6 Months', 'Performance', s => s.ret.r6m, v => pctc(v), RET],
  ['rytd', 'YTD', 'Performance', s => s.ret.rytd, v => pctc(v), RET], ['r1y', '1 Year', 'Performance', s => s.ret.r1y, v => pctc(v), RET],
  ['off', 'Off 52-Wk High', 'Performance', s => s.tech.off, v => pctc(v), [['Within 5%', -5, 0.01], ['5% to 15% off', -15, -5], ['15% to 30% off', -30, -15], ['30% to 50% off', -50, -30], ['Over 50% off', null, -50]]],
  ['v50', 'vs 50-Day', 'Performance', s => s.tech.v50, v => pctc(v), cuts([-20, -10, 0, 10, 20], '%')], ['v200', 'vs 200-Day', 'Performance', s => s.tech.v200, v => pctc(v), cuts([-20, -10, 0, 10, 20], '%')],
  ['rsi', 'RSI (14)', 'Performance', s => s.tech.rsi, v => v == null ? '—' : `<span style="color:${v < 30 ? '#2F6BFF' : v > 70 ? '#E5484D' : 'inherit'};font-weight:${v < 30 || v > 70 ? 700 : 400}">${Math.round(v)}</span>`, [['Oversold (under 30)', null, 30], ['30 to 50', 30, 50], ['50 to 70', 50, 70], ['Overbought (over 70)', 70, null]], 1],
  ['beta', 'Beta', 'Performance', s => num(s.beta), v => n1(v, 2), [['Under 0.8', null, 0.8], ['0.8 to 1.2', 0.8, 1.2], ['1.2 to 2', 1.2, 2], ['Over 2', 2, null]], 1],
  ['pe', 'P/E', 'Valuation', s => FN(s, 'P/E'), mult, MULT, 1], ['fpe', 'Forward P/E', 'Valuation', s => num(s.val.fpe), mult, MULT, 1],
  ['peg', 'PEG', 'Valuation', s => num(s.val.peg), v => v == null ? '<span class="muted">—</span>' : v <= 0 ? '<span class="muted">n/m</span>' : `<span class="${v < 1 ? 'up' : v > 2.5 ? 'dn' : ''}">${v.toFixed(2)}</span>`, [['Under 1', 0.001, 1], ['1 to 2', 1, 2], ['2 to 3', 2, 3], ['Over 3', 3, null]], 1],
  ['ps', 'P/S', 'Valuation', s => num(s.val.ps), mult, [['Under 2x', 0.001, 2], ['2x to 5x', 2, 5], ['5x to 10x', 5, 10], ['10x to 20x', 10, 20], ['Over 20x', 20, null]], 1],
  ['fps', 'Forward P/S', 'Valuation', s => FN(s, 'Forward P/S'), mult, [['Under 2x', 0.001, 2], ['2x to 5x', 2, 5], ['5x to 10x', 5, 10], ['10x to 20x', 10, 20], ['Over 20x', 20, null]], 1],
  ['pb', 'Price/Book', 'Valuation', s => num(QS(s.t).pb), mult, [['Under 1x', 0.001, 1], ['1x to 3x', 1, 3], ['3x to 10x', 3, 10], ['Over 10x', 10, null]], 1],
  ['pfcf', 'Price/FCF', 'Valuation', s => num(QS(s.t).pfcf), mult, MULT, 1], ['eve', 'EV/EBITDA', 'Valuation', s => num(QS(s.t).eve), mult, MULT, 1],
  ['rg1', 'Revenue Growth 1Y', 'Growth', s => FN(s, 'Revenue 1Y Growth'), v => pctc(v), GROW], ['rg', 'Revenue Y/Y (Last Qtr)', 'Growth', s => num(s.rg), v => pctc(v), GROW], ['rfc', 'Revenue Fwd 1Y', 'Growth', s => FN(s, 'Revenue Forward 1Y CAGR'), v => pctc(v), GROW],
  ['r3', 'Revenue 3Y CAGR', 'Growth', s => num(QS(s.t).r3), v => pctc(v), GROW], ['epsg', 'EPS Growth (3–5Y Est.)', 'Growth', s => FN(s, 'EPS Growth'), v => pctc(v), GROW],
  ['e3', 'EPS 3Y CAGR', 'Growth', s => num(QS(s.t).e3), v => pctc(v), GROW], ['nig', 'Net Income 1Y', 'Growth', s => FN(s, 'Net Income 1Y Growth'), v => pctc(v), GROW],
  ['acc', 'Accelerating', 'Growth', s => F(s, 'Accelerating Growth'), v => v ? `<b class="${v === 'Yes' ? 'up' : v === 'No' ? 'dn' : ''}">${esc(v)}</b>` : '<span class="muted">—</span>'],
  ['gm', 'Gross Margin', 'Profitability', s => FN(s, 'Gross Margin') != null ? FN(s, 'Gross Margin') : num(s.mg.gross), v => pctn(v), MARG], ['om', 'Operating Margin', 'Profitability', s => num(s.mg.op), v => pctn(v), MARG],
  ['nm', 'Net Margin', 'Profitability', s => num(s.mg.net), v => pctn(v), MARG], ['fcf', 'FCF Margin', 'Profitability', s => num(s.mg.fcf), v => pctn(v), MARG],
  ['roe', 'ROE', 'Profitability', s => num(QS(s.t).roe), v => pctn(v), cuts([0, 10, 20, 40], '%')], ['roic', 'ROIC', 'Profitability', s => num(QS(s.t).roic), v => pctn(v), cuts([0, 10, 20, 40], '%')],
  ['de', 'Debt/Equity', 'Financial Health', s => num(QS(s.t).de), v => v == null ? '<span class="muted">—</span>' : `<span class="${v > 2 ? 'dn' : ''}">${v.toFixed(2)}</span>`, [['Under 0.3', null, 0.3], ['0.3 to 1', 0.3, 1], ['1 to 2', 1, 2], ['Over 2', 2, null]], 1],
  ['cr', 'Current Ratio', 'Financial Health', s => num(QS(s.t).cr), v => n1(v, 2), [['Under 1', null, 1], ['1 to 2', 1, 2], ['Over 2', 2, null]]],
  ['ic', 'Interest Coverage', 'Financial Health', s => num(QS(s.t).ic), v => v == null ? '<span class="muted">—</span>' : v > 999 ? '999+' : v.toFixed(1) + 'x'],
  ['fsc', 'Piotroski F-Score', 'Financial Health', s => num(QS(s.t).f), v => n1(v), [['7 to 9 (strong)', 7, 10], ['4 to 6', 4, 7], ['0 to 3 (weak)', 0, 4]]],
  ['z', 'Altman Z-Score', 'Financial Health', s => num(QS(s.t).z), v => v == null ? '<span class="muted">—</span>' : `<span class="${v > 3 ? 'up' : v < 1.8 ? 'dn' : ''}">${v.toFixed(1)}</span>`, [['Safe (over 3)', 3, null], ['Grey zone (1.8 to 3)', 1.8, 3], ['Distress (under 1.8)', null, 1.8]]],
  ['dil', 'Share Change 1Y', 'Financial Health', s => num(QS(s.t).sh1), v => v == null ? '<span class="muted">—</span>' : `<span class="${v > 2 ? 'dn' : v < 0 ? 'up' : ''}">${sgn(v, 1)}</span>`, [['Buying back (under 0%)', null, 0], ['0% to 2%', 0, 2], ['2% to 10% (dilution)', 2, 10], ['Over 10%', 10, null]], 1],
  ['es', 'Earnings Signal', 'Earnings', s => num(((s.earn || {}).x || {}).s), v => v == null ? '<span class="muted">—</span>' : sc100(v), S100],
  ['l8', 'Beat Rate (8Q)', 'Earnings', s => num(s.earn.l8), v => v == null ? '<span class="muted">—</span>' : v + '%', [['100%', 100, 101], ['75% to 99%', 75, 100], ['50% to 74%', 50, 75], ['Under 50%', null, 50]]],
  ['stk', 'Beat Streak', 'Earnings', s => num(s.earn.streak), v => n1(v), [['8+ quarters', 8, null], ['4 to 7', 4, 8], ['1 to 3', 1, 4], ['None', 0, 1]]],
  ['rvp', 'EPS Revisions (90D)', 'Earnings', s => num(((s.earn || {}).x || {}).rvp), v => pctc(v, 1), cuts([-5, 0, 5], '%')],
  ['gd', 'Guidance', 'Earnings', s => ((s.earn || {}).x || {}).gd, v => v ? `<span style="white-space:nowrap" class="${/Above|Raised/.test(v) ? 'up' : /Below|Lowered/.test(v) ? 'dn' : ''}">${esc(v.replace(/^New: /, ''))}</span>` : '<span class="muted">—</span>'],
  ['nx', 'Next Earnings', 'Earnings', s => days(s.earn.next), (v, s) => v == null ? '<span class="muted">—</span>' : `<span style="white-space:nowrap;${v >= 0 && v <= 14 ? 'background:#FFE45C;padding:1px 6px;border-radius:5px' : ''}">${esc(s.earn.next)}${v >= 0 ? ` <span class="muted">(${v}d)</span>` : ''}</span>`, [['Next 7 days', 0, 8], ['8 to 30 days', 8, 31], ['31 to 60 days', 31, 61], ['Over 60 days', 61, null]], 1],
  ['rday', 'Avg Reaction Day', 'Earnings', s => avg(mv(s).map(r => r[2])), v => pctc(v, 1), cuts([-5, -2, 0, 2, 5], '%')],
  ['rsize', 'Avg Move Size', 'Earnings', s => avg(mv(s).map(r => r[2] == null ? null : Math.abs(r[2]))), v => v == null ? '<span class="muted">—</span>' : v.toFixed(1) + '%', [['Under 3%', null, 3], ['3% to 6%', 3, 6], ['6% to 10%', 6, 10], ['Over 10%', 10, null]]],
  ['r30', 'Avg 30 Days After', 'Earnings', s => avg(mv(s).map(r => r[3])), v => pctc(v, 1), cuts([-10, 0, 10], '%')],
  ['rup', 'Reaction Days Up', 'Earnings', s => { const m = mv(s).filter(r => r[2] != null); return m.length ? m.filter(r => r[2] > 0).length : null; }, (v, s) => v == null ? '<span class="muted">—</span>' : v + ' of ' + mv(s).filter(r => r[2] != null).length, [['6 to 8', 6, 9], ['4 to 5', 4, 6], ['0 to 3', 0, 4]]],
  ['cons', 'Analyst Consensus', 'Analysts', s => F(s, 'Analyst Consensus') || AN(s.t)[7], v => v ? `<b class="${CONS[v] >= 4 ? 'up' : CONS[v] <= 2 ? 'dn' : ''}" style="white-space:nowrap">${esc(v)}</b>` : '<span class="muted">—</span>'],
  ['up', 'Upside to Target', 'Analysts', s => FN(s, 'Analyst Price Target %'), v => pctc(v), cuts([-10, 0, 10, 25, 50], '%')],
  ['tgt', 'Avg Price Target', 'Analysts', s => num(AN(s.t)[0]), v => v == null ? '<span class="muted">—</span>' : '$' + v.toFixed(2)],
  ['na', '# Analysts', 'Analysts', s => num(AN(s.t)[9]), v => n1(v), [['20+', 20, null], ['10 to 19', 10, 20], ['3 to 9', 3, 10], ['Under 3', null, 3]]],
  ['inst', 'Institutions Own', 'Ownership', s => num((XX(s.t).h || [])[0]), v => v == null ? '<span class="muted">—</span>' : v.toFixed(0) + '%', [['Over 80%', 80, null], ['50% to 80%', 50, 80], ['Under 50%', null, 50]]],
  ['fam', 'Famous Investors', 'Ownership', s => FAM(s.t) || null, v => v == null ? '<span class="muted">0</span>' : `<b>${v}</b>`, [['5+', 5, null], ['2 to 4', 2, 5], ['1', 1, 2]]],
  ['ins', 'Insider Trades (Net)', 'Ownership', s => { const i = XX(s.t).i; return i ? (i[1] || 0) - (i[2] || 0) : null; }, v => v == null ? '<span class="muted">—</span>' : `<span class="${v > 0 ? 'up' : v < 0 ? 'dn' : ''}">${v > 0 ? '+' : ''}${v}</span>`, [['Net buying', 1, null], ['Even', 0, 1], ['Net selling', null, 0]]],
  ['cg', 'Congress Trades (Net)', 'Ownership', s => { const c = (NX.CG || {})[s.t]; return c ? (c[0] || 0) - (c[1] || 0) : null; }, v => v == null ? '<span class="muted">—</span>' : `<span class="${v > 0 ? 'up' : v < 0 ? 'dn' : ''}">${v > 0 ? '+' : ''}${v}</span>`],
  ['sh', 'Short % Float', 'Ownership', s => num((XX(s.t).sh || [])[0]), v => v == null ? '<span class="muted">—</span>' : `<span class="${v > 10 ? 'dn' : ''}">${v.toFixed(1)}%</span>`, [['Under 3%', null, 3], ['3% to 10%', 3, 10], ['10% to 20%', 10, 20], ['Over 20%', 20, null]]],
  ['dtc', 'Days to Cover', 'Ownership', s => num((XX(s.t).sh || [])[1]), v => n1(v, 1)]
];
const CK = {}; C.forEach(c => { CK[c[0]] = c; });
const GROUPS = [...new Set(C.map(c => c[2]))];
/* ---------- ready-made screens ---------- */
const g = (s, k) => CK[k][3](s);
const PRE = [
  ['Top Scores', 'Tickerwise Score 8+', s => s.ws >= 8],
  ['Analyst Favorites', 'Strong or Moderate Buy with 20%+ upside', s => CONS[g(s, 'cons')] >= 4 && g(s, 'up') >= 20],
  ['Deep Value', 'Forward P/E under 15 and score 6+', s => g(s, 'fpe') > 0 && g(s, 'fpe') < 15 && s.ws >= 6],
  ['Cheap Growth', 'PEG under 1.5 and revenue growth over 15%', s => g(s, 'peg') > 0 && g(s, 'peg') < 1.5 && g(s, 'rg') > 15],
  ['Momentum', 'Above the 200-day, up over 3 months, RSI 50–70', s => g(s, 'v200') > 0 && g(s, 'r3m') > 0 && g(s, 'rsi') >= 50 && g(s, 'rsi') <= 70],
  ['Oversold Bounce', 'RSI under 30 with a score of 6+', s => g(s, 'rsi') < 30 && s.ws >= 6],
  ['Fast Growers', 'Revenue growth over 30%', s => g(s, 'rg') > 30],
  ['Profitable Growth', 'Revenue growth 15%+ and net margin 15%+', s => g(s, 'rg') >= 15 && g(s, 'nm') >= 15],
  ['Quality Compounders', 'ROIC 15%+, debt/equity under 1, net margin 10%+', s => g(s, 'roic') >= 15 && g(s, 'de') != null && g(s, 'de') < 1 && g(s, 'nm') >= 10],
  ['Beat Machines', 'Beat 7+ of the last 8 reports', s => g(s, 'l8') >= 87],
  ['Earnings Soon', 'Reports in the next 14 days', s => g(s, 'nx') != null && g(s, 'nx') >= 0 && g(s, 'nx') <= 14],
  ['Smart Money', '3+ famous investors own it', s => g(s, 'fam') >= 3],
  ['Insider Buying', 'More insider buys than sells', s => g(s, 'ins') > 0],
  ['Short Squeeze Watch', 'Short interest over 10% and above the 50-day', s => g(s, 'sh') > 10 && g(s, 'v50') > 0],
  ['Beaten-Down Quality', '30%+ off the high with a score of 7+', s => g(s, 'off') <= -30 && s.ws >= 7]
];
/* ---------- state ---------- */
const FKEYS = C.filter(c => c[5]).map(c => c[0]);
let ST = { q: '', th: '', sec: '', f: {}, cons: [], acc: [], pre: '', sort: [['ws', -1]], hide: [], open: false };
try { const o = JSON.parse(localStorage.getItem('tw_scr2_st') || 'null'); if (o) ST = Object.assign(ST, { hide: o.hide || [], sort: o.sort || ST.sort }); } catch (e) {}
const save = () => { try { localStorage.setItem('tw_scr2_st', JSON.stringify({ hide: ST.hide, sort: ST.sort })); } catch (e) {} };
const inB = (v, b) => v != null && (b[1] == null || v >= b[1]) && (b[2] == null || v < b[2]);
function pass(s, skip) {
  if (ST.q && !(s.t + ' ' + s.n + ' ' + s.th).toUpperCase().includes(ST.q.toUpperCase())) return false;
  if (ST.th && s.th !== ST.th) return false; if (ST.sec && s.sec !== ST.sec) return false;
  if (ST.cons.length && !ST.cons.includes(g(s, 'cons') || 'No rating')) return false;
  if (ST.acc.length && !ST.acc.includes(g(s, 'acc') || 'No data')) return false;
  if (ST.pre) { const p = PRE.find(x => x[0] === ST.pre); if (p && !p[2](s)) return false; }
  for (const k in ST.f) { if (k === skip || !ST.f[k].length) continue; const c = CK[k], v = c[3](s); if (!ST.f[k].some(i => inB(v, c[5][i]))) return false; }
  return true;
}
function sorted(L) {
  return L.slice().sort((a, b) => { for (const [k, d] of ST.sort) { const c = CK[k]; if (!c) continue; let x = c[3](a), y = c[3](b); if (k === 'cons') { x = CONS[x]; y = CONS[y]; } if (['vgm', 'zv', 'zg', 'zm'].includes(k)) { x = GRADE[x]; y = GRADE[y]; }
    const nx = x == null || x === '', ny = y == null || y === ''; if (nx && ny) continue; if (nx) return 1; if (ny) return -1; const r = typeof x === 'string' ? x.localeCompare(y) : x - y; if (r) return r * d; } return b.ws - a.ws; });
}
const LOWFIRST = ['zk', 'pe', 'fpe', 'peg', 'ps', 'fps', 'pb', 'pfcf', 'eve', 'de', 'rsi', 'nx', 'sh', 'dtc', 'ir', 'dil', 'th'];
/* ---------- render ---------- */
const css = `
#s2 .s2-pre{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 12px}
#s2 .s2-pre button{border:1.5px solid #F28C28;background:#fff;color:#C2410C;font:700 12.5px 'Inter',sans-serif;padding:6px 11px;border-radius:999px;cursor:pointer}
#s2 .s2-pre button.on{background:#F28C28;color:#fff}
#s2 .s2-pre button.clr{border-color:#0F172A;color:#0F172A}
#s2 .s2-bar{display:inline-block;width:34px;height:6px;border-radius:3px;background:#EEF2F7;margin-right:6px;vertical-align:middle;overflow:hidden}#s2 .s2-bar i{display:block;height:100%}
#s2 .s2-ws{display:inline-block;min-width:26px;text-align:center;color:#fff;border-radius:7px;padding:2px 6px}
#s2 .s2-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px}
#s2 .s2-top input,#s2 .s2-top select{height:38px;border:1px solid #E2E8F0;border-radius:10px;padding:0 12px;font:500 14px 'Inter',sans-serif;background:#fff}
#s2 .s2-top input{min-width:230px;flex:1;max-width:340px}
#s2 .s2-btn{height:38px;border:1px solid #E2E8F0;background:#fff;border-radius:10px;padding:0 14px;font:700 13.5px 'Inter',sans-serif;cursor:pointer;color:#0F172A}
#s2 .s2-btn.pri{background:#0F172A;color:#fff;border-color:#0F172A}
#s2 .s2-panel{border:1px solid #E2E8F0;border-radius:14px;background:#fff;padding:14px 16px;margin-bottom:12px}
#s2 .s2-g{margin-bottom:10px}#s2 .s2-g h5{margin:0 0 6px;font:800 12px 'Inter',sans-serif;color:#2F6BFF;text-transform:uppercase;letter-spacing:.06em}
#s2 .s2-fs{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
#s2 details.s2-dd{position:relative;border:1px solid #E2E8F0;border-radius:9px;background:#F8FAFC}
#s2 details.s2-dd[open]{z-index:20}
#s2 details.s2-dd summary{list-style:none;cursor:pointer;padding:7px 10px;font:600 12.5px 'Inter',sans-serif;display:flex;justify-content:space-between;gap:6px}
#s2 details.s2-dd summary::-webkit-details-marker{display:none}
#s2 details.s2-dd summary i{font-style:normal;color:#64748B;font-weight:500;white-space:nowrap}
#s2 details.s2-dd.on{border-color:#2F6BFF;background:#EEF4FF}#s2 details.s2-dd.on summary i{color:#2F6BFF;font-weight:700}
#s2 .s2-menu{position:absolute;top:100%;left:0;min-width:100%;margin-top:4px;background:#fff;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 12px 30px -8px rgba(15,23,42,.25);padding:6px;white-space:nowrap}
#s2 .s2-menu label{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;font-size:13px;cursor:pointer}#s2 .s2-menu label:hover{background:#F1F5F9}
#s2 .s2-menu label.z{opacity:.45}#s2 .s2-menu b{margin-left:auto;color:#64748B;font-weight:600}
#s2 .s2-pills{display:flex;flex-wrap:wrap;gap:16px;margin-top:6px}#s2 .s2-pills>div{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
#s2 .s2-pills span.l{font:700 12px 'Inter',sans-serif;color:#64748B;margin-right:4px}
#s2 .s2-pills button{border:1px solid #CBD5E1;background:#fff;border-radius:999px;padding:4px 10px;font:600 12px 'Inter',sans-serif;cursor:pointer}
#s2 .s2-pills button.on{background:#0F172A;color:#fff;border-color:#0F172A}
#s2 .s2-cols{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0 10px}
#s2 .s2-cols span.l{font:700 12px 'Inter',sans-serif;color:#64748B}
#s2 .s2-cols button[data-grp]{border:1px solid #CBD5E1;background:#fff;border-radius:8px;padding:4px 9px;font:600 12px 'Inter',sans-serif;cursor:pointer;color:#94A3B8;text-decoration:line-through}
#s2 .s2-cols button[data-grp].on{color:#0F172A;text-decoration:none;border-color:#94A3B8;background:#F8FAFC}
#s2 .s2-wrap{overflow:auto;max-height:78vh;border:1px solid #E2E8F0;border-radius:14px;background:#fff}
#s2 table{border-collapse:separate;border-spacing:0;font-size:13px;min-width:100%}
#s2 th,#s2 td{padding:8px 10px;border-bottom:1px solid #F1F5F9;white-space:nowrap;text-align:right}
#s2 thead th{position:sticky;top:26px;background:#F8FAFC;z-index:3;font:700 11.5px 'Inter',sans-serif;color:#475569;cursor:pointer;user-select:none;border-bottom:1px solid #E2E8F0}
#s2 thead tr.gr th{top:0;height:26px;padding:4px 10px;font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:#2F6BFF;text-align:left;border-left:2px solid #fff;cursor:default}
#s2 th:first-child,#s2 td:first-child{position:sticky;left:0;background:#fff;z-index:2;text-align:left;box-shadow:1px 0 0 #E2E8F0}
#s2 thead th:first-child{z-index:4;background:#F8FAFC}
#s2 td:first-child a{font-weight:800;color:#2F6BFF;text-decoration:none}#s2 td:first-child small{display:block;color:#64748B;max-width:150px;overflow:hidden;text-overflow:ellipsis}
#s2 tbody tr:hover td{background:#F8FAFC}
#s2 th .ar{color:#2F6BFF;font-size:10px;margin-left:3px}
#s2 .up{color:#059669}#s2 .dn{color:#DC2626}
#s2 .s2-cnt{margin-left:auto;font:600 13.5px 'Inter',sans-serif;color:#475569}#s2 .s2-cnt b{color:#2F6BFF}
#s2 .s2-mine{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 12px}
#s2 .s2-mine button{border:1px solid #2F6BFF;color:#2F6BFF;background:#fff;border-radius:999px;padding:4px 10px;font:700 12px 'Inter',sans-serif;cursor:pointer}
@media(max-width:640px){#s2 .s2-top input{min-width:0;max-width:none;width:100%}#s2 .s2-fs{grid-template-columns:repeat(2,minmax(0,1fr))}#s2 .s2-menu{white-space:normal;min-width:200px}#s2 .s2-cnt{margin-left:0;width:100%}}`;
function ddHTML(c) {
  const sel = ST.f[c[0]] || [], base = S.filter(s => pass(s, c[0])), cnt = c[5].map(b => base.filter(s => inB(c[3](s), b)).length);
  return `<details class="s2-dd${sel.length ? ' on' : ''}" data-k="${c[0]}"><summary>${esc(c[1])} <i>${sel.length ? sel.length === 1 ? esc(c[5][sel[0]][0]) : sel.length + ' ranges' : 'Any'} ▾</i></summary><div class="s2-menu">${c[5].map((b, i) => `<label class="${cnt[i] ? '' : 'z'}"><input type="checkbox" data-i="${i}" ${sel.includes(i) ? 'checked' : ''}> ${esc(b[0])} <b>${cnt[i]}</b></label>`).join('')}</div></details>`;
}
function panel() {
  const cs = ['Strong Buy', 'Moderate Buy', 'Hold', 'Moderate Sell', 'Sell', 'No rating'], ac = ['Yes', 'Steady', 'No'];
  return `<div class="s2-panel">${GROUPS.map(gn => { const L = C.filter(c => c[2] === gn && c[5]); return L.length ? `<div class="s2-g"><h5>${esc(gn)}</h5><div class="s2-fs">${L.map(ddHTML).join('')}</div></div>` : ''; }).join('')}
    <div class="s2-pills"><div><span class="l">Analyst consensus</span>${cs.map(x => `<button type="button" data-cons="${x}" class="${ST.cons.includes(x) ? 'on' : ''}">${x}</button>`).join('')}</div>
    <div><span class="l">Accelerating growth</span>${ac.map(x => `<button type="button" data-acc="${x}" class="${ST.acc.includes(x) ? 'on' : ''}">${x}</button>`).join('')}</div></div></div>`;
}
const mine = () => { try { return JSON.parse(localStorage.getItem('tw_scr2_saved') || '[]'); } catch (e) { return []; } };
function view() {
  const vis = C.filter(c => !ST.hide.includes(c[2])), L = sorted(S.filter(s => pass(s))), act = Object.values(ST.f).reduce((a, x) => a + x.length, 0) + ST.cons.length + ST.acc.length + (ST.pre ? 1 : 0) + (ST.th ? 1 : 0) + (ST.sec ? 1 : 0) + (ST.q ? 1 : 0);
  const grp = []; vis.forEach(c => { const l = grp[grp.length - 1]; if (l && l[0] === c[2]) l[1]++; else grp.push([c[2], 1]); });
  const arrow = k => { const i = ST.sort.findIndex(x => x[0] === k); return i < 0 ? '' : `<span class="ar">${ST.sort[i][1] > 0 ? '▲' : '▼'}${ST.sort.length > 1 ? i + 1 : ''}</span>`; };
  const M = mine();
  return `<div style="font:800 12px 'Inter',sans-serif;color:#64748B;letter-spacing:.06em;text-transform:uppercase;margin:18px 0 8px">Ready-made screens · click to load</div><div class="s2-pre">${PRE.map(p => `<button type="button" data-pre="${esc(p[0])}" title="${esc(p[1])}" class="${ST.pre === p[0] ? 'on' : ''}">${esc(p[0])} (${S.filter(s => { const o = ST.pre; ST.pre = p[0]; const r = pass(s); ST.pre = o; return r; }).length})</button>`).join('')}<button type="button" class="clr" data-clear>Clear all filters</button></div>
    ${0 && M.length ? `<div class="s2-mine"><span class="muted" style="font-size:12px;font-weight:700">My screens:</span>${M.map((m, i) => `<button type="button" data-load="${i}">${esc(m.n)}</button>`).join('')}</div>` : ''}
    <div class="s2-top"><input id="s2q" placeholder="Search ticker, company or theme" value="${esc(ST.q)}">
      <select id="s2th"><option value="">All themes</option>${[...new Set(S.map(s => s.th))].sort().map(x => `<option ${x === ST.th ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
      <select id="s2sec"><option value="">All sectors</option>${[...new Set(S.map(s => s.sec))].sort().map(x => `<option ${x === ST.sec ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
      <button type="button" class="s2-btn${ST.open ? ' pri' : ''}" id="s2f">Filters${act ? ' (' + act + ')' : ''} ${ST.open ? '▴' : '▾'}</button>
      <span class="s2-cnt">Showing <b>${L.length}</b> of ${S.length}</span></div>
    ${ST.open ? panel() : ''}
    <div class="s2-cols"><span class="l">Columns:</span>${GROUPS.map(gn => `<button type="button" data-grp="${esc(gn)}" class="${ST.hide.includes(gn) ? '' : 'on'}">${esc(gn)}</button>`).join('')}
      <span style="margin-left:auto;display:flex;gap:6px"><button type="button" class="s2-btn" style="height:30px;font-size:12px" data-paid="Saved screens" data-paid-sub="Save your filters and sorts as named screens, synced to your account on every device.">🔒 Save screen</button></span></div>
    <div class="s2-wrap"><table><thead><tr class="gr"><th></th>${grp.map(([n, k]) => `<th colspan="${k}">${esc(n)}</th>`).join('')}</tr><tr><th data-k="t">Stock ${arrow('t')}</th>${vis.map(c => `<th data-k="${c[0]}">${esc(c[1])}${arrow(c[0])}</th>`).join('')}</tr></thead>
    <tbody>${L.map(s => `<tr><td><a href="#/stock/${esc(s.t)}">${esc(s.t)}</a><small>${esc(s.n)}</small></td>${vis.map(c => `<td>${c[4](c[3](s), s)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${vis.length + 1}" style="text-align:center;padding:30px" class="muted">No stocks pass every filter. Clear a filter to see more.</td></tr>`}</tbody></table></div>
    <p class="muted" style="font-size:12px;margin:10px 0 0">Click a column to sort; Shift+click adds a second sort level. Filters inside a box are "any of"; different boxes must all pass. Numbers in brackets show how many stocks each choice leaves. Data as of the ${esc(X.dfmt ? X.dfmt(TW.asof) : TW.asof || '')} close; scores, ratings and estimates from the same sources as each stock's page. Not investment advice.</p>`;
}
function draw() {
  const box = $('#s2'); if (!box) return; const y = window.scrollY, sx = ($('.s2-wrap', box) || {}).scrollLeft || 0, openK = ($('details.s2-dd[open]', box) || {}).dataset;
  box.innerHTML = view(); window.scrollTo(0, y); const w = $('.s2-wrap', box); if (w) w.scrollLeft = sx; if (openK && openK.k) { const d = $(`details.s2-dd[data-k="${openK.k}"]`, box); if (d) d.open = true; }
  wire(box);
}
function wire(box) {
  $$('[data-pre]', box).forEach(b => b.onclick = () => { ST.pre = ST.pre === b.dataset.pre ? '' : b.dataset.pre; draw(); });
  const clr = $('[data-clear]', box); if (clr) clr.onclick = () => { Object.assign(ST, { q: '', th: '', sec: '', f: {}, cons: [], acc: [], pre: '' }); draw(); };
  $('#s2q', box).oninput = e => { ST.q = e.target.value; clearTimeout(window.__s2t); window.__s2t = setTimeout(() => { draw(); const q = $('#s2q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 250); };
  $('#s2th', box).onchange = e => { ST.th = e.target.value; draw(); }; $('#s2sec', box).onchange = e => { ST.sec = e.target.value; draw(); };
  $('#s2f', box).onclick = () => { ST.open = !ST.open; draw(); };
  $$('details.s2-dd', box).forEach(d => { d.addEventListener('toggle', () => { if (d.open) $$('details.s2-dd[open]', box).forEach(o => { if (o !== d) o.open = false; }); });
    $$('input[type=checkbox]', d).forEach(cb => cb.onchange = () => { const k = d.dataset.k, i = +cb.dataset.i, a = ST.f[k] = ST.f[k] || []; if (cb.checked) { if (!a.includes(i)) a.push(i); } else ST.f[k] = a.filter(x => x !== i); draw(); }); });
  $$('[data-cons]', box).forEach(b => b.onclick = () => { const v = b.dataset.cons; ST.cons = ST.cons.includes(v) ? ST.cons.filter(x => x !== v) : ST.cons.concat(v); draw(); });
  $$('[data-acc]', box).forEach(b => b.onclick = () => { const v = b.dataset.acc; ST.acc = ST.acc.includes(v) ? ST.acc.filter(x => x !== v) : ST.acc.concat(v); draw(); });
  $$('[data-grp]', box).forEach(b => b.onclick = () => { const v = b.dataset.grp; ST.hide = ST.hide.includes(v) ? ST.hide.filter(x => x !== v) : ST.hide.concat(v); save(); draw(); });
  $$('thead tr:not(.gr) th[data-k]', box).forEach(th => th.onclick = e => { const k = th.dataset.k, d0 = LOWFIRST.includes(k) || k === 't' ? 1 : -1, i = ST.sort.findIndex(x => x[0] === k);
    if (e.shiftKey) { if (i >= 0) ST.sort[i][1] *= -1; else ST.sort.push([k, d0]); ST.sort = ST.sort.slice(-3); } else ST.sort = i === 0 && ST.sort.length === 1 ? [[k, -ST.sort[0][1]]] : [[k, d0]]; save(); draw(); });
  if ($('#s2save', box)) $('#s2save', box).onclick = () => { const n = ($('#s2n', box).value || '').trim() || 'My screen ' + (mine().length + 1), M = mine(); M.push({ n, st: { q: ST.q, th: ST.th, sec: ST.sec, f: ST.f, cons: ST.cons, acc: ST.acc, pre: ST.pre, sort: ST.sort } }); try { localStorage.setItem('tw_scr2_saved', JSON.stringify(M.slice(-12))); } catch (e) {} draw(); };
  $$('[data-load]', box).forEach(b => b.onclick = () => { const m = mine()[+b.dataset.load]; if (m) { Object.assign(ST, JSON.parse(JSON.stringify(m.st))); draw(); } });
}
function mount() {
  if (!/^#\/screener\/?$/.test(location.hash)) return true;
  const tb = $('#app #tb'); if (!tb) return false; const sec = tb.closest('#app > section'); if (!sec || $('#s2')) return true;
  if (!$('#s2-css')) { const st = document.createElement('style'); st.id = 's2-css'; st.textContent = css; document.head.appendChild(st); }
  sec.innerHTML = `<div class="wrap"><div id="s2"></div></div>`; sec.style.paddingTop = '18px'; draw(); return true;
}
let n = 0, tm = 0; const kick = () => { clearTimeout(tm); n = 0; const go = () => { if (!mount() && n++ < 30) tm = setTimeout(go, 200); }; tm = setTimeout(go, 150); };
window.addEventListener('hashchange', kick); kick();
document.addEventListener('click', e => { if (!e.target.closest('details.s2-dd')) $$('#s2 details.s2-dd[open]').forEach(d => { d.open = false; }); });
window.TWSCR2 = { C, PRE, ST };
})();
