// Tạo giọng kể (mp3) cho mọi phân cảnh. Mặc định dùng VieNeu-TTS (mô hình mở Apache-2.0, chạy ngay trên máy, không cần khoá API),
// giọng "Thiền Tâm Đức" (nam, miền Bắc, phong cách kể chuyện).
//
//   pnpm tts                     # mọi chương; chỉ tạo lại phân cảnh có chữ đã đổi
//   pnpm tts bach-dang-938       # một chương
//   pnpm tts --force             # tạo lại tất cả
//   pnpm tts --dry               # chỉ liệt kê phần cần tạo
//   VIENEU_VOICE="Thiện Minh" pnpm tts          # đổi giọng (xem danh sách trong README của VieNeu-TTS)
//   TTS_PROVIDER=google GOOGLE_TTS_API_KEY=… pnpm tts   # dùng Google Cloud TTS thay cho VieNeu
//
// Cài một lần cho VieNeu (cần uv; lần đầu tải mô hình ~540 MB về .tts-cache/, đều đã nằm trong .gitignore):
//   uv venv .tts-venv && uv pip install --python .tts-venv/bin/python vieneu
// Python khác: đặt VIENEU_PYTHON. Chi tiết cách đọc, ngắt nghỉ: scripts/tts_vieneu.py.
//
// Kết quả: public/audio/<slug>/<id>.mp3 (lời kể), <id>.xong.mp3 (lời sau khi hoàn thành tương tác) và
// manifest.json ghi mã băm của đúng câu chữ đã đọc. Web chỉ dùng file audio khi mã băm còn khớp với story.md
// (src/core/content/audio.ts) — sửa chữ mà chưa chạy lại script thì trang tự quay về giọng máy của trình duyệt.
//
// Chữ được chuẩn hoá trước khi đọc (số → chữ, số La Mã, "TCN"…) bằng chính src/core/audio/speakable.ts.
// Cần Node 22.6+ (chạy thẳng file .ts). Khoá API (nếu dùng Google) chỉ đặt trong biến môi trường, KHÔNG commit vào repo.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseStory } from "../src/core/content/parse.ts";
import { speakable } from "../src/core/audio/speakable.ts";
import { narrationOf } from "../src/core/types.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const PROVIDER = process.env.TTS_PROVIDER ?? "vieneu";
const KEY = process.env.GOOGLE_TTS_API_KEY;
const VOICE = PROVIDER === "google" ? (process.env.GOOGLE_TTS_VOICE ?? "vi-VN-Neural2-A") : `vieneu:${process.env.VIENEU_VOICE ?? "Thiền Tâm Đức"}:cap${process.env.VIENEU_CAP ?? 0.3}:gap${process.env.VIENEU_GAP ?? 0.45}`;
const RATE = Number(process.env.GOOGLE_TTS_RATE ?? 0.95);
const force = process.argv.includes("--force");
const dry = process.argv.includes("--dry");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (PROVIDER === "google" && !KEY && !dry) {
  console.error("✗ Thiếu GOOGLE_TTS_API_KEY. Tạo khoá API (bật Cloud Text-to-Speech API) rồi chạy: TTS_PROVIDER=google GOOGLE_TTS_API_KEY=… pnpm tts");
  process.exit(1);
}
const PY = process.env.VIENEU_PYTHON ?? join(ROOT, ".tts-venv/bin/python");
if (PROVIDER === "vieneu" && !dry && !existsSync(PY)) {
  console.error(`✗ Chưa cài VieNeu-TTS (không thấy ${PY}). Chạy một lần: uv venv .tts-venv && uv pip install --python .tts-venv/bin/python vieneu`);
  process.exit(1);
}

const hashOf = (text) => createHash("sha1").update(text).digest("hex").slice(0, 16);

async function synthesizeGoogle(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "vi-VN", name: VOICE },
      audioConfig: { audioEncoding: "MP3", speakingRate: RATE, sampleRateHertz: 24000 },
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Google TTS lỗi ${res.status}: ${body.error?.message ?? JSON.stringify(body)}`);
  return Buffer.from(body.audioContent, "base64");
}

const dirs = readdirSync(join(ROOT, "content"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && existsSync(join(ROOT, "content", d.name, "story.md")))
  .map((d) => d.name)
  .filter((d) => !only.length || only.includes(d));

// Gom việc cần làm của mọi chương (VieNeu nạp mô hình mất vài giây nên chạy MỘT lần cho tất cả).
const plans = [];
let kept = 0;
for (const dir of dirs) {
  const file = `content/${dir}/story.md`;
  const story = parseStory(readFileSync(join(ROOT, file), "utf8"), file);
  const out = join(ROOT, "public/audio", story.slug);
  const manifestPath = join(out, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  const next = {};
  const todo = [];
  const jobs = story.beats.flatMap((b) => [
    { name: b.id, text: speakable(narrationOf(b)) },
    ...(b.interaction?.completeText ? [{ name: `${b.id}.xong`, text: speakable(b.interaction.completeText) }] : []),
  ]);
  for (const job of jobs) {
    const hash = hashOf(job.text);
    const mp3 = join(out, `${job.name}.mp3`);
    if (!force && manifest[job.name]?.hash === hash && manifest[job.name]?.voice === VOICE && existsSync(mp3)) {
      next[job.name] = manifest[job.name];
      kept++;
    } else {
      todo.push({ ...job, hash, out: mp3 });
    }
  }
  plans.push({ slug: story.slug, out, manifestPath, next, todo });
}

const todo = plans.flatMap((p) => p.todo);
const chars = todo.reduce((s, j) => s + j.text.length, 0);
if (dry) {
  for (const j of todo) console.log(`  (cần tạo) ${j.out.replace(ROOT, "")} — ${j.text.slice(0, 70)}…`);
  console.log(`✓ cần tạo ${todo.length} file (${chars} ký tự), giữ nguyên ${kept} file. Giọng: ${VOICE}`);
  process.exit(0);
}

for (const p of plans) if (p.todo.length) mkdirSync(p.out, { recursive: true });

if (PROVIDER === "google") {
  for (const j of todo) {
    writeFileSync(j.out, await synthesizeGoogle(j.text));
    console.log(`  ${j.out.replace(ROOT, "")}`);
  }
} else if (todo.length) {
  const tmp = mkdtempSync(join(tmpdir(), "lsvn-tts-"));
  const jobsFile = join(tmp, "jobs.json");
  writeFileSync(jobsFile, JSON.stringify(todo.map(({ out, text }) => ({ out, text }))));
  const r = spawnSync(PY, ["-I", join(ROOT, "scripts/tts_vieneu.py"), jobsFile], { stdio: "inherit", env: { ...process.env, PYTHONIOENCODING: "utf-8" } });
  if (r.status !== 0) {
    console.error("✗ VieNeu-TTS báo lỗi; chưa ghi manifest cho phần đã tạo dở (chạy lại pnpm tts để làm tiếp).");
    process.exit(r.status ?? 1);
  }
}

for (const p of plans) {
  for (const j of p.todo) p.next[j.name] = { hash: j.hash, voice: VOICE };
  writeFileSync(p.manifestPath, JSON.stringify(p.next, null, 2) + "\n");
}
console.log(`✓ tạo ${todo.length} file (${chars} ký tự), giữ nguyên ${kept} file. Giọng: ${VOICE}`);
