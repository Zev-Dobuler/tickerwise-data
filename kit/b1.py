import json, re, math
R = '/home/claude/tw2/data/'
L = lambda n: json.load(open(R + n + '.json'))
quotes = {r['ticker']: r for r in L('quotes')}
analytics = {r['ticker']: r for r in L('analytics')}
erscore = {}
for r in L('erscore'):
    if r.get('ticker'): erscore.setdefault(r['ticker'], {})[r.get('k')] = r
extra = {r['ticker']: r for r in L('extra')}
srisk = {r['ticker']: r for r in L('stockrisk')}
fin = {r['ticker']: r for r in L('fincharts')}
dup = {r['ticker']: r for r in L('dailyupd')}
wish = {r['t']: r for r in L('wish') if r.get('t')}
wx = {}
for r in L('wishx'):
    if r.get('ticker') and r.get('k') not in ('dl',): wx.setdefault(r['ticker'], {})[r['k']] = r
gw = {r['t']: r for r in json.load(open(R+'goodwill.json'))}
fund = {r['ticker']: r for r in L('fundamentals')}

_sch = json.load(open(R + 'schwab.json'))
try: _th = json.load(open(R + 'themes.json'))
except Exception: _th = {}
HOLD_THEME = {r['Tickers']: (None, _th.get(r['Tickers']) or r.get('Industry') or 'Other') for r in _sch}
THEME_FIX = {'Mag 7 & Advertising': 'Mag 7 & Big Tech', 'Chinese': 'China Tech & EVs', 'EVTOL': 'eVTOL & Air Mobility', 'Power': 'Power & Nuclear',
             'Semiconductors - Neo Clouds': 'AI Cloud & Data Centers', 'Financials': 'Financials', 'Value': 'Value',
             'Low Volatility & Dividend': 'Dividend & Defensive'}
SECTOR = [('Semicon', 'Semiconductors'), ('Photonic', 'Semiconductors'), ('DRAM', 'Semiconductors'), ('Neo Cloud', 'AI Infrastructure'), ('AI ', 'AI Infrastructure'),
          ('Quantum', 'Quantum'), ('Space', 'Space & Defense'), ('Defense', 'Space & Defense'), ('Drone', 'Space & Defense'), ('eVTOL', 'Space & Defense'), ('Aerospace', 'Space & Defense'),
          ('Software', 'Software & Internet'), ('Mag 7', 'Software & Internet'), ('Cloud', 'Software & Internet'), ('China', 'Software & Internet'),
          ('Power', 'Energy & Power'), ('Nuclear', 'Energy & Power'), ('Oil', 'Energy & Power'), ('Batter', 'Energy & Power'), ('Utilit', 'Energy & Power'),
          ('Bank', 'Financials'), ('Financ', 'Financials'), ('Fintech', 'Financials'), ('Asset', 'Financials'), ('Insurance', 'Financials'),
          ('Health', 'Healthcare'), ('Medical', 'Healthcare'), ('Robot', 'Industrials'), ('Construction', 'Industrials'), ('Machinery', 'Industrials'),
          ('Material', 'Materials'), ('Gold', 'Materials'), ('Discount', 'Consumer'), ('Beverage', 'Consumer'), ('Household', 'Consumer'), ('Consumer', 'Consumer'), ('Staples', 'Consumer')]
# Theme merges (Zev, Nov 21, 2026): 44 themes down to 21. Ticker moves first, then theme renames.
T_MOVE = {'DELL': 'AI Infrastructure', 'SMCI': 'AI Infrastructure', 'SPY': 'Index, Dividend & Value ETFs',
          'BITX': 'Fintech & Crypto', 'BMNR': 'Fintech & Crypto',
          'CCJ': 'Power, Nuclear & Storage', 'CEG': 'Power, Nuclear & Storage', 'UUUU': 'Power, Nuclear & Storage'}
T_MERGE = {'AI Cloud & Data Centers': 'AI Infrastructure', 'AI Networking': 'AI Infrastructure', 'AI Power & Cooling': 'AI Infrastructure',
           'Semiconductors': 'Semiconductors & Memory', 'Semiconductors - DRAM': 'Semiconductors & Memory',
           'Mag 7 & Advertising': 'Big Tech & Internet', 'Mag 7 & Cloud': 'Big Tech & Internet', 'Mag 7 & Big Tech': 'Big Tech & Internet',
           'Beverages - Non-Alcoholic': 'Consumer', 'Consumer Services': 'Consumer', 'Consumer Staples': 'Consumer', 'Discount Stores': 'Consumer', 'Household & Personal Products': 'Consumer',
           'Dividend & Defensive': 'Index, Dividend & Value ETFs', 'Value': 'Index, Dividend & Value ETFs', 'Leveraged Index ETFs': 'Index, Dividend & Value ETFs', 'Asset Management - Income': 'Index, Dividend & Value ETFs',
           'Oil & Gas': 'Oil, Gas & Utilities', 'Utilities': 'Oil, Gas & Utilities',
           'Power & Nuclear': 'Power, Nuclear & Storage', 'Batteries & Energy Storage': 'Power, Nuclear & Storage',
           'Banks': 'Banks & Financials', 'Financials': 'Banks & Financials', 'Financial - Capital Markets': 'Banks & Financials', 'Financial - Credit Services': 'Banks & Financials', 'Insurance - Diversified': 'Banks & Financials',
           'Fintech & Brokerage': 'Fintech & Crypto', 'Fintech & Mortgages': 'Fintech & Crypto',
           'Healthcare & Drug Manufacturers': 'Healthcare', 'Medical Devices': 'Healthcare',
           'Construction & Infrastructure': 'Industrials & Construction', 'Agricultural - Machinery': 'Industrials & Construction',
           'Gold': 'Metals, Mining & Gold', 'Materials': 'Metals, Mining & Gold'}
T_SECTOR = {'AI Infrastructure': 'AI Infrastructure', 'Semiconductors & Memory': 'Semiconductors', 'Big Tech & Internet': 'Software & Internet',
            'Consumer': 'Consumer', 'Index, Dividend & Value ETFs': 'Diversified', 'Oil, Gas & Utilities': 'Energy & Power',
            'Power, Nuclear & Storage': 'Energy & Power', 'Banks & Financials': 'Financials', 'Fintech & Crypto': 'Financials',
            'Healthcare': 'Healthcare', 'Industrials & Construction': 'Industrials', 'Metals, Mining & Gold': 'Materials'}
def merge_theme(t, th):
    return T_MOVE.get(t) or T_MERGE.get(th, th)
def sector(theme):
    for k, v in SECTOR:
        if k.lower() in theme.lower(): return v
    return 'Diversified'

def num(x):
    try:
        if x is None or x == '' or x == '-': return None
        return float(str(x).replace('%', '').replace(',', ''))
    except Exception: return None
def r1(x): return None if x is None else round(x, 1)
pct = lambda a, b: None if not a or not b else (a / b - 1) * 100

MONEY = re.compile(r'(?!x)x|\$|USD|\bprice target|Smart Score|Zacks|TipRanks|your\b|you\b|portfolio|Zev|Strong Buy|average target|upside', re.I)
def clean_text(t, maxs=4):
    if not t: return []
    t = re.sub(r'\s*\([^)]*(?:\d{4}|Nov|Oct|Sep|Reuters|Bloomberg|TipRanks|CNBC|Yahoo|Benzinga|Investing|Barron|MarketWatch|Motley|Seeking)[^)]*\)', '', t)
    sents = re.split(r'(?<=[.!?])\s+(?=[A-Z])', t)
    out = [s.strip() for s in sents if s.strip() and not MONEY.search(s) and len(s) > 40]
    return out[:maxs]

stocks = []
tick = [t for t in HOLD_THEME] + [t for t in wx if t not in HOLD_THEME] + [t for t in wish if t not in wx and t not in HOLD_THEME]
for t in tick:
    H = t in HOLD_THEME
    o = {'t': t}
    if H:
        q = quotes[t]; o['n'] = q['name']; o['th'] = HOLD_THEME[t][1]
        px, hi, lo, m50, m200, rsi = q['price'], q['high_52w'], q['low_52w'], q['ma50'], q['ma200'], q['rsi14']
        o['beta'] = q.get('beta_5y'); ned = q.get('next_earnings')
        a = analytics.get(t, {}); ret = {k: a.get(k) for k in ('r1m', 'r3m', 'r6m', 'rytd', 'r1y')}; rq = a.get('r1y_vs_qqq')
        E = erscore.get(t, {}).get('t', {}); hist = (extra.get(t, {}).get('earnings') or {}).get('history') or []
        F = fin.get(t); rows = F['rows'] if F else []
        if isinstance(rows, str): rows = json.loads(rows)
        fz = fund.get(t, {})
        marg = {'gross': None, 'op': num(fz.get('Operating Margin')), 'net': num(fz.get('Net Profit Margin')), 'fcf': num(fz.get('Free Cash Flow Margin'))}
        A = [x for x in rows if x and x.get('k') == 'A']
        gms = [x.get('gm') for x in A[-4:] if x.get('gm') is not None]
        if gms: marg['gross'] = sum(gms) / len(gms)
        val = {'fpe': num(fz.get('Forward P/E')), 'ps': num(fz.get('Forward P/S')), 'peg': num(fz.get('PEG Ratio'))}
        rg = num(fz.get('Y/Y Revenue Growth'))
        rk = srisk.get(t, {}); risk_sum = rk.get('summary'); risks = rk.get('risks'); top = rk.get('top')
        run = (extra.get(t, {}).get('runway') or {})
        news = clean_text((dup.get(t) or {}).get('text'), 3)
    else:
        w = wish.get(t, {}); X = wx.get(t, {})
        o['n'] = w.get('n') or t; th = w.get('ind') or 'Other'; o['th'] = THEME_FIX.get(th, th)
        px, hi, lo, m50, m200, rsi = w.get('px'), w.get('h52'), w.get('l52'), w.get('ma50'), w.get('ma200'), w.get('rsi')
        an = X.get('an') or {k: w.get(k) for k in ('r1m', 'r3m', 'r1y')}; ret = {k: an.get(k) for k in ('r1m', 'r3m', 'r6m', 'rytd', 'r1y')}; rq = an.get('r1y_vs_qqq'); o['beta'] = an.get('beta_qqq')
        E = X.get('t', {}); hist = ((X.get('x') or {}).get('earnings') or {}).get('history') or []
        ned = ((X.get('x') or {}).get('earnings') or {}).get('next_date') or w.get('ed')
        rows = (X.get('fc') or {}).get('rows') or []
        if isinstance(rows, str): rows = json.loads(rows)
        fs = X.get('fs') or {}
        marg = {'gross': fs.get('gross'), 'op': fs.get('op'), 'net': fs.get('net'), 'fcf': fs.get('fcf')}
        val = {'fpe': w.get('fpe'), 'ps': w.get('ps'), 'peg': w.get('peg')}
        rg = w.get('rg')
        sr = X.get('sr') or {}; risk_sum = sr.get('summary'); risks = sr.get('risks'); top = sr.get('top')
        run = {}
        news = []
    o['th'] = merge_theme(t, o['th'])
    o['sec'] = T_SECTOR.get(o['th']) or sector(o['th'])
    # technicals as percentages only
    o['tech'] = {'off': r1(pct(px, hi)), 'up': r1(pct(px, lo)), 'v50': r1(pct(px, m50)), 'v200': r1(pct(px, m200)), 'x': r1(pct(m50, m200)), 'rsi': rsi}
    if hi and lo and px and hi > lo: o['tech']['pos'] = round((px - lo) / (hi - lo) * 100)
    o['ret'] = {k: r1(v) for k, v in ret.items()}; o['ret']['vq'] = r1(rq)
    # earnings
    # Report history (Nov 21, 2026): up to 8 quarters from the earnings-score data (EPS and revenue, actual vs estimate); next-day move from the 4-quarter history.
    eh = []; mv_by_d = {h.get('date'): h.get('move_1d_pct') for h in hist}
    q8 = [q for q in (E.get('q8') or []) if q.get('d')]
    src = [{'quarter': f"Q{q['fp']} {q['fy']}" if q.get('fp') and q.get('fy') else None, 'date': q['d'], 'eps_act': q.get('eps'), 'eps_est': q.get('est'),
            'rev_act_usd': q.get('rev'), 'rev_est_usd': q.get('rest'), 'move_1d_pct': mv_by_d.get(q['d'])} for q in sorted(q8, key=lambda q: q['d'], reverse=True)[:8]] if len(q8) >= len(hist) else hist[:8]
    for h in src:
        eb = None if h.get('eps_act') is None or h.get('eps_est') is None else (1 if h['eps_act'] >= h['eps_est'] else 0)
        rb = None if h.get('rev_act_usd') is None or not h.get('rev_est_usd') else (1 if h['rev_act_usd'] >= h['rev_est_usd'] else 0)
        rs = None if h.get('rev_act_usd') is None or not h.get('rev_est_usd') else r1((h['rev_act_usd'] / h['rev_est_usd'] - 1) * 100)
        mm = lambda v: None if v is None else round(v / 1e6, 1)
        eh.append({'q': h.get('quarter'), 'd': h.get('date'), 'e': h.get('eps_act'), 'ee': h.get('eps_est'), 'eb': eb, 'rb': rb, 'rs': rs, 'mv': r1(h.get('move_1d_pct')),
                   'ra': mm(h.get('rev_act_usd')), 're': mm(h.get('rev_est_usd'))})
    def _rate(n):
        v = [h['rb'] for h in eh[:n] if h['rb'] is not None]
        return round(sum(v) / len(v) * 100) if len(v) >= min(n, 2) else None
    rl4, rl8 = _rate(4), _rate(8)
    o['earn'] = {'l4': E.get('l4'), 'l8': E.get('l8'), 'last': E.get('last'), 'streak': E.get('streak'), 'div': E.get('div'), 'mt': E.get('mt'),
                 'rt': E.get('rt'), 'et': E.get('et'), 'yoy': E.get('yoy3'), 'prof4': E.get('prof4'), 'next': ned, 'h': eh, 'rl4': rl4, 'rl8': rl8, 'n8': len(eh)}
    # quarterly financials (USD millions)
    fq = []
    for x in rows:
        if not x or x.get('rev') is None: continue
        fq.append({'p': x.get('p'), 'k': x.get('k'), 'rev': x.get('rev'), 'ni': x.get('ni'), 'gm': x.get('gm'), 'npm': x.get('npm'), 'y': x.get('yoy')})
    o['fq'] = fq[-12:]
    o['mg'] = {k: r1(v) for k, v in marg.items()}
    o['val'] = {k: r1(v) for k, v in val.items()}
    o['rg'] = r1(num(rg))
    g = gw.get(t)
    if g:
        o['gw'] = {'s': g['score'] + (g.get('adj') or 0), 'f': g['flag'], 'gia': r1(g['gia_ta']), 'g4': r1(g.get('gw_4q')), 'new': g.get('gw_new'),
                   'tb': r1(g.get('tbvps')), 'imp': g.get('imp'), 'note': ' '.join(s for s in re.split(r'(?<=[.])\s+', g['note']) if 'Claude' not in s and 'your' not in s.lower()),
                   'tr': [[p, v] for p, v in (json.loads(g['gw_t']) if isinstance(g['gw_t'], str) else g['gw_t'])]}
    if risks:
        o['risk'] = {'sum': ' '.join(clean_text(risk_sum, 3)) or None, 'top': top,
                     'r': {k: {'e': v.get('exp'), 's': v.get('res'), 'w': ' '.join(clean_text(v.get('why'), 2))} for k, v in risks.items()}}
    if run.get('applicable'):
        o['run'] = {'p': run.get('profitable'), 'm': run.get('runway_months')}
    o['news'] = news
    stocks.append(o)

# ---- Tickerwise Score: 5 pillars 0-100 ----
def clamp(x): return max(0, min(100, x))
for o in stocks:
    T, Ea, M = o['tech'], o['earn'], o['mg']
    # Momentum
    m = 50
    if T.get('v50') is not None: m += clamp(50 + T['v50'] * 2.5) * 0.3 - 15
    if T.get('v200') is not None: m += clamp(50 + T['v200'] * 1.5) * 0.4 - 20
    if o['ret'].get('vq') is not None: m += clamp(50 + o['ret']['vq'] / 2) * 0.3 - 15
    mom = clamp(m)
    # Earnings
    e = 50
    if Ea.get('l8') is not None: e = Ea['l8']
    if Ea.get('l4') is not None: e = 0.5 * e + 0.5 * Ea['l4']
    e += {'Accelerating': 10, 'Decelerating': -10}.get(Ea.get('rt'), 0) + {'Improving': 8, 'Deteriorating': -8}.get(Ea.get('mt'), 0)
    earn = clamp(e)
    # Growth
    g = o['rg'] if o['rg'] is not None else (Ea.get('yoy') or [None])[-1] if Ea.get('yoy') else None
    grow = 50 if g is None else clamp(35 + g * 0.8)
    # Profitability
    pv = [v for v in (M.get('op'), M.get('net'), M.get('fcf')) if v is not None]
    prof = 50 if not pv else clamp(50 + (sum(pv) / len(pv)) * 1.6)
    # Balance sheet & risk
    b = o.get('gw', {}).get('s', 70)
    if o.get('run') and not o['run'].get('p') and o['run'].get('m') is not None: b = 0.6 * b + 0.4 * clamp(o['run']['m'] * 3)
    if o.get('risk'):
        rr = [v['e'] * (10 - v['s']) for v in o['risk']['r'].values() if v.get('e') is not None and v.get('s') is not None]
        if rr: b = 0.7 * b + 0.3 * clamp(100 - (sum(sorted(rr)[-3:]) / 3))
    bal = clamp(b)
    P = {'m': round(mom), 'e': round(earn), 'g': round(grow), 'p': round(prof), 'b': round(bal)}
    o['P'] = P
    o['ws'] = max(1, min(10, round((0.2 * mom + 0.2 * earn + 0.2 * grow + 0.2 * prof + 0.2 * bal) / 10)))

sec = L('sectors')
sectors = [{'t': r['t'], 'n': r['name'], 'w1': r['w1'], 'm1': r['m1'], 'm3': r['m3'], 'ytd': r['ytd'], 'y1': r['y1']} for r in sec if r.get('k') == 'etf']
asof = max(q.get('as_of') or '' for q in quotes.values())[:10]
data = {'asof': asof, 'stocks': stocks, 'sectors': sectors}
s = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
open('/home/claude/tw2/work/data.json', 'w').write(s)
print(len(stocks), len(s))
import collections
print(collections.Counter(o['sec'] for o in stocks)); print(collections.Counter(o['ws'] for o in stocks))
bad = [x for o in stocks for x in o['news'] + ([o['risk']['sum']] if o.get('risk') and o['risk']['sum'] else []) if '$' in x]
print('money leaks', len(bad))
