"""Cọc gỗ lim đẽo nhọn, đầu bịt sắt. Cao 5 đơn vị, gốc tại z=0."""

import math

import bmesh
from mathutils import Vector, noise

from vn import mat, obj_from_bm

H = 5.0
PREVIEW_DISTANCE = 0.6


def build():
    rings = []
    sides = 7
    n = 10
    bm = bmesh.new()
    for i in range(n + 1):
        t = i / n
        z = t * (H - 0.9)
        r = 0.26 - 0.06 * t
        ring = []
        for k in range(sides):
            a = 2 * math.pi * k / sides
            bump = 1 + noise.noise(Vector((math.cos(a) * 2, math.sin(a) * 2, z * 1.3))) * 0.12
            ring.append(bm.verts.new((math.cos(a) * r * bump, math.sin(a) * r * bump, z)))
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for k in range(sides):
            j = (k + 1) % sides
            bm.faces.new((a[k], a[j], b[j], b[k]))
    bm.faces.new(list(reversed(rings[0])))
    # phần đẽo nhọn (gỗ sáng) + chóp sắt
    top = rings[-1]
    mid = [bm.verts.new((v.co.x * 0.55, v.co.y * 0.55, H - 0.45)) for v in top]
    for k in range(sides):
        j = (k + 1) % sides
        bm.faces.new((top[k], top[j], mid[j], mid[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    wood = obj_from_bm("coc", bm, mat("go"))

    tip = bmesh.new()
    ring = [tip.verts.new((math.cos(2 * math.pi * k / sides) * 0.13, math.sin(2 * math.pi * k / sides) * 0.13, H - 0.45)) for k in range(sides)]
    apex = tip.verts.new((0.02, 0, H))
    for k in range(sides):
        tip.faces.new((ring[k], ring[(k + 1) % sides], apex))
    tip.faces.new(list(reversed(ring)))
    obj_from_bm("bit_sat", tip, mat("sat"))
    return wood
