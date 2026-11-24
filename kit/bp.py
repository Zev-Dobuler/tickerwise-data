"""Tickerwise prices: one identical price history format for EVERY stock on the site (holdings and wish list alike).

Inputs (all optional except the hist store once built):
  data/twpx_raw.json   compact Yahoo pull made in Chrome (see run notes): daily closes + volume + latest intraday
  data/fprices.json    Fiscal.ai 5-year closes for covered holdings (used as extra history)
  data/daily.json      holdings daily rows (volume)
Store:  data/twpx_hist.json  {t: {"c": {day: close}, "v": {day: vol}, "i": intraday}}  (day = days since 1970-01-01)
Output: data/twpx.json  {"cd": [daily days], "cw": [weekly days], "T": {t: [e, nw, wdeltas, nd, ddeltas, vol, intraday]}}
Every stock gets the same grid and the same precision (4 significant digits of the stock's peak price), so nothing in the data shows which stocks are holdings.
"""
import json, os, datetime, math
D = '/home/claude/tw2/data/'
EP = datetime.date(1970, 1, 1)
day = lambda s: (datetime.date.fromisoformat(s) - EP).days
AL = ''.join(ch for ch in map(chr, range(33, 127)) if ch not in '~|"\\,`\'<>&'); B = len(AL); H = 42

def dec(s):
    s = s.replace('undefined', AL[H + 1]); out = []; p = 0; i = 0
    while i < len(s):
        if s[i] == '~':
            x = AL.index(s[i + 1]) * B * B + AL.index(s[i + 2]) * B + AL.index(s[i + 3]) - 300000; i += 4
        else:
            x = AL.index(s[i]) - H; i += 1
        p += x; out.append(p)
    return out

hp = D + 'twpx_hist.json'
hist = json.load(open(hp)) if os.path.exists(hp) else {}
def S(t): return hist.setdefault(t, {'c': {}, 'v': {}, 'i': None})

# 0) fresh session: seed the store from the last published grid (px.json in the repo; same format for every stock)
SEED = os.path.join((os.environ.get('TW_REPO') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'px.json')
if not hist and not os.path.exists(SEED): SEED = '/home/claude/tickerwise-data/px.json'
if not hist and os.path.exists(SEED):
    P = json.load(open(SEED))
    for t, a in P['T'].items():
        e, nw, wd, nd, dd, vs, ii = a; u = 10 ** e; h = S(t)
        import itertools
        for k, q in zip(P['cw'][len(P['cw']) - nw:], itertools.accumulate(wd)): h['c'][str(k)] = round(q * u, 6)
        for k, q in zip(P['cd'][len(P['cd']) - nd:], itertools.accumulate(dd)): h['c'][str(k)] = round(q * u, 6)
        for k, ch in zip(P['cd'][-len(vs):], vs):
            if ch != '!': h['v'][str(k)] = round(10 ** (AL.index(ch) / 12 + 3))
        if ii:
            iu = 10 ** ii[2]; ts = list(itertools.accumulate(ii[3])); ps = list(itertools.accumulate(ii[4]))
            h['i'] = {'d': ii[0], 't': [ii[1] + 15 * s for s in ts], 'p': [round(q * iu, 6) for q in ps], 'prev': ii[5]}

# 1) Yahoo pull from Chrome
rp = D + 'twpx_raw.json'
if os.path.exists(rp):
    R = json.load(open(rp))
    cd = [R['cal0'] + x for x in dec(R['cal'])]
    cw = [R['wk'][0] + x for x in dec(R['wk'][1])] if R.get('wk') and R['wk'][1] else []
    for t, a in R.get('t', {}).items():
        e, nw, ws, nd, ds, vs = a[:6]; u = 10 ** e; h = S(t)
        w = [v * u for v in dec(ws)]; dd = [v * u for v in dec(ds)]
        for k, v in zip(cw[len(cw) - nw:], w): h['c'][str(k)] = round(v, 6)
        for k, v in zip(cd[len(cd) - nd:], dd): h['c'][str(k)] = round(v, 6)
        vd = cd[-len(vs):] if vs else []
        for k, ch in zip(vd, vs):
            if ch != '!': h['v'][str(k)] = round(10 ** (AL.index(ch) / 12 + 3))
    for t, a in R.get('i', {}).items():
        d0, t0, e, ts, ps, prev = a; u = 10 ** e
        steps = dec(ts); px = [round(v * u, 6) for v in dec(ps)]
        S(t)['i'] = {'d': d0, 't': [t0 + 15 * s for s in steps], 'p': px, 'prev': prev}
# 2) Fiscal.ai history for holdings it covers (daily closes)
if os.path.exists(D + 'fprices.json'):
    for r in json.load(open(D + 'fprices.json')):
        h = S(r['ticker'])
        for dt, c in r.get('closes') or []:
            if c is not None: h['c'].setdefault(str(day(dt)), c)
# 3) holdings volume
if os.path.exists(D + 'daily.json'):
    for r in json.load(open(D + 'daily.json')):
        try: v = float(r.get('volume') or 0)
        except Exception: v = 0
        if v: S(r['ticker'])['v'].setdefault(str(day(r['date'])), v)
json.dump(hist, open(hp, 'w'), separators=(',', ':'))

# 4) common grid from SPY's days
spy = sorted(int(k) for k in hist['SPY']['c'])
cd = spy[-504:]; old = [k for k in spy if k < cd[0]]
cw = old[::-1][::5][::-1] if len(old) > 300 else old
out = {'cd': cd, 'cw': cw, 'T': {}}
for t, h in hist.items():
    c = {int(k): v for k, v in h['c'].items()}
    if not c: continue
    ks = sorted(c); first = ks[0]
    def at(dd):
        import bisect
        j = bisect.bisect_right(ks, dd) - 1
        return c[ks[j]] if j >= 0 and dd - ks[j] <= 10 else None
    wv = [at(k) for k in cw if k >= first]; dv = [at(k) for k in cd if k >= first]
    while dv and dv[0] is None: dv.pop(0)
    vals = [x for x in wv + dv if x is not None]
    if len(dv) < 5 or not vals: continue
    e = math.floor(math.log10(max(vals))) - 3; u = 10 ** e
    def deltas(a):
        o = []; p = 0; last = None
        for x in a:
            x = last if x is None else x; last = x
            q = round(x / u); o.append(q - p); p = q
        return o
    wv = [x for x in wv if x is not None]
    vol = ''.join('!' if not h['v'].get(str(k)) else AL[max(0, min(B - 1, round((math.log10(h['v'][str(k)]) - 3) * 12)))] for k in cd[-252:])
    I = h.get('i')
    ii = None
    if I and I.get('p'):
        ie = math.floor(math.log10(max(I['p']))) - 3; iu = 10 ** ie
        ii = [I['d'], I['t'][0], ie, [ (I['t'][j] - I['t'][j - 1]) // 15 if j else 0 for j in range(len(I['t']))], deltas_i if False else None, I['prev']]
        q = [round(x / iu) for x in I['p']]; ii[4] = [q[0]] + [q[j] - q[j - 1] for j in range(1, len(q))]
    out['T'][t] = [e, len(wv), deltas(wv), len(dv), deltas(dv), vol, ii]
json.dump(out, open(D + 'twpx.json', 'w'), separators=(',', ':'))
json.dump(out, open(SEED if SEED.endswith('px.json') else D + 'px.json', 'w'), separators=(',', ':'))
print('prices', len(out['T']), 'stocks;', len(cd), 'daily +', len(cw), 'weekly points')
