#!/usr/bin/env python3
"""Sounds for the "phone won't stop buzzing" video -> public/sfx/chinook/. Run from the repo root: python3 tools/sfx/chinook.py
The picture is a rainy kitchen, so the bed is rain plus a low room hum; the rain stops at the turn and the room goes warm."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/chinook"
# rain on a window: thousands of separate drop hits (not a hiss) over a soft low wash, looped (last half second fades into the first)
n = 10.0; N = int(SR * n)
g = rng(21)
def pinkish(sec, seed):
    x = np.fft.rfft(rng(seed).standard_normal(int(SR * sec))); f = np.maximum(np.arange(len(x)), 1)
    return np.fft.irfft(x / np.sqrt(f), int(SR * sec))
wash = filt(pinkish(n, 22), 300, 3500) * 3.0 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.17 * t(n)))
drops = np.zeros(N + SR)
def hit(pos, amp, fc, ln, q):
    m = int(SR * ln); tt = np.arange(m) / SR
    burst = filt(g.standard_normal(m), fc * 0.7, min(fc * 1.5, 16000)) * np.exp(-tt * q)
    tone_ = np.sin(2 * np.pi * fc * 0.6 * tt) * np.exp(-tt * q * 1.4) * 0.4
    drops[pos:pos + m] += amp * (burst + tone_)
for _ in range(int(n * 520)):                      # fine patter on the glass
    hit(int(g.integers(0, N)), g.uniform(0.05, 0.22), g.uniform(2500, 7500), 0.012, g.uniform(350, 700))
for _ in range(int(n * 70)):                       # bigger drops: rounder, lower
    hit(int(g.integers(0, N)), g.uniform(0.25, 0.7), g.uniform(900, 2200), 0.03, g.uniform(150, 300))
for _ in range(int(n * 6)):                        # a few heavy ones on the sill
    hit(int(g.integers(0, N)), g.uniform(0.8, 1.2), g.uniform(500, 900), 0.06, g.uniform(60, 110))
r = drops[:N] + wash
k = int(SR * 0.5); r = r.copy(); r[:k] = r[:k] * np.linspace(0, 1, k) + r[-k:] * np.linspace(1, 0, k); r = r[:-k]
save(f"{D}/rain.wav", r, 0.6)
# room tone: a fridge-hum under everything
h = 10.0
rt = 0.6 * np.sin(2 * np.pi * 60 * t(h)) + 0.3 * np.sin(2 * np.pi * 120 * t(h)) + 0.25 * filt(noise(h, 31), 80, 500)
save(f"{D}/room.wav", rt, 0.4)
# phone buzzing on a counter: two short vibrating bursts
def burst(): return decay(0.16, 10) * np.sign(np.sin(2 * np.pi * 135 * t(0.16))) * 0.5 + decay(0.16, 12) * filt(noise(0.16, 41), 300, 2500) * 0.5
b = burst(); save(f"{D}/buzz.wav", np.concatenate([b, np.zeros(int(SR * 0.07)), b, np.zeros(int(SR * 0.07)), b]), 0.7)
# pencil on paper
sc = filt(noise(0.7, 51), 1500, 7000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * t(0.7)))) * np.hanning(len(t(0.7)))
save(f"{D}/pencil.wav", sc, 0.4)
# doorbell: two bell notes, high then low
def bell(f, sec=1.1): return sum(a * tone(f * m, sec) * decay(sec, d) for m, a, d in ((1, 1, 3.2), (2.0, 0.3, 5), (3.0, 0.12, 8)))
save(f"{D}/doorbell.wav", pad(bell(784), 1.9) + pad(delay(bell(622), 0.55), 1.9), 0.7)
# thumb tap on glass
save(f"{D}/tap.wav", decay(0.12, 40) * sweep(420, 180, 0.12, 0.5), 0.6)
# coins: a bright metallic clink
def clink(f): return decay(0.5, 11) * (tone(f, 0.5) + 0.7 * tone(f * 2.76, 0.5) + 0.4 * tone(f * 5.4, 0.5))
save(f"{D}/coin.wav", pad(clink(2350), 0.7) + 0.5 * pad(delay(clink(3100), 0.06), 0.7), 0.55)
# lock: a short click then a low seat
save(f"{D}/lock.wav", pad(decay(0.04, 120) * filt(noise(0.04, 61), 1500, 8000), 0.4) + pad(delay(decay(0.2, 22) * sweep(220, 110, 0.2, 0.5), 0.07), 0.4), 0.7)
# the turn: rain stops, one soft low note under the "better way"
save(f"{D}/warm.wav", np.hanning(len(t(1.6))) * (tone(196, 1.6) + 0.5 * tone(293.7, 1.6) + 0.3 * tone(392, 1.6)), 0.4)
# the ending: two rising soft notes
def bell2(f, sec=0.9): return sum(a * tone(f * m, sec) * decay(sec, d) for m, a, d in ((1, 1, 4), (2.01, 0.35, 6), (3.0, 0.15, 9)))
save(f"{D}/chime.wav", pad(bell2(523.3), 1.3) + pad(delay(bell2(784.0), 0.22), 1.3), 0.6)
print("chinook sounds written")
