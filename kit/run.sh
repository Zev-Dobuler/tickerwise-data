#!/bin/bash
# Build, encrypt and publish Tickerwise data. Run after prep.py, from anywhere.
set -euo pipefail
K="$(cd "$(dirname "$0")" && pwd)"; R="$(dirname "$K")"; B=/home/claude/tw2/build
cp "$K"/*.py "$B"/
cd "$B"
python3 bp.py
[ -f /home/claude/tw2/data/qs_raw.json ] && python3 qs.py
python3 b1.py > /dev/null; python3 pk.py > /dev/null; python3 bx.py > /dev/null; python3 bm.py > /dev/null; python3 report.py > /dev/null
python3 bundles.py | tail -1
python3 seal.py /home/claude/tw2/prev /home/claude/tw2/prev/sealed "$R/owner_pub.json"
cp /home/claude/tw2/prev/sealed/pub.json.gz /home/claude/tw2/prev/sealed/priv.bin "$R/"
cd "$R"
[ -f /home/claude/tw2/data/qstats.json ] && cp /home/claude/tw2/data/qstats.json qs.json
[ -f /home/claude/tw2/data/bullbear.json ] && cp /home/claude/tw2/data/bullbear.json bb.json
git -c user.email=claude@anthropic.com -c user.name=Claude add pub.json.gz priv.bin px.json $( [ -f qs.json ] && echo qs.json ) $( [ -f bb.json ] && echo bb.json )
git -c user.email=claude@anthropic.com -c user.name=Claude commit -qm "Data: $(date -u +%Y-%m-%d)" || { echo "no change"; exit 0; }
git -c push.negotiate=true push origin HEAD
echo "pushed $(git rev-parse --short HEAD)"
