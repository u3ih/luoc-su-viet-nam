// Chặn dùng thẳng link/ảnh/svg/lớp nút thay vì component nền từ @/core/ui. Chạy trước build.

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BASE = ["src/core/ui/base/", "src/core/ui/ornaments/", "src/core/ui/index.ts"];

// [biểu thức, lời nhắc, chỉ áp cho .tsx]
const RULES = [
  [/from "next\/link"/, "import `next/link` — dùng `Link` từ @/core/ui"],
  [/from "next\/image"/, "import `next/image` — dùng `Image` từ @/core/ui"],
  [/from "[^"]*(\/ornaments\/|core\/ui\/base|\.\/base\/)[^"]*"/, "import thẳng component nền — import từ @/core/ui"],
  [/<a(\s|>|$)/, "thẻ `<a>` — dùng `Link` (link ngoài tự mở tab mới) hoặc `Button`/`Chip` có `href`", true],
  [/<img(\s|>|$)/, "thẻ `<img>` — dùng `Image` từ @/core/ui", true],
  [/<svg(\s|>|$)/, "`<svg>` rời — thêm biểu tượng vào `Icon` (base/Icon.tsx) hoặc hoa văn vào ornaments/", true],
  [/className=["'`{][^>]*?\b(btn|chip|kicker)\b(?![-_])/, "lớp `.btn`/`.chip`/`.kicker` viết tay — dùng `Button`/`Chip`/`Kicker`", true],
  [/import \{[^}]*\b(useRouter|usePathname|useSearchParams)\b[^}]*\} from "next\/navigation"/, "hook điều hướng của next — dùng `useNavigate` từ @/core/ui"],
  [/from "next\/(script|head|form|router)"/, "import thẳng từ next — bọc thành component nền trong src/core/ui/base"],
  [/<details(\s|>|$)/, "`<details>` viết tay — dùng `Disclosure` từ @/core/ui", true],
  [/<input[^>]*type="search"/, "ô tìm viết tay — dùng `SearchField` từ @/core/ui", true],
  [/<(select)(\s|>|$)/, "`<select>` viết tay — dùng `Select` (+ `Field`) từ @/core/ui", true],
];

function* files(dir) {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.name === "node_modules" || d.name.startsWith(".")) continue;
    const p = join(dir, d.name);
    if (d.isDirectory()) yield* files(p);
    else if (/\.tsx?$/.test(d.name)) yield p;
  }
}

const errors = [];
for (const top of ["src", "content"]) {
  for (const file of files(join(ROOT, top))) {
    const rel = relative(ROOT, file);
    if (BASE.some((b) => rel.startsWith(b))) continue;
    const jsx = file.endsWith(".tsx");
    readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (/^\s*(\/\/|\*)/.test(line)) return;
        for (const [re, msg, tsxOnly] of RULES) if ((jsx || !tsxOnly) && re.test(line)) errors.push(`${rel}:${i + 1}: ${msg}`);
      });
  }
}

if (errors.length) {
  console.error(`✗ design system (src/core/ui/index.ts):\n  - ${errors.join("\n  - ")}`);
  process.exit(1);
}
console.log("✓ design system: không có import hay thẻ trực tiếp");
