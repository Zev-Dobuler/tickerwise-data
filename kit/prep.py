"""Prepare Tickerwise inputs from the nightly report run.
usage: python3 prep.py --datasets DIR --files DIR --sheet FILE [--themes FILE]
  --datasets  folder with the final <id>.json of every dashboard dataset
  --files     folder written by ArtifactData list collection 'files' (out_dir/files: index.html.json, m.js.json, ...)
  --sheet     text of the Schwab Google Sheet (Holdings table as returned by Google Drive read_file_content)
  --themes    optional JSON {ticker: theme} for holdings"""
import argparse, glob, json, os, re, shutil
a = argparse.ArgumentParser(); a.add_argument('--datasets', required=True); a.add_argument('--files', required=True); a.add_argument('--sheet', required=True); a.add_argument('--themes')
o = a.parse_args()
T = '/home/claude/tw2/'
for d in ['build', 'data', 'work', 'prev', 'page']: os.makedirs(T + d, exist_ok=True)
n = 0
for f in glob.glob(os.path.join(o.datasets, '*.json')):
    i = os.path.basename(f)[:-5]
    if '.' in i: continue
    json.load(open(f)); shutil.copy(f, T + 'data/' + i + '.json'); n += 1
for f in glob.glob(os.path.join(o.files, '*.json')):
    d = json.load(open(f)); open(T + 'page/' + os.path.basename(f)[:-5], 'w').write(d['text'] if 'text' in d else d['data']['text'])
txt = open(o.sheet).read()
txt = txt.split('Sheet Name: Wish List')[0]
K = ['Tickers', 'Holdings Value', '% Holdings', 'Price', 'Shares Owned', 'Purchase Price', 'Holding Gain Change $', 'Holding Gain Change %', 'Industry']
num = lambda s: float(re.sub(r'[\\$,%\s]', '', s).replace('−', '-')) if re.search(r'\d', s) else None
rows = []
for line in txt.splitlines():
    c = [x.strip() for x in line.strip().strip('|').split('|')]
    if len(c) < 9 or not re.fullmatch(r'[A-Z][A-Z0-9.\-]{0,9}', c[0] or '') or c[0] == 'Tickers': continue
    rows.append(dict(zip(K, [c[0]] + [num(x) for x in c[1:8]] + [c[8]])))
assert len(rows) >= 5, 'could not read the Holdings table from the sheet text'
json.dump(rows, open(T + 'data/schwab.json', 'w'))
if o.themes: shutil.copy(o.themes, T + 'data/themes.json')
k = os.path.dirname(os.path.abspath(__file__))
for f in glob.glob(k + '/*.py'): shutil.copy(f, T + 'build/')
for f in ('report-tw.js', 'report.css'): shutil.copy(os.path.join(k, f), T + 'prev/' + f)
print('datasets', n, 'holdings', len(rows), 'page files', len(os.listdir(T + 'page')))
