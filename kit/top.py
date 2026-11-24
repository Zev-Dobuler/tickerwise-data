"""Latest News for the home page (Nov 22, 2026). Reads /home/claude/tw2/data/top_raw.json:
{"read": "YYYY-MM-DD", "A": [[headline written in Tickerwise's own words, source name, source URL, unix time], ...]}
(written by the nightly or the 2:30 PM news task: facts only, our own wording, never a copied headline or any article text, never images),
tags the stocks each headline names (our 167 + every index stock), and writes nx_new.json key TOP = {read, at, A:[[headline, source, url, unix time, [tickers]]]}."""
import json, os, re, gzip, time
D = '/home/claude/tw2/data/'; R = (os.environ.get('TW_REPO') or os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if not os.path.isdir(os.path.join(R, 'kit')): R = '/home/claude/tickerwise-data'
raw = json.load(open(D + 'top_raw.json'))
names = {}
try:
    for r in json.loads(gzip.open(os.path.join(R, 'pub.json.gz')).read())['R']: names[r[0]] = r[1]
except Exception as e: print('names from pub skipped:', e)
for p in (D + 'nx_new.json', os.path.join(R, 'nx.json')):
    if os.path.exists(p):
        ix = (json.load(open(p)).get('IX') or {}).get('T') or {}
        for t, v in ix.items(): names.setdefault(t, v[0])
        if ix: break
STOP = r'(,? inc\.?|,? corp(oration)?\.?|,? co\.?|,? ltd\.?|,? plc|,? n\.v\.|,? s\.a\.|,? holdings?|,? group|,? company|,? incorporated|,? limited|^the )'
def short(n):
    n = n.lower()
    for _ in range(3): n = re.sub(STOP + r'\s*$', '', re.sub('^the ', '', n)).strip(' ,.')
    return n
pats = []
for t, n in names.items():
    s = short(n)
    if len(s) >= 4: pats.append((re.compile(r'\b' + re.escape(s) + r"('s)?\b", re.I), t))
    if len(t) >= 2 and t.isalpha(): pats.append((re.compile(r'\(' + re.escape(t) + r'\)|\$' + re.escape(t) + r'\b'), t))
A = []
for h in raw['A'][:20]:
    tk = []
    for rx, t in pats:
        if rx.search(h[0]) and t not in tk and t.replace('GOOGL', 'GOOG') not in tk: tk.append(t)
    A.append([h[0], h[1], h[2], int(h[3]), tk[:3]])
A.sort(key=lambda x: -x[3])
n = json.load(open(D + 'nx_new.json')) if os.path.exists(D + 'nx_new.json') else {'read': raw['read']}
n['TOP'] = {'read': raw['read'], 'at': int(time.time()), 'A': A}
json.dump(n, open(D + 'nx_new.json', 'w'), separators=(',', ':'))
print('TOP', len(A), 'headlines,', sum(1 for a in A if a[4]), 'tagged')
