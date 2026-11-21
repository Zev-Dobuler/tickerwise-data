"""Merge a stockanalysis.com quality-stats pull (from kit/qs.js, saved as data/qs_raw.json) into data/qstats.json.
Stocks missing from the new pull keep their previous values, so one failed page never blanks a stock."""
import json, os
D = '/home/claude/tw2/data/'
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
old = {}
for p in (D + 'qstats.json', os.path.join(REPO, 'qs.json')):
    if os.path.exists(p):
        old = json.load(open(p)); break
new = json.load(open(D + 'qs_raw.json'))
T = dict(old.get('T', {}))
T.update(new.get('T', {}))
json.dump({'read': new.get('read') or old.get('read'), 'T': T}, open(D + 'qstats.json', 'w'), separators=(',', ':'))
print('qstats', len(new.get('T', {})), 'refreshed,', len(T), 'total')
