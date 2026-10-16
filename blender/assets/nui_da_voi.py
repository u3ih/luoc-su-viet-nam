"""Ba khối núi đá vôi dựng đứng kiểu vịnh Hạ Long / Bái Tử Long.
Mỗi khối là một mesh riêng (da_voi_0..2) để cảnh chọn ngẫu nhiên khi rải."""

import math

import bmesh
from mathutils import Vector, noise

from vn import lod, mix_hex, obj_from_bm, paint, vcol_mat

PREVIEW_DISTANCE = 1.1

SHAPES = [
    # cao, bán kính, độ nghiêng, hạt giống
    (1.0, 0.36, 0.08, 1),
    (0.75, 0.45, -0.05, 2),
    (1.15, 0.28, 0.14, 3),
]


def rock(h, r, lean, seed, ox):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=lod(14, 9), v_segments=lod(12, 8), radius=1.0)
    off = Vector((seed * 13.7, seed * 5.1, seed * 9.3))
    for v in bm.verts:
        z = (v.co.z + 1) / 2  # 0 đáy .. 1 đỉnh
        # thân trụ: phình giữa, thót chân do sóng xói, đỉnh bo tròn
        # vách gần như thẳng đứng, đỉnh bo tròn
        prof = max(0.0, 1 - z**5) ** 0.45 * (0.82 + 0.18 * math.sin(math.pi * z))
        notch = 1 - 0.3 * math.exp(-((z - 0.08) ** 2) / 0.003)
        k = r * prof * notch * (1 + noise.noise(v.co * 1.4 + off) * 0.3 + noise.noise(v.co * 5 + off) * 0.1)
        d = Vector((v.co.x, v.co.y))
        d = d.normalized() if d.length > 1e-6 else d
        x, y = d.x * k, d.y * k
        zz = z * h + noise.noise(v.co * 3 + off) * 0.04
        v.co = Vector((x + lean * zz + ox, y, zz - 0.06))
    ob = obj_from_bm(f"da_voi_{seed - 1}", bm, vcol_mat(), smooth=False)

    def color(co, n):
        hz = (co.z + 0.06) / h
        rock = mix_hex("da", "#8a7c66", noise.noise(co * 6) * 0.5 + 0.5)
        # rêu & cây bám trên mặt ngang và phía trên
        moss = max(0.0, n.z) * 1.2 + (hz - 0.55) * 1.2 + noise.noise(co * 5) * 0.3
        c = mix_hex(rock, "reu", moss)
        return mix_hex(c, "#3b3228", 1 - min(1, hz * 8))  # chân sẫm vì nước

    paint(ob, color)

    # cụm cây bám đỉnh và gờ đá
    import bmesh as _bm
    from vn import blob, mix_hex as _mix

    trees = _bm.new()
    me = ob.data
    tops = [ob.matrix_world @ v.co for v in me.vertices if v.normal.z > 0.35 and v.co.z > h * 0.55]
    for i, co in enumerate(tops[:: max(1, len(tops) // lod(18, 8))]):
        b = blob((co.x, co.y, co.z + 0.02), (0.07 * lod(1, 1.4), 0.07 * lod(1, 1.4), 0.05), subdiv=1, jitter=0.25, seed=seed * 50 + i)
        tmp = bpy_mesh(b)
        trees.from_mesh(tmp)
    t = obj_from_bm(f"da_voi_{seed - 1}_cay", trees, vcol_mat(), smooth=False)
    paint(t, lambda co, n: _mix("la_toi", "la", noise.noise(co * 9) * 0.5 + 0.5))
    return ob


def bpy_mesh(b):
    import bpy

    me = bpy.data.meshes.new("tmp")
    b.to_mesh(me)
    b.free()
    return me


def build():
    # mỗi khối cao 1 đơn vị — cảnh scale theo ý muốn
    for i, (h, r, lean, seed) in enumerate(SHAPES):
        rock(h, r, lean, seed, ox=(i - 1) * 1.4)
