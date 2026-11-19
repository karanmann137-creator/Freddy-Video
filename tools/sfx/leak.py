#!/usr/bin/env python3
"""Sounds for the "Leak." job-text video -> public/sfx/leak/. Run from the repo root: python3 tools/sfx/leak.py
Tension here is a phone, a van and a ticking clock: buzz, message pops, wipers, engine, door, torch click, clock ticks."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import numpy as np
from sfxlib import *

D = "public/sfx/leak"
# phone on a dash: two quick buzzes (low square-ish hum, rattling)
one = np.sign(tone(170, 0.14)) * 0.5 + tone(340, 0.14) * 0.3 + 0.25 * filt(noise(0.14, 3), 300, 2500)
one = one * np.hanning(len(one)) ** 0.5
save(f"{D}/buzz.wav", np.concatenate([one, np.zeros(int(SR * 0.08)), one]), 0.7)
# message bubbles: a soft pop going up (sent) and a softer one (received)
save(f"{D}/pop.wav", decay(0.16, 28) * sweep(500, 1100, 0.16, 0.5), 0.6)
save(f"{D}/pop2.wav", decay(0.18, 24) * sweep(900, 520, 0.18, 0.5), 0.5)
# wiper: a swish of rubber on glass and a small thunk at the end
sw = np.hanning(len(t(0.45))) ** 2 * filt(noise(0.45, 6), 1500, 7000)
save(f"{D}/wiper.wav", pad(sw, 0.6) + pad(delay(decay(0.1, 40) * tone(120, 0.1), 0.42), 0.6) * 0.6, 0.5)
# engine: low rumble with a slow wobble, fading as the van slows
e = t(2.2)
rum = (0.6 * np.sin(2 * np.pi * 52 * e + 2 * np.sin(2 * np.pi * 3 * e)) + 0.35 * filt(noise(2.2, 8), 60, 400)) * np.linspace(1, 0.15, len(e))
save(f"{D}/engine.wav", rum, 0.6)
# brakes: a short high squeak, then a door creak (slow falling sweep with a rough edge)
save(f"{D}/squeak.wav", np.hanning(len(t(0.3))) * sweep(2400, 1800, 0.3, 0.8) * 0.4, 0.4)
creak = sweep(180, 300, 0.7, 1.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * t(0.7))) + 0.2 * filt(noise(0.7, 9), 400, 1800)
save(f"{D}/creak.wav", np.hanning(len(creak)) ** 0.5 * creak, 0.6)
# torch switch: click-click
cl = decay(0.03, 160) * (tone(2200, 0.03) + 0.5 * filt(noise(0.03, 5), 1500, 7000))
save(f"{D}/click.wav", pad(cl, 0.12) + pad(delay(cl * 0.7, 0.06), 0.12), 0.6)
# water drops: a hollow plink for the ceiling stain, a quieter tip for the trail
dr = decay(0.3, 14) * sweep(520, 1250, 0.3, 0.3)
save(f"{D}/plink.wav", pad(dr, 0.5) + 0.3 * pad(delay(dr, 0.1), 0.5), 0.6)
save(f"{D}/tip.wav", decay(0.12, 30) * sweep(800, 1300, 0.12, 0.4), 0.4)
# clock: dry tick/tock for the hours going by, and a whoosh for time passing
save(f"{D}/tick.wav", decay(0.07, 80) * (tone(1900, 0.07) + 0.4 * filt(noise(0.07, 2), 3000, 9000)), 0.5)
wh = np.hanning(len(t(1.0))) ** 2 * filt(noise(1.0, 4), 300, 3500)
save(f"{D}/whoosh.wav", wh, 0.45)
# ending: a text-message ding, two quick notes (the question is a phone buzzing in a mate's pocket)
def bell(f, sec=0.7): return sum(a * tone(f * m, sec) * decay(sec, d) for m, a, d in ((1, 1, 6), (2.0, 0.3, 9)))
save(f"{D}/ding.wav", pad(bell(1046.5), 1.0) + pad(delay(bell(1568.0), 0.14), 1.0), 0.6)
print("leak sounds written")
