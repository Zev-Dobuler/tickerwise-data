"""Market-wide data for the Tickerwise Markets hub (no stock prices: % changes, rates, indicators, rebased series)."""
import json
R = '/home/claude/tw2/data/'
OUT = '/home/claude/tw2/work/'
m = {r['k']: r for r in json.load(open(R + 'macro.json'))}
sec = json.load(open(R + 'sectors.json'))
r2 = lambda v, d=2: None if v is None else round(v, d)
K = {}
K['asof'] = m['meta']['asof']

# ---------- global markets: % changes only ----------
yh, fx = m['yh']['d'], m['fx']['d']
def chg(sym, src=None):
    v = (src or yh).get(sym)
    if not v or not isinstance(v, dict): return None
    c = v.get('c') or {}
    return [v.get('n'), [r2(c.get(k), 1) for k in ['d', 'w', 'm', 'q', 'ytd', 'y']]]
GROUPS = [
    ['United States', ['^GSPC', '^IXIC', '^DJI', '^RUT', 'RSP']],
    ['Futures', ['ES=F', 'NQ=F', 'YM=F', 'RTY=F']],
    ['Europe', ['^STOXX50E', '^GDAXI', '^FTSE', '^FCHI']],
    ['Asia & Middle East', ['^N225', '^HSI', '000001.SS', '^KS11', '^TWII', '^BSESN', '^TA125.TA']],
    ['Emerging Markets & China', ['EEM', 'FXI', 'KWEB', 'EWT']],
]
NAMES = {'^GSPC': 'S&P 500', '^IXIC': 'Nasdaq Composite', '^DJI': 'Dow Jones', '^RUT': 'Russell 2000', 'RSP': 'S&P 500 Equal Weight', 'ES=F': 'S&P 500 futures', 'NQ=F': 'Nasdaq 100 futures',
         'YM=F': 'Dow futures', 'RTY=F': 'Russell 2000 futures', '^STOXX50E': 'Euro Stoxx 50', '^GDAXI': 'Germany DAX', '^FTSE': 'UK FTSE 100', '^FCHI': 'France CAC 40', '^N225': 'Japan Nikkei 225',
         '^HSI': 'Hong Kong Hang Seng', '000001.SS': 'Shanghai Composite', '^KS11': 'South Korea KOSPI', '^TWII': 'Taiwan TAIEX', '^BSESN': 'India Sensex', '^TA125.TA': 'Israel TA-125',
         'EEM': 'Emerging Markets (EEM)', 'FXI': 'China Large-Cap (FXI)', 'KWEB': 'China Internet (KWEB)', 'EWT': 'Taiwan (EWT)',
         'BZ=F': 'Brent crude oil', 'CL=F': 'WTI crude oil', 'NG=F': 'Natural gas', 'GC=F': 'Gold', 'SI=F': 'Silver', 'HG=F': 'Copper', 'URA': 'Uranium miners (URA)', 'BDRY': 'Dry-bulk shipping (BDRY)',
         'ITA': 'Aerospace & Defense (ITA)', 'DX-Y.NYB': 'US Dollar Index', 'CNY=X': 'US dollar vs Chinese yuan', 'TWD=X': 'US dollar vs Taiwan dollar', 'JPY=X': 'US dollar vs Japanese yen',
         'EURUSD=X': 'Euro vs US dollar', 'BTC-USD': 'Bitcoin', 'GLD': 'Gold ETF (GLD)', '^VIX': 'VIX (S&P 500 volatility)', '^VIX3M': 'VIX 3-month', '^MOVE': 'MOVE (bond volatility)',
         'HYG': 'High-yield bonds (HYG)', 'IEF': '7–10 yr Treasuries (IEF)', 'SOXX': 'Semiconductors (SOXX)', 'XLE': 'Energy (XLE)', 'TAN': 'Solar (TAN)'}
def row(sym):
    c = chg(sym) or chg(sym, fx)
    return [sym, NAMES.get(sym, c[0] if c else sym), c[1] if c else None] if c else None
K['glob'] = [[g, [x for x in (row(s) for s in L) if x]] for g, L in GROUPS]
K['fx'] = [x for x in (row(s) for s in ['DX-Y.NYB', 'EURUSD=X', 'JPY=X', 'CNY=X', 'TWD=X', 'BTC-USD']) if x]
K['cmd'] = [x for x in (row(s) for s in ['BZ=F', 'CL=F', 'NG=F', 'GC=F', 'SI=F', 'HG=F', 'URA', 'BDRY', 'ITA']) if x]
K['vol'] = [x for x in (row(s) for s in ['^VIX', '^VIX3M', '^MOVE', 'HYG', 'IEF']) if x]
# rebased 2-year weekly paths (start = 0%)
def rebased_w(sym):
    v = yh.get(sym, {}).get('w') or []
    if len(v) < 3: return None
    base = v[1]
    return [v[0], [round((x / base - 1) * 100, 1) if x else None for x in v[1:]]]
K['gpath'] = {s: rebased_w(s) for s in ['^GSPC', '^IXIC', '^STOXX50E', '^N225', '^HSI', 'EEM', '^TA125.TA']}

# ---------- rates & Fed ----------
fd = m['fred']['d']
def mser(k, d=1, since='200001'):
    a = fd[k]['m']; start = a[0]; vals = a[1:]
    # drop months before `since`
    y, mo = int(start[:4]), int(start[4:])
    out = []
    for v in vals:
        if '%04d%02d' % (y, mo) >= since: out.append(r2(v, d))
        mo += 1
        if mo > 12: y += 1; mo = 1
    first = since if start < since else start
    return [first, out]
def latest(k):
    l = fd[k].get('l'); return [l[0], r2(l[1], 3)] if l else None
RATES = ['DFF', 'DGS3MO', 'DGS2', 'DGS10', 'T10Y2Y', 'T10Y3M', 'DFII10', 'T5YIE', 'BAMLH0A0HYM2', 'BAMLC0A0CM', 'VIXCLS', 'NFCI', 'STLFSI4', 'SAHMREALTIME', 'UNRATE', 'ICSA',
         'UMCSENT', 'USALOLITONOSTSAM', 'WALCL', 'RRPONTSYD', 'DCOILBRENTEU', 'GEPUCURRENT', 'M2SL', 'CPIAUCSL', 'PAYEMS', 'INDPRO', 'HOUST', 'PERMIT', 'DTWEXBGS', 'WTREGEN']
K['fl'] = {k: latest(k) for k in RATES if k in fd}
K['fm'] = {k: mser(k) for k in ['DFF', 'DGS2', 'DGS10', 'T10Y3M', 'UNRATE', 'SAHMREALTIME', 'VIXCLS', 'USALOLITONOSTSAM']}
K['fm']['ICSA'] = [mser('ICSA', 0)[0], [None if v is None else round(v / 1000) for v in mser('ICSA', 0)[1]]]
K['fm']['WALCL'] = [mser('WALCL', 0, '200301')[0], [None if v is None else round(v / 1e6, 2) for v in mser('WALCL', 0, '200301')[1]]]  # $ trillions
cpi = mser('CPIAUCSL', 2, '199901')
K['fm']['CPIY'] = ['200001', [r2((cpi[1][i] / cpi[1][i - 12] - 1) * 100, 1) if cpi[1][i] and cpi[1][i - 12] else None for i in range(12, len(cpi[1]))]]
ip = mser('INDPRO', 2, '199901')
K['fm']['INDY'] = ['200001', [r2((ip[1][i] / ip[1][i - 12] - 1) * 100, 1) if ip[1][i] and ip[1][i - 12] else None for i in range(12, len(ip[1]))]]
K['fomc'] = m['cal'].get('fomc') or []
K['opex'] = m['cal'].get('opex') or []

# ---------- sentiment ----------
fg = m['fg']['d']
F = fg['fear_and_greed']
K['fg'] = {'s': r2(F['score'], 0), 'r': F['rating'], 't': F['timestamp'][:10], 'pc': r2(F['previous_close'], 0), 'pw': r2(F['previous_1_week'], 0), 'pm': r2(F['previous_1_month'], 0), 'py': r2(F['previous_1_year'], 0),
           'h': [fg['fear_and_greed_historical']['w'][0], [r2(x, 0) for x in fg['fear_and_greed_historical']['w'][1:]]],
           'comp': [[k, r2(fg[k]['score'], 0), fg[k]['rating']] for k in ['market_momentum_sp500', 'stock_price_strength', 'stock_price_breadth', 'put_call_options', 'market_volatility_vix', 'junk_bond_demand', 'safe_haven_demand']],
           'pcr': [fg['put_call_options']['w'][0], [r2(x, 2) for x in fg['put_call_options']['w'][1:]]]}
a = m['aaii']['d']
K['aaii'] = {'rows': a['rows'][-26:], 'avg': a['avg']}
K['margin'] = [[r[0], round(r[1] / 1000)] for r in m['margin']['d'] if r[1] and (r[0][5:] in ('03','06','09','12') or r[0] >= '2025-01')]  # $ billions, monthly
mmf = m['mmf']['d']['WRMFNS']['m']
K['mmf'] = [[r[0][:7], r[1]] for r in mmf[::4]] + ([[mmf[-1][0][:7], mmf[-1][1]]] if (len(mmf) - 1) % 4 else [])  # $ billions retail MMF, ~monthly

# ---------- breadth ----------
hist = {h['f']: h for h in sec if h['k'] == 'hist'}
dd, dv = hist['d']['dates'], hist['d']['v']
def ratio(a, b):
    return [round((dv[a][i] / dv[b][i]) / (dv[a][0] / dv[b][0]) * 100 - 100, 1) for i in range(len(dd))]
K['br'] = {'d0': dd[0], 'n': len(dd), 'rsp': ratio('RSP', 'SPY'), 'iwm': ratio('IWM', 'SPY'),
           'str': [fg['stock_price_strength']['w'][0], [r2(x, 1) for x in fg['stock_price_strength']['w'][1:]]],
           'mcv': [fg['stock_price_breadth']['w'][0], [r2(x, 0) for x in fg['stock_price_breadth']['w'][1:]]]}
etf = [r for r in sec if r['k'] == 'etf']
K['sec'] = [[r['t'], r['name'], r2(r['w1'], 1), r2(r['m1'], 1), r2(r['m3'], 1), r2(r['m6'], 1), r2(r['ytd'], 1), r2(r['y1'], 1)] for r in etf]

# ---------- regime & recession ----------
rg = m['regime']
K['rg'] = {'h': [[x[0], x[1]] for x in rg['hist']], 'b': [[b['b'], b['n'], b['m1'], b['m1p'], b['m3'], b['m3p'], b['m6'], b['m6p'], b['m12'], b['m12p']] for b in rg['buckets']],
           'all': rg['all'], 'rules': rg['rules']}
# The source history stops at the last month whose next-month return is known, so the latest finished month-end
# (and the month in progress) are missing. Fill them with the same Core-5 rules (reproduces every stored month exactly).
try:
    import datetime as _dt
    _X = {x['k']: x for x in json.load(open('/home/claude/tw2/data/macro.json'))}
    _F, _Y, _E = _X['fred']['d'], _X['yh']['d'], _X['events']['v200']
    def _ms(a):
        y, mo, o = int(a[0][:4]), int(a[0][4:6]), {}
        for v in a[1:]:
            o['%04d-%02d' % (y, mo)] = v; mo += 1
            if mo > 12: mo, y = 1, y + 1
        return o
    def _wm(a):
        s = a[0].replace('-', ''); d0 = _dt.date(int(s[:4]), int(s[4:6]), int(s[6:8])); o = {}
        for i, v in enumerate(a[1:]):
            d = d0 + _dt.timedelta(days=7 * i)
            if v is not None: o['%04d-%02d' % (d.year, d.month)] = v
        return o
    _S = [(_wm(_E), lambda x: 1 if x > 3 else .6 if x > 0 else .3 if x > -3 else 0), (_ms(_Y['^VIX']['m']), lambda x: 1 if x < 15 else .7 if x < 20 else .4 if x < 25 else .2 if x < 30 else 0),
          (_ms(_F['NFCI']['m']), lambda x: 1 if x < -.5 else .7 if x < -.3 else .4 if x < 0 else 0), (_ms(_F['T10Y3M']['m']), lambda x: 1 if x > .5 else .6 if x > 0 else .2),
          (_ms(_F['SAHMREALTIME']['m']), lambda x: 1 if x < .3 else .5 if x < .5 else 0)]
    def _sc(k):
        h = [f(s[k]) for s, f in _S if s.get(k) is not None]
        return round(sum(h) / len(h) * 100) if len(h) >= 4 else None
    _cur = K.get('asof', '')[:7] or _dt.date.today().strftime('%Y-%m')
    _last = K['rg']['h'][-1][0]
    y, mo = int(_last[:4]), int(_last[5:7])
    while True:
        mo += 1
        if mo > 12: mo, y = 1, y + 1
        k = '%04d-%02d' % (y, mo)
        if k >= _cur: break
        v = _sc(k)
        if v is None: break
        K['rg']['h'].append([k, v])
    _m = _sc(_cur)
    if _m is not None: K['rg']['mtd'] = [_cur, _m]
except Exception as _e:
    print('regime fill skipped:', _e)

# ---------- valuation ----------
mp = m['mp']['d']
mon = lambda a: sorted([[str(x[0]), x[1]] for x in a])
monq = lambda a: [x for x in mon(a) if x[0] >= '198001' and x[0][4:] in ('01','04','07','10')] + [mon(a)[-1]]
K['val'] = {'cape': monq(mp['cape']), 'pe': monq(mp['pe']), 'ey': mon(mp['ey'])[-1], 'dy': mon(mp['dy'])[-1],
            'fpe': [[x[0][:6], x[1]] for x in m['fpe']['sp500'][::4]] + [[m['fpe']['sp500'][-1][0][:6], m['fpe']['sp500'][-1][1]]],
            'fpen': [[x[0][:6], x[1]] for x in m['fpe']['ndx'][::4]] + [[m['fpe']['ndx'][-1][0][:6], m['fpe']['ndx'][-1][1]]],
            'cur': m['fpe']['meta']['cur'], 'ps': [[x[0][:6], x[1]] for x in m['val2']['ps']], 'hea': [[x[0], x[1]] for x in m['val2']['hea'] if x[0] >= '198001'],
            'wsj': m['pe']['wsj']}

# ---------- calendar ----------
K['cal'] = [[e['d'], e['tm'], e['w'], e['per'], e['act'], e['fc'], e['prev']] for e in m['cal']['mw'] if e['d'] >= '2026-11-10']
K['ev'] = {k: {i: m['events']['d'][k][i]['s'] for i in ['spx', 'ndx']} for k in ['fomc', 'cpi']}

# ---------- geopolitics ----------
g = m['gpr']['d']
K['gpr'] = {'cols': g['cols'], 'M': [[r[0], r2(r[1], 0)] for r in g['M'] if r[0][5:] in ('01','04','07','10') or r[0] >= '2024-01'], 'last': g['M'][-13:]}
K['gepu'] = mser('GEPUCURRENT', 0)

# ---------- since 2000 (rebased, monthly) ----------
wd, wv = hist['w']['dates'], hist['w']['v']
i0 = next(i for i, d in enumerate(wd) if d >= '2000-01-03')
idx = list(range(i0, len(wd), 13)) + ([len(wd) - 1] if (len(wd) - 1 - i0) % 13 else [])
SYMS = ['^GSPC', '^IXIC', '^DJI', 'RSP', 'IWM', 'QQQ', 'XLK', 'XLF', 'XLV', 'XLE', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE', 'XLC']
s2k = {}
for s in SYMS:
    v = wv[s]
    j0 = next((i for i in idx if v[i]), None)
    if j0 is None: continue
    base = v[j0]
    s2k[s] = [wd[j0], [round(v[i] / base * 100) if v[i] else None for i in idx if i >= j0]]
K['s2k'] = {'d': [wd[i] for i in idx], 's': s2k}
# calendar-year returns
yr = {}
for s in ['^GSPC', '^IXIC', '^DJI', 'IWM']:
    v = wv[s]; last = {}
    for d, x in zip(wd, v):
        if x: last[d[:4]] = x
    ys = sorted(last)
    yr[s] = {y: round((last[y] / last[ys[i - 1]] - 1) * 100, 1) for i, y in enumerate(ys) if i and y >= '2000'}
K['yr'] = yr

js = 'TW.MK=' + json.dumps(K, separators=(',', ':'), ensure_ascii=False) + ';\n'
open('/home/claude/tw2/work/mk.json','w').write(json.dumps(K, separators=(',', ':'), ensure_ascii=False))
print('mk.js', len(js))
print({k: len(json.dumps(v, separators=(',', ':'))) for k, v in K.items()})
