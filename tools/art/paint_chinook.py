#!/usr/bin/env python3
"""Paints the three watercolour pictures for the "phone won't stop buzzing" video into public/art/chinook/.
Run from the repo root: python3 tools/art/paint_chinook.py [kitchen_rain|kitchen_warm|door]"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "vendor", "claude-drawing", "lib"))
import numpy as np
from watercolor import Watercolor, hexc
from core import blob_pts

OUT = "public/art/chinook"; os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
def R(x0, y0, x1, y1): return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

def kitchen(name, warm, seed):
    p = Watercolor(W, H, seed=seed); p.paper()
    wall = hexc('#c9d8cf') if not warm else hexc('#f3d9b0')
    tile = hexc('#a9c0b8') if not warm else hexc('#e8bf86')
    p.glaze(p.shape(R(0, 0, W, 1220), soft=3), wall, 0.75, gran=0.5, bloom=2)
    # tile backsplash band behind counter
    p.glaze(p.shape(R(0, 1020, W, 1225), soft=2), tile, 0.55, gran=0.4)
    for x in range(0, W, 90): p.line([(x, 1020), (x, 1225)], 1.6, hexc('#7d9990' if not warm else '#b98d55'), 0.5)
    for y in (1020, 1072, 1124, 1176): p.line([(0, y), (W, y)], 1.6, hexc('#7d9990' if not warm else '#b98d55'), 0.5)
    # window (right)
    sky_t = hexc('#8fa3b5') if not warm else hexc('#9fd0f0'); sky_b = hexc('#c9d3dc') if not warm else hexc('#fbe7b8')
    wm = p.shape(R(610, 200, 1040, 790), soft=1.5)
    p.lift(wm, 0.95)
    ramp = np.clip((p.YY - 220) / 550, 0, 1)[..., None]
    p.glaze(wm, sky_t, 0.85, edge=0.5); p.glaze(wm * ramp[..., 0], sky_b, 0.6, edge=0.0)
    if not warm:
        p.glaze(p.blobs([(780, 330, 150, 60), (930, 410, 120, 50), (700, 450, 110, 45)], soft=14), hexc('#6c7d8f'), 0.6)
    else:
        p.glaze(p.blobs([(900, 300, 70, 70)], rough=0.05, soft=20), hexc('#ffe9a0'), 0.9)
        p.glaze(p.blobs([(720, 480, 120, 36), (960, 560, 100, 30)], soft=14), hexc('#ffffff'), 0.25)
    frame_c = hexc('#f3efe4')
    for r in (R(595, 185, 1055, 215), R(595, 775, 1055, 810), R(595, 185, 625, 810), R(1025, 185, 1055, 810), R(810, 215, 840, 775)):
        p.glaze(p.shape(r, soft=1.2), hexc('#d9d0bd'), 0.9, edge=0.9)
    p.glaze(p.shape(R(580, 800, 1070, 840), soft=1.2), hexc('#cdbfa4'), 0.9, edge=0.9)   # sill
    # curtain tie-back and plant on the sill
    p.glaze(p.blobs([(690, 770, 45, 40), (735, 735, 40, 52), (665, 740, 34, 44)], soft=3), hexc('#5b8f55'), 0.85)
    p.glaze(p.shape(R(670, 780, 730, 800), soft=1.2), hexc('#c4623f'), 0.9)
    # fridge (left): tall, rounded
    fr = hexc('#eef1f2') if not warm else hexc('#f6efe3')
    p.glaze(p.shape(R(36, 250, 440, 1235), soft=1.5), fr, 0.95, edge=0.9, gran=0.2)
    p.glaze(p.shape(R(36, 250, 440, 1235), soft=1.5), hexc('#9aa7b4' if not warm else '#c9b595'), 0.30, edge=0.7)
    p.line([(36, 700), (440, 700)], 3, hexc('#6f7c88'), 0.8)
    p.glaze(p.shape(R(396, 330, 414, 620), soft=1), hexc('#6f7c88'), 0.9); p.glaze(p.shape(R(396, 760, 414, 1010), soft=1), hexc('#6f7c88'), 0.9)
    p.line([(36, 250), (440, 250), (440, 1235), (36, 1235), (36, 250)], 2.4, hexc('#55616e'), 0.8)
    # the paper on the fridge door where the list goes (list text is added in the video)
    p.lift(p.shape([(112, 470), (352, 458), (362, 872), (122, 884)], soft=1), 0.95)
    p.glaze(p.shape([(112, 470), (352, 458), (362, 872), (122, 884)], soft=1), hexc('#fff6d8'), 0.25, edge=0.3)
    p.line([(112, 470), (352, 458), (362, 872), (122, 884), (112, 470)], 2, hexc('#8a7f6c'), 0.7)
    for (mx, my, col) in ((138, 470, '#d9534a'), (322, 462, '#3f78c9')):
        p.glaze(p.blobs([(mx, my, 20, 20)], rough=0.05, soft=1.5), hexc(col), 0.9)
    # counter
    p.glaze(p.shape(R(0, 1225, W, 1330), soft=2), hexc('#d6c3a3' if not warm else '#e6c58f'), 0.85, gran=0.5, edge=0.9)
    p.glaze(p.shape(R(0, 1330, W, H), soft=2), hexc('#7f8fa0' if not warm else '#c58b5a'), 0.7, gran=0.5)
    for x in (0, 360, 720, W): p.line([(x, 1330), (x, H)], 3, hexc('#44505c' if not warm else '#7d4f2c'), 0.8)
    for x in (180, 540, 900): p.glaze(p.shape(R(x - 8, 1470, x + 8, 1600), soft=1), hexc('#e8e2d3'), 0.9)
    p.line([(0, 1330), (W, 1330)], 3, hexc('#44505c' if not warm else '#7d4f2c'), 0.8)
    # counter clutter: kettle, toaster, bowl with fruit
    p.glaze(p.shape([(500, 1225), (590, 1225), (580, 1115), (510, 1115)], soft=1.5), hexc('#b9c3cb'), 0.85, edge=0.8)
    p.glaze(p.shape(R(520, 1090, 570, 1115), soft=1), hexc('#6f7c88'), 0.9)
    p.line([(588, 1190), (640, 1170), (645, 1130)], 5, hexc('#6f7c88'), 0.9)
    p.glaze(p.shape(R(860, 1150, 1010, 1228), soft=1.5), hexc('#d7d1c4'), 0.85, edge=0.8)
    p.glaze(p.blobs([(935, 1228, 100, 30)], rough=0.04, soft=2), hexc('#e0d8c9'), 0.7)
    for (fx, fy, c) in ((905, 1128, '#d9534a'), (950, 1118, '#e8a317'), (990, 1135, '#6aa84f')):
        p.glaze(p.blobs([(fx, fy, 24, 24)], rough=0.05, soft=1.5), hexc(c), 0.9)
    p.glaze(p.shape([(860, 1150), (1010, 1150), (980, 1228), (890, 1228)], soft=1.5), hexc('#8a6a4a'), 0.8, edge=0.9)
    # light / mood
    if warm:
        p.glaze(p.shape(R(0, 0, W, H), soft=1), hexc('#ffd9a0'), 0.14, edge=0, gran=0.1)
    else:
        p.glaze(p.shape(R(0, 0, W, H), soft=1), hexc('#6d86a6'), 0.07, edge=0, gran=0.1)
    p.save(f"{OUT}/{name}.jpg"); print(name, "done")

def door():
    p = Watercolor(W, H, seed=77); p.paper()
    p.glaze(p.shape(R(0, 0, W, 1450), soft=3), hexc('#d8cdb8'), 0.75, gran=0.5, bloom=2)           # hallway wall
    # opening to the porch: rainy dusk outside
    p.glaze(p.shape(R(250, 260, 830, 1450), soft=1.5), hexc('#8d9db0'), 0.9, edge=0.7)
    dm = p.shape(R(250, 260, 830, 1450), soft=1.5); p.glaze(dm * np.clip((p.YY - 280) / 1100, 0, 1), hexc('#c9d3dc'), 0.6, edge=0)
    p.glaze(p.blobs([(420, 520, 120, 80), (640, 640, 140, 90)], soft=14), hexc('#5d7088'), 0.5)
    p.glaze(p.shape(R(250, 1250, 830, 1450), soft=2), hexc('#8a8f86'), 0.6, gran=0.5)               # porch boards
    # frame and open door leaf on the left
    p.glaze(p.shape(R(215, 225, 250, 1450), soft=1.2), hexc('#efe7d6'), 0.95, edge=0.9)
    p.glaze(p.shape(R(830, 225, 865, 1450), soft=1.2), hexc('#efe7d6'), 0.95, edge=0.9)
    p.glaze(p.shape(R(215, 225, 865, 262), soft=1.2), hexc('#efe7d6'), 0.95, edge=0.9)
    p.glaze(p.shape([(140, 300), (232, 270), (232, 1440), (140, 1480)], soft=1.2), hexc('#a85a3c'), 0.85, edge=0.9, gran=0.4)
    p.glaze(p.blobs([(185, 900, 14, 14)], rough=0.03, soft=1), hexc('#d8b45a'), 0.95)
    # doorbell on the wall
    p.glaze(p.shape(R(895, 760, 955, 860), soft=1.2), hexc('#efe7d6'), 0.95, edge=0.9)
    p.glaze(p.blobs([(925, 810, 17, 17)], rough=0.03, soft=1), hexc('#ea6b14'), 0.95)
    # floor, mat, boots
    p.glaze(p.shape(R(0, 1450, W, H), soft=2), hexc('#a78a68'), 0.8, gran=0.5, bloom=3)
    for y in range(1520, H, 90): p.line([(0, y), (W, y + 8)], 2, hexc('#6f5a42'), 0.6)
    p.glaze(p.shape([(330, 1530), (790, 1530), (830, 1700), (290, 1700)], soft=1.5), hexc('#6b5b4a'), 0.8, gran=0.6)
    p.glaze(p.shape(R(0, 0, W, H), soft=1), hexc('#6d86a6'), 0.14, edge=0, gran=0.1)
    p.save(f"{OUT}/door.jpg"); print("door done")

which = sys.argv[1] if len(sys.argv) > 1 else "all"
if which in ("all", "kitchen_rain"): kitchen("kitchen_rain", False, 5)
if which in ("all", "kitchen_warm"): kitchen("kitchen_warm", True, 5)
if which in ("all", "door"): door()
