import "server-only";
import type { ChapterSummary } from "./load";
import { slugify } from "./era-id";
import { loadRoadmap } from "./roadmap";

// Gom chương theo thời kỳ của lộ trình (các tiêu đề `##` trong content/lo-trinh.md), để trang chủ không phải xếp một lèo mấy chục thẻ.
// Chương thuộc thời kỳ nào là theo sự kiện của lộ trình trỏ tới chương đó (`chuong: slug`); chương chưa được gắn thì rơi vào thời kỳ
// có năm bắt đầu gần nhất phía trước `sortYear` của chương.

export type EraGroup = {
  id: string;
  title: string;
  intro: string;
  /** Số sự kiện của thời kỳ trong lộ trình (kể cả chưa có chương). */
  events: number;
  chapters: ChapterSummary[];
};

export function groupChaptersByEra(chapters: ChapterSummary[]): EraGroup[] {
  const eras = loadRoadmap();
  const starts = eras.map((e) => Math.min(...e.events.map((ev) => ev.sortYear)));
  const bySlug = new Map<string, number>();
  eras.forEach((e, i) => e.events.forEach((ev) => ev.slug && !bySlug.has(ev.slug) && bySlug.set(ev.slug, i)));

  const eraOf = (c: ChapterSummary) => {
    const fixed = bySlug.get(c.slug);
    if (fixed !== undefined) return fixed;
    let best = 0;
    starts.forEach((s, i) => {
      if (s <= c.sortYear && s >= starts[best]) best = i;
    });
    return best;
  };

  const groups: EraGroup[] = eras.map((e) => ({ id: slugify(e.title), title: e.title, intro: e.intro, events: e.events.length, chapters: [] }));
  for (const c of chapters) groups[eraOf(c)].chapters.push(c);
  for (const g of groups) g.chapters.sort((a, b) => a.sortYear - b.sortYear);
  return groups.filter((g) => g.chapters.length);
}
