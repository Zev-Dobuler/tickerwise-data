"""Quick publish between nightly runs (used by the 2:30 PM news task and for seeding): merges the non-stock keys of
/home/claude/tw2/data/nx_new.json (IX, TOP, SPE only) into the repo's nx.json and into the NX block of pub.json.gz, then commits and pushes.
Everything else in the public data stays exactly as the last nightly run left it. Never touches priv.bin or any portfolio data."""
import json, gzip, os, subprocess, datetime
D = '/home/claude/tw2/data/'; R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isdir(os.path.join(R, 'kit')): R = '/home/claude/tickerwise-data'
new = json.load(open(D + 'nx_new.json')); keys = [k for k in ('IX', 'TOP', 'SPE') if new.get(k)]
assert keys, 'nothing to publish'
subprocess.run(['git', '-C', R, 'pull', '-q', '--rebase'], check=True)
nx = json.load(open(os.path.join(R, 'nx.json'))); pub = json.loads(gzip.open(os.path.join(R, 'pub.json.gz')).read())
today = new.get('read') or datetime.date.today().isoformat()
for k in keys:
    nx[k] = new[k]; nx.setdefault('d', {})[k] = today
    pub.setdefault('NX', {})[k] = new[k]; pub['NX'].setdefault('d', {})[k] = today
json.dump(nx, open(os.path.join(R, 'nx.json'), 'w'), separators=(',', ':'))
with gzip.open(os.path.join(R, 'pub.json.gz'), 'wb', mtime=0) as f: f.write(json.dumps(pub, separators=(',', ':'), ensure_ascii=False).encode())
for w in ('Holdings Value', '% Holdings', 'Purchase Price', 'Shares Owned'): assert w not in json.dumps(pub), w
g = ['git', '-C', R, '-c', 'user.email=claude@anthropic.com', '-c', 'user.name=Claude']
subprocess.run(g + ['add', 'nx.json', 'pub.json.gz'], check=True)
if subprocess.run(g + ['commit', '-qm', 'Data: ' + '+'.join(keys) + ' ' + today]).returncode == 0:
    subprocess.run(g + ['push', '-q', 'origin', 'HEAD'], check=True)
    print('pushed', subprocess.run(g + ['rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip(), keys)
else: print('no change')
