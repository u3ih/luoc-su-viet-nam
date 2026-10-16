"""Bụi tre làng: nhiều thân cong vồng ra ngoài, tán lá thành từng chùm."""

import math
import random

from mathutils import Vector, noise

from vn import blob, lod, mix_hex, obj_from_bm, paint, tube, vcol_mat, mat

H = 9.0
PREVIEW_DISTANCE = 0.9


def build():
    random.seed(7)
    leaves = []
    for i in range(lod(16, 9)):
        a = random.random() * math.tau
        spread = 0.35 + random.random() * 0.55
        h = H * (0.75 + random.random() * 0.3)
        base = Vector((math.cos(a) * 0.5 * random.random(), math.sin(a) * 0.5 * random.random(), 0))
        pts = []
        seg = lod(8, 5)
        for k in range(seg):
            t = k / (seg - 1)
            bend = spread * (t**1.8) * h * 0.55
            pts.append(base + Vector((math.cos(a) * bend, math.sin(a) * bend, t * h * (1 - 0.15 * t * spread))))
        obj_from_bm(f"than{i}", tube(pts, [0.09 - 0.06 * k / (seg - 1) for k in range(seg)], sides=5), mat("tre"))
        # lá tre: chùm nhỏ, dẹt, rủ theo hướng ngọn (bản lite: ít chùm hơn nhưng to hơn)
        for k in lod((3, 4, 5, 6, 7), (2, 3, 4)):
            u = k / (seg - 1)
            c = pts[k] + Vector((math.cos(a), math.sin(a), -0.3)) * 0.25 * u
            s = (0.28 + 0.16 * u) * lod(1.0, 1.45)
            leaves.append((c, s, i * 10 + k, a))

    import bmesh

    combined = bmesh.new()
    for c, s, seed, a in leaves:
        sx = s * (1.0 + 0.9 * abs(math.cos(a)))
        sy = s * (1.0 + 0.9 * abs(math.sin(a)))
        b = blob(c, (sx, sy, s * 0.55), subdiv=1, jitter=0.3, seed=seed)
        tmp = bpy_mesh_from(b)
        combined.from_mesh(tmp)
    ob = obj_from_bm("la", combined, vcol_mat(), smooth=False)
    paint(ob, lambda co, n: mix_hex("la_toi", "la", co.z / H + noise.noise(co * 2) * 0.3 + max(0, n.z) * 0.3))


def bpy_mesh_from(bm):
    import bpy

    me = bpy.data.meshes.new("tmp")
    bm.to_mesh(me)
    bm.free()
    return me
