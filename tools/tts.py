#!/usr/bin/env python3
"""Speak lines with the Freddy Fix It voice.

  python3 tools/tts.py <name> "line one" "line two" ...
Writes public/voice/<name>-1.wav, -2.wav ... and prints each file's length in
frames at 30fps, so the video's beats can be timed to the speech.
The voice is fixed here so every video sounds the same. Do not change VOICE or
SPEED per video.
"""
import os, sys, numpy as np, sherpa_onnx, soundfile as sf

VOICE = int(os.environ.get("FREDDY_VOICE", "16"))   # 16 = am_michael
SPEED = 1.0    # natural rate; 1.05 sounded rushed to the owner (2026-11-16)
D = os.path.join(os.environ.get("VOICE_DIR", os.path.expanduser("~/.cache/freddy-voice")), "kokoro-multi-lang-v1_0")

def main():
    name, lines = sys.argv[1], sys.argv[2:]
    cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
            model=f"{D}/model.onnx", voices=f"{D}/voices.bin", tokens=f"{D}/tokens.txt", data_dir=f"{D}/espeak-ng-data", dict_dir=f"{D}/dict", lexicon=f"{D}/lexicon-us-en.txt"),
        num_threads=4))
    tts = sherpa_onnx.OfflineTts(cfg)
    os.makedirs("public/voice", exist_ok=True)
    for i, text in enumerate(lines, 1):
        a = tts.generate(text, sid=VOICE, speed=SPEED)
        path = f"public/voice/{name}-{i}.wav"
        if not len(a.samples): sys.exit(f"voice produced no audio for: {text}")
        sf.write(path, np.asarray(a.samples, dtype="float32"), int(a.sample_rate), subtype="PCM_16")
        print(f"{path}\t{round(len(a.samples) / a.sample_rate * 30)} frames\t{text}")

main()
