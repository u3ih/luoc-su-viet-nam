"""Chạy một script dựng model rồi xuất GLB (+ ảnh xem trước).

blender -b --factory-startup --python blender/run.py -- <asset.py> <out.glb> [preview.png]
"""

import importlib.util
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "lib"))

import vn  # noqa: E402

argv = sys.argv[sys.argv.index("--") + 1 :]
asset_path, out_path = argv[0], argv[1]
preview = argv[2] if len(argv) > 2 else None

spec = importlib.util.spec_from_file_location("asset", asset_path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

vn.reset()
mod.build()
vn.export_glb(out_path)
if preview:
    vn.render_preview(preview, getattr(mod, "PREVIEW_DISTANCE", 1.0))
print(f"[asset] {os.path.basename(asset_path)} -> {out_path}")
