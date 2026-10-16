import "server-only";
import { site } from "@/site.config";
import { getChapter, listChapters } from "./load";
import { loadRoadmap } from "./roadmap";

// GEO: bản tóm tắt (llms.txt) và bản đầy đủ (llms-full.txt) cho các trợ lý AI — theo đề xuất https://llmstxt.org.
// Nội dung lấy thẳng từ story.md và lo-trinh.md, nên luôn khớp với trang web.

const url = (p: string) => `${site.url}${p}`;

export function llmsIndex() {
  const chapters = listChapters().filter((c) => c.status === "ready");
  const events = loadRoadmap().flatMap((e) => e.events);
  return [
    `# ${site.name}`,
    "",
    `> ${site.description} Dự án cộng đồng, mã nguồn mở; nội dung tiếng Việt theo giấy phép ${site.license.content.name}. Mỗi chương kể một sự kiện bằng cảnh 3D tương tác, có ghi nguồn sử liệu; phần truyền thuyết được ghi rõ là truyền thuyết.`,
    "",
    "## Các chương (theo thời gian)",
    "",
    ...chapters.map((c) => `- [${c.title} (${c.year})](${url(`/chuong/${c.slug}`)}): ${c.era}. ${c.teaser}`),
    "",
    "## Lộ trình",
    "",
    `- [Bản đồ & lộ trình lịch sử](${url("/lo-trinh")}): ${events.length} sự kiện từ thời tiền sử đến nay, cắm mốc trên bản đồ Việt Nam (gồm quần đảo Hoàng Sa, Trường Sa).`,
    "",
    "## Tuỳ chọn",
    "",
    `- [Toàn văn các chương](${url("/llms-full.txt")}): lời kể và nguồn tham khảo của mọi chương ở dạng văn bản.`,
    `- [Mã nguồn và bản chữ trên GitHub](${site.repo}): mỗi chương là một file Markdown trong thư mục content/.`,
    "",
  ].join("\n");
}

export async function llmsFull() {
  const out: string[] = [`# ${site.name} — toàn văn`, "", `Nguồn: ${site.url} · Giấy phép nội dung: ${site.license.content.name} (${site.license.content.url})`, ""];
  for (const meta of listChapters().filter((c) => c.status === "ready")) {
    const c = await getChapter(meta.slug);
    if (!c) continue;
    out.push(`## ${c.title} (${c.year})`, "", `${c.era} · ${url(`/chuong/${c.slug}`)}`, "", c.lead, "");
    for (const b of c.beats.slice(1)) {
      out.push(`### ${b.title}`, "", `_${b.kicker}_`, "", ...b.body.flatMap((p) => [p, ""]));
      if (b.interaction?.completeText) out.push(b.interaction.completeText, "");
      if (b.note) out.push(`> **${b.note.title}** — ${b.note.text}`, "");
      if (b.quote) out.push(`> ${b.quote.text} — ${b.quote.cite}${b.quote.paraphrase ? " (diễn ý)" : ""}`, "");
    }
    if (c.disclaimer) out.push(`_${c.disclaimer}_`, "");
    out.push("Nguồn tham khảo:", "", ...c.sources.map((s) => `- ${s}`), "");
  }
  return out.join("\n");
}
