import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { marked } from "marked";
import TopBar from "@/core/ui/TopBar";
import css from "../prose.module.scss";

export const metadata: Metadata = {
  title: "Phương pháp & nguồn",
  description: "Nội dung Lược sử Việt Nam được viết ra sao, chọn nguồn thế nào, xử lý chỗ các nguồn khác nhau, truyền thuyết và chủ đề nhạy cảm.",
  alternates: { canonical: "/phuong-phap" },
};

// Chữ nằm ở content/phuong-phap.md (sửa trên GitHub như mọi nội dung khác).
export default function MethodPage() {
  const html = marked.parse(readFileSync(join(process.cwd(), "content", "phuong-phap.md"), "utf8"), { async: false });
  return (
    <div className={css.page}>
      <TopBar scrolls />
      <article className={css.body} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
