import os
"""Split the skill's published data into a sibling-safe public bundle and a private (portfolio) bundle."""
import json, glob, os, sys
B = '/home/claude/tw2/'; D = B + 'data/'; W = B + 'work/'
OUT = sys.argv[1] if len(sys.argv) > 1 else B + 'prev/'
L = lambda n: json.load(open(D + n + '.json'))
rows = json.load(open(W + 'rows.json')); meta = json.load(open(W + 'meta.json'))
xj = json.load(open(W + 'x.json')); MK = json.load(open(W + 'mk.json'))
schwab = L('schwab'); H = [r['Tickers'] for r in schwab]; HS = set(H)

# ---- public stock rows: alphabetical, holdings-only fields removed ----
rows.sort(key=lambda r: r[0])
priv_run = {}
for r in rows:
    if r[14]: priv_run[r[0]] = r[14]
    r[14] = 0
# held ETFs: give them the same depth as wish-list ETFs so they don't stand out
_fin = {r['ticker'] for r in L('fincharts')}; _er = {r['ticker'] for r in L('erscore') if r.get('k') == 't' and r.get('ticker')}
HETF = [t for t in H if t not in _fin and t not in _er]
for r in rows:
    if r[0] in HETF:
        r[6][2] = r[6][3] = r[6][5] = None; r[13] = 0
X = xj['X']; priv_x = {}
for t, v in X.items():
    for k in ('nw', 'v', 'bs'):
        if k in v: priv_x.setdefault(t, {})[k] = v.pop(k)
for t in HETF: X.pop(t, None)
X = {t: v for t, v in X.items() if v}

FK = ['Zev Score', 'Zacks Score', 'Smart Score', 'Analyst Consensus', 'Analyst Price Target %', 'PEG Ratio', 'EPS Growth', 'P/E', 'Forward P/E',
      'P/E Growth', 'P/S', 'Forward P/S', 'P/S Growth', 'Revenue 1Y Growth', 'Revenue Forward 1Y CAGR', 'Y/Y Revenue Growth', 'Accelerating Growth',
      'Operating Margin', 'Net Profit Margin', 'Net Income 1Y Growth', 'Free Cash Flow Margin', 'Total Employees', 'Market Cap', 'Next ER Date']
F = {}
for r in L('fundamentals'):
    o = {}
    for k in FK:
        v = r.get(k)
        if v in (None, '', '-'): continue
        o[k] = [v, r.get(k + ' Fill'), r.get(k + ' Font')]
    if o: F[r['ticker']] = o

# Fill gaps for wish-list stocks not in Zev's sheet (Nov 21, 2026): Smart Score, consensus and target from TipRanks, Zacks Rank from Zacks (no Excel colors; Zev Score stays blank).
_px = {r['t']: r.get('px') for r in L('wish') if r.get('k') == 's'}
for r in L('wishx'):
    if r.get('k') == 't' and r.get('px'): _px.setdefault(r['ticker'], r['px'])
for r in L('wishx'):
    t = r.get('ticker'); o = F.get(t, {}); k = r.get('k')
    if k == 'ta':
        if r.get('smart') is not None and 'Smart Score' not in o: o['Smart Score'] = [r['smart'], None, None]
        if r.get('consensus') and 'Analyst Consensus' not in o: o['Analyst Consensus'] = [r['consensus'], None, None]
        if r.get('target') and _px.get(t) and 'Analyst Price Target %' not in o: o['Analyst Price Target %'] = [round((r['target'] / _px[t] - 1) * 100, 2), None, None]
    elif k == 't':
        zr = ((r.get('zk') or {}).get('rank') or '')[:1]
        if zr.isdigit() and 'Zacks Score' not in o: o['Zacks Score'] = [int(zr), None, None]
    if o and t: F[t] = o

MARKET = ['rates', 'spx', 'fear', 'gold', 'fedodds', 'since2000', 'bets', 'breadth', 'sectors', 'recess', 'macro', 'midterm', 'crashes', 'updates']
alld = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(D + '*.json')}
dpub = {k: alld[k] for k in MARKET if k in alld}
dpub['options'] = [r for r in alld['options'] if r.get('k') != 'h' or r.get('t') in ('SPY', 'QQQ')]
dpriv = alld

pub = {'asof': meta['asof'], 'sectors': meta['sectors'], 'RK': meta['RK'], 'R': rows, 'X': X, 'BENCH': xj['BENCH'], 'MK': MK, 'F': F}
# Analyst forecast block (same TipRanks fields for every stock): target range, rating counts, latest actions
_D = '/home/claude/tw2/data/'
_an = {}
def _anrow(a):
    if not a or not a.get('n'): return None
    tx = [[x.get('firm') or '', x.get('name') or '', x.get('pos') or '', x.get('act') or '', x.get('pt'), x.get('date')] for x in (a.get('tx') or [])[:6]]  # 6 = what every stock has today (wish list keeps 6); raise only when all stocks keep more
    return [a.get('avg'), a.get('high'), a.get('low'), a.get('n'), a.get('buy'), a.get('hold'), a.get('sell'), a.get('consensus'), a.get('read'), a.get('total12'), tx]
try:
    for r in json.load(open(_D + 'tipranks_ta.json')):
        v = _anrow(r.get('an'))
        if v: _an[r['ticker']] = v
except Exception: pass
try:
    for r in json.load(open(_D + 'wishx.json')):
        if r.get('k') == 'ta' and r['ticker'] not in _an:
            v = _anrow(r.get('an'))
            if v: _an[r['ticker']] = v
except Exception: pass
_names = {r[0] for r in rows}
pub['AN'] = {k: v for k, v in _an.items() if k in _names}
# Long-run quality stats (stockanalysis.com statistics + annual financials), same fields for every stock
_R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_qp = _D + 'qstats.json' if os.path.exists(_D + 'qstats.json') else os.path.join(_R, 'qs.json')
if os.path.exists(_qp):
    _q = json.load(open(_qp)); pub['QS'] = {k: v for k, v in _q.get('T', {}).items() if k in _names}; pub['QSd'] = _q.get('read')
# Bull and bear case written nightly for every stock
_bp = _D + 'bullbear.json' if os.path.exists(_D + 'bullbear.json') else os.path.join(_R, 'bb.json')
if os.path.exists(_bp):
    _b = json.load(open(_bp)); pub['BB'] = {k: v for k, v in _b.get('T', {}).items() if k in _names}; pub['BBd'] = _b.get('read')
# Zacks Style Scores + Industry Rank (kit/zs.js), same fields for every stock
_zp = _D + 'zstyle.json' if os.path.exists(_D + 'zstyle.json') else os.path.join(_R, 'zs.json')
if os.path.exists(_zp):
    _z = json.load(open(_zp)); pub['ZS'] = {k.replace('.', '-'): v for k, v in _z.get('T', {}).items() if k.replace('.', '-') in _names}; pub['ZSd'] = _z.get('read')
# Quarterly gross margin, FCF margin, forward P/E and P/S history (kit/qgm.js + kit/qh.py), same source for every stock
_hp = _D + 'qhist.json' if os.path.exists(_D + 'qhist.json') else os.path.join(_R, 'qh.json')
if os.path.exists(_hp):
    _h = json.load(open(_hp)); pub['QH'] = {k: v for k, v in _h.get('T', {}).items() if k in _names}; pub['QHd'] = _h.get('read')
# What's Happening: 30-day event log + summary written nightly for every stock (kit/wh.py)
_wp = _D + 'whatsup.json' if os.path.exists(_D + 'whatsup.json') else os.path.join(_R, 'wh.json')
if os.path.exists(_wp):
    _w = json.load(open(_wp)); pub['WH'] = {k: v for k, v in _w.get('T', {}).items() if k in _names}; pub['WHd'] = _w.get('read')
# New features (Nov 22, 2026): seasonality, segments, superinvestors, congress, ETF holders, analyst target history (kit/nx.js + kit/nx.py), same for every stock
_np = _D + 'nx.json' if os.path.exists(_D + 'nx.json') else os.path.join(_R, 'nx.json')
if os.path.exists(_np):
    _n = json.load(open(_np)); _nn = _names | {'^GSPC'}
    pub['NX'] = {k: ({t: v for t, v in _n[k].items() if t in _nn} if isinstance(_n.get(k), dict) and k != 'd' else _n.get(k)) for k in _n}
# price history for every stock in one identical format (kit/bp.py)
if os.path.exists('/home/claude/tw2/data/twpx.json'):
    _px = json.load(open('/home/claude/tw2/data/twpx.json')); _px['T'] = {k: v for k, v in _px['T'].items() if k in {r[0] for r in rows}}; pub['PX'] = _px
# One analyst-upside number everywhere: TipRanks average target vs the latest close (the same close the site shows),
# so the sheet's "Analyst Price Target %" (read at an earlier price) never disagrees with the Analyst Upside box.
try:
    if pub.get('PX') and pub.get('AN') and pub.get('F'):
        for _t, _a in pub['AN'].items():
            _p = pub['PX']['T'].get(_t)
            if not _p or not _a or not _a[0] or _t not in pub['F']: continue
            _last = sum(_p[4]) * 10 ** _p[0]
            if _last > 0:
                _f = pub['F'][_t].get('Analyst Price Target %') or [None, None, None]
                _v = round((_a[0] / _last - 1) * 100, 2)
                pub['F'][_t]['Analyst Price Target %'] = [_v, _f[1], '#00B050' if _v > 0 else '#FF0000' if _v < 0 else None]
except Exception as _e:
    print('analyst upside sync skipped:', _e)
priv = {'H': H, 'schwab': schwab, 'run': priv_run, 'X': priv_x, 'D': dpriv, 'page': open(B + 'prev/report_inline.html').read()}
for n, o in (('pub', pub), ('priv', priv)):
    s = json.dumps(o, separators=(',', ':'), ensure_ascii=False)
    open(OUT + n + '.json', 'w').write(s); print(n, len(s))
# leak check: no holdings-only marker in public
pubs = json.dumps(pub)
for w in ('Holdings Value', '% Holdings', 'Purchase Price', 'Shares Owned'):
    assert w not in pubs, w
print('public stocks', len(rows), 'holdings', len(H), 'market datasets', sorted(dpub))
