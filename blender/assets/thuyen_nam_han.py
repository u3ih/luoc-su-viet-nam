"""Thuyền chiến lớn Nam Hán: thân đáy bằng, mũi lái vuông, lầu lái mái cong,
ba cột buồm cánh dơi có nẹp tre."""

import math

from vn import blob, box, eye, lod, loft, mat, obj_from_bm, subdivide, tube

L = 13.0  # dài
W = 1.9  # nửa bề ngang lớn nhất
D = 1.1  # sâu dưới mớn nước


def hull_ring(s):
    """s: 0 = lái (+Y), 1 = mũi (-Y)."""
    y = L / 2 - s * L
    w = W * (0.62 + 0.38 * math.sin(math.pi * min(1, s * 1.15)) ** 0.6)
    if s > 0.85:
        w *= 1 - (s - 0.85) * 2.2
    d = D * (0.55 + 0.45 * math.sin(math.pi * s) ** 0.5)
    sheer = 0.75 + 1.4 * (1 - s) ** 4 + 0.9 * s**5
    pts = []
    K = lod(10, 6)
    for k in range(K + 1):
        a = math.pi * k / K
        x = -w * math.cos(a)
        z = sheer - (d + sheer) * math.sin(a) ** 0.35
        pts.append((x, y, z))
    return pts


def roof(cx, cy, cz, lx, ly, lift=0.35):
    """Mái cong hai đầu hồi vểnh lên."""
    rings = []
    n = 8
    for i in range(n + 1):
        s = i / n
        y = cy - ly / 2 + s * ly
        up = lift * abs(2 * s - 1) ** 3
        ew = lx / 2 + 0.25
        rings.append(
            [
                (cx - ew, y, cz + up),
                (cx, y, cz + 0.75),
                (cx + ew, y, cz + up),
                (cx + ew, y, cz + up - 0.1),
                (cx, y, cz + 0.65),
                (cx - ew, y, cz + up - 0.1),
            ]
        )
    return loft(rings)


def sail(mast_y, z0, h, w, name):
    """Buồm cánh dơi: lưới cong nhẹ, mép sau xoè, đỉnh vểnh về phía lái."""
    import bmesh

    bm = bmesh.new()
    R, C = 7, 5
    grid = []
    for r in range(R + 1):
        v = r / R
        row = []
        for c in range(C + 1):
            u = c / C
            y = mast_y - 0.25 + u * w * (0.85 + 0.4 * v)
            z = z0 + v * h + u * v * 0.18 * h
            x = 0.25 * math.sin(math.pi * u) * (0.6 + 0.4 * v)
            row.append(bm.verts.new((x, y, z)))
        grid.append(row)
    for r in range(R):
        for c in range(C):
            bm.faces.new((grid[r][c], grid[r][c + 1], grid[r + 1][c + 1], grid[r + 1][c]))
    obj_from_bm(name, bm, mat("buom"), smooth=True)
    # nẹp tre ngang
    for r in range(R + 1):
        v = r / R
        line = []
        for c in range(C + 1):
            u = c / C
            line.append(
                (
                    0.25 * math.sin(math.pi * u) * (0.6 + 0.4 * v) + 0.04,
                    mast_y - 0.25 + u * w * (0.85 + 0.4 * v),
                    z0 + v * h + u * v * 0.18 * h,
                )
            )
        obj_from_bm(f"{name}_nep{r}", tube(line, 0.045, sides=4), mat("go_sam"))


def build():
    n = lod(30, 16)
    rings = [hull_ring(i / n) for i in range(n + 1)]
    subdivide(obj_from_bm("than", loft(rings), mat("go_sam"), smooth=True))
    r = hull_ring(0.9)
    for side, p in ((-1, r[0]), (1, r[-1])):
        eye((p[0] * 0.97, p[1], p[2] - 0.35), side, radius=0.24)
    # đèn lồng đỏ treo hai góc lầu
    for x in (-1.3, 1.3):
        obj_from_bm(f"den{x}", blob((x, L / 2 - 1.0, 2.15), (0.16, 0.16, 0.22), jitter=0), mat("son"), smooth=True)

    # sàn & mạn
    obj_from_bm("san", box((W * 1.5, L * 0.78, 0.12), (0, -0.3, 0.72)), mat("go"))
    for side in (-1, 1):
        obj_from_bm(f"man{side}", box((0.1, L * 0.8, 0.45), (side * W * 0.86, -0.2, 0.95)), mat("go_sang"))

    # lầu lái
    obj_from_bm("lau", box((2.6, 3.2, 1.5), (0, L / 2 - 2.6, 1.6)), mat("go"))
    obj_from_bm("lau_cot", box((2.8, 3.4, 0.12), (0, L / 2 - 2.6, 2.4)), mat("son"))
    obj_from_bm("mai", roof(0, L / 2 - 2.6, 2.45, 2.6, 3.8), mat("go_sam"), smooth=False)

    # bánh lái
    obj_from_bm("lai", box((0.15, 1.3, 2.0), (0, L / 2 + 0.3, -0.3)), mat("go_sam"))

    # cột buồm + buồm
    masts = [(-3.6, 9.5, 4.2), (0.6, 8.0, 3.8), (3.6, 5.5, 2.6)]
    for i, (my, mh, sw) in enumerate(masts):
        obj_from_bm(f"cot{i}", tube([(0, my, 0.7), (0, my, 0.7 + mh)], [0.13, 0.08], sides=6), mat("go_sam"))
        sail(my, 1.8, mh * 0.78, sw, f"buom{i}")
        # cờ đuôi nheo đỉnh cột
        import bmesh

        bm = bmesh.new()
        a = bm.verts.new((0, my, 0.7 + mh))
        b = bm.verts.new((0, my, 0.7 + mh - 0.6))
        c = bm.verts.new((0.05, my + 1.6, 0.7 + mh - 0.15))
        bm.faces.new((a, b, c))
        obj_from_bm(f"co{i}", bm, mat("co_vang"))

    # mái chèo
    for i in range(5):
        for side in (-1, 1):
            y = -3.5 + i * 1.6
            obj_from_bm(
                f"cheo{i}{side}",
                tube([(side * W * 0.8, y, 0.9), (side * (W + 2.4), y + 0.4, -0.4)], 0.05, sides=4),
                mat("go_sang"),
            )
