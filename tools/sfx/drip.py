#!/usr/bin/env python3
"""Sounds for the "2 a.m. drip" video -> public/sfx/drip/. Run from the repo root: python3 tools/sfx/drip.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/drip"
# a clock in a silent house: the tension in this video is quiet, not a riser
save(f"{D}/tick.wav", decay(0.09, 70) * (tone(1500, 0.09) + 0.4 * filt(noise(0.09, 1), 2500, 8000)), 0.5)
save(f"{D}/tock.wav", decay(0.11, 55) * (tone(980, 0.11) + 0.4 * filt(noise(0.11, 2), 1500, 6000)), 0.5)
# the cut to the tap: a soft low thud, like a heart skipping
save(f"{D}/thud.wav", decay(0.45, 9) * sweep(95, 48, 0.45, 0.4), 0.8)
# a water drop landing in a basin: a quick rising chirp, with a fainter echo off the porcelain
drop = decay(0.28, 16) * sweep(680, 1550, 0.28, 0.25)
save(f"{D}/plink.wav", pad(drop, 0.5) + 0.3 * pad(delay(drop, 0.11), 0.5), 0.7)
# the same drop into a full bucket: lower, rounder, with a little slosh
deep = decay(0.4, 9) * sweep(300, 640, 0.4, 0.3)
save(f"{D}/plunk.wav", pad(deep, 0.6) + 0.25 * pad(decay(0.5, 7) * filt(noise(0.5, 3), 300, 1800), 0.6), 0.7)
# paper: the note sliding onto the wall, and a calendar page being torn off
save(f"{D}/slide.wav", np.hanning(len(t(0.32))) ** 2 * filt(noise(0.32, 4), 1200, 6000), 0.4)
save(f"{D}/page.wav", decay(0.14, 22) * filt(noise(0.14, 5), 2200, 9000), 0.55)
# the ending: two soft bell notes rising, like a question
def bell(f, sec=0.9): return sum(a * tone(f * m, sec) * decay(sec, d) for m, a, d in ((1, 1, 4), (2.01, 0.35, 6), (3.0, 0.15, 9)))
save(f"{D}/chime.wav", pad(bell(659.3), 1.3) + pad(delay(bell(880.0), 0.22), 1.3), 0.6)
print("drip sounds written")
