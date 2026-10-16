// Quét content/*/story.md và sinh content/registry.generated.ts
// (bảng tra slug → thư mục + bộ nạp cảnh), xếp các chương theo thời gian (`sortYear`).
// Chạy tự động trước dev/build.
//
// Thư mục chương đặt tên đúng bằng slug (vd. content/bach-dang-938/) — không đánh số thứ tự, để sau này
// chèn một sự kiện vào giữa hai chương chỉ cần ghi `sortYear` cho đúng.
//
//   pnpm content          # sinh lại registry
//   pnpm content --check  # chỉ kiểm tra (CI) — lỗi nếu registry lỗi thời

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CONTENT = join(ROOT, "content");
const OUT = join(CONTENT, "registry.generated.ts");
const errors = [];

const dirs = readdirSync(CONTENT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_") && !d.name.startsWith("."))
  .map((d) => d.name)
  .sort();

const entries = [];
for (const dir of dirs) {
  const story = join(CONTENT, dir, "story.md");
  if (!existsSync(story)) {
    errors.push(`${dir}/: thiếu story.md`);
    continue;
  }
  const fm = readFileSync(story, "utf8").match(/^---\n([\s\S]*?)\n---/);
  const slug = fm?.[1].match(/^slug:\s*["']?([a-z0-9-]+)["']?\s*$/m)?.[1];
  if (!slug) {
    errors.push(`${dir}/story.md: frontmatter thiếu "slug" (chỉ chữ thường không dấu, số, gạch ngang)`);
    continue;
  }
  const sortYear = Number(fm[1].match(/^sortYear:\s*["']?(-?\d+)["']?\s*$/m)?.[1]);
  if (!Number.isFinite(sortYear)) {
    errors.push(`${dir}/story.md: frontmatter thiếu "sortYear" (năm để xếp thứ tự; âm = trước Công nguyên, vd. -257)`);
    continue;
  }
  if (dir !== slug) errors.push(`${dir}/: tên thư mục phải trùng slug "${slug}" (đổi tên thành content/${slug}/)`);
  for (const f of ["scene.config.ts", "scene.ts"]) {
    if (!existsSync(join(CONTENT, dir, f))) errors.push(`${dir}/: thiếu ${f} (chép từ content/_mau/)`);
  }
  if (entries.some((e) => e.slug === slug)) errors.push(`${dir}/: trùng slug "${slug}"`);
  entries.push({ dir, slug, sortYear });
}
entries.sort((a, b) => a.sortYear - b.sortYear || a.slug.localeCompare(b.slug));

if (errors.length) {
  console.error("✗ Nội dung chưa hợp lệ:\n  - " + errors.join("\n  - "));
  process.exit(1);
}

const code = `// Tự sinh bởi scripts/gen-content.mjs — ĐỪNG sửa tay. Chạy \`pnpm content\` để cập nhật.
import type { SceneConfig } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";

export type ChapterEntry = {
  dir: string;
  config: () => Promise<{ default: SceneConfig }>;
  scene: () => Promise<{ default: SceneSetup }>;
};

/** Các chương, xếp theo thời gian. */
export const registry: Record<string, ChapterEntry> = {
${entries
  .map(
    (e) => `  "${e.slug}": {
    dir: "${e.dir}",
    config: () => import("./${e.dir}/scene.config"),
    scene: () => import("./${e.dir}/scene"),
  },`,
  )
  .join("\n")}
};
`;

const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
if (process.argv.includes("--check")) {
  if (current !== code) {
    console.error("✗ content/registry.generated.ts lỗi thời — chạy `pnpm content` rồi commit.");
    process.exit(1);
  }
  console.log(`✓ ${entries.length} chương hợp lệ`);
} else {
  if (current !== code) writeFileSync(OUT, code);
  console.log(`✓ registry: ${entries.map((e) => e.slug).join(", ")}`);
}
