"""Thuyền chiến nhẹ quân Ngô — dáng thuyền khắc trên trống đồng Đông Sơn:
thân thon dài, mũi cong vút thành đầu chim, đuôi vểnh, sơn then viền đỏ son."""

import math

import bmesh

from vn import blob, box, bronze_drum, eye, feathers, lod, loft, mat, obj_from_bm, subdivide, tube

L = 7.5
W = 0.62
D = 0.45

PREVIEW_DISTANCE = 0.8


def ring(s):
    y = L / 2 - s * L
    w = W * math.sin(math.pi * s) ** 0.75 + 0.03
    d = D * math.sin(math.pi * s) ** 0.6 + 0.02
    sheer = 0.32 + 0.9 * abs(2 * s - 1) ** 5
    pts = []
    K = lod(8, 6)
    for k in range(K + 1):
        a = math.pi * k / K
        pts.append((-w * math.cos(a), y, sheer - (d + sheer) * math.sin(a) ** 0.5))
    return pts


def build():
    n = lod(28, 14)
    rings = [ring(0.02 + 0.96 * i / n) for i in range(n + 1)]
    subdivide(obj_from_bm("than", loft(rings), mat("then"), smooth=True))

    # mắt thuyền hai bên mũi — tục vẽ mắt thuyền của cư dân sông nước
    r = ring(0.86)
    for side, p in ((-1, r[0]), (1, r[-1])):
        eye((p[0] * 1.02, p[1], p[2] - 0.1), side, radius=0.12)

    # trống đồng giữa thuyền — như trên thuyền khắc ở trống Đông Sơn
    bronze_drum((0, 2.15, 0.1), r=0.24, h=0.3)

    # viền đỏ son dọc mạn
    for side in (-1, 1):
        line = []
        for i in range(15):
            s = 0.1 + 0.8 * i / 14
            r = ring(s)
            p = r[0] if side < 0 else r[-1]
            line.append((p[0] + side * 0.02, p[1], p[2] - 0.05))
        obj_from_bm(f"vien{side}", tube(line, 0.05, sides=4), mat("son"))

    # cổ và đầu chim ở mũi (-Y)
    tip = ring(0.98)[4]
    neck = [
        (0, tip[1], tip[2]),
        (0, tip[1] - 0.35, tip[2] + 0.45),
        (0, tip[1] - 0.45, tip[2] + 0.95),
        (0, tip[1] - 0.3, tip[2] + 1.25),
    ]
    obj_from_bm("co", tube(neck, [0.11, 0.09, 0.075, 0.07], sides=6), mat("then"), smooth=True)
    head = neck[-1]
    obj_from_bm("dau", blob((head[0], head[1] - 0.08, head[2] + 0.05), (0.12, 0.2, 0.12), jitter=0.02), mat("then"), smooth=True)
    beak = bmesh.new()
    bmesh.ops.create_cone(beak, cap_ends=True, segments=5, radius1=0.06, radius2=0.0, depth=0.42)
    bmesh.ops.rotate(beak, verts=beak.verts, cent=(0, 0, 0), matrix=__import__("mathutils").Matrix.Rotation(math.radians(80), 3, "X"))
    bmesh.ops.translate(beak, verts=beak.verts, vec=(head[0], head[1] - 0.38, head[2] + 0.02))
    obj_from_bm("mo", beak, mat("son"))
    obj_from_bm("mat", blob((0, head[1] - 0.1, head[2] + 0.1), (0.13, 0.04, 0.04), jitter=0), mat("vang"))

    # đuôi vểnh ở lái (+Y): vây dẹt như đuôi chim
    t = ring(0.02)[4]
    tail = bmesh.new()
    vs = [
        tail.verts.new((0, t[1], t[2])),
        tail.verts.new((0, t[1] + 0.5, t[2] + 0.9)),
        tail.verts.new((0, t[1] + 0.15, t[2] + 1.05)),
        tail.verts.new((0, t[1] - 0.25, t[2] + 0.3)),
    ]
    tail.faces.new(vs)
    obj_from_bm("duoi", tail, mat("son"))

    # người chèo: 6 tay chèo + 1 người cầm cờ
    for i in range(6):
        y = -2.1 + i * 0.75
        side = -1 if i % 2 == 0 else 1
        cloth = "ao_nau" if i % 3 else "ao_cham"
        obj_from_bm(f"nguoi{i}", tube([(0, y, 0.25), (0, y + 0.08, 0.85)], [0.17, 0.13], sides=6), mat(cloth), smooth=True)
        obj_from_bm(f"dau{i}", blob((0, y + 0.1, 1.0), (0.11, 0.11, 0.12), jitter=0.02), mat("da_nguoi"), smooth=True)
        feathers((0, y + 0.12, 1.08), n=5, h=0.4, key="vang" if i % 2 else "son", name=f"long{i}")
        obj_from_bm(f"cheo{i}", tube([(side * 0.15, y - 0.1, 1.0), (side * 0.85, y + 0.25, -0.35)], 0.03, sides=4), mat("go_sang"))
        obj_from_bm(f"mai_cheo{i}", box((0.04, 0.16, 0.38), (side * 0.85, y + 0.25, -0.35)), mat("go_sang"))

    # cờ đỏ ở lái
    obj_from_bm("can_co", tube([(0, 2.75, 0.3), (0, 2.75, 2.6)], 0.03, sides=4), mat("go_sam"))
    flag = bmesh.new()
    fv = [
        flag.verts.new((0, 2.6, 2.6)),
        flag.verts.new((0, 2.6, 1.95)),
        flag.verts.new((0.04, 3.55, 2.15)),
        flag.verts.new((0.02, 3.4, 2.55)),
    ]
    flag.faces.new(fv)
    obj_from_bm("co", flag, mat("co_do"))
