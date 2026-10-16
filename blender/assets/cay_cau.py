"""Cây cau: thân mảnh có đốt, tán lá dừa xoè cong, buồng quả."""

import math
import random

import bmesh

from vn import LITE, blob, lod, mat, mix_hex, obj_from_bm, paint, tube, vcol_mat

H = 11.0
PREVIEW_DISTANCE = 0.8


def build():
    random.seed(11)
    lean = 0.6
    trunk = [(lean * (t / 8) ** 2, 0, H * t / 8) for t in range(9)]
    obj_from_bm("than", tube(trunk, [0.2 - 0.06 * k / 8 for k in range(9)], sides=7), mat("cau"), smooth=True)
    for k in range(1, 8) if not LITE else ():
        z = H * k / 8
        obj_from_bm(f"dot{k}", tube([(lean * (k / 8) ** 2, 0, z - 0.03), (lean * (k / 8) ** 2, 0, z + 0.03)], 0.2 - 0.06 * k / 8 + 0.015, sides=7), mat("go_sam"))
    top = trunk[-1]
    # bẹ lá: dải cong rủ xuống, có lá chét hai bên
    fronds = bmesh.new()
    nf = lod(9, 6)
    seg = lod(8, 4)
    for i in range(nf):
        a = i / nf * math.tau + random.random() * 0.3
        L = 3.0 + random.random() * 0.6
        pts = []
        for s in range(seg):
            u = s / (seg - 1)
            pts.append((top[0] + math.cos(a) * L * u, top[1] + math.sin(a) * L * u, top[2] + 0.9 * u - 2.0 * u * u))
        for s in range(len(pts) - 1):
            p0, p1 = pts[s], pts[s + 1]
            w = 0.55 * math.sin(math.pi * (s + 0.5) / (seg - 1)) * lod(1, 1.2)
            nx, ny = -math.sin(a), math.cos(a)
            vs = [
                fronds.verts.new((p0[0] - nx * w, p0[1] - ny * w, p0[2] - 0.15)),
                fronds.verts.new(p0),
                fronds.verts.new(p1),
                fronds.verts.new((p1[0] - nx * w, p1[1] - ny * w, p1[2] - 0.15)),
            ]
            fronds.faces.new(vs)
            vs2 = [
                fronds.verts.new(p0),
                fronds.verts.new((p0[0] + nx * w, p0[1] + ny * w, p0[2] - 0.15)),
                fronds.verts.new((p1[0] + nx * w, p1[1] + ny * w, p1[2] - 0.15)),
                fronds.verts.new(p1),
            ]
            fronds.faces.new(vs2)
    ob = obj_from_bm("la", fronds, vcol_mat("vcol_la"))
    paint(ob, lambda co, n: mix_hex("la_toi", "tre", (co.z - H + 2) / 2.5))
    obj_from_bm("buong", blob((top[0] + 0.25, 0, top[2] - 0.6), (0.3, 0.3, 0.4), jitter=0.2), mat("buom"), smooth=True)
