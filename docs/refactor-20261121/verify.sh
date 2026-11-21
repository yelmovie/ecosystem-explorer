#!/bin/zsh
# 사용: verify.sh <파일> — HEAD 판과 지금 판을 esbuild로 압축해 결과가 똑같은지 본다(같으면 동작이 같다).
ES="/Volumes/T7 Shield/iscreammedia_sc34/13 nightsky/node_modules/.bin/esbuild"; F=$1; D="${0:A:h}/v"; mkdir -p "$D"
git show HEAD:"$F" > "$D/a.js"; cp "$F" "$D/b.js"
"$ES" "$D/a.js" --minify --format=esm --log-level=error > "$D/a.min" 2>"$D/a.err"; "$ES" "$D/b.js" --minify --format=esm --log-level=error > "$D/b.min" 2>"$D/b.err"
if cmp -s "$D/a.min" "$D/b.min" && [ -s "$D/a.min" ]; then echo "SAME $F"; else echo "DIFF $F"; cat "$D/b.err" | head -3; fi
