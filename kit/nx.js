/* Tickerwise feature pulls (Nov 22, 2026). Run each block in Zev's Chrome on the site named, with window.TK = [all tickers from pub.json R].
   Each block is fire-and-forget: start it, poll window.__done === TK.length, then read window.__OUT (JSON) with get_page_text in <=45K slices
   (document.body.innerHTML='<main><article><pre id=o></pre></article></main>'; o.textContent=__OUT.slice(i*45000,(i+1)*45000)).
   Collect the outputs into /home/claude/tw2/data/nx_new.json as {read:'YYYY-MM-DD', SEA:{}, SEG:{}, SI:{}, CG:{}, ETF:{}, TH:{}, NEWS:{A,T}, CALL:{}} and run kit/nx.py (run.sh does).
   Same fields for every stock: holdings and wish list are pulled identically.
   ALSO EVERY RUN (added Nov 22, 2026, for the home page Market Movers, the Market Heatmap index tabs, Latest News and the S&P 500 forward P/E card):
   (1) INDEX UNIVERSE: follow the header of kit/ix.js (pullIX on a stockanalysis.com tab, then pullIXR on a finance.yahoo.com tab) and save
       /home/claude/tw2/data/ix_raw.json and ixr_raw.json. run.sh merges them (kit/ix.py).
   (2) LATEST NEWS: write /home/claude/tw2/data/top_raw.json = {"read": "<NY trading date>", "A": [[headline, source name, source URL, unix time of the source's publication], ...]}
       with the 15 to 20 most market-moving US stories of the last 24 hours (markets, Fed and rates, economic data, big company news, earnings, deals),
       newest first, from this run's own research plus a few web searches. LEGAL RULES (Zev, Nov 22, 2026: only content we are allowed to use):
       every headline is written in Tickerwise's own words (at most 14 words, facts only, no quotes, never a publisher's headline copied or lightly edited),
       never any article text, summary paragraphs or photos; each item links to the original source and names it. Prefer primary and official
       sources when they exist (federalreserve.gov, bls.gov, bea.gov, sec.gov, treasury.gov, the company's own press release or investor-relations page).
       No lifestyle, personal-finance advice columns or opinion pieces. run.sh adds stock tags (kit/top.py).
   (3) S&P 500 FORWARD P/E: from the newest FactSet Earnings Insight (the macro step already reads it) write /home/claude/tw2/data/spe_raw.json =
       {"v": forward 12-month P/E, "d": "<report date YYYY-MM-DD>", "a5": 5-year average, "a10": 10-year average, "src": "FactSet Earnings Insight, <Mon D, YYYY>"}.
       Use FactSet's exact published numbers; if the report can't be read, skip the file (the site keeps last week's numbers).
   Cadence: SEA (Yahoo) weekly; SI (Dataroma) and SEG (stockanalysis) weekly on Mondays; CG (Quiver), ETF (etfdb) and TH (MarketBeat) nightly. NEWS and CALL (Yahoo Finance) nightly. */

const sl = ms => new Promise(r => setTimeout(r, ms));
const rows = (d, sel) => [...d.querySelectorAll(sel || 'table tr')].map(r => [...r.cells].map(c => c.textContent.replace(/\s+/g, ' ').trim()));
const getDoc = async (u, tries) => { for (let k = 0; k < (tries || 5); k++) { const r = await fetch(u); if (r.status === 429 || r.status >= 500) { await sl(20000 * (k + 1)); continue; } if (r.status !== 200) return null; return new DOMParser().parseFromString(await r.text(), 'text/html'); } return null; };

/* --- SEA: finance.yahoo.com — 10y monthly closes -> [exchange, type, years, 12 x [avg %, % of years up, years] | null, first month]. Include '^GSPC'. --- */
window.pullSEA = async () => { const o = {}; window.__done = 0; const cur = new Date().toISOString().slice(0, 7);
  for (const t of TK.concat(['^GSPC'])) { try { const R = (await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(t) + '?range=10y&interval=1mo').then(x => x.json())).chart.result[0];
      const c = (R.indicators.adjclose && R.indicators.adjclose[0].adjclose) || R.indicators.quote[0].close, m = (R.timestamp || []).map((s, i) => [new Date(s * 1000).toISOString().slice(0, 7), c[i]]).filter(x => x[1] != null);
      const B = Array.from({ length: 12 }, () => []); for (let i = 1; i < m.length; i++) { if (m[i][0] >= cur) continue; B[+m[i][0].slice(5, 7) - 1].push((m[i][1] / m[i - 1][1] - 1) * 100); }
      o[t] = [R.meta.exchangeName, R.meta.instrumentType, Math.max(...B.map(b => b.length)), B.map(b => b.length ? [+(b.reduce((a, x) => a + x, 0) / b.length).toFixed(1), Math.round(b.filter(x => x > 0).length / b.length * 100), b.length] : null), m.length ? m[0][0] : null];
    } catch (e) {} window.__done++; } window.__OUT = JSON.stringify(o); };

/* --- SEG: stockanalysis.com — revenue by segment and by geography, up to 8 report periods, values in $M. Throttled (the site rate-limits). --- */
window.pullSEG = async () => { const o = {}; window.__done = 0;
  const P = v => { const m = (v || '').match(/^(-?[\d.,]+)([KMBT]?)$/); return m ? +(+m[1].replace(/,/g, '') * ({ '': 1, K: 1e3, M: 1e6, B: 1e9, T: 1e12 }[m[2]]) / 1e6).toFixed(1) : null; };
  const tb = async u => { const d = await getDoc(u, 6); const t = d && d.querySelector('table'); if (!t) return null; const R = [...t.rows].map(r => [...r.cells].map(c => c.textContent.replace(/\s+/g, ' ').trim()));
    const seen = new Set(), out = []; for (const r of R.slice(1)) { if (seen.has(r[0])) continue; seen.add(r[0]); out.push([r[0], ...r.slice(1).map(P)]); if (out.length >= 8) break; } return [R[0].slice(1), out]; };
  for (const t of TK) { const s = t.toLowerCase(); const a = await tb('/stocks/' + s + '/metrics/revenue-by-segment/'); await sl(2500); const b = await tb('/stocks/' + s + '/metrics/revenue-by-geography/'); await sl(2500); if (a || b) o[t] = { s: a, g: b }; window.__done++; }
  window.__OUT = JSON.stringify(o); };

/* --- SI: dataroma.com — superinvestor 13F holders -> [count, '% of all portfolios', 'hold price', top 10 [manager, % of portfolio, activity, shares]]. --- */
window.pullSI = async () => { const o = {}; window.__done = 0;
  for (const t of TK) { const d = await getDoc('/m/stock.php?sym=' + t.replace('-', '.')); if (d) { const kv = {}; rows(d, '#t1 tr').forEach(c => { if (c.length >= 2) kv[c[0]] = c[1]; }); const g = d.querySelector('#grid');
      o[t] = [+(kv['Ownership count:'] || 0), kv['% of all portfolios:'] || null, kv['Hold Price * :'] || null, g ? [...g.rows].slice(1, 11).map(r => [...r.cells].slice(1).map(c => c.textContent.replace(/\s+/g, ' ').trim())).map(r => [r[0], +r[1] || 0, r[2] || '', r[3] || '']) : []]; }
    window.__done++; await sl(800); } window.__OUT = JSON.stringify(o); };

/* --- CG: quiverquant.com — Congress trades in the last 12 months -> [purchases, sales, latest 8 [P/S/O, amount range, member, H/S, party, traded date]]. --- */
window.pullCG = async () => { const o = {}; window.__done = 0; const cut = new Date(Date.now() - 365 * 864e5), dd = s => { const d = new Date(s); return isNaN(d) ? null : d.toISOString().slice(0, 10); };
  for (const t of TK) { const d = await getDoc('/congresstrading/stock/' + t.replace('-', '.'), 4); if (d) { const R = rows(d).slice(1).filter(c => c.length >= 5).map(r => { const a = r[1].match(/^(\w+)\s*(.*)$/) || [], p = r[2].match(/^(.*?)\s+(House|Senate)\s*\/\s*(\w)$/) || [];
        return [/^Purch/i.test(a[1] || '') ? 'P' : /^Sale/i.test(a[1] || '') ? 'S' : 'O', (a[2] || '').replace(/\$/g, ''), p[1] || r[2], (p[2] || '')[0] || '', p[3] || '', dd(r[4]) || dd(r[3])]; }).filter(r => r[5] && new Date(r[5]) >= cut);
      o[t] = [R.filter(r => r[0] === 'P').length, R.filter(r => r[0] === 'S').length, R.slice(0, 8)]; } window.__done++; await sl(2500); } window.__OUT = JSON.stringify(o); };

/* --- ETF: etfdb.com — ETFs holding the stock -> [number of ETFs, top 6 [ticker, name, expense ratio %, weight %]]. --- */
window.pullETF = async () => { const o = {}; window.__done = 0;
  for (const t of TK) { const d = await getDoc('/stock/' + t.replace('-', '.') + '/'); if (d) { const n = (d.body.textContent.match(/(\d[\d,]*) ETFs with exposure/) || [])[1];
      const R = rows(d).slice(1).filter(c => c.length === 5).slice(0, 6).map(r => [r[0], r[1].replace(/ ETF$/, '').slice(0, 36), r[3].replace('%', ''), r[4].replace('%', '')]); if (R.length) o[t] = [n ? +n.replace(/,/g, '') : null, R]; }
    window.__done++; await sl(500); } window.__OUT = JSON.stringify(o); };

/* --- TH: marketbeat.com — analyst target history. window.MX = {ticker: 'NASDAQ'|'NYSE'|'NYSEAMERICAN'} for stocks (from SEA exchange codes NMS/NGM/NCM -> NASDAQ, NYQ -> NYSE, ASE -> NYSEAMERICAN; skip ETFs).
   For each of the last 12 month-ends and today: average of each firm's latest target dated within the prior 365 days -> [[date, avg, firms]]. kit/nx.py keeps points with 3+ firms. --- */
window.pullTH = async () => { const o = {}; window.__done = 0; const now = new Date(), ends = [];
  for (let k = 12; k >= 1; k--) ends.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - k + 1, 0))); ends.push(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
  for (const [t, ex] of Object.entries(MX)) { const d = await getDoc('/stocks/' + ex + '/' + t.replace('-', '.') + '/forecast/'); if (d) { let R = [];
      for (const tb of d.querySelectorAll('table')) { const h = (tb.rows[0] ? tb.rows[0].textContent : '').replace(/\s+/g, ' '); if (/DATE/i.test(h) && /BROKERAGE/i.test(h) && /PRICE TARGET/i.test(h)) { R = [...tb.rows].slice(1).map(r => [...r.cells].map(c => c.textContent.replace(/\s+/g, ' ').trim())); break; } }
      const X = R.filter(c => c.length >= 6).map(c => { const m = (c[5] || '').match(/\$([\d,.]+)\s*$/), [mm, dd, yy] = c[0].split('/').map(Number); return { d: new Date(Date.UTC(yy, mm - 1, dd)), f: c[1].replace(/\d of 5 stars/, '').replace(/Subscribe to MarketBeat.*$/, '').trim(), tg: m ? +m[1].replace(/,/g, '') : null }; }).filter(r => r.tg && !isNaN(r.d));
      const pts = []; for (const e of ends) { const lo = new Date(e - 365 * 864e5), lat = {}; X.forEach(r => { if (r.d <= e && r.d >= lo && (!lat[r.f] || r.d > lat[r.f].d)) lat[r.f] = r; }); const L = Object.values(lat); if (L.length >= 2) pts.push([e.toISOString().slice(0, 10), +(L.reduce((a, b) => a + b.tg, 0) / L.length).toFixed(2), L.length]); }
      if (pts.length >= 3) o[t] = pts; } window.__done++; await sl(700); } window.__OUT = JSON.stringify(o); };

/* --- NEWS: finance.yahoo.com — latest 3 stories per stock with photos, de-duplicated -> {A:[[title, publisher, link (minus https://finance.yahoo.com/), unix time, image ('~' = https://media.zenfs.com/en/)]], T:{ticker:[index]}}. Links open the source. --- */
window.pullNEWS = async () => { const A = [], ix = {}, T = {}; window.__done = 0;
  for (const t of TK) { try { const r = await fetch('https://query1.finance.yahoo.com/v1/finance/search?q=' + encodeURIComponent(t) + '&newsCount=12&quotesCount=0&enableFuzzyQuery=false').then(x => x.json());
      const L = (r.news || []).filter(n => (n.relatedTickers || []).includes(t) && n.type === 'STORY').slice(0, 3); if (L.length) T[t] = L.map(n => { if (ix[n.link] == null) { const R = (n.thumbnail && n.thumbnail.resolutions) || [], o = R.find(x => x.tag === 'original'); ix[n.link] = A.length; A.push([n.title, n.publisher, n.link.replace('https://finance.yahoo.com/', ''), n.providerPublishTime, o ? o.url.replace('https://media.zenfs.com/en/', '~') : '']); } return ix[n.link]; });
    } catch (e) {} window.__done++; await sl(350); } window.__OUT = JSON.stringify({ A, T }); };

/* --- CALL: finance.yahoo.com — latest earnings-call coverage per stock (highlights first, then transcript), last 130 days -> {ticker: [[title, publisher, link, unix time, image]] (up to 2)}. --- */
window.pullCALL = async () => { const o = {}; window.__done = 0; const cut = Date.now() / 1000 - 130 * 86400;
  for (const t of TK) { try { const r = await fetch('https://query1.finance.yahoo.com/v1/finance/search?q=' + encodeURIComponent(t) + '&newsCount=30&quotesCount=0&enableFuzzyQuery=false').then(x => x.json());
      const L = (r.news || []).filter(n => (n.relatedTickers || []).includes(t) && /earnings call|call transcript|call highlights/i.test(n.title) && n.providerPublishTime > cut).sort((a, b) => (/highlights/i.test(b.title) - /highlights/i.test(a.title)) || b.providerPublishTime - a.providerPublishTime).slice(0, 2)
        .map(n => { const R = (n.thumbnail && n.thumbnail.resolutions) || [], o2 = R.find(x => x.tag === 'original'); return [n.title, n.publisher, n.link.replace('https://finance.yahoo.com/', ''), n.providerPublishTime, o2 ? o2.url.replace('https://media.zenfs.com/en/', '~') : '']; });
      if (L.length) o[t] = L; } catch (e) {} window.__done++; await sl(300); } window.__OUT = JSON.stringify(o); };
