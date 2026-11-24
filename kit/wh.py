"""What's Happening: keep a rolling 30-day event log per stock.
New input (optional): data/wh_new.json  {"read": "YYYY-MM-DD", "T": {t: {"s": summary, "e": [[date, headline, source title, url], ...]}}}
Previous log: data/whatsup.json or the repo's wh.json. Output: data/whatsup.json (same format), events newest first,
de-duplicated by (date, headline), older than 30 days dropped, at most 12 per stock."""
import json, os, datetime
D = '/home/claude/tw2/data/'
REPO = (os.environ.get('TW_REPO') or os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
old = {}
for p in (D + 'whatsup.json', os.path.join(REPO, 'wh.json')):
    if os.path.exists(p):
        old = json.load(open(p)); break
new = json.load(open(D + 'wh_new.json')) if os.path.exists(D + 'wh_new.json') else {}
if not old and not new:
    raise SystemExit(0)
read = new.get('read') or old.get('read')
cut = (datetime.date.fromisoformat(read) - datetime.timedelta(days=30)).isoformat()
T = {}
for t in set(old.get('T', {})) | set(new.get('T', {})):
    o, n = old.get('T', {}).get(t, {}), new.get('T', {}).get(t, {})
    ev, seen = [], set()
    for e in (n.get('e') or []) + (o.get('e') or []):
        k = (e[0], e[1].strip().lower())
        if e[0] >= cut and k not in seen:
            seen.add(k); ev.append(e)
    ev.sort(key=lambda e: e[0], reverse=True)
    s = n.get('s') or o.get('s')
    if ev or s:
        T[t] = {'s': s, 'e': ev[:12]}
json.dump({'read': read, 'T': T}, open(D + 'whatsup.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('whatsup', len(T), 'stocks')
