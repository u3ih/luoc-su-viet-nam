import matter from "gray-matter";
import { marked, type Tokens } from "marked";
import type { Beat, ChapterText } from "../types";

// Đọc story.md → dữ liệu chương. Định dạng đầy đủ: content/README.md.
//
//   ## Tiêu đề phân cảnh
//   <!-- id: ma-phan-canh | kicker: Năm 938 | layout: right | narration: … | interaction: drain@0.85 -->
//   Đoạn văn…
//   > [!TIP]        → ghi chú "Bạn có biết?" (dòng in đậm đầu tiên là tiêu đề)
//   > [!IMPORTANT]  → tương tác: "**Tương tác:** Nhãn trái ↔ Nhãn phải · Gợi ý", đoạn sau là lời khi hoàn thành
//   > Trích dẫn…  /  > — Nguồn (diễn ý)
//   ## Nguồn tham khảo → danh sách nguồn

export class ContentError extends Error {
  constructor(file: string, msg: string) {
    super(`[content] ${file}: ${msg}`);
  }
}

const SOURCES_HEADING = /^nguồn( tham khảo)?$/i;

/** Bỏ cú pháp Markdown inline, giữ chữ. */
function plain(md: string) {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMeta(html: string): Record<string, string> | null {
  const m = html.match(/<!--([\s\S]*?)-->/);
  if (!m || !/\bid\s*:/.test(m[1])) return null;
  const meta: Record<string, string> = {};
  for (const part of m[1].split("|")) {
    const i = part.indexOf(":");
    if (i > 0) meta[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return meta;
}

function blockquote(tok: Tokens.Blockquote, beat: Beat, file: string) {
  const lines = tok.text.split("\n");
  const alert = lines[0].match(/^\[!(\w+)\]\s*$/);
  const rest = (alert ? lines.slice(1) : lines).join("\n").trim();
  const paras = rest.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  if (alert?.[1] === "TIP" || alert?.[1] === "NOTE") {
    const title = plain(paras[0] ?? "");
    beat.note = { title, text: plain(paras.slice(1).join(" ")) };
    return;
  }
  if (alert?.[1] === "IMPORTANT") {
    const head = plain(paras[0] ?? "").replace(/^Tương tác:\s*/i, "");
    const [labels, hint = ""] = head.split("·").map((s) => s.trim());
    const [left, right] = labels.split("↔").map((s) => s.trim());
    if (!beat.interaction) throw new ContentError(file, `phân cảnh "${beat.id}" có khối tương tác nhưng thiếu "interaction: key@nguong" trong dòng <!-- -->`);
    Object.assign(beat.interaction, { labels: [left, right ?? ""], hint, completeText: plain(paras.slice(1).join(" ")) });
    return;
  }
  // trích dẫn thường; dòng bắt đầu bằng "—" là nguồn
  const citeIdx = paras.findIndex((p) => /^[—–-]\s/.test(p));
  const cite = citeIdx >= 0 ? plain(paras[citeIdx].replace(/^[—–-]\s*/, "")) : "";
  const text = plain(paras.filter((_, i) => i !== citeIdx).join(" "));
  beat.quote = { text, cite: cite.replace(/\s*\(diễn ý\)\s*$/i, ""), paraphrase: /\(diễn ý\)/i.test(cite) };
}

export function parseStory(source: string, file: string): ChapterText {
  const { data, content } = matter(source);
  for (const k of ["slug", "title", "year", "sortYear", "era", "teaser"]) {
    if (data[k] === undefined || data[k] === "") throw new ContentError(file, `frontmatter thiếu "${k}"`);
  }
  if (!Number.isFinite(Number(data.sortYear))) throw new ContentError(file, `"sortYear" phải là số (năm; âm = trước Công nguyên)`);

  const tokens = marked.lexer(content);
  const beats: Beat[] = [];
  const sources: string[] = [];
  let lead = "";
  let current: Beat | null = null;
  let inSources = false;

  for (const tok of tokens) {
    if (tok.type === "heading" && tok.depth === 2) {
      inSources = SOURCES_HEADING.test(plain(tok.text));
      current = null;
      if (!inSources) {
        current = { id: "", kicker: "", title: plain(tok.text), body: [] };
        beats.push(current);
      }
      continue;
    }
    if (inSources) {
      if (tok.type === "list") for (const it of (tok as Tokens.List).items) sources.push(plain(it.text));
      continue;
    }
    if (!current) {
      // phần mở đầu trước phân cảnh đầu tiên: đoạn in nghiêng là lời dẫn
      if (tok.type === "paragraph" && !lead && /^[_*]/.test(tok.raw.trim())) lead = plain(tok.text);
      continue;
    }
    if (tok.type === "html") {
      const meta = parseMeta(tok.raw);
      if (!meta) continue;
      current.id = meta.id;
      current.kicker = meta.kicker ?? "";
      if (meta.layout) current.layout = meta.layout as Beat["layout"];
      if (meta.narration) current.narration = meta.narration;
      if (meta.audio) current.audio = meta.audio;
      if (meta.interaction) {
        const [key, at] = meta.interaction.split("@");
        current.interaction = { kind: "slider", key: key.trim(), completeAt: Number(at ?? 0.85), labels: ["", ""], hint: "", completeText: "" };
      }
    } else if (tok.type === "paragraph") {
      current.body.push(plain(tok.text));
    } else if (tok.type === "blockquote") {
      blockquote(tok as Tokens.Blockquote, current, file);
    }
  }

  const seen = new Set<string>();
  for (const b of beats) {
    if (!b.id) throw new ContentError(file, `phân cảnh "${b.title}" thiếu dòng <!-- id: … --> ngay dưới tiêu đề`);
    if (seen.has(b.id)) throw new ContentError(file, `trùng id phân cảnh "${b.id}"`);
    seen.add(b.id);
  }
  if (!beats.length) throw new ContentError(file, "chưa có phân cảnh nào (## Tiêu đề)");

  return {
    slug: String(data.slug),
    title: String(data.title),
    year: String(data.year),
    sortYear: Number(data.sortYear),
    era: String(data.era),
    teaser: String(data.teaser),
    status: data.status === "ready" ? "ready" : "draft",
    disclaimer: data.disclaimer ? String(data.disclaimer) : undefined,
    seal: Array.isArray(data.seal) ? data.seal.map(String) : undefined,
    heroDrum: data["hero-drum"] === false ? false : undefined,
    lead: lead || beats[0].body[0] || "",
    beats,
    sources,
  };
}
