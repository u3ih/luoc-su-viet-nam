"""Bộ công cụ dựng model cho Lược sử Việt Nam.

Quy ước:
- 1 đơn vị Blender = 1 đơn vị trong cảnh three.js (≈ 1 mét).
- Mũi thuyền hướng về -Y trong Blender  → +Z trong three.js (glTF Y-up).
- Gốc toạ độ: đường mớn nước (thuyền) hoặc chân vật thể (cọc, đá, cây, nhà).
- Màu lấy từ bảng PALETTE — tông sơn mài, đồng bộ với giao diện web.
"""

import math
import os
import random

import bmesh
import bpy
from mathutils import Vector, noise

# Bản "lite" cho máy yếu / ô ở xa (`pnpm assets --lite`): script đọc LITE hoặc dùng lod() để bớt chi tiết.
# Mỗi asset có cây lá nên có bản lite — xem blender/README.md.
LITE = os.environ.get("VN_LITE") == "1"


def lod(full, lite):
    """Giá trị cho bản đầy đủ hoặc bản lite."""
    return lite if LITE else full


PALETTE = {
    # gỗ & sơn
    "go_sam": "#2e1b10",
    "go": "#5a3a22",
    "go_sang": "#8a5f38",
    "then": "#151010",  # sơn then (đen)
    "son": "#b3302a",  # đỏ son
    "vang": "#c99a45",  # vàng kim
    "sat": "#2a2a2e",
    # vải, mái
    "buom": "#a3652e",
    "buom_toi": "#6e3f1c",
    "co_vang": "#c8a040",
    "co_do": "#c8232a",
    "rom": "#a88a4a",
    "rom_toi": "#7a6234",
    "vach": "#8c6a44",
    # thiên nhiên
    "da": "#6f6252",
    "reu": "#3e5532",
    "tre": "#5f7a3a",
    "la": "#3f5f2c",
    "la_toi": "#2c4420",
    # người
    "da_nguoi": "#a8744a",
    "trang": "#efe6d2",
    "dong": "#8a6a3a",  # đồng thau
    "cau": "#7d7464",
    "chuoi": "#5f8a34",
    "chuoi_toi": "#3f6424",
    "ao_nau": "#5b3a24",
    "ao_cham": "#2b3348",
}


def hex_rgba(h):
    h = h.lstrip("#")
    srgb = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, 1.0)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    random.seed(938)


_materials = {}


def mat(key):
    """Vật liệu đơn sắc theo bảng màu (tên vật liệu = key)."""
    if key in _materials:
        return _materials[key]
    m = bpy.data.materials.new(key)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hex_rgba(PALETTE[key])
    bsdf.inputs["Roughness"].default_value = 0.85
    m.diffuse_color = hex_rgba(PALETTE[key])  # màu hiển thị trong viewport/preview
    _materials[key] = m
    return m


def vcol_mat(key="vcol"):
    """Vật liệu trắng dùng màu đỉnh (đá, lá…)."""
    if key in _materials:
        return _materials[key]
    m = bpy.data.materials.new(key)
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    attr = nt.nodes.new("ShaderNodeVertexColor")
    attr.layer_name = "Color"
    nt.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.9
    _materials[key] = m
    return m


def subdivide(ob, levels=1):
    """Bo mượt bằng Subdivision Surface (được áp khi xuất GLB). Bản lite bỏ qua (×4 số mặt)."""
    if LITE:
        return ob
    mod = ob.modifiers.new("subsurf", "SUBSURF")
    mod.levels = levels
    mod.render_levels = levels
    return ob


def eye(center, normal_x, radius=0.16, name="mat_thuyen"):
    """Mắt thuyền: lòng trắng + con ngươi đen, áp sát mạn (hướng ±X)."""
    import bmesh as _bm

    for r, key, off in ((radius, "trang", 0.0), (radius * 0.5, "then", 0.012)):
        b = _bm.new()
        _bm.ops.create_circle(b, cap_ends=True, segments=14, radius=r)
        rot = __import__("mathutils").Matrix.Rotation(math.pi / 2 * normal_x, 3, "Y")
        _bm.ops.rotate(b, verts=b.verts, matrix=rot)
        _bm.ops.translate(b, verts=b.verts, vec=Vector(center) + Vector((normal_x * (0.01 + off), 0.03 if off else 0, 0)))
        obj_from_bm(f"{name}_{key}_{normal_x}", b, mat(key))


def feathers(center, n=5, h=0.42, spread=0.9, key="vang", name="long_chim"):
    """Mũ lông chim kiểu chiến binh Đông Sơn: các lông dẹt xoè ra sau."""
    import bmesh as _bm

    cx, cy, cz = center
    for i in range(n):
        a = (i / (n - 1) - 0.5) * spread
        b = _bm.new()
        base_l = b.verts.new((cx - 0.03, cy, cz))
        base_r = b.verts.new((cx + 0.03, cy, cz))
        tip = b.verts.new((cx + math.sin(a) * h * 0.4, cy + 0.12 + h * 0.6, cz + h * math.cos(a)))
        b.faces.new((base_l, base_r, tip))
        obj_from_bm(f"{name}{i}", b, mat(key))


def bronze_drum(center, r=0.32, h=0.34, name="trong_dong"):
    """Trống đồng nhỏ: mặt phẳng, tang phình, thân thắt, chân loe."""
    cx, cy, cz = center
    prof = [(0.0, 0.92), (0.12, 1.0), (0.3, 0.98), (0.55, 0.8), (0.8, 0.82), (1.0, 0.95)]
    rings = []
    for t, k in prof:
        z = cz + h * (1 - t)
        rings.append([(cx + math.cos(a) * r * k, cy + math.sin(a) * r * k, z) for a in (2 * math.pi * s / 16 for s in range(16))])
    obj_from_bm(name, loft(rings), mat("dong"), smooth=True)
    # ngôi sao trên mặt trống
    import bmesh as _bm

    b = _bm.new()
    pts = []
    for i in range(28):
        rr = r * (0.45 if i % 2 == 0 else 0.14)
        a = i / 28 * 2 * math.pi
        pts.append(b.verts.new((cx + math.cos(a) * rr, cy + math.sin(a) * rr, cz + h + 0.005)))
    b.faces.new(pts)
    obj_from_bm(name + "_sao", b, mat("vang"))


def obj_from_bm(name, bm, material, smooth=False, parent=None):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = smooth
    me.materials.append(material)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def loft(rings, close_ends=True):
    """Nối các vòng điểm (cùng số điểm, khép kín) thành vỏ. Trả về bmesh."""
    bm = bmesh.new()
    vrings = [[bm.verts.new(p) for p in ring] for ring in rings]
    n = len(rings[0])
    for a, b in zip(vrings, vrings[1:]):
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new((a[i], a[j], b[j], b[i]))
    if close_ends:
        bm.faces.new(list(reversed(vrings[0])))
        bm.faces.new(vrings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def tube(points, radii, sides=6, cap=True):
    """Ống theo đường cong (cành tre, thân cây, cột buồm cong, cổ chim…)."""
    if LITE:
        sides = max(3, round(sides * 0.6))
    rings = []
    for i, p in enumerate(points):
        p = Vector(p)
        if i < len(points) - 1:
            d = (Vector(points[i + 1]) - p).normalized()
        else:
            d = (p - Vector(points[i - 1])).normalized()
        up = Vector((0, 0, 1)) if abs(d.z) < 0.95 else Vector((1, 0, 0))
        u = d.cross(up).normalized()
        v = d.cross(u).normalized()
        r = radii[i] if isinstance(radii, (list, tuple)) else radii
        rings.append([p + (u * math.cos(a) + v * math.sin(a)) * r for a in (2 * math.pi * k / sides for k in range(sides))])
    return loft(rings, close_ends=cap)


def box(size, center=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    bmesh.ops.translate(bm, vec=Vector(center), verts=bm.verts)
    return bm


def blob(center, scale, subdiv=1, jitter=0.18, seed=0):
    """Khối lá/đá méo tự nhiên từ icosphere."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    off = Vector((seed * 7.1, seed * 3.3, seed * 5.7))
    for v in bm.verts:
        n = noise.noise(v.co * 1.7 + off)
        v.co *= 1 + n * jitter * 2
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(center)
    return bm


def paint(ob, fn):
    """Tô màu đỉnh: fn(world_co, normal) -> hex."""
    me = ob.data
    layer = me.color_attributes.new("Color", "BYTE_COLOR", "CORNER")
    for poly in me.polygons:
        for li in poly.loop_indices:
            v = me.vertices[me.loops[li].vertex_index]
            layer.data[li].color = hex_rgba(fn(ob.matrix_world @ v.co, v.normal))
    me.color_attributes.active_color = layer


def mix_hex(a, b, t):
    t = max(0.0, min(1.0, t))
    ca = [int(PALETTE.get(a, a).lstrip("#")[i : i + 2], 16) for i in (0, 2, 4)]
    cb = [int(PALETTE.get(b, b).lstrip("#")[i : i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{round(x + (y - x) * t):02x}" for x, y in zip(ca, cb))


def export_glb(path):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_vertex_color="ACTIVE",
        export_materials="EXPORT",
        export_animations=False,
        export_cameras=False,
        export_lights=False,
    )


def render_preview(path, distance=1.0):
    """Ảnh xem nhanh (Workbench) để kiểm tra model không cần mở Blender."""
    scene = bpy.context.scene
    bpy.ops.object.select_all(action="SELECT")
    objs = [o for o in scene.objects if o.type == "MESH"]
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    center = (lo + hi) / 2
    radius = (hi - lo).length / 2

    cam_data = bpy.data.cameras.new("preview")
    cam_data.lens = 50
    cam = bpy.data.objects.new("preview", cam_data)
    scene.collection.objects.link(cam)
    direction = Vector((1.0, -1.3, 0.75)).normalized()
    cam.location = center + direction * radius * 3.2 * distance
    cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam

    # EEVEE: thấy đúng vật liệu + màu đỉnh, ánh nắng chiều tông sơn mài
    scene.render.engine = "BLENDER_EEVEE"
    world = bpy.data.worlds.new("preview")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = hex_rgba("#2a1a12")
    bg.inputs["Strength"].default_value = 1.4
    scene.world = world
    sun_data = bpy.data.lights.new("nang", "SUN")
    sun_data.energy = 4.0
    sun_data.color = hex_rgba("#ffd9a8")[:3]
    sun_data.angle = 0.2
    sun = bpy.data.objects.new("nang", sun_data)
    sun.rotation_euler = (math.radians(50), math.radians(10), math.radians(35))
    scene.collection.objects.link(sun)
    scene.view_settings.view_transform = "AgX"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 600
    scene.render.film_transparent = False
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam)
