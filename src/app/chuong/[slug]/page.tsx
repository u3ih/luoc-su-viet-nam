import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { githubLinks } from "@/core/content/links";
import { getChapter, listChapters } from "@/core/content/load";
import StoryShell from "@/core/ui/StoryShell";
import { site } from "@/site.config";

export function generateStaticParams() {
  return listChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/chuong/[slug]">): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  if (!chapter) return {};
  return {
    title: `${chapter.title} ${chapter.year} · ${site.name}`,
    description: chapter.teaser,
  };
}

export default async function ChapterPage({ params }: PageProps<"/chuong/[slug]">) {
  const chapter = await getChapter((await params).slug);
  if (!chapter) notFound();
  return <StoryShell chapter={chapter} {...githubLinks(chapter.dir)} />;
}
