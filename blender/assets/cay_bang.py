"""Cây bàng/cây đa ven làng: thân xoè, tán tầng."""

import math
import random

import bmesh
from mathutils import Vector, noise

from vn import blob, lod, mat, mix_hex, obj_from_bm, paint, tube, vcol_mat

PREVIEW_DISTANCE = 0.9


def build():
    random.seed(3)
    obj_from_bm("than", tube([(0, 0, 0), (0.15, 0, 2.2), (0.1, 0.1, 3.6)], [0.4, 0.28, 0.2], sides=7), mat("go"))
    combined = bmesh.new()
    tiers = lod([(3.6, 3.2, 6), (5.0, 2.4, 5), (6.1, 1.4, 3)], [(3.6, 3.2, 4), (5.0, 2.4, 3), (6.1, 1.4, 2)])
    seed = 0
    for z, r, n in tiers:
        for k in range(n):
            a = k / n * math.tau + random.random() * 0.4
            c = (math.cos(a) * r * 0.6, math.sin(a) * r * 0.6, z + random.random() * 0.3)
            obj_from_bm(f"canh{seed}", tube([(0.1, 0.1, z - 0.6), c], [0.12, 0.06], sides=4), mat("go"))
            k = lod(0.55, 0.68)
            b = blob(c, (r * k, r * k, 0.65 * lod(1, 1.2)), subdiv=1, jitter=0.22, seed=seed)
            me = __import__("bpy").data.meshes.new("tmp")
            b.to_mesh(me)
            b.free()
            combined.from_mesh(me)
            seed += 1
    ob = obj_from_bm("tan", combined, vcol_mat(), smooth=False)
    paint(ob, lambda co, n: mix_hex("la_toi", "la", (co.z - 3) / 4 + max(0, n.z) * 0.4 + noise.noise(co) * 0.2))
