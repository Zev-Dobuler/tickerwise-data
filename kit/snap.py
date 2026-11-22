#!/usr/bin/env python3
"""Nightly score snapshot: append today's Tickerwise Score and pillars for every stock to scores_hist.json.
Usage: snap.py <pub.json> <scores_hist.json>. Format: {"d": [dates], "T": {ticker: [[ws,m,e,g,p,b] or null per date]}}"""
import json, sys, os
pub, out = sys.argv[1], sys.argv[2]
j = json.load(open(pub)); d = j['asof']
H = json.load(open(out)) if os.path.exists(out) else {'d': [], 'T': {}}
if d in H['d']: print('snapshot exists', d); sys.exit(0)
H['d'].append(d); n = len(H['d'])
cur = {a[0]: [a[16]] + list(a[15]) for a in j['R']}
for t in set(list(H['T'].keys()) + list(cur.keys())):
    row = H['T'].setdefault(t, [None] * (n - 1))
    row += [None] * (n - 1 - len(row)); row.append(cur.get(t))
json.dump(H, open(out, 'w'), separators=(',', ':')); print('snapshot', d, len(cur), 'stocks,', n, 'days')
