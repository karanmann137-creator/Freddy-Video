#!/usr/bin/env bash
# Usage: ./render.sh <CompositionId> <output.mp4>      full video
#        ./render.sh <CompositionId> <output.png> 120  one frame (for checking)
set -euo pipefail
B="--browser-executable=${CHROME:-/usr/bin/google-chrome} --gl=swangle --log=error"
if [ $# -ge 3 ]; then npx remotion still src/index.ts "$1" "$2" --frame="$3" --scale=0.25 $B
else npx remotion render src/index.ts "$1" "$2" $B; fi
