#!/bin/bash
# Build, encrypt and publish Tickerwise data. Run after prep.py, from anywhere.
set -euo pipefail
K="$(cd "$(dirname "$0")" && pwd)"; R="$(dirname "$K")"; B=/home/claude/tw2/build; export TW_REPO="$R"
cp "$K"/*.py "$B"/
cd "$B"
python3 bp.py
[ -f /home/claude/tw2/data/qs_raw.json ] && python3 qs.py
[ -f /home/claude/tw2/data/zs_raw.json ] && python3 -c "import json,os;D='/home/claude/tw2/data/';R='$R/zs.json';o=json.load(open(D+'zstyle.json' if os.path.exists(D+'zstyle.json') else R)) if os.path.exists(D+'zstyle.json') or os.path.exists(R) else {'T':{}};n=json.load(open(D+'zs_raw.json'));o['T'].update(n['T']);o['read']=n['read'];json.dump(o,open(D+'zstyle.json','w'),separators=(',',':'))"
python3 wh.py
[ -f /home/claude/tw2/data/ix_raw.json ] && python3 ix.py
[ -f /home/claude/tw2/data/top_raw.json ] && python3 top.py
[ -f /home/claude/tw2/data/spe_raw.json ] && python3 -c "import json,os;D='/home/claude/tw2/data/';p=D+'nx_new.json';n=json.load(open(p)) if os.path.exists(p) else {};n['SPE']=json.load(open(D+'spe_raw.json'));json.dump(n,open(p,'w'),separators=(',',':'))"
[ -f /home/claude/tw2/data/nx_new.json ] && python3 nx.py
[ -f /home/claude/tools/node_modules/d3/dist/d3.min.js ] || npm i -s --prefix /home/claude/tools d3@7.9.0 >/dev/null 2>&1
node "$K/cardov.js" || echo 'cardov failed: card numbers left blank (no Excel fallback)'
python3 qh.py
python3 b1.py > /dev/null; python3 pk.py > /dev/null; python3 bx.py > /dev/null; python3 bm.py > /dev/null; python3 report.py > /dev/null
python3 bundles.py | tail -1
python3 "$K/snap.py" /home/claude/tw2/prev/pub.json "$R/scores_hist.json"
python3 seal.py /home/claude/tw2/prev /home/claude/tw2/prev/sealed "$R/owner_pub.json"
cp /home/claude/tw2/prev/sealed/pub.json.gz /home/claude/tw2/prev/sealed/priv.bin "$R/"
cd "$R"
[ -f /home/claude/tw2/data/qstats.json ] && cp /home/claude/tw2/data/qstats.json qs.json
[ -f /home/claude/tw2/data/bullbear.json ] && cp /home/claude/tw2/data/bullbear.json bb.json
[ -f /home/claude/tw2/data/zstyle.json ] && cp /home/claude/tw2/data/zstyle.json zs.json
[ -f /home/claude/tw2/data/whatsup.json ] && cp /home/claude/tw2/data/whatsup.json wh.json
[ -f /home/claude/tw2/data/qhist.json ] && cp /home/claude/tw2/data/qhist.json qh.json
[ -f /home/claude/tw2/data/nx.json ] && cp /home/claude/tw2/data/nx.json nx.json
git -c user.email=claude@anthropic.com -c user.name=Claude add pub.json.gz priv.bin px.json scores_hist.json $( [ -f qs.json ] && echo qs.json ) $( [ -f bb.json ] && echo bb.json ) $( [ -f zs.json ] && echo zs.json ) $( [ -f wh.json ] && echo wh.json ) $( [ -f qh.json ] && echo qh.json ) $( [ -f nx.json ] && echo nx.json )
git -c user.email=claude@anthropic.com -c user.name=Claude commit -qm "Data: $(date -u +%Y-%m-%d)" || { echo "no change"; exit 0; }
git -c push.negotiate=true push origin HEAD
echo "pushed $(git rev-parse --short HEAD)"
