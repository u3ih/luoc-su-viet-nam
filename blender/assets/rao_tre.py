"""Đoạn rào tre dài 6 đơn vị: cọc tre dựng, hai nẹp ngang buộc lạt."""

from vn import mat, obj_from_bm, tube

PREVIEW_DISTANCE = 0.6


def build():
    import random

    random.seed(2)
    for i in range(25):
        x = -3 + i * 0.25
        h = 1.4 + random.random() * 0.3
        obj_from_bm(f"coc{i}", tube([(x, random.random() * 0.04, 0), (x, 0, h)], [0.045, 0.035], sides=5), mat("tre" if i % 3 else "go_sang"))
    for z in (0.45, 1.05):
        obj_from_bm(f"nep{z}", tube([(-3.1, 0.06, z), (3.1, 0.06, z + 0.03)], 0.035, sides=5), mat("go_sang"))
