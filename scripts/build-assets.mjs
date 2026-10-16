// Dựng toàn bộ model 3D bằng Blender (chạy nền) rồi tối ưu cho web.
//
//   pnpm assets              # tất cả (bản đầy đủ + bản lite)
//   pnpm assets coc          # chỉ một asset
//   pnpm assets --lite [ten] # chỉ dựng bản lite
//
// Nguồn:
//   blender/assets/<ten>.py    model sinh bằng script (sửa code → chạy lại)
//   blender/sources/<ten>.blend model làm tay trong Blender
// Đích: public/models/<ten>.glb (meshopt + quantize), ảnh xem trước ở blender/previews/
// Bản lite: script nào dùng `lod(…)` / `LITE` (blender/lib/vn.py) được dựng thêm lần nữa với VN_LITE=1
// → public/models/<ten>.lite.glb, dùng cho máy yếu và cho đạo cụ ở xa. Danh sách ghi vào public/models/lite.json.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BLENDER =
  process.env.BLENDER_BIN ??
  ["/Applications/Blender.app/Contents/MacOS/Blender", "/usr/bin/blender", "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe"].find(existsSync) ??
  "blender";

const raw = join(ROOT, "blender/.raw");
const out = join(ROOT, "public/models");
const previews = join(ROOT, "blender/previews");
for (const d of [raw, out, previews]) mkdirSync(d, { recursive: true });

const args = process.argv.slice(2);
const liteOnly = args.includes("--lite");
const only = args.filter((a) => !a.startsWith("--"));
const pick = (dir, ext) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(ext))
        .map((f) => basename(f, ext))
        .filter((n) => !only.length || only.includes(n))
    : [];

const run = (cmd, args, env) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "inherit"], env: { ...process.env, ...env } }).toString();

const hasLite = (py) => /\blod\(|\bLITE\b/.test(readFileSync(py, "utf8"));
const lite = new Set(existsSync(join(out, "lite.json")) ? JSON.parse(readFileSync(join(out, "lite.json"), "utf8")) : []);

for (const name of pick(join(ROOT, "blender/assets"), ".py")) {
  const py = join(ROOT, `blender/assets/${name}.py`);
  if (!liteOnly) {
    const glb = join(raw, `${name}.glb`);
    run(BLENDER, ["-b", "--factory-startup", "--python", join(ROOT, "blender/run.py"), "--", py, glb, join(previews, `${name}.png`)]);
    optimize(name, glb);
  }
  if (hasLite(py)) {
    const glb = join(raw, `${name}.lite.glb`);
    run(BLENDER, ["-b", "--factory-startup", "--python", join(ROOT, "blender/run.py"), "--", py, glb], { VN_LITE: "1" });
    optimize(`${name}.lite`, glb);
    lite.add(name);
  } else lite.delete(name);
}
writeFileSync(join(out, "lite.json"), `${JSON.stringify([...lite].sort())}\n`);
for (const name of liteOnly ? [] : pick(join(ROOT, "blender/sources"), ".blend")) {
  const glb = join(raw, `${name}.glb`);
  run(BLENDER, ["-b", join(ROOT, `blender/sources/${name}.blend`), "--python", join(ROOT, "blender/export_blend.py"), "--", glb]);
  optimize(name, glb);
}

function optimize(name, src) {
  const dst = join(out, `${name}.glb`);
  run(join(ROOT, "node_modules/.bin/gltf-transform"), ["optimize", src, dst, "--compress", "meshopt", "--texture-compress", "false", "--simplify", "false", "--join", "false", "--flatten", "false", "--palette", "false"]);
  const kb = (statSync(dst).size / 1024).toFixed(1);
  console.log(`✓ ${name.padEnd(16)} ${kb} KB`);
}
