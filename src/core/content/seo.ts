import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/site.config";
import type { Chapter } from "../types";
import type { ChapterSummary } from "./load";
import type { RoadmapEra } from "./roadmap";

// Dữ liệu có cấu trúc (schema.org JSON-LD) cho công cụ tìm kiếm và trợ lý AI.
// Chỉ mô tả nội dung công khai của trang — không có gì về người xem.

export const abs = (path: string) => new URL(path, site.url).toString();

/** Ảnh chia sẻ của chương (public/og/<slug>.jpg); chưa có thì dùng ảnh chung của site. */
export function ogImage(slug?: string) {
  return slug && existsSync(join(process.cwd(), "public", "og", `${slug}.jpg`)) ? `/og/${slug}.jpg` : "/og/lsvn.jpg";
}

const publisher = { "@type": "Organization", name: site.name, url: site.url, logo: abs("/icons/icon-512.png"), sameAs: [site.repo] };
const license = site.license.content.url;

export function siteJsonLd(chapters: ChapterSummary[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: site.url,
      inLanguage: "vi",
      description: site.description,
      publisher,
      license,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Các chương Lược sử Việt Nam (theo thời gian)",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: chapters.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/chuong/${c.slug}`), name: `${c.title} (${c.year})` })),
    },
  ];
}

export function chapterJsonLd(c: Chapter) {
  const url = abs(`/chuong/${c.slug}`);
  return [
    {
      "@context": "https://schema.org",
      "@type": ["Article", "LearningResource"],
      headline: `${c.title} (${c.year})`,
      description: c.teaser,
      url,
      mainEntityOfPage: url,
      image: abs(ogImage(c.slug)),
      inLanguage: "vi",
      isAccessibleForFree: true,
      license,
      learningResourceType: "Câu chuyện lịch sử tương tác",
      educationalLevel: "Phổ thông",
      about: [c.era, c.title],
      keywords: [c.title, c.era, "lịch sử Việt Nam", "lược sử Việt Nam"].join(", "),
      publisher,
      author: { "@type": "Organization", name: `Cộng đồng ${site.name}`, url: site.repo },
      citation: c.sources,
      hasPart: c.beats.map((b) => ({ "@type": "WebPageElement", name: b.title, text: [b.kicker, ...b.body].join(" ") })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: site.name, item: site.url },
        { "@type": "ListItem", position: 2, name: `${c.title} (${c.year})`, item: url },
      ],
    },
  ];
}

export function roadmapJsonLd(eras: RoadmapEra[]) {
  const events = eras.flatMap((e) => e.events);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Lộ trình các sự kiện lịch sử Việt Nam",
    url: abs("/lo-trinh"),
    numberOfItems: events.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${e.year} — ${e.title}`,
      description: e.text,
      ...(e.slug ? { url: abs(`/chuong/${e.slug}`) } : {}),
    })),
  };
}

/** Thẻ <script type="application/ld+json"> an toàn (escape "<" để không đóng thẻ script sớm). */
export const ldJson = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
