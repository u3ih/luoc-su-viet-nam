import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { registry } from "@content/registry.generated";
import type { Chapter, ChapterMeta } from "../types";
import { ContentError, parseStory } from "./parse";

const CONTENT = join(process.cwd(), "content");

function readText(slug: string) {
  const entry = registry[slug];
  if (!entry) return null;
  const file = `content/${entry.dir}/story.md`;
  return { entry, file, text: parseStory(readFileSync(join(CONTENT, entry.dir, "story.md"), "utf8"), file) };
}

/** Danh sách chương (để làm trang chủ, generateStaticParams). */
export function listChapters(): (ChapterMeta & { dir: string })[] {
  return Object.keys(registry).map((slug) => {
    const r = readText(slug)!;
    if (r.text.slug !== slug) throw new ContentError(r.file, `slug "${r.text.slug}" khác registry — chạy pnpm content`);
    const { beats: _b, sources: _s, lead: _l, ...meta } = r.text;
    return { ...meta, dir: r.entry.dir };
  });
}

export async function getChapter(slug: string): Promise<Chapter | null> {
  const r = readText(slug);
  if (!r) return null;
  const scene = (await r.entry.config()).default;

  // Mỗi phân cảnh phải có keyframe; keyframe thừa cũng báo để tránh gõ nhầm id.
  const ids = new Set(r.text.beats.map((b) => b.id));
  const missing = r.text.beats.filter((b) => !scene.keyframes[b.id]).map((b) => b.id);
  const extra = Object.keys(scene.keyframes).filter((id) => !ids.has(id));
  if (missing.length) throw new ContentError(`content/${r.entry.dir}/scene.config.ts`, `thiếu keyframe cho: ${missing.join(", ")}`);
  if (extra.length) throw new ContentError(`content/${r.entry.dir}/scene.config.ts`, `keyframe không khớp phân cảnh nào: ${extra.join(", ")}`);

  return { ...r.text, dir: r.entry.dir, scene };
}
