"""Đống rơm quấn quanh cọc — hình ảnh quen của làng quê Bắc Bộ."""

import math

from mathutils import Vector, noise

from vn import loft, mat, obj_from_bm, tube

PREVIEW_DISTANCE = 0.6


def build():
    prof = [(0.0, 1.0), (0.3, 1.15), (0.6, 1.05), (0.85, 0.6), (1.0, 0.12)]
    rings = []
    for t, k in prof:
        z = t * 2.6
        ring = []
        for s in range(16):
            a = s / 16 * math.tau
            r = k * (1 + noise.noise(Vector((math.cos(a) * 2, math.sin(a) * 2, z))) * 0.08)
            ring.append((math.cos(a) * r, math.sin(a) * r, z))
        rings.append(ring)
    obj_from_bm("rom", loft(rings), mat("rom"), smooth=True)
    obj_from_bm("coc", tube([(0, 0, 2.4), (0, 0, 3.3)], 0.05, sides=5), mat("go_sam"))
