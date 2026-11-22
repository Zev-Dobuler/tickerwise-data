/* Tickerwise: compute every stock-card number exactly the way the report does (Zev, Nov 22, 2026: "I don't want anything using my Excel sheet
   anymore ... all data pulled from the stock-schwab-chart-list, and everything there pulled from online").
   Loads the report page (prep.py writes its files to /home/claude/tw2/page/) with this night's datasets (/home/claude/tw2/data/) in headless Chromium,
   then reads the report's own accessors window.__cardOv / window.__valOv / window.__zevScore for every stock (holdings and wish list alike)
   and writes /home/claude/tw2/data/cardov.json = {asof, F: {ticker: {field: [value, text]}}}. kit/bundles.py builds the site's numbers from it.
   Needs d3 7.9.0 from npm (run.sh installs it into /home/claude/tools) and the pre-installed Playwright. */
const fs = require('fs'), path = require('path');
const P = '/home/claude/tw2/page/', D = '/home/claude/tw2/data/';
const D3 = ['/home/claude/tools/node_modules/d3/dist/d3.min.js'].find(f => fs.existsSync(f));
if (!D3) { console.error('cardov: d3 not installed'); process.exit(1); }
const data = {}; for (const f of fs.readdirSync(D)) { if (!f.endsWith('.json') || f.slice(0, -5).includes('.')) continue; try { data[f.slice(0, -5)] = JSON.parse(fs.readFileSync(D + f, 'utf8')); } catch (e) {} }
/* every stock gets a latest price for the price-based numbers (Market Cap, Analyst Target %, the multiples): holdings from quotes, the rest from the wish list data */
const Q = data.quotes || [], have = new Set(Q.map(q => q.ticker)), px = {};
(data.wish || []).forEach(r => { if (r.k === 's' && r.px) px[r.t] = r.px; }); (data.wishx || []).forEach(r => { if (r.k === 't' && r.px && !px[r.ticker]) px[r.ticker] = r.px; });
const asof = (Q.find(q => q.as_of) || {}).as_of || new Date().toISOString();
Object.entries(px).forEach(([t, p]) => { if (!have.has(t)) Q.push({ ticker: t, price: p, as_of: asof }); }); data.quotes = Q;
const TK = new Set(Q.map(q => q.ticker)); (data.erscore || []).forEach(r => { if (r.ticker) TK.add(r.ticker); }); (data.tipranks_ta || []).forEach(r => { if (r.ticker) TK.add(r.ticker); });
let src = fs.readFileSync(P + 'index.html', 'utf8');
for (const f of ['bet.js', 'x.js', 'm.js', 'crashes.js']) if (fs.existsSync(P + f)) src = src.replace(`<script src="${f}"></script>`, () => '<script>' + fs.readFileSync(P + f, 'utf8').replace(/<\/script/g, '<\\/script') + '</script>');
src = src.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/d3\/[^"]*"><\/script>/g, '');
const stub = `(function(){const calcs={},memo={},cbs=[];window.dash={colors:['#2a78d6','#e0702b','#2fa36b'],loader(){},calc(id,o){calcs[id]=o},refresh(){},params(){return {}},setParams(){},resetParams(){},setLink(){},
data(id){if(calcs[id]){if(!memo[id]){const o=calcs[id];try{memo[id]={status:'ok',data:o.fn(...o.inputs.map(i=>dash.data(i).data))}}catch(e){memo[id]={status:'error',data:[],message:e.message}}}return memo[id]}const d=__D[id];return d===undefined?{status:'missing',data:[]}:{status:'ok',data:d}},
onData(cb){cbs.push(cb);setTimeout(cb,0)}};})();`;
const html = '<!doctype html><html><head><meta charset=utf-8><script>' + fs.readFileSync(D3, 'utf8') + '</script><script>window.__D=' + JSON.stringify(data).replace(/<\//g, '<\\/') + ';' + stub + '</script></head><body><div id="dash-root">' + src + '</div></body></html>';
const tmp = '/home/claude/tw2/work/cardov.html'; fs.mkdirSync(path.dirname(tmp), { recursive: true }); fs.writeFileSync(tmp, html);
const FIELDS = ['Zev Score', 'Zacks Score', 'Smart Score', 'Analyst Consensus', 'Analyst Price Target %', 'PEG Ratio', 'EPS Growth', 'P/E', 'Forward P/E', 'P/E Growth', 'P/S', 'Forward P/S', 'P/S Compression',
  'Revenue 1Y Growth', 'Revenue Forward 1Y CAGR', 'Y/Y Revenue Growth', 'Accelerating Growth', 'Gross Margin', 'Operating Margin', 'Net Profit Margin', 'Net Income 1Y Growth', 'Free Cash Flow Margin', 'Total Employees', 'Market Cap'];
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch(); const p = await b.newPage(); const err = [];
  p.on('pageerror', e => err.push(e.message)); await p.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await p.goto('file://' + tmp); await p.waitForFunction(() => window.__cardOv && window.__valOv && window.__zevScore, null, { timeout: 60000 });
  const out = await p.evaluate(([T, FL]) => { const F = {}, VAL = ['P/E', 'Forward P/E', 'P/S', 'Forward P/S', 'P/E Growth', 'EPS Growth', 'P/S Compression'];
    T.forEach(t => { const o = {}; FL.forEach(f => { let r = null; try { r = VAL.includes(f) ? window.__valOv(t, f) : window.__cardOv(t, f); } catch (e) {}
        if (r && (r.v != null || (r.txt && r.txt !== '—'))) o[f] = [r.v != null && isFinite(r.v) ? Math.round(r.v * 100) / 100 : null, r.txt || null]; });
      if (Object.keys(o).length) F[t] = o; }); return F; }, [[...TK], FIELDS]);
  await b.close();
  const n = Object.keys(out).length; fs.writeFileSync(D + 'cardov.json', JSON.stringify({ asof, F: out }));
  console.log('cardov', n, 'stocks;', err.length ? 'page errors: ' + err.slice(0, 3).join(' | ') : 'no page errors');
})().catch(e => { console.error('cardov failed:', e.message); process.exit(1); });
