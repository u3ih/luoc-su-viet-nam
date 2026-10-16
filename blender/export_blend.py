"""Xuất một file .blend làm tay sang GLB theo cùng quy ước.

blender -b <file.blend> --python blender/export_blend.py -- <out.glb>
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib"))
import vn  # noqa: E402

vn.export_glb(sys.argv[sys.argv.index("--") + 1])
