import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { githubLinks } from "@/core/content/links";
import { getChapter, listChapters } from "@/core/content/load";
import { ogImage } from "@/core/content/seo";
import { href } from "@/core/ui/i18n";
import ReadingView from "@/core/ui/ReadingView";

export function generateStaticParams() {
  return listChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/chuong/[slug]/ban-chu">): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  if (!chapter) return {};
  const title = `${chapter.title} (${chapter.year}) · Bản chữ`;
  return {
    title,
    description: chapter.teaser,
    // nội dung trùng trang chương: trỏ canonical về trang chương
    alternates: { canonical: href.chapter(chapter.slug) },
    openGraph: { type: "article", locale: "vi_VN", title, description: chapter.teaser, images: [ogImage(chapter.slug)] },
  };
}

export default async function TextPage({ params }: PageProps<"/chuong/[slug]/ban-chu">) {
  const chapter = await getChapter((await params).slug);
  if (!chapter) notFound();
  return <ReadingView chapter={chapter} editUrl={githubLinks(chapter.dir).editUrl} />;
}
