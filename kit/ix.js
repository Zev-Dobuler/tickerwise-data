/* Tickerwise index universe (Nov 22, 2026): every S&P 500, Nasdaq-100 and Dow 30 stock, for the Market Heatmap index tabs and Home Market Movers.
   Two steps, each fire-and-forget like kit/nx.js (start it, poll window.__done / window.__total, read window.__OUT with get_page_text in <=45K slices):
   1. On a stockanalysis.com tab: pullIX() -> {read, T:{sym:[name, sector, marketCap $B, index bits (1 = S&P 500, 2 = Nasdaq-100, 4 = Dow 30), 1-day %]}}.
      Save as /home/claude/tw2/data/ix_raw.json.
   2. On a finance.yahoo.com tab: set window.IXT = Object.keys(ix_raw.T), then pullIXR() -> {sym:[1W %, 1M %, 3M %, YTD %, 1Y %]} (daily closes, 1 year).
      Save as /home/claude/tw2/data/ixr_raw.json. kit/ix.py merges both into nx_new.json key IX. */

window.pullIX = async () => { window.__done = 0; window.__total = 14; window.__OUT = null;
  const res = (d, i) => { const v = d[i]; if (Array.isArray(v)) return v.map(x => res(d, x)); if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = res(d, v[k]); return o; } return v; };
  const get = async (u, key) => { for (let k = 0; k < 4; k++) { try { const r = await fetch(u); if (r.ok) { const j = await r.json(); const n = j.nodes.find(x => x && x.data && x.data[0] && x.data[0][key] != null); if (n) return res(n.data, n.data[0][key]); } } catch (e) {} await new Promise(r => setTimeout(r, 1500 * (k + 1))); } return []; };
  const T = {}, BIT = { SP500: 1, NASDAQ100: 2, DOW30: 4 };
  for (const [u, b] of [['/list/sp-500-stocks/', 1], ['/list/nasdaq-100-stocks/', 2], ['/list/dow-jones-stocks/', 4]]) {
    for (const r of await get(u + '__data.json', 'stockData')) { const bits = (r.inIndex || []).reduce((a, x) => a | (BIT[x] || 0), b);
      T[r.s] = [r.n, null, r.marketCap ? +(r.marketCap / 1e9).toFixed(1) : null, (T[r.s] ? T[r.s][3] : 0) | bits, r.change != null ? +r.change : null]; }
    window.__done++; }
  for (const s of ['technology', 'healthcare', 'financials', 'consumer-discretionary', 'communication-services', 'industrials', 'consumer-staples', 'energy', 'utilities', 'real-estate', 'materials']) {
    for (const r of await get('/stocks/sector/' + s + '/__data.json', 'data')) if (T[r.s]) T[r.s][1] = r.sector; window.__done++; await new Promise(r => setTimeout(r, 400)); }
  window.__OUT = JSON.stringify({ read: new Date().toISOString().slice(0, 10), T }); return Object.keys(T).length; };

window.pullIXR = async () => { window.__done = 0; window.__total = IXT.length; window.__OUT = null; const o = {};
  const q = async u => { for (let k = 0; k < 3; k++) { try { const r = await fetch(u); if (r.ok) return await r.json(); } catch (e) {} await new Promise(r => setTimeout(r, 800)); } return null; };
  const go = async t => { const j = await q('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(t.replace('.', '-')) + '?range=1y&interval=1d');
    try { const R = j.chart.result[0], g = R.meta.gmtoffset, C = R.indicators.quote[0].close, D = []; R.timestamp.forEach((s, i) => { if (C[i] != null) D.push([Math.floor((s + g) / 86400), C[i]]); });
      const L = D[D.length - 1], at = d => { let p = D[0]; for (const x of D) { if (x[0] <= d) p = x; else break; } return p[1]; }, pc = b => b ? +((L[1] / b - 1) * 100).toFixed(1) : null;
      const y0 = Date.UTC(new Date(L[0] * 864e5).getUTCFullYear(), 0, 1) / 864e5 - 1;
      o[t] = [pc(at(L[0] - 7)), pc(at(L[0] - 30)), pc(at(L[0] - 91)), pc(at(y0)), D[0][0] <= L[0] - 360 ? pc(at(L[0] - 365)) : null]; } catch (e) {} window.__done++; };
  for (let i = 0; i < IXT.length; i += 6) await Promise.all(IXT.slice(i, i + 6).map(go));
  window.__OUT = JSON.stringify(o); return Object.keys(o).length; };
