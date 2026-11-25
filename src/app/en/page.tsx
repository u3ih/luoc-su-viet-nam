import type { Metadata } from "next";
import { listTranslated } from "@/core/content/load";
import { Button, DongSonBand, Kicker, Link } from "@/core/ui";
import { href } from "@/core/ui/i18n";
import TopBar from "@/core/ui/TopBar";
import { site } from "@/site.config";
import css from "./page.module.scss";

export const metadata: Metadata = {
  title: { absolute: "A Brief History of Vietnam — interactive 3D stories" },
  description: "Vietnamese history told through interactive 3D scenes. A community, open-source project.",
  alternates: { canonical: "/en", languages: { vi: "/", en: "/en" } },
  openGraph: { locale: "en_US", url: "/en", title: "A Brief History of Vietnam", images: ["/og/lsvn.jpg"] },
};

export default function EnglishHome() {
  const chapters = listTranslated("en");
  return (
    <div className={css.page} lang="en">
      <TopBar scrolls lang="en" />
      <header className={css.head}>
        <Kicker>Community project · Open source</Kicker>
        <h1 className={css.title}>A Brief History of Vietnam</h1>
        <p className={css.lead}>
          Vietnamese history told through interactive 3D scenes. The full site is in Vietnamese; these chapters have been translated into English so far.
        </p>
        <p className={css.note}>
          Translations are AI-assisted and have not yet been reviewed. If something reads wrong, please{" "}
          <Link href={`${site.repo}/issues/new?template=bao-sai-su-lieu.yml`}>tell us on GitHub</Link>.
        </p>
        <DongSonBand className="band" />
      </header>
      <ol className={css.list}>
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link href={href.chapter(c.slug, "en")} className={css.item}>
              <span className={css.year}>{c.year}</span>
              <span className={css.name}>{c.title}</span>
              <span className={css.teaser}>{c.teaser}</span>
            </Link>
          </li>
        ))}
      </ol>
      <div className={css.foot}>
        <Button href="/">Tiếng Việt — all chapters</Button>
      </div>
    </div>
  );
}
