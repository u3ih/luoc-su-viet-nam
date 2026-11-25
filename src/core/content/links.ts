import { site } from "@/site.config";
import type { Beat, ChapterText } from "../types";

/** Link bản chữ (story.md) trên GitHub và link sửa trực tiếp. */
export function githubLinks(dir: string, lang: "vi" | "en" = "vi") {
  const path = `content/${dir}/${lang === "vi" ? "story.md" : `story.${lang}.md`}`;
  return {
    textUrl: `${site.repo}/blob/${site.branch}/${path}`,
    editUrl: `${site.repo}/edit/${site.branch}/${path}`,
  };
}

/** Mở mẫu issue "Báo chỗ chưa chính xác" trên GitHub, điền sẵn chương, phân cảnh và đoạn chữ hiện tại. */
export function reportUrl(chapter: Pick<ChapterText, "title" | "year" | "slug" | "lang">, beat: Beat) {
  const where = `${chapter.title} (${chapter.year}) — phân cảnh "${beat.title}" [${chapter.slug}#${beat.id}${chapter.lang === "en" ? ", bản tiếng Anh" : ""}]`;
  const current = beat.body.join("\n\n").slice(0, 1200);
  const q = new URLSearchParams({ template: "bao-sai-su-lieu.yml", title: `[Thẩm định] ${chapter.title} · ${beat.title}`, chuong: where, "hien-tai": current });
  return `${site.repo}/issues/new?${q}`;
}
