"""Quarterly margin and valuation history (kit/qgm.js, stockanalysis.com) -> data/qhist.json.
Merges a new pull (data/qh_raw.json) over the previous file (data/qhist.json or the repo's qh.json) and cleans it:
a forward P/E series with 3+ identical quarters in a row is a stale carry-forward on the source, so it is dropped;
a gross margin that is 100% every quarter (payment networks, lenders) is not meaningful, so it is dropped."""
import json, os
D = '/home/claude/tw2/data/'
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
old = {}
for p in (D + 'qhist.json', os.path.join(REPO, 'qh.json')):
    if os.path.exists(p):
        old = json.load(open(p)); break
new = json.load(open(D + 'qh_raw.json')) if os.path.exists(D + 'qh_raw.json') else {}
if not old and not new:
    raise SystemExit(0)
T = dict(old.get('T', {}))
for t, r in new.get('T', {}).items():
    f = r.get('fpe')
    if f:
        v = [x for x in f if x is not None]; run = 1; bad = False
        for a, b in zip(f, f[1:]):
            run = run + 1 if (a is not None and a == b) else 1
            if run >= 3: bad = True
        if bad or len(set(v)) <= 1: r.pop('fpe', None); r['c'] = [None, (r.get('c') or [None, None])[1]]
    g = r.get('gm')
    if g and all(x in (None, 100) for x in g): r.pop('gm', None)
    T[t.replace('.', '-')] = r
json.dump({'read': new.get('read') or old.get('read'), 'T': T}, open(D + 'qhist.json', 'w'), separators=(',', ':'))
print('qhist', len(new.get('T', {})), 'refreshed,', len(T), 'total')
