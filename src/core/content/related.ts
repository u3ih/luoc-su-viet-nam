import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { marked, type Tokens } from "marked";
import type { ChapterLink, ChapterText, Related } from "../types";
import { getText, listChapters } from "./load";
import { loadRoadmap } from "./roadmap";

// Nối các chương có cùng nhân vật (content/nhan-vat.md) hoặc cùng nơi chốn (địa chỉ hiện nay `nay:` trong lo-trinh.md).


const PER_GROUP = 4;
const MAX_PERSONS = 3;

type Person = { name: string; patterns: RegExp[] };

function loadPersons(): Person[] {
  const file = join(process.cwd(), "content", "nhan-vat.md");
  if (!existsSync(file)) return [];
  const out: Person[] = [];
  for (const tok of marked.lexer(readFileSync(file, "utf8"))) {
    if (tok.type !== "list") continue;
    for (const it of (tok as Tokens.List).items) {
      const m = it.text.match(/^\*\*(.+?)\*\*(?:\s*·\s*(.+))?$/);
      if (!m) continue;
      const names = [m[1], ...(m[2]?.split(",") ?? [])].map((s) => s.trim()).filter(Boolean);
      const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      out.push({ name: m[1].trim(), patterns: names.map((n) => new RegExp(`(?<!\\p{L})${esc(n)}(?!\\p{L})`, "u")) });
    }
  }
  return out;
}

const fullText = (c: ChapterText) =>
  [c.title, c.lead, ...c.beats.flatMap((b) => [b.title, ...b.body, b.quote?.text ?? "", b.note?.title ?? "", b.note?.text ?? "", b.interaction?.completeText ?? ""])].join("\n");

/** Tỉnh/thành từ địa chỉ hiện nay ("Phường Ba Đình, Thành phố Hà Nội" → "Hà Nội"). */
const province = (now: string) => now.split(",").at(-1)!.trim().replace(/^(Tỉnh|Thành phố)\s+/, "");

type Index = {
  bySlug: Map<string, { year: number; step: ChapterLink; persons: number[]; place?: { now: string; province: string } }>;
  persons: Person[];
};
let cache: Index | null = null;

function index(): Index {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const persons = loadPersons();
  const places = new Map<string, string>();
  for (const ev of loadRoadmap().flatMap((e) => e.events)) if (ev.slug && ev.now && !places.has(ev.slug)) places.set(ev.slug, ev.now);
  const bySlug: Index["bySlug"] = new Map();
  for (const c of listChapters().filter((c) => c.status === "ready")) {
    const text = fullText(getText(c.slug)!);
    const now = places.get(c.slug);
    bySlug.set(c.slug, {
      year: c.sortYear,
      step: { slug: c.slug, title: c.title, year: c.year },
      persons: persons.flatMap((p, i) => (p.patterns.some((re) => re.test(text)) ? [i] : [])),
      place: now ? { now, province: province(now) } : undefined,
    });
  }
  cache = { bySlug, persons };
  return cache;
}

export function relatedOf(slug: string): Related[] {
  const { bySlug, persons } = index();
  const self = bySlug.get(slug);
  if (!self) return [];
  const others = [...bySlug.entries()].filter(([s]) => s !== slug);
  const near = (a: { year: number }, b: { year: number }) => Math.abs(a.year - self.year) - Math.abs(b.year - self.year);

  const byPerson = self.persons
    .map((i) => ({ i, list: others.filter(([, o]) => o.persons.includes(i)).map(([, o]) => o) }))
    .filter((g) => g.list.length)
    // nhân vật ít chương nhất thường là nhân vật chính của chương này (tên lớn xuất hiện khắp nơi xếp sau)
    .sort((a, b) => a.list.length - b.list.length)
    .slice(0, MAX_PERSONS)
    .map((g): Related => ({ kind: "person", label: persons[g.i].name, chapters: g.list.sort(near).slice(0, PER_GROUP).map((o) => o.step) }));

  const out = [...byPerson];
  if (self.place) {
    const same = others.map(([, o]) => o).filter((o) => o.place?.province === self.place!.province);
    // cùng phường/xã xếp trước, rồi gần nhau về thời gian
    same.sort((a, b) => Number(b.place!.now === self.place!.now) - Number(a.place!.now === self.place!.now) || near(a, b));
    if (same.length) out.push({ kind: "place", label: self.place.province, chapters: same.slice(0, PER_GROUP).map((o) => o.step) });
  }
  return out;
}
