import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { githubLinks } from "@/core/content/links";
import { getChapter, listTranslated } from "@/core/content/load";
import { ogImage } from "@/core/content/seo";
import { href } from "@/core/ui/i18n";
import StoryShell from "@/core/ui/StoryShell";

export function generateStaticParams() {
  return listTranslated("en").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/en/chapter/[slug]">): Promise<Metadata> {
  const chapter = await getChapter((await params).slug, "en");
  if (!chapter) return {};
  const title = `${chapter.title} (${chapter.year})`;
  const path = href.chapter(chapter.slug, "en");
  return {
    title: { absolute: `${title} · A Brief History of Vietnam` },
    description: chapter.teaser,
    alternates: { canonical: path, languages: { vi: href.chapter(chapter.slug), en: path } },
    openGraph: { type: "article", locale: "en_US", url: path, title, description: chapter.teaser, images: [ogImage(chapter.slug)] },
  };
}

export default async function EnglishChapterPage({ params }: PageProps<"/en/chapter/[slug]">) {
  const chapter = await getChapter((await params).slug, "en");
  if (!chapter) notFound();
  return (
    <div lang="en">
      <StoryShell chapter={chapter} editUrl={githubLinks(chapter.dir, "en").editUrl} />
    </div>
  );
}
