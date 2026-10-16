import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { githubLinks } from "@/core/content/links";
import { getChapter, listChapters } from "@/core/content/load";
import { chapterJsonLd, ldJson, ogImage } from "@/core/content/seo";
import StoryShell from "@/core/ui/StoryShell";
import { site } from "@/site.config";

export function generateStaticParams() {
  return listChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/chuong/[slug]">): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  if (!chapter) return {};
  const title = `${chapter.title} (${chapter.year})`;
  const path = `/chuong/${chapter.slug}`;
  const image = ogImage(chapter.slug);
  return {
    title,
    description: chapter.teaser,
    keywords: [chapter.title, chapter.era, "lịch sử Việt Nam", ...chapter.beats.map((b) => b.title)],
    alternates: { canonical: path },
    openGraph: { type: "article", locale: "vi_VN", siteName: site.name, url: path, title, description: chapter.teaser, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description: chapter.teaser, images: [image] },
  };
}

export default async function ChapterPage({ params }: PageProps<"/chuong/[slug]">) {
  const chapter = await getChapter((await params).slug);
  if (!chapter) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(chapterJsonLd(chapter))} />
      <StoryShell chapter={chapter} {...githubLinks(chapter.dir)} />
    </>
  );
}
