import "server-only";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { registry } from "@content/registry.generated";
import type { Chapter, ChapterText, Lang, NextUp } from "../types";
import { attachAudio } from "./audio";
import { ContentError, parseStory } from "./parse";
import { journeysOf } from "./journeys";
import { relatedOf } from "./related";
import { loadRoadmap } from "./roadmap";

const CONTENT = join(process.cwd(), "content");

// Mỗi trang chương gọi listChapters() (tìm chương kế tiếp), llms-full.txt gọi getChapter() cho mọi chương:
// không nhớ kết quả thì một lần build parse lại hàng trăm nghìn lượt story.md. Nhớ theo mtime để `pnpm dev` vẫn thấy chữ mới.
const parsed = new Map<string, { mtime: number; text: ChapterText }>();

/** Bản tiếng Việt: story.md; bản dịch: story.<lang>.md (tuỳ chương). */
const storyFile = (lang: Lang) => (lang === "vi" ? "story.md" : `story.${lang}.md`);

function readText(slug: string, lang: Lang = "vi") {
  const entry = registry[slug];
  if (!entry) return null;
  const file = `content/${entry.dir}/${storyFile(lang)}`;
  const path = join(CONTENT, entry.dir, storyFile(lang));
  if (lang !== "vi" && !existsSync(path)) return null;
  const mtime = statSync(path).mtimeMs;
  const key = `${lang}:${slug}`;
  let hit = parsed.get(key);
  if (hit?.mtime !== mtime) parsed.set(key, (hit = { mtime, text: parseStory(readFileSync(path, "utf8"), file, lang) }));
  return { entry, file, text: hit.text };
}

/** Chữ đã parse của một chương (không nạp cảnh). */
export function getText(slug: string, lang: Lang = "vi"): ChapterText | null {
  return readText(slug, lang)?.text ?? null;
}

/** Các chương đã có bản dịch `lang`, theo thời gian. */
export function listTranslated(lang: Exclude<Lang, "vi">): ChapterSummary[] {
  return Object.keys(registry).flatMap((slug) => {
    const r = readText(slug, lang);
    if (!r || r.text.status !== "ready") return [];
    const { beats: _b, sources: _s, lead: _l, quiz: _q, ...meta } = r.text;
    return [{ ...meta, dir: r.entry.dir }];
  });
}

export type ChapterSummary = Omit<ChapterText, "beats" | "sources" | "lead" | "quiz"> & { dir: string };

/** Danh sách chương theo thời gian (registry đã xếp theo `sortYear`). Dùng cho trang chủ, generateStaticParams. */
export function listChapters(): ChapterSummary[] {
  return Object.keys(registry).map((slug) => {
    const r = readText(slug)!;
    if (r.text.slug !== slug) throw new ContentError(r.file, `slug "${r.text.slug}" khác registry — chạy pnpm content`);
    const { beats: _b, sources: _s, lead: _l, quiz: _q, ...meta } = r.text;
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

function prevBefore(slug: string, sortYear: number): NextUp | undefined {
  const ready = listChapters().filter((c) => c.status === "ready");
  const i = ready.findIndex((c) => c.slug === slug);
  const prev = i >= 0 ? ready[i - 1] : ready.findLast((c) => c.sortYear < sortYear);
  return prev && { slug: prev.slug, title: prev.title, year: prev.year };
}

export async function getChapter(slug: string, lang: Lang = "vi"): Promise<Chapter | null> {
  const r = readText(slug, lang);
  if (!r) return null;
  const scene = (await r.entry.config()).default;

  // Mỗi phân cảnh phải có keyframe; keyframe thừa cũng báo để tránh gõ nhầm id.
  const ids = new Set(r.text.beats.map((b) => b.id));
  const missing = r.text.beats.filter((b) => !scene.keyframes[b.id]).map((b) => b.id);
  const extra = Object.keys(scene.keyframes).filter((id) => !ids.has(id));
  if (missing.length) throw new ContentError(`content/${r.entry.dir}/scene.config.ts`, `thiếu keyframe cho: ${missing.join(", ")}`);
  if (extra.length) throw new ContentError(`content/${r.entry.dir}/scene.config.ts`, `keyframe không khớp phân cảnh nào: ${extra.join(", ")}`);

  if (lang !== "vi") {
    // bản dịch: id phân cảnh phải trùng bản tiếng Việt (dùng chung keyframe); chưa có giọng thu sẵn
    const vi = readText(slug)!.text.beats.map((b) => b.id).join(",");
    if (r.text.beats.map((b) => b.id).join(",") !== vi) throw new ContentError(r.file, `id phân cảnh phải trùng bản tiếng Việt (${vi})`);
    const list = listTranslated(lang);
    const i = list.findIndex((c) => c.slug === slug);
    const link = (c?: ChapterSummary) => c && { slug: c.slug, title: c.title, year: c.year };
    return { ...r.text, dir: r.entry.dir, scene, next: link(list[i + 1]), prev: link(list[i - 1]), journeys: [], related: [], altLang: "vi" };
  }
  return { ...r.text, beats: attachAudio(slug, r.text.beats), dir: r.entry.dir, scene, next: nextAfter(slug, r.text.sortYear), prev: prevBefore(slug, r.text.sortYear), journeys: journeysOf(slug), related: relatedOf(slug), altLang: getText(slug, "en")?.status === "ready" ? "en" : undefined };
}
