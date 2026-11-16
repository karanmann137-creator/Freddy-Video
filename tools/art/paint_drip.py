#!/usr/bin/env python3
"""Paints the three paper-cut pictures for the "2 a.m. drip" video into public/art/drip/.
Run from the repo root: python3 tools/art/paint_drip.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "vendor", "claude-drawing", "lib"))
import numpy as np
from papercut import Collage

OUT = "public/art/drip"
W, H = 1080, 1920
def R(x0, y0, x1, y1): return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
def ell(cx, cy, rx, ry, n=40): return [(cx + rx * np.cos(a), cy + ry * np.sin(a)) for a in np.linspace(0, 2 * np.pi, n, endpoint=False)]

# ------------------------------------------------------------------ A: the street at 2 a.m.
c = Collage(W, H, seed=11); rng = c.rng
c.background('#151d45', texture='crayon')
for _ in range(70):
    c.dot(rng.uniform(20, W - 20), rng.uniform(40, 1150), rng.uniform(1.8, 4.2), '#f3e6b0')
c.glow(830, 730, 230, '#f3e6b0', 0.28)
c.piece(mask=c.circle_mask(830, 730, 104), colour='#f4e3a1', texture='crayon', torn=0.35, rim=0.7, shadow=0.3)
c.piece(mask=c.cloud_mask(700, 800, 300, 100, puffs=4, seed=3), colour='#2a3670', texture='paper', torn=0.7, rim=0.5, shadow=0.3)
xs = np.linspace(-20, W + 20, 40)
c.piece([(x, 1190 - 50 * np.sin(x / 210 + 0.6)) for x in xs] + [(W + 20, H + 20), (-20, H + 20)], '#1f2b63', torn=0.8, rim=0.5, shadow=0.35)
c.piece([(x, 1470 - 28 * np.sin(x / 260 + 2.0)) for x in xs] + [(W + 20, H + 20), (-20, H + 20)], '#cdd8ef', torn=0.8, rim=0.9, shadow=0.4)

def house(x, base, w, h, body, roof, win, lit=None):
    c.piece(R(x - w / 2, base - h, x + w / 2, base), body, torn=0.2, rim=0.4, shadow=0.4)
    c.piece([(x - w / 2 - 22, base - h + 6), (x + w / 2 + 22, base - h + 6), (x, base - h - w * 0.5)], roof, torn=0.25, rim=0.5, shadow=0.4)
    c.piece(R(x - w * 0.09, base - h * 0.42, x + w * 0.09, base), '#5b3f30', torn=0.1, rim=0.2, shadow=0.2)
    for i, wx in enumerate((-w * 0.28, w * 0.28)):
        col = '#ffd866' if lit == i else win
        box = R(x + wx - w * 0.1, base - h * 0.86, x + wx + w * 0.1, base - h * 0.58)
        if lit == i: c.glow(x + wx, base - h * 0.72, w * 0.22, '#ffd866', 0.5)
        c.piece(box, col, torn=0.05, rim=0.15, shadow=0.2)

house(190, 1500, 230, 190, '#39457f', '#262c58', '#1c2249')
house(905, 1515, 210, 170, '#414c86', '#2a305e', '#1c2249')
c.piece(R(640, 1090, 690, 1210), '#8a3f30', torn=0.2, rim=0.3, shadow=0.3)          # chimney
house(540, 1560, 420, 340, '#e2c9a4', '#b4503a', '#3a4170', lit=0)
for tx, ty, r in ((60, 1560, 58), (1010, 1600, 64), (330, 1610, 44)):
    c.piece(R(tx - 7, ty, tx + 7, ty + 70), '#4a3628', torn=0.1, rim=0.2, shadow=0.2)
    c.piece(mask=c.circle_mask(tx, ty - 10, r), colour='#24523f', texture='crayon', torn=0.5, rim=0.6, shadow=0.35)
c.piece([(x, 1730 - 22 * np.sin(x / 190 + 4.0)) for x in xs] + [(W + 20, H + 20), (-20, H + 20)], '#e8eef9', torn=0.8, rim=0.9, shadow=0.4)
c.save(f"{OUT}/street.jpg"); print("street done")

# ------------------------------------------------------------------ B: the bathroom tap
c = Collage(W, H, seed=23); rng = c.rng
c.background('#bcd6d3', texture='paper')
for x in range(135, W, 270): c.crayon([(x, 0), (x, 1240)], 5, '#a3c4c1', 0.7)
for y in range(140, 1240, 270): c.crayon([(0, y), (W, y)], 5, '#a3c4c1', 0.7)
c.piece(R(-20, 1230, W + 20, H + 20), '#d9c7a6', texture='kraft', torn=0.3, rim=0.5, shadow=0.4)      # counter
c.piece(ell(560, 1400, 430, 170), '#f6f3ec', torn=0.3, rim=0.6, shadow=0.45)                           # basin
c.piece(ell(560, 1410, 350, 120), '#dbe4e8', torn=0.2, rim=0.3, shadow=0.0)
c.piece(mask=c.circle_mask(560, 1440, 22), colour='#7d8891', torn=0.1, rim=0.1, shadow=0.0)            # drain
c.piece(R(600, 930, 690, 1290), '#98a3ac', torn=0.15, rim=0.4, shadow=0.4)                             # tap post
c.piece(R(390, 900, 690, 985), '#a7b1b9', torn=0.15, rim=0.4, shadow=0.4)                              # spout arm
c.piece(R(390, 985, 462, 1060), '#98a3ac', torn=0.15, rim=0.3, shadow=0.35)                            # nozzle
c.piece(R(570, 850, 720, 892), '#7f8a93', torn=0.15, rim=0.3, shadow=0.35)                             # handle
c.piece(mask=c.circle_mask(735, 870, 34), colour='#d9534a', texture='crayon', torn=0.3, rim=0.5, shadow=0.35)
c.piece(R(820, 1215, 1010, 1262), '#e9a7a0', texture='crayon', torn=0.5, rim=0.6, shadow=0.35)         # soap dish
c.piece(ell(915, 1205, 62, 30), '#fbf4e6', torn=0.3, rim=0.4, shadow=0.3)
c.save(f"{OUT}/tap.jpg"); print("tap done")

# ------------------------------------------------------------------ C: the same tap, three months on
c.piece(mask=c.cloud_mask(250, 1640, 420, 120, puffs=4, seed=8), colour='#8fc4e8', texture='paper', torn=0.7, rim=0.7, shadow=0.2)   # puddle
c.piece(mask=c.cloud_mask(840, 1720, 300, 90, puffs=3, seed=9), colour='#8fc4e8', texture='paper', torn=0.7, rim=0.7, shadow=0.2)
c.crayon([(300, 1150), (426, 1085), (552, 1150)], 9, '#2c4f86', 0.95)                                   # bucket handle
c.piece([(290, 1150), (562, 1150), (530, 1420), (322, 1420)], '#3f78c9', texture='crayon', torn=0.25, rim=0.6, shadow=0.45)
c.piece(R(280, 1138, 572, 1172), '#2f62ad', torn=0.15, rim=0.4, shadow=0.3)
c.piece(ell(426, 1160, 118, 14), '#8fc4e8', torn=0.2, rim=0.2, shadow=0.0)                              # water at the brim
c.piece([(640, 1500), (900, 1480), (930, 1600), (660, 1630)], '#f0d9c4', texture='notebook', torn=0.8, rim=0.9, shadow=0.4)          # soggy note
c.save(f"{OUT}/bucket.jpg"); print("bucket done")
