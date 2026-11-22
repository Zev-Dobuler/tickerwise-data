"""Merge the index-universe pulls (kit/ix.js: data/ix_raw.json from stockanalysis + data/ixr_raw.json from Yahoo) into data/nx_new.json key IX:
{read, T:{sym:[name, sector, market cap $B, index bits (1 S&P 500, 2 Nasdaq-100, 4 Dow 30), 1D %, 1W %, 1M %, 3M %, YTD %, 1Y %]}}.
Used by the Market Heatmap index tabs and Home Market Movers. Replaced whole each night (index members change)."""
import json, os
D = '/home/claude/tw2/data/'
a = json.load(open(D + 'ix_raw.json')); r = json.load(open(D + 'ixr_raw.json')) if os.path.exists(D + 'ixr_raw.json') else {}
T = a['T']
for c, p in (('GOOG', 'GOOGL'), ('FOX', 'FOXA'), ('NWS', 'NWSA')):
    if c in T and p in T and not T[c][1]: T[c][1] = T[p][1]
out = {s: v[:5] + (r.get(s) or [None] * 5) for s, v in T.items()}
n = json.load(open(D + 'nx_new.json')) if os.path.exists(D + 'nx_new.json') else {'read': a['read']}
n['IX'] = {'read': a['read'], 'T': out}
json.dump(n, open(D + 'nx_new.json', 'w'), separators=(',', ':'))
print('IX', len(out), 'with returns', sum(1 for s in out if s in r))
