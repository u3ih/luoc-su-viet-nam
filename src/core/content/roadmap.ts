import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { marked, type Tokens } from "marked";
import { registry } from "@content/registry.generated";
import { ContentError } from "./parse";

// Đọc content/lo-trinh.md — danh sách sự kiện lịch sử theo thời gian, làm "bản đồ" cho các chương sẽ viết.
//
//   ## Tên thời kỳ
//   Một đoạn giới thiệu ngắn (không bắt buộc).
//   - **938** · Chiến thắng Bạch Đằng — Mô tả một câu. <!-- sort: 938 | chuong: bach-dang-938 -->
//
// `sort` (bắt buộc): năm để xếp thứ tự, âm = TCN. `chuong` (tuỳ chọn): slug chương đã viết về sự kiện này.
// `truyen-thuyet` (tuỳ chọn, không cần giá trị): đánh dấu đây là truyền thuyết.
// `noi`, `toa-do` (tuỳ chọn): địa danh và "vĩ độ, kinh độ" để cắm mốc trên bản đồ.
// `ten-xua` (tuỳ chọn): tên gọi xưa. `truoc-2025` (tuỳ chọn): địa chỉ trước sắp xếp hành chính 01/7/2025.
// `nay` (tự sinh bởi scripts/geo-dia-chi.py từ toạ độ): địa chỉ hiện nay — đừng sửa tay, chạy lại script.

export type RoadmapEvent = {
  year: string;
  title: string;
  text: string;
  sortYear: number;
  slug?: string;
  legend: boolean;
  /** Địa danh gắn với sự kiện. */
  place?: string;
  /** Tên gọi xưa trong sử sách (Phong Khê, Tống Bình…). */
  ancient?: string;
  /** Địa chỉ hành chính trước sắp xếp 01/7/2025 (cấp huyện, xã cũ). */
  before2025?: string;
  /** Địa chỉ hành chính hiện nay (xã/phường, tỉnh/thành) — sinh tự động từ ranh giới OpenStreetMap. */
  now?: string;
  /** [vĩ độ, kinh độ] để cắm mốc trên bản đồ. */
  latLon?: [number, number];
};
export type RoadmapEra = { title: string; intro: string; events: RoadmapEvent[] };

const FILE = "content/lo-trinh.md";

const plain = (md: string) =>
  md
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/\s+/g, " ")
    .trim();

function parseEvent(raw: string): RoadmapEvent {
  const meta: Record<string, string> = {};
  const comment = raw.match(/<!--([\s\S]*?)-->/)?.[1] ?? "";
  for (const part of comment.split("|")) {
    const [k, ...v] = part.split(":");
    if (k.trim()) meta[k.trim()] = v.join(":").trim();
  }
  const line = raw.replace(/^\s*[-*]\s+/, "").replace(/<!--[\s\S]*?-->/, "").trim();
  const m = line.match(/^\*\*(.+?)\*\*\s*·\s*(.+?)(?:\s+—\s+([\s\S]+))?$/);
  if (!m) throw new ContentError(FILE, `dòng sự kiện sai định dạng: "${line.slice(0, 80)}" (cần "- **Năm** · Tên sự kiện — Mô tả")`);
  const sortYear = Number(meta.sort);
  if (!Number.isFinite(sortYear)) throw new ContentError(FILE, `sự kiện "${m[2]}" thiếu <!-- sort: năm -->`);
  const slug = meta.chuong || undefined;
  if (slug && !registry[slug]) throw new ContentError(FILE, `sự kiện "${m[2]}" trỏ tới chương "${slug}" không tồn tại`);
  let latLon: [number, number] | undefined;
  if (meta["toa-do"]) {
    const [lat, lon] = meta["toa-do"].split(",").map(Number);
    if (!(lat > 0 && lat < 30 && lon > 95 && lon < 120)) throw new ContentError(FILE, `sự kiện "${m[2]}": toa-do "${meta["toa-do"]}" sai (cần "vĩ độ, kinh độ")`);
    latLon = [lat, lon];
  }
  return { year: plain(m[1]), title: plain(m[2]), text: plain(m[3] ?? ""), sortYear, slug, legend: "truyen-thuyet" in meta, place: meta.noi || undefined, latLon, ancient: meta["ten-xua"] || undefined, before2025: meta["truoc-2025"] || undefined, now: meta.nay || undefined };
}

let cache: RoadmapEra[] | null = null;

export function loadRoadmap(): RoadmapEra[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const tokens = marked.lexer(readFileSync(join(process.cwd(), FILE), "utf8"));
  const eras: RoadmapEra[] = [];
  let era: RoadmapEra | null = null;
  for (const tok of tokens) {
    if (tok.type === "heading" && tok.depth === 2) eras.push((era = { title: plain(tok.text), intro: "", events: [] }));
    else if (era && tok.type === "paragraph" && !era.events.length) era.intro = plain(tok.text);
    else if (era && tok.type === "list") for (const it of (tok as Tokens.List).items) era.events.push(parseEvent(it.raw));
  }
  // trong mỗi thời kỳ, sự kiện xếp theo thời gian — người viết chèn vào chỗ nào cũng được
  for (const e of eras) e.events.sort((a, b) => a.sortYear - b.sortYear);
  cache = eras;
  return eras;
}
