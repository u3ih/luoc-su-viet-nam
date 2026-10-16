import "server-only";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { speakable } from "../audio/speakable";
import { narrationOf, type Beat } from "../types";

// Giọng kể thu sẵn (scripts/tts.mjs hoặc người thật thu): public/audio/<slug>/<id>.mp3 và <id>.xong.mp3.
// Chỉ dùng file khi manifest.json còn khớp mã băm câu chữ hiện tại — sửa story.md mà chưa tạo lại audio thì
// trang quay về giọng máy, tránh đọc một đằng, chữ một nẻo. File thu tay (không có manifest) luôn được dùng.

const hashOf = (text: string) => createHash("sha1").update(text).digest("hex").slice(0, 16);

export function attachAudio(slug: string, beats: Beat[]): Beat[] {
  const dir = join(process.cwd(), "public", "audio", slug);
  if (!existsSync(dir)) return beats;
  let manifest: Record<string, { hash: string }> | null = null;
  try {
    manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
  } catch {
    manifest = null;
  }
  const usable = (name: string, text: string) =>
    existsSync(join(dir, `${name}.mp3`)) && (!manifest || manifest[name]?.hash === hashOf(speakable(text))) ? `/audio/${slug}/${name}.mp3` : undefined;
  return beats.map((b) => ({
    ...b,
    audio: b.audio ?? usable(b.id, narrationOf(b)),
    ...(b.interaction && { interaction: { ...b.interaction, completeAudio: usable(`${b.id}.xong`, b.interaction.completeText) } }),
  }));
}
