import { statSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { listChapters } from "@/core/content/load";
import { site } from "@/site.config";

// /sitemap.xml — nộp lên Google Search Console. Ngày sửa lấy theo file nội dung lúc build.
const modified = (file: string) => {
  try {
    return statSync(join(process.cwd(), "content", file)).mtime;
  } catch {
    return new Date();
  }
};

export default function sitemap(): MetadataRoute.Sitemap {
  const chapters = listChapters().filter((c) => c.status === "ready");
  return [
    { url: site.url, lastModified: modified("lo-trinh.md"), changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/lo-trinh`, lastModified: modified("lo-trinh.md"), changeFrequency: "weekly", priority: 0.9 },
    ...chapters.map((c) => ({
      url: `${site.url}/chuong/${c.slug}`,
      lastModified: modified(`${c.dir}/story.md`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [`${site.url}/og/${c.slug}.jpg`],
    })),
  ];
}
