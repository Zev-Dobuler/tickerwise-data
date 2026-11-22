"""Merge the nightly feature pulls (data/nx_new.json, any subset of SEA, SEG, SI, CG, ETF, TH, NEWS, CALL) into data/nx.json.
Each key is replaced as a whole for the tickers pulled and stamped with today's date in nx['d']. Same fields for every stock."""
import json, os, datetime
D = '/home/claude/tw2/data/'; R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if os.path.exists(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'nx.json')) else '/home/claude/tickerwise-data'
base = json.load(open(D + 'nx.json')) if os.path.exists(D + 'nx.json') else json.load(open(os.path.join(R, 'nx.json'))) if os.path.exists(os.path.join(R, 'nx.json')) else {'d': {}}
new = json.load(open(D + 'nx_new.json')); today = new.pop('read', datetime.date.today().isoformat())
for k, v in new.items():
    if not isinstance(v, dict) or not v: continue
    base.setdefault(k, {}).update(v); base.setdefault('d', {})[k] = today
# Target history: keep month-end points with 3+ firms; series need 3+ points
if 'TH' in base: base['TH'] = {t: [p for p in s if p[2] >= 3] for t, s in base['TH'].items()}; base['TH'] = {t: s for t, s in base['TH'].items() if len(s) >= 3}
json.dump(base, open(D + 'nx.json', 'w'), separators=(',', ':'))
print('nx:', {k: len(v) for k, v in base.items() if k != 'd'})
