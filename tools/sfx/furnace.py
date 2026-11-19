#!/usr/bin/env python3
"""Sounds for the "furnace gone quiet" video -> public/sfx/furnace/. Run from the repo root: python3 tools/sfx/furnace.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/furnace"
# the cold: a thin wind in a quiet house, swelling and fading (the tension is a hush, not a riser)
w = filt(noise(2.6, 11), 200, 900); env = np.hanning(len(w)) ** 1.5
save(f"{D}/wind.wav", w * env * (0.7 + 0.3 * np.sin(t(2.6) * 5)), 0.5)
# frost forming: tiny glassy crackles
save(f"{D}/frost.wav", decay(0.12, 40) * filt(noise(0.12, 12), 4000, 12000), 0.4)
# a soft clay-and-cloth swish for each cut
save(f"{D}/swish.wav", np.hanning(len(t(0.35))) ** 2 * filt(noise(0.35, 13), 600, 3500), 0.35)
# the thermostat switch: click and clack
sw = pad(decay(0.04, 120) * (tone(2400, 0.04) + 0.5 * noise(0.04, 14)), 0.14) + 0.7 * pad(delay(decay(0.05, 100) * (tone(1500, 0.05) + 0.4 * noise(0.05, 15)), 0.07), 0.14)
save(f"{D}/click.wav", sw, 0.7)
# the dial turning: one ratchet tick, repeated
save(f"{D}/ratchet.wav", decay(0.03, 150) * (tone(3200, 0.03) + 0.6 * filt(noise(0.03, 16), 2500, 9000)), 0.45)
# the relay closing when heat is called for: a firm low clunk
save(f"{D}/relay.wav", pad(decay(0.2, 22) * sweep(180, 70, 0.2, 0.4), 0.3) + 0.5 * pad(decay(0.06, 80) * filt(noise(0.06, 17), 1500, 6000), 0.3), 0.7)
# the filter: cardboard scraping in its slot, a puff of dust, and the seat as it slides home
save(f"{D}/scrape.wav", np.hanning(len(t(0.5))) * filt(noise(0.5, 18), 500, 2800) * (0.6 + 0.4 * np.sin(t(0.5) * 60)), 0.5)
save(f"{D}/dust.wav", np.hanning(len(t(0.6))) ** 2 * filt(noise(0.6, 19), 300, 1800), 0.4)
save(f"{D}/seat.wav", decay(0.25, 16) * sweep(140, 80, 0.25, 0.4) + 0.3 * decay(0.25, 30) * filt(noise(0.25, 20), 600, 3000), 0.6)
# gas warning: two soft falling tones (a caution, not an alarm)
def beep(f, sec=0.22): return decay(sec, 9) * tone(f, sec) * np.hanning(len(t(sec))) ** 0.3
save(f"{D}/alert.wav", pad(beep(880), 0.6) + pad(delay(beep(660), 0.26), 0.6), 0.5)
# footsteps on a wood floor and the front door opening on a cold night
save(f"{D}/step.wav", decay(0.12, 28) * sweep(120, 70, 0.12, 0.5) + 0.25 * decay(0.12, 50) * filt(noise(0.12, 21), 400, 2500), 0.5)
save(f"{D}/door.wav", pad(np.hanning(len(t(0.7))) * sweep(300, 520, 0.7, 1.2) * 0.35, 0.9) + 0.4 * pad(np.hanning(len(t(0.7))) * filt(noise(0.7, 22), 200, 1200), 0.9), 0.5)
# the red X: a heavy clay thud with a short slap on top
save(f"{D}/stamp.wav", pad(decay(0.5, 10) * sweep(110, 45, 0.5, 0.35), 0.6) + 0.6 * pad(decay(0.08, 60) * filt(noise(0.08, 23), 800, 5000), 0.6), 0.9)
# the ending: a marimba-like pair of notes, a question
def mar(f, sec=0.8): return decay(sec, 6) * (tone(f, sec) + 0.3 * tone(f * 4, sec) * decay(sec, 20))
save(f"{D}/bells.wav", pad(mar(523.3), 1.2) + pad(delay(mar(784.0), 0.25), 1.2), 0.55)
print("furnace sounds written")
