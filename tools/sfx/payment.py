#!/usr/bin/env python3
"""Sounds for the "Don't load the van yet" video -> public/sfx/payment/. Run from the repo root: python3 tools/sfx/payment.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/payment"
# the bed: a soft winter wind under the whole video, slowly swelling and easing off
L = 60
w = filt(noise(L, 11), 120, 900)
swell = 0.6 + 0.4 * np.sin(2 * np.pi * t(L) / 9.0) * np.sin(2 * np.pi * t(L) / 23.0)
fade = np.minimum(1, np.minimum(t(L) / 1.5, (L - t(L)) / 2.0))
save(f"{D}/wind.wav", w * swell * fade, 0.5)
# a phone buzzing on a hard dash: two short rattly pulses
def bz(sec):
    x = np.sign(np.sin(2 * np.pi * 150 * t(sec))) * 0.6 + 0.4 * filt(noise(sec, 3), 100, 400)
    return x * np.hanning(len(x)) ** 0.3
buzz = pad(bz(0.32), 0.42)
save(f"{D}/buzz.wav", np.concatenate([buzz, buzz]), 0.6)
# the invoice leaving the phone: a short airy swish
save(f"{D}/whoosh.wav", np.hanning(len(t(0.45))) ** 2 * filt(noise(0.45, 5), 900, 5000), 0.4)
# the cabinet door catching on its frame: a wooden knock and a short rub
knock = decay(0.25, 28) * (sweep(220, 140, 0.25, 0.4) + 0.5 * filt(noise(0.25, 6), 300, 2000))
rub = np.hanning(len(t(0.22))) * filt(noise(0.22, 7), 600, 2500) * 0.4
save(f"{D}/catch.wav", pad(knock, 0.5) + pad(delay(rub, 0.08), 0.5), 0.7)
# the clock on the bathroom wall: quick ticks as time passes
tk = decay(0.06, 80) * (tone(1700, 0.06) + 0.3 * filt(noise(0.06, 8), 3000, 8000))
seq = np.zeros(int(SR * 4.2))
for i in range(12):
    s0 = int(SR * i * 0.34); seq[s0:s0 + len(tk)] += tk * (0.6 if i % 2 else 1.0)
save(f"{D}/ticks.wav", seq, 0.45)
# the rewind: a tape spinning backward, a rising flutter
r = sweep(300, 1400, 1.6, 1.4) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * t(1.6))) * np.hanning(len(t(1.6))) ** 0.5
save(f"{D}/rewind.wav", r + 0.2 * filt(noise(1.6, 9), 2000, 7000) * np.hanning(len(t(1.6))), 0.5)
# the light switch
save(f"{D}/click.wav", decay(0.05, 120) * filt(noise(0.05, 10), 1500, 7000) + pad(delay(decay(0.04, 140) * tone(2400, 0.04), 0.03), 0.05)[:len(t(0.05))], 0.6)
# the van's sliding door shutting: a roll, then a solid thunk
roll = np.hanning(len(t(0.35))) * filt(noise(0.35, 12), 200, 1500) * 0.5
thunk = decay(0.4, 12) * (sweep(120, 55, 0.4, 0.4) + 0.3 * filt(noise(0.4, 13), 80, 600))
save(f"{D}/slam.wav", pad(roll, 0.8) + pad(delay(thunk, 0.32), 0.8), 0.8)
# the question: two soft notes, low then high, with a little air
def bell(f, sec=1.0): return sum(a * tone(f * m, sec) * decay(sec, d) for m, a, d in ((1, 1, 4), (2.0, 0.3, 7), (3.0, 0.1, 10)))
save(f"{D}/chime.wav", pad(bell(523.3), 1.4) + pad(delay(bell(784.0), 0.25), 1.4), 0.55)
print("payment sounds written")
