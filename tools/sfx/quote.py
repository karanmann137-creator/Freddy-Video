#!/usr/bin/env python3
"""Sounds for the "four-word quote" red-flags video -> public/sfx/quote/. Run from the repo root: python3 tools/sfx/quote.py
Tension here is a quiet hallway: a low room tone under everything, a phone buzz, a loose wooden post, a heavy flag thunk,
a flick of paper money, a dry clock, and soft block-snaps that turn into a warm chime when the good quote is built."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/quote"
# room tone: a low hum with a slow breath of air, 48 s so one clip sits under the whole video
rt = t(48)
room = 0.5 * np.sin(2 * np.pi * 55 * rt) + 0.25 * np.sin(2 * np.pi * 110 * rt + 1) + 0.5 * filt(noise(48, 11), 80, 600) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * rt))
save(f"{D}/room.wav", room, 0.35)
# phone buzz: two quick rattles on a wooden table, then a soft message pop
one = np.sign(tone(150, 0.12)) * 0.5 + tone(300, 0.12) * 0.3 + 0.3 * filt(noise(0.12, 3), 300, 2500)
one = one * np.hanning(len(one)) ** 0.5
pop = decay(0.16, 26) * sweep(480, 1050, 0.16, 0.5)
save(f"{D}/buzz.wav", np.concatenate([one, np.zeros(int(SR * 0.07)), one, np.zeros(int(SR * 0.05)), pop * 0.8]), 0.7)
# loose post: a dry wooden creak with a knock at the end
creak = sweep(140, 260, 0.6, 1.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t(0.6))) + 0.25 * filt(noise(0.6, 9), 300, 1500)
knock = decay(0.12, 45) * tone(95, 0.12)
save(f"{D}/creak.wav", pad(np.hanning(len(creak)) ** 0.5 * creak, 0.9) + pad(delay(knock, 0.62), 0.9) * 0.8, 0.6)
# flag planted: one heavy thunk (used three times, once per flag)
th = decay(0.35, 16) * (tone(70, 0.35) + 0.5 * sweep(160, 60, 0.35, 0.4)) + 0.3 * decay(0.35, 60) * filt(noise(0.35, 5), 200, 2500)
save(f"{D}/thunk.wav", th, 0.75)
# paper money flicked across: a quick riffle
rif = sum(pad(delay(decay(0.04, 90) * filt(noise(0.04, 20 + i), 2000, 9000), 0.045 * i), 0.5) for i in range(6))
save(f"{D}/cash.wav", rif, 0.5)
# clock: dry tick / tock pairs, 6 s, one clip under the waiting beat
tk = decay(0.06, 90) * (tone(1900, 0.06) + 0.4 * filt(noise(0.06, 2), 3000, 9000))
tok = decay(0.06, 90) * (tone(1500, 0.06) + 0.4 * filt(noise(0.06, 4), 2500, 8000)) * 0.8
clock = np.zeros(int(SR * 6))
for i in range(6):
    s = tk if i % 2 == 0 else tok
    o = int(SR * i); clock[o:o + len(s)] += s
save(f"{D}/clock.wav", clock, 0.5)
# block snap: a short plastic click (used for each row of the good quote)
sn = decay(0.05, 110) * (tone(1100, 0.05) + 0.6 * filt(noise(0.05, 8), 1500, 6000))
save(f"{D}/snap.wav", pad(sn, 0.15) + 0.5 * pad(delay(sn, 0.04), 0.15), 0.55)
# warm chime for the finished quote: two soft notes
def bell(f, sec=0.9): return sum(a * tone(f * m, sec) * decay(sec, d) for m, a, d in ((1, 1, 5), (2.0, 0.25, 8)))
save(f"{D}/chime.wav", pad(bell(659.3), 1.4) + pad(delay(bell(987.8), 0.16), 1.4), 0.55)
print("quote sounds written")
