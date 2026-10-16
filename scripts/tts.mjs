// Tạo giọng kể (mp3) cho mọi phân cảnh bằng Google Cloud Text-to-Speech, giọng neural tiếng Việt.
//
//   GOOGLE_TTS_API_KEY=… pnpm tts                 # mọi chương; chỉ tạo lại phân cảnh có chữ đã đổi
//   GOOGLE_TTS_API_KEY=… pnpm tts bach-dang-938   # một chương
//   GOOGLE_TTS_VOICE=vi-VN-Neural2-D pnpm tts     # đổi giọng (mặc định vi-VN-Neural2-A)
//   pnpm tts --force                              # tạo lại tất cả
//   pnpm tts --dry                                # chỉ liệt kê phần cần tạo, không gọi API
//
// Kết quả: public/audio/<slug>/<id>.mp3 (lời kể), <id>.xong.mp3 (lời sau khi hoàn thành tương tác) và
// manifest.json ghi mã băm của đúng câu chữ đã đọc. Web chỉ dùng file audio khi mã băm còn khớp với story.md
// (src/core/content/audio.ts) — sửa chữ mà chưa chạy lại script thì trang tự quay về giọng máy của trình duyệt.
//
// Chữ được chuẩn hoá trước khi gửi (số → chữ, số La Mã, "TCN"…) bằng chính src/core/audio/speakable.ts.
// Cần Node 22.6+ (chạy thẳng file .ts). Khoá API đặt trong biến môi trường, KHÔNG commit vào repo.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseStory } from "../src/core/content/parse.ts";
import { speakable } from "../src/core/audio/speakable.ts";
import { narrationOf } from "../src/core/types.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const KEY = process.env.GOOGLE_TTS_API_KEY;
const VOICE = process.env.GOOGLE_TTS_VOICE ?? "vi-VN-Neural2-A";
const RATE = Number(process.env.GOOGLE_TTS_RATE ?? 0.95);
const force = process.argv.includes("--force");
const dry = process.argv.includes("--dry");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (!KEY && !dry) {
  console.error("✗ Thiếu GOOGLE_TTS_API_KEY. Tạo khoá API (bật Cloud Text-to-Speech API) rồi chạy: GOOGLE_TTS_API_KEY=… pnpm tts");
  process.exit(1);
}

const hashOf = (text) => createHash("sha1").update(text).digest("hex").slice(0, 16);

async function synthesize(text) {
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

let made = 0;
let kept = 0;
let chars = 0;
for (const dir of dirs) {
  const file = `content/${dir}/story.md`;
  const story = parseStory(readFileSync(join(ROOT, file), "utf8"), file);
  const out = join(ROOT, "public/audio", story.slug);
  if (!dry) mkdirSync(out, { recursive: true });
  const manifestPath = join(out, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  const next = {};
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
      continue;
    }
    chars += job.text.length;
    made++;
    if (dry) {
      console.log(`  (cần tạo) ${story.slug}/${job.name}.mp3 — ${job.text.slice(0, 70)}…`);
      continue;
    }
    writeFileSync(mp3, await synthesize(job.text));
    next[job.name] = { hash, voice: VOICE };
    console.log(`  ${story.slug}/${job.name}.mp3`);
  }
  if (!dry) writeFileSync(manifestPath, JSON.stringify(next, null, 2) + "\n");
}
console.log(`✓ ${dry ? "cần tạo" : "tạo"} ${made} file (${chars} ký tự), giữ nguyên ${kept} file. Giọng: ${VOICE}`);
