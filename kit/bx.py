"""Per-stock extras for Tickerwise: insiders, institutions, short interest, cash, relative strength, news, editor's call."""
import json, re, os
R = '/home/claude/tw2/data/'
L = lambda f: json.load(open(R + f + '.json'))
OUT = '/home/claude/tw2/work/'

uni = [r[0] for r in json.load(open('/home/claude/tw2/work/rows.json'))]
U = set(uni)

BAD = re.compile(r"(?!x)x|\b(you|your|yours|portfolio|smart score|tipranks|zacks|price targets?|targets?|tax|trim|trimming|holding|holdings|position|cost basis|upside)\b", re.I)
def badmoney(s):
    return False
    for m in re.finditer(r"~?\$\s?(\d[\d,]*(?:\.\d+)?)(\s*(?:billion|million|trillion|bn|[BMKT]\b))?", s):
        if not m.group(2): return True
    return False
def clean(t):
    t = re.sub(r"\s+", " ", t or "").strip()
    raw = re.split(r"(?<=[.!?])\s+(?=[A-Z(])", t)
    sents = []
    for x in raw:
        if sents and re.search(r"(\b(St|Sen|Rep|Mr|Mrs|Ms|Dr|Inc|Corp|Co|Jr|Sr|U\.S|vs)\.|\b[A-Z]\.)$", sents[-1]):
            sents[-1] += ' ' + x
        else:
            sents.append(x)
    return [x for x in sents if x and not BAD.search(x) and not badmoney(x) and not re.search(r"\bUSD\b", x) and not re.search(r"^No (new )?company (news|announcement)", x, re.I)]
def okt(t):
    return not BAD.search(t) and not badmoney(t) and not re.search(r"\bUSD\b|\b\d+(\.\d+)? Dollar|\bat \$|\bbuy\b", t, re.I)

def r1(v, d=1):
    return None if v is None else round(v, d)
def M(v):  # dollars -> $M, 1 decimal
    return None if v is None else round(v / 1e6, 1)

X = {t: {} for t in uni}

# ---------- insiders ----------
def ins_pack(row):
    tx = row.get('tx') or []
    out = []
    buys = sells = 0; bv = sv = 0.0
    for t in tx:
        act = (t.get('action') or '') + ' ' + (t.get('desc') or '')
        side = 'B' if re.search(r'buy', act, re.I) else 'S' if re.search(r'sell', act, re.I) else 'O'
        if side == 'B': buys += 1; bv += t.get('value') or 0
        if side == 'S': sells += 1; sv += t.get('value') or 0
        out.append([(t.get('name') or '').title()[:26], (t.get('role') or '').lstrip('* ')[:18], side, t.get('shares'), None if t.get('value') is None else round(t['value'] / 1e6, 3), t.get('date')])
    out.sort(key=lambda x: x[5] or '', reverse=True)
    # i[7] = every buy in the window (Insider Cluster Buys lists each buyer; Zev, Nov 24, 2026)
    return [row.get('all'), buys, sells, M(bv), M(sv), [[x[0], x[1], x[2], x[4], x[5]] for x in out[:5]], row.get('read'), [[x[0], x[1], x[2], x[4], x[5]] for x in out if x[2] == 'B']]
for r in L('insiders'):
    if r['ticker'] in U: X[r['ticker']]['i'] = ins_pack(r)
wx = L('wishx')
for r in wx:
    if r['k'] == 'ins' and r['ticker'] in U and 'i' not in X[r['ticker']]: X[r['ticker']]['i'] = ins_pack(r)

# ---------- institutions / short / runway ----------
def own(t, e):
    ins = e.get('institutions') or {}
    if ins.get('applicable') is not False and ins.get('pct_held') is not None:
        ch = [[(c.get('holder') or '')[:30], r1(c.get('change_pct'),0)] for c in (ins.get('top_changes') or []) if c.get('change_pct') is not None][:3]
        X[t]['h'] = [r1(ins['pct_held']), ch]
    sh = e.get('short') or {}
    if sh.get('short_pct_float') is not None:
        a, b = sh.get('shares_short'), sh.get('shares_short_prior')
        X[t]['sh'] = [r1(sh['short_pct_float']), r1(sh.get('short_ratio_days')), r1((a - b) / b * 100, 0) if a and b else None]
    rw = e.get('runway') or {}
    if rw.get('applicable') is not False and (rw.get('cash_usd') is not None or rw.get('profitable')):
        X[t]['rw'] = [1 if rw.get('profitable') else 0, r1(rw.get('runway_months')), M(rw.get('cash_usd')), M(rw.get('quarterly_burn_usd')), M(rw.get('total_debt_usd'))]
for e in L('extra'):
    if e['ticker'] in U: own(e['ticker'], e)
for r in wx:
    if r['k'] == 'x' and r['ticker'] in U: own(r['ticker'], r)

# ---------- balance-sheet health (holdings) ----------
for r in L('cashx'):
    if r.get('k') == 's' and r['t'] in U:
        X[r['t']]['bs'] = {'cr': r1(r['cr'], 2), 'qr': r1(r['qr'], 2), 'de': r1(r['de'], 2), 'cash': M(r['cash']), 'debt': M(r['debt']), 'net': M(r['net']),
                           'ocf': M(r['ocf']), 'fcf': M(r['fcf']), 'z': r1(r['z'], 2), 'f': r['f']}

# ---------- relative strength ----------
def rs(t, a):
    keys = ['r1m', 'r3m', 'r6m', 'rytd', 'r1y']
    X[t]['rs'] = [[r1(a.get(k),0) for k in keys], [r1(a.get(k + '_vs_qqq'),0) for k in keys], r1(a.get('beta_qqq'), 2), r1(a.get('corr_qqq'), 2), r1(a.get('vol_ann'), 0)]
an = L('analytics')
for a in an:
    if a.get('ticker') in U: rs(a['ticker'], a)
for r in wx:
    if r['k'] == 'an' and r['ticker'] in U and 'rs' not in X[r['ticker']]: rs(r['ticker'], r)
bench = [a for a in an if a.get('ticker') == '_meta'][0]['bench']

# ---------- news + editor's call (holdings) ----------
for v in L('verdicts'):
    t = v['ticker']
    if t not in U: continue
    nw = [x for x in clean(v.get('news')) if not re.match(r'(It|Then|That|This)\b',x)][:3]
    if nw:
        X[t]['nw'] = [v.get('as_of'), nw, [[s['title'][:90], s['url']] for s in (v.get('news_sources') or []) if okt(s['title'])][:2]]
    X[t]['v'] = v.get('verdict')

cov = {k: sum(1 for t in uni if k in X[t]) for k in ['i', 'h', 'sh', 'rw', 'bs', 'rs', 'nw', 'v']}
print('universe', len(uni), cov)
X = {t: v for t, v in X.items() if v}
json.dump({'X': X, 'BENCH': bench}, open('/home/claude/tw2/work/x.json', 'w'), separators=(',', ':'), ensure_ascii=False)
