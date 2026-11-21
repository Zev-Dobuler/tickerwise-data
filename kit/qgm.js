/* Tickerwise quarterly margins and valuation history from stockanalysis.com (same source for every stock).
   Set window.__GTK = [tickers] first; not awaited; result on window.__G as JSON
   {read, T: {t: {k: ["Oct 26", ...newest first, 10 quarters], gm: [...], fcf: [...], fpe: [...], ps: [...], c: [forward PE today, P/S today]}}}
   k = each quarter's period-end month; values line up with k (null when missing). */
(async () => {
  const TK = window.__GTK || [], out = {};
  const num = s => { s = String(s || '').replace(/[,%]/g, '').trim(); return /^[+-]?[\d.]+$/.test(s) ? +s : null; };
  const lbl = td => (td.textContent || '').trim().split(/\s{2,}/)[0].trim();
  const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WANT = { 'Gross Margin': 'gm', 'FCF Margin': 'fcf', 'Forward PE': 'fpe', 'PS Ratio': 'ps' };
  const get = async u => { for (let k = 0; k < 3; k++) { try { const r = await fetch(u); if (r.status === 404) return null; if (r.ok) return new DOMParser().parseFromString(await r.text(), 'text/html'); } catch (e) {} await new Promise(r => setTimeout(r, 900)); } return null; };
  const read = (d, o) => d && d.querySelectorAll('table').forEach(tb => { let keys = null, cur = false;
    tb.querySelectorAll('tr').forEach(tr => { const c = [...tr.querySelectorAll('td,th')]; if (!c.length) return; const l = lbl(c[0]);
      if (/^Fiscal Quarter/.test(l)) cur = c[1] && /Current/i.test(c[1].textContent);
      if (/^Period Ending/.test(l)) keys = c.slice(1).map((x, i) => { if (cur && i === 0) return null; const m = (x.textContent || '').match(/([A-Z][a-z]{2}) \d{1,2}, (\d{4})/); return m && MO.includes(m[1]) ? m[1] + ' ' + m[2].slice(2) : null; });
      const f = WANT[l]; if (f && keys && !o[f]) { const v = {}; c.slice(1).forEach((x, i) => { const n = num(x.textContent); if (keys[i] && n != null) v[keys[i]] = n; }); if (Object.keys(v).length) o[f] = v; }
    }); });
  const Q = String.fromCharCode(63) + 'p' + String.fromCharCode(61) + 'quarterly';
  const one = async t => {
    const b = '/stocks/' + t.toLowerCase().replace('.', '-') + '/financials/', o = {};
    read(await get(b + Q), o);
    const rd = await get(b + 'ratios/' + Q);
    if (rd) { read(rd, o); rd.querySelectorAll('table').forEach(tb => { const h = tb.querySelector('tr'); if (!h || !/Current/i.test(h.textContent)) return;
      tb.querySelectorAll('tr').forEach(tr => { const c = [...tr.querySelectorAll('td,th')]; if (c.length < 2) return; const f = WANT[lbl(c[0])];
        if ((f === 'fpe' || f === 'ps') && o[f]) { const n = num(c[1].textContent); if (n != null) o[f].cur = n; } }); }); }
    const K = [...new Set(['gm', 'fcf', 'fpe', 'ps'].flatMap(f => Object.keys(o[f] || {}).filter(x => x !== 'cur')))];
    const ord = x => { const [m, y] = x.split(' '); return +y * 12 + MO.indexOf(m); }; K.sort((a, b) => ord(b) - ord(a)); const k = K.slice(0, 10);
    if (!k.length) return;
    const r = { k: k }; ['gm', 'fcf', 'fpe', 'ps'].forEach(f => { if (o[f]) r[f] = k.map(x => o[f][x] != null ? o[f][x] : null); });
    r.c = [o.fpe && o.fpe.cur != null ? o.fpe.cur : null, o.ps && o.ps.cur != null ? o.ps.cur : null];
    out[t] = r;
  };
  const q = TK.slice();
  await Promise.all([0, 1, 2, 3].map(async () => { while (q.length) await one(q.shift()); }));
  window.__G = JSON.stringify({ read: new Date().toISOString().slice(0, 10), T: out });
})();
1
