"""Bụi chuối: vài thân giả, tàu lá to bản rủ xuống."""

import math
import random

import bmesh

from vn import lod, mat, mix_hex, obj_from_bm, paint, tube, vcol_mat

PREVIEW_DISTANCE = 0.8


def build():
    random.seed(5)
    leaves = bmesh.new()
    for k in range(4):
        a0 = k / 4 * math.tau + random.random()
        bx, by = math.cos(a0) * 0.5 * (k > 0), math.sin(a0) * 0.5 * (k > 0)
        h = 2.6 + random.random() * 1.2 - (k > 0) * 0.6
        obj_from_bm(f"than{k}", tube([(bx, by, 0), (bx, by, h)], [0.2, 0.14], sides=6), mat("chuoi_toi"), smooth=True)
        nl = lod(6, 4)
        for i in range(nl):
            a = i / nl * math.tau + random.random() * 0.5
            L = 2.0 + random.random() * 0.7
            W = 0.45 * lod(1, 1.15)
            nx, ny = -math.sin(a), math.cos(a)
            prev = None
            seg = lod(7, 4)
            for s in range(seg):
                u = s / (seg - 1)
                c = (bx + math.cos(a) * L * u, by + math.sin(a) * L * u, h + 0.9 * u - 1.6 * u**2.2)
                w = W * math.sin(math.pi * min(0.98, u * 0.9 + 0.08))
                row = (leaves.verts.new((c[0] - nx * w, c[1] - ny * w, c[2] - 0.08)), leaves.verts.new(c), leaves.verts.new((c[0] + nx * w, c[1] + ny * w, c[2] - 0.08)))
                if prev:
                    leaves.faces.new((prev[0], prev[1], row[1], row[0]))
                    leaves.faces.new((prev[1], prev[2], row[2], row[1]))
                prev = row
    ob = obj_from_bm("la", leaves, vcol_mat("vcol_la"))
    paint(ob, lambda co, n: mix_hex("chuoi_toi", "chuoi", (co.z - 1.5) / 2.5))
