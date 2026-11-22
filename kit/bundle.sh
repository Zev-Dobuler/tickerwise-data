#!/bin/bash
# Builds site/bundle.js: app5..app21 in order, minified. app10's own loader is skipped by setting window.__twMore first.
set -e
R=/home/claude/tickerwise-data/site
T=$(mktemp)
for n in 5 6 7 8 9; do cat $R/app$n.js; echo ';'; done > $T
echo 'window.__twMore=1;' >> $T
for n in 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25; do cat $R/app$n.js; echo ';'; done >> $T
/home/claude/tools/node_modules/.bin/terser $T -c passes=1 -m --ecma 2020 -o $R/bundle.js
rm $T; ls -la $R/bundle.js
