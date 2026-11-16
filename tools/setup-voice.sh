#!/usr/bin/env bash
# One-time per workspace: installs the free local voice (Kokoro via sherpa-onnx). ~320 MB download from GitHub.
set -euo pipefail
D="${VOICE_DIR:-$HOME/.cache/freddy-voice}"
pip install --break-system-packages -q sherpa-onnx soundfile
if [ ! -f "$D/kokoro-multi-lang-v1_0/model.onnx" ]; then
  mkdir -p "$D" && cd "$D"
  curl -sSL -o k.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2
  tar xjf k.tar.bz2 && rm k.tar.bz2
fi
echo "voice ready in $D"
