// Kiểm tra nhanh định dạng story.md / story.en.md mà không cần build cả site.
//
//   pnpm check-story                 # mọi chương
//   pnpm check-story bach-dang-938   # vài chương
//   pnpm check-story --no-quiz       # liệt kê chương chưa có mục "## Ôn tập"

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStory } from "../src/core/content/parse.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const listMissing = process.argv.includes("--no-quiz");

const slugs = args.length
  ? args
  : readdirSync(CONTENT, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
      .map((d) => d.name);

let bad = 0;
const noQuiz = [];
for (const slug of slugs) {
  for (const [name, lang] of [["story.md", "vi"], ["story.en.md", "en"]]) {
    const file = `content/${slug}/${name}`;
    if (!existsSync(join(ROOT, file))) {
      if (lang === "vi") (bad++, console.error(`✗ ${file}: không có file`));
      continue;
    }
    try {
      const vi = lang === "en" ? parseStory(readFileSync(join(ROOT, `content/${slug}/story.md`), "utf8"), file) : null;
      const s = parseStory(readFileSync(join(ROOT, file), "utf8"), file, lang);
      if (vi) {
        const a = vi.beats.map((b) => b.id).join(",");
        const b = s.beats.map((x) => x.id).join(",");
        if (a !== b) throw new Error(`[content] ${file}: id phân cảnh phải trùng bản tiếng Việt (${a})`);
      }
      if (lang === "vi" && !s.quiz.length) noQuiz.push(slug);
    } catch (e) {
      bad++;
      console.error(`✗ ${e instanceof Error ? e.message : e}`);
    }
  }
}
if (listMissing) console.log(noQuiz.join("\n"));
console.log(`${bad ? "✗" : "✓"} ${slugs.length} chương, ${bad} lỗi, ${slugs.length - noQuiz.length} chương có câu ôn tập`);
process.exit(bad ? 1 : 0);
