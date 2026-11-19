#!/usr/bin/env python3
"""Sounds for the "still paying for leads" video -> public/sfx/leads/. Run from the repo root: python3 tools/sfx/leads.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/leads"
def ring(f, sec, d): return decay(sec, d) * (tone(f, sec) + 0.5 * tone(f * 2.76, sec) * decay(sec, d * 2))
# coins: bright metal rings
save(f"{D}/coin.wav", pad(ring(2400, 0.5, 9), 0.6) + 0.5 * pad(delay(ring(3100, 0.4, 11), 0.05), 0.6), 0.6)
save(f"{D}/hop.wav", pad(ring(2000, 0.25, 16), 0.3), 0.4)
save(f"{D}/pocket.wav", sum(pad(delay(ring(1800 + 400 * i, 0.2, 18), 0.06 * i), 0.5) for i in range(4)), 0.5)
# the slot swallowing a coin, and a card of paper sliding out
save(f"{D}/slot.wav", pad(decay(0.12, 40) * (sweep(500, 180, 0.12, 0.5) + 0.4 * filt(noise(0.12, 31), 800, 4000)), 0.2), 0.6)
save(f"{D}/paper.wav", np.hanning(len(t(0.35))) ** 2 * filt(noise(0.35, 32), 1500, 7000), 0.4)
# a phone nobody answers: an old two-tone ring, then silence
def burst(sec=0.5):
    env = (np.sin(2 * np.pi * 20 * t(sec)) > 0) * 1.0 * np.hanning(len(t(sec))) ** 0.2
    return env * (tone(440, sec) + tone(480, sec)) * 0.5
save(f"{D}/ring.wav", pad(burst(), 0.7), 0.5)
# the map waking up: a soft rising shimmer
x = t(0.9); save(f"{D}/lights.wav", np.hanning(len(x)) * (sweep(220, 880, 0.9, 1.5) * 0.4 + 0.2 * filt(noise(0.9, 33), 2000, 9000)), 0.45)
# a card landing in the tray: a soft pluck, in two pitches
def pluck(f, sec=0.35): return decay(sec, 11) * (tone(f, sec) + 0.4 * tone(f * 2, sec) * decay(sec, 20))
save(f"{D}/land1.wav", pad(pluck(587.3), 0.45), 0.5)
save(f"{D}/land2.wav", pad(pluck(740.0), 0.45), 0.5)
# flicking through cards, a tap, the tick, a swipe
save(f"{D}/flick.wav", decay(0.05, 70) * filt(noise(0.05, 34), 2500, 9000), 0.35)
save(f"{D}/tap.wav", decay(0.1, 45) * (sweep(900, 400, 0.1, 0.5) + 0.3 * filt(noise(0.1, 35), 1000, 5000)), 0.6)
save(f"{D}/check.wav", pad(ring(1318.5, 0.4, 8), 0.5) + pad(delay(ring(1760, 0.4, 8), 0.12), 0.5), 0.45)
save(f"{D}/sweep.wav", np.hanning(len(t(0.4))) ** 1.5 * filt(noise(0.4, 36), 700, 5000), 0.45)
# the lid closing: a heavy, low thunk
save(f"{D}/lid.wav", pad(decay(0.35, 14) * sweep(150, 60, 0.35, 0.4), 0.4) + 0.4 * pad(decay(0.06, 70) * filt(noise(0.06, 37), 500, 3500), 0.4), 0.8)
# the question at the end: two plucked notes, rising
save(f"{D}/ask.wav", pad(pluck(392.0, 0.6), 1.0) + pad(delay(pluck(523.3, 0.6), 0.22), 1.0), 0.5)
print("leads sounds written")
