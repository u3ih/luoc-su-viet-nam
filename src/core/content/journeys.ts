import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked, type Tokens } from "marked";
import type { ChapterLink, JourneyStep } from "../types";
import { listChapters } from "./load";
import { ContentError } from "./parse";

// Đọc content/hanh-trinh.md — các hành trình xem chọn sẵn (chuỗi chương theo chủ đề). Định dạng ghi ở đầu file đó.

export type Journey = { id: string; title: string; intro: string; steps: ChapterLink[] };

const FILE = "content/hanh-trinh.md";
let cache: Journey[] | null = null;

export function loadJourneys(): Journey[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const chapters = new Map(listChapters().map((c) => [c.slug, c]));
  const tokens = marked.lexer(readFileSync(join(process.cwd(), FILE), "utf8"));
  const out: Journey[] = [];
  let cur: Journey | null = null;
  for (const tok of tokens) {
    if (tok.type === "heading" && tok.depth === 2) out.push((cur = { id: "", title: tok.text.trim(), intro: "", steps: [] }));
    else if (!cur) continue;
    else if (tok.type === "html") cur.id = tok.raw.match(/id:\s*([a-z0-9-]+)/)?.[1] ?? cur.id;
    else if (tok.type === "paragraph" && !cur.intro) cur.intro = tok.text.trim();
    else if (tok.type === "list")
      for (const it of (tok as Tokens.List).items) {
        const slug = it.text.trim();
        const c = chapters.get(slug);
        if (!c) throw new ContentError(FILE, `hành trình "${cur.title}": không có chương "${slug}"`);
        if (c.status !== "ready") throw new ContentError(FILE, `hành trình "${cur.title}": chương "${slug}" chưa sẵn sàng (draft)`);
        cur.steps.push({ slug, title: c.title, year: c.year });
      }
  }
  const ids = new Set<string>();
  for (const j of out) {
    if (!j.id) throw new ContentError(FILE, `hành trình "${j.title}" thiếu <!-- id: … -->`);
    if (ids.has(j.id)) throw new ContentError(FILE, `trùng id hành trình "${j.id}"`);
    if (j.steps.length < 2) throw new ContentError(FILE, `hành trình "${j.title}" cần ít nhất 2 chương`);
    ids.add(j.id);
  }
  cache = out;
  return out;
}

export function journeysOf(slug: string): JourneyStep[] {
  return loadJourneys().flatMap((j) => {
    const i = j.steps.findIndex((s) => s.slug === slug);
    return i < 0 ? [] : [{ id: j.id, title: j.title, index: i + 1, total: j.steps.length, next: j.steps[i + 1] }];
  });
}
