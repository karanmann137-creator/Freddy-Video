"""Building blocks for sound effects made in code (no downloaded or licensed audio).
Each video gets its own set: write tools/sfx/<slug>.py with these helpers and save into public/sfx/<slug>/."""
import os
import numpy as np, soundfile as sf
from scipy.signal import butter, lfilter

SR = 44100
def rng(seed=7): return np.random.default_rng(seed)
def t(sec): return np.linspace(0, sec, int(SR * sec), endpoint=False)
def noise(sec, seed=7): return rng(seed).standard_normal(int(SR * sec))
def filt(x, lo=None, hi=None):
    if lo and hi: b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    elif hi: b, a = butter(2, hi / (SR / 2), "low")
    else: b, a = butter(2, lo / (SR / 2), "high")
    return lfilter(b, a, x)
def sweep(f0, f1, sec, curve=1.0):
    """sine gliding from f0 to f1 Hz; curve<1 moves fast then settles, >1 the reverse"""
    x = t(sec); f = f0 + (f1 - f0) * (x / sec) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def tone(freq, sec): return np.sin(2 * np.pi * freq * t(sec))
def decay(sec, rate): return np.exp(-t(sec) * rate)
def pad(x, sec):
    """x followed by silence, so sounds of different length can be added"""
    out = np.zeros(int(SR * sec)); out[:min(len(x), len(out))] = x[:len(out)]; return out
def delay(x, sec): return np.concatenate([np.zeros(int(SR * sec)), x])
def save(path, x, peak=0.7):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    x = x / (np.abs(x).max() + 1e-9) * peak
    fade = min(len(x) // 8, 400); x[-fade:] *= np.linspace(1, 0, fade)
    sf.write(path, x.astype("float32"), SR, subtype="PCM_16")
