/* Tickerwise long-term quality stats. Run on a stockanalysis.com tab with javascript_tool after setting window.__QTK = [tickers].
   Stores the result on window.__Q (JSON string) and returns its length. Same fields for every stock. */
(async () => {
  const TK = window.__QTK || [];
  const num = s => { if (s == null) return null; s = String(s).replace(/[,%x$]/g, '').trim(); if (!s || s === '-' || /n\/a/i.test(s)) return null; const m = s.match(/^([+-]?[\d.]+)([KMBT])?$/); if (!m) return null; return +m[1] * ({ K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[m[2]] || 1); };
  const lbl = td => (td.textContent || '').trim().split(/\s{2,}/)[0].trim();
  const get = async u => { for (let k = 0; k < 3; k++) { try { const r = await fetch(u); if (r.ok) return new DOMParser().parseFromString(await r.text(), 'text/html'); if (r.status === 404) return null; } catch (e) {} await new Promise(r => setTimeout(r, 800)); } return null; };
  const S = { roe: /^Return on Equity/, roa: /^Return on Assets/, roic: /^Return on Invested Capital/, sh1: /^Shares Change \(YoY\)/, eve: /^EV \/ EBITDA/, pfcf: /^P\/FCF Ratio/, pb: /^PB Ratio/, de: /^Debt \/ Equity/, ic: /^Interest Coverage/, cr: /^Current Ratio/, z: /^Altman Z-Score/, f: /^Piotroski F-Score/ };
  const cagr = (a, b, n) => a > 0 && b > 0 ? Math.round((Math.pow(a / b, 1 / n) - 1) * 1000) / 10 : null;
  const out = {};
  for (const t of TK) {
    const base = (/^[A-Z.\-]+$/.test(t) ? '/stocks/' : '/etf/') + t.toLowerCase().replace('.', '-') + '/';
    const row = {};
    const st = await get(base + 'statistics/');
    if (st) st.querySelectorAll('tr').forEach(tr => { const c = tr.querySelectorAll('td'); if (c.length < 2) return; const l = lbl(c[0]); for (const k in S) if (row[k] === undefined && S[k].test(l)) row[k] = num(c[c.length - 1].textContent); });
    const fi = await get(base + 'financials/');
    if (fi) {
      const tb = fi.querySelector('table');
      if (tb) {
        const hd = [...tb.querySelectorAll('thead tr:first-child th')].map(x => (x.textContent || '').trim());
        const fyc = hd.map((h, i) => /^FY\s?\d{4}/.test(h) ? i : -1).filter(i => i > 0);
        const R = {};
        tb.querySelectorAll('tbody tr').forEach(tr => { const c = tr.querySelectorAll('td'); if (!c.length) return; const l = lbl(c[0]); if (l === 'Revenue' && !R.r) R.r = c; if (/^Earnings Per Share|^EPS \(Diluted\)/.test(l) && !R.e) R.e = c; });
        if (fyc.length) {
          row.fy = hd[fyc[0]].match(/FY\s?\d{4}/)[0].replace('FY', 'FY ').replace('  ', ' ');
          row.fy0 = hd[fyc[fyc.length - 1]].match(/FY\s?\d{4}/)[0].replace('FY', 'FY ').replace('  ', ' ');
          const v = (c, j) => c && fyc[j] != null ? num(c[fyc[j]].textContent) : null;
          row.r3 = cagr(v(R.r, 0), v(R.r, 3), 3); row.r4 = cagr(v(R.r, 0), v(R.r, 4), 4);
          row.e3 = cagr(v(R.e, 0), v(R.e, 3), 3); row.e4 = cagr(v(R.e, 0), v(R.e, 4), 4);
        }
      }
    }
    if (Object.values(row).some(x => x != null)) out[t] = row;
  }
  window.__Q = JSON.stringify({ read: new Date().toISOString().slice(0, 10), T: out });
  return window.__Q.length;
})()
