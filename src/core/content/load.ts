import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { registry } from "@content/registry.generated";
import type { Chapter, ChapterText, NextUp } from "../types";
import { attachAudio } from "./audio";
import { ContentError, parseStory } from "./parse";
import { loadRoadmap } from "./roadmap";

const CONTENT = join(process.cwd(), "content");

function readText(slug: string) {
  const entry = registry[slug];
  if (!entry) return null;
  const file = `content/${entry.dir}/story.md`;
  return { entry, file, text: parseStory(readFileSync(join(CONTENT, entry.dir, "story.md"), "utf8"), file) };
}

export type ChapterSummary = Omit<ChapterText, "beats" | "sources" | "lead"> & { dir: string };

/** Danh sách chương theo thời gian (registry đã xếp theo `sortYear`). Dùng cho trang chủ, generateStaticParams. */
export function listChapters(): ChapterSummary[] {
  return Object.keys(registry).map((slug) => {
    const r = readText(slug)!;
    if (r.text.slug !== slug) throw new ContentError(r.file, `slug "${r.text.slug}" khác registry — chạy pnpm content`);
    const { beats: _b, sources: _s, lead: _l, ...meta } = r.text;
    return { ...meta, dir: r.entry.dir };
  });
}

/**
 * Chương kế tiếp theo thời gian: chương đã sẵn sàng gần nhất phía sau; nếu đây là chương cuối,
 * lấy sự kiện kế tiếp trong lộ trình (content/lo-trinh.md) đang chờ người viết.
 */
function nextAfter(slug: string, sortYear: number): NextUp | undefined {
  const ready = listChapters().filter((c) => c.status === "ready");
  const i = ready.findIndex((c) => c.slug === slug);
  const next = i >= 0 ? ready[i + 1] : ready.find((c) => c.sortYear > sortYear);
  if (next) return { slug: next.slug, title: next.title, year: next.year };
  const upcoming = loadRoadmap()
    .flatMap((e) => e.events)
    .find((ev) => ev.sortYear > sortYear && !ev.slug);
  return upcoming && { title: upcoming.title, year: upcoming.year };
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

  return { ...r.text, beats: attachAudio(slug, r.text.beats), dir: r.entry.dir, scene, next: nextAfter(slug, r.text.sortYear) };
}
