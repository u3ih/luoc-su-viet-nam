"""Nhà tranh vách đất ven sông: mái rạ dốc, hiên trước, cột gỗ."""

import bmesh

from vn import box, loft, mat, obj_from_bm, tube

PREVIEW_DISTANCE = 0.9

LX, LY = 6.0, 3.6  # dài (dọc X), sâu (dọc Y)


def build():
    obj_from_bm("nen", box((LX + 0.6, LY + 1.6, 0.3), (0, -0.4, 0.15)), mat("vach"))
    obj_from_bm("vach", box((LX, LY, 2.0), (0, 0, 1.3)), mat("vach"))
    obj_from_bm("cua", box((1.2, 0.08, 1.6), (0, -LY / 2 - 0.02, 1.1)), mat("go_sam"))
    for x in (-1.9, 1.9):
        obj_from_bm(f"song{x}", box((0.9, 0.08, 0.7), (x, -LY / 2 - 0.02, 1.55)), mat("go_sam"))
    # cột hiên
    for x in (-2.7, -0.9, 0.9, 2.7):
        obj_from_bm(f"cot{x}", tube([(x, -LY / 2 - 1.0, 0.3), (x, -LY / 2 - 1.0, 2.3)], 0.08, sides=6), mat("go"))

    # mái rạ bốn mái, dày, phủ quá hiên
    ox, oy = LX / 2 + 0.7, LY / 2 + 1.4
    z0, z1 = 2.2, 4.6
    rx = LX / 2 - 1.2
    bm = bmesh.new()
    eave = [bm.verts.new(p) for p in [(-ox, -oy, z0), (ox, -oy, z0), (ox, oy - 0.8, z0), (-ox, oy - 0.8, z0)]]
    ridge = [bm.verts.new((-rx, -0.4, z1)), bm.verts.new((rx, -0.4, z1))]
    bm.faces.new((eave[0], eave[1], ridge[1], ridge[0]))
    bm.faces.new((eave[2], eave[3], ridge[0], ridge[1]))
    bm.faces.new((eave[1], eave[2], ridge[1]))
    bm.faces.new((eave[3], eave[0], ridge[0]))
    under = [bm.verts.new((v.co.x * 0.96, v.co.y * 0.96 - 0.02, v.co.z - 0.35)) for v in eave]
    for i in range(4):
        j = (i + 1) % 4
        bm.faces.new((eave[j], eave[i], under[i], under[j]))
    bm.faces.new(list(under))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj_from_bm("mai", bm, mat("rom"))
    obj_from_bm("noc", tube([(-rx - 0.2, -0.4, z1 + 0.05), (rx + 0.2, -0.4, z1 + 0.05)], 0.16, sides=5), mat("rom_toi"))
