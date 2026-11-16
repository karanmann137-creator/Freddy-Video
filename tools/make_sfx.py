#!/usr/bin/env python3
"""Builds the sound-effect kit in public/sfx/ from scratch (no downloaded or licensed audio).
Run once after changing this file: python3 tools/make_sfx.py. The wav files are committed."""
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter

SR = 44100
rng = np.random.default_rng(7)
def t(sec): return np.linspace(0, sec, int(SR * sec), endpoint=False)
def filt(x, lo=None, hi=None):
    if lo and hi: b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    elif hi: b, a = butter(2, hi / (SR / 2), "low")
    else: b, a = butter(2, lo / (SR / 2), "high")
    return lfilter(b, a, x)
def sweep(f0, f1, sec, curve=1.0):
    x = t(sec); f = f0 + (f1 - f0) * (x / sec) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def save(name, x, peak=0.7):
    x = x / (np.abs(x).max() + 1e-9) * peak
    fade = min(len(x) // 8, 400); x[-fade:] *= np.linspace(1, 0, fade)
    sf.write(f"public/sfx/{name}.wav", x.astype("float32"), SR, subtype="PCM_16")

# riser: 2 s of rising tension, ends exactly at its last sample -> place it so it ends on the reveal
x = t(2.0); env = (x / 2.0) ** 2.2
trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(4 + 22 * (x / 2.0) ** 2) / SR)
save("riser", env * trem * (0.6 * sweep(180, 1400, 2.0, 2) + 0.5 * filt(rng.standard_normal(len(x)), 800, 6000)))

# impact: deep hit for the big moment
x = t(1.3); save("impact", np.exp(-x * 4.2) * sweep(130, 38, 1.3, 0.35) + 0.5 * np.exp(-x * 30) * filt(rng.standard_normal(len(x)), hi=2500), 0.9)

# whoosh: camera move / transition
x = t(0.55); n = rng.standard_normal(len(x)); k = (x / 0.55)
save("whoosh", np.hanning(len(x)) ** 1.5 * ((1 - k) * filt(n, 300, 1500) + k * filt(n, 1500, 7000)), 0.6)

# pop: a number badge or item appearing
x = t(0.14); save("pop", np.exp(-x * 38) * sweep(720, 300, 0.14), 0.6)

# ding: success / end card
x = t(1.0); save("ding", sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x * d) for f, a, d in [(1318.5, 1, 4.5), (1975.5, 0.5, 6), (2637, 0.3, 8)]), 0.6)

# tick: counters and countdowns
x = t(0.04); save("tick", np.exp(-x * 160) * np.sin(2 * np.pi * 2100 * x), 0.5)

# spray: water, air or steam hissing; fades out over 1.6 s
x = t(1.6); save("spray", np.exp(-x * 1.6) * filt(rng.standard_normal(len(x)), 1800, 9000), 0.5)

# glitch: something breaking or going wrong
x = t(0.35); g = np.sign(np.sin(2 * np.pi * 90 * x)) * (rng.random(len(x)) > 0.35); save("glitch", filt(g * np.exp(-x * 5), 200, 5000), 0.5)
print("sfx written")
