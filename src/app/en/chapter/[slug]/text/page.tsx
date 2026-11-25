import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { githubLinks } from "@/core/content/links";
import { getChapter, listTranslated } from "@/core/content/load";
import { href } from "@/core/ui/i18n";
import ReadingView from "@/core/ui/ReadingView";

export function generateStaticParams() {
  return listTranslated("en").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/en/chapter/[slug]/text">): Promise<Metadata> {
  const chapter = await getChapter((await params).slug, "en");
  if (!chapter) return {};
  return {
    title: { absolute: `${chapter.title} (${chapter.year}) · Text · A Brief History of Vietnam` },
    description: chapter.teaser,
    alternates: { canonical: href.chapter(chapter.slug, "en") },
  };
}

export default async function EnglishTextPage({ params }: PageProps<"/en/chapter/[slug]/text">) {
  const chapter = await getChapter((await params).slug, "en");
  if (!chapter) notFound();
  return <ReadingView chapter={chapter} editUrl={githubLinks(chapter.dir, "en").editUrl} />;
}
